"""proj05 colour feedback: (capture - target) on visible river pixels, outliers (Benny, coins, bubbles, splash) rejected,
smoothed, ACCUMULATED into <target_dir>/correction.npz; tools/proj05/bake.py subtracts it from the target before baking.
This removes what the shader cannot undo analytically (the bloom pass adds light around bright streaks).
usage: python3 -I tools/proj05/residual.py <capture.png> <probe_dir> <target_dir> [gain=0.85]"""
import os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_dilation
cap, probe, tdir = sys.argv[1:4]
gain = float(sys.argv[4]) if len(sys.argv) > 4 else 0.85
W, H = 864, 1536
B = np.fromfile(f"{probe}/uv_scene.f32", np.float32).reshape(H, W, 4)
river = (np.abs(B[..., 2] - 1) < 0.01) | (np.abs(B[..., 2] - 3) < 0.01)
wm = np.asarray(Image.open(f"{tdir}/water_mask.png")) > 127
coin = np.asarray(Image.open(f"{tdir}/coin_mask.png")) > 127
t = np.asarray(Image.open(f"{tdir}/target_05.png").convert("RGB"), float) / 255
c = np.asarray(Image.open(cap).convert("RGB"), float) / 255
r = c - t
bad = np.abs(r).max(-1) > 40 / 255                       # objects in front of the water (Benny, coins, bubbles, splash)
bad = binary_dilation(bad, iterations=3)
m = (river & wm & ~coin & ~bad).astype(float)
sig = 4.0
den = gaussian_filter(m, sig)
rs = np.stack([gaussian_filter(r[..., i] * m, sig) for i in range(3)], -1) / np.maximum(den, 1e-4)[..., None]
rs *= np.clip(den / 0.25, 0, 1)[..., None]                # fade where there is little support
p = os.path.join(tdir, "correction.npz")
acc = np.load(p)["c"].astype(np.float64) if os.path.exists(p) else np.zeros_like(rs)
acc = acc + gain * rs
np.savez_compressed(p, c=acc.astype(np.float16))
print("residual on used pixels: mean signed rgb", (r[m > 0].mean(0) * 255).round(2).tolist(), " mean abs", float(np.abs(r[m > 0]).mean() * 255), " used px", int(m.sum()))
