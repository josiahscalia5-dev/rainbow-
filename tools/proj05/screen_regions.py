"""Screen 05 — APPROVED vs real-game capture, per region of the approved picture (no single invented 'fidelity score').
Regions are defined on the APPROVED frame (tools/proj05/tunnel_common.masks):
  HUD     top bar + title banner (drawn over the canvas; reported on its own, never mixed into tunnel numbers)
  WALL    purple perforated tunnel metal (not gold, not water, not Benny, not a lid, not the HUD)
  RING    gold ring bands (warm pixels outside the lids, coins, water, Benny and the HUD)
  LID     the six wall paddles / side fittings
  NEARFRAME the near gold frame: bottom-corner bands + bottom lip (exact nearFrameGeometry outline)
  WATER   registered water footprint minus Benny + splash and coins
  BENNY   Benny + splash (below row 760, outside the environment mask)
  COINS   coin footprint
  TUNNEL  WALL + RING + LID + NEARFRAME (the tunnel only, HUD excluded)
  FRAME   every pixel below the HUD (rows >= 196, as frame_metrics.py)
  FULL    the entire screen, HUD included
Per region: mean |dRGB| (0-255), share within 10 / 20 levels, luminance SSIM (7x7 Gaussian), mean signed dRGB (game -
approved: tells a colour bias apart from a shape mismatch).
usage: python3 -I tools/proj05/screen_regions.py <capture.png> [<capture2.png> ...] [--json=OUT.json]"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_dilation

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tunnel_common import load_approved, masks, W, H  # noqa: E402

args = [a for a in sys.argv[1:] if not a.startswith("--")]
jout = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--json=")), None)
ap8 = load_approved()
ap = ap8.astype(float)
M = masks(ap8)
coin = np.asarray(Image.open("qa/pilot05/proj/target/coin_mask.png").convert("L")) > 127
rows = np.arange(H)[:, None] * np.ones((1, W))
hud = binary_dilation(M["hud"], iterations=8)            # + the bar's soft shadow / glow
benny = ~M["env"] & (rows >= 760)
water = M["water"] & ~coin & ~benny & ~hud
lid = M["lid"] & ~hud
ring = M["warm"] & ~M["lid"] & ~M["water"] & ~coin & ~benny & ~hud
wall = ~M["warm"] & ~M["lid"] & ~M["water"] & ~coin & ~benny & ~hud & ~M["light"]
# near gold frame (tube.ts nearFrameGeometry, reference pixels): two corner bands (centre (432,1060), r 457..647,
# theta -163..-122 / -58..-17 deg) and the bottom lip (centre (432,2121), r 525..655, theta 58..122 deg)
yy, xx = np.mgrid[0:H, 0:W].astype(float)
def _arc(cx, cy, r0, r1, t0, t1):
    rr = np.hypot(xx - cx, yy - cy); th = np.degrees(np.arctan2(-(yy - cy), xx - cx))
    return (rr >= r0) & (rr <= r1) & (th >= t0) & (th <= t1)
nearframe = (_arc(432, 1060, 457, 647, -163, -122) | _arc(432, 1060, 457, 647, -58, -17) | _arc(432, 2121, 525, 655, 58, 122))
water = water & ~nearframe
REG = dict(HUD=M["hud"], WALL=wall, RING=ring, LID=lid, NEARFRAME=nearframe, TUNNEL=wall | ring | lid | nearframe, WATER=water, BENNY=benny & ~hud & ~nearframe,
           COINS=coin & ~hud, FRAME=rows >= 196, FULL=np.ones((H, W), bool))


def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))


out = {}
for p in args:
    c = np.asarray(Image.open(p).convert("RGB"), float)
    d = np.abs(c - ap).mean(-1); sm = ssim_map(ap, c); sd = c - ap
    out[p] = {k: dict(px=int(m.sum()), mean_abs=round(float(d[m].mean()), 2), within_10=round(float((d[m] <= 10).mean()), 4),
                      within_20=round(float((d[m] <= 20).mean()), 4), ssim_lum=round(float(sm[m].mean()), 4),
                      bias_rgb=[round(float(x), 1) for x in sd[m].mean(0)])
              for k, m in REG.items()}
if jout:
    with open(jout, "w") as f:
        json.dump(out, f, indent=1)
for p, r in out.items():
    print(p)
    for k, v in r.items():
        print(f"  {k:9s} px {v['px']:7d}  mean|d| {v['mean_abs']:6.2f}  <=10 {v['within_10']:.3f}  <=20 {v['within_20']:.3f}  "
              f"SSIM {v['ssim_lum']:.3f}  bias {v['bias_rgb']}")
