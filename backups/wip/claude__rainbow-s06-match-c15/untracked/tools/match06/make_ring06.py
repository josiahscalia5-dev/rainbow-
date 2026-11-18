"""Screen 06 round 15 `&m06gold=1`: the user's PAINTED gold ring band, straightened from the approved picture, as the
material of every modeled ring (src/world/match06.ts, uGold).

The nearest complete painted ring (upper-left arc, clear of HUD, coins and bubbles) is fitted with a circle through the
median of its orange band (centre ~(618, 562), r ~286 px), unwrapped in (angle, radius), and each angle column is
straightened between its own band edges (outer edge = band -> pink wall, inner edge = band -> lilac panel), so one row
of the texture = one position across the painted band. The user's pixels are only resampled, never repainted.

  python3 -I tools/match06/make_ring06.py assets/textures/match06
writes tile_ring6.png: columns = angle along the painted arc (mirrored-repeat around the ring), rows = across the band,
row 0 = OUTER edge (nearest the camera, the face) .. last row = INNER far edge (end of the band's inner cylinder)."""
import math, sys
import numpy as np, cv2
from scipy.ndimage import median_filter, gaussian_filter1d

d = sys.argv[1]
A = cv2.imread(f"{d}/plate06_hybrid.png").astype(np.float32)          # BGR, approved pixels
H, W = A.shape[:2]


def orange(p):  # BGR
    b, g, r = p[..., 0], p[..., 1], p[..., 2]
    return (r > 200) & (b < 150) & (g > 70) & (r - b > 90)


# 1. circle through the band median (iterated)
cx, cy = 650.0, 570.0
for _ in range(8):
    pts = []
    for a in np.radians(np.arange(62, 176, 1.0)):
        rs = np.arange(225, 365)
        x = (cx + rs * math.cos(a)).astype(int); y = (cy - rs * math.sin(a)).astype(int)
        ok = (x >= 0) & (x < W) & (y >= 200) & (y < H)
        m = np.zeros(len(rs), bool); m[ok] = orange(A[y[ok], x[ok]])
        if m.sum() > 8:
            rm = np.median(rs[m]); pts.append((cx + rm * math.cos(a), cy - rm * math.sin(a)))
    P = np.array(pts); x, y = P[:, 0], P[:, 1]
    c = np.linalg.lstsq(np.c_[2 * x, 2 * y, np.ones(len(x))], x * x + y * y, rcond=None)[0]
    cx, cy = c[0], c[1]; R = math.sqrt(c[2] + cx * cx + cy * cy)
print('circle', round(cx, 1), round(cy, 1), round(R, 1))

# 2. unwrap (angle 64..158 deg: clear of coins / water at the left end and of the HUD at the top-right)
NA, R0, R1, DR = 1024, R - 75, R + 75, 0.25
ang = np.radians(np.linspace(158, 64, NA))                             # left -> right along the arc
rr = np.arange(R0, R1, DR)
X = (cx + rr[:, None] * np.cos(ang)[None, :]).astype(np.float32)
Y = (cy - rr[:, None] * np.sin(ang)[None, :]).astype(np.float32)
U = cv2.remap(A, X, Y, cv2.INTER_LINEAR)                               # rows = radius (inner -> outer)

# 3. residual waviness: the band's dark middle line (darkest row inside the band, per column) fitted with a cubic in
#    the angle, and the band edges (orange extent) taken as medians relative to that line -> straight rows
L = U @ np.array([0.11, 0.59, 0.3], np.float32)
m = orange(U)
mid = np.full(NA, np.nan)
for j in range(NA):
    k = np.where(m[:, j])[0]
    if len(k) > 40:
        lo, hi = int(np.percentile(k, 15)), int(np.percentile(k, 85))
        if hi - lo > 10: mid[j] = lo + int(np.argmin(gaussian_filter1d(L[lo:hi, j], 2)))
ok = ~np.isnan(mid); xs = np.arange(NA)
cf = np.polyfit(xs[ok], mid[ok], 3)
for _ in range(3):  # robust refit
    res = mid - np.polyval(cf, xs); ok = ok & (np.abs(np.nan_to_num(res, nan=1e9)) < 2.5 * np.nanstd(res[ok]))
    cf = np.polyfit(xs[ok], mid[ok], 3)
midf = np.polyval(cf, xs)
inner = np.full(NA, np.nan); outer = np.full(NA, np.nan)
for j in range(NA):
    k = np.where(m[:, j])[0]
    if len(k) > 20: inner[j], outer[j] = np.percentile(k, 3) - midf[j], np.percentile(k, 97) - midf[j]
di, do = np.nanmedian(inner), np.nanmedian(outer)
print('band px: inner', round(float(R0 + (midf.mean() + di) * DR), 1), 'mid', round(float(R0 + midf.mean() * DR), 1),
      'outer', round(float(R0 + (midf.mean() + do) * DR), 1), 'wave px', round(float(np.ptp(midf) * DR), 1))

# 4. straighten: NR rows from OUTER edge (row 0) to INNER edge, with a small margin of the neighbouring dark lines
NR, MARG = 256, 0.04
out = np.zeros((NR, NA, 3), np.float32)
t = np.linspace(-MARG, 1 + MARG, NR)
for j in range(NA):
    rows = midf[j] + do + (di - do) * t
    for ch in range(3): out[:, j, ch] = np.interp(rows, np.arange(U.shape[0]), U[:, j, ch])
cv2.imwrite(f"{d}/tile_ring6.png", np.clip(out, 0, 255).astype(np.uint8))
print('wrote', f"{d}/tile_ring6.png", out.shape)
