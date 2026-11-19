"""env05 — fit the camera-held near gold FRAME (src/world/tube.ts nearFrameGeometry: two bottom-corner bands + the bottom
lip, designed in reference pixels; the vertex shader makes every vertex land on its designed pixel) to the approved
picture's frame outline. A piece = annulus sector about (cx, cy): radius a0 … a0 + dir·w, angle th0 … th1 (degrees,
y up). Objective per piece: approved frame pixels the piece misses + approved WATER pixels it covers (bubbles, foam,
splash, Benny in front of the frame are ignored: the game draws its own there). Coordinate search from the current
design. Writes the fitted pieces (+ before / after numbers) to <out.json>.
usage: python3 -I tools/env05/frame_fit.py <out.json>"""
import json, sys
import numpy as np
from PIL import Image

W, H = 864, 1536
M = "qa/pilot05/full_reference_match/masks"
idx = np.asarray(Image.open(f"{M}/region_index.png"))
rid = {k: v["id"] for k, v in json.load(open(f"{M}/regions.json"))["regions"].items()}
yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
low = yy >= 1100
pos = (idx == rid["gold_rings_and_front_frame"]) & low
neg = (idx == rid["water"]) & low
CUR = {
    "left": [432, 1060, 457, 190, 1, -163, -122],
    "right": [432, 1060, 457, 190, 1, -17, -58],
    "lip": [432, 2121, 655, 130, -1, 122, 58],
}
# which pixels each piece is judged on (its own neighbourhood)
ZONE = {"left": low & (xx < 330), "right": low & (xx >= 534), "lip": low & (yy >= 1380) & (xx >= 60) & (xx < 804)}


def region(p):
    cx, cy, a0, w, d, t0, t1 = p
    rho = np.hypot(xx - cx, cy - yy)
    th = np.degrees(np.arctan2(cy - yy, xx - cx))
    lo, hi = (a0, a0 + w) if d > 0 else (a0 - w, a0)
    tl, th_ = min(t0, t1), max(t0, t1)
    return (rho >= lo) & (rho <= hi) & (th >= tl) & (th <= th_)


REG = {n: region(list(map(float, p))) for n, p in CUR.items()}


def cost_joint(regs):
    m = np.zeros((H, W), bool)
    for r in regs.values(): m |= r
    m &= low
    return int((pos & ~m).sum()), int((neg & m).sum())


P = {n: list(map(float, p)) for n, p in CUR.items()}
miss0, over0 = cost_joint(REG)
best = miss0 + over0
steps = {0: [8, 4, 2, 1], 1: [8, 4, 2, 1], 2: [8, 4, 2, 1], 5: [2, 1, 0.5], 6: [2, 1, 0.5]}
for it in range(5):
    improved = False
    for name in CUR:
        for k, sl in steps.items():
            for st in sl:
                for sgn in (1, -1):
                    q = list(P[name]); q[k] += sgn * st
                    regs = dict(REG); regs[name] = region(q)
                    c = sum(cost_joint(regs))
                    if c < best:
                        best, P[name], REG, improved = c, q, regs, True
    print("iteration", it, "cost", best)
    if not improved: break
miss1, over1 = cost_joint(REG)
res = {"pieces_before": CUR, "pieces_after": {n: [round(v, 2) for v in p] for n, p in P.items()},
       "approved_frame_px": int(pos.sum()), "missed_before": miss0, "water_covered_before": over0,
       "missed_after": miss1, "water_covered_after": over1}
print(json.dumps(res))
json.dump(res, open(sys.argv[1], "w"), indent=1)
