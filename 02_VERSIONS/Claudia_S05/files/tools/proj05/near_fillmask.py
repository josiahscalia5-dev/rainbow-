"""Screen 05 near tile — where the proj05 water is NOT the approved picture but the user's isolated artwork (the fill
under the approved Benny + splash, coins, bottom ring: qa/pilot05/proj/target/fill_mask.png), in SOURCE river
coordinates (u across -1..1, s along). tools/proj05/near_bake.py heals the colour seam along this outline, which is
hidden behind Benny at the locked camera but exposed when the tile repeats down the river.
Input: the locked-view river coordinates per screen pixel (scripts/proj05-ride-probe.mjs --d=0 -> ride_00.f32, or the
compressed copy qa/pilot05/proj/near/probe/ride_00.npz).
usage: python3 -I tools/proj05/near_fillmask.py <ride_00.f32 | ride_00.npz> [fill_mask.png] [out.png]
out (default tools/proj05/near_fillmask_src.png): 512 x 1312 L, x = u, y = s from S0 = 129.5 at 64 rows per unit."""
import sys
import numpy as np, cv2
from PIL import Image

probe = sys.argv[1]
fill = sys.argv[2] if len(sys.argv) > 2 else "qa/pilot05/proj/target/fill_mask.png"
out = sys.argv[3] if len(sys.argv) > 3 else "tools/proj05/near_fillmask_src.png"
H, W = 1536, 864
S0, S1, DENS, GW = 129.5, 150.0, 64, 512
GH = int((S1 - S0) * DENS)
if probe.endswith(".npz"):                        # the compressed copy kept in git (qa/pilot05/proj/near/probe/)
    z = np.load(probe); riv = z["river"]; Ru, Rs = z["u"].astype(np.float32), z["s"]
else:
    R = np.fromfile(probe, np.float32).reshape(H, W, 4)
    riv = R[..., 2] > 0.5; Ru, Rs = R[..., 0], R[..., 1]
fm = np.asarray(Image.open(fill).convert("L")) > 127
u, s, v = Ru[riv], Rs[riv], fm[riv].astype(np.float32)
x = np.clip(((u + 1) / 2 * GW).astype(int), 0, GW - 1)
y = ((s - S0) * DENS).astype(int)
ok = (y >= 0) & (y < GH)
acc = np.zeros((GH, GW), np.float32); cnt = np.zeros((GH, GW), np.float32)
np.add.at(acc, (y[ok], x[ok]), v[ok]); np.add.at(cnt, (y[ok], x[ok]), 1)
k = np.ones((7, 7), np.float32)                       # close the splat gaps of the sparse far rows
m = cv2.filter2D(acc, -1, k) / np.maximum(cv2.filter2D(cnt, -1, k), 1e-6)
seen = cv2.filter2D(cnt, -1, k) > 0
Image.fromarray((np.where(seen, m, 0) > 0.5).astype(np.uint8) * 255).save(out, optimize=True)
print(out, (GW, GH), "fill share of the seen grid:", round(float((m > 0.5)[seen].mean()), 3))
