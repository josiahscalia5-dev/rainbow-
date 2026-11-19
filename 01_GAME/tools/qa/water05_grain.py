#!/usr/bin/env python3
"""Screen 05 water texture indicators (water pixels only), for the W12 "silk" test.

    python3 -I tools/qa/water05_grain.py OUT.md LABEL=image ...   (first image = the reference, e.g. APPROVED=...)

Water pixels = cyan (hue 170-215) or magenta-pink (hue 290-345) with saturation > 0.3 and value > 0.35, inside the
river area of the 864x1536 frame (rows 560-1536), Benny's body box excluded. Per band it reports:
  * cyan S / V median, pink S / V median          colour depth (rich electric cyan = high S, not pastel)
  * fine grain   mean |L - blur(L, 1.5 px)|        pixel-scale texture energy (thin lines, speckle) — lower = smoother
  * broad flow   mean |blur(L, 2) - blur(L, 9)|    larger structure (lanes, swells, ribbons)
  * grain ratio  fine / broad                       "grainy" when high; silky glossy water keeps it low
  * thin white % white pixels (S < .25, V > .85) that vanish under a 5x5 opening, i.e. hair lines / speckle,
                 as a share of the band's water + white pixels
Simple, reproducible indicators — NOT a fidelity percentage.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H = 864, 1536
BANDS = [("far river 560-700", 560, 700), ("mid river 700-1000", 700, 1000), ("near water 1000-1536", 1000, 1536)]
BENNY = (250, 600, 900, 1400)   # x0, x1, y0, y1 — excluded (fur/hat are not water)


def hsv(a):
    a = a.astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, d / (mx + 1e-6), 0)
    return h, s, mx


def blur(L, r):
    im = Image.fromarray(np.clip(L * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r)), dtype=np.float32) / 255


def opening5(mask):
    im = Image.fromarray((mask * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))) > 127


def stats(path):
    a = np.asarray(Image.open(path).convert("RGB").resize((W, H), Image.LANCZOS))
    h, s, v = hsv(a)
    L = a.astype(np.float32) @ np.array([0.2126, 0.7152, 0.0722], np.float32) / 255
    fine = np.abs(L - blur(L, 1.5))
    broad = np.abs(blur(L, 2) - blur(L, 9))
    cyan = (h >= 170) & (h <= 215) & (s > 0.3) & (v > 0.35)
    pink = (h >= 290) & (h <= 345) & (s > 0.3) & (v > 0.35)
    white = (s < 0.25) & (v > 0.85)
    thin = white & ~opening5(white)
    keep = np.ones((H, W), bool)
    x0, x1, y0, y1 = BENNY
    keep[y0:y1, x0:x1] = False
    rows = []
    for name, ya, yb in BANDS:
        k = keep[ya:yb]
        c, p, w, t = cyan[ya:yb] & k, pink[ya:yb] & k, white[ya:yb] & k, thin[ya:yb] & k
        water = c | p
        area = (water | w).sum() + 1e-6
        med = lambda arr, m: float(np.median(arr[ya:yb][m])) if m.any() else float("nan")
        f = float(fine[ya:yb][water].mean()) if water.any() else float("nan")
        b = float(broad[ya:yb][water].mean()) if water.any() else float("nan")
        rows.append((name, med(s, c), med(v, c), med(s, p), med(v, p), f, b, f / max(b, 1e-6), 100 * t.sum() / area))
    return rows


def main(argv):
    out = argv[0]
    items = [x.split("=", 1) for x in argv[1:]]
    lines = ["| image | band | cyan S | cyan V | pink S | pink V | fine grain | broad flow | grain ratio | thin white % |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for label, path in items:
        for r in stats(path):
            lines.append(f"| {label} | {r[0]} | " + " | ".join(f"{x:.3f}" if i < 7 else f"{x:.2f}" for i, x in enumerate(r[1:])) + " |")
    txt = "\n".join(lines) + "\n"
    with open(out, "w") as fh:
        fh.write(txt)
    print(txt)


if __name__ == "__main__":
    main(sys.argv[1:])
