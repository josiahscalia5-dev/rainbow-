#!/usr/bin/env python3
"""Screen 05 geometry-focused tunnel reference (plate v3) for Marble / Atlas.

v1 (copied water pieces) and v2 (procedural repaint of the whole Benny area) were rejected or failed:
a 450 px hole behind Benny cannot be invented cleanly. v3 avoids inventing it at all:

  * rows 0–196 (HUD) and rows 768+ (Benny, his splash and the near river) are CROPPED, not filled.
    The near river is supplied by the game's own 3D river geometry in Blender instead
    (scripts/export-river-05.ts + tools/blender/build_05_river_scene.py).
  * inside the kept strip only the gold coins are masked: tight masks from the coins' own gold
    pixels (+ rim/shadow margin), not rectangles.
  * each coin hole is filled by exemplar inpainting (Criminisi 2004): 9×9 patches taken only from the real
    water within ±55 px, in the order of the strongest incoming streaks, so the flow continues through
    the hole. (Tried and dropped: harmonic colour fill = hazy discs; OpenCV FSR = blurry dark ghosts.)

Output (in OUTDIR, the approved reference is only read):
  05_geometry_reference_v3.png         clean tunnel strip, rows 197–767 (864×571)
  05_geometry_reconstructed_mask_v3.png white = reconstructed (coin) pixels
  05_geometry_mask_overlay_v3.png       readable overlay of the mask

    python3 -I tools/make_env_plate_v3.py references/05_flow_into_the_current.png qa/worldlabs/05/plate_v3
"""
import argparse
import sys
from pathlib import Path

import cv2
import numpy as np


VP = (498.0, 479.0)
TOP, BOTTOM = 197, 768


def criminisi(img: np.ndarray, hole: np.ndarray, patch: int = 9, win: int = 55) -> np.ndarray:
    out = img.astype(np.float32).copy()
    H, W = hole.shape
    r = patch // 2
    n, lab, st, _ = cv2.connectedComponentsWithStats(hole.astype(np.uint8), 8)
    for ci in range(1, n):
        x, y, w, h = st[ci, :4]
        m = win + r + 2
        x0, y0, x1, y1 = max(0, x - m), max(0, y - m), min(W, x + w + m), min(H, y + h + m)
        I = out[y0:y1, x0:x1]
        miss = (lab[y0:y1, x0:x1] == ci) | (hole[y0:y1, x0:x1] & (lab[y0:y1, x0:x1] != ci))
        conf = (~miss).astype(np.float32)
        hh, ww = miss.shape
        while miss[(lab[y0:y1, x0:x1] == ci)].any():
            fill_k = ~miss
            front = miss & (cv2.dilate(fill_k.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0)
            front &= (lab[y0:y1, x0:x1] == ci)
            fy, fx = np.nonzero(front)
            fy = np.clip(fy, r, hh - r - 1)
            fx = np.clip(fx, r, ww - r - 1)
            # confidence term
            cs = cv2.boxFilter(conf, -1, (patch, patch), normalize=True)
            C = cs[fy, fx]
            # data term: isophote strength across the front normal
            lum = cv2.cvtColor(np.clip(I, 0, 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
            gx = cv2.Sobel(lum, cv2.CV_32F, 1, 0, ksize=3) * fill_k
            gy = cv2.Sobel(lum, cv2.CV_32F, 0, 1, ksize=3) * fill_k
            mk = cv2.GaussianBlur(fill_k.astype(np.float32), (0, 0), 1.5)
            nx = cv2.Sobel(mk, cv2.CV_32F, 1, 0, ksize=3)
            ny = cv2.Sobel(mk, cv2.CV_32F, 0, 1, ksize=3)
            nn = np.hypot(nx, ny) + 1e-6
            gxm = cv2.dilate(np.abs(gx), np.ones((patch, patch), np.uint8))
            gym = cv2.dilate(np.abs(gy), np.ones((patch, patch), np.uint8))
            D = np.abs(-gym[fy, fx] * nx[fy, fx] + gxm[fy, fx] * ny[fy, fx]) / nn[fy, fx] / 255.0 + 1e-3
            k = int(np.argmax(C * D))
            py, px = int(fy[k]), int(fx[k])
            T = I[py - r:py + r + 1, px - r:px + r + 1]
            K = ~miss[py - r:py + r + 1, px - r:px + r + 1]
            # candidate source patches: fully real, within ±win
            sy0, sy1 = max(r, py - win), min(hh - r - 1, py + win)
            sx0, sx1 = max(r, px - win), min(ww - r - 1, px + win)
            region = I[sy0 - r:sy1 + r + 1, sx0 - r:sx1 + r + 1]
            valid = cv2.erode(fill_k.astype(np.uint8), np.ones((patch, patch), np.uint8))[sy0:sy1 + 1, sx0:sx1 + 1] > 0
            V = np.lib.stride_tricks.sliding_window_view(region, (patch, patch, 3))[..., 0, :, :, :]
            d = (((V - T) ** 2) * K[None, None, :, :, None]).sum(axis=(2, 3, 4))
            d[~valid] = np.inf
            if not np.isfinite(d).any():
                # nothing real nearby: fall back to Telea for this component
                mm = (miss & (lab[y0:y1, x0:x1] == ci)).astype(np.uint8) * 255
                I[:] = cv2.inpaint(np.clip(I, 0, 255).astype(np.uint8), mm, 5, cv2.INPAINT_TELEA).astype(np.float32)
                miss &= ~(lab[y0:y1, x0:x1] == ci)
                break
            qy, qx = np.unravel_index(int(np.argmin(d)), d.shape)
            qy, qx = qy + sy0, qx + sx0
            S = I[qy - r:qy + r + 1, qx - r:qx + r + 1]
            U = ~K
            T[U] = S[U]
            cpatch = conf[py - r:py + r + 1, px - r:px + r + 1]
            cpatch[U] = C[k]
            miss[py - r:py + r + 1, px - r:px + r + 1] &= ~U
        out[y0:y1, x0:x1] = I
    return np.clip(out, 0, 255).astype(np.uint8)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ref")
    ap.add_argument("outdir")
    ap.add_argument("--seed", type=int, default=7)
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed)
    ref = cv2.imread(args.ref, cv2.IMREAD_COLOR)
    H, W = ref.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]

    # ---- tight coin mask: gold pixels on the river trail below the VP, holes filled, + rim margin ----
    hsv = cv2.cvtColor(ref, cv2.COLOR_BGR2HSV)
    hue, sat, val = hsv[..., 0].astype(int) * 2, hsv[..., 1], hsv[..., 2]
    gold = (hue >= 28) & (hue <= 62) & (sat > 120) & (val > 150) & (yy >= 480) & (yy <= 790) & (xx >= 340) & (xx <= 660)
    n, lab, st, _ = cv2.connectedComponentsWithStats(gold.astype(np.uint8), 8)
    coins = np.zeros((H, W), np.uint8)
    for i in range(1, n):
        if st[i, 4] >= 15:
            comp = (lab == i).astype(np.uint8)
            cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            for c in cnts:
                cv2.drawContours(coins, [cv2.convexHull(c)], -1, 1, -1)   # fill the "$" and the gaps
    # margin grows with the coin size (rim, dark edge, contact shadow)
    hole = np.zeros((H, W), bool)
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(coins, 8)
    for i in range(1, n2):
        r = int(np.clip(0.12 * max(st2[i, 2], st2[i, 3]), 3, 12))
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
        hole |= cv2.dilate((lab2 == i).astype(np.uint8), k).astype(bool)
    # inside each coin's enlarged box, every pixel that is NOT water-coloured (cyan/pink/violet, saturated)
    # belongs to the coin: dark rim, contact shadow, gold glow, sparkle
    bl = cv2.GaussianBlur(ref, (0, 0), 1.0)
    hb = cv2.cvtColor(bl, cv2.COLOR_BGR2HSV)
    hue_b, sat_b = hb[..., 0].astype(int) * 2, hb[..., 1]
    waterish = (hue_b >= 175) & (hue_b <= 345) & (sat_b > 70)
    for i in range(1, n2):
        x, y, w, h = st2[i, :4]
        m = int(0.35 * max(w, h)) + 3
        box = np.zeros((H, W), bool)
        box[max(0, y - m):y + h + m, max(0, x - m):x + w + m] = True
        hole |= box & ~waterish & (np.hypot(xx - (x + w / 2), (yy - (y + h / 2)) * (w / max(h, 1))) < 0.5 * w + m)
    hole = cv2.morphologyEx(hole.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool)
    hole = cv2.dilate(hole.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    # the VP glow itself is not a coin: keep the 6 px around the VP real
    hole &= np.hypot(xx - VP[0], yy - VP[1]) > 6

    # ---- exemplar inpainting (Criminisi et al. 2004): structure-first patch propagation ------------------
    # Fill order follows the strongest incoming streaks (isophotes); each 9×9 patch is completed from the
    # best-matching fully-real patch within ±WIN px of it, so streaks continue through the hole and nothing
    # comes from far away (no repeated tunnel pieces, no stretching).
    out = criminisi(ref, hole, patch=9, win=55)
    del rng

    od = Path(args.outdir)
    od.mkdir(parents=True, exist_ok=True)
    strip = out[TOP:BOTTOM]
    mask = (hole[TOP:BOTTOM] * 255).astype(np.uint8)
    cv2.imwrite(str(od / "05_geometry_reference_v3.png"), strip)
    cv2.imwrite(str(od / "05_geometry_reconstructed_mask_v3.png"), mask)
    vis = (strip.astype(float) * 0.45).astype(np.uint8)
    vis[mask > 0] = (0.35 * strip[mask > 0] + 0.65 * np.array([60, 200, 60])).astype(np.uint8)
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(vis, cnts, -1, (80, 255, 80), 2)
    cv2.imwrite(str(od / "05_geometry_mask_overlay_v3.png"), vis)
    # 2× enlargement of the reconstructed coin trail, original vs v3, for close inspection
    x0, x1, y0, y1 = 360, 660, 470, BOTTOM
    zo = cv2.resize(ref[y0:y1, x0:x1], None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
    zn = cv2.resize(out[y0:y1, x0:x1], None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
    cv2.imwrite(str(od / "05_geometry_coin_trail_zoom_v3.png"), np.concatenate([zo, np.full((zo.shape[0], 10, 3), 30, np.uint8), zn], 1))
    print("strip", strip.shape[1], "x", strip.shape[0], "| reconstructed share of strip:", round(float((mask > 0).mean()), 4),
          "| coins masked:", n2 - 1)


if __name__ == "__main__":
    main()
