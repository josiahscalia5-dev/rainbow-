"""Screen 08 r12 (`&m08ring=1`): periodic slot-ring tile for the door wall / drum continuation (m08ceil / m08drum).

m08ceil continues the painted end wall around the door by radius, taking the user's pixels from a clean window of the
painted wall beside the door (angle 187-217 deg, radius 7.25-8.1 u around the painted door centre on the door plane) and
MIRRORING that window in angle (12x around) and in radius (outward). The painted slot rows are slightly slanted against
the door centre, so every mirror line drew a V: kaleidoscope chevrons / diamonds in the slot rows (top right while
swimming). This unrolls the same window (user's own pixels, angle x radius) and makes it PERIODIC instead of mirrored:
the last OV part of each direction is cross-faded into the start, so it repeats without a mirror line. Period in angle =
24 deg (= 15 whole repeats around, no seam at the atan wrap), in radius = 0.8 x 0.85 u.
usage: python3 -I tools/match08/ring08.py <outPng> <outJson>
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
CX, CY, ZD = 11.952, -103.725, L['chamber']['zDoor']   # painted door centre on the door plane (= m08ceil uCeil)
A0, AW, R0, R1 = 187.0, 30.0, 7.25, 8.1                 # = m08ceil window (uCeilW defaults)
NA, NR, OVF = 640, 160, 0.2
A = np.radians(A0 + AW * (np.arange(NA) + 0.5) / NA); R = R0 + (R1 - R0) * (np.arange(NR) + 0.5) / NR
AA, RR = np.meshgrid(A, R)
P = np.stack([CX + RR * np.cos(AA), CY + RR * np.sin(AA), np.full_like(AA, ZD), np.ones_like(AA)], -1)
h = P @ V.T; x, y, z = h[..., 0], h[..., 1], -h[..., 2]
px = ((x * f / asp / z * 0.5 + 0.5) * Wp).astype(np.float32); py = ((0.5 - y * f / z * 0.5) * Hp).astype(np.float32)
t = cv2.remap(plate, px, py, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)   # rows = radius (inner -> outer)


def periodic(img, axis):
    n = img.shape[axis]; ov = int(round(n * OVF)); p = n - ov
    img = np.moveaxis(img, axis, 0)
    per = img[:p].copy(); w = (np.arange(ov) / ov).reshape((-1,) + (1,) * (img.ndim - 1))
    per[:ov] = (1 - w) * img[p:p + ov] + w * img[:ov]
    return np.moveaxis(per, 0, axis), p / n


t, fa = periodic(t, 1)
t, fr = periodic(t, 0)
Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)).save(out_png)
json.dump({'note': 'm08ring periodic tile (u = angle from a0 / period, v = radius from r0 / period); tools/match08/ring08.py (r12)',
           'a0Deg': A0, 'aPeriodDeg': AW * fa, 'r0': R0, 'rPeriod': (R1 - R0) * fr, 'size': [t.shape[1], t.shape[0]]},
          open(out_json, 'w'), indent=1)
print('angle period', AW * fa, 'deg (repeats', 360 / (AW * fa), ') radius period', (R1 - R0) * fr)
