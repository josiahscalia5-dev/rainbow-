"""Screen 08 r12 (`&m08rw=1`): the painted river's TRUE width near the camera, for the floor shader's swim-lane remap only.

`river08.json` (the gameplay path, unchanged) was traced with edges that, below row ~1000, follow Benny's splash crest and
the arch's gold feet instead of the river banks, so near the camera it says the painted river is 0.8-2.5 u wide while the
painted water is ~3-4.5 u wide (bank to bank). The m08swim remap spreads the painted banks to the swim lane (+-2.95 u),
so it stretched the near water up to ~13x sideways (long sideways smears) and jumped where the trace starts (a straight
edge in the magenta water at the lower left, forward 3 u). This writes the bank-to-bank width read BY EYE on the approved
picture (left bank = foam / floor edge; right bank = water edge or the gold leg's inner edge where the leg covers it;
rows 1150-1200 skipped: the arch's feet stand in the water there and hide the banks) projected on the floor from the
locked camera. The shader merges it with river08.json (this near the camera, river08 beyond z -285.5).
usage: python3 -I tools/match08/rivnear08.py <outJson>
"""
import json, math, sys
import numpy as np

out = sys.argv[1]
L = json.load(open('assets/textures/match08/proj08.json'))
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
W, H = L['camera']['size']; f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
VP = M[:3, 3]; FY = L['floorY']


def up(u, v):  # frame px -> floor point
    x = (u / W - 0.5) * 2 * asp / f; y = (0.5 - v / H) * 2 / f
    d = M[:3, :3] @ np.array([x, y, -1.0]); s = (FY - VP[1]) / d[1]
    return VP + s * d


# row, left bank x, right bank x (frame px of the 864 x 1536 approved picture; 1250-1500 = near08.py BANKS)
BANKS = [(1000, 209, 740), (1050, 215, 745), (1100, 205, 705), (1250, 178, 688), (1300, 140, 718), (1350, 108, 748),
         (1400, 80, 774), (1450, 52, 800), (1500, 28, 826), (1536, 0, 862)]
rows = []
for r, xl, xr in BANKS:
    a, b = up(xl, r), up(xr, r)
    rows.append((float((a[2] + b[2]) / 2), float((a[0] + b[0]) / 2), float(b[0] - a[0])))
rows.sort(key=lambda t: -t[0])
for z, x, w in rows: print('z %.2f  centre x %.2f  width %.2f' % (z, x, w))
json.dump({'note': 'Screen 08 painted river bank-to-bank width near the camera (render remap only, not the gameplay path); '
                   'tools/match08/rivnear08.py (r12)', 'blend': [-284.5, -285.5],
           'z': [t[0] for t in rows], 'x': [t[1] for t in rows], 'width': [t[2] for t in rows]}, open(out, 'w'), indent=1)
