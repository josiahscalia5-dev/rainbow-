"""Round 33 kit: fit ONE straight tunnel with evenly spaced gold rings to the approved Screen 05 painting (camera at origin, fov 64).
Camera coords: x right, y up, looking down -z. Unknowns: axis direction (via vanishing point vx, vy), camera offset from the axis
(ox, oy, tunnel radius = 1), depth t2 of painted ring 2 along the axis, ring spacing S. Objective: blurred gold coverage along each
predicted ring (rings 2..7, upper 260 deg only: the bottom is under the river). Writes tunnel_fit.json."""
import sys, json, numpy as np, cv2
from scipy.optimize import minimize
gold = np.load(sys.argv[1]).astype(np.float32); H, W = gold.shape
gold[:230] = 0; gb = cv2.GaussianBlur(gold, (0, 0), 3)
FOC = (H / 2) / np.tan(np.radians(64) / 2)
def axis_from_vp(vx, vy):
    a = np.array([(vx - W / 2) / FOC, -(vy - H / 2) / FOC, -1.0]); return a / np.linalg.norm(a)
def basis(a):
    up = np.array([0, 1.0, 0]); n = up - a * (up @ a); n /= np.linalg.norm(n); r = np.cross(a, n); return n, r
def proj(P):
    z = -P[..., 2]; return W / 2 + FOC * P[..., 0] / z, H / 2 - FOC * P[..., 1] / z, z
TH = np.radians(np.linspace(-40, 220, 160))      # angle from the tunnel's right, counter-clockwise (top = 90)
def ring_pts(p, k):
    vx, vy, ox, oy, t2, S = p; a = axis_from_vp(vx, vy); n, r = basis(a)
    C = ox * r + oy * n + (t2 + (k - 2) * S) * a
    P = C[None] + np.cos(TH)[:, None] * r[None] + np.sin(TH)[:, None] * n[None]
    return proj(P)
def score(p, ks=range(2, 8)):
    tot = 0
    for k in ks:
        x, y, z = ring_pts(p, k); ok = (z > 0.05) & (x >= 0) & (x < W - 1) & (y >= 230) & (y < H - 1)
        if ok.sum() < 10: continue
        tot += gb[y[ok].astype(int), x[ok].astype(int)].mean() * (1 + 0.15 * (7 - k))
    return -tot
if __name__ == '__main__':
    # start: VP (504, 449); ring 2 radius 246 px => t2 = FOC / 246 (radius 1); camera offset from ring-centre drift (-0.137, +0.042 in px-y)
    p0 = np.array([504, 449, 0.137, -0.042, FOC / 246, FOC / 151 - FOC / 246])
    best = None
    for jit in range(12):
        st = p0 * (1 + (np.random.default_rng(jit).normal(0, 0.04, 6) if jit else 0))
        res = minimize(score, st, method='Nelder-Mead', options={'maxiter': 3000, 'xatol': 1e-3, 'fatol': 1e-5})
        if best is None or res.fun < best.fun: best = res
    p = best.x; print('fit', np.round(p, 4), 'score', -best.fun)
    for k in range(1, 11):
        x, y, z = ring_pts(p, k); top = np.argmin(np.abs(TH - np.pi / 2))
        ok = (z > 0.05) & (x >= 0) & (x < W) & (y >= 230) & (y < H)
        print(f'ring {k}: depth {z.mean():.3f}  top px ({x[top]:.0f},{y[top]:.0f})  on-gold {gb[y[ok].astype(int), x[ok].astype(int)].mean() if ok.any() else 0:.2f}')
    json.dump({'vp': [p[0], p[1]], 'offset': [p[2], p[3]], 't2': p[4], 'S': p[5], 'radius': 1.0, 'fov': 64, 'W': W, 'H': H}, open(sys.argv[2], 'w'), indent=1)
