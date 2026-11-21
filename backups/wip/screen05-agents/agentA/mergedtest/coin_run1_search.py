# Brute force for run-1 coins 5-8 (coins 1-4 fitted to the approved picture stay): on-screen overlap margin on the recorded camera
# path (first 160 frames) + distance from the approved centres at frame 0 (small weight).
# usage: python3 -I coin_run1_search.py <coins_level_logic.json> <track.json> <layout_in.json> <layout_out.json>
import json, sys, math, itertools, importlib.util
import numpy as np
args = sys.argv[1:]; sys.argv = ['x', args[0], args[1]]
spec = importlib.util.spec_from_file_location('m', __file__.replace('coin_run1_search.py', 'coin_overlap_model.py')); M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
L = json.load(open(args[0])); lay = [list(c) for c in json.load(open(args[2]))]; cams = L['cam_path'][:160]
appr = L['frame0']['approved_scaled']
def project(p, cp, R):
    v = R.T.dot(p - cp)
    if -v[2] <= 0.01: return None
    return (M.W / 2 + M.F * v[0] / -v[2], M.H / 2 - M.F * v[1] / -v[2], M.SIZE * M.m_of(float(np.linalg.norm(p - cp))) / 2 * M.F / -v[2])
CAM = [(sb, np.array(cp), M.qrot(cq)) for sb, cp, cq in cams]
def worst(run):
    P = [M.coin_pos(*c) for c in run]; w = 99
    for sb, cp, R in CAM:
        vis = []
        for c, p in zip(run, P):
            if sb >= c[0] - 0.1: continue
            q = project(p, cp, R)
            if q and q[2] >= 6 and -q[2] < q[0] < M.W + q[2] and -q[2] < q[1] < M.H + q[2]: vis.append(q)
        for a, b in itertools.combinations(vis, 2): w = min(w, math.hypot(a[0] - b[0], a[1] - b[1]) - a[2] - b[2])
    return w
sb0, cp0, R0 = CAM[0]
best = None
for s5 in np.arange(3.5, 3.91, 0.05):
    for l5 in np.arange(-0.22, 0.2201, 0.04):
        run = [list(c) for c in lay[:4]] + [[round(s5, 2), round(l5, 2), 0]]
        w = worst(run)
        if w < 1.5: continue
        q = project(M.coin_pos(*run[4]), cp0, R0); e = math.hypot(q[0] - appr[4]['x'], q[1] - appr[4]['y'])
        if best is None or e < best[0]: best = (e, run[4], w)
print('coin5', best)
run = [list(c) for c in lay[:4]] + [best[1]]
for k in (5, 6, 7):
    bk = None
    for ds in np.arange(0.5, 0.76, 0.05):
        for l in np.arange(-0.22, 0.2201, 0.02):
            cand = run + [[round(run[-1][0] + ds, 2), round(l, 2), 0]]; w = worst(cand)
            if w < 1.5: continue
            q = project(M.coin_pos(*cand[-1]), cp0, R0); e = math.hypot(q[0] - appr[k]['x'], q[1] - appr[k]['y']) + 8 * (ds - 0.5)
            if bk is None or e < bk[0]: bk = (e, cand[-1], w)
    print('coin', k + 1, bk); run.append(bk[1])
lay[:8] = run; json.dump(lay, open(args[3], 'w')); print(lay[:8])
