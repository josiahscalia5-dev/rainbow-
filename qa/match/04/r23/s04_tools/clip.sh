#!/usr/bin/env bash
# r23 s04 (QA only): pinned real-gameplay swim clip through Screen 04 (straight / left / right / straight, 2.4 s) -> mp4 + half speed
# usage: clip.sh <query file> <out mp4 prefix> <port>
set -u
QF=$1; OP=$2; P=$3; T=$(mktemp -d /tmp/claude-0/-home-user-rainbow-/1dee9937-64f8-543d-ae44-7cf9955b39b3/scratchpad/clipXXXX)
cd /home/user/wt/s04
AUDIT_PORT=$P timeout 2400 node /home/user/rainbow-/qa/match/04/r23/s04_tools/swim_clip_pinned_slow.mjs 04 "$T/f" 2.4 "$(cat $QF)" > "$T/log" 2>&1
ffmpeg -loglevel error -y -framerate 24 -i "$T/f/%04d.png" -vf scale=432:768 -pix_fmt yuv420p "${OP}.mp4"
ffmpeg -loglevel error -y -framerate 12 -i "$T/f/%04d.png" -vf scale=432:768 -pix_fmt yuv420p "${OP}_halfspeed.mp4"
mkdir -p "${OP}_frames"; for f in 0006 0018 0028 0040 0052; do cp "$T/f/$f.png" "${OP}_frames/$f.png" 2>/dev/null; done
echo "$(ls $T/f | wc -l) frames -> ${OP}.mp4 (frames in $T/f)"
