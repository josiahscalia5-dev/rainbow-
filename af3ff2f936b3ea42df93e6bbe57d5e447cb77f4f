#!/usr/bin/env bash
# Fallback scheduler used only when cron is unavailable: one autosave every 300 s.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
while true; do
  "$REPO/scripts/autosave-cron.sh" daemon
  sleep 300
done
