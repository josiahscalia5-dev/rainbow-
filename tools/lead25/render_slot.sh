#!/usr/bin/env bash
# render_slot.sh — run one heavy render (Playwright / SwiftShader / Blender / ffmpeg) while holding one of N machine-wide
# render slots, so the four specialist workers on this 4-CPU container take turns instead of overloading it
# (round 24 ran at load ~30 with repeated Playwright timeouts).
#   usage:  bash /home/user/rainbow-/tools/lead25/render_slot.sh <command> [args...]
#   N = $RENDER_SLOTS (default 2). Waits (polling every 5 s) until a slot is free; prints the wait time on stderr.
#   The exit code is the command's. Slots are flock(1) locks under /tmp, released automatically if the process dies.
#   Status:  bash /home/user/rainbow-/tools/lead25/render_slot.sh --status
N=${RENDER_SLOTS:-2}
if [ "${1:-}" = "--status" ]; then
  for i in $(seq 1 "$N"); do
    if flock -n "/tmp/rainbow-render-slot$i.lock" true 2>/dev/null; then echo "slot $i free"; else echo "slot $i busy"; fi
  done
  exit 0
fi
[ $# -gt 0 ] || { echo "usage: $0 <command> [args...]" >&2; exit 2; }
t0=$(date +%s)
while true; do
  for i in $(seq 1 "$N"); do
    exec {fd}>"/tmp/rainbow-render-slot$i.lock"
    if flock -n "$fd"; then
      w=$(( $(date +%s) - t0 )); [ "$w" -gt 0 ] && echo "[render_slot] got slot $i after ${w}s" >&2
      nice -n 5 "$@"; rc=$?
      flock -u "$fd"; exec {fd}>&-
      exit $rc
    fi
    exec {fd}>&-
  done
  sleep 5
done
