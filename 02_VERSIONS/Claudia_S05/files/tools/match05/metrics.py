"""Screen 05 full reference match — whole-frame and per-region comparison of a REAL game capture with the APPROVED image.
Masks: qa/pilot05/full_reference_match/masks/region_index.png (tools/match05/regions.py; every pixel in exactly one region).
Per region and for the whole frame: pixels, mean |dRGB| (0-255, mean over channels), share within 10 / 20 levels,
luminance SSIM (Gaussian sigma 1.5), mean signed RGB (capture - approved: colour contamination).
These are pixel statistics, NOT a universal "visual similarity percentage"; each number is reported next to its mask.
usage: python3 -I tools/match05/metrics.py <capture.png> <out_prefix> [--proof <before.png>]
  -> <out_prefix>REGION_METRICS.json, <out_prefix>FULL_FRAME_METRICS.json
  --proof also writes 04_DIFFERENCE.png and 05_OVERLAY.png next to the prefix"""
import json, sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter
M = "qa/pilot05/full_reference_match/masks"
cap, pre = sys.argv[1], sys.argv[2]
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float)
c = np.asarray(Image.open(cap).convert("RGB"), float)
idx = np.asarray(Image.open(f"{M}/region_index.png"))
names = {v["id"]: k for k, v in json.load(open(f"{M}/regions.json"))["regions"].items()}
d = np.abs(c - ap).mean(-1)
def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))
sm = ssim_map(ap, c)
def st(m):
    return dict(px=int(m.sum()), share_of_frame=round(float(m.mean()), 4), mean_abs=round(float(d[m].mean()), 2),
                within_10=round(float((d[m] <= 10).mean()), 4), within_20=round(float((d[m] <= 20).mean()), 4),
                ssim_lum=round(float(sm[m].mean()), 4), mean_signed_rgb=[round(float(v), 1) for v in (c[m] - ap[m]).mean(0)])
reg = {names[i]: st(idx == i) for i in sorted(names)}
full = dict(capture=cap, whole_frame=st(np.ones_like(idx, bool)),
            note="whole frame = all 864x1536 pixels, nothing excluded; pixel statistics, not a perceptual score",
            mse=round(float(((c - ap) ** 2).mean()), 1), psnr_db=round(float(10 * np.log10(255 ** 2 / ((c - ap) ** 2).mean())), 2))
json.dump(dict(capture=cap, regions=reg), open(pre + "REGION_METRICS.json", "w"), indent=1)
json.dump(full, open(pre + "FULL_FRAME_METRICS.json", "w"), indent=1)
print("FULL", full["whole_frame"])
for k, v in reg.items(): print(f"{k:28s} px {v['px']:7d}  mean {v['mean_abs']:6.2f}  <=10 {v['within_10']:.3f}  <=20 {v['within_20']:.3f}  ssim {v['ssim_lum']:.3f}  signed {v['mean_signed_rgb']}")
if "--proof" in sys.argv:
    outd = os.path.dirname(pre) or "."
    # 04 difference: grey approved underlay; green <= 10, yellow 10-20, orange 20-40, red > 40 levels
    g = np.stack([ap.mean(-1)] * 3, -1) * 0.35
    col = np.zeros_like(g)
    col[d <= 10] = (40, 200, 70); col[(d > 10) & (d <= 20)] = (235, 220, 40); col[(d > 20) & (d <= 40)] = (245, 140, 30); col[d > 40] = (235, 40, 40)
    o = (g + 0.65 * col).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(o); dr = ImageDraw.Draw(im)
    dr.rectangle([0, 1440, 863, 1535], fill=(0, 0, 0))
    leg = [((40, 200, 70), "within 10 levels of APPROVED"), ((235, 220, 40), "10-20 levels"), ((245, 140, 30), "20-40 levels"), ((235, 40, 40), "more than 40 levels")]
    for i, (cc, t) in enumerate(leg):
        x = 12 + (i % 2) * 430; y = 1450 + (i // 2) * 40
        dr.rectangle([x, y, x + 26, y + 26], fill=cc); dr.text((x + 36, y + 7), t, fill=(255, 255, 255))
    dr.text((12, 1522), "IMAGE 4 - DIFFERENCE: NEW vs APPROVED, mean |dRGB| per pixel (0-255)", fill=(255, 255, 255))
    im.save(os.path.join(outd, "04_DIFFERENCE.png"))
    Image.fromarray(((ap + c) / 2).astype(np.uint8)).save(os.path.join(outd, "05_OVERLAY.png"))
