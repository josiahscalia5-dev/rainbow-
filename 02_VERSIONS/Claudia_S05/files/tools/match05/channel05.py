"""Screen 05 round 9 FOUNDATION (`&m05geo=1`): the painted river channel of the approved design E, per river row.

E (assets/textures/match05/tgtwall05/proj05_E.png + proj05_lut.json) is the approved picture laid onto the river surface:
row V ↔ arc length s (LUT), column x ↔ normalised lateral u = c + (x / W − 0.5) · 2w. Per row this finds the PAINTED
water channel (cyan lane + magenta bands: saturated cyan, or saturated bright magenta) between the painted foam banks /
walls (white foam, dark / mid purple wall), as [uL, uR], smoothed along s. Rows where the painted water reaches E's
own edge (the river runs out of the approved frame there) keep the full width (no bank known).
  python3 -I tools/match05/channel05.py <E.png> <lut.json> <out.json> [preview.png]
"""
import json, sys
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter1d, median_filter

E = np.asarray(Image.open(sys.argv[1]).convert('RGBA'))
lut = json.load(open(sys.argv[2]))['E']
out = sys.argv[3]
Hh, W = E.shape[:2]
hsv = cv2.cvtColor(E[..., :3], cv2.COLOR_RGB2HSV).astype(float)
H, S, V = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
cyan = (H > 165) & (H < 240) & (S > 0.3) & (V > 0.45)
mag = ((H > 280) | (H < 15)) & (S > 0.42) & (V > 0.8)
water = (cyan | mag) & (E[..., 3] > 127)
# the white glossy streaks / glints inside the bands are water too: close gaps up to ≈ 6 % of the row (foam piles are wider)
from scipy.ndimage import binary_closing
water = binary_closing(water, structure=np.ones((3, 61), bool))
n = lut['n']; s0, s1 = lut['s0'], lut['s1']
Vs, cs, ws = np.array(lut['V']), np.array(lut['c']), np.array(lut['w'])
N = 256
res = []
for i in range(N):
    s = s0 + (s1 - s0) * i / (N - 1)
    k = (s - s0) / (s1 - s0) * (n - 1)
    j = int(np.clip(np.floor(k), 0, n - 2)); t = k - j
    v = Vs[j] * (1 - t) + Vs[j + 1] * t; c = cs[j] * (1 - t) + cs[j + 1] * t; w = ws[j] * (1 - t) + ws[j + 1] * t
    y = int(np.clip(round(v * (Hh - 1)), 0, Hh - 1))
    row = water[max(0, y - 1):y + 2].any(axis=0)
    xs = np.where(row)[0]
    if len(xs) < 8:
        res.append([np.nan, np.nan, c, w]); continue
    # main run (gaps ≤ 2 % of the row bridged)
    runs, a = [], xs[0]
    for p, q in zip(xs[:-1], xs[1:]):
        if q - p > W * 0.02:
            runs.append((a, p)); a = q
    runs.append((a, xs[-1]))
    a, b = max(runs, key=lambda r: r[1] - r[0])
    uL = c + (a / W - 0.5) * 2 * w
    uR = c + (b / W - 0.5) * 2 * w
    # painted water touching E's own edge: the bank is not in the picture → full width on that side
    if a <= W * 0.03: uL = -1.0
    if b >= W * 0.97: uR = 1.0
    res.append([uL, uR, c, w])
r = np.array(res, dtype=float)
for k in (0, 1):
    col = r[:, k]
    good = ~np.isnan(col)
    col[~good] = np.interp(np.where(~good)[0], np.where(good)[0], col[good]) if good.any() else (-1 if k == 0 else 1)
    col = median_filter(col, size=9, mode='nearest')
    col = gaussian_filter1d(col, 3, mode='nearest')
    r[:, k] = np.clip(col, -1.0, 1.0)
json.dump({'note': 'Screen 05 r9 painted channel of E (tools/match05/channel05.py): per s sample [uL, uR] (normalised lateral)',
           's0': s0, 's1': s1, 'n': N, 'uL': [round(float(x), 4) for x in r[:, 0]], 'uR': [round(float(x), 4) for x in r[:, 1]]},
          open(out, 'w'))
if len(sys.argv) > 4:
    pv = Image.fromarray(E[..., :3]).convert('RGB'); d = ImageDraw.Draw(pv)
    for i in range(N):
        s = s0 + (s1 - s0) * i / (N - 1); k = (s - s0) / (s1 - s0) * (n - 1)
        j = int(np.clip(np.floor(k), 0, n - 2)); t = k - j
        v = Vs[j] * (1 - t) + Vs[j + 1] * t; c = cs[j] * (1 - t) + cs[j + 1] * t; w = ws[j] * (1 - t) + ws[j + 1] * t
        y = v * (Hh - 1)
        for u in (r[i, 0], r[i, 1]):
            x = ((u - c) / (2 * w) + 0.5) * W
            d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(255, 255, 0))
    pv.resize((W // 2, Hh // 2)).save(sys.argv[4])
for i in range(0, N, 16):
    print(round(s0 + (s1 - s0) * i / (N - 1), 2), 'uL', round(r[i, 0], 3), 'uR', round(r[i, 1], 3))
