#!/usr/bin/env python3
"""Environment-only plate v2 for Screen 05: model-based repaint of the river (no copied/stretched pixels).

v1 (tools/make_env_plate.py) copied real water pieces into the hole; the user rejected it (rectangular
patches, repeated pieces, grey smear). v2 repaints the masked river area from a small model instead:

  1. pinkness field p (0 = cyan, 1 = hot pink): harmonic (Laplace) interpolation from the real water
     pixels around the hole, with the cyan core pinned along ONE continuous S-curve through the
     reference's coin line (the cyan core the coins sit on). Band edges are the p = 0.5 level set,
     so every pink band that touches the hole continues smoothly and there are no seams.
  2. shade field t (dark → light within each colour), also harmonic from the hole boundary.
  3. colour = measured cyan / pink palettes of the reference, mixed by p and t.
  4. detail: procedural flow streaks traced along the band direction (level-set tangent) and white
     4-point star glints, both scaled by perspective distance to the vanishing point.
  5. the HUD rows (0–196) are CROPPED, not invented. Output frame = rows 197–1535 (864×1339).

The approved reference is only read. Everything inside the mask is invented and shown in the mask image.

    python3 -I tools/make_env_plate_v2.py references/05_flow_into_the_current.png \
        qa/worldlabs/05/05_env_mask.png qa/worldlabs/05/plate_v2
"""
import argparse
import math
from pathlib import Path

import cv2
import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla

VP = (498.0, 479.0)
CROP = 197
# cyan core centre line: bottom centre → under Benny → the reference's coin line → VP (scene_comparisons 5.6/5.8)
CORE = [(432, 1330), (428, 1180), (436, 1030), (452, 880), (473, 728), (548, 660), (482, 610),
        (432, 575), (466, 545), (490, 515), (498, 492)]


def catmull(points, n=40):
    pts = [points[0]] + points + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = (np.array(pts[j], float) for j in (i - 1, i, i + 1, i + 2))
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(np.array(points[-1], float))
    return np.array(out)


def laplace(values, known, domain, prior=0.3, prior_w=1e-4):
    """Solve ∇²u = 0 on `domain` (bool), Dirichlet where `known`, Neumann elsewhere. Returns full array."""
    h, w = values.shape
    idx = -np.ones((h, w), np.int64)
    ys, xs = np.nonzero(domain)
    idx[ys, xs] = np.arange(len(ys))
    n = len(ys)
    rows, cols, data = [], [], []
    b = np.full(n, prior * prior_w)
    diag = np.full(n, prior_w)
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = ys + dy, xs + dx
        inb = (ny >= 0) & (ny < h) & (nx >= 0) & (nx < w)
        ii = np.nonzero(inb)[0]
        ny, nx = ny[inb], nx[inb]
        unk = idx[ny, nx] >= 0
        kn = (~unk) & known[ny, nx]
        diag[ii[unk | kn]] += 1
        rows.append(ii[unk]); cols.append(idx[ny[unk], nx[unk]]); data.append(-np.ones(unk.sum()))
        np.add.at(b, ii[kn], values[ny[kn], nx[kn]])
    rows.append(np.arange(n)); cols.append(np.arange(n)); data.append(diag)
    A = sp.csr_matrix((np.concatenate(data), (np.concatenate(rows), np.concatenate(cols))), shape=(n, n))
    sol = spla.spsolve(A.tocsc(), b)
    out = values.copy()
    out[ys, xs] = sol
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ref")
    ap.add_argument("mask")
    ap.add_argument("outdir")
    ap.add_argument("--seed", type=int, default=5)
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)
    ref = cv2.imread(args.ref, cv2.IMREAD_COLOR)
    H, W = ref.shape[:2]
    keep = cv2.imread(args.mask, cv2.IMREAD_GRAYSCALE) > 127
    yy, xx = np.mgrid[0:H, 0:W]
    hole = (~keep) & (yy > 465)          # river part of the mask; HUD rows are cropped, not filled
    # rows < 466 of the mask (the HUD) are left as they are and cropped away

    # ---- classes of the real pixels -------------------------------------------------------------
    blur = cv2.GaussianBlur(ref, (0, 0), 3)
    hsv = cv2.cvtColor(blur, cv2.COLOR_BGR2HSV)
    hue, sat = hsv[..., 0].astype(int) * 2, hsv[..., 1]
    cyan = keep & (hue >= 180) & (hue <= 218) & (sat > 110)
    pink = keep & (hue >= 288) & (hue <= 342) & (sat > 90)
    water = cyan | pink

    # ---- solve on a half-resolution grid (fast, smooth) --------------------------------------------
    s = 2
    hs, ws = H // s, W // s
    def dn(m):
        return cv2.resize(m.astype(np.uint8), (ws, hs), interpolation=cv2.INTER_NEAREST).astype(bool)
    hole_s = cv2.dilate(dn(hole).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    cyan_s, pink_s = dn(cyan) & ~hole_s, dn(pink) & ~hole_s
    near = cv2.dilate(hole_s.astype(np.uint8), np.ones((61, 61), np.uint8)).astype(bool)
    yy_s = np.mgrid[0:hs, 0:ws][0] * s
    domain = near & ~(cyan_s | pink_s) & (yy_s > 455)

    # core: p = 0 along one S-curve, width growing with perspective
    core = np.zeros((hs, ws), np.uint8)
    pts = catmull(CORE)
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        r = max(1, int(round((0.035 * (0.5 * (y0 + y1) - VP[1]) + 2) / s)))
        cv2.line(core, (int(x0 / s), int(y0 / s)), (int(x1 / s), int(y1 / s)), 1, 2 * r + 1, cv2.LINE_8)
    core = core.astype(bool) & hole_s
    known = (cyan_s | pink_s | core)
    pval = np.where(pink_s, 1.0, 0.0)
    p = laplace(pval, known, domain & ~core, prior=0.2)

    # shade within each colour: cyan uses G (140 dark … 225 light), pink uses G (35 … 140)
    g = cv2.resize(blur, (ws, hs), interpolation=cv2.INTER_AREA)[..., 1].astype(float)
    tval = np.where(pink_s, (g - 35) / 105, (g - 140) / 85).clip(0, 1)
    tval = np.where(core, 0.45, tval)
    t = laplace(tval, cyan_s | pink_s, domain, prior=0.45)

    p = cv2.resize(p, (W, H), interpolation=cv2.INTER_CUBIC)
    t = cv2.resize(t, (W, H), interpolation=cv2.INTER_CUBIC)
    p = cv2.GaussianBlur(p, (0, 0), 2.0)
    ps = np.clip((p - 0.40) / 0.20, 0, 1)
    ps = ps * ps * (3 - 2 * ps)                       # crisp but anti-aliased band edges
    t = cv2.GaussianBlur(t, (0, 0), 4.0).clip(0, 1)

    # ---- palette (BGR, measured around the hole: cyan median (250,172,1), pink median (230,60,248)) --
    cyan_dark, cyan_light = np.array([238, 138, 0.0]), np.array([255, 222, 70.0])
    pink_dark, pink_light = np.array([205, 38, 232.0]), np.array([250, 135, 255.0])
    tt = t[..., None]
    col_c = cyan_dark + (cyan_light - cyan_dark) * tt
    col_p = pink_dark + (pink_light - pink_dark) * tt
    base = col_c + (col_p - col_c) * ps[..., None]
    # a soft lighter rim along every band edge (the ref's pink bands have bright glossy borders)
    edge = np.exp(-((p - 0.5) / 0.07) ** 2)
    base += edge[..., None] * np.array([18, 40, 30.0])

    # ---- flow direction: tangent of the band level sets, oriented toward the VP ---------------------
    gx = cv2.Sobel(cv2.GaussianBlur(p, (0, 0), 6), cv2.CV_64F, 1, 0, ksize=5)
    gy = cv2.Sobel(cv2.GaussianBlur(p, (0, 0), 6), cv2.CV_64F, 0, 1, ksize=5)
    tx, ty = -gy, gx
    vx, vy = VP[0] - xx, VP[1] - yy
    vn = np.hypot(vx, vy) + 1e-6
    vx, vy = vx / vn, vy / vn
    sgn = np.sign(tx * vx + ty * vy + 1e-9)
    tx, ty = tx * sgn, ty * sgn
    gm = np.hypot(tx, ty)
    wgt = np.clip(gm / (np.percentile(gm[hole], 70) + 1e-9), 0, 1)
    fx = wgt * tx / (gm + 1e-9) + (1 - wgt) * vx
    fy = wgt * ty / (gm + 1e-9) + (1 - wgt) * vy
    fn = np.hypot(fx, fy) + 1e-9
    fx, fy = fx / fn, fy / fn

    # ---- streaks ----------------------------------------------------------------------------------
    streak = np.zeros((H, W), np.float32)
    hy, hx = np.nonzero(hole)
    depth = np.clip((hy - VP[1]) / 800.0, 0.02, 1.2)
    prob = depth ** 0.6
    prob /= prob.sum()
    for k in rng.choice(len(hy), size=1400, p=prob):
        x, y = float(hx[k]), float(hy[k])
        d = max(0.03, (y - VP[1]) / 800.0)
        L = 25 + 170 * d * rng.uniform(0.4, 1.2)
        step = 3.0
        poly = [(x, y)]
        for _ in range(int(L / step)):
            ix, iy = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, y)))
            x += fx[iy, ix] * step
            y += fy[iy, ix] * step
            if y < VP[1] + 6:
                break
            poly.append((x, y))
        if len(poly) < 3:
            continue
        th = 1 if d < 0.35 else 2
        cv2.polylines(streak, [np.round(np.array(poly) * 4).astype(np.int32)], False,
                      float(rng.uniform(0.18, 0.55)), th, cv2.LINE_AA, shift=2)
    streak = cv2.GaussianBlur(streak, (0, 0), 0.7)

    # ---- 4-point star glints ----------------------------------------------------------------------
    glint = np.zeros((H, W), np.float32)
    for k in rng.choice(len(hy), size=70, p=prob):
        x, y = int(hx[k]), int(hy[k])
        d = max(0.05, (y - VP[1]) / 800.0)
        r = int(6 + 34 * d * rng.uniform(0.5, 1.2))
        a = float(rng.uniform(0.55, 1.0))
        cv2.line(glint, (x - r, y), (x + r, y), a, 1, cv2.LINE_AA)
        cv2.line(glint, (x, y - int(r * 0.55)), (x, y + int(r * 0.55)), a * 0.9, 1, cv2.LINE_AA)
        cv2.circle(glint, (x, y), max(1, r // 9), a, -1, cv2.LINE_AA)
    glint = cv2.GaussianBlur(glint, (0, 0), 0.9) + 0.5 * cv2.GaussianBlur(glint, (0, 0), 4.0)

    light = np.array([255, 250, 225.0])
    syn = base + (light - base) * np.clip(streak * 0.85, 0, 1)[..., None]
    syn = syn + (np.array([255, 255, 255.0]) - syn) * np.clip(glint, 0, 1)[..., None]
    syn = np.clip(syn, 0, 255)

    # ---- composite with a soft edge (inside the hole only) ------------------------------------------
    dist = cv2.distanceTransform(hole.astype(np.uint8), cv2.DIST_L2, 5)
    alpha = np.clip(dist / 6.0, 0, 1)[..., None]
    out = ref.astype(float) * (1 - alpha) + syn * alpha
    out = np.clip(out, 0, 255).astype(np.uint8)

    od = Path(args.outdir)
    od.mkdir(parents=True, exist_ok=True)
    clean = out[CROP:]
    mask = (hole[CROP:] * 255).astype(np.uint8)
    cv2.imwrite(str(od / "05_clean_environment_v2.png"), clean)
    cv2.imwrite(str(od / "05_reconstructed_mask_v2.png"), mask)
    # readable mask: the clean plate dimmed, reconstructed area outlined in green
    vis = (clean.astype(float) * 0.45).astype(np.uint8)
    vis[mask > 0] = (0.35 * clean[mask > 0] + 0.65 * np.array([60, 200, 60])).astype(np.uint8)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(vis, cnts, -1, (80, 255, 80), 3)
    cv2.imwrite(str(od / "05_reconstructed_mask_overlay_v2.png"), vis)
    print("frame", clean.shape[1], "x", clean.shape[0], "| reconstructed share of frame:",
          round(float((mask > 0).mean()), 4))


if __name__ == "__main__":
    main()
