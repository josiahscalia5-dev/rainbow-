"""Screen 08 r11 (`&m08near=1`): sharp near-water tile cut from the approved picture's own near river band.

While Benny swims, the floor right in front of the camera shows plate pixels that the approved view saw far away and
small (the projection is magnified ~5x along the river there): stretched, blurred streaks. The approved picture's band
just below Benny (4.5-6.5 u ahead of the approved camera, rows ~1250-1520) is the crisp painted river: magenta left,
cyan centre, white glossy streaks, foam fringes on both banks. This unrolls that band into river coordinates
(lateral position across the painted river, -1 = left bank .. +1 = right bank, x 1.1 margin; distance along the river),
removes the three bubbles (they would repeat; filled along the flow) and writes a tile the floor shader repeats along the river
(periodic, the wrap cross-faded)
where the projection is magnified, fading in only away from the approved viewpoint (src/world/match08.ts).
usage: python3 -I tools/match08/near08.py <outPng> <outJson> [<debugDir>]
"""
import json, math, sys
import cv2
import numpy as np
from PIL import Image

out_png, out_json = sys.argv[1:3]
dbg = sys.argv[3] if len(sys.argv) > 3 else None
L = json.load(open('assets/textures/match08/proj08.json'))
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
Hp, Wp = plate.shape[:2]
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
V = np.linalg.inv(M); W, H = L['camera']['size']; f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
VP = M[:3, 3]; FY = L['floorY']


def project(p):
    h = np.concatenate([p, np.ones(p.shape[:-1] + (1,))], -1) @ V.T
    x, y, z = h[..., 0], h[..., 1], -h[..., 2]
    return (x * f / asp / z * 0.5 + 0.5) * W, (0.5 - y * f / z * 0.5) * H


def unproject_floor(u, v):  # frame px -> floor point
    x = (u / W - 0.5) * 2 * asp / f; y = (0.5 - v / H) * 2 / f
    d = M[:3, :3] @ np.array([x, y, -1.0]); s = (FY - VP[1]) / d[1]
    return VP + s * d


# painted river banks (inner edge of the foam fringe) read by eye on the approved picture, rows -> frame x
BANKS = [(1250, 178, 688), (1300, 140, 718), (1350, 108, 748), (1400, 80, 774), (1450, 52, 800), (1500, 28, 826)]
rows = []
for r, xl, xr in BANKS:
    pl, pr = unproject_floor(xl, r), unproject_floor(xr, r)
    rows.append(((pl[2] + pr[2]) / 2, (pl[0] + pr[0]) / 2, abs(pr[0] - pl[0]) / 2))
rows = np.array(rows)  # z, centre x, half width
zc = np.polyfit(rows[:, 0], rows[:, 1], 1); zh = np.polyfit(rows[:, 0], rows[:, 2], 1)
Z0, Z1 = rows[:, 0].max() - 0.05, rows[:, 0].min() + 0.05   # nearest .. farthest usable z of the band
print('band z', round(Z0, 3), '..', round(Z1, 3), 'length', round(Z0 - Z1, 3), 'half width', rows[:, 2].round(3))

NU, NV, A = 640, 768, 1.1  # lateral cells over a in [-A, A]; cells along z (near -> far)
a = np.linspace(-A, A, NU); zz = np.linspace(Z0, Z1, NV)
AA, ZZ = np.meshgrid(a, zz)
X = np.polyval(zc, ZZ) + AA * np.polyval(zh, ZZ)
P = np.stack([X, np.full_like(X, FY), ZZ], -1)
px, py = project(P)
sx, sy = (px * Wp / W).astype(np.float32), (py * Hp / H).astype(np.float32)
tile = cv2.remap(plate, sx, sy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
# bubbles (frame px centre, radius) -> masks in tile space
mask = np.zeros(tile.shape[:2], bool)
for bx, by, br in [(260, 1425, 36), (318, 1452, 15), (600, 1286, 24)]:
    mask |= ((px - bx) ** 2 + (py - by) ** 2) < br ** 2
mask = cv2.dilate(mask.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))).astype(bool)
# fill along the flow (tile columns run along the river): each masked texel = blend of the nearest clean texels above and
# below in its own column, so the painted streaks continue through the hole instead of a flat smudge
for i in np.where(mask.any(0))[0]:
    col = mask[:, i]; good = np.where(~col)[0]
    for j in np.where(col)[0]:
        lo = good[good < j]; hi = good[good > j]
        if len(lo) and len(hi):
            a, b = lo[-1], hi[0]; w = (j - a) / (b - a); tile[j, i] = (1 - w) * tile[a, i] + w * tile[b, i]
        elif len(lo): tile[j, i] = tile[lo[-1], i]
        elif len(hi): tile[j, i] = tile[hi[0], i]
# periodic along the river: the far OV texels are cross-faded into the near start, so the tile repeats without a mirror
# seam (mirrored repeats drew chevrons where the slanted streaks reflect)
OV = int(NV * 0.3)
P = NV - OV
per = tile[:P].copy()
w = (np.arange(OV) / OV)[:, None, None]
per[:OV] = (1 - w) * tile[P:P + OV] + w * tile[:OV]
t8 = np.clip(per, 0, 255).astype(np.uint8)
Image.fromarray(t8).save(out_png)
# the painted water incl. its foam fringe spans a = WL .. WR (read on the tile: left foam outer edge, right foam before
# the gold arch leg); the shader maps the swim lane's banks onto these so no arch-leg gold is repeated along the river
WL, WR = -0.92, 0.76
json.dump({'A': A, 'z0': float(Z0), 'zLen': float(Z0 - Z1) * P / NV, 'bandLen': float(Z0 - Z1), 'halfWidth': float(np.mean(rows[:, 2])),
           'waterA': [WL, WR], 'texelsPerU': [NU / (2 * A * float(np.mean(rows[:, 2]))), NV / float(Z0 - Z1)],
           'note': 'u = 0.5 + a / (2A), a = lateral / painted half width; v = (z0 - z) / zLen (periodic repeat, wrap cross-faded)'},
          open(out_json, 'w'), indent=1)
if dbg:
    Image.fromarray(np.clip(tile, 0, 255).astype(np.uint8)).save(f'{dbg}/near08_raw.png')
    ov = Image.open('references/08_final_spin_chamber.png').convert('RGB')
    o = np.asarray(ov).copy()
    for j in (0, NV // 2, NV - 1):
        for i in range(0, NU, 2):
            x, y = int(px[j, i]), int(py[j, i])
            if 0 <= x < W and 0 <= y < H: o[y, x] = (0, 255, 0)
    for i in (0, NU // 2, NU - 1):
        for j in range(0, NV, 2):
            x, y = int(px[j, i]), int(py[j, i])
            if 0 <= x < W and 0 <= y < H: o[y, x] = (255, 255, 0)
    Image.fromarray(o).save(f'{dbg}/near08_overlay.png')
