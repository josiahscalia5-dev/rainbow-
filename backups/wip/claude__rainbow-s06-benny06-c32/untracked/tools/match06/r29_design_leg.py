"""r29 lead `&m06leg=1`: the falling right-hand band of the painted rinse arch (the broad rainbow band from the crest top down past
Benny's right side in references/06_crest_the_rinse_arch.png) as a decorative 3D water ribbon. Centre line = painted pixels on the
approved camera's rays at depths on the coin scale; ends just UNDER the main river's right bank (merges). Writes
assets/textures/match06/leg06deep.json.  usage: python3 -I tools/match06/r29_design_leg.py <route06deep.json> <proj06.json> <out>"""
import json, sys, math
import numpy as np
R = json.load(open(sys.argv[1])); L = json.load(open(sys.argv[2]))
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
C = M[:3, 3]; right, up, back = M[:3, 0], M[:3, 1], M[:3, 2]
W, H = L['camera']['size']; f = (H / 2) / math.tan(math.radians(L['camera']['fov'] / 2))
def ray(px, py):
    v = right * (px - W / 2) / f + up * (H / 2 - py) / f - back; return v / np.linalg.norm(v)
# painted band centre line (approved picture px) and depths (coin scale: crest top ~ coins 4-5)
PX = [(455, 575, 24.5), (560, 625, 21.0), (655, 715, 16.5), (745, 830, 12.0), (830, 960, 8.6), (880, 1060, 7.0)]
P = np.array([C + ray(x, y) * d for x, y, d in PX])
# smooth (centripetal Catmull-Rom) and resample every 0.5 u
def cr(p0, p1, p2, p3, n):
    def tj(ti, a, b): return ti + np.linalg.norm(b - a) ** 0.5
    t0 = 0; t1 = tj(t0, p0, p1); t2 = tj(t1, p1, p2); t3 = tj(t2, p2, p3); out = []
    for t in np.linspace(t1, t2, n, endpoint=False):
        A1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1; A2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
        A3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
        B1 = (t2 - t) / (t2 - t0) * A1 + (t - t0) / (t2 - t0) * A2; B2 = (t3 - t) / (t3 - t1) * A2 + (t - t1) / (t3 - t1) * A3
        out.append((t2 - t) / (t2 - t1) * B1 + (t - t1) / (t2 - t1) * B2)
    return out
pp = [P[0] + (P[0] - P[1])] + list(P) + [P[-1] + (P[-1] - P[-2])]
dense = []
for i in range(1, len(pp) - 2): dense += cr(pp[i - 1], pp[i], pp[i + 1], pp[i + 2], 30)
dense.append(pp[-2]); dense = np.array(dense)
cum = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(dense, axis=0), axis=1))]); Lg = cum[-1]
ss = np.append(np.arange(0, Lg, 0.5), Lg); pts = np.array([[np.interp(s, cum, dense[:, k]) for k in range(3)] for s in ss])
# clearance vs the playable river (route06deep points + the kept original metres near Benny = its first point region)
route = np.array(R['points']); Bpos = None
d = [float(np.min(np.linalg.norm(route - p, axis=1))) for p in pts]
print(f"leg length {Lg:.1f} u, {len(pts)} points; min centre distance to the playable river {min(d):.2f} u at leg point {int(np.argmin(d))}/{len(pts)}")
for i in range(0, len(pts), 6): print(f"  {ss[i]:5.1f} u  world {pts[i].round(2)}  clearance {d[i]:.2f}")
json.dump({'note': 'r29 m06leg: falling right band of the painted rinse arch (decorative water ribbon; tools/match06/r29_design_leg.py). World points, 0.5 u spacing, crest top -> down past Benny\'s right.',
           'px_depth': PX, 'points': pts.round(4).tolist(), 'length': round(float(Lg), 3)}, open(sys.argv[3], 'w'), indent=0)
