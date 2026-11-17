"""Full-frame APPROVED vs capture comparison, reported per region (no single invented 'fidelity score').
Regions: WATER = the approved water footprint (registered artwork alpha) minus Benny + splash and coins (both differ in
the game by design: same character / gameplay coins, not part of the water); FRAME = all pixels below the HUD.
Per region: mean |dRGB| (0-255), share of pixels within 10 / 20 levels, and SSIM on luminance (7x7 Gaussian).
usage: python3 -I tools/proj05/frame_metrics.py <approved.png> <capture.png> [<capture2.png> ...]"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
T = "qa/pilot05/proj/target"
ap = np.asarray(Image.open(sys.argv[1]).convert("RGB"), float)
wm = np.asarray(Image.open(f"{T}/water_mask.png")) > 127
coin = np.asarray(Image.open(f"{T}/coin_mask.png")) > 127
env = np.asarray(Image.open("qa/worldlabs/05/05_env_mask.png").convert("L")) > 127
H, W = wm.shape
rows = np.arange(H)[:, None] * np.ones((1, W))
benny = ~env & (rows >= 760)
water = wm & ~coin & ~benny & (rows >= 196)
frame = rows >= 196
def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))
out = {}
for p in sys.argv[2:]:
    c = np.asarray(Image.open(p).convert("RGB"), float)
    d = np.abs(c - ap).mean(-1); sm = ssim_map(ap, c)
    r = {}
    for name, m in (("WATER", water), ("FRAME", frame)):
        r[name] = dict(px=int(m.sum()), mean_abs=round(float(d[m].mean()), 2), within_10=round(float((d[m] <= 10).mean()), 4),
                       within_20=round(float((d[m] <= 20).mean()), 4), ssim_lum=round(float(sm[m].mean()), 4))
    out[p] = r
print(json.dumps(out, indent=1))
