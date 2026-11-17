"""Screen 08 scenery fill (2026-11-17, qa/match/08/scenery/NOTES.md): unroll the chamber drum wall as the approved
plate shows it (angle x depth along the drum) to measure the slot pattern and pick a world-anchored fill tile.
usage: python3 -I tools/match08/unwrap08.py <outDir>"""
import json, math, sys, numpy as np
from PIL import Image
out = sys.argv[1]
L = json.load(open('assets/textures/match08/proj08.json'))
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
Hp, Wp = plate.shape[:2]
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T  # three.js column-major
V = np.linalg.inv(M); W, H = L['camera']['size']; f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
C, A = L['chamber'], L['arch']
def project(p):  # p: (...,3) world -> plate px, depth
    h = np.concatenate([p, np.ones(p.shape[:-1] + (1,))], -1) @ V.T
    x, y, z = h[..., 0], h[..., 1], -h[..., 2]
    return (x * f / asp / z * 0.5 + 0.5) * Wp, (0.5 - y * f / z * 0.5) * Hp, z
cam = M[:3, 3]
# arch opening in the plate (inner circle at the arch front)
ang = np.linspace(0, 2 * np.pi, 360)
ring = np.stack([A['inner']['cx'] + A['inner']['r'] * np.cos(ang), A['inner']['cy'] + A['inner']['r'] * np.sin(ang), np.full_like(ang, A['z'])], -1)
rx, ry, _ = project(ring)
from PIL import ImageDraw
om = Image.new('L', (Wp, Hp), 0); ImageDraw.Draw(om).polygon(list(zip(rx.tolist(), ry.tolist())), fill=255)
om = np.asarray(om) > 0
NT, NZ, Z0, Z1 = 1440, 900, A['z'] - A['depth'], C['zDoor']   # 1440 angle cells (~5.9 cm), z cells 5.6 cm
th = np.linspace(-np.pi, np.pi, NT, endpoint=False); zz = np.linspace(Z0, Z1, NZ)
T, Z = np.meshgrid(th, zz)
P = np.stack([C['cx'] + C['r'] * np.cos(T), C['cy'] + C['r'] * np.sin(T), Z], -1)
px, py, dz = project(P)
ok = (dz > 0) & (px >= 0) & (px < Wp - 1) & (py >= 0) & (py < Hp - 1)
ok &= om[np.clip(py, 0, Hp - 1).astype(int), np.clip(px, 0, Wp - 1).astype(int)]
ok &= P[..., 1] > L['floorY'] + 0.3   # above the water
img = np.zeros(P.shape[:2] + (3,), np.float32)
xi, yi = np.clip(px, 0, Wp - 1).astype(int), np.clip(py, 0, Hp - 1).astype(int)
img[ok] = plate[yi[ok], xi[ok]]
Image.fromarray(img.astype(np.uint8)).save(f'{out}/drum_unrolled.png')
Image.fromarray((ok * 255).astype(np.uint8)).save(f'{out}/drum_visible.png')
# source density: plate pixels per drum cell (how sharp the picture is there)
print('visible cells', int(ok.sum()), 'of', ok.size, 'angle range (deg)', np.degrees(th[ok.any(0)]).min(), np.degrees(th[ok.any(0)]).max())
# --- the near inlet pipe (crisp slots in the picture's outer frame): unrolled at 1 cell = 1 cm of wall
Pp = L['pipe']; NTp = int(2 * math.pi * Pp['r'] / 0.01); NZp = int((Pp['z0'] - Pp['z1']) / 0.01)
thp = np.linspace(-np.pi, np.pi, NTp, endpoint=False); zp = np.linspace(Pp['z0'], Pp['z1'], NZp)
T, Z = np.meshgrid(thp, zp)
P = np.stack([Pp['cx'] + Pp['r'] * np.cos(T), Pp['cy'] + Pp['r'] * np.sin(T), Z], -1)
px, py, dz = project(P)
ok = (dz > 0.3) & (px >= 0) & (px < Wp - 1) & (py >= 0) & (py < Hp - 1) & (~om[np.clip(py, 0, Hp - 1).astype(int), np.clip(px, 0, Wp - 1).astype(int)])
img = np.zeros(P.shape[:2] + (3,), np.float32)
xi, yi = np.clip(px, 0, Wp - 1).astype(int), np.clip(py, 0, Hp - 1).astype(int)
img[ok] = plate[yi[ok], xi[ok]]
Image.fromarray(img.astype(np.uint8)).save(f'{out}/pipe_unrolled.png')
print('pipe cells', img.shape, 'visible', int(ok.sum()))
# --- fill tile (m08fill): 3 slot rows (z period 0.49 u, autocorrelation) x 3 u of the right pipe wall, wrap edges
# feathered with the picture's own continuation, colours matched to the visible chamber wall (gold excluded)
PZ, R0, C0, TW, FE = 49, 1268, 1236, 219, 40
src = img  # pipe_unrolled, 1 cm cells
t = src[R0:R0 + 3 * PZ + 24, C0:C0 + TW + FE].copy()
assert (t.max(2) > 0).mean() > 0.995, 'tile leaves the visible pipe area'
w = np.linspace(0, 1, FE)[None, :, None]
t[:, :FE] = t[:, :FE] * w + t[:, TW:TW + FE] * (1 - w)
t = t[:, :TW]
FV = 24
w = np.linspace(0, 1, FV)[:, None, None]
t[:FV] = t[:FV] * w + t[3 * PZ:3 * PZ + FV] * (1 - w)
t = t[:3 * PZ]
drum = np.asarray(Image.open(f'{out}/drum_unrolled.png').convert('RGB')).astype(np.float32)
vis = np.asarray(Image.open(f'{out}/drum_visible.png')) > 0
d = drum[vis]; gold = (d[:, 0] > d[:, 2] * 1.25) & (d[:, 1] > 90)
d = d[~gold]
ts = t.reshape(-1, 3)
t = (t - ts.mean(0)) / ts.std(0) * d.std(0) + d.mean(0)
Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)).save('assets/textures/match08/fill_drum.png')
json.dump({'w': TW / 100, 'h': 3 * PZ / 100, 'src': 'pipe right wall, plate08_hybrid.png, tools/match08/unwrap08.py'}, open('assets/textures/match08/fill_drum.json', 'w'))
print('tile', t.shape, 'chamber wall mean', d.mean(0).round(1), 'std', d.std(0).round(1), 'gold px excluded', int(gold.sum()))
