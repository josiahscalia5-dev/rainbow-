#!/usr/bin/env python3
"""r29 lead: ONE continuous BEFORE | NEW comparison video of Screen 06 (both start at the approved view, real game speed, same steering
schedule; the shorter BEFORE holds its last frame once it has reached Screen 07). Frames from tools/match06/r25_open_clip.mjs runs.
usage: python3 -I make_side_by_side.py <clip_before_dir> <clip_new_dir> <out_prefix>  -> <out_prefix>_1x.mp4 + _0.5x.mp4"""
import json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

B, N, OUT = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
fb = json.loads((B / 'frames.json').read_text())['frames']
fn = json.loads((N / 'frames.json').read_text())['frames']
F1 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
F2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
W, H, GAP, TOP, BOT = 432, 768, 8, 64, 58
n = max(len(fb), len(fn))
tmp = Path(tempfile.mkdtemp(prefix='sbs06_'))
def phase(fr, scr):
    return fr['phase'] if fr['stage'] == '06' else f"now in Screen {fr['stage']}"
for i in range(n):
    canvas = Image.new('RGB', (2 * W + GAP, TOP + H + BOT), (20, 8, 40))
    dr = ImageDraw.Draw(canvas)
    for k, (frames, d, title, col) in enumerate([(fb, B, 'BEFORE  (the version you saw)', (255, 190, 150)), (fn, N, 'NEW  (Screen 06 candidate)', (160, 210, 255))]):
        fr = frames[min(i, len(frames) - 1)]
        im = Image.open(d / 'f' / f"{fr['i']:04d}.png").convert('RGB').resize((W, H), Image.LANCZOS)
        x = k * (W + GAP)
        canvas.paste(im, (x, TOP))
        dr.text((x + 12, 10), title, font=F1, fill=col)
        held = i >= len(frames)
        dr.text((x + 12, 38), ('(finished — last frame held)' if held else phase(fr, '06')), font=F2, fill=(235, 225, 255))
        dr.text((x + 12, TOP + H + 8), f"Screen {fr['stage']}   ·   t = {min(i, len(frames) - 1) / 24:.2f} s", font=F2, fill=(235, 225, 255))
    dr.text((12, TOP + H + 32), 'Real gameplay, both from your approved start view; same steering: straight, hard LEFT, hard RIGHT, straight', font=F2, fill=(200, 190, 230))
    canvas.save(tmp / f'{i:04d}.png')
for speed, rate in (('1x', 24), ('0.5x', 12)):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(rate), '-i', str(tmp / '%04d.png'), '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',
                    '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '21', f'{OUT}_{speed}.mp4'], check=True)
print('frames', n, 'seconds at 1x', round(n / 24, 2))
