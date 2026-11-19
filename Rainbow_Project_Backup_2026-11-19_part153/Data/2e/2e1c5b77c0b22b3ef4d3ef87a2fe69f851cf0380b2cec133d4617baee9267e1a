"""Screen 05 riding-water sharpness (`?projnear05` work, 2026-11-16) — measured on REAL game captures, never a score.
For each ride distance d (frames from scripts/proj05-move.mjs --d=…) and each screen band of the river, reports:
  grad    mean Sobel gradient magnitude of luminance (0-255 scale): edge / streak crispness — higher = sharper
  lapstd  standard deviation of the Laplacian: fine detail (glints, thin streaks)
  sat     mean HSV saturation in %: the electric-blue / hot-pink colour strength (a pastel smear lowers it)
  p95     95th percentile of luminance: the brightest glossy highlights
River pixels come from scripts/proj05-ride-probe.mjs (the ribbon's own (u, s) per pixel, Benny and coins hidden);
Benny's box is left out of every band (he is identical in all versions, he would only dilute the differences).
Bands (864x1536 portrait): bottom = rows 1200-1480 (2-3 u behind Benny), benny = rows 900-1200 beside him,
ahead = rows 700-900 (about 2-8 u ahead).  At d = 0 the APPROVED picture is measured in the same bands as the target.
usage: python3 -I tools/proj05/near_metrics.py <probe_dir> <out.json> LABEL=<frames_dir> [LABEL=<frames_dir> …]
       [--approved=references/05_flow_into_the_current.png] [--d=00,08,17,35]"""
import json, os, sys
import numpy as np, cv2
from PIL import Image

pos = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
probe, out = pos[0], pos[1]
runs = [p.split("=", 1) for p in pos[2:]]
APPROVED = opt.get("approved", "references/05_flow_into_the_current.png")
DS = opt.get("d", "00,08,17,35").split(",")
H, W = 1536, 864
BANDS = {"bottom": (1200, 1480), "benny": (900, 1200), "ahead": (700, 900)}
BENNY_BOX = (230, 700, 700, 1200)          # x0, x1, y0, y1


def load(p):
    return np.asarray(Image.open(p).convert("RGB"))


def measure(img, m):
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32)
    grad = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3))
    lap = cv2.Laplacian(g, cv2.CV_32F, ksize=3)
    sat = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)[..., 1].astype(np.float32) / 2.55
    return dict(grad=round(float(grad[m].mean()), 2), lapstd=round(float(lap[m].std()), 2),
                sat=round(float(sat[m].mean()), 1), p95=round(float(np.percentile(g[m], 95)), 1))


res = {"method": __doc__.split("\n")[0], "bands": BANDS, "benny_box": BENNY_BOX, "frames": {}}
for d in DS:
    R = np.fromfile(os.path.join(probe, f"ride_{d}.f32"), np.float32).reshape(H, W, 4)
    riv = cv2.erode((R[..., 2] > 0.5).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
    keep = np.ones((H, W), bool)
    x0, x1, y0, y1 = BENNY_BOX
    keep[y0:y1, x0:x1] = False
    row = {}
    for band, (r0, r1) in BANDS.items():
        m = np.zeros((H, W), bool); m[r0:r1] = True; m &= riv & keep
        row[band] = {"px": int(m.sum())}
        for label, folder in runs:
            f = os.path.join(folder, f"move_{d}.png")
            if os.path.exists(f):
                row[band][label] = measure(load(f), m)
        if d == "00" and os.path.exists(APPROVED):
            row[band]["APPROVED"] = measure(load(APPROVED), m)
    res["frames"][d] = row
json.dump(res, open(out, "w"), indent=1)
for d, row in res["frames"].items():
    print(f"\n== {d} units ahead of the locked checkpoint")
    for band, v in row.items():
        print(f"  {band:7s} ({v['px']} px)")
        for label, mm in v.items():
            if label == "px":
                continue
            print(f"     {label:12s} grad {mm['grad']:6.2f}  lapstd {mm['lapstd']:6.2f}  sat {mm['sat']:5.1f}%  p95 {mm['p95']:5.1f}")
