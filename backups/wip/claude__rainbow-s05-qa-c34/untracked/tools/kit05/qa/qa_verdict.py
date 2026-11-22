"""S4 (round 34) — Screen 05 acceptance verdict over the user's 10 test items (USER_R34.md section 6) + likeness target + phone load.
python3 -I qa_verdict.py <acceptance outdir> <game folder>
Reads <out>/coins (qa_play PLAN=coins), <out>/stress (qa_play PLAN=stress), <out>/live.json (qa_live), <out>/visual/visual.json (qa_visual)
and <game>/kit.json. Every rule below was FIXED before the round-34 baseline was judged (2026-11-21 ~18:40 UTC) and is never loosened
to make a run pass; rules taken over from acceptance_verdict.py keep their old limits (G-numbers in brackets) or are made stricter.
Writes <out>/VERDICT.json + <out>/REPORT.md (plain language, failures grouped by the responsible specialist). Exit 0 only if all pass."""
import sys, os, json, math, numpy as np
out, game = sys.argv[1:3]
J = lambda p: json.load(open(p)) if os.path.exists(p) else None
K = J(os.path.join(game, 'kit.json')) or {}
W, H, FPS, LANE, LAT_MAX = 412, 915, 30, 0.22, 0.26
OWN = {'S1': 'S1 scenery / water (washer-environment-modeler)', 'S2': 'S2 Benny animation / controls (animation-and-gameplay-engineer)',
       'S3': 'S3 camera / path / coins (path-camera-transition-engineer)', 'lead': 'lead (shared tools: live.js, integration)'}
def runs():
    R = {}
    for name in ('coins', 'stress'):
        d = os.path.join(out, name); L = J(os.path.join(d, 'run_log.json'))
        if L is None: continue
        R[name] = {'dir': d, 'fr': [x for x in L if 'i' in x], 'sw': [x for x in L if 'swipe' in x], 'plan': J(os.path.join(d, 'plan.json')) or {},
                   'probe': J(os.path.join(d, 'probe.json')) or {}, 'perf': J(os.path.join(d, 'perf.json')) or {}, 'res': J(os.path.join(d, 'play_results.json')) or {}}
    return R
R = runs(); LIVE = J(os.path.join(out, 'live.json')); VIS = (J(os.path.join(out, 'visual', 'visual.json')) or {}).get('summary')
items = {}
def item(n, title, owner_default):
    items[n] = {'n': n, 'title': title, 'checks': [], 'owner': owner_default}; return items[n]
def chk(it, cid, name, ok, value, rule, owner=None, evidence=None):
    it['checks'].append({'id': cid, 'check': name, 'pass': (None if ok is None else bool(ok)), 'value': value, 'rule': rule, 'owner': owner or it['owner'], 'evidence': evidence})
r3 = lambda x: None if x is None else round(float(x), 3)
# ---------------- per-swipe response analysis (both runs) ----------------
def responses(run):
    fr, sw = run['fr'], run['sw']; byi = {x['i']: x for x in fr}; resp = []; lp = 0
    lat_sw = [s for s in sw if s['swipe'] in ('left', 'right')]; ver_sw = [s for s in sw if s['swipe'] in ('up', 'down')]
    for s in sw:
        i0 = int(round(s['t'] * FPS)); prev = byi.get(i0 - 1) or byi.get(i0); d = s['swipe']; r = {'swipe': d, 't': s['t'], 'why': s.get('why', ''), 'frame': i0}
        if d in ('left', 'right'):
            nxt = [x['t'] for x in lat_sw if x['t'] > s['t'] + 1e-6]; t_end = min(nxt[0] - 1e-6 if nxt else 1e9, s['t'] + 1.2)
            win = [x for x in fr if s['t'] - 1e-6 <= x['t'] <= t_end]; want = max(-1, min(1, lp + (-1 if d == 'left' else 1)))
            r.update({'lane_before': prev.get('lane'), 'expected_lane': want, 'at_edge': want == lp}); lp = want
            sgn = -1 if d == 'left' else 1; lat0 = prev.get('lat', 0); lat_ms = None
            for x in win:
                if (x.get('lat', 0) - lat0) * sgn > 0.005: lat_ms = round((x['i'] - i0 + 1) * 1000 / FPS); break
            r['latency_ms'] = lat_ms; r['lane_after'] = win[-1].get('lane') if win else None
            r['reached'] = (abs(win[-1].get('lat', 0) - want * LANE) <= 0.03) if win and (win[-1]['t'] - s['t'] >= 0.5) else None
            r['ok'] = r['lane_after'] == want and (r['at_edge'] or (lat_ms is not None and lat_ms <= 200)) and r['reached'] is not False
        else:
            nxt = [x['t'] for x in ver_sw if x['t'] > s['t'] + 1e-6]; t_end = min(nxt[0] - 1e-6 if nxt else 1e9, s['t'] + 1.2)
            win = [x for x in fr if s['t'] - 1e-6 <= x['t'] <= t_end]; hs = [x.get('height', 0) for x in win]; lat_ms = None
            for x in win:
                if (x.get('height', 0) > 0.01) if d == 'up' else (x.get('height', 0) < -0.01): lat_ms = round((x['i'] - i0 + 1) * 1000 / FPS); break
            r.update({'max_h': r3(max(hs or [0])), 'min_h': r3(min(hs or [0])), 'latency_ms': lat_ms})
            r['ok'] = (max(hs or [0]) > 0.15 if d == 'up' else min(hs or [0]) < -0.15) and lat_ms is not None and lat_ms <= 200
        resp.append(r)
    return resp
RESP = {k: responses(v) for k, v in R.items()}
allresp = [r for v in RESP.values() for r in v]
def dirs(run): c = {}; [c.__setitem__(s['swipe'], c.get(s['swipe'], 0) + 1) for s in run['sw']]; return c
def dsteps(fr, key): return [abs((b.get(key) or 0) - (a.get(key) or 0)) for a, b in zip(fr, fr[1:])]
def gp(fr): return [x for x in fr if not ((x.get('endK') or 0) > 0.05)]
coins, stress = R.get('coins'), R.get('stress')
both = [v for v in (coins, stress) if v]
# ================= 1. repeated left / right swipes =================
it = item(1, 'Repeated left / right swipes', 'S2')
lr = [r for r in allresp if r['swipe'] in ('left', 'right')]
nL = sum(r['swipe'] == 'left' for r in lr); nR = sum(r['swipe'] == 'right' for r in lr)
chk(it, '1a', 'every left / right swipe reaches the lane the player asked for (edge = stays)', bool(lr) and all(r['lane_after'] == r['expected_lane'] for r in lr),
    {'swipes': len(lr), 'left': nL, 'right': nR, 'failed': [(r['swipe'], r['t'], r['why']) for r in lr if r['lane_after'] != r['expected_lane']][:8]}, 'lane after the swipe (until the next lateral swipe, max 1.2 s) == expected; >= 8 per direction', evidence='coins/ + stress/ run_log.json')
chk(it, '1b', 'enough repetitions', nL >= 8 and nR >= 8 and sum(1 for r in lr if 'double' in r['why']) >= 4, {'left': nL, 'right': nR, 'same-direction repeats': sum(1 for r in lr if 'double' in r['why'])}, '>= 8 left, >= 8 right, >= 2 same-direction double swipes (one into the river edge)')
lat_lat = [r['latency_ms'] for r in lr if not r['at_edge']]
chk(it, '1c', 'responsive: the move starts within 0.2 s of every swipe (also during a leap / dive)', bool(lat_lat) and all(x is not None and x <= 200 for x in lat_lat),
    {'median_ms': float(np.median([x for x in lat_lat if x is not None])) if lat_lat else None, 'worst_ms': max([x if x is not None else 9999 for x in lat_lat] or [0]),
     'slow': [(r['swipe'], r['t'], r['why'], r['latency_ms']) for r in lr if not r['at_edge'] and (r['latency_ms'] is None or r['latency_ms'] > 200)][:8]},
    'game time from the swipe to the first frame Benny moves sideways <= 200 ms (no delayed reactions)')
reach = [r for r in lr if r['reached'] is not None]
chk(it, '1d', 'he really arrives in the lane centre', all(r['reached'] for r in reach), {'checked': len(reach), 'not_reached': [(r['swipe'], r['t']) for r in reach if not r['reached']][:8]}, '|lat - lane x 0.22| <= 0.03 at the end of a >= 0.5 s window')
# ================= 2. rapid changes left -> right =================
it = item(2, 'Rapid changes from left to right (reversals)', 'S2')
rv = [r for r in allresp if 'reversal' in r['why']]
chk(it, '2a', 'rapid reversals sent and answered', len(rv) >= 8 and all(r['lane_after'] == r['expected_lane'] for r in rv), {'swipes': len(rv), 'pairs': len(rv) // 2, 'failed': [(r['swipe'], r['t']) for r in rv if r['lane_after'] != r['expected_lane']]}, '>= 4 reversal pairs (2nd swipe 0.13-0.17 s after the 1st); every swipe ends in the asked lane')
mx_dlat = max([max(dsteps(v['fr'], 'lat') or [0]) for v in both] or [9])
chk(it, '2b', 'no teleport / sideways jump [G4]', mx_dlat <= 0.06, {'max_dlat_per_frame': r3(mx_dlat)}, '|d lat| <= 0.06 per 1/30 s frame in every frame of both runs')
def roll_stats(fr):
    g = [x for x in gp(fr) if x.get('benny')]; r = [x['benny']['rollDeg'] for x in g]; return (max(map(abs, r)) if r else None, max([abs(b - a) for a, b in zip(r, r[1:])] or [0]))
rs = [roll_stats(v['fr']) for v in both]
chk(it, '2c', 'no excessive leaning during fast reversals [G14]', all(a is not None and a <= 25 and b <= 3 for a, b in rs), {'max_abs_roll_deg': [r3(a) for a, b in rs], 'max_roll_change_deg_per_frame': [r3(b) for a, b in rs]}, "Benny's on-screen tilt <= 25 deg, change <= 3 deg per frame (coins run, stress run)")
# ================= 3. steering while the river curves =================
it = item(3, 'Steering while the river curves', 'S3')
pr = (coins or stress or {}).get('probe', {}).get('probe', [])
yaw = [p.get('heading', {}).get('yawDeg', 0) for p in pr if p.get('heading')]; turn = [p.get('turnDegPerS', 0) for p in pr]
yaw_rng = (max(yaw) - min(yaw)) if yaw else 0; latA = [p.get('latAxis') for p in pr if p.get('latAxis') is not None]
rc = K.get('river_center')
chk(it, '3a', 'the river really bends (its centre line exists and Benny\'s path follows it)', yaw_rng >= 3 and bool(rc),
    {'path_heading_range_deg': r3(yaw_rng), 'max_bend_rate_deg_per_s': r3(max(turn or [0])), 'path_lateral_range_u': r3((max(latA) - min(latA)) if latA else 0), 'kit_river_center': bool(rc)},
    'path heading varies >= 3 deg over the level and kit.json has river_center (S1 -> S3 interface)', owner='S1+S3')
if rc and latA:
    c = rc['c']; ds = rc['ds']; dev = []
    for p in pr:
        if p.get('latAxis') is None: continue
        k = min(len(c) - 1, max(0, int(round(p['s'] / ds)))); dev.append(abs((p['latAxis'] - latA[0]) - (c[k] - c[0])))
    chk(it, '3b', 'lanes follow the river\'s real curves (path = river centre line)', max(dev) <= 0.03, {'max_dev_u': r3(max(dev))}, '|path lateral - river_center| <= 0.03 u everywhere (relative to the start)')
else: chk(it, '3b', 'lanes follow the river\'s real curves (path = river centre line)', False, 'no river_center in kit.json: the path is a straight line', 'needs river_center', owner='S1+S3')
cs = [r for r in allresp if r['swipe'] in ('left', 'right')]
curve_sw = []
for r in cs:
    k = min(len(turn) - 1, r['frame']) if turn else 0
    if turn and max(turn[max(0, k - 6):k + 7] or [0]) >= 4: curve_sw.append(r)
chk(it, '3c', 'lateral swipes inside bends all answered', len(curve_sw) >= 4 and all(r['ok'] for r in curve_sw), {'swipes_in_bends': len(curve_sw), 'failed': [(r['swipe'], r['t']) for r in curve_sw if not r['ok']]}, '>= 4 left / right swipes where the path turns >= 4 deg/s, all ok (lane, latency, arrival)')
# inside the river / never through the tunnel walls: Benny's world position vs the tunnel axis
def wall_check(fr):
    A0, RR = np.array(K.get('A0', [0, 0, 0])), np.array(K.get('RR', [1, 0, 0])); hwd = K.get('water', {}).get('HWD', 0.70)
    lat = [float(np.dot(np.array(x['bw']) - A0, RR)) for x in fr if x.get('bw')]; return (max(map(abs, lat)) if lat else None), hwd
wc = [wall_check(v['fr']) for v in both]
chk(it, '3d', 'never swims through the tunnel walls / out of the water', all(a is not None and a <= b - 0.21 for a, b in wc) and max([max(abs(x.get('lat', 0)) for x in v['fr']) for v in both] or [9]) <= 0.30,
    {'max_abs_lateral_from_tunnel_axis_u': [r3(a) for a, b in wc], 'water_half_width_u': r3(wc[0][1]) if wc else None, 'max_abs_lat_path_u': r3(max([max(abs(x.get('lat', 0)) for x in v['fr']) for v in both] or [0]))},
    "Benny's centre <= water half-width - 0.21 (his half-width) from the tunnel axis; |lat| <= 0.30 [G5]")
# ================= 4. smooth movement between all three lanes =================
it = item(4, 'Smooth movement between all three lanes', 'S2')
lanes = sorted({x.get('lane') for v in both for x in v['fr']})
chk(it, '4a', 'all three lanes used [G7]', {-1, 0, 1} <= set(lanes), lanes, 'lanes -1, 0, +1 seen')
def lat_acc(fr):
    l = [x.get('lat', 0) for x in fr]; v = np.diff(l) * FPS; a = np.diff(v) * FPS; return float(np.abs(a).max()) if len(a) else 0
acc = max([lat_acc(v['fr']) for v in both] or [0])
chk(it, '4b', 'smooth lane changes (no snap, no overshoot)', acc <= 40 and mx_dlat <= 0.06, {'max_lateral_accel_u_s2': r3(acc), 'max_dlat_per_frame': r3(mx_dlat)}, 'lateral acceleration <= 40 u/s^2 (a 0.22 u lane spring with omega 16 peaks ~ 56 x 0.22 = 12) and no step > 0.06')
def box_stats(fr):
    g = [x for x in gp(fr) if x.get('box')]; bad = [x['i'] for x in g if x['box'][0] < 0 or x['box'][2] > W or x['box'][3] > H or x['box'][1] < 125]
    off = [x['i'] for x in gp(fr) if x.get('benny') and not (0 <= x['benny']['x'] <= W and 0 <= x['benny']['y'] <= H)]
    return {'frames': len(g), 'clipped_frames': bad[:10], 'n_clipped': len(bad), 'offscreen_frames': off[:10], 'x_range': [min([x['box'][0] for x in g] or [0]), max([x['box'][2] for x in g] or [0])], 'y_range': [min([x['box'][1] for x in g] or [0]), max([x['box'][3] for x in g] or [0])]}
bs = {k: box_stats(v['fr']) for k, v in R.items()}
chk(it, '4c', 'Benny never off-screen or clipped while changing lanes', all(b['n_clipped'] == 0 and not b['offscreen_frames'] for b in bs.values()), bs, "his projected mesh box stays inside the 412 x 915 frame and below the HUD (y >= 125) in every gameplay frame", owner='S3')
# ================= 5. natural paddling and body leaning =================
it = item(5, 'Natural paddling and body leaning', 'S2')
sw_ok = all(min([x.get('swim', 0) for x in gp(v['fr'])] or [0]) >= 0.25 for v in both)
def boost(fr):
    g = gp(fr); l = [x.get('lat', 0) for x in g]; v = np.abs(np.diff(l)) * FPS; mv = [g[k + 1].get('swim', 0) for k in range(len(v)) if v[k] > 0.4]; st = [g[k + 1].get('swim', 0) for k in range(len(v)) if v[k] < 0.02 and abs(g[k + 1].get('height', 0)) < 0.01]
    return (float(np.mean(mv)) if mv else None, float(np.mean(st)) if st else None)
bo = [boost(v['fr']) for v in both]
chk(it, '5a', 'paddling never stops and speeds up while steering', sw_ok and all(a is not None and b is not None and a > b for a, b in bo), {'swim_factor_moving_vs_steady': [[r3(a), r3(b)] for a, b in bo]}, 'paddle factor >= 0.25 in every gameplay frame; higher while changing lanes than when swimming straight')
def lean_dir(fr):
    g = gp(fr); l = [x.get('lat', 0) for x in g]; v = np.diff(l) * FPS; n = ok = 0
    for k in range(len(v)):
        if abs(v[k]) > 0.4: n += 1; ok += int(np.sign(g[k + 1].get('lean', 0)) == np.sign(v[k]))
    return ok / n if n else None
ld = [lean_dir(v['fr']) for v in both]
chk(it, '5b', 'leans into the direction of each move', all(x is not None and x >= 0.85 for x in ld), {'share_leaning_into_move': [r3(x) for x in ld]}, 'in >= 85 % of frames with lateral speed > 0.4 u/s the bank has the sign of the move')
def upright(fr):
    g = gp(fr); bad = []
    for k in range(15, len(g)):
        w = g[k - 15:k + 1]
        if all(abs(w[j + 1].get('lat', 0) - w[j].get('lat', 0)) < 0.002 for j in range(15)) and all(abs(x.get('height', 0)) < 0.01 for x in w) and g[k].get('benny'):
            if abs(g[k]['benny']['rollDeg'] - g[k]['benny'].get('camRollDeg', 0)) > 6: bad.append(g[k]['i'])
    return bad
up = [upright(v['fr']) for v in both]
chk(it, '5c', 'returns to the normal swimming posture', all(not b for b in up), {'frames_still_tilted': [b[:8] for b in up]}, 'after 0.5 s of straight swimming his tilt vs the river is <= 6 deg (stroke roll ~2.6 deg)')
chk(it, '5d', 'leaning gentle and smooth [G14]', all(a is not None and a <= 25 and b <= 3 for a, b in rs), {'max_abs_roll_deg': [r3(a) for a, b in rs], 'max_change_deg_per_frame': [r3(b) for a, b in rs]}, 'tilt <= 25 deg, <= 3 deg per frame')
# ================= 6. jumping and diving =================
it = item(6, 'Jumping (swipe up) and diving (swipe down)', 'S2')
vv = [r for r in allresp if r['swipe'] in ('up', 'down')]; nU = sum(r['swipe'] == 'up' for r in vv); nD = sum(r['swipe'] == 'down' for r in vv)
chk(it, '6a', 'every leap / dive swipe answered [G8]', nU >= 4 and nD >= 4 and all(r['ok'] for r in vv), {'up': nU, 'down': nD, 'failed': [(r['swipe'], r['t'], r['max_h'], r['min_h'], r['latency_ms']) for r in vv if not r['ok']][:8]}, '>= 4 of each; leap height > 0.15, dive depth < -0.15, starts within 0.2 s')
dh = max([max(dsteps(v['fr'], 'height') or [0]) for v in both] or [9])
chk(it, '6b', 'smooth out of / into the water [G8]', dh <= 0.08, {'max_dheight_per_frame': r3(dh)}, '|d height| <= 0.08 per frame')
def auto_moves(run):
    vs = [s['t'] for s in run['sw'] if s['swipe'] in ('up', 'down')]; ls = [s['t'] for s in run['sw'] if s['swipe'] in ('left', 'right')]
    bad_h = [x['i'] for x in run['fr'] if abs(x.get('height', 0)) > 0.02 and not any(t - 1e-6 <= x['t'] <= t + 1.6 for t in vs)]
    bad_l = [b['i'] for a, b in zip(run['fr'], run['fr'][1:]) if a.get('lane') != b.get('lane') and not any(t - 1e-6 <= b['t'] <= t + 1.6 for t in ls)]
    return bad_h, bad_l
am = {k: auto_moves(v) for k, v in R.items()}
chk(it, '6c', 'no automatic leaps / dives / lane changes', all(not a and not b for a, b in am.values()), {k: {'height_without_swipe': a[:5], 'lane_change_without_swipe': b[:5]} for k, (a, b) in am.items()}, 'every frame off the water line and every lane change lies within 1.6 s after a matching real swipe')
def returns(run):
    bad = []
    for s in run['sw']:
        if s['swipe'] not in ('up', 'down'): continue
        later = [x for x in run['fr'] if s['t'] + 1.3 <= x['t'] <= s['t'] + 1.6]
        nxt = [t['t'] for t in run['sw'] if t['swipe'] in ('up', 'down') and s['t'] < t['t'] <= s['t'] + 1.6]
        if later and not nxt and any(abs(x.get('height', 0)) > 0.01 for x in later): bad.append(s['t'])
    return bad
rt = {k: returns(v) for k, v in R.items()}
chk(it, '6d', 'returns naturally to swimming on the surface', all(not b for b in rt.values()), rt, 'height back to 0 (+-0.01) 1.3-1.6 s after a leap / dive')
sp = (VIS or {}).get('splash_evidence') or []
chk(it, '6e', 'splash at take-off / entry (evidence, not a gate)', None, {'events': len(sp), 'white_water_ratio_after_vs_before': [s['ratio'] for s in sp]}, 'white-water pixels around Benny in the 0.4 s after vs before each leap / dive (rendered frames)')
# ================= 7. coin collection through real collisions =================
it = item(7, 'Coin collection through real collisions', 'S3')
if coins:
    fr = coins['fr']; lay = coins['plan'].get('layout') or []; c0, c1 = fr[0].get('coins', 0), fr[-1].get('coins', 0); got = (c1 - c0) // 10
    chk(it, '7a', 'the coin trail can really be followed [G9]', got >= 0.8 * len(lay) and len(lay) > 0, {'collected': got, 'coins_in_level': len(lay)}, '>= 80 % of the coins collected by the coin-following player')
    picks = []; bad = []
    for a2, b2 in zip(fr, fr[1:]):
        if (b2.get('coins') or 0) > (a2.get('coins') or 0):
            lp = b2.get('lastPick') or {}; ds = abs((lp.get('s') or 0) - b2.get('s', 0)); dl = abs((lp.get('lat') or 0) - b2.get('lat', 0))
            # 3D contact: the coin's world centre (coinLayout p) vs his body segment (world position + river normal x [0.06, 0.30],
            # controls.js BODY_LO / BODY_HI) <= pick-up radius 0.13 + 0.06 (one frame of travel); a low air coin may touch his hat
            cl = min(lay, key=lambda c: abs(c['s'] - (lp.get('s') or -9)) + abs(c['lat'] - (lp.get('lat') or -9))) if lay else None; d3 = None
            if cl and cl.get('p') and b2.get('bw'):
                p, bw, n = np.array(cl['p']), np.array(b2['bw']), np.array(cl.get('n') or K.get('NUP', [0, 1, 0]))
                a3, b3 = bw + 0.06 * n, bw + 0.30 * n; u = np.clip(np.dot(p - a3, b3 - a3) / np.dot(b3 - a3, b3 - a3), 0, 1); d3 = float(np.linalg.norm(a3 + u * (b3 - a3) - p))
            ok = ds <= 0.35 and dl <= 0.16 and (d3 is None or d3 <= 0.19)
            picks.append({'i': b2['i'], 'kind': lp.get('kind'), 'ds': r3(ds), 'dlat': r3(dl), 'h': b2.get('height'), 'dist3d': r3(d3)}); (bad.append(picks[-1]) if not ok else None)
    chk(it, '7b', 'every pick-up is a real contact (coin at Benny\'s body)', bool(picks) and not bad, {'pickups': len(picks), 'max_dist3d': r3(max([p['dist3d'] or 0 for p in picks] or [0])), 'not_at_body': bad[:6]}, 'at pick-up: |coin s - Benny s| <= 0.35, |coin lat - Benny lat| <= 0.16, 3D distance coin -> his body segment <= 0.19')
    missed = []
    for c in lay:
        if c.get('h', 0) > 0: continue
        near = [x for x in fr if abs(x.get('s', 0) - c['s']) <= 0.03]
        if near and all(abs(x.get('lat', 0) - c['lat']) <= 0.08 and abs(x.get('height', 0)) < 0.03 for x in near):
            k = near[-1]['i'] + 6; after = [x for x in fr if x['i'] == k]
            if after and not any(p['i'] <= k and abs(p.get('ds') or 9) < 1 for p in picks if abs((p['i'] / FPS) * 1.4 - c['s']) < 0.6): missed.append(c['s'])
    chk(it, '7c', 'no coin passes through Benny uncollected', not missed, {'missed_at_s': missed[:8]}, 'a water coin Benny swims through (|lat diff| <= 0.08 at its position, on the surface) is collected')
    cc = [x.get('coinOverlaps') for x in fr if x.get('coinOverlaps') is not None]
    chk(it, '7d', 'coins never crowd / overlap on screen [G11]', bool(cc) and max(cc) == 0, {'frames_with_overlap': sum(1 for x in cc if x > 0), 'max_pairs': max(cc or [0])}, 'no two visible coins (r >= 6 px) overlap in any frame')
else: chk(it, '7a', 'coin run present', False, 'no coins run', 'needs the coins run')
# ================= 8. camera tracking =================
it = item(8, 'Camera tracking', 'S3')
def cam_stats(fr):
    g = [x for x in gp(fr) if x.get('cam')]; P = np.array([x['cam']['p'] for x in g]); v = np.diff(P, axis=0); mv = np.linalg.norm(v, axis=1); jerk = np.linalg.norm(np.diff(v, axis=0), axis=1)
    sm = np.array([P[max(0, k - 3):k + 4].mean(0) for k in range(len(P))]); shake = float(np.sqrt(((P - sm) ** 2).sum(1)[3:-3].mean())) if len(P) > 8 else 0
    Q = [x['cam']['q'] for x in g]; turn = [2 * math.degrees(math.acos(min(1, abs(sum(a * b for a, b in zip(q1, q2)))))) for q1, q2 in zip(Q, Q[1:])]
    A0, A, RR, NUP = (np.array(K.get(k, d)) for k, d in (('A0', [0, 0, 0]), ('A', [0, 0, -1]), ('RR', [1, 0, 0]), ('NUP', [0, 1, 0])))
    rel = P - A0; ax = rel @ A; radial = np.linalg.norm(rel - np.outer(ax, A), axis=1); above = rel @ NUP + K.get('HW', 0.714)
    roll = [abs(x['benny'].get('camRollDeg', 0)) for x in g if x.get('benny')]
    return {'max_move': r3(mv.max()), 'median_move': r3(np.median(mv)), 'max_jerk': r3(jerk.max()), 'jerk_frames': [g[k + 2]['i'] for k in np.where(jerk > 0.035)[0][:8]], 'shake_rms': round(shake, 5),
            'max_turn_deg': r3(max(turn or [0])), 'max_roll_deg': r3(max(roll or [0])), 'max_radial_u': r3(radial.max()), 'min_above_water_u': r3(above.min())}
cst = {k: cam_stats(v['fr']) for k, v in R.items()}
chk(it, '8a', 'smooth: no jump, jerk or shake [G10, stricter]', all(c['max_move'] <= 2 * c['median_move'] + 0.02 and c['max_jerk'] <= 0.035 and c['shake_rms'] <= 0.005 and c['max_turn_deg'] <= 2.5 for c in cst.values()), cst,
    'per-frame move <= 2 x median + 0.02; velocity change <= 0.035 u per frame^2; shake (distance from a 7-frame mean) RMS <= 0.005 u; turn <= 2.5 deg per frame')
chk(it, '8b', 'never clips into the tunnel, level horizon', all(c['max_radial_u'] <= K.get('RT', 1.0) - 0.08 and c['min_above_water_u'] >= 0.03 and c['max_roll_deg'] <= 10 for c in cst.values()), {k: {'max_radial_u': c['max_radial_u'], 'min_above_water_u': c['min_above_water_u'], 'max_roll_deg': c['max_roll_deg']} for k, c in cst.items()},
    'camera <= tunnel radius - 0.08 from the axis, >= 0.03 above the water, roll <= 10 deg')
chk(it, '8c', 'Benny properly visible, enough scenery ahead', all(b['n_clipped'] == 0 and not b['offscreen_frames'] and b['y_range'][0] >= 0.28 * H for b in bs.values()), {k: {'box_y_range': b['y_range'], 'box_x_range': b['x_range'], 'clipped': b['n_clipped']} for k, b in bs.items()},
    "his box inside the frame below the HUD and its top never above 28 % of the height (the tunnel ahead stays open)")
cam_yaw_ok = None
if yaw_rng >= 3:
    g = [x for x in gp((coins or stress)['fr']) if x.get('cam')]
    def fwd_yaw(q):
        x, y, z, w = q; f = np.array([-(2 * (x * z + w * y)), -(2 * (y * z - w * x)), -(1 - 2 * (x * x + y * y))]); return math.degrees(math.atan2(float(f @ np.array(K['RR'])), float(f @ np.array(K['A']))))
    cy = [fwd_yaw(x['cam']['q']) for x in g]; cam_yaw_ok = (max(cy) - min(cy)) >= 0.3 * yaw_rng
    chk(it, '8d', 'turns / tilts subtly with the river\'s curves', cam_yaw_ok, {'camera_yaw_range_deg': r3(max(cy) - min(cy)), 'path_yaw_range_deg': r3(yaw_rng)}, 'camera heading range >= 30 % of the path heading range')
else: chk(it, '8d', 'turns / tilts subtly with the river\'s curves', False, {'path_yaw_range_deg': r3(yaw_rng), 'note': 'the river does not bend in this build, so the camera cannot follow curves'}, 'needs a bending river (item 3)', owner='S3 (after S1 river_center)')
# ================= 9. water splashes and visual consistency =================
it = item(9, 'Water splashes and visual consistency', 'S1')
spl = [x.get('splash') for v in both for x in gp(v['fr']) if x.get('splash') and abs(x.get('height', 0)) < 0.01]
chk(it, '9a', 'white splash around Benny while he swims on the surface', bool(spl) and sum(1 for s in spl if s['v'] and s['o'] >= 0.5) >= 0.95 * len(spl), {'frames_on_surface': len(spl), 'with_splash': sum(1 for s in spl if s['v'] and s['o'] >= 0.5)}, 'main splash visible with opacity >= 0.5 in >= 95 % of surface frames', owner='S2')
if VIS:
    D = VIS['defects']; L = VIS['likeness']; st = VIS.get('selftest_pass')
    chk(it, '9b', 'the checker itself is trustworthy (self-test)', st, {k: v['pass'] for k, v in VIS['selftest'].items()}, 'finds nothing on the approved picture (its intentional dark slots are NOT errors), finds every synthetic defect', owner='S4')
    chk(it, '9c', 'no black patches / dark areas that are not dark in the approved picture', not D['dark_frames'], {'frames': len(D['dark_frames']), 'first': D['dark_frames'][:8], 'largest_px': D['dark_largest_px']}, 'max-RGB < 32 area >= 60 px, < 60 % inside the approved picture\'s own dark areas (dilated 6 px)')
    chk(it, '9d', 'no gaps / tears in the geometry', not D['gap_frames'] and not D['tear_frames'], {'gap_frames': D['gap_frames'][:8], 'tear_frames': D['tear_frames'][:8]}, 'no clear-colour hole >= 40 px, no thin dark crack >= 25 px outside intentional dark')
    chk(it, '9e', 'no blur', not D['blur_frames'], {'frames': len(D['blur_frames']), 'first': D['blur_frames'][:8], 'sharpness_vs_approved': L['sharp']}, 'sharpness >= 0.6 x approved, >= 0.5 x frame 0 [V2], every band >= 0.45 x approved')
    chk(it, '9f', 'no flicker / popping, no frozen or jumping frames [V3, V5]', not D['local_flicker_frames'] and not D['pop_spike_frames'] and not D['freeze_frames'] and not D['jump_frames'],
        {'local_flicker': D['local_flicker_frames'][:8], 'pop_spikes': D['pop_spike_frames'][:8], 'frozen': D['freeze_frames'][:8], 'jumps': D['jump_frames'][:8], 'pop_median': D['pop_median'], 'change_median': D['change_median']}, 'see qa_visual.py')
    chk(it, '9g', 'no stretched textures', not D['stretch_frames'], {'frames': len(D['stretch_frames']), 'max_share': D['stretch_share_max']}, '<= 4 % of scenery tiles smeared (coherence >= 0.75 and >= 0.35 above the approved tile)')
    chk(it, '9h', 'the approved colour look kept in every frame [V4, stricter]', L['colour']['min'] >= 0.85, L['colour'], 'hue/saturation correlation with the approved scenery >= 0.85 in every gameplay frame')
    chk(it, '9i', 'consistent look (no sudden drops while swimming)', not D['look_drop_frames'], {'frames': D['look_drop_frames'][:8]}, 'within-20 share never > 12 points below its +-0.5 s running median')
else: chk(it, '9b', 'visual check ran', False, 'no visual.json', 'needs rendered frames')
# ================= 10. full-level progression =================
it = item(10, 'Full-level progression without crashes, freezes, glitches or broken transitions', 'S3')
errs = [e for v in both for e in v['res'].get('errors', []) + v['res'].get('net_errors', [])] + (LIVE or {}).get('errors', [])
chk(it, '10a', 'no page / console / network errors, no crash [G1]', not errs, errs[:6], '0 errors in both runs and the real-time check')
if coins:
    fr = coins['fr']; f = [b['s'] - a['s'] for a, b in zip(fr, fr[1:])]; done = bool(fr[-1].get('done'))
    exp_t = math.floor((K.get('level', {}).get('tB0', 0) + (fr[-1].get('sDone') or 0) - K.get('level', {}).get('ring0', 0)) / K.get('S', 2.09)) - K.get('level', {}).get('k0', 0)
    tiles = sorted({x.get('tile') for x in fr if x.get('tile') is not None})
    chk(it, '10b', 'the WHOLE level to its end, every section [G2, G13]', done and fr[-1]['i'] == len(fr) - 1 and tiles == list(range(0, exp_t + 1)) and abs(fr[-1]['s'] - (fr[-1].get('sDone') or 0)) <= 0.1,
        {'frames': len(fr), 'seconds': round(len(fr) / FPS, 2), 'done': done, 's_end': fr[-1]['s'], 'level_end': fr[-1].get('sDone'), 'sections_entered': tiles, 'sections_expected': exp_t + 1}, 'state().done at the level end; sections 0..last entered without gaps')
    chk(it, '10c', 'continuous forward swimming: no freeze, stall or jump [G3]', min(f) > 0 and max(f) <= 1.5 * min(f) + 0.02, {'min_step': r3(min(f)), 'max_step': r3(max(f))}, 'path step > 0 and <= 1.5 x min + 0.02 every frame')
    ek = [x.get('endK') or 0 for x in fr]
    chk(it, '10d', 'ending transition smooth and complete [G12]', any(k > 0.05 for k in ek) and all(b >= a - 1e-3 for a, b in zip(ek, ek[1:])) and ek[-1] >= 0.95, {'first_frame': next((x['i'] for x in fr if (x.get('endK') or 0) > 0.05), None), 'k_at_end': ek[-1]}, 'golden-light bloom present, never goes back, >= 0.95 on the last frame', owner='S1')
    an = [math.hypot(b['benny']['x'] - a['benny']['x'], b['benny']['y'] - a['benny']['y']) for a, b in zip(gp(fr), gp(fr)[1:]) if a.get('benny') and b.get('benny')]
    chk(it, '10e', 'no teleport of Benny on screen', max(an or [0]) <= 60, {'max_anchor_px_per_frame': r3(max(an or [0]))}, "his screen anchor moves <= 60 px per frame (a leap take-off ~37 px)", owner='S2+S3')
    h0 = fr[0].get('heap'); h1 = fr[-1].get('heap')
    chk(it, '10f', 'no memory growth over the level', h0 is None or h1 is None or h1 <= 1.5 * h0 + 20e6, {'heap_start_MB': r3((h0 or 0) / 1e6), 'heap_end_MB': r3((h1 or 0) / 1e6)}, 'JS heap at the end <= 1.5 x start + 20 MB', owner='S2+S3')
# ================= 11. likeness target =================
it = item(11, 'Approved Screen 05 look while swimming: 90-95 % target (user order 5)', 'S1')
if VIS:
    f0 = VIS.get('frame0') or {}; pa = VIS.get('phase_aligned') or {}
    chk(it, '11a', 'start view >= 90 % of scenery pixels within 20 levels of the approved picture', (f0.get('within20') or 0) >= 0.90, {k: f0.get(k) for k in ('within20', 'within20_bands', 'ssim', 'colour', 'sharp', 'layout_cells_within25')}, 'frame 0 = the approved camera; scenery = below the HUD minus Benny and his splash')
    chk(it, '11b', 'while swimming (frames one ring period apart, where the painted view repeats) >= 90 %', (pa.get('within20_median') or 0) >= 0.90, {'within20_median': pa.get('within20_median'), 'within20_min': pa.get('within20_min'), 'layout_median': pa.get('layout_median'), 'frames': [p['i'] for p in pa.get('frames', [])][:20]}, 'median over phase-aligned gameplay frames')
    chk(it, '11c', 'all gameplay frames (informative: the camera has moved, no exact counterpart)', None, {k: VIS['likeness'].get(k) for k in ('within20', 'ssim', 'colour', 'layout_cells_within25', 'sharp')}, 'reported, not a gate')
# ================= P. phone load + responsiveness (device-independent) =================
it = item('P', 'Gameplay frame rate + input responsiveness (what can be measured here)', 'lead')
stepms = [x.get('stepMs') for v in both for x in v['fr'] if x.get('stepMs') is not None]
pf = [p for v in both for p in v['perf'].get('render_frames', [])]
chk(it, 'Pa', 'game logic cost per frame (window.step, JavaScript)', bool(stepms) and float(np.percentile(stepms, 95)) <= 4, {'p50_ms': r3(np.percentile(stepms, 50)) if stepms else None, 'p95_ms': r3(np.percentile(stepms, 95)) if stepms else None, 'max_ms': r3(max(stepms or [0]))}, 'p95 <= 4 ms on this machine (a phone CPU is ~2-4x slower: <= ~12 ms of a 16.7 ms frame)', owner='S2+S3')
if pf:
    dr = max(p['draws'] for p in pf); tr = max(p['tris'] for p in pf); tx = max(p['texMB'] for p in pf)
    chk(it, 'Pb', 'GPU load per frame within a mid-range-phone budget', dr <= 150 and tr <= 500000 and tx <= 160, {'draw_calls_max': dr, 'triangles_max': tr, 'texture_MB': tx, 'textures': max(p['texCount'] for p in pf), 'max_texture_px': max(p['maxTexDim'] for p in pf), 'software_render_ms_here': [p['renderSubmitMsPer'] for p in pf][:6]},
        'draw calls <= 150, triangles <= 500k, texture memory <= 160 MB (estimates for a mid-range Android phone at 60 fps; the real fps is the phone meter)', owner='S1')
if LIVE:
    chk(it, 'Pc', 'real-time phone mode works correctly (live loop)', LIVE.get('pass'), {k: (c['pass'], c['value']) for k, c in LIVE['checks'].items()}, 'qa_live.cjs L1-L7: waits for the tap, one game step per displayed frame, correct game clock, every swipe registered, move visible within 2 frames, 0 errors', owner='S2+lead')
chk(it, 'Pd', 'phone frame rate', None, 'NOT MEASURABLE HERE: no KVM -> no Android emulator; Chromium uses software WebGL (SwiftShader) on 4 shared CPUs. The phone build shows fps + swipe response on screen (live.js meter, ?meter=1).', 'measured on the user\'s phone')
# ---------------- verdict ----------------
for it in items.values():
    gates = [c for c in it['checks'] if c['pass'] is not None]; it['pass'] = bool(gates) and all(c['pass'] for c in gates)
ok = all(it['pass'] for k, it in items.items())
V = {'pass': ok, 'items': items, 'runs': {k: {'frames': len(v['fr']), 'swipes': len(v['sw']), 'directions': dirs(v), 'blocks': v['plan'].get('blocks'), 'wall_s': v['res'].get('wall_seconds')} for k, v in R.items()},
     'responses': RESP, 'game': os.path.abspath(game)}
json.dump(V, open(os.path.join(out, 'VERDICT.json'), 'w'), indent=1, default=str)
# ---------------- REPORT.md ----------------
fmt = lambda v: json.dumps(v, default=str)[:260]
md = [f"# Screen 05 acceptance (S4 suite) — {'PASS' if ok else 'FAIL'}", '', f"Game: `{os.path.abspath(game)}`  ", f"Runs: " + ', '.join(f"{k}: {v['frames']} frames, {v['swipes']} real touch swipes {v['directions']}" for k, v in V['runs'].items()), '',
      '## The user\'s 10 test items (+ likeness target, phone load)', '', '| # | item | result | key number |', '|---|---|---|---|']
def key(it):
    f = [c for c in it['checks'] if c['pass'] is False]; c = f[0] if f else (it['checks'][0] if it['checks'] else None)
    return '' if not c else f"{c['id']}: {fmt(c['value'])[:150]}"
for k, it in items.items(): md.append(f"| {k} | {it['title']} | {'PASS' if it['pass'] else '**FAIL**'} | {key(it)} |")
md += ['', '## Failures by responsible specialist', '']
by = {}
for it in items.values():
    for c in it['checks']:
        if c['pass'] is False: by.setdefault(c['owner'], []).append((it['n'], c))
for o in sorted(by):
    md.append(f"### {OWN.get(o, o)}"); md.append('')
    for n, c in by[o]: md.append(f"* item {n} / {c['id']} **{c['check']}** — {fmt(c['value'])}  (rule: {c['rule']})")
    md.append('')
md += ['## Every check', '']
for k, it in items.items():
    md.append(f"### {k}. {it['title']} — {'PASS' if it['pass'] else 'FAIL'}")
    for c in it['checks']: md.append(f"* {c['id']} {'PASS' if c['pass'] else ('info' if c['pass'] is None else '**FAIL**')} [{c['owner']}] {c['check']}: `{fmt(c['value'])}` — {c['rule']}")
    md.append('')
open(os.path.join(out, 'REPORT.md'), 'w').write('\n'.join(md) + '\n')
print('\n'.join(md[:24])); sys.exit(0 if ok else 1)
