#!/usr/bin/env python3
"""Benny r25: label a tools/benny25/swim_clip_c.mjs run and encode four mp4s (playback speed printed on EVERY frame):
  <out>_full_1x.mp4 / _full_0.5x.mp4  whole game frame (540x960)
  <out>_benny_1x.mp4 / _benny_0.5x.mp4  Benny-centred close-up (fixed window = median of his projected box, centre
                                         smoothed over 9 frames so it never jumps), 675x810 + caption band
usage: python3 -I tools/benny25/label_clip_c.py <clipDir> "<title>" <out_prefix>"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

d, title, outp = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
meta = json.loads((d / 'frames.json').read_text())
fr = meta['frames']
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
boxes = [f['box'] if isinstance(f.get('box'), list) else None for f in fr]
good = [b for b in boxes if b]
def med(v): v = sorted(v); return v[len(v) // 2]
H = max(med([(b[3] - b[1]) * 0.92 for b in good]), med([(b[2] - b[0]) * 0.92 * 540 / 450 for b in good]), 200) if good else 540
W = H * 450 / 540
cs = []
last = (395.0, 1170.0)
for b in boxes:
    if b: last = ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)
    cs.append(last)
def smooth(i):
    k = [cs[j] for j in range(max(0, i - 4), min(len(cs), i + 5))]
    return sum(c[0] for c in k) / len(k), sum(c[1] for c in k) / len(k)
for speed in ('1x', '0.5x'):
    for kind in ('full', 'benny'):
        lab = d / f'lab_{kind}'
        lab.mkdir(exist_ok=True)
        for i, f in enumerate(fr):
            im = Image.open(d / 'f' / f"{f['i']:04d}.png").convert('RGB')
            spd = 'REAL GAME SPEED (1.0x)' if speed == '1x' else 'HALF SPEED (0.5x)'
            lines = [(title, fb), (f"{spd}   t = {f['t']:.2f} s", fs), (f['phase'], fs)]
            if kind == 'full':
                o = im.resize((540, 960), Image.LANCZOS)
                y = 960 - 14 - 38 * len(lines)
                dr = ImageDraw.Draw(o)
                dr.rectangle([0, y - 10, 540, 960], fill=(20, 8, 40))
            else:
                cx, cy = smooth(i)
                x0 = min(max(0, cx - W / 2), im.width - W); y0 = min(max(0, cy - H / 2), im.height - H)
                c = im.crop((round(x0), round(y0), round(x0 + W), round(y0 + H))).resize((675, 810), Image.LANCZOS)
                o = Image.new('RGB', (676, 810 + 14 + 38 * len(lines) + 10), (20, 8, 40)); o.paste(c, (0, 0))
                dr = ImageDraw.Draw(o); y = 810 + 10
            for txt, ft in lines:
                dr.text((16, y), txt, font=ft, fill=(255, 255, 255)); y += 38
            o.save(lab / f"{f['i']:04d}.png")
        rate = 24 if speed == '1x' else 12
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(rate), '-i', str(lab / '%04d.png'),
                        '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '20', f'{outp}_{kind}_{speed}.mp4'], check=True)
print('frames', len(fr), 'game seconds', round(len(fr) / 24, 2), 'crop window', round(W), 'x', round(H))
