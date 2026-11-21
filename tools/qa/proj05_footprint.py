#!/usr/bin/env python3
"""Screen 05 projection test — FOOTPRINT of the game's river vs the isolated artwork (exact per-pixel maps).

    python3 -I tools/qa/proj05_footprint.py RAW_DIR OUT_DIR [ARTWORK_ALIGNED.png]

RAW_DIR = the float maps of scripts/proj05-probe.mjs (uv_river.f32 / uv_scene.f32 / uv_foam.f32), OUT_DIR gets
footprint.json + footprint_overlay.png. Masks (864x1536, locked 05 camera):
  G_scene  river surface (ribbon id 1/2, far block id 3) that is the first hit among the static environment
  G_river  the river surfaces alone (only the far wall occludes): where the river geometry projects at all
  F        the game's 3D foam in front of everything static (berm / rafts / rim / flank)
  A        artwork alpha > 0.5 (water + its painted foam banks), aligned to the approved frame (proj05_align.py)
  RING     pixels where the static environment hides river geometry (G_river & ~G_scene: front ring A, walls)
Rows are reported where A or G exist (y >= 440).
"""
import json, sys
import numpy as np
from PIL import Image

RAW, OUT = sys.argv[1], sys.argv[2]
ART = sys.argv[3] if len(sys.argv) > 3 else 'qa/pilot05/proj/align/artwork_aligned_864x1536.png'
W, H = 864, 1536
ld = lambda n: np.fromfile(f'{RAW}/{n}.f32', np.float32).reshape(H, W, 4)
Ar, Bs, Fm = ld('uv_river'), ld('uv_scene'), ld('uv_foam')
idr, ids, idf = (np.round(m[..., 2]).astype(int) for m in (Ar, Bs, Fm))
G_river = idr >= 1
G_scene = ids >= 1
G_rib, G_far = (ids == 1) | (ids == 2), ids == 3
F = idf == 4
art = np.asarray(Image.open(ART).convert('RGBA')).astype(np.float32) / 255
A = art[..., 3] > 0.5
RING = G_river & ~G_scene


def iou(a, b, m=None):
    if m is not None:
        a, b = a & m, b & m
    u = (a | b).sum()
    return float((a & b).sum() / u) if u else None


def edges(mask, y):
    xs = np.nonzero(mask[y])[0]
    return (int(xs.min()), int(xs.max())) if len(xs) else None


# the comparison excludes pixels hidden by the static environment in the GAME (front ring A, walls): the approved
# image hides the water there too (its own rings), so only the open river area is compared
open_ = ~RING
res = {
    'pixels': {'A_artwork': int(A.sum()), 'G_scene': int(G_scene.sum()), 'G_ribbon': int(G_rib.sum()), 'G_far': int(G_far.sum()), 'F_foam3d': int(F.sum()), 'RING_hidden': int(RING.sum())},
    'IoU_A_vs_Gscene': iou(A, G_scene, open_),
    'IoU_A_vs_Gscene_or_foam': iou(A, G_scene | F, open_),
    'A_not_G (artwork water where no game river)': int((A & ~G_scene & open_).sum()),
    'G_not_A (game river where artwork has none)': int((G_scene & ~A).sum()),
    'A_in_far_rows_covered_by_far_block_or_ribbon': None,
}
# far rows (above the seam) — does the far block cover the artwork water?
far_rows = slice(440, 600)
a_far = A[far_rows] & open_[far_rows]
res['far_rows_440_600'] = {
    'A_px': int(a_far.sum()),
    'A_covered_by_river_px': int((a_far & G_scene[far_rows]).sum()),
    'A_covered_by_far_block_px': int((a_far & G_far[far_rows]).sum()),
    'G_far_not_A_px': int((G_far[far_rows] & ~A[far_rows]).sum()),
}
rows = []
for y in range(440, H, 4):
    ea, eg, er = edges(A, y), edges(G_scene, y), edges(G_river, y)
    rows.append({'y': y, 'A': ea, 'G_scene': eg, 'G_river': er,
                 'dL': (eg[0] - ea[0]) if ea and eg else None, 'dR': (eg[1] - ea[1]) if ea and eg else None})
res['rows'] = rows


def band(y0, y1, key):
    v = [abs(r[key]) for r in rows if y0 <= r['y'] < y1 and r[key] is not None
         and r['A'] and r['A'][0] > 2 and r['A'][1] < W - 3 and r['G_river'] and r['G_river'][0] > 2 and r['G_river'][1] < W - 3]
    return {'n': len(v), 'median_abs_px': float(np.median(v)) if v else None, 'max_abs_px': float(np.max(v)) if v else None}


res['bank_offsets'] = {f'{a}-{b}': {'left': band(a, b, 'dL'), 'right': band(a, b, 'dR')} for a, b in [(440, 520), (520, 600), (600, 700), (700, 800), (800, 900)]}
# S-swing: centre of the artwork water vs the game river per row (where both banks are inside the frame)
sw = [(r['y'], (r['A'][0] + r['A'][1]) / 2, (r['G_river'][0] + r['G_river'][1]) / 2) for r in rows
      if r['A'] and r['G_river'] and r['A'][0] > 2 and r['A'][1] < W - 3 and r['G_river'][0] > 2 and r['G_river'][1] < W - 3]
res['centre_swing'] = [{'y': y, 'artwork_cx': round(a, 1), 'game_cx': round(g, 1), 'd': round(g - a, 1)} for y, a, g in sw]
json.dump(res, open(f'{OUT}/footprint.json', 'w'), indent=1)

# overlay: approved 45 % grey + A only (magenta), G only (cyan), both (white), 3D foam (yellow outline), ring-hidden (dark)
ref = np.asarray(Image.open('references/05_flow_into_the_current.png').convert('RGB')).astype(np.float32)
g = ref.mean(-1, keepdims=True) * 0.45
img = np.repeat(g, 3, -1)
both = A & G_scene
img[both] = img[both] * 0.4 + np.array([255, 255, 255]) * 0.6
onlyA = A & ~G_scene & open_
img[onlyA] = img[onlyA] * 0.3 + np.array([255, 40, 200]) * 0.7
onlyG = G_scene & ~A
img[onlyG] = img[onlyG] * 0.3 + np.array([0, 210, 255]) * 0.7
img[RING & A] = img[RING & A] * 0.5 + np.array([120, 90, 0]) * 0.5
fe = F & ~np.roll(F, 1, 0) | F & ~np.roll(F, 1, 1) | F & ~np.roll(F, -1, 0) | F & ~np.roll(F, -1, 1)
img[fe] = [255, 230, 0]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(f'{OUT}/footprint_overlay.png')
print(json.dumps({k: v for k, v in res.items() if k not in ('rows', 'centre_swing')}, indent=1))
print('centre swing (every 5th):', [(d['y'], d['artwork_cx'], d['game_cx'], d['d']) for d in res['centre_swing'][::5]])
