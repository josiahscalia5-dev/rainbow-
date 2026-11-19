"""Screen 06 region measurements (pixel statistics only, never a 'fidelity score').
APPROVED vs one or more captures: whole frame, SCENERY (below the HUD/title strip, without Benny + his splash ring),
bands of the scenery (upper tunnel/rings, middle river/coins, lower river/foam), and Benny + splash.
Same statistics as tools/qa/screen_match.py (mean |dRGB|, share within 20 levels, luminance SSIM sigma 1.5).
usage: python3 -I tools/match06/measure06.py <approved.png> LABEL=<capture.png> [LABEL=<capture.png> ...] [--json=OUT]"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

args = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
A = np.asarray(Image.open(args[0]).convert("RGB"), float)
H, W = A.shape[:2]
# 864x1536 frame: HUD + title strip = rows < 208 (13.5 %); Benny + splash ring (union of the painted Benny and the
# game Benny at the checkpoint, both pictures) = x 180-680, y 540-1240
sy = H / 1536.0; sx = W / 864.0
Y, X = np.mgrid[0:H, 0:W]
hud = Y < int(208 * sy)
benny = (X >= 180 * sx) & (X < 680 * sx) & (Y >= 540 * sy) & (Y < 1240 * sy)
scen = ~hud & ~benny
REG = dict(whole=np.ones((H, W), bool), scenery=scen,
           upper=scen & (Y < 640 * sy), middle=scen & (Y >= 640 * sy) & (Y < 1000 * sy), lower=scen & (Y >= 1000 * sy),
           **{"benny+splash": benny})


def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))


out = {}
for spec in args[1:]:
    label, path = spec.split("=", 1)
    C = Image.open(path).convert("RGB")
    if C.size != (W, H):
        C = C.resize((W, H), Image.LANCZOS)
    C = np.asarray(C, float)
    d = np.abs(A - C).mean(-1); sm = ssim_map(A, C)
    out[label] = {k: dict(within_20=round(float((d[m] <= 20).mean()), 4), ssim=round(float(sm[m].mean()), 4),
                          mean_abs=round(float(d[m].mean()), 2)) for k, m in REG.items()}
    print(f"{label:10s} " + " | ".join(f"{k} {v['within_20'] * 100:5.1f}% ssim {v['ssim']:.3f}" for k, v in out[label].items()))
if "json" in opt:
    json.dump(out, open(opt["json"], "w"), indent=1)
