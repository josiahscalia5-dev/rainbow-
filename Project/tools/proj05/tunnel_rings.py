"""Screen 05 walls + rings bake, step 1 — the approved picture's RING MODEL: for every gold ring A..G the band's inner and
outer edge as smooth curves r(theta) about the common origin O (tunnel_common.O), measured on the gold mask.
usage: python3 -I tools/proj05/tunnel_rings.py <out_dir>
outputs: ring_model.json (Fourier coefficients, order 2, of r_in / r_out per ring; theta in radians, image angle),
         ring_model_overlay.png (the curves drawn on the approved picture, to be checked by eye)"""
import json, math, os, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(__file__))
from tunnel_common import *

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
ap8 = load_approved(); M = masks(ap8)
gold = M["warm"] & ~binary_dilation(M["lid"], iterations=6) & M["env"]
bad = M["hud"] | binary_dilation(M["lid"], iterations=6) | ~M["env"] | binary_dilation(M["water"], iterations=3)
th, r, mx, my = polar_maps()
DR = r[1] - r[0]
gp = cv2.remap(gold.astype(np.float32), mx, my, cv2.INTER_LINEAR, borderValue=0)
inside = (mx >= 1) & (mx < W - 2) & (my >= 1) & (my < H - 2)
badp = (cv2.remap(bad.astype(np.uint8), mx, my, cv2.INTER_NEAREST, borderValue=1) > 0) | ~inside


def basis(t, order=2):
    cols = [np.ones_like(t)]
    for k in range(1, order + 1):
        cols += [np.cos(k * t), np.sin(k * t)]
    return np.stack(cols, -1)


def robust_fit(t, y, order=2, iters=6):
    A = basis(t, order); w = np.ones(len(t))
    for _ in range(iters):
        c, *_ = np.linalg.lstsq(A * w[:, None], y * w, rcond=None)
        res = y - A @ c
        s = max(1.4826 * np.median(np.abs(res)), 0.4)
        w = 1.0 / (1.0 + (res / (2.0 * s)) ** 2)
    return c, float(np.median(np.abs(res)))


model = {"origin": list(O), "order": 2, "rings": {}}
report = {}
for name in RING_ORDER:
    cx, cy, rad, band = RING_GUESS[name]
    half = band / 2
    edges = {}
    for which, sign in (("in", -1), ("out", +1)):
        ts, ys = [], []
        win = max(6.0, band * 0.55)
        for i in range(0, NTH, 2):
            pred = circle_r_of_theta(cx, cy, rad + sign * half, th[i])
            lo = int((pred - win) / DR); hi = int((pred + win) / DR)
            if lo < 2 or hi >= len(r) - 2 or badp[lo:hi, i].any(): continue
            col = gp[lo:hi, i]
            n = len(col)
            # step response: gold on the band side, wall on the other
            cs = np.concatenate([[0], np.cumsum(col)])
            k = np.arange(4, n - 4)
            below = cs[k] / k; above = (cs[n] - cs[k]) / (n - k)
            sc = (above - below) * (-sign)
            j = int(np.argmax(sc))
            if sc[j] < 0.55: continue
            ts.append(th[i]); ys.append((lo + k[j]) * DR)
        ts, ys = np.array(ts), np.array(ys)
        if len(ts) >= 40 and name in ("A", "B", "C", "D"):
            order = 2 if (ts.max() - ts.min()) > math.radians(120) and name != "A" else 1
            c, mad = robust_fit(ts, ys, order)
            c = np.concatenate([c, np.zeros(5 - len(c))])
            src = "measured"
        else:
            # far rings inside the warm glow (and anything too hidden): the circle of the guess
            tt = np.radians(np.arange(0, 360, 2.0))
            yy = np.array([circle_r_of_theta(cx, cy, rad + sign * half, t) for t in tt])
            c, mad = robust_fit(tt, yy, 2)
            src = "circle guess"
        edges[which] = [float(x) for x in c]
        report[f"{name}_{which}"] = dict(points=int(len(ts)), source=src, mad_px=round(mad, 2), theta_deg=[round(float(np.degrees(ts.min())), 1), round(float(np.degrees(ts.max())), 1)] if len(ts) else None)
    model["rings"][name] = edges
# ring A (front ring, frames the picture, mostly outside the frame / behind the HUD): its inner edge is found by scanning
# outward from r 330 for the first sustained gold run; the outer edge is the inner one scaled by the band thickness
# measured where the whole band is in the frame (theta 145..155 deg: inner 446, band 64 px)
ts, ys = [], []
for i in range(0, NTH, 2):
    col = gp[:, i] > 0.5; b = badp[:, i]
    run = 0
    for k in range(int(330 / DR), len(r)):
        if b[k]: break
        if col[k]:
            run += 1
            if run >= 24: ts.append(th[i]); ys.append(r[k - 23]); break
        else: run = 0
ts, ys = np.array(ts), np.array(ys)
keep = (ys > 380) & (ys < 500)
cA, madA = robust_fit(ts[keep], ys[keep], 1)
cA = np.concatenate([cA, np.zeros(2)])
model["rings"]["A"] = {"in": [float(x) for x in cA], "out": [float(x * (1 + 64.0 / 446.0)) for x in cA]}
report["A_in"] = dict(points=int(keep.sum()), source="scan from r 330", mad_px=round(madA, 2), theta_deg=[round(float(np.degrees(ts[keep].min())), 1), round(float(np.degrees(ts[keep].max())), 1)])
report["A_out"] = dict(source="A_in x (1 + 64/446)")
model["report"] = report
json.dump(model, open(os.path.join(out, "ring_model.json"), "w"), indent=1)

# overlay
vis = cv2.cvtColor(ap8, cv2.COLOR_RGB2BGR).copy()
tt = np.radians(np.arange(0, 360, 0.25))
B5 = basis(tt, 2)
for name in RING_ORDER:
    for which, colr in (("in", (255, 255, 0)), ("out", (0, 255, 0))):
        rr = B5 @ np.array(model["rings"][name][which])
        pts = np.stack([O[0] + rr * np.cos(tt), O[1] - rr * np.sin(tt)], -1)
        cv2.polylines(vis, [np.round(pts * 8).astype(np.int32)], True, colr, 1, cv2.LINE_AA, shift=3)
cv2.imwrite(os.path.join(out, "ring_model_overlay.png"), vis)
for k, v in report.items(): print(k, v)
