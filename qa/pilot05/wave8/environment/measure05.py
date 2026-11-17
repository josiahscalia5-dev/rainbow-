#!/usr/bin/env python3
"""Wave-8 environment windows for Screen 05 (crude, reproducible indicators; NOT a fidelity %).

    python3 -I qa/pilot05/wave8/environment/measure05.py LABEL=path.png [LABEL=path.png ...]

All windows are in reference pixels (864x1536); captures are resized to that size first.
Pixel classes (HSV, hue in degrees, only pixels with S > 0.3 and V > 0.25 get a hue class):
  violet  = hue 255..300       magenta = hue 300..345
  gold    = hue 12..55, S > 0.45, V > 0.5        spec-white = V > 0.86 and S < 0.32
"""
from __future__ import annotations

import sys

import numpy as np
from PIL import Image, ImageFilter


def hsv(a: np.ndarray):
    a = a.astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    d = mx - mn + 1e-6
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60.0
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return h, s, mx


def classes(a):
    h, s, v = hsv(a)
    col = (s > 0.3) & (v > 0.25)
    return {
        "violet": col & (h >= 255) & (h < 300),
        "magenta": col & (h >= 300) & (h < 345),
        "gold": (h >= 12) & (h <= 55) & (s > 0.45) & (v > 0.5),
        "white": (v > 0.86) & (s < 0.32),
        "rose": col & ((h >= 345) | (h < 12)),
    }


def win(a, x0, y0, x1, y1):
    return a[y0:y1, x0:x1]


def shares(a):
    c = classes(a)
    n = a.shape[0] * a.shape[1]
    vm = c["violet"].sum() + c["magenta"].sum()
    return {
        "violet/(v+m)": float(round(100 * c["violet"].sum() / max(vm, 1), 1)),
        "white": float(round(100 * c["white"].sum() / n, 1)),
        "gold": float(round(100 * c["gold"].sum() / n, 1)),
        "rose": float(round(100 * c["rose"].sum() / n, 1)),
    }


def vp_centre(a):
    # fixed: the hot core of both the reference and the live checkpoint sits at (499, 478) (4x crops);
    # core px = near-white pixels inside r < 40
    H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    _, s, v = hsv(a)
    m = (np.hypot(xx - 499, yy - 478) < 40) & (v > 0.93) & (s < 0.4)
    return 499, 478, int(m.sum())


def ring_stats(a, cx, cy, r0, r1):
    H, W = a.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    rr = np.hypot(xx - cx, yy - cy)
    m = (rr >= r0) & (rr < r1) & (yy < cy + 10)
    return a[m]


def measure(path: str) -> dict:
    im = Image.open(path).convert("RGB")
    if im.size != (864, 1536):
        im = im.resize((864, 1536), Image.LANCZOS)
    a = np.asarray(im)
    out = {}
    # 1 ring #1 top band (x 380..620, y 186..236) — class shares + mean RGB
    rw = win(a, 380, 186, 620, 236)
    c = classes(rw)
    n = rw.shape[0] * rw.shape[1]
    out["ring1 mean"] = tuple(int(x) for x in rw.reshape(-1, 3).mean(0))
    out["ring1 gold/white/rose/violet+mag %"] = (
        float(round(100 * c["gold"].sum() / n, 1)), float(round(100 * c["white"].sum() / n, 1)),
        float(round(100 * c["rose"].sum() / n, 1)), float(round(100 * (c["violet"].sum() + c["magenta"].sum()) / n, 1)))
    gm = c["gold"]
    out["ring1 gold-pixel mean"] = tuple(int(x) for x in rw[gm].mean(0)) if gm.sum() else None
    # 2 walls
    out["upper wall x300-700 y190-300"] = shares(win(a, 300, 190, 700, 300))
    out["left wall x0-130 y420-620"] = shares(win(a, 0, 420, 130, 620))
    lw = win(a, 0, 420, 130, 620).reshape(-1, 3)
    out["left wall mean"] = tuple(int(x) for x in lw.mean(0))
    # 3 lid L1
    lid = win(a, 62, 318, 215, 420)
    _, _, v = hsv(lid)
    out["lid L1 mean / V std"] = (tuple(int(x) for x in lid.reshape(-1, 3).mean(0)), round(float(v.std()), 3))
    out["lid L1 shares"] = shares(lid)
    # 4 VP
    cx, cy, ncore = vp_centre(a)
    out["VP centre / core px"] = (int(cx), int(cy), ncore)
    for r0, r1 in [(0, 8), (8, 16), (16, 24), (24, 32), (32, 48), (48, 64), (64, 90)]:
        px = ring_stats(a, cx, cy, r0, r1)
        h, s, v = hsv(px[None])
        warm = ((h < 60) | (h > 345)) & (s > 0.25) & (v > 0.6)
        wht = (v > 0.86) & (s < 0.32)
        out[f"VP r{r0}-{r1} mean / warm% / white%"] = (tuple(int(x) for x in px.mean(0)), round(100 * float(warm.mean()), 1), round(100 * float(wht.mean()), 1))
    # 5 near frame
    for name, box in [("BL", (0, 1300, 130, 1536)), ("BR", (734, 1300, 864, 1536)), ("bottom arc", (200, 1480, 664, 1536))]:
        w = win(a, *box)
        out[f"frame {name} gold %"] = float(round(100 * classes(w)["gold"].mean(), 1))
    return out


def main(argv):
    rows = [(x.split("=", 1)) for x in argv]
    res = {lab: measure(p) for lab, p in rows}
    keys = list(next(iter(res.values())).keys())
    print("| window | " + " | ".join(lab for lab, _ in rows) + " |")
    print("|---|" + "---|" * len(rows))
    for k in keys:
        print(f"| {k} | " + " | ".join(str(res[lab][k]) for lab, _ in rows) + " |")


if __name__ == "__main__":
    main(sys.argv[1:])
