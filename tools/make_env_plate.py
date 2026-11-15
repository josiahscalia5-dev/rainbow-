#!/usr/bin/env python3
"""Environment-only clean plate of an approved Rainbow reference (for Marble / Atlas input).

The original reference is only READ, never written. Output goes to a separate folder.

    python3 -I tools/make_env_plate.py references/05_flow_into_the_current.png \
        qa/worldlabs/05/05_env_mask.png qa/worldlabs/05 --vp 498,479

mask: 255 = keep (real reference pixels), 0 = remove (HUD, Benny + splash, coins).
Fill strategy (everything filled is INVENTED and marked in *_fill_mask.png):
  * wall / ceiling holes (above the vanishing point): rotate the reference about the VP. The tunnel is
    close to rotationally symmetric there, so rings stay rings and slots stay circumferential.
  * floor holes (below the VP): sample outward along the ray from the VP to the first real pixel
    (near the camera the water bands run roughly radially, so this continues them).
  * a narrow seam is blended with OpenCV Telea inpainting.
"""
import argparse
import math
from pathlib import Path

import cv2
import numpy as np


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ref")
    ap.add_argument("mask")
    ap.add_argument("outdir")
    ap.add_argument("--vp", default="498,479")
    a = ap.parse_args()
    ref = cv2.imread(a.ref, cv2.IMREAD_COLOR)
    keep = cv2.imread(a.mask, cv2.IMREAD_GRAYSCALE) > 127
    h, w = keep.shape
    vx, vy = (float(v) for v in a.vp.split(","))
    out = ref.copy()
    filled = np.zeros((h, w), bool)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = xx - vx, yy - vy
    hole = ~keep

    # 1. walls/ceiling: rotation about the VP (try growing angles both ways)
    upper = hole & (yy < vy - 8)
    for deg in (22, -22, 30, -30, 38, -38, 46, -46, 55, -55, 65, -65):
        todo = upper & ~filled
        if not todo.any():
            break
        t = math.radians(deg)
        sx = vx + dx * math.cos(t) - dy * math.sin(t)
        sy = vy + dx * math.sin(t) + dy * math.cos(t)
        ix, iy = np.round(sx).astype(int), np.round(sy).astype(int)
        inb = (ix >= 0) & (ix < w) & (iy >= 0) & (iy < h)
        ok = todo & inb
        ok[ok] = keep[iy[ok], ix[ok]] & (iy[ok] < vy - 8)
        out[ok] = ref[iy[ok], ix[ok]]
        filled |= ok

    # 2. floor (and anything left): first real pixel outward along the VP ray
    rest = hole & ~filled
    ys, xs = np.nonzero(rest)
    for s in np.linspace(1.02, 6.0, 250):
        if len(ys) == 0:
            break
        sx = np.round(vx + (xs - vx) * s).astype(int)
        sy = np.round(vy + (ys - vy) * s).astype(int)
        inb = (sx >= 0) & (sx < w) & (sy >= 0) & (sy < h)
        ok = np.zeros(len(ys), bool)
        ok[inb] = keep[sy[inb], sx[inb]]
        out[ys[ok], xs[ok]] = ref[sy[ok], sx[ok]]
        filled[ys[ok], xs[ok]] = True
        ys, xs = ys[~ok], xs[~ok]

    # 3. whatever is still empty + a seam around every fill region: Telea inpainting
    h8 = hole.astype(np.uint8)
    border = cv2.dilate(h8, np.ones((5, 5), np.uint8)) - cv2.erode(h8, np.ones((5, 5), np.uint8))
    left = (hole & ~filled).astype(np.uint8)
    out = cv2.inpaint(out, np.clip(border + left, 0, 1).astype(np.uint8) * 255, 4, cv2.INPAINT_TELEA)

    od = Path(a.outdir)
    od.mkdir(parents=True, exist_ok=True)
    stem = Path(a.ref).stem.split("_")[0]
    cv2.imwrite(str(od / f"{stem}_env_clean_plate.png"), out)
    cv2.imwrite(str(od / f"{stem}_env_fill_mask.png"), (hole * 255).astype(np.uint8))
    # review sheet: original | clean plate | invented pixels tinted
    tint = out.copy()
    tint[hole] = (0.55 * tint[hole] + 0.45 * np.array([60, 220, 60])).astype(np.uint8)
    sheet = np.concatenate([ref, np.full((h, 8, 3), 30, np.uint8), out, np.full((h, 8, 3), 30, np.uint8), tint], 1)
    cv2.imwrite(str(od / f"{stem}_env_plate_review.png"), sheet)
    print("invented share:", round(float(hole.mean()), 4), "rotation-filled:", round(float((filled & (yy < vy)).mean()), 4))


if __name__ == "__main__":
    main()
