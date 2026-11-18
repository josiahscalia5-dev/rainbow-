#!/usr/bin/env python3
"""r16 `&m07nearw=1`: near-water tiles cut from the user's APPROVED Screen 07 picture at its painted NEAR scale.

(Round-15 draft: tools/match07/near_tiles_r15.py — its hand-read curve left only 132 usable rows and ran into the gold ring
and a big bubble. This version finds the band edge from the picture itself.)

Why: on the level stretch the moving camera sees the near water through `tile_river_clean.png` = the painted 6-16 u river
unwrapped over the whole tube floor (lateral -5..5, mirrored): magnified ~4-10x it reads as long flat pink/cyan smears and
the tube-wall perforations painted beside the far river lie on the water near the walls.

Output (reads only references/07_dive_the_washer_tube.png, never changes it):
* near_bank.png  — the lower-left painted magenta satin band + its bubbly white trim + the glossy cyan water beside it,
                   straightened along the band's inner edge (curve unwrap), periodic along the flow (cross-faded seam).
                   Column 0 = outer edge of the magenta band ... last column = cyan toward the river centre.
                   The shader mirrors it about a winding river centre line: [magenta | trim | cyan | cyan | trim | magenta].
* near_foam.png  — the painted lower-right foam clouds, periodic both ways, for the banks between the magenta band and
                   the tube wall.
* near07.json    — sizes + the measured edge curve.
"""
import json
import numpy as np
import cv2
from PIL import Image

REF = 'references/07_dive_the_washer_tube.png'
OUT = 'assets/textures/match07/'
SCR = '/tmp/claude-0/'
rgb = np.asarray(Image.open(REF).convert('RGB'))
im = rgb.astype(np.float32)
H, W = im.shape[:2]
hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.int32)
hh, ss, vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
MAG = (hh >= 138) & (hh <= 172) & (ss > 100) & (vv > 120)

# ---- 1. inner edge of the lower-left magenta band, measured per row (end of the magenta run that starts at the left) ----
Y0, Y1 = 1262, 1490          # above: the cyan side runs into Benny's splash + a bubble on the edge; below: the band leaves the frame
CYW = (((hh >= 85) & (hh <= 108) & (ss > 80) & (vv > 110)) | ((ss < 70) & (vv > 190)))
pts = []
for y in range(Y0, Y1 + 1, 2):
    # the inner edge = where the first long run (>= 24 px) of cyan / white trim begins, scanning from the left
    c = CYW[y, :640].astype(np.int32)
    run = np.convolve(c, np.ones(24, np.int32), 'valid')
    xs = np.where(run >= 22)[0]
    if not len(xs):
        continue
    x = int(xs[0])
    if MAG[y, max(0, x - 30):x].mean() > 0.4:   # magenta right before it (the band, not a bubble or the frame edge)
        pts.append((x - 2, y))
pts = np.array(pts, np.float32)
# the big iridescent bubble sitting on the band (picture px) is painted over from the band around it before the unwrap
bm0 = np.zeros((H, W), np.uint8)
cv2.circle(bm0, (135, 1433), 36, 255, -1)
rgb_ip = cv2.inpaint(rgb, bm0, 11, cv2.INPAINT_TELEA)
im = rgb_ip.astype(np.float32)
# smooth: x(y) quadratic least squares (the band edge is a gentle curve)
YC, YS = 0.5 * (Y0 + Y1), 0.5 * (Y1 - Y0)       # normalised y for a well-conditioned fit
keep = np.ones(len(pts), bool)
for _ in range(4):                               # robust: drop bubble / trim-gap outliers, refit
    cfn = np.polyfit((pts[keep, 1] - YC) / YS, pts[keep, 0], 4)
    res = np.abs(np.polyval(cfn, (pts[:, 1] - YC) / YS) - pts[:, 0])
    keep = res < max(10.0, 2.0 * np.median(res))
cf = np.polyfit(pts[keep, 1], pts[keep, 0], 4) if False else None
xfit = lambda y: np.polyval(cfn, (np.asarray(y) - YC) / YS)
print('edge points kept', int(keep.sum()), 'of', len(pts))
print('edge fit rms px (kept)', round(float(np.sqrt(np.mean((xfit(pts[keep, 1]) - pts[keep, 0]) ** 2))), 1))
yy = np.arange(Y0, Y1 + 1, 0.25)
xx = xfit(yy)
D = np.stack([xx, yy], 1)
seg = np.linalg.norm(np.diff(D, axis=0), axis=1)
arc = np.concatenate([[0], np.cumsum(seg)])
Ls = arc[-1]
sA = np.arange(0, Ls, 1.0)
cx = np.interp(sA, arc, D[:, 0]); cy = np.interp(sA, arc, D[:, 1])
tx = np.gradient(cx); ty = np.gradient(cy); tn = np.hypot(tx, ty); tx /= tn; ty /= tn
nx, ny = -ty, tx                                     # tangent points down(-right); this normal points right (cyan side)
if np.mean(nx) < 0:
    nx, ny = -nx, -ny
T_OUT, T_IN = 92, 176                                # px into the magenta band / across the trim into the cyan water
tt = np.arange(-T_OUT, T_IN, 1.0)
X = cx[:, None] + nx[:, None] * tt[None, :]
Y = cy[:, None] + ny[:, None] * tt[None, :]
out_frac = float(((X < 0) | (X > W - 1) | (Y < 0) | (Y > H - 1)).mean())
bank = cv2.remap(im, X.astype(np.float32), Y.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
print('edge points', len(pts), 'arc px', round(Ls, 1), 'strip', bank.shape, 'outside frame share', round(out_frac, 4))

# big iridescent bubbles on the magenta band (non-magenta blobs inside the band columns) -> inpaint; the small trim bubbles stay
b8 = np.clip(bank, 0, 255).astype(np.uint8)
bh = cv2.cvtColor(b8, cv2.COLOR_RGB2HSV).astype(np.int32)
bm = (bh[..., 0] >= 136) & (bh[..., 0] <= 174) & (bh[..., 1] > 90)
mask = np.zeros(b8.shape[:2], np.uint8)
band_cols = slice(0, T_OUT - 14)
mask[:, band_cols] = (~bm[:, band_cols]).astype(np.uint8) * 255
mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
print('inpaint share of band', round(float((mask[:, band_cols] > 0).mean()), 3))
if mask.any():
    b8 = cv2.inpaint(b8, mask, 7, cv2.INPAINT_TELEA)
bank = b8.astype(np.float32)


def seam_v(strip, overlap):
    """periodic along rows: the first `overlap` rows cross-fade with the rows just past the period"""
    n = strip.shape[0] - overlap
    out = strip[:n].copy()
    w = (0.5 - 0.5 * np.cos(np.linspace(0, np.pi, overlap)))[:, None, None]
    out[:overlap] = strip[n:n + overlap] * (1 - w) + strip[:overlap] * w
    return out


def seam_h(tile, overlap):
    return np.transpose(seam_v(np.transpose(tile, (1, 0, 2)), overlap), (1, 0, 2))


OV = 48
bank_t = seam_v(bank, OV)
Image.fromarray(np.clip(bank_t, 0, 255).astype(np.uint8)).save(OUT + 'near_bank.png')
print('near_bank.png', bank_t.shape)

# ---- 2. foam clouds (lower right, between the cyan water / bubbles and the gold ring), periodic both ways ----
fx0, fy0, fx1, fy1 = 724, 1204, 862, 1376      # the big puffy clouds right of the bubbles (gold-ring corner inpainted)
foam = im[fy0:fy1, fx0:fx1].copy()
f8 = np.clip(foam, 0, 255).astype(np.uint8)
fh = cv2.cvtColor(f8, cv2.COLOR_RGB2HSV).astype(np.int32)
# keep only the soft lavender-white cloud pixels: the gold ring corner / magenta / cyan bits are inpainted from the clouds
bad = ((fh[..., 1] > 120) | (fh[..., 2] < 140)).astype(np.uint8) * 255
bad = cv2.dilate(bad, np.ones((5, 5), np.uint8))
print('foam inpaint share', round(float((bad > 0).mean()), 3))
if bad.any():
    f8 = cv2.inpaint(f8, bad, 9, cv2.INPAINT_TELEA)
foam_t = seam_h(seam_v(f8.astype(np.float32), 28), 24)
Image.fromarray(np.clip(foam_t, 0, 255).astype(np.uint8)).save(OUT + 'near_foam.png')
print('near_foam.png', foam_t.shape)
json.dump({'note': 'r16 m07nearw near-water tiles (tools/match07/near_tiles_r16.py)',
           'bank': {'edge_poly_x_of_ynorm': cfn.tolist(), 'ynorm': [YC, YS], 'rows_y': [Y0, Y1], 't_out': T_OUT, 't_in': T_IN, 'overlap': OV,
                    'size': list(bank_t.shape[:2]), 'magenta_cols': T_OUT},
           'foam': {'rect': [fx0, fy0, fx1, fy1], 'size': list(foam_t.shape[:2])}},
          open(OUT + 'near07.json', 'w'), indent=1)
