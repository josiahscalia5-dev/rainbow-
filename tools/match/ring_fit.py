#!/usr/bin/env python3
"""Any screen: measure the projected gold tunnel rings (centre, radius) in an approved picture or a live capture by
fitting circles to the gold pixels of each ring's visible arc (generic version of tools/qa/ring_fit05.py).

    python3 -I tools/match/ring_fit.py IMAGE GUESSES.json OUT_PREFIX [--arc=8,172] [--hud=14,10,850,196]

GUESSES.json: [[name, cx, cy, r, dx, dy, dr], ...] rough circles (full-frame px) and search half-ranges.
A circle is scored by the share of gold pixels along its arc between the two angles (degrees, counter-clockwise from
+x, y up; default the upper arc) inside the frame and outside the HUD box. Coarse exhaustive search (4 px), then a
1 px refinement. Writes OUT_PREFIX.json (per ring: cx, cy, r, score) and OUT_PREFIX.png (circles drawn on the image).
Raw geometry only — not a fidelity score.
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw

pos = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
IMG, GUESS, OUT = pos[0], pos[1], pos[2]
A0, A1 = (float(v) for v in opt.get('arc', '8,172').split(','))
HUD = [int(v) for v in opt.get('hud', '14,10,850,196').split(',')]
im = Image.open(IMG).convert('RGB')
a = np.asarray(im).astype(int)
H, W = a.shape[:2]
r_, g_, b_ = a[..., 0], a[..., 1], a[..., 2]
gold = (r_ > 160) & (r_ - b_ > 70) & (g_ > 45)


def arc(cx, cy, r, n=260):
    th = np.linspace(math.radians(A0), math.radians(A1), n)
    x = cx + r * np.cos(th); y = cy - r * np.sin(th)
    ok = (x >= 0) & (x < W) & (y >= 0) & (y < H) & ~((x > HUD[0]) & (x < HUD[2]) & (y > HUD[1]) & (y < HUD[3]))
    return x[ok].astype(int), y[ok].astype(int)


def score(cx, cy, r):
    x, y = arc(cx, cy, r)
    if len(x) < 30:
        return 0.0
    return float(gold[y, x].mean())


res = {}
for name, cx, cy, r, dx, dy, dr in json.load(open(GUESS)):
    best = (-1, cx, cy, r)
    for st, rx, ry, rr in ((4, dx, dy, dr), (1, 4, 4, 4)):
        c0 = best if best[0] >= 0 else (0, cx, cy, r)
        for x in range(int(c0[1] - rx), int(c0[1] + rx) + 1, st):
            for y in range(int(c0[2] - ry), int(c0[2] + ry) + 1, st):
                for rad in range(max(8, int(c0[3] - rr)), int(c0[3] + rr) + 1, st):
                    s = score(x, y, rad)
                    if s > best[0]:
                        best = (s, x, y, rad)
    res[name] = dict(cx=best[1], cy=best[2], r=best[3], score=round(best[0], 3))
json.dump(dict(image=IMG, arc=[A0, A1], rings=res), open(OUT + '.json', 'w'), indent=1)
d = ImageDraw.Draw(im)
for name, v in res.items():
    d.ellipse([v['cx'] - v['r'], v['cy'] - v['r'], v['cx'] + v['r'], v['cy'] + v['r']], outline=(0, 255, 255), width=3)
    d.ellipse([v['cx'] - 5, v['cy'] - 5, v['cx'] + 5, v['cy'] + 5], fill=(0, 255, 255))
    d.text((v['cx'] + 8, v['cy'] - v['r'] + 6), name, fill=(0, 255, 255))
im.save(OUT + '.png')
for name, v in res.items():
    print(name, v)
