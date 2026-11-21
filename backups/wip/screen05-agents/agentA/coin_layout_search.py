# Local search on top of coin_overlap_model.py: nudges the coins of overlapping pairs (s +0..0.15, lat +-0.04) until no two coins with
# r >= 6 px come within MARGIN px on the recorded camera path. Keeps |lat| <= 0.22, h unchanged, path gaps >= 0.45 inside a run.
# usage: python3 -I coin_layout_search.py <coins_level_logic.json> <track.json> <layout_in.json> <layout_out.json> [margin_px=2]
import json, sys, math, importlib.util, itertools
spec = importlib.util.spec_from_file_location('m', __file__.replace('coin_layout_search.py', 'coin_overlap_model.py'))
sys.argv, args = sys.argv[:3], sys.argv[1:]
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
L = json.load(open(args[0])); lay = [list(c) for c in json.load(open(args[2]))]; MARGIN = float(args[4]) if len(args) > 4 else 2.0
cams = L['cam_path']
def pairs(lay):
    import numpy as np
    P = [M.coin_pos(*c) for c in lay]; out = {}
    for fi, (sb, cp, cq) in enumerate(cams):
        if cp is None: continue
        cp = np.array(cp); R = M.qrot(cq); vis = []
        for i, (c, p) in enumerate(zip(lay, P)):
            if sb >= c[0] - 0.1: continue
            v = R.T.dot(p - cp)
            if -v[2] <= 0.01: continue
            x = M.W / 2 + M.F * v[0] / -v[2]; y = M.H / 2 - M.F * v[1] / -v[2]; r = M.SIZE * M.m_of(float(np.linalg.norm(p - cp))) / 2 * M.F / -v[2]
            if x + r < 0 or x - r > M.W or y + r < 0 or y - r > M.H: continue
            if r >= 6: vis.append((i, x, y, r))
        for a, b in itertools.combinations(vis, 2):
            g = math.hypot(a[1] - b[1], a[2] - b[2]) - a[3] - b[3]
            if g < MARGIN: k = (a[0], b[0]); out[k] = min(out.get(k, 99), g)
    return out
def cost(pr): return sum(MARGIN - g for g in pr.values())
pr = pairs(lay); c0 = cost(pr); print('start', round(c0, 1), {k: round(v, 1) for k, v in pr.items()})
for it in range(12):
    if not pr: break
    best = None
    for (a, b) in pr:
        for i in (b, a):
            for ds, dl in itertools.product((0, 0.05, 0.1, 0.15), (-0.04, -0.02, 0, 0.02, 0.04)):
                if ds == 0 and dl == 0: continue
                c = list(lay[i]); c[0] = round(c[0] + ds, 3); c[1] = round(max(-0.22, min(0.22, c[1] + dl)), 3)
                tl = [list(x) for x in lay]; tl[i] = c; ss = sorted(x[0] for x in tl)
                if min(y - x for x, y in zip(ss, ss[1:])) < 0.45: continue
                tc = cost(pairs(tl))
                if best is None or tc < best[0]: best = (tc, tl)
    if best is None or best[0] >= c0: print('stuck', round(c0, 1)); break
    c0, lay = best; pr = pairs(lay); print('iter', it, round(c0, 1), {k: round(v, 1) for k, v in pr.items()})
json.dump(lay, open(args[3], 'w')); print('final', lay)
