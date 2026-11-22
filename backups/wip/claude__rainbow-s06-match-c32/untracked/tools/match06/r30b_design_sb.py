"""r30b lead (`&m06sbroute=1`, copy of r30_design_curl.py with storyboard keys): user r30 §6 — the four storyboard panels are mandatory:
1 curl right over the crest (right 32 deg + down 8), 2 descend through the gold band (hold), 3 follow the winding slide (sweeping left bend to
-20 deg), 4 connect into Screen 07 (a LATE right turn onto 07's heading, so 07's tube is hidden by the bend until the last stretch).
Output assets/textures/match06/route06sb.json.

r30 lead: design `&m06curl=1` (with m06deep) — the user's Screen 06 storyboard (2026-11-20 ~20:10 UTC, docs/briefs/2026-11-20-r30):
"preserve the opening crest -> curl right and descend -> pass beneath the gold bands inside the purple washer tunnel -> follow a
gentle S-bend -> connect smoothly into Screen 07's approved entry", purple roof + walls around Benny throughout, substantial gold
bands spaced along them.

WHY (qa/match/06/r30/diag/): the deep route ran down ONE straight 346 u tube with a gold ring every 12.87 u; the camera looked
within ~11 deg of its axis, so ~21 rings nested into a bullseye. Here the TUNNEL ITSELF follows the route: straight (unchanged) up to
virtual depth A_SPLIT (the approved opening, crest and painted coins 0-6 stay exactly where they are), then its axis curls right
and pitches down, swings through a gentle S-bend and settles on Screen 07's original entrance heading, so the 07-10 block stays a
rigid translated copy. The river rides the tube's lower middle. Rings: the painted ones up to A_SPLIT, then one band every RING_D u
of axis arc length, perpendicular to the local axis (round, never edge-on: min bend radius ~ 3.5x the tube radius).

Input  assets/textures/match06/route06deep.json (drum frame O/ax/Rx/Ux, its river points, tunnel_pin)
Output assets/textures/match06/route06curl.json (same keys the course reads + `curl`: axis samples with parallel-transport frames,
       virtual depths of the split / 07 entrance / tube end, ring depths)
usage: python3 -I tools/match06/r30_design_curl.py [in.json] [out.json]"""
import json, sys, math
import numpy as np
IN = sys.argv[1] if len(sys.argv) > 1 else 'assets/textures/match06/route06deep.json'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'assets/textures/match06/route06sb.json'
D = json.load(open(IN))
O, ax, Rx, Ux = (np.array(D[k], float) for k in ('O', 'ax', 'Rx', 'Ux'))
def drum(p): q = np.asarray(p) - O; a = q @ ax; q = q - a * ax; return np.array([a, q @ Rx, q @ Ux])
deep = np.array(D['points'], float); dd = np.array([drum(p) for p in deep])
A_SPLIT = 40.0          # virtual depth where the tunnel starts to bend (painted coins 0-6 at a <= 38.9 keep their places)
RIVER_U = -5.2          # river centre below the tube axis once settled (the deep route ended at u -5.4)
RING_D = 18.0           # gold band spacing along the axis after the split (was 12.87)
DS = 0.5                # axis sampling (u)
# heading keys (sigma = axis arc length past A_SPLIT, yaw deg + = right, pitch deg + = DOWN, both relative to the drum axis)
t7 = deep[-1] - deep[-2]; t7 /= np.linalg.norm(t7)
psi7 = math.degrees(math.atan2(t7 @ Rx, t7 @ ax)); th7 = math.degrees(math.asin(-(t7 @ Ux)))
KEYS = [(0, 0.0, 0.0), (36, 32.0, 8.0), (54, 32.0, 8.0), (98, -20.0, 5.0), (116, -20.0, 5.0), (148, psi7, th7)]
S07 = 160.0             # river end = Screen 07 entrance (axis arc length past A_SPLIT); straight on the 07 heading from 150
S_END = S07 + 0.3       # the tube ends at the 07 entrance, eased onto the 07 tube mouth (match06.ts m06curl)
def ss(t): t = min(1.0, max(0.0, t)); return t * t * (3 - 2 * t)
def heading(s):
    for (s0, p0, q0), (s1, p1, q1) in zip(KEYS, KEYS[1:]):
        if s <= s1: k = ss((s - s0) / (s1 - s0)); return p0 + (p1 - p0) * k, q0 + (q1 - q0) * k
    return KEYS[-1][1], KEYS[-1][2]
def dirv(psi, th):
    p, t = math.radians(psi), math.radians(th)
    v = math.cos(t) * math.cos(p) * ax + math.cos(t) * math.sin(p) * Rx - math.sin(t) * Ux
    return v / np.linalg.norm(v)
# axis: integrate the heading; parallel-transport frames from (Rx, Ux)
n = int(round(S_END / DS)) + 1
P = np.zeros((n, 3)); T = np.zeros((n, 3)); R = np.zeros((n, 3)); U = np.zeros((n, 3))
P[0] = O + A_SPLIT * ax; T[0] = ax; R[0] = Rx; U[0] = Ux
for i in range(1, n):
    s = i * DS
    T[i] = dirv(*heading(s)); P[i] = P[i - 1] + 0.5 * (T[i - 1] + T[i]) * DS
    # parallel transport: rotate the previous frame by the minimal rotation T[i-1] -> T[i]
    r = R[i - 1] - (R[i - 1] @ T[i]) * T[i]; r /= np.linalg.norm(r); u = np.cross(T[i], r); u /= np.linalg.norm(u)
    if u @ U[i - 1] < 0: u = -u
    R[i], U[i] = r, u
# river offset in the tube frame: Hermite from the deep route at A_SPLIT (value + slope, C1 join) to (0, RIVER_U) at S_SET
S_SET = 38.0
k0 = int(np.searchsorted(dd[:, 0], A_SPLIT))
def at(a, j): return float(np.interp(a, dd[:, 0], dd[:, j]))
r0, u0 = at(A_SPLIT, 1), at(A_SPLIT, 2)
h = 1.0; mr = (at(A_SPLIT + h, 1) - at(A_SPLIT - h, 1)) / (2 * h); mu = (at(A_SPLIT + h, 2) - at(A_SPLIT - h, 2)) / (2 * h)
def herm(p0, m0, p1, t, L):
    t = min(1.0, max(0.0, t)); h00 = 2 * t**3 - 3 * t**2 + 1; h10 = t**3 - 2 * t**2 + t; h01 = -2 * t**3 + 3 * t**2
    return h00 * p0 + h10 * m0 * L + h01 * p1
riv = []
for i in range(n):
    s = i * DS
    if s > S07 + 1e-9: break
    t = s / S_SET
    riv.append(P[i] + herm(r0, mr, 0.0, t, S_SET) * R[i] + herm(u0, mu, RIVER_U, t, S_SET) * U[i])
riv = np.array(riv)
# the river: the deep route's own points up to A_SPLIT (unchanged), then the new line (resampled at 1.5 u like the deep design)
keep = deep[dd[:, 0] < A_SPLIT - 0.75]
dense = np.vstack([keep, riv])
seg = np.linalg.norm(np.diff(dense, axis=0), axis=1); cum = np.concatenate([[0], np.cumsum(seg)])
iK = len(keep) - 1
grid = np.concatenate([cum[:iK + 1], np.arange(cum[iK] + 1.5, cum[-1], 1.5), [cum[-1]]])
res = np.array([[np.interp(x, cum, dense[:, k]) for k in range(3)] for x in grid])
# checks: turn radius, slope, tube clearance (river centre must stay well inside the 14 u tube), end tangent = 07 heading
tg = np.gradient(res, axis=0); tg /= np.linalg.norm(tg, axis=1)[:, None]
ang = [math.degrees(math.acos(np.clip(tg[i] @ tg[i + 1], -1, 1))) for i in range(len(tg) - 1)]
seg2 = np.linalg.norm(np.diff(res, axis=0), axis=1)
minR = min(seg2[i] / max(math.radians(ang[i]), 1e-6) for i in range(len(ang)))
kap = [np.linalg.norm(T[i + 1] - T[i]) / DS for i in range(n - 1)]; axR = 1 / max(kap)
endTan = res[-1] - res[-2]; endTan /= np.linalg.norm(endTan)
clear = max(np.linalg.norm([herm(r0, mr, 0.0, (i * DS) / S_SET, S_SET), herm(u0, mu, RIVER_U, (i * DS) / S_SET, S_SET)]) for i in range(len(riv)))
rings = []
a = 36.95 + RING_D  # first band after the last painted ring kept (a 36.95)
while a - A_SPLIT <= S07 + 4: rings.append(round(a, 3)); a += RING_D
L06 = float(np.sum(np.linalg.norm(np.diff(np.vstack([deep[:1], res]), axis=0), axis=1)))
print(f"river: {len(res)} pts, {cum[-1]:.1f} u from the first deep point (deep: {D['length']:.1f}); min river turn radius {minR:.1f} u; "
      f"axis min bend radius {axR:.1f} u (tube radius 14); river max offset from axis {clear:.1f} u")
print(f"end tangent vs 07 heading: {math.degrees(math.acos(np.clip(endTan @ t7, -1, 1))):.2f} deg; 07 heading yaw {psi7:.1f} pitch {th7:.2f}")
print(f"drop over the new part: {res[iK][1] - res[-1][1]:.1f} u; rings at {rings}")
json.dump({'note': 'r30b lead m06sbroute (storyboard keys, tools/match06/r30b_design_sb.py); r30 lead m06curl (docs/briefs/2026-11-20-r30, qa/match/06/r30/): the user\'s 06 storyboard route. Deep route kept up to '
           f'virtual depth {A_SPLIT}, then the tunnel axis curls right + descends, S-bend, onto the original 07 entrance heading '
           '(tools/match06/r30_design_curl.py). World coords; course reads O/ax/aKeep/points like route06deep.',
           'O': O.tolist(), 'ax': ax.tolist(), 'Rx': Rx.tolist(), 'Ux': Ux.tolist(), 'aKeep': D['aKeep'], 'blend': D['blend'],
           'points': [q for q in res.round(4).tolist() if drum(q)[0] > D['aKeep'] + 0.75], 'end': res[-1].round(4).tolist(),
           'length': round(float(cum[-1]), 3), 'tunnel_pin': D['tunnel_pin'], 's07_orig': D['s07_orig'],
           'curl': {'aSplit': A_SPLIT, 'ds': DS, 'a07': A_SPLIT + S07, 'aEnd': A_SPLIT + S_END, 'riverU': RIVER_U, 'ringD': RING_D,
                    'rings': rings, 'keys': KEYS,
                    'axis': np.hstack([P, T, R, U]).round(5).tolist()}}, open(OUT, 'w'), separators=(',', ':'))
print('wrote', OUT)
