"""proj05 match on the pixels where the APPROVED picture shows its water (registered water footprint minus what the
approved picture hides: Benny + splash, coins, the bottom gold ring), rows below the HUD. Reports the share within
10 / 20 levels (mean |dRGB| per pixel, 0-255), mean error and luminance SSIM, plus where the misses come from.
usage: python3 -I tools/proj05/match_metrics.py <probe_dir> <capture.png> [...]"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
T = "qa/pilot05/proj/target"
probe = sys.argv[1]
H, W = 1536, 864
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float)
wm = np.asarray(Image.open(f"{T}/water_mask.png")) > 127
fill = np.asarray(Image.open(f"{T}/fill_mask.png")) > 127
rows = np.arange(H)[:, None] * np.ones((1, W))
R = wm & ~fill & (rows >= 196)
B = np.fromfile(f"{probe}/uv_scene.f32", np.float32).reshape(H, W, 4)
rB = (np.abs(B[..., 2] - 1) < 0.01) | (np.abs(B[..., 2] - 3) < 0.01)
def ssim(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))
out = {}
for p in sys.argv[2:]:
    c = np.asarray(Image.open(p).convert("RGB"), float)
    d = np.abs(c - ap).mean(-1)
    bad = R & (d > 20)
    out[p] = dict(px=int(R.sum()), within_10=round(float((d[R] <= 10).mean()), 4), within_20=round(float((d[R] <= 20).mean()), 4),
                  mean_abs=round(float(d[R].mean()), 2), ssim_lum=round(float(ssim(ap, c)[R].mean()), 4),
                  misses=dict(no_river_or_covered=int((bad & ~rB).sum()), river_visible=int((bad & rB).sum())))
print(json.dumps(out, indent=1))
