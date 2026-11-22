# Offline model of the coin trail on screen: replays the recorded camera path (coins_level_logic.json -> cam_path) and projects
# any candidate layout [(s, lat, h)] with the page's rules (sprite coinD*1.15*m(dist), canvas 412x915, fov 64), to find on-screen
# overlaps (both radii >= 6 px) before a page run. A coin counts as on the trail until Benny is 0.1 before it (then it is picked).
# usage: python3 -I coin_overlap_model.py <coins_level_logic.json> <track.json> [layout.json]
import json, sys, math
import numpy as np
L = json.load(open(sys.argv[1])); TR = json.load(open(sys.argv[2]))
T = np.array(TR['trail']); TS = np.array(TR['trail_s']); N = np.array(TR['n'])
CD = 0.15038523388874458; SIZE = CD * 1.15; W, H, FOV = 412, 915, 64.0
F = H / 2 / math.tan(math.radians(FOV) / 2)
MT = [(2.0, 0.96), (2.16, 0.95), (2.8, 0.86), (3.33, 0.76), (3.85, 0.60), (4.5, 0.42), (5.0, 0.33), (5.5, 0.30)]  # = controls.js MTAB
def m_of(d):
    if d <= MT[0][0]: return MT[0][1]
    for (d0, m0), (d1, m1) in zip(MT, MT[1:]):
        if d <= d1: return m0 + (m1 - m0) * (d - d0) / (d1 - d0)
    return MT[-1][1]
def at(s):
    s = min(max(s, 0), TS[-1]); i = max(1, int(np.searchsorted(TS, s))); i = min(i, len(TS) - 1)
    k = (s - TS[i - 1]) / max(1e-6, TS[i] - TS[i - 1]); return T[i - 1] + (T[i] - T[i - 1]) * k
def frame(s, win=0.35):
    t = at(s + win) - at(s - win * 0.3); t /= np.linalg.norm(t); n = N - t * t.dot(N); n /= np.linalg.norm(n); r = np.cross(t, n); r /= np.linalg.norm(r); return t, r, n
def coin_pos(s, lat, h):
    t, r, n = frame(s); return at(s) + r * lat + n * (CD * 0.75 + h)
def qrot(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
def evaluate(layout, cam_path, verbose=False):
    P = [coin_pos(*c) for c in layout]; pairs = {}
    for fi, (sb, cp, cq) in enumerate(cam_path):
        if cp is None or cq is None: continue
        cp = np.array(cp); R = qrot(cq); vis = []
        for i, (c, p) in enumerate(zip(layout, P)):
            if sb >= c[0] - 0.1: continue
            v = R.T.dot(p - cp)
            if -v[2] <= 0.01: continue
            x = W / 2 + F * v[0] / -v[2]; y = H / 2 - F * v[1] / -v[2]; r = SIZE * m_of(np.linalg.norm(p - cp)) / 2 * F / -v[2]
            if x + r < 0 or x - r > W or y + r < 0 or y - r > H: continue
            vis.append((i, x, y, r))
        v6 = [z for z in vis if z[3] >= 6]
        for a in range(len(v6)):
            for b in range(a + 1, len(v6)):
                d = math.hypot(v6[a][1] - v6[b][1], v6[a][2] - v6[b][2]); g = d - v6[a][3] - v6[b][3]
                if g < 0:
                    k = f'{v6[a][0]}-{v6[b][0]}'; e = pairs.setdefault(k, {'frames': 0, 'worst': 0.0, 'f0': fi + 1, 'f1': fi + 1}); e['frames'] += 1; e['worst'] = min(e['worst'], round(g, 1)); e['f1'] = fi + 1
    return pairs
def screen_at(layout, cam):
    sb, cp, cq = cam; cp = np.array(cp); R = qrot(cq); out = []
    for i, c in enumerate(layout):
        p = coin_pos(*c); v = R.T.dot(p - cp)
        if -v[2] <= 0.01: continue
        out.append((i, round(W / 2 + F * v[0] / -v[2], 1), round(H / 2 - F * v[1] / -v[2], 1), round(SIZE * m_of(np.linalg.norm(p - cp)) / 2 * F / -v[2], 1)))
    return out
if __name__ == '__main__':
    lay = [(c['s'], c['lat'], c['h']) for c in L['layout']] if len(sys.argv) < 4 else [tuple(c) for c in json.load(open(sys.argv[3]))]
    pr = evaluate(lay, L['cam_path'])
    for k, v in sorted(pr.items(), key=lambda x: x[1]['f0']): print(k, v, [lay[int(i)] for i in k.split('-')])
    print('frame1 screen', screen_at(lay, L['cam_path'][0])[:8]); print('page frame0', [(c['i'], c['x'], c['y'], c['r']) for c in L['screen0']][:8])
