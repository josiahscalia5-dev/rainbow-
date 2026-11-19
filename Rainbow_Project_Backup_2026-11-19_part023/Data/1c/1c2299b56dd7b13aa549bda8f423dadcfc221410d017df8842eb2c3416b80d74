#!/usr/bin/env python3
"""Screen 08 scenery r10 (`&m08near=1`): world-anchored near-water DETAIL tile from the approved picture.

While Benny swims, the floor right in front of the camera shows the projected plate magnified 2-3x (the plate only holds
the river behind Benny at a distance), so the near water became a smooth smeared sheet. The approved picture's own
crispest water is the near band at the frame bottom (rows ~1200-1536). This bakes that band top-down onto the floor
plane (world x / z, 200 texels per unit), paints out the three floating bubbles in it, and keeps only the luminance
high-pass (the white glossy streaks and ripples, sigma 0.12 u). The floor shader adds it, repeated in world
coordinates (plain repeat, seamless), only where the moving camera magnifies the projection; at the approved viewpoint its weight is 0.

  python3 -I tools/match08/near08.py <proj08.json> <plate08_hybrid.png> <out.png> <out.json>
"""
import json
import sys

import cv2
import numpy as np

proj_p, plate_p, out_p, outj_p = sys.argv[1:5]
L = json.load(open(proj_p))
M = np.array(L['camera']['matrixWorld'], float).reshape(4, 4).T
P, R = M[:3, 3], M[:3, :3]
W, H = L['camera']['size']
th = np.tan(np.radians(L['camera']['fov']) / 2)
asp = W / H
FY = L['floorY']
plate = cv2.imread(plate_p).astype(np.float32) / 255.0  # BGR
PH, PW = plate.shape[:2]
sc = PW / W


def to_px(p):
    v = R.T @ (p - P)
    return np.array([(v[0] / -v[2] / (th * asp) + 1) / 2 * W, (1 - v[1] / -v[2] / th) / 2 * H])


def floor_at(x, y):
    nx, ny = (x + 0.5) / W * 2 - 1, 1 - (y + 0.5) / H * 2
    d = R @ np.array([nx * th * asp, ny * th, -1.0])
    return P + (FY - P[1]) / d[1] * d


# the crisp band: floor seen at rows 1245..1530 between the foam banks (approved picture: left bank from (250,1210) to
# (90,1530), right bank from (620,1210) to (780,1530), each inset ~40 px). Rectangle in world inside that trapezoid.
far_l, far_r = floor_at(235 + 40, 1245), floor_at(640 - 40, 1245)
near_l, near_r = floor_at(90 + 60, 1530), floor_at(780 - 60, 1530)
x0, x1 = max(far_l[0], near_l[0]), min(far_r[0], near_r[0])
z0, z1 = far_l[2], near_l[2]  # z0 (far, more negative) < z1 (near)
TPU = 200
nx, nz = int(round((x1 - x0) * TPU)), int(round((z1 - z0) * TPU))
xs = x0 + (np.arange(nx) + 0.5) / TPU
zs = z0 + (np.arange(nz) + 0.5) / TPU
X, Z = np.meshgrid(xs, zs)
pts = np.stack([X, np.full_like(X, FY), Z], -1).reshape(-1, 3)
v = (pts - P) @ R
u = (v[:, 0] / -v[:, 2] / (th * asp) + 1) / 2 * W * sc
w = (1 - v[:, 1] / -v[:, 2] / th) / 2 * H * sc
mapx, mapy = u.reshape(nz, nx).astype(np.float32), w.reshape(nz, nx).astype(np.float32)
tile = cv2.remap(plate, mapx, mapy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
lum = (tile @ np.array([0.114, 0.587, 0.299], np.float32))  # BGR weights

# floating bubbles in the band (approved px, radius px): painted out before the high-pass (they would repeat)
mask = np.zeros((nz, nx), np.uint8)
for (bx, by, br) in [(260, 1425, 32), (318, 1452, 14), (600, 1283, 24)]:
    d = np.hypot(mapx / sc - bx, mapy / sc - by)
    mask |= (d < br + 6).astype(np.uint8)
lum8 = np.clip(lum * 255, 0, 255).astype(np.uint8)
lum = cv2.inpaint(lum8, mask * 255, 9, cv2.INPAINT_TELEA).astype(np.float32) / 255.0

sig = 0.12 * TPU
hp = lum - cv2.GaussianBlur(lum, (0, 0), sig)
# seamless for PLAIN repeat (a mirrored repeat showed kaleidoscope diamonds): cross-fade with a copy shifted by half a
# tile in both directions; the edges then carry the tile's own interior, continuous across the wrap
sh = np.roll(np.roll(hp, nz // 2, 0), nx // 2, 1)
ry = np.minimum(np.arange(nz), np.arange(nz)[::-1]) / (nz / 2)
rx = np.minimum(np.arange(nx), np.arange(nx)[::-1]) / (nx / 2)
wgt = np.clip(np.minimum(ry[:, None], rx[None, :]) / 0.35, 0, 1)
wgt = wgt * wgt * (3 - 2 * wgt)
hp = wgt * hp + (1 - wgt) * sh
out = np.clip(0.5 + hp, 0, 1)
# store with z running along image rows (row 0 = z0, far), x along columns
cv2.imwrite(out_p, (out * 255 + 0.5).astype(np.uint8))
json.dump({'x0': float(x0), 'z0': float(z0), 'w': float(x1 - x0), 'l': float(z1 - z0), 'tpu': TPU,
           'sigma_u': 0.12, 'src_rows': [1245, 1530], 'bubbles_painted_out': 3,
           'hp_std': float(hp.std()), 'size': [nx, nz]}, open(outj_p, 'w'), indent=1)
print('tile', nx, 'x', nz, 'world x', round(x0, 2), round(x1, 2), 'z', round(z0, 2), round(z1, 2), 'hp std', round(float(hp.std()), 4))
