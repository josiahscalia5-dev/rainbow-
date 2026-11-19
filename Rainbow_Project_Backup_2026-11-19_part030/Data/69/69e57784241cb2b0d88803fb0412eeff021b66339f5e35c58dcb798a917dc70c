#!/usr/bin/env python3
"""Screen 05 geometry-focused tunnel reference (plate v3) for Marble / Atlas.

v1 (copied water pieces) and v2 (procedural repaint of the whole Benny area) were rejected or failed:
a 450 px hole behind Benny cannot be invented cleanly. v3 avoids inventing it at all:

  * rows 0–196 (HUD) and rows 768+ (Benny, his splash and the near river) are CROPPED, not filled.
    The near river is supplied by the game's own 3D river geometry in Blender instead
    (scripts/export-river-05.ts + tools/blender/build_05_river_scene.py).
  * inside the kept strip only the gold coins are masked: tight masks from the coins' own gold
    pixels (+ rim/shadow margin), not rectangles.
  * each coin hole is filled by OpenCV frequency-selective reconstruction (FSR, opencv-contrib xphoto):
    the real water around the coin is fitted with a sparse Fourier model that continues the streaks
    through the hole. No pieces are copied from elsewhere and nothing is stretched.

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
    # the VP glow itself is not a coin: keep the 6 px around the VP real
    hole &= np.hypot(xx - VP[0], yy - VP[1]) > 6

    # ---- texture-aware fill: OpenCV frequency-selective reconstruction (FSR) from the surroundings --------
    # FSR models each block around the hole as a sparse sum of Fourier basis functions fitted to the
    # real pixels next to it, so the glossy flow streaks continue through the hole. Fill per coin crop
    # (fast, and each coin only sees its own neighbourhood).
    out = ref.copy()
    n3, lab3, st3, _ = cv2.connectedComponentsWithStats(hole.astype(np.uint8), 8)
    for i in range(1, n3):
        x, y, w, h = st3[i, :4]
        pad = int(max(24, 0.9 * max(w, h)))
        x0, y0 = max(0, x - pad), max(0, y - pad)
        x1, y1 = min(W, x + w + pad), min(H, y + h + pad)
        crop = out[y0:y1, x0:x1].copy()
        m = ((lab3[y0:y1, x0:x1] == i) == 0).astype(np.uint8)       # xphoto: 1 = valid, 0 = missing
        dst = np.zeros_like(crop)
        cv2.xphoto.inpaint(crop, m, dst, cv2.xphoto.INPAINT_FSR_BEST)
        sel = lab3[y0:y1, x0:x1] == i
        crop[sel] = dst[sel]
        out[y0:y1, x0:x1] = crop
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
