"""Part registration game -> approved for the Screen 08 beanie (benny-character-artist, 2026-11-17).
At the locked 08 frame the game beanie sits ~18 px lower and ~13 px further image-right than the painted one and is a
little narrower (UV pass vs approved part masks: pom IoU 0.33, crown 0.39, cuff 0.32, star 0.06). A strict per-pixel
bake (line B's method, made for 05 after the hat geometry had been fitted to IoU 0.92) therefore paints the approved
stripes / cuff / star across the wrong parts of the game hat (broken stripes). This tool finds, per part group, the
axis-aligned scale + shift M (game pixel -> approved pixel) that best lines the parts up, so the bake can take each game
pixel's colour from the CORRESPONDING approved pixel (same stripe, same rib, same yarn) instead of the same screen pixel:
  hat  (crown + cuff): agreement of {crown white, crown purple, cuff} classes - game classes from the CURRENT capture
       (benny05 maps: their stripe layout is what the unseen texels keep, so the seam stays continuous) + UV-pass ids;
  pom: IoU of the pom masks;  star: IoU of the star masks.
usage: python3 -I reg08.py <uv.f32> <current_capture.png> <out.json>"""
import sys, os, json, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from scipy import ndimage as ndi
from parts08 import approved_parts
from geom08 import load_uv, game_ids
from bennyseg08 import load, colour_classes, bbox


def warp_lookup(lab, M, ys, xs):
    """nearest-neighbour lookup of approved label image lab at M(game px)"""
    sx, sy, cx, cy, tx, ty = M
    xa = np.rint(sx * (xs - cx) + cx + tx).astype(int); ya = np.rint(sy * (ys - cy) + cy + ty).astype(int)
    ok = (xa >= 0) & (xa < lab.shape[1]) & (ya >= 0) & (ya < lab.shape[0])
    out = np.zeros(len(xs), lab.dtype); out[ok] = lab[ya[ok], xa[ok]]
    return out


def fit(game_lab, appr_lab, weights, cx, cy, sxs, sys_, txs, tys):
    """maximise, both ways, the share of part pixels that land on the same class: game px at M(p) in the approved labels
    + approved px at M^-1(q) in the game labels (label 255 = wildcard: the star covers the hat in both pictures)"""
    ys, xs = np.nonzero((game_lab > 0) & (game_lab < 255)); gl = game_lab[ys, xs]
    ya, xa = np.nonzero((appr_lab > 0) & (appr_lab < 255)); al0 = appr_lab[ya, xa]
    best = (-1, None)
    for sx, sy, tx, ty in itertools.product(sxs, sys_, txs, tys):
        al = warp_lookup(appr_lab, (sx, sy, cx, cy, tx, ty), ys, xs)
        gb = warp_lookup(game_lab, (1 / sx, 1 / sy, cx + tx, cy + ty, -tx, -ty), ya, xa)
        sc = 0.0
        for k, w in weights.items():
            gk, ak = gl == k, al0 == k
            sc += w * 0.5 * ((gk & ((al == k) | (al == 255))).sum() / max(gk.sum(), 1) + (ak & ((gb == k) | (gb == 255))).sum() / max(ak.sum(), 1))
        if sc > best[0]:
            best = (sc, (sx, sy, cx, cy, tx, ty))
    return best


def refine(game_lab, appr_lab, weights, M0, steps):
    sx, sy, cx, cy, tx, ty = M0
    ds, dt = steps
    return fit(game_lab, appr_lab, weights, cx, cy, np.arange(sx - 2 * ds, sx + 2.01 * ds, ds), np.arange(sy - 2 * ds, sy + 2.01 * ds, ds),
               np.arange(tx - 2 * dt, tx + 2.01 * dt, dt), np.arange(ty - 2 * dt, ty + 2.01 * dt, dt))


def main():
    uv, cur, out = sys.argv[1:4]
    P, a8, m = approved_parts()
    ids = game_ids(load_uv(uv))
    g = load(cur)
    ca, cg = colour_classes(a8), colour_classes(g)
    res = {}
    # ---- hat: 1 crown white, 2 crown purple, 3 cuff
    A = np.zeros(ids.shape, np.uint8); A[P['crown'] & (ca == 3)] = 1; A[P['crown'] & (ca == 2)] = 2; A[P['cuff']] = 3
    A[ndi.binary_dilation(P['star'], iterations=3)] = 255
    G = np.zeros(ids.shape, np.uint8); G[(ids == 2) & (cg == 3)] = 1; G[(ids == 2) & (cg == 2)] = 2; G[ids == 3] = 3
    G[ndi.binary_dilation(ids == 5, iterations=3)] = 255
    bg = bbox(np.isin(ids, [2, 3])); cx, cy = bg['cx'], bg['cy']
    W = {1: 1.0, 2: 1.0, 3: 1.0}
    sc, M = fit(G, A, W, cx, cy, np.arange(0.9, 1.31, 0.05), np.arange(0.8, 1.21, 0.05), np.arange(-40, 11, 3), np.arange(-40, 11, 3))
    sc, M = refine(G, A, W, M, (0.0125, 1))
    res['hat'] = dict(M=[round(float(v), 4) for v in M], score=round(float(sc) / 3, 4),
                      identity_score=round(float(fit(G, A, W, cx, cy, [1], [1], [0], [0])[0]) / 3, 4))
    # ---- pom and star: mask IoU-like agreement
    for name, key, gid in [('pom', 'pom', 4), ('star', 'star', 5)]:
        A1 = P[key].astype(np.uint8); G1 = (ids == gid).astype(np.uint8)
        b = bbox(G1 > 0); ba = bbox(A1 > 0)
        sx0, sy0 = ba['w'] / b['w'], ba['h'] / b['h']
        tx0, ty0 = ba['cx'] - b['cx'], ba['cy'] - b['cy']
        M0 = (sx0, sy0, b['cx'], b['cy'], tx0, ty0)
        sc, M = refine(G1, A1, {1: 1.0}, M0, (0.04, 2))
        sc, M = refine(G1, A1, {1: 1.0}, M, (0.01, 0.5))
        res[name] = dict(M=[round(float(v), 4) for v in M], score=round(float(sc), 4),
                         identity_score=round(float(fit(G1, A1, {1: 1.0}, b['cx'], b['cy'], [1], [1], [0], [0])[0]), 4))
    res['note'] = 'M = (sx, sy, cx, cy, tx, ty): approved = (s*(game - c) + c + t); score = share of game part pixels landing on the same approved class'
    json.dump(res, open(out, 'w'), indent=1)
    print(json.dumps(res, indent=1))


if __name__ == '__main__':
    main()
