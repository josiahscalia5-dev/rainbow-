#!/usr/bin/env python3
"""Side-by-side frames for each problem moment of the user's recording: VIDEO | BUILD (match08=1) | CAMCLEAR
(match08=1&camclear=1), each full size (360x800), plus the three separate pictures.
usage: python3 -I tools/camclear/triptych.py <video_frames_dir> <probe_build_dir> <probe_cc_dir> <out_dir> v1 v2 ...
(video frames named v_<t>.png; probe rows in the same order as the video times)"""
import json, sys, shutil, os
from PIL import Image, ImageDraw, ImageFont
vd, pb, pc, out = sys.argv[1:5]
vts = sys.argv[5:]
os.makedirs(out, exist_ok=True)
rb = json.load(open(f'{pb}/probe.json'))['rows']; rc = json.load(open(f'{pc}/probe.json'))['rows']
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except OSError:
    font = ImageFont.load_default()
for v, a, b in zip(vts, rb, rc):
    tag = f"v{float(v):04.1f}s_{a['stage']}"
    ims = [Image.open(f'{vd}/v_{v}.png').convert('RGB'), Image.open(a['file']).convert('RGB'), Image.open(b['file']).convert('RGB')]
    names = ['1_video', '2_build', '3_camclear']
    for n, im in zip(names, ims):
        im.save(f'{out}/{tag}_{n}.png')
    w, h = ims[0].size
    sheet = Image.new('RGB', (3 * w + 20, h + 26), (24, 10, 40))
    d = ImageDraw.Draw(sheet)
    labels = [f'YOUR VIDEO {v}s', f'BUILD match08 t={a["t"]}', f'CAMCLEAR t={b["t"]}']
    for i, (im, l) in enumerate(zip(ims, labels)):
        sheet.paste(im, (i * (w + 10), 26)); d.text((i * (w + 10) + 6, 5), l, fill=(255, 255, 255), font=font)
    sheet.save(f'{out}/{tag}_side_by_side.png')
