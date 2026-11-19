"""Any screen — APPROVED reference vs real-game capture, measured three ways (never one invented 'fidelity score'):
  FULL      every pixel: mean |dRGB| (0-255), share within 10 / 20 levels, luminance SSIM (7x7 Gaussian)
  BELOWHUD  the same below the HUD bar + title (rows >= 13 % of the height)
  LAYOUT    both images blurred (sigma 8 px) first: colour + composition independent of fine detail / exact edges
            (mean |dRGB| and share within 20 levels) — a big gap between FULL and LAYOUT means the right things are
            roughly in the right places but details / edges differ; a bad LAYOUT means the scene itself differs
usage: python3 -I tools/qa/screen_match.py <approved.png> <capture.png> [--json=OUT] [--label=NAME]"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
ap = Image.open(args[0]).convert("RGB")
cp = Image.open(args[1]).convert("RGB")
if cp.size != ap.size:
    cp = cp.resize(ap.size, Image.LANCZOS)
A, C = np.asarray(ap, float), np.asarray(cp, float)
H, W = A.shape[:2]


def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))


d = np.abs(A - C).mean(-1)
sm = ssim_map(A, C)
rows = np.arange(H)[:, None] * np.ones((1, W))
below = rows >= int(0.13 * H)
Ab = np.stack([gaussian_filter(A[..., k], 8) for k in range(3)], -1)
Cb = np.stack([gaussian_filter(C[..., k], 8) for k in range(3)], -1)
db = np.abs(Ab - Cb).mean(-1)


def reg(m):
    return dict(mean_abs=round(float(d[m].mean()), 2), within_10=round(float((d[m] <= 10).mean()), 4),
                within_20=round(float((d[m] <= 20).mean()), 4), ssim_lum=round(float(sm[m].mean()), 4))


full = np.ones((H, W), bool)
out = dict(label=opt.get("label", args[1]), approved=args[0], capture=args[1], size=[W, H],
           FULL=reg(full), BELOWHUD=reg(below),
           LAYOUT=dict(mean_abs=round(float(db[below].mean()), 2), within_20=round(float((db[below] <= 20).mean()), 4)),
           mean_rgb_approved=[round(float(x), 1) for x in A[below].mean(0)], mean_rgb_capture=[round(float(x), 1) for x in C[below].mean(0)])
if "json" in opt:
    json.dump(out, open(opt["json"], "w"), indent=1)
f, b, l = out["FULL"], out["BELOWHUD"], out["LAYOUT"]
print(f"{out['label']:6s} FULL |d| {f['mean_abs']:5.1f} <=20 {f['within_20']:.3f} SSIM {f['ssim_lum']:.3f} | BELOWHUD |d| {b['mean_abs']:5.1f} <=20 {b['within_20']:.3f} | "
      f"LAYOUT |d| {l['mean_abs']:5.1f} <=20 {l['within_20']:.3f} | mean RGB approved {out['mean_rgb_approved']} game {out['mean_rgb_capture']}")
