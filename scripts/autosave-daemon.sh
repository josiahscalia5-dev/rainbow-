#!/usr/bin/env bash
# Fallback scheduler used only when cron is unavailable: one autosave every 300 s, measured START TO START
# (2026-11-20 r28: the old loop slept 300 s AFTER each save, so saves drifted to ~5 min 15-20 s, and a tick that found
# another save holding the lock was skipped for a whole extra 5 minutes). Now: if a tick is skipped because another
# save holds the lock (no new row in backups/.live/BACKUP_LOG.md), retry every 20 s for up to ~4 min, then keep the 300 s rhythm.
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="$REPO/backups/.live/BACKUP_LOG.md"   # live log: every run (also no-change) appends a row
rows() { [ -f "$LOG" ] && wc -l < "$LOG" || echo 0; }
while true; do
  t0=$(date +%s)
  for _try in 1 2 3 4 5 6 7 8 9 10 11 12; do
    before=$(rows)
    "$REPO/scripts/autosave-cron.sh" daemon
    [ "$(rows)" -gt "$before" ] && break   # a save (this one or a concurrent manual/hook save) was logged
    sleep 20
  done
  left=$(( 300 - ( $(date +%s) - t0 ) )); [ "$left" -lt 20 ] && left=20
  sleep "$left"
done
