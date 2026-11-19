#!/usr/bin/env bash
# Wrapper executed by cron / hooks / the fallback daemon. Loads captured env, runs one autosave.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$HOME/.rainbow-autosave.env" ] && . "$HOME/.rainbow-autosave.env"
cd "$REPO" || exit 1
exec timeout 900 python3 "$REPO/scripts/rainbow-autosave.py" --reason "${1:-cron}" --quiet
