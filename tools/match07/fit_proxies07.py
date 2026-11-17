"""Screen 07 (?match07=1): fit the 3D proxy geometry to the APPROVED picture from the locked camera (cam07.json).
Tunnel = straight cylinder along the game's tube axis direction D (tools/match07/axis07.py). Slide-local frame:
X = level right (perpendicular to D), U = X x D (up), origin = Benny's water point. Unknowns: radius R, axis lateral
ax / height h, and the depth a_i of each painted gold ring R2..R5 (qa/match/07/rings/approved.json: centre + radius).
Extra measured constraint: the painted water surface meets rings R2/R3 0.53 R below their centres (h = 0.53 R).
Paddles (the half-disc hoods upper-left): ray through the painted centre, placed 0.75 u inside the wall; size from the
painted width. Coins: separate script. usage: python3 -I tools/match07/fit_proxies07.py <cam07.json> <out proj07.json>"""
import json, sys, math
import numpy as np
from scipy.optimize import least_squares

cam = json.load(open(sys.argv[1]))
W, H = cam["size"]; t = math.tan(math.radians(cam["fov"]) / 2); asp = W / H; F = (H / 2) / t
MW = np.array(cam["mw"], float).reshape(4, 4).T; C = MW[:3, 3]; Rm = MW[:3, :3]
base = np.array(cam["water"], float); D = np.array(cam["D"], float)
X = np.array([-D[2], 0, D[0]]); X /= np.linalg.norm(X); U = np.cross(X, D); U /= np.linalg.norm(U)

def proj(P):
    q = (np.atleast_2d(P) - C) @ Rm
    return np.stack([(q[:, 0] / -q[:, 2] / (t * asp) + 1) / 2 * W, (1 - q[:, 1] / -q[:, 2] / t) / 2 * H], 1)
def ray(u, v):
    d = Rm @ np.array([(u / W * 2 - 1) * t * asp, (1 - v / H * 2) * t, -1.0]); return d / np.linalg.norm(d)
th = np.linspace(0, 2 * np.pi, 360, endpoint=False)
def ring_px(R, ax, h, a):
    c = base + ax * X + h * U + a * D
    p = proj(c[None] + R * (np.cos(th)[:, None] * X[None] + np.sin(th)[:, None] * U[None]))
    m = p.mean(0); return np.array([m[0], m[1], np.linalg.norm(p - m, axis=1).mean()])

RINGS = json.load(open("qa/match/07/rings/approved.json"))["rings"]
FIT = ["R2", "R3", "R4", "R5"]
T = np.array([[RINGS[k]["cx"], RINGS[k]["cy"], RINGS[k]["r"]] for k in FIT], float)
def res(x):
    R, ax, h = x[:3]; r = []
    for i, k in enumerate(FIT): r += list((ring_px(R, ax, h, x[3 + i]) - T[i]) / np.array([1, 1, 0.5]))
    r.append(40 * (h - 0.53 * R))
    return r
x0 = [6.5, 0, 3.5] + [F * 6.5 / T[i, 2] - 5 for i in range(len(FIT))]
sol = least_squares(res, x0)
R, ax, h = sol.x[:3]; A = sol.x[3:]
# the near ring R1 (frame edge): its depth from its painted radius on the same tube (reported, not fitted)
a1 = least_squares(lambda v: [ring_px(R, ax, h, v[0])[2] - RINGS["R1"]["r"]], [2.0]).x[0]
# camera inside the tube?
cl = C - base; cam_rad = math.hypot(cl @ X - ax, cl @ U - h)
# paddles: painted centre px + painted width px (upper-left hoods, near to far)
PADDLES = [(262, 272, 160), (158, 462, 175), (388, 420, 95), (470, 492, 60), (532, 534, 38), (566, 556, 26)]
pads = []
for u, v, wpx in PADDLES:
    r = ray(u, v); rin = R - 0.75; best = None
    for k in np.arange(0.5, 120, 0.005):
        P = C + k * r; q = P - base; rad = math.hypot(q @ X - ax, q @ U - h)
        if rad >= rin: best = (k, P); break
    if best is None: print("paddle miss", u, v); continue
    k, P = best; q = P - base
    ang = math.atan2(q @ U - h, q @ X - ax)
    pads.append({"px": [u, v, wpx], "pos": P.tolist(), "dist": float(k), "along": float(q @ D), "angleDeg": math.degrees(ang), "w": float(wpx * k / F * 0.5 * 2)})
out = {"note": "Screen 07 proxy layout (tools/match07/fit_proxies07.py)",
       "camera": {"matrixWorld": cam["mw"], "fov": cam["fov"], "size": [W, H], "pos": C.tolist()},
       "D": D.tolist(), "U": U.tolist(), "X": X.tolist(), "water": base.tolist(),
       "tube": {"r": float(R), "ax": float(ax), "h": float(h)}, "rings": {k: float(a) for k, a in zip(FIT, A)} | {"R1": float(a1)},
       "paddles": pads,
       "fit": {"rings_px": {k: ring_px(R, ax, h, a).round(1).tolist() for k, a in zip(FIT, A)} | {"R1": ring_px(R, ax, h, a1).round(1).tolist()},
               "target": {k: [RINGS[k]["cx"], RINGS[k]["cy"], RINGS[k]["r"]] for k in FIT + ["R1"]}, "cost": float(sol.cost)},
       "checks": {"cam_axis_dist": cam_rad, "cam_along": float(cl @ D), "cam_height_U": float(cl @ U), "floor_halfwidth": float(math.sqrt(max(R * R - h * h, 0)))}}
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps({k: out[k] for k in ("tube", "rings", "fit", "checks")}, indent=0))
for p in pads: print({k: (round(v, 2) if isinstance(v, float) else v) for k, v in p.items() if k != "pos"})
