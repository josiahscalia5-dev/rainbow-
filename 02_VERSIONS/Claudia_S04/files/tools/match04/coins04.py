"""Screen 04 (?match04=1): the approved picture's five coins as real pickups at the painted spots.
Each painted coin (centre px, diameter px) is a ray from the locked camera; the coin (1 u diameter x scale) sits where
its painted size and its bottom edge on the water agree (bottom on the slide's water plane), expressed as course
s / lateral / height (coins.ts). usage: python3 -I tools/match04/coins04.py <proj04.json> <s of the cam04 water point> <out coins04.json>"""
import json, sys, math
import numpy as np
L = json.load(open(sys.argv[1])); s_cp = float(sys.argv[2])
W, H = L["camera"]["size"]; fov = L["camera"]["fov"]; t = math.tan(math.radians(fov) / 2); asp = W / H; F = (H / 2) / t
MW = np.array(L["camera"]["matrixWorld"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
D, U, X, base = (np.array(L[k], float) for k in ("D", "U", "X", "water"))
def ray(u, v):
    d = R @ np.array([(u / W * 2 - 1) * t * asp, (1 - v / H * 2) * t, -1.0]); return d / np.linalg.norm(d)
COINS = [(175, 970, 112), (262, 872, 82), (330, 792, 58), (378, 742, 40), (423, 712, 26)]
out = []
for u, v, d in COINS:
    r = ray(u, v); best = None
    for k in np.arange(2, 80, 0.01):
        P = C + k * r; sc = d * k / F                       # painted diameter at that depth (world units)
        h = (P - base) @ U                                  # centre height above the water plane
        e = abs(h - 0.5 * sc * 1.0)                         # bottom edge on the water
        if best is None or e < best[0]: best = (e, k, P, sc, h)
    e, k, P, sc, h = best
    # painted perspective puts the coins on the bank beyond the tunnel wall: as in match08, slide each coin along its own
    # view ray (same pixel in the approved view) to the nearest depth within pickup reach (|lateral| <= 1.6 = inside the river, >= 0.3 above
    # the water, >= 1 u ahead of the checkpoint, inside stage 04); its size scales with the depth so it still covers the painted coin
    if abs((P - base) @ X) > 1.6 or s_cp + (P - base) @ D < s_cp + 1.0:
        pick = None
        for f in np.arange(0.15, 1.0, 0.002):
            Q = C + k * f * r; lat = (Q - base) @ X; hq = (Q - base) @ U; sq = s_cp + (Q - base) @ D
            if abs(lat) <= 1.6 and hq >= 0.3 + 0.5 * sc * f and s_cp + 1.0 <= sq < 112 and (pick is None or f > pick[0]): pick = (f, Q, hq)
        if pick: f, P, h = pick; k *= f; sc *= f
    out.append({"px": [u, v, d], "s": s_cp + float((P - base) @ D), "lat": float((P - base) @ X), "h": float(h), "scale": float(sc), "dist": float(k), "pos": P.tolist()})
json.dump({"note": "Screen 04 approved picture coins from the locked ?match04=1 camera (tools/match04/coins04.py, 2026-11-17)", "faceTo": C.tolist(), "coins": out}, open(sys.argv[3], "w"), indent=1)
for c in out: print({k: (round(v, 3) if isinstance(v, float) else v) for k, v in c.items() if k != "pos"})
