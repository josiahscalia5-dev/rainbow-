#!/usr/bin/env bash
# Round 34: the machine has 4 CPUs and software WebGL (SwiftShader). Every headless-Chromium render (stills, acceptance runs) by any
# specialist goes through this two-slot lock, so at most TWO renders run at once and nobody's test is starved.
#   bash tools/kit05/render_slot.sh <command ...>      (waits for a free slot, then runs the command)
# Long runs (whole-level acceptance, ~30 min): set RENDER_SLOT=2 so they only ever take slot 2 and short tests keep slot 1 free.
LOCKDIR=/tmp/rainbow_r34/locks; mkdir -p "$LOCKDIR"
slots=(1 2); [ -n "$RENDER_SLOT" ] && slots=("$RENDER_SLOT")
while true; do
  for s in "${slots[@]}"; do
    exec {fd}>"$LOCKDIR/render$s.lock"
    if flock -n "$fd"; then
      echo "$(date -u +%H:%M:%S) slot $s: ${*:0:3}" >> "$LOCKDIR/usage.log"
      "$@"; rc=$?; flock -u "$fd"; exit $rc
    fi
    exec {fd}>&-
  done
  sleep 3
done
