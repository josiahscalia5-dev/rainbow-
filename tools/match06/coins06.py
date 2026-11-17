"""Screen 06 (?match06=1): the approved picture's 15 coins as real pickups at the painted spots (Screen 04/08 method).
Each painted coin (centre px, width px) is a ray from the locked camera; the coin (1 u diameter x scale) sits where its
painted size and its bottom edge on the river agree (bottom on the water). If that point lies beyond pickup reach
(|lateral| > 1.6) or outside stage 06 (Benny + 1 .. 06 end - 0.5), it slides along its own view ray (same pixel in the
approved view, size scaled with the depth so it still covers the painted coin) to the nearest depth within reach.
Output: course s / lateral / height above the water (coins.ts) + the approved camera position (coins face it).
usage: python3 -I tools/match06/coins06.py <probe06.json> <cam06_locked.json> <plate06.json> <out coins06.json>"""
import json, sys
import numpy as np
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from geo06 import Geo
g = Geo(sys.argv[1], sys.argv[2]); COINS = json.load(open(sys.argv[3]))["coins_px"]
sLo, sHi = g.sB + 1.0, g.d["s06"][1] - 0.5
ss = np.arange(g.sB - 2, g.s1, 0.05); FP, FT, FU, FR = g.frame(ss)
def local(P):
    i = np.argmin(np.linalg.norm(FP - P, axis=1)); q = P - FP[i]
    return ss[i] + q @ FT[i], q @ FR[i], q @ FU[i]
out = []
for u, v, w, h in COINS:
    r = g.ray(u, v); best = None; sols = []
    for k in np.arange(1.0, 120, 0.02):
        P = g.C + k * r; sc = w * k / g.Fpx; s, lat, hh = local(P)
        e = abs(hh - 0.5 * sc) + 10 * max(abs(lat) - 1.6, 0) + 10 * max(sLo - s, 0) + 10 * max(s - sHi, 0)
        cand = (e, k, P, sc, s, lat, hh)
        if best is None or e < best[0]: best = cand
        if e < 0.05:                                # on-the-water crossings, grouped by contiguous depth
            if sols and k - sols[-1][-1][1] < 0.05: sols[-1].append(cand)
            else: sols.append([cand])
    # r3 (2026-11-17): the river crests, so a ray through the painted coin TRAIL crosses the near water first and the far
    # river again further on. A near crossing that makes the coin smaller than 0.2 of a coin is the wrong one (the trail
    # is painted on the far river, like its other coins at ~23 u): take the farthest crossing instead.
    if sols:
        near = min(sols[0], key=lambda c: c[0])
        best = near if near[3] >= 0.2 else min(sols[-1], key=lambda c: c[0])
    e, k, P, sc, s, lat, hh = best
    if e > 0.05:                                    # no on-the-water spot within reach: nearest reachable depth on the ray
        pick = None
        for f in np.arange(0.1, 1.0, 0.002):
            Q = g.C + k * f * r; sq, lq, hq = local(Q)
            if abs(lq) <= 1.6 and hq >= 0.3 + 0.5 * sc * f and sLo <= sq <= sHi and (pick is None or f > pick[0]): pick = (f, Q, sq, lq, hq)
        if pick: f, P, s, lat, hh = pick; k *= f; sc *= f
    out.append({"px": [u, v, w], "s": float(s), "lat": float(lat), "h": float(hh), "scale": float(sc), "dist": float(k), "fit": float(e), "pos": P.tolist()})
json.dump({"note": "Screen 06 approved picture coins from the locked ?match06=1 camera (tools/match06/coins06.py, 2026-11-17)", "faceTo": g.C.tolist(), "coins": out}, open(sys.argv[4], "w"), indent=1)
for c in out: print({k: (round(v, 3) if isinstance(v, float) else v) for k, v in c.items() if k != "pos"})
