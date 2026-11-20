#!/usr/bin/env python3
"""Lead r23: label every frame of a screen_clip.mjs run (title, playback speed, phase, game time) and encode mp4s.
usage: python3 -I label_clip.py <clipDir> <title> <out_prefix>   -> <out_prefix>_1x.mp4 (real game speed) + _0.5x.mp4"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

d, title, outp = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
meta = json.loads((d / 'frames.json').read_text())
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
lab = d / 'lab'
lab.mkdir(exist_ok=True)
for speed in ('1x', '0.5x'):
    for fr in meta['frames']:
        im = Image.open(d / 'f' / f"{fr['i']:04d}.png").convert('RGB')
        dr = ImageDraw.Draw(im)
        spd = 'REAL GAME SPEED (1.0x)' if speed == '1x' else 'HALF SPEED (0.5x)'
        lines = [(title, fb), (f"{spd}   t = {fr['t']:.2f} s", fs), (fr['phase'], fs)]
        y = 1536 - 20 - sum(46 for _ in lines)
        dr.rectangle([0, y - 14, 864, 1536], fill=(20, 8, 40))
        for txt, f in lines:
            dr.text((24, y), txt, font=f, fill=(255, 255, 255))
            y += 46
        im.resize((540, 960), Image.LANCZOS).save(lab / f"{fr['i']:04d}.png")
    rate = 24 if speed == '1x' else 12
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(rate), '-i', str(lab / '%04d.png'),
                    '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '20', f'{outp}_{speed}.mp4'], check=True)
print('frames', len(meta['frames']), 'game seconds', round(len(meta['frames']) / 24, 2))
