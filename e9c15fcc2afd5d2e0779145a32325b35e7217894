#!/usr/bin/env python3
"""Screen 05: measured differences between the approved image and live captures, for the three priority areas
(gold rings + purple tunnel; cyan/pink S-river into the light; lighting, foam, splashes).

    python3 -I tools/qa/diff05.py OUT.md LABEL=image ...   (first image = the reference, e.g. APPROVED=references/...)

Per horizontal band (864x1536 frame): share of gold, cyan water, pink, white foam/highlight and dark wall-slot
pixels, plus brightness p95 and mean saturation. River: the highest row (smallest y) where a 40-px-wide window
around the river centre is still mostly water, and the centre's lateral swing (S-curve amplitude) per band.
Colour classes are simple HSV rules: crude, reproducible indicators — NOT a fidelity percentage.
"""
import sys
import numpy as np
from PIL import Image

W, H = 864, 1536
BANDS = [("tunnel top 150-470", 150, 470), ("VP + far river 470-640", 470, 640), ("mid river 640-1000", 640, 1000),
         ("Benny + near water 1000-1536", 1000, 1536)]


def hsv(a):
    a = a.astype(np.float32) / 255
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, (g - b) / d % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    s = np.where(mx > 0, d / (mx + 1e-6), 0)
    return h, s, mx


def classes(a):
    h, s, v = hsv(a)
    return {
        "gold": (h >= 25) & (h <= 55) & (s > 0.45) & (v > 0.55),
        "cyan": (h >= 170) & (h <= 205) & (s > 0.35) & (v > 0.5),
        "pink": (h >= 295) & (h <= 345) & (s > 0.35) & (v > 0.55),
        "white": (s < 0.18) & (v > 0.85),
        "dark": v < 0.22,
    }, s, v


def river_stats(a):
    c, _, _ = classes(a)
    water = c["cyan"] | (c["pink"] & (np.arange(H)[:, None] > 470))
    top, centres = None, {}
    for y in range(H - 1, 420, -4):
        xs = np.nonzero(water[y, 120:744])[0]
        if xs.size < 12:
            continue
        cx = int(np.median(xs)) + 120
        win = water[y, max(0, cx - 20):cx + 20]
        if win.mean() > 0.5:
            top = y
            centres[y] = cx
    swing = {}
    for name, y0, y1 in BANDS:
        v = [x for y, x in centres.items() if y0 <= y < y1]
        swing[name] = (max(v) - min(v)) if len(v) > 2 else None
    return top, swing


def main(argv):
    out = argv[0]
    items = [x.split("=", 1) for x in argv[1:]]
    rows = ["| image | band | gold % | cyan % | pink % | white % | dark % | V p95 | mean S |", "|---|---|---|---|---|---|---|---|---|"]
    riv = ["| image | river visible up to y (smaller = further into the light) | S-swing px per band (far → near) |", "|---|---|---|"]
    for label, path in items:
        im = Image.open(path).convert("RGB")
        if im.size != (W, H):
            im = im.resize((W, H), Image.LANCZOS)
        a = np.asarray(im)
        c, s, v = classes(a)
        for name, y0, y1 in BANDS:
            sl = slice(y0, y1)
            pct = {k: 100 * m[sl].mean() for k, m in c.items()}
            rows.append(f"| {label} | {name} | {pct['gold']:.1f} | {pct['cyan']:.1f} | {pct['pink']:.1f} | {pct['white']:.1f} | "
                        f"{pct['dark']:.1f} | {np.percentile(v[sl], 95):.2f} | {s[sl].mean():.2f} |")
        top, swing = river_stats(a)
        riv.append(f"| {label} | {top} | " + ", ".join(f"{k.split(' ')[0]} {v}" for k, v in swing.items()) + " |")
    text = "\n".join(rows) + "\n\n" + "\n".join(riv) + "\n"
    open(out, "w").write(text)
    print(text)


if __name__ == "__main__":
    main(sys.argv[1:])
