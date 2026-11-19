#!/usr/bin/env python3
"""r15 (account 15) `&m07nearw=1`: near-water tiles cut from the user's APPROVED Screen 07 picture at its painted near scale.

The level stretch's near water used `tile_river_clean.png` = the painted 6-16 u river unwrapped on the flat water plane:
seen from the moving camera (3-8 u away, steeper than the approved view) it is magnified ~4x along the flow -> long flat
pink/cyan smears. These tiles come from the NEAREST painted water (bottom of the picture, least magnified):

* near_bank.png   — the lower-left painted magenta satin band + its foam/bubble trim + the cyan water beside it,
                    straightened along the band's inner edge (curve unwrap), seamless along the flow (overlap cross-fade).
                    Columns: 0 = outer edge of the magenta band ... right = cyan river.  The shader mirrors it about the
                    river centre line, so the river reads [magenta | trim | cyan | cyan | trim | magenta] as painted.
* near_foam.png   — the painted lower-right foam clouds, seamless both ways, for the banks between the magenta band and
                    the tube wall (and the lowest wall band).
Reads only references/07_dive_the_washer_tube.png (unchanged). Writes assets/textures/match07/near_*.png + a json.
"""
import json, sys
import numpy as np
import cv2
from PIL import Image

REF = 'references/07_dive_the_washer_tube.png'
OUT = 'assets/textures/match07/'
im = np.asarray(Image.open(REF).convert('RGB')).astype(np.float32)
H, W = im.shape[:2]


def bilinear(img, x, y):
    return cv2.remap(img, x.astype(np.float32), y.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


def seam_v(strip, overlap):
    """make a strip periodic along rows: rows [0, n) where the first `overlap` rows blend with rows [n, n+overlap)"""
    n = strip.shape[0] - overlap
    out = strip[:n].copy()
    w = (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, overlap)))[:, None, None]  # 0 -> 1
    out[:overlap] = strip[n:n + overlap] * (1 - w) + strip[:overlap] * w
    return out


def seam_h(tile, overlap):
    return np.transpose(seam_v(np.transpose(tile, (1, 0, 2)), overlap), (1, 0, 2))


# ---- 1. magenta band + trim + cyan: curve unwrap along the band's inner edge (abs picture px, read by eye) ----
# inner edge of the lower-left magenta band (magenta -> bubbly white trim -> cyan), from the upper left down to the bottom
C = np.array([(14, 1238), (60, 1268), (110, 1305), (160, 1345), (205, 1378), (250, 1412), (300, 1444), (350, 1474),
              (400, 1503), (450, 1532)], np.float32)
# dense arc-length resampling of a smooth (Catmull-Rom) curve
def catmull(P, n=40):
    pts = []
    P = np.vstack([P[0] * 2 - P[1], P, P[-1] * 2 - P[-2]])
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            pts.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    pts.append(P[-2])
    return np.array(pts)
D = catmull(C)
seg = np.linalg.norm(np.diff(D, axis=0), axis=1)
arc = np.concatenate([[0], np.cumsum(seg)])
L = arc[-1]
ss = np.arange(0, L, 1.0)
cx = np.interp(ss, arc, D[:, 0]); cy = np.interp(ss, arc, D[:, 1])
tx = np.gradient(cx); ty = np.gradient(cy); tn = np.hypot(tx, ty); tx /= tn; ty /= tn
nx, ny = ty, -tx                                   # normal toward the cyan side (up-right)
T_OUT, T_IN = 150, 190                             # px into the magenta band / into the cyan river
tt = np.arange(-T_OUT, T_IN, 1.0)
X = cx[:, None] + nx[:, None] * tt[None, :]
Y = cy[:, None] + ny[:, None] * tt[None, :]
valid = (X >= 0) & (X < W - 1) & (Y >= 0) & (Y < H - 1)
bank = bilinear(im, X, Y)
print('bank strip', bank.shape, 'arc', round(L, 1), 'valid share', round(valid.mean(), 3))
# rows where the outward side leaves the frame: keep only rows whose whole cross-section lies inside the picture
rows_ok = valid.all(axis=1)
print('rows fully inside', rows_ok.sum(), 'of', len(rows_ok))
r0 = int(np.argmax(rows_ok)); r1 = len(rows_ok) - int(np.argmax(rows_ok[::-1]))
bank = bank[r0:r1]
# remove the big iridescent bubble sitting on the magenta band (inpaint), keep the small trim bubbles
b8 = np.clip(bank, 0, 255).astype(np.uint8)
hsv = cv2.cvtColor(b8, cv2.COLOR_RGB2HSV).astype(np.float32)
np.save('/dev/null', hsv) if False else None
mask = np.zeros(b8.shape[:2], np.uint8)
for (bx, by, br) in json.loads(sys.argv[1]) if len(sys.argv) > 1 else []:
    cv2.circle(mask, (int(bx), int(by)), int(br), 255, -1)
if mask.any():
    b8 = cv2.inpaint(b8, mask, 9, cv2.INPAINT_TELEA)
bank = b8.astype(np.float32)
Image.fromarray(np.clip(bank, 0, 255).astype(np.uint8)).save('/tmp/claude-0/near_bank_raw.png')
OV = 70
bank_t = seam_v(bank, OV)
Image.fromarray(np.clip(bank_t, 0, 255).astype(np.uint8)).save(OUT + 'near_bank.png')
print('near_bank.png', bank_t.shape)

# ---- 2. foam clouds (lower right), seamless both ways ----
fx0, fy0, fx1, fy1 = 676, 1212, 806, 1432
foam = im[fy0:fy1, fx0:fx1].copy()
f8 = np.clip(foam, 0, 255).astype(np.uint8)
fm = np.zeros(f8.shape[:2], np.uint8)
for (bx, by, br) in [(700 - fx0, 1290 - fy0, 0)]:
    pass
foam_t = seam_h(seam_v(foam, 40), 30)
Image.fromarray(np.clip(foam_t, 0, 255).astype(np.uint8)).save(OUT + 'near_foam.png')
print('near_foam.png', foam_t.shape)
json.dump({'note': 'r15 m07nearw near-water tiles (tools/match07/near_tiles_r15.py)', 'bank': {'curve': C.tolist(), 't_out': T_OUT, 't_in': T_IN,
           'rows': [r0, r1], 'overlap': OV, 'size': list(bank_t.shape[:2])}, 'foam': {'rect': [fx0, fy0, fx1, fy1], 'size': list(foam_t.shape[:2])}},
          open(OUT + 'near07.json', 'w'), indent=1)
