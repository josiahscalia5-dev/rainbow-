#!/usr/bin/env bash
# Rebuild the Image-Blaster test workspace used for the Screen 08 reconstruction test (qa/imageblaster/08/NOTES.md).
# Idempotent; never touches the Rainbow game; NO paid calls (it only installs and restores files).
#   bash scripts/setup-image-blaster.sh [target_dir]      (default /home/user/neilsonnn/image-blaster)
# Keys: NEVER in files. Real keys live only as Claude-environment network secrets (hosts api.worldlabs.ai header
# WLT-Api-Key, queue.fal.run header "Authorization: Key …"); the proxy injects them. .env holds placeholders only.
set -u
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIR="${1:-/home/user/neilsonnn/image-blaster}"
COMMIT=4acb43ba126a12358f71838d1b1a05e856b10eaf          # neilsonnn/image-blaster tested 2026-11-17
WORLD=rainbow-08-final-spin-chamber
Q="$REPO/qa/imageblaster/08"
if [ ! -d "$DIR/.git" ]; then
  mkdir -p "$(dirname "$DIR")"
  GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/neilsonnn/image-blaster "$DIR" || { echo "clone failed"; exit 1; }
fi
git -C "$DIR" fetch -q --depth 50 origin 2>/dev/null
git -C "$DIR" checkout -q "$COMMIT" 2>/dev/null || echo "note: pinned commit not reachable, staying on $(git -C "$DIR" rev-parse --short HEAD)"
# local change (fal submit errors show fal's reply text): apply once
git -C "$DIR" apply --check "$REPO/tools/imageblaster/image-blaster-local.patch" 2>/dev/null && git -C "$DIR" apply "$REPO/tools/imageblaster/image-blaster-local.patch"
# placeholders only (git-ignored by Image-Blaster); the proxy replaces them with the real keys
[ -f "$DIR/.env" ] || printf 'WORLD_LABS_API_KEY=proxy-injected\nFAL_KEY=proxy-injected\n' > "$DIR/.env"
(cd "$DIR" && command -v bun >/dev/null && bun install >/dev/null 2>&1 && echo "bun install OK") || echo "bun missing or install failed (npm i -g bun, then rerun)"
# restore the Screen 08 project files from the Rainbow backup (no regeneration)
S="$DIR/worlds/$WORLD/source"; O="$DIR/worlds/$WORLD/output/world"; mkdir -p "$S" "$O"
cp -n "$REPO/references/08_final_spin_chamber.png" "$S/0-08-final-spin-chamber.png"
cp -n "$Q/image_blaster_source_analysis.json" "$S/0-08-final-spin-chamber.json"
cp -n "$Q/image_analysis.json" "$DIR/worlds/$WORLD/image.json"
cp -n "$Q/1-08-final-spin-chamber-plate_fal_nano-banana-2_2K.png" "$S/1-08-final-spin-chamber-plate.png"
cp -n "$Q/08_plate_aligned_9x16_1536x2731.png" "$S/2-08-final-spin-chamber-plate-aligned.png"
cp -n "$Q/3-08-plate-nosplash_fal_edit2_raw.png" "$S/3-08-final-spin-chamber-plate-nosplash.png"
cp -n "$Q/08_plate_CLEAN_aligned_9x16_1536x2731.png" "$S/4-08-final-spin-chamber-plate-clean-aligned.png"
cp -n "$Q/fal_requests/fal_edit1_plate_request.json" "$S/.1-08-final-spin-chamber-plate-request.json"
cp -n "$Q/fal_requests/fal_edit2_nosplash_request.json" "$S/.3-08-final-spin-chamber-plate-nosplash-request.json"
for f in 0-world-100k.spz 0-world-150k.spz 0-world-500k.spz 0-world-full_res.spz 0-world.glb 0-world-pano.png 0-world-thumbnail.webp 0-world.json; do
  cp -n "$Q/world/$f" "$O/$f" 2>/dev/null || echo "missing $Q/world/$f (git lfs pull?)"
done
cp -n "$Q/world/0-world-request.json" "$O/.0-world-request.json" 2>/dev/null
echo "Image-Blaster ready at $DIR ($(git -C "$DIR" rev-parse --short HEAD)); world $WORLD restored."
echo "Scripts need: NODE_USE_ENV_PROXY=1 (Node fetch ignores HTTPS_PROXY otherwise). Free key checks:"
echo "  curl -sS https://api.worldlabs.ai/marble/v1/credits      # JSON with remaining_credits"
echo "  curl -sS -o /dev/null -w '%{http_code}' https://queue.fal.run/fal-ai/nano-banana-2/requests/00000000-0000-0000-0000-000000000000/status   # 404 = key accepted"
