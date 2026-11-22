"""Rainbow ONE connected world (round 44) - layout step. Places the areas in ONE coordinate system so each area's exit physically meets the next
area's entrance, assembles ONE route (Benny's path) through all of them, the camera keys (each area's fitted picture cameras, exact there),
the coins, and the Blender connector pieces (tools/world/blender_connectors.py).
  python3 -I tools/world/world_layout.py <04 kit layout.json> <section.json> <out dir>
Area order of play (user, 2026-11-22): 04 -> A Bubble Dash -> B Sock Rescue (A + B = the section) -> 05 -> 06 -> 07 -> 08 -> 09 -> 10.
v1 = 04 -> A -> B. Units: the kit / section units (water under Benny y = 0, camera 0.734 above it at each picture). Benny measures 0.473 u in 04
and 0.468 u in the section (1 % apart: one physical Benny, no rescaling needed for these two). The old game's units are ~3x larger; areas
that come from it are rebuilt with the kit in these units (user decision r44) - nothing is scaled at run time.
Join 04 -> A: 04's gold tube ends in a round doorway in the Bubble Dash chamber's near wall (the chamber is open behind its picture camera:
side walls / ceiling / floor run to z = +2 in section coordinates, nothing closes them). Both waters at y = 0; the route runs straight on.
"""
import sys, os, json, math
import numpy as np

L04 = json.load(open(sys.argv[1])); SEC = json.load(open(sys.argv[2])); OUT = sys.argv[3]; os.makedirs(OUT, exist_ok=True)
DS = 0.05


def resample(P, step=DS):
    P = np.asarray(P, float); L = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    s = np.arange(0, L[-1] + 1e-9, step); return np.stack([np.interp(s, L, P[:, i]) for i in range(3)], 1)


# ---- area 04 (kit): its own coordinates are the world's (offset 0)
D4 = L04['drum']; R4 = D4['r']; r4 = np.array(L04['route']['points']); z_end4 = float(r4[-1][2])
assert D4.get('open_end'), '04 must be built with --open-end (its tube stops at the doorway)'
# ---- area AB (section): its near wall plane (z = +2 in section coordinates) = 04's tube end; its route start continues 04's route
RT = SEC['route']; z0s = -RT['z0']; xs = np.array(RT['x'])
def RX(z): x = min(max((-z - RT['z0']) / RT['ds'], 0), len(xs) - 1.001); i = int(x); f = x - i; return xs[i] + (xs[i + 1] - xs[i]) * f
Z_NEAR_SEC = SEC['chamber']['z_near']                       # 2.0: where the chamber's side walls / ceiling / floor end behind its camera
T = np.array([float(r4[-1][0]) - RX(z0s), 0.0, z_end4 - Z_NEAR_SEC])   # route x continuous at the section's route start; near wall at 04's end
# section route points (world), from its first point to the level end inside the Sock Rescue tunnel
ZB0 = SEC['benny']['bubble'][2]; z_lev = SEC['tunnel'].get('z_level_end', SEC['tunnel']['z_exit'] - 4.5)
zz = np.arange(z0s, z_lev - 1e-9, -DS); rs = np.stack([[RX(z) for z in zz], np.zeros_like(zz), zz], 1) + T
# ---- connector route 04 end -> section start (the doorway): C1 Hermite, both ends heading -z
p0, p1 = r4[-1], rs[0]; n = max(8, int(np.linalg.norm(p1 - p0) / DS))
tt = np.linspace(0, 1, n + 1)[1:-1]; Ldist = float(np.linalg.norm(p1 - p0))
h00 = 2 * tt ** 3 - 3 * tt ** 2 + 1; h10 = tt ** 3 - 2 * tt ** 2 + tt; h01 = -2 * tt ** 3 + 3 * tt ** 2; h11 = tt ** 3 - tt ** 2
m0 = m1 = np.array([0, 0, -Ldist])
rc = h00[:, None] * p0 + h10[:, None] * m0 + h01[:, None] * p1 + h11[:, None] * m1
route = resample(np.vstack([r4, rc, rs]))
bank = np.zeros(len(route))
def s_of(P): return float(np.argmin(np.linalg.norm(route - np.asarray(P), axis=1)) * DS)
s04_end = s_of(r4[-1]); sAB0 = s_of(rs[0]); s_bub = s_of(np.array(SEC['benny']['bubble']) + T); s_sock = s_of(np.array(SEC['benny']['sock']) + T)
LEVEL = float((len(route) - 1) * DS)
# ---- camera keys: Benny's route position at each approved picture + that picture's fitted camera (world). Exact there; blended between.
c4 = L04['cams'][0]; ahead4 = L04['benny'].get('ahead', 0.0)
keys = [{'area': '04', 's': float(c4['s_ref'] + ahead4), 'pos': c4['pos'], 'yaw': c4['yaw'], 'pitch': c4['pitch'], 'ref': c4['ref']}]
for nm, sb in (('bubble', s_bub), ('sock', s_sock)):
    c = SEC['cams'][nm]; keys.append({'area': 'AB', 's': sb, 'pos': (np.array(c['pos']) + T).tolist(), 'yaw': c['yaw'], 'pitch': c['pitch'], 'ref': c['ref']})
# ---- areas: s ranges, titles (each picture's own HUD title), camera clamp (the camera never leaves the tube / chamber)
areas = [
    {'id': '04', 'kind': 'kit', 'dir': 'a04/', 'offset': [0, 0, 0], 's0': 0.0, 's1': s04_end, 'title': '04 · THROUGH THE FIVE ARROWS', 'coins_start': L04.get('coins_start', 1330),
     'clamp': {'type': 'tube', 'axis': [D4['axis_x'], D4['axis_y']], 'r': R4, 'z0': D4['z0'] + 0.5, 'z1': z_end4}},
    {'id': 'AB', 'kind': 'section', 'dir': 'aAB/', 'offset': T.tolist(), 's0': s04_end, 's1': LEVEL,
     'titles': [[s04_end, 'BUBBLE DASH CHAMBER'], [s_bub + (s_sock - s_bub) * 0.62, 'SOCK RESCUE TUNNEL']], 'mission_from': s_bub + (s_sock - s_bub) * 0.62},
]
# ---- connector pieces (Blender): the chamber's near wall with the doorway of 04's tube + a gold collar ring around it
CH = SEC['chamber']
conn = [{'name': 'cwall_04A', 'kind': 'wall_hole', 'z': z_end4, 'x0': CH['xl'] + T[0], 'x1': CH['xr'] + T[0], 'y0': -0.4, 'y1': CH['yc'],
         'hole': [D4['axis_x'], D4['axis_y'], R4], 'area': 'AB', 'fam': 'pink'},
        {'name': 'cring_04A', 'kind': 'collar', 'z': z_end4 + 0.06, 'axis': [D4['axis_x'], D4['axis_y']], 'r': R4 + 0.02, 'band': 0.3, 'area': '04', 'fam': 'ring'},
        {'name': 'cwater_04A', 'kind': 'strip', 'z0': z_end4 + 0.6, 'z1': z_end4 - 1.2, 'x0': D4['axis_x'] - R4, 'x1': D4['axis_x'] + R4, 'y': -0.01, 'area': '04', 'fam': 'pool'}]
world = {'version': 1, 'note': 'round 44: 04 -> A Bubble Dash -> B Sock Rescue in ONE scene (tools/world/world.html)', 'ds': DS, 'LEVEL': LEVEL,
         'route': {'points': route.round(5).tolist(), 'bank': bank.tolist()}, 'areas': areas, 'cam_keys': keys, 'connectors': conn,
         'joins': [{'from': '04', 'to': 'A', 's': s04_end, 'kind': 'doorway', 'z': z_end4}],
         'start_s': keys[0]['s'], 'benny_h': L04['benny']['height']}
json.dump(world, open(os.path.join(OUT, 'world.json'), 'w'))
json.dump({'connectors': conn}, open(os.path.join(OUT, 'connectors_spec.json'), 'w'), indent=1)
print(f"04 tube end z {z_end4:.2f}; section offset {T.round(3).tolist()}; route {LEVEL:.2f} u (04 0-{s04_end:.2f}, AB {s04_end:.2f}-{LEVEL:.2f}); "
      f"picture keys s: 04 {keys[0]['s']:.2f}, Bubble Dash {s_bub:.2f}, Sock Rescue {s_sock:.2f}")
