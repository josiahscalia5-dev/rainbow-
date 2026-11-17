#!/usr/bin/env python3
"""Contact sheet of probe frames with labels (game time, stage, near-zone share, Benny hidden share).
usage: python3 -I tools/camclear/sheet.py <probe.json> <out.png> [t0 t1] [--cols=N] [--label=TEXT]
"""
import json
import sys
from PIL import Image, ImageDraw, ImageFont

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
probe, out = args[0], args[1]
t0 = float(args[2]) if len(args) > 2 else -1e9
t1 = float(args[3]) if len(args) > 3 else 1e9
cols = int(opts.get('cols', 6))
d = json.load(open(probe))
rows = [r for r in d['rows'] if t0 - 1e-6 <= r['t'] <= t1 + 1e-6]
if not rows:
    sys.exit('no frames in range')
ims = [Image.open(r['file']).convert('RGB') for r in rows]
w, h = ims[0].size
lab = 34
n = len(ims)
rc = (n + cols - 1) // cols
top = 30 if opts.get('label') else 0
sheet = Image.new('RGB', (cols * w, rc * (h + lab) + top), (24, 10, 40))
dr = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    fbig = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except OSError:
    font = fbig = ImageFont.load_default()
if top:
    dr.text((8, 6), opts['label'], fill=(255, 255, 255), font=fbig)
for i, (r, im) in enumerate(zip(rows, ims)):
    x, y = (i % cols) * w, top + (i // cols) * (h + lab)
    sheet.paste(im, (x, y))
    b = r.get('benny') or {}
    hid = b.get('hidden')
    l1 = f"t={r['t']:.1f}s {r.get('mode','')} {r.get('stage','')}"
    l2 = f"near2u {100*(r.get('near2') or 0):.0f}%  Benny hidden {'-' if hid is None else f'{100*hid:.0f}%'}"
    dr.text((x + 4, y + h + 2), l1, fill=(255, 255, 255), font=font)
    col = (255, 120, 120) if (hid or 0) > 0.3 or (r.get('near2') or 0) > 0.1 else (200, 230, 200)
    dr.text((x + 4, y + h + 17), l2, fill=col, font=font)
sheet.save(out)
print(out, sheet.size, n, 'frames')
