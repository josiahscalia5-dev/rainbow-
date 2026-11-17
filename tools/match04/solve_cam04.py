"""Screen 04 (?match04=1): solve the approved picture's camera offline at the game's FOV 62.
Unknowns: camera position relative to Benny's water point (world, 3), yaw + pitch of the view (level, no roll).
Targets measured on references/04_through_the_five_arrows.png (864x1536): Benny's visible box (fur arms to pom-pom,
fur bottom at the water) and the tunnel's vanishing point = image of the straight slide direction D (course.ts 04).
usage: python3 -I tools/match04/solve_cam04.py <bennypts.json from bennypts04.mjs> <out cam04.json>"""
import json, sys, math
import numpy as np
from scipy.optimize import minimize

d = json.load(open(sys.argv[1]))
P = np.array(d["pts"], float); water = np.array(d["water"], float)
W, H, FOV = 864, 1536, 62.0
t = math.tan(math.radians(FOV) / 2); asp = W / H
D = np.array([0.0, -0.53, -0.848]); D /= np.linalg.norm(D)
T_BOX = np.array([195, 965, 590, 1400.0]); T_VP = np.array([490, 690.0])

def basis(yaw, pitch):
    f = np.array([math.sin(yaw) * math.cos(pitch), math.sin(pitch), -math.cos(yaw) * math.cos(pitch)])
    r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    return np.stack([r, u, -f], 1)          # columns = camera x, y, z (three.js: looks down -z)

def proj(R, C, X):
    q = (np.atleast_2d(X) - C) @ R
    return np.stack([(q[:, 0] / -q[:, 2] / (t * asp) + 1) / 2 * W, (1 - q[:, 1] / -q[:, 2] / t) / 2 * H], 1)

def unpack(x): return water + x[:3], basis(x[3], x[4])
def err(x):
    C, R = unpack(x); p = proj(R, C, P)
    box = np.array([p[:, 0].min(), p[:, 1].min(), p[:, 0].max(), p[:, 1].max()])
    vp = proj(R, np.zeros(3), D[None] * 1e3)[0]
    return ((box - T_BOX) ** 2).sum() + 2 * ((vp - T_VP) ** 2).sum()

best = None
for x0 in ([0.5, 5, 4, 0, -0.6], [0, 4, 3, 0.1, -0.8], [1, 6, 5, -0.1, -0.5]):
    r = minimize(err, x0, method="Nelder-Mead", options=dict(maxiter=20000, xatol=1e-6, fatol=1e-6))
    if best is None or r.fun < best.fun: best = r
C, R = unpack(best.x); p = proj(R, C, P)
MW = np.eye(4); MW[:3, :3] = R; MW[:3, 3] = C
f = -R[:, 2]
out = {"note": "Screen 04 locked approved-view camera (tools/match04/solve_cam04.py)", "fov": FOV, "size": [W, H],
       "mw": MW.T.reshape(-1).tolist(), "pos": C.tolist(), "fwd": f.tolist(), "off04": (C - water).tolist(),
       "water": water.tolist(), "s": d["s"], "err": float(best.fun),
       "box": [float(p[:, 0].min()), float(p[:, 1].min()), float(p[:, 0].max()), float(p[:, 1].max())],
       "vp": proj(R, np.zeros(3), D[None] * 1e3)[0].tolist()}
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps({k: out[k] for k in ("off04", "fwd", "err", "box", "vp")}))
