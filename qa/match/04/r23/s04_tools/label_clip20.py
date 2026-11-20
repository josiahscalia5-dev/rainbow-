#!/usr/bin/env python3
"""r25 s04 (QA only): label every frame of a screen_clip20.mjs run and encode mp4s.
Copy of tools/lead23/label_clip.py with: 20 fps = REAL game speed (one frame = 0.05 s game time), 10 fps = half speed,
game time t = i * 0.05 s, and a line counting the glowing chevrons (in view AHEAD of Benny / swum through so far).
usage: python3 -I label_clip20.py <clipDir> <title> <out_prefix>   -> <out_prefix>_1.0x.mp4 + <out_prefix>_0.5x.mp4"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

d, title, outp = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
meta = json.loads((d / 'frames.json').read_text())
dt = meta.get('dt', 0.05)
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
# chevrons he has swum through: any chevron that was drawn ahead of him and is now within 0.5 u of him or behind
seen, through = set(), set()
rows = []
for fr in meta['frames']:
    ahead_vis = 0
    for a in fr.get('arrows', []):
        if a['vis'] and a['op'] > 0.05 and a['ahead'] > 0:
            ahead_vis += 1
            seen.add(a['z'])
        if a['z'] in seen and a['ahead'] <= 0.5:
            through.add(a['z'])
    rows.append((ahead_vis, len(through)))
for speed, rate in (('1.0x', 20), ('0.5x', 10)):
    lab = d / f'lab_{speed}'
    lab.mkdir(exist_ok=True)
    for fr, (av, th) in zip(meta['frames'], rows):
        im = Image.open(d / 'f' / f"{fr['i']:04d}.png").convert('RGB')
        dr = ImageDraw.Draw(im)
        spd = 'REAL GAME SPEED (1.0x)' if speed == '1.0x' else 'HALF SPEED (0.5x)'
        arr = (f"glowing arrows ahead of Benny: {av}   swum through: {th}" if fr['stage'] == meta['screen']
               else f"swum through on Screen {meta['screen']}: {th}")
        lines = [(title, fb), (f"{spd}   game time t = {fr['i'] * dt:.2f} s", fs), (fr['phase'], fs), (arr, fs)]
        y = 1536 - 20 - 46 * len(lines)
        dr.rectangle([0, y - 14, 864, 1536], fill=(20, 8, 40))
        for txt, f in lines:
            dr.text((24, y), txt, font=f, fill=(255, 255, 255))
            y += 46
        im.resize((540, 960), Image.LANCZOS).save(lab / f"{fr['i']:04d}.png")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', str(rate), '-i', str(lab / '%04d.png'),
                    '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '20', f'{outp}_{speed}.mp4'], check=True)
print('frames', len(meta['frames']), 'game seconds', round(len(meta['frames']) * dt, 2), 'arrows swum through', len(through))
