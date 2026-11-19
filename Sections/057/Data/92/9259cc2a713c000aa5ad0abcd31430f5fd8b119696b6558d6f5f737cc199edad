"""Screen 08 r13 (`&m08bore=1`): where the gold ring's painted inner lip ends, per angle around the arch.

The fitted arch is a straight ring (front face inner radius = arch.inner.r, bore = a cylinder 0.9 u deep, pushed x4.2 by
m08far). In the approved view the bore's top half is a visible band (~40 px at the top) and the painted gold lip ends
INSIDE that band: its inner part carried the purple chamber wall seen just past the painted ring. While swimming the camera
sees that bore much more face-on, so the purple strip became a wide band of wall slots inside the gold ring ending in a hard
diagonal edge (the bore's back edge) at the top-left.

This measures, for each angle, the back-face radius r_b whose projection (approved camera, pushed like the game geometry)
lands on the painted gold -> purple boundary (scan r outward at the back plane; last purple sample). The game then makes
the bore a cone from arch.inner.r (front) to r_b (back): from the approved viewpoint the bore band covers exactly the
painted gold lip, the purple wall pixels land on the chamber behind it.
Sectors where the spout cups (gold) sit behind the ring edge, the frame edges and the water (bottom) are not measured:
r_b is interpolated across the cups and eases back to arch.inner.r outside the measured top arc.
usage: python3 -I tools/match08/bore08.py <out.json> [<debug.png>]
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw

out = sys.argv[1]
dbg = sys.argv[2] if len(sys.argv) > 2 else None
W, H = 864, 1536
L = json.load(open('assets/textures/match08/proj08.json'))
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
VP = M[:3, 3]
V = np.linalg.inv(M); f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
ARCH_K = 4.2  # m08far push (src/world/match08.ts)


def proj(p):
    h = np.append(p, 1) @ V.T; x, y, z = h[0], h[1], -h[2]
    return (x * f / asp / z * 0.5 + 0.5) * W, (0.5 - y * f / z * 0.5) * H


def push(p): return VP + ARCH_K * (np.asarray(p, float) - VP)


im = np.asarray(Image.open('references/08_final_spin_chamber.png').convert('RGB')).astype(int)
A = L['arch']; zF = A['z']; zB = A['z'] - A['depth']; ci = A['inner']; r_in = ci['r']
CUPS = [(46, 55), (114, 128)]   # UR / UL spout cups behind the ring's inner edge (gold cup, not the ring)
TOP = (31, 142)                 # measured arc (both ends at the frame edges)
OUTLIER = {66, 67, 68, 71, 86, 89}  # single samples on a bright slot highlight (B > G + 25 inside the gold)


def P(r, a, z): return proj(push([ci['cx'] + r * math.cos(a), ci['cy'] + r * math.sin(a), z]))


meas = {}
for deg in range(TOP[0], TOP[1] + 1):
    if any(a <= deg <= b for a, b in CUPS) or deg in OUTLIER: continue
    a = math.radians(deg); rb = None
    for r in np.arange(2.875, 2.40, -0.005):
        x, y = (int(round(v)) for v in P(r, a, zB))
        if not (0 <= x < W and 0 <= y < H): continue
        c = im[max(0, y - 1):y + 2, max(0, x - 1):x + 2].reshape(-1, 3).mean(0)
        if c[2] > c[1] + 25: rb = float(r); break
    if rb is not None: meas[deg] = rb
deg = np.arange(360)
ks = np.array(sorted(meas)); vs = np.array([meas[k] for k in ks])
rb = np.interp(deg, ks, vs)
# outside the measured arc ease back to the fitted inner radius over 12 deg (no change there)
for i in deg:
    if i < TOP[0]: rb[i] = r_in + (vs[0] - r_in) * max(0.0, 1 - (TOP[0] - i) / 12)
    elif i > TOP[1]: rb[i] = r_in + (vs[-1] - r_in) * max(0.0, 1 - (i - TOP[1]) / 12)
rb = np.maximum(rb, r_in)
# 7-deg circular moving average (the scan steps are 0.005 u)
k = 7; rb = np.convolve(np.concatenate([rb[-k:], rb, rb[:k]]), np.ones(k) / k, mode='same')[k:-k]
rb = np.maximum(rb, r_in)
json.dump({'note': 'arch back-face inner radius per degree (0 = +x, 90 = up), tools/match08/bore08.py', 'rIn': r_in,
           'rb': [round(float(v), 4) for v in rb]}, open(out, 'w'))
print('measured', len(meas), 'deg; rb top', round(float(rb[90]), 3), 'max', round(float(rb.max()), 3), 'r_in', round(r_in, 3))
if dbg:
    img = Image.open('references/08_final_spin_chamber.png').convert('RGB'); d = ImageDraw.Draw(img)
    front = [P(r_in, math.radians(i), zF) for i in range(0, 361)]
    back0 = [P(r_in, math.radians(i), zB) for i in range(0, 361)]
    back1 = [P(rb[i % 360], math.radians(i), zB) for i in range(0, 361)]
    d.line(front, fill=(0, 255, 0), width=1); d.line(back0, fill=(255, 0, 0), width=1); d.line(back1, fill=(0, 255, 255), width=1)
    img.crop((0, 150, 864, 700)).save(dbg)
