#!/usr/bin/env python3
"""Rainbow recovery checks used by scripts/claude-bootstrap.sh (read-only; never changes git state).

    python3 -I scripts/verify-assets.py lfs-remote [--download]   every LFS object of HEAD exists on GitHub
                                                                   (--download: fetch each one, check SHA-256)
    python3 -I scripts/verify-assets.py marble                     both Marble worlds' files present, real, checksummed
    python3 -I scripts/verify-assets.py agents                     10 specialist definitions present + SHA-256
    python3 -I scripts/verify-assets.py gap [--session-start ISO]  backup gaps (environment closed / autosave stopped)
    python3 -I scripts/verify-assets.py report <results.jsonl> <mode>   write backups/BOOTSTRAP_REPORT.md + .live json

Each check prints details and ends with one line:  @@ <ok|warn|fail> <summary>
No credentials are read, printed or stored: GitHub auth comes from the session's git proxy.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
UTC = dt.timezone.utc


def git(*args: str, timeout: int = 120) -> str:
    p = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, timeout=timeout)
    return p.stdout if p.returncode == 0 else ""


def done(status: str, summary: str) -> int:
    print(f"@@ {status} {summary}")
    return 0 if status != "fail" else 1


def lfs_pointer(data: bytes):
    if len(data) > 1024 or not data.startswith(b"version https://git-lfs.github.com/spec/v1"):
        return None
    m = re.search(rb"oid sha256:([0-9a-f]{64})\s+size (\d+)", data)
    return (m.group(1).decode(), int(m.group(2))) if m else None


def lfs_objects() -> list[dict]:
    """(path, oid, size) of every LFS file in HEAD, read from the committed pointers."""
    rows = []
    for path in [p for p in git("lfs", "ls-files", "--name-only").splitlines() if p.strip()]:
        blob = subprocess.run(["git", "cat-file", "-p", f"HEAD:{path}"], cwd=REPO, capture_output=True).stdout
        ptr = lfs_pointer(blob)
        if ptr:
            rows.append({"path": path, "oid": ptr[0], "size": ptr[1]})
    return rows


def lfs_endpoint() -> str:
    url = git("remote", "get-url", "origin").strip()
    m = re.search(r"github\.com[/:]([^/]+)/([^/]+?)(?:\.git)?/?$", url)
    if not m:
        raise SystemExit(done("fail", f"origin is not a GitHub URL: {url[:60]}"))
    return f"https://github.com/{m.group(1)}/{m.group(2)}.git/info/lfs/objects/batch"


def cmd_lfs_remote(download: bool) -> int:
    objs = lfs_objects()
    if not objs:
        return done("fail", "no LFS objects found in HEAD")
    # GitHub's LFS batch API answers HTTP 413 above 100 objects per request (2026-11-20: 123 objects) -> batches of 100
    by_oid = {}
    for i in range(0, len(objs), 100):
        body = json.dumps({"operation": "download", "transfers": ["basic"],
                           "objects": [{"oid": o["oid"], "size": o["size"]} for o in objs[i:i + 100]]}).encode()
        req = urllib.request.Request(lfs_endpoint(), data=body, method="POST", headers={
            "Accept": "application/vnd.git-lfs+json", "Content-Type": "application/vnd.git-lfs+json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                resp = json.loads(r.read())
        except Exception as e:
            return done("fail", f"GitHub LFS batch API unreachable: {str(e)[:120]}")
        by_oid.update({o["oid"]: o for o in resp.get("objects", [])})
    missing, ok, dl_ok, dl_bad = [], 0, 0, []
    for o in objs:
        r = by_oid.get(o["oid"], {})
        href = r.get("actions", {}).get("download", {}).get("href")
        if not href:
            missing.append(f"{o['path']} ({(r.get('error') or {}).get('message', 'no download link')})")
            continue
        ok += 1
        if download:
            h, n = hashlib.sha256(), 0
            dreq = urllib.request.Request(href, headers=r["actions"]["download"].get("header", {}))
            try:
                with urllib.request.urlopen(dreq, timeout=300) as fh:
                    while chunk := fh.read(1 << 20):
                        h.update(chunk)
                        n += len(chunk)
            except Exception as e:
                dl_bad.append(f"{o['path']}: {str(e)[:80]}")
                continue
            if h.hexdigest() == o["oid"] and n == o["size"]:
                dl_ok += 1
            else:
                dl_bad.append(f"{o['path']}: sha/size mismatch")
    total_mb = sum(o["size"] for o in objs) / 1e6
    for m in missing:
        print("  MISSING on GitHub:", m)
    for b in dl_bad:
        print("  DOWNLOAD FAILED:", b)
    marble = sum(1 for o in objs if o["path"].startswith("qa/worldlabs/"))
    if missing or dl_bad:
        return done("fail", f"{ok}/{len(objs)} LFS objects on GitHub; {len(missing)} missing, {len(dl_bad)} download errors")
    extra = f", {dl_ok}/{len(objs)} downloaded fresh from GitHub with matching SHA-256" if download else ""
    return done("ok", f"{ok}/{len(objs)} LFS objects ({total_mb:.0f} MB, {marble} Marble/World Labs) confirmed on GitHub LFS{extra}")


def cmd_marble() -> int:
    man = json.loads((REPO / "backups" / "TOOL_MANIFEST.json").read_text())["marble_worldlabs"]
    try:
        sums = {r["path"]: r for r in json.loads((REPO / "backups" / "MANIFEST.json").read_text())["files"]}
    except Exception:
        sums = {}
    problems, checked, lfs_real = [], 0, 0
    for w in man["worlds"]:
        for rel in w["lfs_files"] + w["git_files"]:
            path = f"{w['dir']}/{rel}"
            p = REPO / path
            checked += 1
            if not p.is_file():
                problems.append(f"{path}: missing")
                continue
            data = p.read_bytes()
            if lfs_pointer(data):
                problems.append(f"{path}: still an LFS pointer stub (run git lfs pull)")
                continue
            if rel in w["lfs_files"]:
                lfs_real += 1
            ref = sums.get(path)
            if ref and ref.get("sha256") != hashlib.sha256(data).hexdigest():
                problems.append(f"{path}: SHA-256 differs from backups/MANIFEST.json")
        print(f"  {w['label']:5} world {w['world_id']} ({w['model']}): {len(w['lfs_files'])} LFS + {len(w['git_files'])} files")
    for rel in [man["ledger"], man["prompt"], man["input_reference"].split(" ")[0]] + \
               [s.split(" ")[0] for s in man["scripts"]]:
        checked += 1
        if not (REPO / rel).is_file():
            problems.append(f"{rel}: missing")
    tracked = [x for x in git("ls-files", "qa/worldlabs").splitlines() if x]
    print(f"  qa/worldlabs: {len(tracked)} tracked files; ledger, prompt, input reference and {len(man['scripts'])} scripts checked")
    for pr in problems:
        print("  PROBLEM:", pr)
    if problems:
        return done("fail", f"{len(problems)} Marble problem(s) out of {checked} files checked")
    b = man["budget"]
    return done("ok", f"both worlds complete: {checked} files checked, {lfs_real} real LFS binaries (splats/PLY/colliders/.blend), "
                      f"{len(tracked)} files tracked under qa/worldlabs; credits spent {b['spent_credits']} of cap {b['user_cap_credits']}")


def cmd_agents() -> int:
    roster = json.loads((REPO / "backups" / "AGENTS_STATUS.json").read_text())
    problems, changed = [], []
    for a in roster["agents"]:
        p = REPO / a["file"]
        if not p.is_file():
            problems.append(f"{a['name']}: definition missing ({a['file']})")
            continue
        if hashlib.sha256(p.read_bytes()).hexdigest() != a["sha256"]:
            changed.append(a["name"])
        print(f"  {a['name']:34} {a['state']:7} next: {a['relaunch_when'][:70]}")
    extra = sorted(x.stem for x in (REPO / ".claude" / "agents").glob("*.md")) if (REPO / ".claude" / "agents").is_dir() else []
    unknown = [x for x in extra if x not in {a["name"] for a in roster["agents"]}]
    running = [r if isinstance(r, str) else f"{r.get('agent', '?')} ({r.get('branch', '?')})"
               for r in (roster.get("running_now") or [])]
    for pr in problems:
        print("  PROBLEM:", pr)
    if problems:
        return done("fail", f"{len(roster['agents']) - len(problems)}/{len(roster['agents'])} specialist definitions present")
    note = f"; definition changed since roster: {', '.join(changed)}" if changed else "; all SHA-256 unchanged"
    note += f"; extra definitions: {', '.join(unknown)}" if unknown else ""
    status = "warn" if changed else "ok"
    return done(status, f"{len(roster['agents'])}/{len(roster['agents'])} specialist definitions present{note}; "
                        f"running: {', '.join(running) if running else 'none (relaunch from notes when needed)'}")


def cmd_worldlabs() -> int:
    """Free, read-only Marble World API checks (no credits): balance + both pilot worlds. The key is injected by
    the Claude environment's proxy (network secret); this never reads, prints or stores it. Only an HTTP 401/403
    means the key must be reconnected — anything else (network, timeout, 5xx) is NOT a key problem."""
    api = "https://api.worldlabs.ai/marble/v1"
    man = json.loads((REPO / "backups" / "TOOL_MANIFEST.json").read_text())["marble_worldlabs"]

    def get(path: str):
        try:
            with urllib.request.urlopen(urllib.request.Request(api + path), timeout=25) as r:
                return r.status, json.loads(r.read() or b"{}")
        except urllib.error.HTTPError as e:
            return e.code, {}
        except Exception as e:
            return None, {"error": str(e)[:100]}

    code, d = get("/credits")
    if code in (401, 403):
        return done("fail", f"Marble API authentication FAILED (HTTP {code}): reconnect with the secure credential form "
                            "(request_credential host api.worldlabs.ai, header WLT-Api-Key) - never chat or git")
    if code != 200:
        return done("warn", f"Marble API not reachable (HTTP {code or d.get('error')}): network/API problem, NOT a key "
                            "problem - do not ask the user for a new key; retry later")
    worlds = []
    # user 2026-11-22: only the CURRENT World Labs account's worlds count; the old 2026-11-16 worlds are marked do_not_use (never read)
    for w in man.get("current_worlds") or [w for w in man["worlds"] if not w.get("do_not_use")]:
        c, _ = get(f"/worlds/{w['world_id']}")
        worlds.append(f"{w['label']} {c}")
    bad = [x for x in worlds if not x.endswith(" 200")]
    status = "warn" if bad else "ok"
    return done(status, f"Marble API key authenticated (free read: {d.get('remaining_credits', '?'):.0f} credits); worlds "
                        f"{', '.join(worlds)}; no paid job started")


def parse_iso(s: str) -> dt.datetime:
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(UTC)


def cmd_gap(session_start: str | None) -> int:
    start = parse_iso(session_start) if session_start else dt.datetime.now(UTC)
    lines = []
    # 1. newest commit on GitHub (any branch) made before this session started
    raw = git("log", "--remotes=origin", f"--before={start.isoformat()}", "-1", "--format=%H%x00%cI%x00%s%x00%b")
    status = "ok"
    if raw:
        sha, when, subj, body = (raw.split("\x00") + ["", "", "", ""])[:4]
        t = parse_iso(when)
        m = re.search(r"Automated Rainbow backup \(([^)]+)\)", body)
        reason = m.group(1) if m else "manual commit"
        branches = [b.strip().replace("origin/", "") for b in git("branch", "-r", "--contains", sha).splitlines()
                    if b.strip() and "->" not in b]
        mins = (start - t).total_seconds() / 60
        lines.append(f"previous save on GitHub: {sha[:7]} {t:%Y-%m-%d %H:%M} UTC ({reason}) on "
                     f"{', '.join(branches[:3]) or '?'}")
        if mins > 10:
            status = "warn"
            lines.append(f"GAP: no backup ran from {t:%Y-%m-%d %H:%M} to {start:%Y-%m-%d %H:%M} UTC "
                         f"({mins/60:.1f} h) - no Claude cloud environment with the autosave was active. Nothing can be "
                         f"saved while an environment is closed; the newest saved state is {sha[:7]}.")
        else:
            lines.append(f"no gap: this session started {mins:.0f} min after that save")
        if reason not in ("manual:end", "hook:SessionEnd"):
            lines.append("the previous session did not record an end-of-session backup (last save was "
                         f"'{reason}'); anything changed in its last minutes before the environment closed may be missing")
    # 2. gaps inside the autosave log (last 72 h)
    log = REPO / "backups" / ".live" / "BACKUP_LOG.md"
    log = log if log.exists() else REPO / "backups" / "BACKUP_LOG.md"
    times = []
    for row in log.read_text().splitlines() if log.exists() else []:
        m = re.match(r"\| (\d{4}-\d\d-\d\dT[\d:]+\+00:00) \|", row)
        if m:
            times.append(parse_iso(m.group(1)))
    times = sorted(t for t in times if t > start - dt.timedelta(hours=72))
    gaps = [(a, b) for a, b in zip(times, times[1:]) if (b - a).total_seconds() > 600]
    for a, b in gaps[-5:]:
        lines.append(f"log gap: {a:%m-%d %H:%M} -> {b:%m-%d %H:%M} UTC ({(b - a).total_seconds()/3600:.1f} h without any "
                     "autosave run: environment closed or idle-suspended)")
    for ln in lines:
        print("  " + ln)
    summary = next((ln for ln in lines if ln.startswith("GAP")), lines[0] if lines else "no earlier save found")
    if any(ln.startswith("the previous session did not") for ln in lines):
        summary += "; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save)"
    if gaps:
        longest = max(gaps, key=lambda g: g[1] - g[0])
        summary += (f"; {len(gaps)} gap(s) > 10 min in the last 72 h of the autosave log, longest "
                    f"{longest[0]:%m-%d %H:%M}-{longest[1]:%H:%M} UTC ({(longest[1] - longest[0]).total_seconds()/3600:.1f} h)")
    return done(status, summary)


def cmd_report(results: str, mode: str) -> int:
    rows = [json.loads(x) for x in Path(results).read_text().splitlines() if x.strip()]
    now = dt.datetime.now(UTC).replace(microsecond=0)
    branch = git("symbolic-ref", "--short", "HEAD").strip()
    head = git("rev-parse", "HEAD").strip()
    remote = (git("ls-remote", "origin", f"refs/heads/{branch}").split() or [""])[0]
    fails = [r for r in rows if r["status"] == "fail"]
    warns = [r for r in rows if r["status"] == "warn"]
    verdict = "BOOTSTRAP OK" if not fails else "BOOTSTRAP PROBLEMS"
    if not fails and warns:
        verdict += " (with warnings)"
    data = {"time_utc": now.isoformat(), "mode": mode, "verdict": verdict, "branch": branch, "head": head,
            "remote_head_at_report": remote, "base_ref": os.environ.get("CLAUDE_CODE_BASE_REF", ""), "steps": rows}
    live = REPO / "backups" / ".live"
    live.mkdir(parents=True, exist_ok=True)
    (live / "BOOTSTRAP_REPORT.json").write_text(json.dumps(data, indent=2) + "\n")
    icon = {"ok": "OK", "warn": "WARN", "fail": "FAIL", "skip": "skip"}
    md = [f"# Rainbow bootstrap report — {verdict}", "",
          f"Generated {now:%Y-%m-%d %H:%M} UTC by `scripts/claude-bootstrap.sh` (mode `{mode}`) on branch `{branch}`.",
          "The commit that contains this file is the backup itself, so its SHA is not written here; use "
          "`git log -1 -- backups/BOOTSTRAP_REPORT.md`.", "",
          "| Step | Result | Details | s |", "|---|---|---|---|"]
    for r in rows:
        md.append(f"| {r['title']} | {icon.get(r['status'], r['status'])} | {r['summary'].replace('|', '/')} | {r.get('seconds', '')} |")
    md += ["", "Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + "
           "Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), "
           "cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.", ""]
    (REPO / "backups" / "BOOTSTRAP_REPORT.md").write_text("\n".join(md))
    print(verdict)
    return 0 if not fails else 1


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    cmd = sys.argv[1]
    if cmd == "lfs-remote":
        return cmd_lfs_remote("--download" in sys.argv)
    if cmd == "marble":
        return cmd_marble()
    if cmd == "agents":
        return cmd_agents()
    if cmd == "worldlabs":
        return cmd_worldlabs()
    if cmd == "gap":
        s = sys.argv[sys.argv.index("--session-start") + 1] if "--session-start" in sys.argv else None
        return cmd_gap(s)
    if cmd == "report":
        return cmd_report(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "full")
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
