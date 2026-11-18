"""Screen 08 r12 (`&m08floor=1`, TRIED, NOT KEPT - see qa/match/08/r12/PROGRESS.md): floor tile from the painted hole grid.

The floor proxy's parts the approved view could not see (in the shadow of the lower spout cups and their streams, beside the
river further in) fell back to the triplanar wall patch (long diagonal slots) with hard straight edges against the painted
floor (rows of round dark holes) — a visible patch behind the lower-left cup at forward 10 u / two-thirds through and right
of the river when steering hard right. This unrolls the cleanest piece of the user's painted floor (right of the river,
between the platform-leg stream and the upper bubble: x 13.35.., z -289.15..) onto the floor plane, measures the hole grid's
period (autocorrelation, across x and along z), averages every whole period of the window into ONE cell (the holes stay,
stray highlights / stream pixels average out) and writes it as a repeating tile (period in world units in the json).
usage: python3 -I tools/match08/floor08.py <outPng> <outJson>
"""
import json, math, sys
import cv2
import numpy as np
from PIL import Image

out_png, out_json = sys.argv[1:3]
L = json.load(open('assets/textures/match08/proj08.json'))
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
Hp, Wp = plate.shape[:2]
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
V = np.linalg.inv(M); W, H = L['camera']['size']; f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
FY = L['floorY']
PPU = 400


def unroll(x0, x1, z0, z1):
    nx, nz = int(round((x1 - x0) * PPU)), int(round((z0 - z1) * PPU))
    X, Z = np.meshgrid(x0 + (np.arange(nx) + 0.5) / PPU, z0 - (np.arange(nz) + 0.5) / PPU)
    P = np.stack([X, np.full_like(X, FY), Z, np.ones_like(X)], -1)
    h = P @ V.T; x, y, z = h[..., 0], h[..., 1], -h[..., 2]
    px = ((x * f / asp / z * 0.5 + 0.5) * Wp).astype(np.float32); py = ((0.5 - y * f / z * 0.5) * Hp).astype(np.float32)
    return cv2.remap(plate, px, py, cv2.INTER_CUBIC)


# 1) period of the hole grid on a slightly larger window
X0, Z0 = 13.35, -289.15
big = unroll(X0, 14.7, Z0, -291.4)
g = big.mean(2); g -= g.mean()
F = np.fft.fft2(g); ac = np.real(np.fft.ifft2(F * np.conj(F))); ac /= ac[0, 0]


def first_peak(a, lo, hi):
    i = lo + int(np.argmax(a[lo:hi]))
    d = (a[i - 1] - a[i + 1]) / (2 * (a[i - 1] - 2 * a[i] + a[i + 1]))  # parabolic sub-pixel
    return (i + d) / PPU


px_ = first_peak(ac[0], int(0.3 * PPU), int(0.45 * PPU))
pz_ = first_peak(ac[:, 0], int(0.8 * PPU), int(1.05 * PPU))
print('hole grid period across x %.4f u, along z %.4f u' % (px_, pz_))
# 2) average every whole period of the window (3 across x 2 along z) into one cell
NX, NZ = 3, 2
win = unroll(X0, X0 + NX * px_, Z0, Z0 - NZ * pz_)
cw, ch = win.shape[1] / NX, win.shape[0] / NZ
CW, CH = int(round(cw)), int(round(ch))
cells = []
for j in range(NZ):
    for i in range(NX):
        Mx = np.float32([[1, 0, i * cw], [0, 1, j * ch]])
        cells.append(cv2.warpAffine(win, Mx, (CW, CH), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT))
cell = np.median(np.stack(cells), 0)
Image.fromarray(np.clip(cell, 0, 255).astype(np.uint8)).save(out_png)
json.dump({'note': 'm08floor hole-grid cell (u along +x, v along -z), repeat; tools/match08/floor08.py (r12)',
           'x0': X0, 'z0': Z0, 'periodX': float(px_), 'periodZ': float(pz_), 'size': [CW, CH]}, open(out_json, 'w'), indent=1)
print('cell', CW, 'x', CH, 'px')
