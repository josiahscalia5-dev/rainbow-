#!/usr/bin/env bash
# Claude Code hook entry point:  autosave-hook.sh <SessionStart|PreCompact|Stop|SessionEnd>
# SessionStart -> scripts/claude-bootstrap.sh --hook: lists newer branches (NEVER merges), restores Git LFS, re-arms the
#   five-minute autosave, prints a short recovery summary for Claude and runs the full bootstrap in the background.
# Stop runs in the background so it never delays a turn (and re-arms the scheduler if it died);
# PreCompact/SessionEnd run one verified autosave inline (bounded).
EVENT="${1:-hook}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
case "$EVENT" in
  SessionStart)
    if [ -f "$REPO/scripts/claude-bootstrap.sh" ]; then
      exec bash "$REPO/scripts/claude-bootstrap.sh" --hook     # reads the hook JSON (source) from stdin
    fi
    # fallback for an old checkout without the bootstrap
    cat > /dev/null 2>&1
    bash "$REPO/scripts/install-autosave-scheduler.sh" > "$HOME/.rainbow-autosave-install.log" 2>&1
    git -C "$REPO" config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access" 2>/dev/null
    setsid nohup bash -c "timeout 240 git -C '$REPO' lfs pull >'$HOME/.rainbow-lfs-pull.log' 2>&1; \
      '$REPO/scripts/autosave-cron.sh' hook:SessionStart" >/dev/null 2>&1 < /dev/null &
    ;;
  Stop)
    cat > /dev/null 2>&1
    bash "$REPO/scripts/install-autosave-scheduler.sh" > "$HOME/.rainbow-autosave-install.log" 2>&1
    setsid nohup "$REPO/scripts/autosave-cron.sh" "hook:Stop" >/dev/null 2>&1 < /dev/null &
    ;;
  PreCompact|SessionEnd)
    cat > /dev/null 2>&1
    timeout 110 "$REPO/scripts/autosave-cron.sh" "hook:$EVENT" >/dev/null 2>&1
    ;;
  *)
    cat > /dev/null 2>&1
    ;;
esac
exit 0
