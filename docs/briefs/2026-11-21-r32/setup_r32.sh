#!/usr/bin/env bash
# Round 32 → next Claude account: recreate the Screen 05 3D test workspace from the repository in one command (free, no credits).
#   bash docs/briefs/2026-11-21-r32/setup_r32.sh [workspace=/tmp/rainbow_r32]
# Creates: <ws>/base (viewer + three.js 0.180 + Spark 2.4.0 + rebuilt track), <ws>/agentA and <ws>/agentB (each specialist's newest
# saved work from backups/wip/screen05-agents/ on top of the base). Nothing in the repository is changed.
set -e
REPO=$(cd "$(dirname "$0")/../../.." && pwd); WS=${1:-/tmp/rainbow_r32}; V=$REPO/tools/marble05/viewer
mkdir -p "$WS/base"; cd "$WS/base"
cp -f "$V"/* . 2>/dev/null || true
[ -d node_modules/@sparkjsdev/spark ] || { npm init -y >/dev/null; npm install three@0.180.0 @sparkjsdev/spark@2.4.0 >/dev/null; }
ln -sf "$REPO/assets/models/benny31.glb" benny31.glb; ln -sf "$REPO/assets/textures/benny31/bake.png" bake.png; ln -sf "$REPO/assets/textures/paint/05_coin.png" coin.png
for f in full_500k full_100k full_full plus_500k; do [ -f "$REPO/qa/worldlabs/05/r32/$f.spz" ] && ln -sf "$REPO/qa/worldlabs/05/r32/$f.spz" "$f.spz"; done
[ -f "$REPO/qa/spaitial/05/echo2.spz" ] && ln -sf "$REPO/qa/spaitial/05/echo2.spz" echo2.spz
# Git LFS: the worlds, Benny AND the specialists' saved track pieces (backups/wip/screen05-agents/**/*.ply are LFS objects:
# without this a fresh clone copies 133-byte pointer files into the workspace and the level cannot load — found in the r32 restart test)
git -C "$REPO" lfs pull --include "qa/worldlabs/05/r32/*.spz,assets/models/benny31.glb,assets/textures/benny31/*,qa/spaitial/05/echo2.spz,backups/wip/screen05-agents/**" >/dev/null 2>&1 || true
mkdir -p track
python3 -I "$REPO/tools/marble05/build_track.py" "$REPO/qa/worldlabs/05/r32/full_500k.spz" "$REPO/qa/worldlabs/05/r32/full_100k.spz" \
  scene05.json tile_frame.json rings.json track 10
for f in near far bay bay_m bay_lo bay_m_lo; do ln -sf "track/$f.ply" "$f.ply"; done; ln -sf track/track.json track.json
for a in agentA agentB; do
  rm -rf "$WS/$a"; cp -a "$WS/base" "$WS/$a"
  [ -d "$REPO/backups/wip/screen05-agents/$a" ] && cp -a "$REPO/backups/wip/screen05-agents/$a/." "$WS/$a/"
  # agentB may have rebuilt track pieces of its own: keep its saved versions (copied above) where present
done
# lead's merged page (agentB visuals + agentA controls, reproducible) and the acceptance tools at the workspace root
python3 -I "$REPO/tools/marble05/merge_r32.py" "$WS" || echo "MERGE NEEDS A HAND: see the message above"
for f in final_acceptance.cjs visual_check.py acceptance_verdict.py; do ln -sf "$V/$f" "$WS/$f"; done
# the five-minute autosave copies this workspace's specialist work to backups/wip/screen05-agents/ on every run
echo "$WS" > "$REPO/backups/wip/screen05-agents/WORKSPACE"
# refuse to call a workspace "ready" while any file in it is still an LFS pointer (git lfs pull failed / offline)
PTR=$(find -L "$WS/base" "$WS/agentA" "$WS/agentB" "$WS/merged" -path '*/node_modules' -prune -o -type f -size -200c -print0 2>/dev/null | xargs -0 grep -l "^version https://git-lfs" 2>/dev/null | head -5)
if [ -n "$PTR" ]; then echo "SETUP FAILED: Git LFS pointer files instead of real data (run: git -C $REPO lfs pull, then this script again):"; echo "$PTR"; exit 1; fi
echo "workspace ready: $WS (base, agentA, agentB, merged). Stills: cd $WS/base && PAGE=play3.html STILLS='[0,2.3]' NODE_PATH=\$(npm root -g) node play_shots2.cjs out stills"
echo "Acceptance run (whole level, real touch swipes): NODE_PATH=\$(npm root -g) node $V/final_acceptance.cjs <merged folder> <outdir>; then python3 -I $V/visual_check.py <outdir> $REPO/references/05_flow_into_the_current.png"
