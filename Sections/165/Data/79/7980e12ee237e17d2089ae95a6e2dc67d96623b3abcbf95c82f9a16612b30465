"""Screen 06 (?match06=1): joint fit of the approved camera AND a 06 river-path correction so the game's river runs
along the PAINTED river (Screen 08 method: river path following the painted water).
Path correction (course.ts, 06 segment only, seg parameter t in [0,1]): dx(t), dy(t) = sin^2(pi t) * (c0 + c1 cos(pi t)
+ c2 cos(2 pi t)) -> value AND slope are 0 at both ends, so the 05->06 join and the whole 07 / plunge / 08 route stay
exactly where they are. Targets on references/06_crest_the_rinse_arch.png (864x1536):
  * Benny's visible box above the water (205,730)-(635,1172)
  * the 15 painted coins, IN ORDER along the river (dynamic programming over river samples, |lateral| <= 2.5, coin
    centre 0.9 u above the water)
  * the painted river's top edge at the crest (y >= 505): the river centre line may not rise above it
  * the painted tunnel's vanishing point (660,630) for the 07 direction (weak)
usage: python3 -I tools/match06/fit_river06.py <probe06.json> <out cam06.json> [<prev cam06.json> to keep the offsets]"""
import json, sys, math
import numpy as np
from scipy.optimize import minimize

d = json.load(open(sys.argv[1]))
F = d["frames"]; fs = np.array([f["s"] for f in F]); fp = np.array([f["pos"] for f in F])
fu = np.array([f["up"] for f in F]); fr = np.array([f["right"] for f in F])
s6a, s6b = d["s06"]; s_cp = d["s"]
z6 = fp[np.argmin(abs(fs - s6a))][2]
prev = json.load(open(sys.argv[3]))["path06"] if len(sys.argv) > 3 else {"dx": [0, 0, 0], "dy": [0, 0, 0]}
# the probe was taken WITH prev applied: remove it to get the default route, the fit then returns absolute coefficients
tseg = np.clip((z6 - fp[:, 2]) / 46.0, 0, 1); in6 = (fs >= s6a) & (fs <= s6b + 1e-6)
def bump(c, t): t = np.asarray(t); return np.sin(np.pi * t) ** 2 * (c[0] + c[1] * np.cos(np.pi * t) + c[2] * np.cos(2 * np.pi * t))
base = fp.copy(); base[:, 0] -= np.where(in6, bump(prev["dx"], tseg), 0); base[:, 1] -= np.where(in6, bump(prev["dy"], tseg), 0)
iB = np.argmin(abs(fs - s_cp)); tB = tseg[iB]; upB = fu[iB]
water0 = np.array(d["water"], float)
P0 = np.array(d["pts"], float); P0 = P0[(P0 - water0) @ upB > 0.02]
W, H, FOV = 864, 1536, 62.0
t = math.tan(math.radians(FOV) / 2); asp = W / H
T_BOX = np.array([205, 730, 635, 1172.0])
COINS = np.array([[267.6, 716.1], [178.6, 623.8], [234.3, 548.1], [319.6, 521.3], [407.6, 534.0], [505.9, 586.1], [557.5, 623.0],
                  [594.8, 644.1], [619.1, 654.7], [642.7, 662.7], [659.5, 668.0], [675.2, 675.9], [687.8, 684.4], [696.0, 692.1], [703.4, 701.1]])
T_VP = np.array([660, 630.0])
sel = (fs > s_cp + 1.0) & (fs < d["s07"][0] + 60)
LATS = np.arange(-2.5, 2.51, 0.5)
D7 = base[(fs > d["s07"][0] + 10)][-1] - base[(fs > d["s07"][0] + 10)][0]; D7 /= np.linalg.norm(D7)
def basis(yaw, pitch):
    f = np.array([math.sin(yaw) * math.cos(pitch), math.sin(pitch), -math.cos(yaw) * math.cos(pitch)])
    r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
    return np.stack([r, u, -f], 1)
def proj(R, C, X):
    q = (np.atleast_2d(X) - C) @ R; z = np.minimum(q[..., 2], -1e-3)
    return np.stack([(q[..., 0] / -z / (t * asp) + 1) / 2 * W, (1 - q[..., 1] / -z / t) / 2 * H], -1), q[..., 2]
def route(x):
    p = base.copy(); p[:, 0] += np.where(in6, bump(x[5:8], tseg), 0); p[:, 1] += np.where(in6, bump(x[8:11], tseg), 0); return p
def parts(x):
    p = route(x)
    shift = np.array([bump(x[5:8], tB), bump(x[8:11], tB), 0.0])
    water = water0 + shift; C = water + x[:3]; R = basis(x[3], x[4])
    pb, _ = proj(R, C, P0 + shift)
    box = np.array([pb[:, 0].min(), pb[:, 1].min(), pb[:, 0].max(), pb[:, 1].max()])
    L = p[sel][:, None] + 0.9 * fu[sel][:, None] + LATS[None, :, None] * fr[sel][:, None]
    pl, zl = proj(R, C, L)
    dist = np.sqrt(((pl[None] - COINS[:, None, None]) ** 2).sum(-1))       # coins x samples x lats
    dist = np.where(zl[None] < -0.5, dist, 1e4).min(-1)
    dp = dist[0].copy()
    for i in range(1, len(COINS)):
        pm = np.minimum.accumulate(np.concatenate([[1e9], dp[:-1]]))      # best of strictly earlier samples
        dp = dist[i] + pm
    cen, zc = proj(R, C, p[in6 & (fs > s_cp)])
    crest = np.clip(505 - cen[zc < -0.5, 1], 0, None)
    vp, _ = proj(R, np.zeros(3), D7[None] * 1e4)
    return box, dp.min(), crest, vp[0], C, R, water
def err(x):
    box, chain, crest, vp, *_ = parts(x)
    return ((box - T_BOX) ** 2).sum() + 4 * chain + 2 * (crest ** 2).sum() + 0.3 * ((vp - T_VP) ** 2).sum() + 20 * (np.square(x[5:]).sum())
c0 = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else None
x0s = [[1.07, 2.6, 5.8, math.atan2(-0.172, 0.968), math.asin(-0.182)] + prev["dx"] + prev["dy"]]
x0s += [[1.07, 2.6, 5.8, -0.18, -0.18, -1, 0, 0, -2, 0, 0], [0.8, 3.0, 6.0, -0.15, -0.2, -2, -1, 0, -3, -1, 0]]
best = None
for x0 in x0s:
    r = minimize(err, x0, method="Powell", options=dict(maxiter=60000, xtol=1e-5, ftol=1e-7))
    r = minimize(err, r.x, method="Nelder-Mead", options=dict(maxiter=60000, xatol=1e-7, fatol=1e-7))
    if best is None or r.fun < best.fun: best = r
x = best.x; box, chain, crest, vp, C, R, water = parts(x)
MW = np.eye(4); MW[:3, :3] = R; MW[:3, 3] = C
out = {"note": "Screen 06 locked approved-view camera + 06 river correction (tools/match06/fit_river06.py)", "fov": FOV, "size": [W, H],
       "mw": MW.T.reshape(-1).tolist(), "pos": C.tolist(), "fwd": (-R[:, 2]).tolist(), "off06": x[:3].tolist(), "water": water.tolist(),
       "s": s_cp, "path06": {"dx": x[5:8].tolist(), "dy": x[8:11].tolist()}, "err": float(best.fun), "box": box.tolist(),
       "coin_chain_px": float(chain), "crest_px": float(crest.max() if len(crest) else 0), "vp": vp.tolist()}
json.dump(out, open(sys.argv[2], "w"), indent=1)
print(json.dumps({k: out[k] for k in ("off06", "fwd", "path06", "err", "box", "coin_chain_px", "crest_px", "vp")}))
