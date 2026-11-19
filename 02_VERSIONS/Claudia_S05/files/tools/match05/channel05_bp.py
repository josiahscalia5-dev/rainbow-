"""Screen 05 round 9 FOUNDATION (`&m05geo=1`): the PAINTED river channel per arc length s, from the approved picture's
region masks (water + Benny / wake / coins / bubbles on it) back-projected through the locked eye onto the game river
(the projected 3D edges of the a00 frame: qa/match/05/r9/blueprint/kept/a00_approved_view.geo.json).
For every screen row y the painted river's left / right edge → normalised lateral u = lat / course half width at the
row's s. Edges at the frame border (painted river runs out of the picture) or beyond the course edge → ±1 (no bank).
  python3 -I tools/match05/channel05_bp.py <a00.geo.json> <out.json>
"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d

g = json.load(open(sys.argv[1]))
M = 'qa/pilot05/full_reference_match/masks/'
m = lambda n: np.asarray(Image.open(M + n).convert('L')) > 127
water = m('water.png') | m('benny_and_hat.png') | m('wake_splash.png') | m('coins.png') | m('bubbles.png')
near = [p for p in g['near'] if p['L'] and p['R'] and p['C']]
pts = []
for y in range(536, 1000, 2):
    xs = np.where(water[y])[0]
    if not len(xs):
        continue
    runs, a = [], xs[0]
    for p, q in zip(xs[:-1], xs[1:]):
        if q - p > 8:
            runs.append((a, p)); a = q
    runs.append((a, xs[-1]))
    L, R = max(runs, key=lambda r: r[1] - r[0])
    hit = None
    for a, b in zip(near[:-1], near[1:]):
        ya, yb = a['C'][1], b['C'][1]
        if (ya - y) * (yb - y) <= 0 and ya != yb:
            t = (y - ya) / (yb - ya); hit = (a, b, t); break
    if not hit:
        continue
    a, b, t = hit
    lerp = lambda p, q: p + t * (q - p)
    s = lerp(a['s'], b['s'])
    Cx = lerp(a['C'][0], b['C'][0]); Lx = lerp(a['L'][0], b['L'][0]); Rx = lerp(a['R'][0], b['R'][0])
    uL = (L - Cx) / (Cx - Lx) if L > 3 else -1.0
    uR = (R - Cx) / (Rx - Cx) if R < 860 else 1.0
    pts.append((s, max(-1.0, min(1.0, uL)), max(-1.0, min(1.0, uR))))
pts.sort()
S = np.array([p[0] for p in pts]); UL = np.array([p[1] for p in pts]); UR = np.array([p[2] for p in pts])
s0, s1, N = float(S.min()), float(S.max()), 128
grid = np.linspace(s0, s1, N)
uL = gaussian_filter1d(np.interp(grid, S, UL), 1.5, mode='nearest')
uR = gaussian_filter1d(np.interp(grid, S, UR), 1.5, mode='nearest')
json.dump({'note': 'Screen 05 r9 painted channel from the approved region masks back-projected (tools/match05/channel05_bp.py)',
           's0': s0, 's1': s1, 'n': N, 'uL': [round(float(x), 4) for x in uL], 'uR': [round(float(x), 4) for x in uR]},
          open(sys.argv[2], 'w'))
for i in range(0, N, 8):
    print(round(grid[i], 2), 'uL', round(uL[i], 3), 'uR', round(uR[i], 3))
