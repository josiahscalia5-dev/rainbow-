"""Rainbow screen kit (round 44): scale a fitted screen layout uniformly so its Benny has the world's ONE physical size (the kit fixes the camera
0.734 above the water at each picture, so each fit's Benny height differs: 06 0.574 u vs ~0.47 u elsewhere). Every length is multiplied by k;
angles, ratios and picture data are kept; the bake densities (picture px per world unit) are divided by k. The picture view is unchanged
(the fitted camera scales with everything: similar triangles).
  python3 -I tools/screenkit/scale_layout.py <layout.json in> <layout.json out> --benny-h 0.468      (or --k 0.815)
"""
import sys, json, argparse
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--k', type=float); ap.add_argument('--benny-h', type=float)
a = ap.parse_args(); L = json.load(open(a.src)); k = a.k if a.k else a.benny_h / L['benny']['height']
S = lambda v: [x * k for x in v] if isinstance(v, list) else v * k
for c in L['cams']:
    c['pos'] = S(c['pos'])
    if 's_ref' in c: c['s_ref'] *= k
for f in ('pos', 'height', 'lift', 'ahead'):
    if f in L['benny']: L['benny'][f] = S(L['benny'][f])
L['coin_radius'] *= k; L['coins'] = [S(c) for c in L['coins']]
L['route']['points'] = [S(p) for p in L['route']['points']]; L['route']['ds'] *= k; L['route']['width'] *= k
for f in ('axis_x', 'axis_y', 'r', 'z0', 'z_far', 'z1', 'seg', 'seg_far', 'chord', 'pool_y'):
    if f in L['drum']: L['drum'][f] *= k
L['rings']['z'] = S(L['rings']['z']); L['rings']['spacing'] *= k; L['rings']['band'] *= k
for p in L.get('paddles', []): p['pos'] = S(p['pos']); p['width'] *= k
L['bubbles'] = [S(b) for b in L.get('bubbles', [])]
if 'bake_dens' in L: L['bake_dens'] = [d / k for d in L['bake_dens']]
for f in ('slot_tile',):
    if f in L: L[f] = S(L[f])
for f in ('level_end', 'river_width'):
    if f in L: L[f] *= k
for f in ('funnel', 'wall', 'pool_front', 'mouth_ring'):
    if f in L: raise SystemExit(f'scale_layout: {f} not handled yet')
L['world_scale'] = k
json.dump(L, open(a.dst, 'w')); print(f'scaled by k = {k:.4f}: Benny {L["benny"]["height"]:.3f} u, drum r {L["drum"]["r"]:.3f}, route {(len(L["route"]["points"]) - 1) * L["route"]["ds"]:.2f} u')
