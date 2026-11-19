"""Screen 04 (?match04=1): fit the 3D proxy geometry to the APPROVED picture from the locked camera (cam04.json).
Tunnel = straight cylinder parallel to the slide direction D (course.ts 04: 32 deg drop, x = 2) whose mouth is the
painted big gold ring (plane perpendicular to D). Unknowns: inner radius R, axis lateral offset ax (world x), axis height
h above the path line (along the slide's up U), mouth distance sA along D from Benny's water point, outer radius Ro.
Measured on the picture (864x1536): inner ring top (440,468), widest left (72,780) / right (790,780);
outer ring top (440,415), widest left (22,780) / right (842,780). Water = flat plane at the path level.
usage: python3 -I tools/match04/fit_proxies04.py <cam04.json> <out proj04.json>"""
import json, sys, math
import numpy as np
from scipy.optimize import minimize

cam = json.load(open(sys.argv[1]))
W, H = cam["size"]; t = math.tan(math.radians(cam["fov"]) / 2); asp = W / H
MW = np.array(cam["mw"], float).reshape(4, 4).T; C = MW[:3, 3]; Rm = MW[:3, :3]
water = np.array(cam["water"], float)
D = np.array([0.0, -0.53, -0.848]); D /= np.linalg.norm(D)
X = np.array([1.0, 0, 0]); U = np.cross(X, D); U /= np.linalg.norm(U)   # slide up (perpendicular to D, upward)
if U[1] < 0: U = -U
PATHX = 2.0                                                         # the slide's world x (course.ts)
base = np.array([PATHX, water[1], water[2]])                        # Benny's water point, on the path line

def proj(Xw):
    q = (np.atleast_2d(Xw) - C) @ Rm
    return np.stack([(q[:, 0] / -q[:, 2] / (t * asp) + 1) / 2 * W, (1 - q[:, 1] / -q[:, 2] / t) / 2 * H], 1)

th = np.linspace(0, 2 * np.pi, 720, endpoint=False)
def circle(centre, r):
    return centre[None] + r * (np.cos(th)[:, None] * X[None] + np.sin(th)[:, None] * U[None])
def extremes(p):
    i_top, i_l, i_r = p[:, 1].argmin(), p[:, 0].argmin(), p[:, 0].argmax()
    return np.array([p[i_top], p[i_l], p[i_r]])

T_IN = np.array([[440, 468], [72, 780], [790, 780.0]])
T_OUT = np.array([[440, 415], [22, 780], [842, 780.0]])
def axis_at(x): return base + (x[1] - PATHX) * X * 0 + x[1] * X * 0 + np.array([x[1], 0, 0]) - np.array([PATHX, 0, 0]) * 0
def centre(x):  # x = [R, ax, h, sA]
    return np.array([x[1], 0, 0]) + np.array([0, base[1], base[2]]) + x[2] * U + x[3] * D
def err_in(x):
    if x[0] <= 0.5: return 1e9
    p = extremes(proj(circle(centre(x), x[0])))
    return ((p - T_IN) ** 2).sum()
best = None
for x0 in ([4.8, 2.0, 4.0, 10], [4.0, 2.2, 3.0, 8], [6, 2, 5, 14], [3.5, 2, 2.5, 6]):
    r = minimize(err_in, x0, method="Nelder-Mead", options=dict(maxiter=40000, xatol=1e-7, fatol=1e-7))
    if best is None or r.fun < best.fun: best = r
R, ax, h, sA = best.x; cen = centre(best.x)
ro = minimize(lambda v: ((extremes(proj(circle(cen, v[0]))) - T_OUT) ** 2).sum(), [R * 1.15], method="Nelder-Mead").x[0]
out = {"note": "Screen 04 proxy layout (tools/match04/fit_proxies04.py)", "camera": {"matrixWorld": cam["mw"], "fov": cam["fov"], "size": [W, H], "pos": C.tolist()},
       "D": D.tolist(), "U": U.tolist(), "X": X.tolist(), "water": base.tolist(),
       "tube": {"r": float(R), "ax": float(ax), "h": float(h), "mouthS": float(sA), "mouth": cen.tolist(), "outerR": float(ro)},
       "fit": {"inner_px": extremes(proj(circle(cen, R))).tolist(), "outer_px": extremes(proj(circle(cen, ro))).tolist(), "err_in": float(best.fun)},
       "checks": {"cam_height_over_water_U": float((C - base) @ U), "cam_lateral": float(C[0] - PATHX), "cam_above_axis": float((C - base) @ U - h),
                  "cam_axis_dist": float(math.hypot((C - base) @ U - h, C[0] - ax)), "vp_px": proj(C + D * 1e3)[0].tolist(),
                  "path_chord_halfwidth_at_water": float(math.sqrt(max(R * R - h * h, 0)))}}
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps({k: out[k] for k in ("tube", "fit", "checks")}, indent=0))
