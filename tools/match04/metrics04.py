"""Screen 04: approved vs capture by region (same measures as tools/qa/screen_match.py: share within 20 levels, SSIM).
SCENERY = below the HUD/title (rows >= 13 %) without Benny (his ellipses from tools/match04/make_plate04.py).
usage: python3 -I tools/match04/metrics04.py <approved.png> <before.png> <new.png> <out.json>"""
import json, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import gaussian_filter
ap = Image.open(sys.argv[1]).convert("RGB"); W, H = ap.size
load = lambda p: np.asarray(Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS), float)
A = np.asarray(ap, float)
def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))
B = np.zeros((H, W), np.uint8)
cv2.ellipse(B, (400, 1032), (84, 78), 0, 0, 360, 1, -1); cv2.ellipse(B, (395, 1160), (172, 92), 0, 0, 360, 1, -1)
cv2.ellipse(B, (392, 1290), (224, 130), 0, 0, 360, 1, -1); B = B.astype(bool)
rows = np.arange(H)[:, None] * np.ones((1, W))
R = {"FULL": np.ones((H, W), bool), "BELOWHUD": rows >= int(0.13 * H), "SCENERY": (rows >= int(0.13 * H)) & ~B,
     "upper_room_ringtop_y200_560": (rows >= 200) & (rows < 560), "middle_tunnel_arrows_coins_y560_960": (rows >= 560) & (rows < 960) & ~B,
     "lower_water_foam_y960_1536_noBenny": (rows >= 960) & ~B, "BENNY": B}
out = {}
for name, p in (("BEFORE", sys.argv[2]), ("NEW", sys.argv[3])):
    C = load(p); d = np.abs(A - C).mean(-1); sm = ssim_map(A, C)
    out[name] = {k: {"within_20": round(float((d[m] <= 20).mean()), 4), "mean_abs": round(float(d[m].mean()), 2), "ssim": round(float(sm[m].mean()), 4)} for k, m in R.items()}
json.dump(out, open(sys.argv[4], "w"), indent=1)
for k in R: print(f"{k:38s} BEFORE {out['BEFORE'][k]['within_20']*100:5.1f} %  SSIM {out['BEFORE'][k]['ssim']:.3f}   NEW {out['NEW'][k]['within_20']*100:5.1f} %  SSIM {out['NEW'][k]['ssim']:.3f}")
