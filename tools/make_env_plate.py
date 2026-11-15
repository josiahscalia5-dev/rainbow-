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
    # floor sources: real WATER pixels only (cyan / pink / violet hues, saturated), never gold or foam,
    # and above the near frame ring
    hsv = cv2.cvtColor(ref, cv2.COLOR_BGR2HSV)
    hue2, sat = hsv[..., 0].astype(int) * 2, hsv[..., 1]
    water = keep & (sat > 90) & ((hue2 >= 170) & (hue2 <= 345)) & (yy < 1400)
    # close glint/streak pinholes so whole patches of water are copied (no speckle), then stay inside keep
    water = cv2.morphologyEx(water.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((17, 17), np.uint8)).astype(bool)
    water = cv2.erode((water & keep).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)

    def apply(region: np.ndarray, rot_deg: float, zoom: float, same_half: str) -> None:
        """copy real pixels through a similarity about the VP (rotation + zoom keeps texture unstreaked)"""
        nonlocal filled
        todo = region & ~filled
        if not todo.any():
            return
        t = math.radians(rot_deg)
        sx = vx + zoom * (dx * math.cos(t) - dy * math.sin(t))
        sy = vy + zoom * (dx * math.sin(t) + dy * math.cos(t))
        ix, iy = np.round(sx).astype(int), np.round(sy).astype(int)
        ok = todo & (ix >= 0) & (ix < w) & (iy >= 0) & (iy < h)
        ok[ok] = (keep if same_half == "upper" else water)[iy[ok], ix[ok]] & (
            (iy[ok] < vy - 8) if same_half == "upper" else (iy[ok] > vy + 8))
        out[ok] = ref[iy[ok], ix[ok]]
        filled |= ok

    # 1. walls/ceiling: rotation about the VP, then zoom toward it for the corners
    upper = hole & (yy < vy - 8)
    for deg in (22, -22, 30, -30, 38, -38, 46, -46, 55, -55, 65, -65):
        apply(upper, deg, 1.0, "upper")
    for z in (0.85, 0.75, 0.65, 0.55, 0.45):
        for deg in (0, 15, -15, 30, -30):
            apply(upper, deg, z, "upper")

    # 2. floor: water texture from the same half; rotation first (keeps the perspective scale),
    #    then zoom outward (nearer water) for the large area behind Benny
    lower = hole & ~upper
    for deg in (30, -30, 40, -40, 50, -50, 60, -60):
        apply(lower & (np.hypot(dx, dy) < 330), deg, 1.0, "lower")
    for z in (1.35, 1.6, 1.9, 2.3, 2.8, 3.4, 4.2, 5.2):
        for deg in (0, 12, -12, 25, -25):
            apply(lower, deg, z, "lower")

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
    # cropped variant: drop the rows that were entirely HUD, so the top edge needs no invention at all
    rows_hud = np.nonzero(hole.mean(1) > 0.98)[0]
    top = int(rows_hud.max()) + 1 if len(rows_hud) and rows_hud.min() == 0 else 0
    cv2.imwrite(str(od / f"{stem}_env_clean_plate_cropped.png"), out[top:])
    print("cropped from row", top, "->", out[top:].shape[1], "x", out[top:].shape[0])
    # review sheet: original | clean plate | invented pixels tinted
    tint = out.copy()
    tint[hole] = (0.55 * tint[hole] + 0.45 * np.array([60, 220, 60])).astype(np.uint8)
    sheet = np.concatenate([ref, np.full((h, 8, 3), 30, np.uint8), out, np.full((h, 8, 3), 30, np.uint8), tint], 1)
    cv2.imwrite(str(od / f"{stem}_env_plate_review.png"), sheet)
    print("invented share:", round(float(hole.mean()), 4), "rotation-filled:", round(float((filled & (yy < vy)).mean()), 4))


if __name__ == "__main__":
    main()
