#!/usr/bin/env bash
# Claude Code hook entry point:  autosave-hook.sh <SessionStart|PreCompact|Stop|SessionEnd>
# SessionStart re-arms the 5-minute scheduler (a fresh cloud container has no crontab yet).
# Stop runs in the background so it never delays a turn; PreCompact/SessionEnd run inline (bounded).
EVENT="${1:-hook}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cat > /dev/null 2>&1   # drain hook JSON from stdin
case "$EVENT" in
  SessionStart)
    bash "$REPO/scripts/install-autosave-scheduler.sh" > "$HOME/.rainbow-autosave-install.log" 2>&1
    # Fresh containers clone LFS files as pointer stubs: fetch the real models/APK/.blend first (bounded),
    # then take the session-start backup. A failed early pull (before the git proxy is ready) makes git-lfs
    # store "access = basic", after which every pull asks for a username and fails: clear it first.
    git -C "$REPO" config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access" 2>/dev/null
    setsid nohup bash -c "timeout 240 git -C '$REPO' lfs pull >'$HOME/.rainbow-lfs-pull.log' 2>&1; \
      '$REPO/scripts/autosave-cron.sh' hook:SessionStart" >/dev/null 2>&1 < /dev/null &
    ;;
  Stop)
    setsid nohup "$REPO/scripts/autosave-cron.sh" "hook:Stop" >/dev/null 2>&1 < /dev/null &
    ;;
  PreCompact|SessionEnd)
    timeout 110 "$REPO/scripts/autosave-cron.sh" "hook:$EVENT" >/dev/null 2>&1
    ;;
esac
exit 0
