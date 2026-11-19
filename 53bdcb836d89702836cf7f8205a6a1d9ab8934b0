"""Compare a water-only capture (Benny, coins, bubbles, splash, foam hidden) with the proj05 TARGET on the pixels where
the game's river is the visible surface and the target is real approved water (or the artwork fill).
usage: python3 -I tools/proj05/water_metrics.py <capture.png> <probe_dir> <target_dir> [heatmap.png]"""
import json, sys
import numpy as np
from PIL import Image
cap, probe, tdir = sys.argv[1:4]
W, H = 864, 1536
B = np.fromfile(f"{probe}/uv_scene.f32", np.float32).reshape(H, W, 4)
rib = np.abs(B[..., 2] - 1) < 0.01
wm = np.asarray(Image.open(f"{tdir}/water_mask.png")) > 127
coin = np.asarray(Image.open(f"{tdir}/coin_mask.png")) > 127
fillm = np.asarray(Image.open(f"{tdir}/fill_mask.png")) > 127
t = np.asarray(Image.open(f"{tdir}/target_05.png").convert("RGB"), float)
c = np.asarray(Image.open(cap).convert("RGB"), float)
m = rib & wm & ~coin
d = np.abs(c - t).mean(-1)
rows = np.arange(H)[:, None] * np.ones((1, W))
def st(mm):
    x = d[mm]
    return dict(px=int(mm.sum()), mean_abs=float(x.mean()), median=float(np.median(x)), within_10=float((x <= 10).mean()), within_20=float((x <= 20).mean()),
                mean_signed_rgb=[float(v) for v in (c[mm] - t[mm]).mean(0)])
res = dict(all=st(m), approved_pixels=st(m & ~fillm), artwork_fill=st(m & fillm), far_rows_lt_600=st(m & (rows < 600)), near_rows_gt_1000=st(m & (rows > 1000) & ~fillm))
print(json.dumps(res, indent=1))
if len(sys.argv) > 4:
    hm = np.zeros((H, W, 3)); hm[m] = np.stack([np.clip(d[m] / 40, 0, 1), np.clip(1 - d[m] / 40, 0, 1), 0 * d[m]], -1)
    Image.fromarray((hm * 255).astype(np.uint8)).save(sys.argv[4])
