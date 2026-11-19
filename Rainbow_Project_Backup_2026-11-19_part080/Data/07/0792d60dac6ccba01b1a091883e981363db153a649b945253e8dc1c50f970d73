"""Screen 07 (?match07=1): the painted S-river centre line and the painted coins, from the locked camera (proj07.json).
River: the bottom edge of each painted coin (they ride the river's centre) + Benny's water point, cast onto the water
plane (through Benny's water point, spanned by D and X) -> world (x, z) points -> assets/textures/match07/river07.json
(course.ts bends the 07 path toward it under the switch, blended in/out so the 06 join and the plunge stay unchanged).
Coins: each painted coin (centre, width px) sits where its painted size and its bottom edge on the water agree; a coin
beyond the straight part of the tube (along > ALONG_MAX, i.e. past the plunge top) slides along its own view ray (same
pixel in the approved view) to ALONG_MAX, its size scaled with the depth so it still covers the painted coin.
usage: python3 -I tools/match07/river_coins07.py <proj07.json> <out dir>"""
import json, sys, math
import numpy as np
L = json.load(open(sys.argv[1])); out = sys.argv[2]
W, H = L["camera"]["size"]; t = math.tan(math.radians(L["camera"]["fov"]) / 2); asp = W / H; F = (H / 2) / t
MW = np.array(L["camera"]["matrixWorld"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
D, U, X, base = (np.array(L[k], float) for k in ("D", "U", "X", "water"))
def ray(u, v):
    d = R @ np.array([(u / W * 2 - 1) * t * asp, (1 - v / H * 2) * t, -1.0]); return d / np.linalg.norm(d)
def on_water(u, v):
    r = ray(u, v); k = -((C - base) @ U) / (r @ U); return C + k * r, k
COINS = [(610, 823, 98), (506, 744, 65), (480, 678, 48), (531, 650, 38), (596, 634, 28), (627, 625, 18), (652, 625, 16), (667, 616, 14)]
ALONG_MAX = 26.0      # beyond this the far painted coins are spread at 27, 29, 31, 33 u (the plunge top is at ~37 u)
FAR = iter([27.0, 29.0, 31.0, 33.0, 35.0])
coins = []
for u, v, d in COINS:
    r = ray(u, v); best = None
    for k in np.arange(2, 200, 0.01):
        P = C + k * r; sc = d * k / F; h = (P - base) @ U
        e = abs(h - 0.5 * sc)
        if best is None or e < best[0]: best = (e, k, P, sc, h)
    e, k, P, sc, h = best; slid = False
    a = (P - base) @ D
    if a > ALONG_MAX:
        f = ((next(FAR) - (C - base) @ D) / ((P - C) @ D)); P = C + k * f * r; sc *= f; k *= f; h = (P - base) @ U; slid = True
    coins.append({"px": [u, v, d], "pos": P.tolist(), "scale": float(sc), "h": float(h), "along": float((P - base) @ D), "lat": float((P - base) @ X), "dist": float(k), "slid": slid})
# river centre = Benny's water point + the coins' water points (the painted coins ride the painted river's centre)
pts = [base.copy()] + [np.array(c["pos"]) - c["h"] * U for c in coins]
river = {"note": "Screen 07 painted river centre on the water plane (tools/match07/river_coins07.py)",
         "z": [float(p[2]) for p in pts], "x": [float(p[0]) for p in pts], "along": [float((p - base) @ D) for p in pts], "lat": [float((p - base) @ X) for p in pts]}
json.dump(river, open(f"{out}/river07.json", "w"), indent=1)
print("river along", np.round(river["along"], 2), "lat", np.round(river["lat"], 2))
json.dump({"note": "Screen 07 approved picture coins from the locked ?match07=1 camera (tools/match07/river_coins07.py)", "faceTo": C.tolist(), "coins": coins}, open(f"{out}/coins07.json", "w"), indent=1)
for c in coins: print({k: (round(v, 2) if isinstance(v, float) else v) for k, v in c.items() if k != "pos"})
