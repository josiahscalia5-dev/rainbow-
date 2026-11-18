#!/usr/bin/env python3
"""Screen 08 scenery r8 (`&m08occ=1`): occlusion plate for the chamber's door wall.

The door wall behind the towel and the platform is hidden from the approved viewpoint, so a moving camera used to see a
fallback tile there with straight rectangular edges (the seam around the towel / window). This makes a plate the size of
plate08_hybrid.png where the towel + platform (as seen from the approved viewpoint) are inpainted from the surrounding
door / window / wall pixels of the user's picture. Alpha = where the inpainted pixels may be used (the occluder mask,
dilated and feathered); everywhere else alpha 0, so the shader keeps its old fallback.

Mask source: frozen `scripts/capture.mjs 08 --q=...&m08dbg=1` (every proxy in a flat colour; order = add() order in
src/world/match08.ts: towel #008040, platform top #ffffff, rim #ff8000, legs #8000ff).
  python3 -I tools/match08/occ08.py <dbg_capture.png> <plate.png> <out.png>
"""
import sys
import cv2
import numpy as np

dbg_p, plate_p, out_p = sys.argv[1:4]
dbg = cv2.cvtColor(cv2.imread(dbg_p), cv2.COLOR_BGR2RGB).astype(np.int32)
plate = cv2.imread(plate_p)  # BGR, 1536 x 2731
H, W = plate.shape[:2]

pal = {'towel': (0, 128, 64), 'top': (255, 255, 255), 'rim': (255, 128, 0), 'legs': (128, 0, 255)}
m = np.zeros(dbg.shape[:2], np.uint8)
for c in pal.values():
    m |= (np.abs(dbg - np.array(c)).max(2) < 40).astype(np.uint8)
# keep only the platform / towel area (white also occurs in HUD text and splash): the chamber's centre band
ys, xs = np.mgrid[0:dbg.shape[0], 0:dbg.shape[1]]
m &= ((ys > 420) & (ys < 700) & (xs > 230) & (xs < 730)).astype(np.uint8)
# coins drawn over the legs left holes: close them
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
m = cv2.resize(m * 255, (W, H), interpolation=cv2.INTER_NEAREST)
grow = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))

# column-wise mirror fill: a hidden pixel takes the pixel mirrored about its column's top mask edge (the door / window /
# wall painted just above the occluder carry on downward), filled top to bottom so deep holes reuse filled rows; then a
# light horizontal smoothing inside the hole to hide column steps
fill = plate.astype(np.float32).copy()
hole = grow > 0
for x in np.nonzero(hole.any(0))[0]:
    col = hole[:, x]
    y = 0
    while y < H:
        if not col[y]:
            y += 1; continue
        y0 = y
        while y < H and col[y]:
            src = 2 * y0 - y - 1
            fill[y, x] = fill[max(src, 0), x]
            y += 1
sm = cv2.GaussianBlur(fill, (0, 0), sigmaX=3, sigmaY=0.5)
fill = np.where(hole[..., None], sm, plate.astype(np.float32)).clip(0, 255).astype(np.uint8)

alpha = cv2.GaussianBlur(cv2.dilate(grow, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))), (0, 0), 6)
out = np.dstack([fill, alpha])
cv2.imwrite(out_p, out)
print('mask px', int((grow > 0).sum()), 'of', W * H, '->', out_p)
