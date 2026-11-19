#!/usr/bin/env python3
"""Screen 05 landmark extractor (same method on the approved reference and on live captures).

    python3 -I scripts/landmarks05.py IMG.png OUT.json [--label NAME]

Measures, on the 864x1536 portrait frame:
  vp        centroid of the warm white-hot light at the tunnel end (largest blob, window x 330-670 y 380-600)
  coins     gold discs on the river (window x 330-700, y 490-800): centre, width (px), area
  rows      every 10 px from y 520 to 1530: runs of hot-pink band pixels and of cyan water pixels
            (start, end, centre) — the S-bends of the river read directly off these runs
  bands     per row, the left / right pink band centre (the pink run nearest to the cyan core on each side)
  core      per row, the centre of the widest cyan run between the two bands (the cyan core)
These are crude colour-threshold measurements, reproducible and identical for every image; they are used
for camera/geometry alignment, NOT as a fidelity score.
"""
from __future__ import annotations

import json
import sys

import numpy as np
from PIL import Image
from scipy import ndimage


def runs(mask_row: np.ndarray, min_len: int = 6):
    out, x, n = [], 0, len(mask_row)
    while x < n:
        if mask_row[x]:
            x0 = x
            while x < n and mask_row[x]:
                x += 1
            if x - x0 >= min_len:
                out.append([int(x0), int(x - 1), int((x0 + x - 1) // 2)])
        else:
            x += 1
    return out


def measure(path: str) -> dict:
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.int32)
    H, W, _ = im.shape
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    # --- vanishing-point light
    hot = (np.minimum(np.minimum(r, g), b) > 215) & (r - b > 12)  # warm white-hot (foam is white-lavender: b >= r)
    win = np.zeros_like(hot)
    win[380:600, 330:670] = True
    lab, n = ndimage.label(hot & win)
    vp = None
    if n:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        k = int(np.argmax(sizes)) + 1
        cy, cx = ndimage.center_of_mass(lab == k)
        ys, xs = np.nonzero(lab == k)
        vp = {"x": round(float(cx), 1), "y": round(float(cy), 1), "px": int(sizes[k - 1]), "w": int(xs.max() - xs.min() + 1), "h": int(ys.max() - ys.min() + 1)}
    # --- coins (saturated gold on the river)
    goldm = (r > 190) & (g > 120) & (g < 235) & (b < 120) & (r - b > 110)
    cwin = np.zeros_like(goldm)
    cwin[490:800, 330:700] = True
    goldm = ndimage.binary_opening(goldm & cwin, iterations=1)
    goldm = ndimage.binary_closing(goldm, iterations=2)
    goldm = ndimage.binary_fill_holes(goldm)  # the $ glyph / rim shading leave holes in a coin
    lab, n = ndimage.label(goldm)
    coins = []
    for k in range(1, n + 1):
        ys, xs = np.nonzero(lab == k)
        if len(xs) < 25:
            continue
        w = int(xs.max() - xs.min() + 1)
        h = int(ys.max() - ys.min() + 1)
        if w > 160 or h > 120:  # a ring/lid segment, not a coin
            continue
        if len(xs) / float(w * h) < 0.45 or not (0.9 <= w / h <= 3.2):  # discs only (rings near the VP are thin arcs)
            continue
        coins.append({"x": round(float(xs.mean()), 1), "y": round(float(ys.mean()), 1), "w": w, "h": h, "area": int(len(xs))})
    coins.sort(key=lambda c: -c["y"])
    # --- river rows: pink bands + cyan water
    pink = (r > 190) & (b > 150) & (g < 140) & (r - g > 90)
    cyan = (b > 190) & (g > 110) & (r < 140) & (b - r > 90)
    rows, bands, core = [], [], []
    for y in range(520, min(H, 1531), 10):
        pr = runs(pink[y])
        cr = runs(cyan[y])
        rows.append({"y": y, "pink": pr, "cyan": cr})
        if not cr:
            continue
        # cyan core = widest cyan run that has pink on at least one side (fallback: widest run)
        best = max(cr, key=lambda q: q[1] - q[0])
        cc = best[2]
        left = [p for p in pr if p[2] < cc]
        right = [p for p in pr if p[2] > cc]
        L = max(left, key=lambda p: p[2]) if left else None
        R = min(right, key=lambda p: p[2]) if right else None
        core.append({"y": y, "x": cc, "w": best[1] - best[0] + 1})
        bands.append({"y": y, "L": L[2] if L else None, "Lw": (L[1] - L[0] + 1) if L else None, "R": R[2] if R else None, "Rw": (R[1] - R[0] + 1) if R else None})
    return {"image": path, "size": [W, H], "vp": vp, "coins": coins, "bands": bands, "core": core, "rows": rows}


if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    res = measure(a[0])
    if "--label" in sys.argv:
        res["label"] = sys.argv[sys.argv.index("--label") + 1]
    with open(a[1], "w") as f:
        json.dump(res, f, indent=1)
    print(json.dumps({"vp": res["vp"], "coins": [(c["x"], c["y"], c["w"]) for c in res["coins"]],
                      "bands@": [(b["y"], b["L"], b["R"]) for b in res["bands"] if b["y"] % 100 == 0],
                      "core@": [(c["y"], c["x"], c["w"]) for c in res["core"] if c["y"] % 100 == 0]}))
