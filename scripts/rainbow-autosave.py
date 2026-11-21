#!/usr/bin/env python3
"""RAINBOW five-minute GitHub autosave.

Run by cron (*/5), by Claude Code hooks (SessionStart / PreCompact / Stop / SessionEnd)
or by hand:  python3 scripts/rainbow-autosave.py [--reason manual] [--message "milestone: …"]

Each run:
  1. validates repo identity (remote URL) and target branch from backups/autosave.config.json
  2. takes an exclusive lock and skips if another git operation is in progress
  3. refreshes sanitized Claude transcripts (only after verifying the GitHub repo is PRIVATE),
     backups/MANIFEST.json and the agent roster
  4. stages ONLY allow-listed paths (respecting .gitignore), scans staged text for secrets,
     enforces LFS for large binaries
  5. commits with a timestamp when real changes exist (status/log-only changes never commit)
  6. pushes (no force, ever) with retries and verifies the remote branch SHA == local HEAD
  7. records the result in the LIVE log (backups/.live/, git-ignored). The tracked copies
     backups/BACKUP_STATUS.json / BACKUP_LOG.md are refreshed from the live copies only inside a real
     commit, so a run never leaves the working tree dirty (no endless "uncommitted changes" prompts).
Never force-pushes, hard-resets, deletes files or rewrites history.
"""
from __future__ import annotations

import argparse
import datetime as dt
import fcntl
import fnmatch
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CFG = json.loads((REPO / "backups" / "autosave.config.json").read_text())
TRACKED_STATUS = REPO / "backups" / "BACKUP_STATUS.json"
TRACKED_LOG = REPO / "backups" / "BACKUP_LOG.md"
LIVE = REPO / "backups" / ".live"
STATUS = LIVE / "BACKUP_STATUS.json"
LOG = LIVE / "BACKUP_LOG.md"
LOCK = REPO / "backups" / ".autosave.lock"
def _trailer() -> str:
    """Commit trailer from the config; its Claude-Session line follows the CURRENT cloud session when known,
    so a new session never has to edit the config just for attribution."""
    t = CFG.get("commit_trailer", "Co-Authored-By: Claude <noreply@anthropic.com>")
    sid = os.environ.get("CLAUDE_CODE_REMOTE_SESSION_ID", "")
    if sid.startswith("cse_"):
        url = "https://claude.ai/code/session_" + sid[4:]
        lines = [ln for ln in t.splitlines() if not ln.startswith("Claude-Session:")]
        t = "\n".join(lines + [f"Claude-Session: {url}"])
    return "\n\n" + t


TRAILER = _trailer()
SECRET_PATTERNS = [
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b"),
    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{30,}\b"),
    re.compile(r"\bsk-ant-[A-Za-z0-9_\-]{20,}"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bxox[abposr]-[A-Za-z0-9\-]{20,}"),
    re.compile(r"\bAIza[0-9A-Za-z_\-]{35}"),
    re.compile(r"\bmsy_[A-Za-z0-9_\-]{20,}"),
]
_PT = Path(os.path.expanduser("~/.rainbow-autosave.private-terms"))
PRIVATE_TERMS = [t.strip() for t in _PT.read_text().splitlines() if len(t.strip()) >= 4] if _PT.exists() else []
TEXT_EXT = {".md", ".json", ".jsonl", ".ts", ".js", ".mjs", ".cjs", ".py", ".sh", ".html", ".css",
            ".glsl", ".txt", ".yml", ".yaml", ".toml", ".xml", ".gradle", ".properties", ".kts", ".csv"}


def now_utc() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0)


def git(*args: str, check: bool = True, timeout: int = 180) -> subprocess.CompletedProcess:
    p = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, timeout=timeout)
    if p.returncode != 0 and "index.lock" in p.stderr:
        # another git process (LFS pull, a merge, the editor) holds the index for a moment: retry once
        time.sleep(5)
        p = subprocess.run(["git", *args], cwd=REPO, capture_output=True, text=True, timeout=timeout)
    if check and p.returncode != 0:
        # error text FIRST so the 300-character log column shows the cause, not the argument list
        raise RuntimeError(f"git {args[0]} failed ({p.returncode}): {p.stderr.strip()[:500]} "
                           f"[git {' '.join(args)[:160]}]")
    return p


def seed_live() -> None:
    """First run in a fresh checkout: start the live log/status from the tracked copies."""
    LIVE.mkdir(parents=True, exist_ok=True)
    for live, tracked in ((STATUS, TRACKED_STATUS), (LOG, TRACKED_LOG)):
        if not live.exists() and tracked.exists():
            live.write_text(tracked.read_text())


def sync_tracked_from_live() -> None:
    """Copy the live log/status into the tracked files (called only right before a real commit)."""
    for live, tracked in ((STATUS, TRACKED_STATUS), (LOG, TRACKED_LOG)):
        if live.exists():
            tracked.write_text(live.read_text())


def load_status() -> dict:
    try:
        return json.loads(STATUS.read_text())
    except Exception:
        return {}


def append_log(row: dict) -> None:
    if not LOG.exists():
        LOG.write_text(
            "# Rainbow autosave log\n\nNewest last. `pushed` = remote SHA verified equal to local HEAD.\n\n"
            "| Time (UTC) | Reason | Result | Commit | Branch | Files staged | Pushed+verified | Error |\n"
            "|---|---|---|---|---|---|---|---|\n")
    with LOG.open("a") as fh:
        fh.write(
            f"| {row['time']} | {row['reason']} | {row['result']} | `{(row.get('commit') or '—')[:12]}` | "
            f"`{row.get('branch', '—')}` | {row.get('files_staged', 0)} | {row.get('pushed_verified', False)} | "
            f"{(row.get('error') or '').replace('|', '/')[:300]} |\n")


def write_status(st: dict) -> None:
    tmp = STATUS.with_suffix(".tmp")
    tmp.write_text(json.dumps(st, indent=2) + "\n")
    os.replace(tmp, STATUS)


def verify_private() -> bool | None:
    """True/False if GitHub reports the repo privacy, None if it could not be checked."""
    try:
        req = urllib.request.Request(f"https://api.github.com/repos/{CFG['repo_full_name']}",
                                     headers={"Accept": "application/vnd.github+json",
                                              "User-Agent": "rainbow-autosave"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read().decode())
        if data.get("full_name") != CFG["repo_full_name"]:
            return None
        return bool(data.get("private"))
    except Exception:
        return None


def refresh_manifest() -> None:
    """Small manifest of tracked/allow-listed files (path, bytes, sha256) for recovery checks."""
    rows = []
    for rel in sorted(allowlisted_files()):
        p = REPO / rel
        if not p.is_file() or rel.startswith("backups/claude-sessions/") or rel in CFG["status_only_paths"] \
                or rel == "backups/MANIFEST.json":
            continue
        data = p.read_bytes()
        lfs = lfs_pointer(data)
        if lfs:
            # Content not fetched yet (pointer stub): record the real object's hash/size, not the stub's,
            # so a backup taken before `git lfs pull` never regresses the manifest.
            rows.append({"path": rel, "bytes": lfs[1], "sha256": lfs[0], "lfs_pointer_only": True})
            continue
        rows.append({"path": rel, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    text = json.dumps({"project": CFG["project"], "files": rows}, indent=1) + "\n"
    mp = REPO / "backups" / "MANIFEST.json"
    if not mp.exists() or mp.read_text() != text:
        mp.write_text(text)


def lfs_pointer(data: bytes) -> tuple[str, int] | None:
    """(oid, size) if `data` is a Git LFS pointer stub, else None."""
    if len(data) > 1024 or not data.startswith(b"version https://git-lfs.github.com/spec/v1"):
        return None
    m = re.search(rb"oid sha256:([0-9a-f]{64})\s+size (\d+)", data)
    return (m.group(1).decode(), int(m.group(2))) if m else None


def allowlisted_files() -> list[str]:
    """Allow-listed files that git would track (tracked + untracked-not-ignored)."""
    out = git("ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", *CFG["allowlist"],
              check=False).stdout
    return [x for x in out.split("\0") if x and (REPO / x).exists()]


def lfs_tracked(rel: str) -> bool:
    out = git("check-attr", "filter", "--", rel, check=False).stdout
    return out.strip().endswith(": lfs")


def scan_and_guard(staged: list[str]) -> list[str]:
    """Unstage files containing secrets or oversized non-LFS binaries. Returns problems."""
    problems = []
    limit = CFG["max_plain_git_file_mb"] * 1024 * 1024
    for rel in staged:
        p = REPO / rel
        if not p.is_file():
            continue
        size = p.stat().st_size
        if size > limit and not lfs_tracked(rel):
            git("reset", "-q", "--", rel, check=False)
            problems.append(f"{rel}: {size/1e6:.1f}MB exceeds plain-git limit and is not LFS-tracked (NOT backed up — add an LFS pattern)")
            continue
        if p.suffix.lower() in TEXT_EXT and size < 20 * 1024 * 1024:
            try:
                txt = p.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            hit = next((pat.pattern[:30] for pat in SECRET_PATTERNS if pat.search(txt)), None)
            if hit is None and any(t in txt for t in PRIVATE_TERMS):
                hit = "private term (~/.rainbow-autosave.private-terms)"
            if hit:
                git("reset", "-q", "--", rel, check=False)
                problems.append(f"{rel}: possible secret/private data ({hit}) — unstaged, NOT backed up")
    return problems


def push_and_verify(branch: str) -> tuple[bool, str]:
    err = ""
    for attempt in range(CFG["push_retries"] + 1):
        p = git("push", "-u", CFG["remote_name"], f"HEAD:refs/heads/{branch}", check=False, timeout=600)
        if p.returncode == 0:
            break
        err = p.stderr.strip()[-600:]
        if "non-fast-forward" in err or "fetch first" in err or "rejected" in err:
            # someone else pushed: integrate without discarding anything; abort on conflict
            git("fetch", CFG["remote_name"], branch, check=False, timeout=300)
            m = git("merge", "--no-edit", f"{CFG['remote_name']}/{branch}", check=False)
            if m.returncode != 0:
                git("merge", "--abort", check=False)
                return False, "remote branch diverged and merge conflicted; local commit kept, manual merge needed"
        time.sleep(2 ** (attempt + 1))
    else:
        return False, f"push failed after retries: {err}"
    head = git("rev-parse", "HEAD").stdout.strip()
    ls = git("ls-remote", CFG["remote_name"], f"refs/heads/{branch}", check=False, timeout=120)
    remote_sha = ls.stdout.split()[0] if ls.stdout.strip() else ""
    if remote_sha != head:
        return False, f"remote verification mismatch: remote={remote_sha or 'none'} local={head}"
    return True, ""


def snapshot_worktrees() -> list[str]:
    """User order 2026-11-18: also preserve UNFINISHED specialist work. For every other git worktree of this repo
    (specialists work in /home/user/wt/<sNN> on their own branches) write, read-only (--no-optional-locks: never takes
    the worktree's index lock), backups/wip/<branch>/: INFO.json (branch, HEAD, dirty files), tracked.patch
    (`git diff HEAD --binary`) and small untracked files. Committed with this autosave to the SESSION branch only —
    the specialist branches themselves are never touched."""
    notes: list[str] = []
    wl = git("worktree", "list", "--porcelain", check=False).stdout
    root = REPO / "backups" / "wip"
    for block in wl.strip().split("\n\n"):
        kv = dict(line.split(" ", 1) if " " in line else (line, "") for line in block.splitlines())
        wt = Path(kv.get("worktree", ""))
        if not wt or wt.resolve() == REPO.resolve() or not wt.exists():
            continue
        br = kv.get("branch", "").replace("refs/heads/", "") or f"detached-{kv.get('HEAD', '')[:10]}"
        dest = root / br.replace("/", "__")
        g = lambda *a: subprocess.run(["git", "--no-optional-locks", "-C", str(wt), *a], capture_output=True,
                                      text=False, timeout=120)
        status = g("status", "--porcelain", "-z", "--untracked-files=all").stdout.decode(errors="replace")
        entries = [e for e in status.split("\0") if e]
        dirty = [e[3:] for e in entries if not e.startswith("??")]
        untracked = [e[3:] for e in entries if e.startswith("??") and "node_modules" not in e]
        dest.mkdir(parents=True, exist_ok=True)
        for old in dest.glob("**/*"):
            if old.is_file() and old.name != "INFO.json":
                old.unlink()
        copied, total = [], 0
        if dirty:
            (dest / "tracked.patch").write_bytes(g("diff", "HEAD", "--binary").stdout)
        for rel in untracked:
            src = wt / rel
            # user order 2026-11-19 ~23:55 UTC ("save everything ... every 5 minutes"): limits raised from 2 MB / 30 MB so a
            # worker's full-size game captures (~2-2.5 MB PNG each) and half-size clips are no longer skipped
            if src.is_file() and src.stat().st_size <= 5_000_000 and total + src.stat().st_size <= 150_000_000:
                out = dest / "untracked" / rel
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(src.read_bytes()); copied.append(rel); total += src.stat().st_size
        info = {"worktree": str(wt), "branch": br, "head": kv.get("HEAD", ""), "time": now_utc().isoformat(),
                "dirty_tracked": dirty, "untracked_copied": copied,
                "untracked_skipped": [u for u in untracked if u not in copied],
                "restore": f"git switch {br} (newest pushed tip) && git apply --binary backups/wip/{dest.name}/tracked.patch"
                           f" && copy backups/wip/{dest.name}/untracked/* into the worktree"}
        (dest / "INFO.json").write_text(json.dumps(info, indent=1) + "\n")
        notes.append(f"{br}: {len(dirty)} modified, {len(copied)} new file(s) snapshotted")
    return notes


def snapshot_live_tools() -> None:
    """User order 2026-11-19 ~23:55 UTC: every five-minute save also records the LIVE state of the specialists, worker
    branches, plugins and MCP servers -> backups/LIVE_TOOLS_STATE.json (names / versions / hashes only, never values of
    settings, so no secret can end up in it). Static restore instructions stay in backups/TOOL_MANIFEST.json."""
    home = Path.home()

    def jload(p: Path):
        try:
            return json.loads(p.read_text())
        except Exception:
            return None

    agents = {}
    for f in sorted((REPO / ".claude" / "agents").glob("*.md")):
        agents[f.stem] = hashlib.sha256(f.read_bytes()).hexdigest()[:16]
    inst = jload(home / ".claude" / "plugins" / "installed_plugins.json") or {}
    synced = []
    for m in (home / ".claude" / "plugins" / "synced").glob("*/manifest.json"):
        for p in (jload(m) or {}).get("plugins", []):
            synced.append(p.get("description", "")[:90])
    # r24: the plugin NAMES (manifest.json only carries descriptions) from each synced plugin's .claude-plugin/plugin.json
    synced_names = sorted({(jload(pj) or {}).get("name", "") for pj in
                           (home / ".claude" / "plugins" / "synced").glob("*/*/.claude-plugin/plugin.json")} - {""})
    user_set = jload(home / ".claude" / "settings.json") or {}
    proj_set = jload(REPO / ".claude" / "settings.json") or {}
    mcp_names = set()
    for cfg in (home / ".claude.json", REPO / ".mcp.json"):
        mcp_names.update(((jload(cfg) or {}).get("mcpServers") or {}).keys())
    for pj in (home / ".claude" / "plugins" / "cache").glob("*/*/*/mcp.json"):
        mcp_names.update(((jload(pj) or {}).get("mcpServers") or jload(pj) or {}).keys())
    workers = []
    wl = git("worktree", "list", "--porcelain", check=False).stdout
    for block in wl.strip().split("\n\n"):
        kv = dict(line.split(" ", 1) if " " in line else (line, "") for line in block.splitlines())
        if kv.get("worktree") and Path(kv["worktree"]).resolve() != REPO.resolve():
            workers.append({"worktree": kv["worktree"], "branch": kv.get("branch", "").replace("refs/heads/", ""),
                            "head": kv.get("HEAD", "")[:12]})
    status = jload(REPO / "backups" / "AGENTS_STATUS.json") or {}
    rounds = sorted(k for k in status if k.startswith("round"))
    state = {
        "time_utc": now_utc().isoformat(),
        "lead_branch": git("rev-parse", "--abbrev-ref", "HEAD", check=False).stdout.strip(),
        "specialists_sha256_16": agents,
        "workers_git_worktrees": workers,
        "workers_status_latest_round": {rounds[-1]: status[rounds[-1]].get("workers")} if rounds else None,
        "plugins_installed_locally": sorted((inst.get("plugins") or {}).keys()),
        "plugins_enabled_user_settings": sorted(k for k, v in (user_set.get("enabledPlugins") or {}).items() if v),
        "plugins_synced_from_claude_account": synced,
        "plugins_synced_from_claude_account_names": synced_names,
        "mcp_servers_configured": sorted(mcp_names),
        "hooks_project": sorted((proj_set.get("hooks") or {}).keys()),
        "note": "claude.ai connectors (World Labs Atlas, GitHub) and API keys are per Claude account / environment and "
                "cannot be stored in git; the lead verifies them at session start (docs/briefs/*/COORDINATION.md).",
    }
    (REPO / "backups" / "LIVE_TOOLS_STATE.json").write_text(json.dumps(state, indent=1) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--reason", default="manual")
    ap.add_argument("--message", default="")
    ap.add_argument("--no-push", action="store_true")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()
    t0 = now_utc()
    seed_live()
    st = load_status()
    row = {"time": t0.isoformat(), "reason": args.reason, "result": "error", "files_staged": 0,
           "pushed_verified": False, "branch": CFG["branch"]}

    LOCK.parent.mkdir(parents=True, exist_ok=True)
    lockfh = open(LOCK, "w")
    try:
        fcntl.flock(lockfh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        if not args.quiet:
            print("another autosave is running; skipping")
        return 0

    try:
        # ---- 1. identity checks -------------------------------------------------------
        url = git("remote", "get-url", CFG["remote_name"]).stdout.strip()
        if CFG["remote_url_must_contain"] not in url:
            raise RuntimeError(f"remote URL {url!r} is not the verified Rainbow repo; refusing to back up")
        branch = git("symbolic-ref", "--short", "HEAD").stdout.strip()
        row["branch"] = branch
        if CFG["branch"] in CFG.get("protected_branches", []) or branch in CFG.get("protected_branches", []):
            raise RuntimeError(f"branch {branch!r} is a protected original branch; autosave never pushes to it")
        if branch != CFG["branch"]:
            # A new cloud session gets a fresh working-branch name. Follow it only when it matches an
            # explicitly allowed session-branch pattern (protected branches were rejected above).
            pats = CFG.get("session_branch_patterns", [])
            if not any(fnmatch.fnmatchcase(branch, p) for p in pats):
                raise RuntimeError(f"current branch {branch!r} != verified branch {CFG['branch']!r} and matches no "
                                   f"session_branch_patterns {pats}; refusing to push")
            row["note"] = f"following session branch {branch!r} (config branch {CFG['branch']!r})"
        gitdir = REPO / ".git"
        for busy in ("index.lock", "MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD"):
            if (gitdir / busy).exists():
                row["result"] = "skipped"
                row["error"] = f"git operation in progress ({busy}); will retry next run"
                raise SystemExit(0)

        # ---- 2. refresh backups content ------------------------------------------------
        private = verify_private()
        if private is True:
            p = subprocess.run([sys.executable, "-I", str(REPO / "scripts" / "export_claude_sessions.py"),
                                str(REPO), CFG["claude_projects_glob"]], capture_output=True, text=True, timeout=300)
            if p.returncode != 0:
                row["transcript_error"] = p.stderr.strip()[-300:]
        else:
            row["transcript_note"] = ("repo privacy could not be verified" if private is None
                                      else "repo is NOT private") + " — transcripts not refreshed"
        refresh_manifest()
        try:
            wip = snapshot_worktrees()
            if wip:
                row["wip_snapshots"] = wip
        except Exception as e:  # a snapshot problem must never block the backup itself
            row["wip_error"] = str(e)[:300]
        try:  # round 32: Screen 05 specialists' scratch workspace (written by setup_r32.sh) -> backups/wip/screen05-agents/
            wsf = REPO / "backups" / "wip" / "screen05-agents" / "WORKSPACE"
            ws = wsf.read_text().strip() if wsf.exists() else ""
            if ws and Path(ws).is_dir():
                p = subprocess.run(["bash", str(REPO / "tools" / "marble05" / "sync_agents_wip.sh"), ws],
                                   capture_output=True, text=True, timeout=240)
                row["screen05_agents_sync"] = (p.stdout.strip() or p.stderr.strip())[-120:]
        except Exception as e:  # never blocks the backup
            row["screen05_agents_sync_error"] = str(e)[:300]
        try:
            snapshot_live_tools()
        except Exception as e:  # never blocks the backup
            row["live_tools_error"] = str(e)[:300]

        # ---- 3. stage allow-listed paths ----------------------------------------------
        # tracked status/log files: start from HEAD; they are refreshed from the live log only when a
        # real commit is made (below), so status-only runs never leave the tree dirty
        git("checkout", "--", *CFG["status_only_paths"], check=False)
        files = allowlisted_files()
        if files:
            # add in chunks to stay under arg limits
            for i in range(0, len(files), 200):
                git("add", "--", *files[i:i + 200])
        # also record deletions of tracked allow-listed files that were removed on disk
        # (the script itself never deletes anything from disk)
        deleted = [x for x in git("ls-files", "--deleted", "-z", "--", *CFG["allowlist"],
                                  check=False).stdout.split("\0") if x]
        for i in range(0, len(deleted), 200):
            git("add", "-u", "--", *deleted[i:i + 200], check=False)
        staged = [x for x in git("diff", "--cached", "--name-only", "-z").stdout.split("\0") if x]
        problems = scan_and_guard(staged)
        staged = [x for x in git("diff", "--cached", "--name-only", "-z").stdout.split("\0") if x]
        real = [x for x in staged if x not in CFG["status_only_paths"]]
        row["files_staged"] = len(staged)
        if problems:
            row["warnings"] = problems

        has_head = git("rev-parse", "--verify", "-q", "HEAD", check=False).returncode == 0
        if not real:
            # nothing but status/log: no commit, and leave the tracked status files exactly as in HEAD
            if has_head:
                git("reset", "-q", "--", *CFG["status_only_paths"], check=False)
                git("checkout", "--", *CFG["status_only_paths"], check=False)
            row["result"] = "no-change"
            row["files_staged"] = 0
            head = git("rev-parse", "HEAD", check=False).stdout.strip() if has_head else ""
            row["commit"] = head
            # still push if a previous push failed (local commits ahead of remote)
            if head and not args.no_push:
                ls = git("ls-remote", CFG["remote_name"], f"refs/heads/{branch}", check=False, timeout=120)
                remote_sha = ls.stdout.split()[0] if ls.stdout.strip() else ""
                if remote_sha != head:
                    ok, err = push_and_verify(branch)
                    row["pushed_verified"] = ok
                    row["result"] = "pushed-pending-commits" if ok else "push-retry-failed"
                    if err:
                        row["error"] = err
                else:
                    row["pushed_verified"] = True
        else:
            sync_tracked_from_live()
            git("add", "--", *CFG["status_only_paths"], check=False)
            stamp = t0.strftime("%Y-%m-%d %H:%M UTC")
            subject = args.message or f"autosave: Rainbow {stamp}"
            body = (f"\n\nAutomated Rainbow backup ({args.reason}). {len(real)} file(s) changed."
                    f"\nTranscripts: {'refreshed (repo verified private)' if private else row.get('transcript_note', '')}")
            c = git("commit", "-q", "-m", subject + body + TRAILER, check=False)
            if c.returncode != 0:
                # signing helpers can be unavailable outside the interactive session: retry unsigned
                c = git("-c", "commit.gpgsign=false", "commit", "-q", "-m", subject + body + TRAILER, check=False)
                if c.returncode != 0:
                    raise RuntimeError("commit failed: " + c.stderr.strip()[-400:])
                row["signed"] = False
            head = git("rev-parse", "HEAD").stdout.strip()
            row["commit"] = head
            row["result"] = "committed"
            if not args.no_push:
                ok, err = push_and_verify(branch)
                row["pushed_verified"] = ok
                row["result"] = "committed+pushed" if ok else "committed-local-only"
                if err:
                    row["error"] = err
    except SystemExit:
        pass
    except Exception as e:  # record, never crash silently
        row["error"] = str(e)[:600]
        row["result"] = "error"
    finally:
        t1 = now_utc()
        row["duration_s"] = int((t1 - t0).total_seconds())
        st["last_run"] = row
        st["repo"] = f"https://github.com/{CFG['repo_full_name']}"
        st["branch"] = row.get("branch", CFG["branch"])
        if row.get("pushed_verified"):
            st["last_verified_remote_sha"] = row.get("commit")
            st["last_successful_backup_utc"] = row["time"]
        if row["result"] not in ("skipped",):
            st["consecutive_failures"] = 0 if row["result"] in ("no-change", "committed+pushed", "pushed-pending-commits") \
                else st.get("consecutive_failures", 0) + 1
        try:
            sched = (Path.home() / ".rainbow-autosave-install.log").read_text().strip().splitlines()[-1]
        except Exception:
            sched = "unknown"
        st["schedule"] = f"every 5 min, container-local ({sched}); see backups/RECOVERY.md for limits"
        st["next_scheduled_utc"] = (t1 + dt.timedelta(minutes=5 - t1.minute % 5)).replace(second=0).isoformat()
        write_status(st)
        append_log(row)
        if not args.quiet:
            print(json.dumps(row, indent=2))
        fcntl.flock(lockfh, fcntl.LOCK_UN)
        lockfh.close()
    return 0 if row["result"] != "error" else 1


if __name__ == "__main__":
    sys.exit(main())
