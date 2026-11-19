#!/usr/bin/env python3
"""Screen 05 projection test — align the isolated water artwork to the approved frame (measured, not assumed).

    python3 -I tools/qa/proj05_align.py OUT_DIR

The isolated artwork (941x1672 RGBA) is first resized to 864x1536 (scale 864/941 = 0.91817 horizontally,
1536/1672 = 0.91866 vertically), then an affine refinement is solved with OpenCV ECC on edge-strength images of the
two pictures, inside the water area of the artwork alpha with Benny, the coins, the bubbles and the HUD excluded
(those cover the water in the approved image only). Writes OUT_DIR/align.json (the 2x3 matrix artwork px -> approved
px, the residual shift/scale versus the plain resize, the photometric residual before/after) and
OUT_DIR/artwork_aligned_864x1536.png (RGBA, the artwork warped into the approved frame — a derived file; the original
in references/water/ is never touched).
"""
import json, sys
import numpy as np
import cv2
from PIL import Image

OUT = sys.argv[1]
W, H = 864, 1536
art = np.asarray(Image.open('references/water/05_water_isolated_original.png').convert('RGBA')).astype(np.float32) / 255
ref = np.asarray(Image.open('references/05_flow_into_the_current.png').convert('RGB')).astype(np.float32) / 255
ah, aw = art.shape[:2]
S0 = np.array([[W / aw, 0, 0], [0, H / ah, 0]], np.float64)   # plain resize (pixel-corner convention)


def warp(img, M, interp=cv2.INTER_LINEAR):
    # cv2 uses pixel-centre coordinates: x' = M·[x, y, 1] for centres; convert the corner-convention matrix
    C = M.copy()
    C[:, 2] = M[:, 2] + 0.5 * (M[:, 0] + M[:, 1]) - 0.5
    return cv2.warpAffine(img, C, (W, H), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=0)


def edges(rgb):
    g = cv2.cvtColor((np.clip(rgb, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    g = cv2.GaussianBlur(g, (0, 0), 1.2)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    return np.sqrt(gx * gx + gy * gy)


# exclusion: Benny box, HUD, coin trail column, bubbles (bright low-saturation round blobs are hard to mask: the
# robust ECC on edges inside the water copes; the boxes below remove the big ones)
excl = np.zeros((H, W), bool)
excl[:200] = True                     # HUD
excl[760:1200, 225:620] = True        # Benny + splash
excl[480:780, 400:600] = True         # coin trail
for (x, y, r) in [(50, 705, 32), (95, 610, 25), (85, 910, 35), (95, 1250, 35), (720, 1205, 40), (795, 860, 35), (820, 700, 25),
                  (180, 670, 20), (180, 570, 18), (735, 575, 15), (660, 1360, 15), (800, 1245, 15), (135, 985, 15)]:
    yy, xx = np.ogrid[:H, :W]
    excl |= (xx - x) ** 2 + (yy - y) ** 2 < (r + 8) ** 2

a0 = warp(art, S0)
alpha0 = a0[..., 3] > 0.5
mask = (alpha0 & ~excl).astype(np.uint8)
Er = edges(ref)
Ea = edges(a0[..., :3] * a0[..., 3:4])


def photometric(M):
    a = warp(art, M)
    al = a[..., 3] > 0.98
    m = al & ~excl & (np.arange(H)[:, None] > 470)
    d = np.abs(a[..., :3] - ref)[m].mean()
    return float(d), int(m.sum())


warp_m = np.eye(2, 3, dtype=np.float32)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-7)
res = {}
for mode, name in [(cv2.MOTION_TRANSLATION, 'translation'), (cv2.MOTION_AFFINE, 'affine')]:
    wm = np.eye(2, 3, dtype=np.float32)
    # pyramid: coarse (blurred) then fine
    cc = None
    for blur in (6, 2, 0):
        R = cv2.GaussianBlur(Er, (0, 0), blur) if blur else Er
        A = cv2.GaussianBlur(Ea, (0, 0), blur) if blur else Ea
        cc, wm = cv2.findTransformECC(R, A, wm, mode, crit, mask, 5)
    # wm maps template(ref) coords -> input(a0) coords; the artwork->approved matrix = inverse(wm) ∘ S0
    Wm = np.vstack([wm.astype(np.float64), [0, 0, 1]])
    Minv = np.linalg.inv(Wm)
    M = (Minv @ np.vstack([S0, [0, 0, 1]]))[:2]
    res[name] = {'ecc': float(cc), 'M_artwork_to_approved': M.tolist(), 'refine_vs_resize': wm.tolist(), 'photometric_mean_abs': photometric(M)}

res['plain_resize'] = {'M_artwork_to_approved': S0.tolist(), 'photometric_mean_abs': photometric(S0)}
best = min(('plain_resize', 'translation', 'affine'), key=lambda k: res[k]['photometric_mean_abs'][0])
res['chosen'] = best
M = np.array(res[best]['M_artwork_to_approved'])
res['chosen_scale_xy'] = [float(np.hypot(M[0, 0], M[1, 0])), float(np.hypot(M[0, 1], M[1, 1]))]
res['chosen_shift_vs_resize_px'] = [float(M[0, 2] - S0[0, 2]), float(M[1, 2] - S0[1, 2])]
# corner displacement of the chosen warp vs the plain resize (approved px)
cor = np.array([[0, 0, 1], [aw, 0, 1], [0, ah, 1], [aw, ah, 1], [aw / 2, ah * 0.33, 1]], np.float64).T
res['chosen_corner_offsets_vs_resize_px'] = (M @ cor - S0 @ cor).T.round(2).tolist()
a = warp(art, M)
Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(f'{OUT}/artwork_aligned_864x1536.png')
json.dump(res, open(f'{OUT}/align.json', 'w'), indent=1)
print(json.dumps({k: (v['photometric_mean_abs'] if isinstance(v, dict) and 'photometric_mean_abs' in v else v) for k, v in res.items()}, indent=1))
