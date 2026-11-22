#!/usr/bin/env python3
"""Assemble the user's screen tour: for each screen 01..11 -> APPROVED picture (3 s) then the live game NOW (5 s clip).
A 80 px label strip sits ABOVE the 540x960 picture (nothing in the image is covered). Output: H.264 MP4, 30 fps.
usage: python3 -I assemble_tour.py <repo_root> <clips_dir> <out.mp4> <work_dir>"""
import os, subprocess, sys
from pathlib import Path

repo, clips, out, work = map(Path, sys.argv[1:5])
work.mkdir(parents=True, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT2 = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BG = "0x1d0838"
STAND_IN = "temporary 3D stand-in (your Google Flow video replaces it)"
S = {
    "01": ("01 Inside the Washer", STAND_IN),
    "02": ("02 Mascot Tumbles in the Whirlpool", STAND_IN),
    "03": ("03 Whirlpool Twirl", STAND_IN),
    "04": ("04 Through the Five Arrows", "newest test version  match04 (M3)"),
    "05": ("05 Flow Into the Current", "newest test version  match05 (M2)"),
    "06": ("06 Crest the Rinse Arch", "newest test version  match06 (M1)"),
    "07": ("07 Dive the Washer Tube", "newest test version  match07 (M2)"),
    "08": ("08 Final Spin Chamber", "newest test version  match08 + Benny r5b"),
    "09": ("09 Ride the Final Wave", STAND_IN),
    "10": ("10 Slide into Hiding", STAND_IN),
    "11": ("11 Safely Home", STAND_IN),
}
refs = {p.name[:2]: p for p in (repo / "references").glob("[01][0-9]_*.png")}


def label(tag, line1, line2, color):
    t1, t2 = work / f"{tag}_l1.txt", work / f"{tag}_l2.txt"
    t1.write_text(line1)
    t2.write_text(line2)
    return (f"pad=540:1040:0:80:color={BG},"
            f"drawtext=fontfile={FONT}:textfile={t1}:fontcolor={color}:fontsize=26:x=16:y=12,"
            f"drawtext=fontfile={FONT2}:textfile={t2}:fontcolor=white:fontsize=19:x=16:y=48")


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr[-2000:])


enc = ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30"]
parts = []
# opening title card
tc = work / "title.mp4"
(work / "t1.txt").write_text("RAINBOW  all 11 screens")
(work / "t2.txt").write_text("APPROVED picture first, then the game as it is NOW")
(work / "t3.txt").write_text("17 Nov 2026  newest saved version of each screen")
run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", f"color=c={BG}:s=540x1040:d=2.5:r=30", "-vf",
     f"drawtext=fontfile={FONT}:textfile={work/'t1.txt'}:fontcolor=white:fontsize=34:x=(w-tw)/2:y=420,"
     f"drawtext=fontfile={FONT2}:textfile={work/'t2.txt'}:fontcolor=0xffd84a:fontsize=20:x=(w-tw)/2:y=480,"
     f"drawtext=fontfile={FONT2}:textfile={work/'t3.txt'}:fontcolor=white:fontsize=18:x=(w-tw)/2:y=515", *enc, str(tc)])
parts.append(tc)
for sid, (title, now) in S.items():
    ref = refs[sid]
    a = work / f"{sid}_approved.mp4"
    run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-loop", "1", "-t", "3", "-i", str(ref), "-vf",
         "scale=540:960:force_original_aspect_ratio=decrease,pad=540:960:(ow-iw)/2:(oh-ih)/2:color=" + BG + "," +
         label(f"{sid}a", title, "1  APPROVED  (your original, unchanged)", "0xffd84a"), *enc, str(a)])
    frames = sorted((clips / sid).glob("f*.jpg"))
    if not frames:
        sys.exit(f"no frames for {sid}")
    b = work / f"{sid}_now.mp4"
    # keep only the frames that are still on THIS screen (a ride can reach the next screen, which on a single-screen
    # branch shows that screen's old default look and would be misleading)
    import json
    rec = json.loads((clips / sid / "rec.json").read_text())
    keep = len(rec["frames"]) + 1
    if sid in ("04", "05", "06", "07", "08"):
        keep = 1
        for f in rec["frames"]:
            if f["stage"] != sid:
                break
            keep = f["i"] + 1
    run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-framerate", "30", "-i", str(clips / sid / "f%04d.jpg"),
         "-frames:v", str(keep), "-vf",
         "scale=540:960," + label(f"{sid}b", title, "2  NOW  " + now, "0x7ef9ff"), *enc, str(b)])
    parts += [a, b]
lst = work / "list.txt"
lst.write_text("".join(f"file '{p}'\n" for p in parts))
run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy",
     "-movflags", "+faststart", str(out)])
print(out, os.path.getsize(out) // 1024, "KB")
