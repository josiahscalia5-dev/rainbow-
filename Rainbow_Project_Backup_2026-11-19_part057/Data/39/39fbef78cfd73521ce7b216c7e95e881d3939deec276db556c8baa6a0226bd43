"""Screen 08 r11 (`&m08ceil=1`) analysis: the painted chamber drum as a real inner drum surface.

The approved picture paints the chamber as a drum running from the gold arch's opening to a gold rib around the door.
The fitted proxies carried most of that painted wall on the flat door wall 57 u away, and everything behind the arch ring
(its projector shadow: the ceiling) fell back to a generic tile, which showed as a curved seam above the door while
swimming. This tool builds the inner drum (a frustum from the pushed arch's back inner edge to a circle around the
painted door rib on the door plane), unrolls the user's plate over it (angle x depth) and writes:
  <out>/ceil_unrolled.png   plate pixels on the drum, angle (x, deg from +x, counter-clockwise) x t (y, arch -> door)
  <out>/ceil_visible.png    where the approved viewpoint sees the drum (inside the arch opening and inside the frame)
  <out>/ceil08.json         frustum parameters for src/world/match08.ts
usage: python3 -I tools/match08/ceil08.py <outDir> [archK=4.2] [doorCx doorCy doorR (plate px of the 864x1536 frame)]
"""
import json, math, sys, numpy as np
from PIL import Image, ImageDraw

out = sys.argv[1]
K = float(sys.argv[2]) if len(sys.argv) > 2 else 4.2
DCX, DCY, DR = (float(v) for v in sys.argv[3:6]) if len(sys.argv) > 5 else (485.0, 412.0, 165.0)
L = json.load(open('assets/textures/match08/proj08.json'))
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
Hp, Wp = plate.shape[:2]
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
V = np.linalg.inv(M); W, H = L['camera']['size']; f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
VP = M[:3, 3]
C, A = L['chamber'], L['arch']


def project(p):  # world -> frame px (864 x 1536 units), depth
    h = np.concatenate([p, np.ones(p.shape[:-1] + (1,))], -1) @ V.T
    x, y, z = h[..., 0], h[..., 1], -h[..., 2]
    return (x * f / asp / z * 0.5 + 0.5) * W, (0.5 - y * f / z * 0.5) * H, z


def unproject_to_z(u, v, zw):  # frame px -> world point on the plane z = zw
    x = (u / W - 0.5) * 2 * asp / f; y = (0.5 - v / H) * 2 / f
    d = M[:3, :3] @ np.array([x, y, -1.0]); d /= np.linalg.norm(d)
    s = (zw - VP[2]) / d[2]
    return VP + s * d


# pushed arch: back inner edge (the chamber starts there)
zb = A['z'] - A['depth']
ca = VP + K * (np.array([A['inner']['cx'], A['inner']['cy'], zb]) - VP)
ra = K * A['inner']['r']
# door end: image circle around the painted door rib, back-projected onto the door plane
angs = np.linspace(0, 2 * np.pi, 72, endpoint=False)
pts = np.array([unproject_to_z(DCX + DR * math.cos(a), DCY + DR * math.sin(a), C['zDoor']) for a in angs])
cd = pts.mean(0); rd = float(np.linalg.norm(pts[:, :2] - cd[:2], axis=1).mean())
print('arch back inner centre', ca.round(3), 'r', round(ra, 3), '| door circle centre', cd.round(3), 'r', round(rd, 3))

# arch opening as the approved view sees it (back inner edge = the silhouette of the bore)
ring = np.stack([ca[0] + ra * np.cos(angs), ca[1] + ra * np.sin(angs), np.full_like(angs, ca[2])], -1)
rx, ry, _ = project(ring)
om = Image.new('L', (W, H), 0); ImageDraw.Draw(om).polygon(list(zip(rx.tolist(), ry.tolist())), fill=255)
om = np.asarray(om) > 0

NT, NTT = 1200, 600
th = np.radians(np.linspace(-90, 270, NT, endpoint=False)); tt = np.linspace(0, 1, NTT)
T, S = np.meshgrid(th, tt)
cx = ca[0] + (cd[0] - ca[0]) * S; cy = ca[1] + (cd[1] - ca[1]) * S; z = ca[2] + (C['zDoor'] - ca[2]) * S; r = ra + (rd - ra) * S
P = np.stack([cx + r * np.cos(T), cy + r * np.sin(T), z], -1)
px, py, dz = project(P)
inside = (dz > 0) & (px >= 0) & (px < W - 1) & (py >= 0) & (py < H - 1)
xi, yi = np.clip(px, 0, W - 1).astype(int), np.clip(py, 0, H - 1).astype(int)
vis = inside & om[yi, xi] & (P[..., 1] > L['floorY'])
img = np.zeros(P.shape[:2] + (3,), np.float32)
sx, sy = np.clip(px * Wp / W, 0, Wp - 1).astype(int), np.clip(py * Hp / H, 0, Hp - 1).astype(int)
img[inside] = plate[sy[inside], sx[inside]] * np.where(vis[inside], 1.0, 0.35)[:, None]
Image.fromarray(img.astype(np.uint8)).save(f'{out}/ceil_unrolled.png')
Image.fromarray((vis * 255).astype(np.uint8)).save(f'{out}/ceil_visible.png')
# outline of the frustum on the frame (for a by-eye check against the approved picture)
ov = Image.open('references/08_final_spin_chamber.png').convert('RGB'); d = ImageDraw.Draw(ov)
for tv in (0, 0.25, 0.5, 0.75, 1):
    q = np.stack([ca[0] + (cd[0] - ca[0]) * tv + (ra + (rd - ra) * tv) * np.cos(angs), ca[1] + (cd[1] - ca[1]) * tv + (ra + (rd - ra) * tv) * np.sin(angs), np.full_like(angs, ca[2] + (C['zDoor'] - ca[2]) * tv)], -1)
    qx, qy, _ = project(q); d.line(list(zip(qx.tolist(), qy.tolist())) + [(qx[0], qy[0])], fill=(0, 255, 0) if tv in (0, 1) else (255, 255, 0), width=2)
for a in np.radians(np.arange(-90, 270, 15)):
    q = np.stack([np.array([ca[0] + ra * math.cos(a), cd[0] + rd * math.cos(a)]), np.array([ca[1] + ra * math.sin(a), cd[1] + rd * math.sin(a)]), np.array([ca[2], C['zDoor']])], -1)
    qx, qy, _ = project(q); d.line(list(zip(qx.tolist(), qy.tolist())), fill=(0, 255, 255), width=1)
    d.text((float(qx[0]), float(qy[0])), str(int(round(math.degrees(a)))), fill=(255, 255, 255))
ov.save(f'{out}/ceil_overlay.png')
json.dump({'archK': K, 'a': [float(v) for v in ca], 'ra': ra, 'd': [float(cd[0]), float(cd[1]), C['zDoor']], 'rd': rd,
           'doorPx': [DCX, DCY, DR]}, open(f'{out}/ceil08.json', 'w'), indent=1)
