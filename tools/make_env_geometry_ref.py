#!/usr/bin/env python3
"""Screen 05 geometry-focused tunnel reference: REAL PIXELS ONLY (0 invented pixels).

After three fill methods failed to give a clean river (v1 copied pieces, v2 procedural repaint, v3 harmonic /
FSR / exemplar coin fills: see qa/worldlabs/05/rejected/README.md), the Marble/Atlas reference is a straight
crop of the approved image: rows 197–767, i.e. below the HUD and above Benny's pom-pom. It keeps the
perforated magenta-violet walls, gold rings, wall fittings, the golden glow, foam banks, bubbles and the
mid-distance S-bends exactly as approved. The coins stay in; a separate flag mask marks them as game objects
to delete after reconstruction (the game has its own coins and its own 3D river, see
qa/worldlabs/05/blender/screen05_layout.blend).

    python3 -I tools/make_env_geometry_ref.py references/05_flow_into_the_current.png qa/worldlabs/05/geometry_ref

Outputs: 1_original_approved_05.png (byte-identical copy), 2_geometry_reference_05.png (the crop),
3_mask_05.png (black = real pixels kept unchanged; white = coins flagged for removal after reconstruction;
nothing is reconstructed), 3_mask_overlay_05.png (readable version) and check.json (pixel identity proof).
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

TOP, BOTTOM = 197, 768


def main() -> None:
    ref_path, outdir = Path(sys.argv[1]), Path(sys.argv[2])
    outdir.mkdir(parents=True, exist_ok=True)
    ref = cv2.imread(str(ref_path), cv2.IMREAD_COLOR)
    H, W = ref.shape[:2]
    shutil.copyfile(ref_path, outdir / "1_original_approved_05.png")
    strip = ref[TOP:BOTTOM].copy()
    cv2.imwrite(str(outdir / "2_geometry_reference_05.png"), strip)

    # coin flag mask: gold pixels on the river trail, convex hull per coin, small rim margin
    yy, xx = np.mgrid[0:H, 0:W]
    hsv = cv2.cvtColor(ref, cv2.COLOR_BGR2HSV)
    hue, sat, val = hsv[..., 0].astype(int) * 2, hsv[..., 1], hsv[..., 2]
    gold = (hue >= 28) & (hue <= 62) & (sat > 120) & (val > 150) & (yy >= 484) & (yy <= 790) & (xx >= 340) & (xx <= 660)
    n, lab, st, _ = cv2.connectedComponentsWithStats(gold.astype(np.uint8), 8)
    flag = np.zeros((H, W), np.uint8)
    for i in range(1, n):
        if st[i, 4] < 15:
            continue
        cnts, _ = cv2.findContours((lab == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        for c in cnts:
            cv2.drawContours(flag, [cv2.convexHull(c)], -1, 255, -1)
    flag = cv2.dilate(flag, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    fm = flag[TOP:BOTTOM]
    cv2.imwrite(str(outdir / "3_mask_05.png"), fm)
    vis = (strip.astype(float) * 0.5).astype(np.uint8)
    vis[fm > 0] = (0.4 * strip[fm > 0] + 0.6 * np.array([40, 40, 255])).astype(np.uint8)
    cnts, _ = cv2.findContours(fm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(vis, cnts, -1, (60, 60, 255), 2)
    cv2.imwrite(str(outdir / "3_mask_overlay_05.png"), vis)

    back = cv2.imread(str(outdir / "2_geometry_reference_05.png"), cv2.IMREAD_COLOR)
    identical = bool(np.array_equal(back, ref[TOP:BOTTOM]))
    check = {
        "reference": str(ref_path),
        "reference_sha256": hashlib.sha256(ref_path.read_bytes()).hexdigest(),
        "copy_sha256": hashlib.sha256((outdir / "1_original_approved_05.png").read_bytes()).hexdigest(),
        "crop_rows": [TOP, BOTTOM - 1], "crop_size": [W, BOTTOM - TOP],
        "geometry_reference_pixels_identical_to_original_rows": identical,
        "invented_pixels": 0,
        "coins_flagged_share_of_strip": round(float((fm > 0).mean()), 4),
    }
    (outdir / "check.json").write_text(json.dumps(check, indent=2) + "\n")
    print(json.dumps(check))


if __name__ == "__main__":
    main()
