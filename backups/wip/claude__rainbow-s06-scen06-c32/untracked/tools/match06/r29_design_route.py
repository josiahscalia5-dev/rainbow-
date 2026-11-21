"""r29 lead: design the m06deep river centre line (drum frame -> world) through the painted coin trail rebuilt in 3D
(tools/match06/r29_route_probe.mjs -> route_probe2.json). Writes assets/textures/match06/route06deep.json.
usage: python3 -I tools/match06/r29_design_route.py <route_probe.json> <out.json> <old_samples.json>
The first metres stay EXACTLY the current route (Benny's checkpoint pose + the r25 hole patch s 197.2-203.3 depend on it): the
course keeps its raw points up to axial AKEEP and this curve starts there, blending from the current route (old_samples.json, sampled
in the drum frame) into the new centre line over AKEEP..AKEEP+BLEND (smoothstep in r and u at equal axial distance)."""
import json, sys, math
import numpy as np
P = json.load(open(sys.argv[1]))
O, ax, Rx, Ux = (np.array(P[k]) for k in ('O', 'ax', 'Rx', 'Ux'))
def w(a, r, u): return O + a * ax + r * Rx + u * Ux
def d(p): q = np.array(p) - O; a = q @ ax; q = q - a * ax; return np.array([a, q @ Rx, q @ Ux])
B = np.array(P['B']['pos']); tB = np.array(P['B']['tan'])
# centre line control points in the drum frame (a = along the painted tunnel axis, r = right, u = up). The curl keeps
# the river ~1 u to the right of coins 0-4 (the painted coins ride its inner left half), then runs THROUGH coins 5-14
# (the narrow stream into the rings), then straightens along the axis into Screen 07's (moved) entrance.
CP = [d(B), (8.6, -3.45, -0.15), (11.1, -4.45, 0.62), (13.0, -5.2, 1.3), (14.2, -5.3, 1.45), (18.6, -5.65, 1.86), (25.0, -5.85, 2.15),
      (32.8, -5.45, 1.55), (38.9, -4.85, 0.72), (44.0, -4.05, 0.08), (48.5, -3.37, -0.36), (53.0, -2.58, -0.74),
      (58.0, -1.88, -1.08), (63.0, -1.12, -1.56), (72.0, -0.30, -2.32), (84.0, 0.50, -3.28), (96.0, 1.35, -4.40),
      (102.0, 1.60, -4.90), (108.0, 2.05, -5.20), (113.0, 2.90, -5.33), (117.5, 4.10, -5.38)]
# r29 v2: the last ~15 u turn into the ORIGINAL 07 entrance heading (smoothed 07 start tangent, ~16.7 deg right of the axis), so the
# whole 07+ block can stay a rigid copy (no seam re-smoothing on the 07 side, 07 distances unchanged)
CP = [np.array(c, float) for c in CP]
# centripetal Catmull-Rom with a phantom start point along Benny's tangent (keeps the checkpoint tangent)
tBd = np.array([tB @ ax, tB @ Rx, tB @ Ux]); tBd /= np.linalg.norm(tBd)
t7 = np.array(P['e7']['tan']); t7d = np.array([t7 @ ax, t7 @ Rx, t7 @ Ux]); t7d /= np.linalg.norm(t7d)
pts = [CP[0] - tBd * 2.0] + CP + [CP[-1] + t7d * 4.5]
def cr(p0, p1, p2, p3, n):
    def tj(ti, a, b): return ti + np.linalg.norm(b - a) ** 0.5
    t0 = 0; t1 = tj(t0, p0, p1); t2 = tj(t1, p1, p2); t3 = tj(t2, p2, p3); out = []
    for t in np.linspace(t1, t2, n, endpoint=False):
        A1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1; A2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
        A3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
        B1 = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2; B2 = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3
        out.append((t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2)
    return out
dense = []
for i in range(1, len(pts) - 2): dense += cr(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], 40)
dense.append(pts[-2])
AKEEP, BLEND = 9.6, 5.4
OLD = json.load(open(sys.argv[3]))
od = np.array([d(np.array(o['pos'])) for o in OLD])                      # current route, drum frame (a increasing)
nd = np.array(dense)                                                    # new centre line, drum frame
def at(arr, a, k): return float(np.interp(a, arr[:, 0], arr[:, k]))
aa = np.arange(AKEEP, nd[-1, 0] + 1e-9, 0.05)
bl = []
for a in aa:
    wgt = min(1.0, max(0.0, (a - AKEEP) / BLEND)); wgt = wgt * wgt * (3 - 2 * wgt)
    r = (1 - wgt) * at(od, a, 1) + wgt * at(nd, a, 1); u = (1 - wgt) * at(od, a, 2) + wgt * at(nd, a, 2)
    bl.append((a, r, u))
dense = np.array([w(*p) for p in bl])
# resample at 1.5 u arc length
seglen = np.linalg.norm(np.diff(dense, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seglen)])
L = cum[-1]; ss = np.arange(0, L, 1.5); ss = np.append(ss, L)
res = np.array([[np.interp(s, cum, dense[:, k]) for k in range(3)] for s in ss])
res = res[res @ ax - O @ ax > AKEEP + 0.75 - 1e-9] if False else res
# report: heading change, slope, curvature radius
tang = np.gradient(res, axis=0); tang /= np.linalg.norm(tang, axis=1)[:, None]
ang = [math.degrees(math.acos(np.clip(tang[i] @ tang[i + 1], -1, 1))) for i in range(len(tang) - 1)]
minR = min(1.5 / max(math.radians(a), 1e-6) for a in ang)
print(f"length {L:.1f} u, points {len(res)}, min turn radius {minR:.1f} u, max slope {max(math.degrees(math.asin(-t[1])) for t in tang):.1f} deg down, max climb {max(math.degrees(math.asin(t[1])) for t in tang):.1f} deg")
for i in range(0, len(res), 8): print(f"  {ss[i]:6.1f} u  world {res[i].round(2)}  drum {d(res[i]).round(2)}  tan {tang[i].round(3)}")
json.dump({'note': 'r29 lead m06deep (docs/briefs/2026-11-20-r29, qa/match/06/r29/): the 06 river centre line from just past the approved '
           'checkpoint along the painted coin trail rebuilt in 3D at one coin size (tools/match06/r29_route_probe.mjs), through the '
           'painted ring tunnel (m06tun drum frame O/ax pinned), into the moved Screen 07 entrance (last point). World coords, 1.5 u spacing.',
           'O': O.tolist(), 'ax': ax.tolist(), 'Rx': Rx.tolist(), 'Ux': Ux.tolist(), 'control_drum': [c.tolist() for c in CP],
           'aKeep': AKEEP, 'blend': BLEND, 'points': [q for q in res.round(4).tolist() if d(np.array(q))[0] > AKEEP + 0.75], 'end': res[-1].round(4).tolist(), 'length': round(float(L), 3)}, open(sys.argv[2], 'w'), indent=0)
