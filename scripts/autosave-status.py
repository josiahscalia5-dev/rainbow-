#!/usr/bin/env python3
"""Rainbow autosave health check (read-only).

    python3 -I scripts/autosave-status.py          one-line verdict + details, exit 0 = healthy, 1 = problem
    python3 -I scripts/autosave-status.py --json   machine-readable

Checks: scheduler alive (cron entry or daemon process), age of the last verified backup, last result,
consecutive failures, local HEAD == remote branch SHA, uncommitted files, and the current branch is
neither protected nor outside the allowed session-branch patterns. A gap > 12 min since the last
verified backup (e.g. the cloud environment was closed) is reported explicitly.
"""
import datetime as dt
import fnmatch
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
CFG = json.loads((REPO / "backups" / "autosave.config.json").read_text())


def sh(*cmd, timeout=60):
    p = subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, timeout=timeout)
    return p.returncode, p.stdout.strip()


def main() -> int:
    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    live = REPO / "backups" / ".live" / "BACKUP_STATUS.json"
    st_path = live if live.exists() else REPO / "backups" / "BACKUP_STATUS.json"
    try:
        st = json.loads(st_path.read_text())
    except Exception:
        st = {}
    problems = []
    _, branch = sh("git", "symbolic-ref", "--short", "HEAD")
    if branch in CFG.get("protected_branches", []):
        problems.append(f"current branch {branch} is PROTECTED; autosave will refuse to push")
    elif branch != CFG["branch"] and not any(fnmatch.fnmatchcase(branch, p) for p in CFG.get("session_branch_patterns", [])):
        problems.append(f"current branch {branch} matches no allowed session-branch pattern")
    _, cron = sh("bash", "-c", "crontab -l 2>/dev/null | grep -c rainbow-autosave; pgrep -x cron >/dev/null && echo cron-up || echo cron-down")
    _, daemon = sh("bash", "-c", "pgrep -f 'scripts/autosave-[d]aemon.sh' >/dev/null && echo up || echo down")
    sched = "cron" if ("cron-up" in cron and not cron.startswith("0")) else ("daemon" if daemon == "up" else "NONE")
    if sched == "NONE":
        problems.append("no scheduler running (no cron entry and no daemon) — run: bash scripts/install-autosave-scheduler.sh")
    last_ok = st.get("last_successful_backup_utc")
    age_min = None
    if last_ok:
        age_min = round((now - dt.datetime.fromisoformat(last_ok)).total_seconds() / 60, 1)
        if age_min > 12:
            problems.append(f"GAP: last verified backup was {age_min} min ago ({last_ok}); the environment may have been closed or the scheduler stopped")
    else:
        problems.append("no verified backup recorded yet")
    lr = st.get("last_run", {})
    if lr.get("result") in ("error", "committed-local-only", "push-retry-failed"):
        problems.append(f"last run {lr.get('time')} failed: {lr.get('result')} {lr.get('error', '')}".strip())
    if st.get("consecutive_failures", 0):
        problems.append(f"{st['consecutive_failures']} consecutive failed run(s)")
    _, head = sh("git", "rev-parse", "HEAD")
    _, ls = sh("git", "ls-remote", CFG["remote_name"], f"refs/heads/{branch}", timeout=120)
    remote = ls.split()[0] if ls else ""
    _, dirty = sh("git", "status", "--porcelain")
    ndirty = len([x for x in dirty.splitlines() if x.strip()])
    out = {
        "time_utc": now.isoformat(), "branch": branch, "scheduler": sched,
        "last_verified_backup_utc": last_ok, "minutes_since": age_min, "last_result": lr.get("result"),
        "local_head": head[:12], "remote_head": remote[:12], "remote_matches_local": remote == head,
        "uncommitted_files": ndirty, "protected_branches": CFG.get("protected_branches", []),
        "healthy": not problems, "problems": problems,
    }
    if "--json" in sys.argv:
        print(json.dumps(out, indent=2))
    else:
        verdict = "AUTOSAVE OK" if not problems else "AUTOSAVE PROBLEM"
        print(f"{verdict} | branch {branch} | scheduler {sched} | last verified backup {last_ok} ({age_min} min ago) | "
              f"local {head[:7]} remote {remote[:7] or 'none'} ({'match' if remote == head else 'DIFFERENT'}) | uncommitted {ndirty}")
        for p in problems:
            print("  - " + p)
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
