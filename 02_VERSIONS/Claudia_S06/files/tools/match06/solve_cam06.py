"""Screen 06 (?match06=1): solve the approved picture's camera offline at the game's FOV 62 (Screen 04 method).
Unknowns: camera position relative to Benny's water point (world, 3), yaw + pitch (level, no roll).
Targets measured on references/06_crest_the_rinse_arch.png (864x1536):
  * Benny's visible box above the water (fur arms 205..635, pom-pom top 730, fur meets the water 1172)
  * the painted coin trail (15 coins, gold blobs) = the river line: every painted coin should lie on the image of the
    game's 06/07 river (|lateral| <= 3) raised 0.9 u (coin height) - one-sided chamfer, Huber
  * the painted tunnel's ring centre (660,630) ~ vanishing point of the 07 tube direction (weak)
usage: python3 -I tools/match06/solve_cam06.py <probe06.json> <out cam06.json>"""
import json, sys, math
import numpy as np
from scipy.optimize import minimize

d = json.load(open(sys.argv[1]))
water = np.array(d["water"], float); s_cp = d["s"]
F = d["frames"]; fs = np.array([f["s"] for f in F]); fp = np.array([f["pos"] for f in F]); fu = np.array([f["up"] for f in F])
fwater = fp[np.argmin(abs(fs - s_cp))]; upB = fu[np.argmin(abs(fs - s_cp))]
P = np.array(d["pts"], float)
P = P[(P - water) @ upB > 0.02]                          # only what shows above the water
W, H, FOV = 864, 1536, 62.0
t = math.tan(math.radians(FOV) / 2); asp = W / H
T_BOX = np.array([205, 730, 635, 1172.0])
COINS = np.array([[267.6, 716.1], [178.6, 623.8], [234.3, 548.1], [319.6, 521.3], [407.6, 534.0], [505.9, 586.1], [557.5, 623.0],
                  [594.8, 644.1], [619.1, 654.7], [642.7, 662.7], [659.5, 668.0], [675.2, 675.9], [687.8, 684.4], [696.0, 692.1], [703.4, 701.1]])
T_VP = np.array([660, 630.0])
sel = (fs > s_cp + 1.5) & (fs < d["s07"][0] + 60)
fr = np.array([f["right"] for f in F])
# coins may sit anywhere across the river (|lateral| <= 3, the 06 river is 7 u wide)
LINE = np.concatenate([fp[sel] + 0.9 * fu[sel] + k * fr[sel] for k in np.arange(-3.0, 3.01, 0.5)])
D7 = fp[(fs > d["s07"][0] + 10)][-1] - fp[(fs > d["s07"][0] + 10)][0]; D7 /= np.linalg.norm(D7)

def basis(yaw, pitch):
    f = np.array([math.sin(yaw) * math.cos(pitch), math.sin(pitch), -math.cos(yaw) * math.cos(pitch)])
    r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    return np.stack([r, u, -f], 1)

def proj(R, C, X):
    q = (np.atleast_2d(X) - C) @ R
    z = np.minimum(q[:, 2], -1e-3)
    return np.stack([(q[:, 0] / -z / (t * asp) + 1) / 2 * W, (1 - q[:, 1] / -z / t) / 2 * H], 1)

def unpack(x): return water + x[:3], basis(x[3], x[4])
def huber(r, k=12.0): a = np.abs(r); return np.where(a < k, 0.5 * a * a, k * (a - 0.5 * k))
def parts(x):
    C, R = unpack(x); p = proj(R, C, P)
    box = np.array([p[:, 0].min(), p[:, 1].min(), p[:, 0].max(), p[:, 1].max()])
    ql = (LINE - C) @ R; L = proj(R, C, LINE[ql[:, 2] < -0.5])
    ch = np.sqrt(((COINS[:, None] - L[None]) ** 2).sum(-1)).min(1) if len(L) else np.full(len(COINS), 500.0)
    vp = proj(R, np.zeros(3), D7[None] * 1e4)[0]
    return box, ch, vp
def err(x):
    box, ch, vp = parts(x)
    return ((box - T_BOX) ** 2).sum() + 2 * huber(ch).sum() + 0.3 * ((vp - T_VP) ** 2).sum()

best = None
for x0 in ([0.5, 4, 5, 0, -0.3], [0, 3, 4, 0.1, -0.2], [1, 5, 6, -0.1, -0.4], [0.5, 2.5, 6, 0.2, -0.1], [-1, 4, 6, 0.3, -0.3]):
    r = minimize(err, x0, method="Nelder-Mead", options=dict(maxiter=40000, xatol=1e-7, fatol=1e-7))
    if best is None or r.fun < best.fun: best = r
C, R = unpack(best.x); box, ch, vp = parts(best.x)
MW = np.eye(4); MW[:3, :3] = R; MW[:3, 3] = C
out = {"note": "Screen 06 locked approved-view camera (tools/match06/solve_cam06.py)", "fov": FOV, "size": [W, H],
       "mw": MW.T.reshape(-1).tolist(), "pos": C.tolist(), "fwd": (-R[:, 2]).tolist(), "off06": (C - water).tolist(),
       "water": water.tolist(), "s": s_cp, "err": float(best.fun), "box": box.tolist(), "coin_chamfer_px": ch.round(1).tolist(), "vp": vp.tolist()}
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps({k: out[k] for k in ("off06", "fwd", "err", "box", "coin_chamfer_px", "vp")}))
