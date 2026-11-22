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
L05 = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else None      # v2: Screen 05 (kit) joined after Sock Rescue
L06 = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else None      # v3: Screen 06 (kit, scaled to the world's Benny: tools/screenkit/scale_layout.py)
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
Z_CUT_SEC = -57.11                                                  # v2: Sock Rescue ends at a tube segment boundary (tunnel_17), its exit room is not used
if L05: z_lev = Z_CUT_SEC
zz = np.arange(z0s, z_lev - 1e-9, -DS); rs = np.stack([[RX(z) for z in zz], np.zeros_like(zz), zz], 1) + T
# ---- connector route 04 end -> section start (the doorway): C1 Hermite, both ends heading -z
p0, p1 = r4[-1], rs[0]; n = max(8, int(np.linalg.norm(p1 - p0) / DS))
tt = np.linspace(0, 1, n + 1)[1:-1]; Ldist = float(np.linalg.norm(p1 - p0))
h00 = 2 * tt ** 3 - 3 * tt ** 2 + 1; h10 = tt ** 3 - 2 * tt ** 2 + tt; h01 = -2 * tt ** 3 + 3 * tt ** 2; h11 = tt ** 3 - tt ** 2
m0 = m1 = np.array([0, 0, -Ldist])
rc = h00[:, None] * p0 + h10[:, None] * m0 + h01[:, None] * p1 + h11[:, None] * m1
parts = [r4, rc, rs]
TS = SEC['tunnel']; conn_extra = []; conn_tubes = []
if L05:   # ---- join B -> 05 (user's guide: "laundry tunnel curves into Screen 05 S-shaped current"): S-curve + widening tube, Blender
    D5 = L05['drum']; R5 = D5['r']; r5 = np.array(L05['route']['points'])
    LC, DX = 9.0, 1.6                                                # connector length / sideways shift (a gentle S toward the right)
    A0 = np.array([0.0 + T[0], TS['axis_y_sock'], Z_CUT_SEC + T[2]])                     # Sock Rescue tube axis at the cut (world)
    T5 = np.array([A0[0] + DX - D5['axis_x'], 0.0, A0[2] - LC - D5['z0']])               # 05 placed so its tube start meets the connector end
    A1 = np.array([D5['axis_x'] + T5[0], D5['axis_y'], D5['z0'] + T5[2]])
    def herm(p0, p1, t, L):
        h00 = 2 * t ** 3 - 3 * t ** 2 + 1; h10 = t ** 3 - 2 * t ** 2 + t; h01 = -2 * t ** 3 + 3 * t ** 2; h11 = t ** 3 - t ** 2
        m = np.array([0, 0, -L]); return h00[:, None] * p0 + h10[:, None] * m + h01[:, None] * p1 + h11[:, None] * m
    tt = np.linspace(0, 1, 91); ax = herm(A0, A1, tt, LC); k = tt * tt * (3 - 2 * tt)
    ax[0, 2] += 0.2; ax[-1, 2] -= 0.2                               # overlap 0.2 u into both neighbouring tubes: no crack where differently tessellated rings meet
    rad = TS['r_sock'] + (R5 - TS['r_sock']) * k + 0.006; ax[:, 1] = TS['axis_y_sock'] + (D5['axis_y'] - TS['axis_y_sock']) * k
    half = np.sqrt(np.maximum(0.01, rad ** 2 - ax[:, 1] ** 2))
    p0r, p1r = rs[-1], r5[0] + T5; L2 = float(np.linalg.norm(p1r - p0r)); t2 = np.linspace(0, 1, max(8, int(L2 / DS)) + 1)[1:-1]
    rc2 = herm(p0r, p1r, t2, L2); rc2[:, 1] = 0.0
    parts += [rc2, r5 + T5]
    conn_extra = [{'name': f'ctube_B05_{i}', 'kind': 'tube', 'axis': ax[i * 30:(i + 1) * 30 + 1].round(5).tolist(), 'r': rad[i * 30:(i + 1) * 30 + 1].round(5).tolist(),
                   'area': 'AB' if i == 0 else '05', 'fam': 'tunnelS' if i == 0 else 'tunnel'} for i in range(3)]
    conn_extra += [{'name': f'cring_B05_{j}', 'kind': 'collar_path', 'axis_pt': ax[i].round(5).tolist(), 'dir': (ax[min(90, i + 1)] - ax[max(0, i - 1)]).round(5).tolist(), 'r': float(rad[i] - 0.03),
                    'band': 0.26, 'area': '05', 'fam': 'ring'} for j, i in enumerate([30, 60])]
    conn_extra += [{'name': 'cwater_B05', 'kind': 'strip_path', 'axis': ax.round(5).tolist(), 'half': (half * 0.98).round(5).tolist(), 'y': -0.012, 'area': '05', 'fam': 'pool'}]
    conn_tubes = [{'axis': ax.round(4).tolist(), 'r': rad.round(4).tolist()}]
banks = [np.zeros(len(p)) for p in parts]
if L06:   # ---- join 05 -> 06 (user's guide: "S-curve climbs seamlessly into the raised banked crest"): 05's current tube widens and rises into 06's
    # large off-centre drum (Blender connector, 6 u); the S-river runs on, and 06's own route climbs the banked crest
    D6 = L06['drum']; r6 = np.array(L06['route']['points']); LC6 = 6.0
    z5_end = D5['z1'] + T5[2]; B0 = np.array([D5['axis_x'] + T5[0], D5['axis_y'], z5_end])
    p5e = r5[-1] + T5
    T6 = np.array([p5e[0] - r6[0][0], 0.0, z5_end - LC6 - D6['z0']])                       # route x continuous; 06 drum start meets the connector end
    B1 = np.array([D6['axis_x'] + T6[0], D6['axis_y'], D6['z0'] + T6[2]])
    tt = np.linspace(0, 1, 61); ax6 = herm(B0, B1, tt, LC6); k6 = tt * tt * (3 - 2 * tt)
    ax6[:, 0] = B0[0] + (B1[0] - B0[0]) * k6; ax6[:, 1] = B0[1] + (B1[1] - B0[1]) * k6; ax6[0, 2] += 0.2; ax6[-1, 2] -= 0.2
    rad6 = D5['r'] + (D6['r'] - D5['r']) * k6 + 0.006; half6 = np.sqrt(np.maximum(0.01, rad6 ** 2 - ax6[:, 1] ** 2))
    p6s = r6[0] + T6; L3 = float(np.linalg.norm(p6s - p5e)); t3 = np.linspace(0, 1, max(8, int(L3 / DS)) + 1)[1:-1]
    rc3 = herm(p5e, p6s, t3, L3); rc3[:, 1] = 0.0
    parts += [rc3, r6 + T6]; banks += [np.zeros(len(rc3)), np.array(L06['route']['bank'])]
    conn_extra += [{'name': f'ctube_056_{i}', 'kind': 'tube', 'axis': ax6[i * 30:(i + 1) * 30 + 1].round(5).tolist(), 'r': rad6[i * 30:(i + 1) * 30 + 1].round(5).tolist(),
                    'area': '05' if i == 0 else '06', 'fam': 'tunnel'} for i in range(2)]
    conn_extra += [{'name': 'cring_056', 'kind': 'collar_path', 'axis_pt': ax6[30].round(5).tolist(), 'dir': (ax6[31] - ax6[29]).round(5).tolist(), 'r': float(rad6[30] - 0.03),
                    'band': 0.3, 'area': '06', 'fam': 'ring'},
                   {'name': 'cwater_056', 'kind': 'strip_path', 'axis': ax6.round(5).tolist(), 'half': (half6 * 0.98).round(5).tolist(), 'y': -0.012, 'area': '06', 'fam': 'pool'}]
    conn_tubes.append({'axis': ax6.round(4).tolist(), 'r': rad6.round(4).tolist()})
# ONE route through every part; the bank (06's crest) is carried along by arc length
Pall = np.vstack(parts); Ball = np.concatenate(banks); Lc = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(Pall, axis=0), axis=1))])
sg = np.arange(0, Lc[-1] + 1e-9, DS); route = np.stack([np.interp(sg, Lc, Pall[:, i]) for i in range(3)], 1); bank = np.interp(sg, Lc, Ball)
def s_of(P): return float(np.argmin(np.linalg.norm(route - np.asarray(P), axis=1)) * DS)
s04_end = s_of(r4[-1]); sAB0 = s_of(rs[0]); s_bub = s_of(np.array(SEC['benny']['bubble']) + T); s_sock = s_of(np.array(SEC['benny']['sock']) + T)
LEVEL = float((len(route) - 1) * DS)
s_B_end = s_of(rs[-1]); s05_0 = s_of(r5[0] + T5) if L05 else None
s05_end = s_of(r5[-1] + T5) if L05 else None
# ---- camera keys: Benny's route position at each approved picture + that picture's fitted camera (world). Exact there; blended between.
c4 = L04['cams'][0]; ahead4 = L04['benny'].get('ahead', 0.0)
keys = [{'area': '04', 's': float(c4['s_ref'] + ahead4), 'pos': c4['pos'], 'yaw': c4['yaw'], 'pitch': c4['pitch'], 'ref': c4['ref']}]
for nm, sb in (('bubble', s_bub), ('sock', s_sock)):
    c = SEC['cams'][nm]; keys.append({'area': 'AB', 's': sb, 'pos': (np.array(c['pos']) + T).tolist(), 'yaw': c['yaw'], 'pitch': c['pitch'], 'ref': c['ref']})
# ---- areas: s ranges, titles (each picture's own HUD title), camera clamp (the camera never leaves the tube / chamber)
areas = [
    {'id': '04', 'kind': 'kit', 'dir': 'a04/', 'offset': [0, 0, 0], 's0': 0.0, 's1': s04_end, 'title': '04 · THROUGH THE FIVE ARROWS', 'coins_start': L04.get('coins_start', 1330),
     'clamp': {'type': 'tube', 'axis': [D4['axis_x'], D4['axis_y']], 'r': R4, 'z0': D4['z0'] + 0.5, 'z1': z_end4}},
    {'id': 'AB', 'kind': 'section', 'dir': 'aAB/', 'offset': T.tolist(), 's0': s04_end, 's1': (s_B_end + 3.0) if L05 else LEVEL, 'cut_z': (Z_CUT_SEC if L05 else None),
     'titles': [[s04_end, 'BUBBLE DASH CHAMBER'], [s_bub + (s_sock - s_bub) * 0.62, 'SOCK RESCUE TUNNEL']], 'mission_from': s_bub + (s_sock - s_bub) * 0.62},
]
if L05:
    c5 = L05['cams'][0]; keys.append({'area': '05', 's': s_of(np.array(L05['benny']['pos']) + T5) + L05['benny'].get('ahead', 0.0), 'pos': (np.array(c5['pos']) + T5).tolist(),
                                        'yaw': c5['yaw'], 'pitch': c5['pitch'], 'ref': c5['ref']})
    areas.append({'id': '05', 'kind': 'kit', 'dir': 'a05/', 'offset': T5.tolist(), 's0': s_B_end + 3.0, 's1': (s05_end + 3.0) if L06 else LEVEL, 'title': '05 · FLOW INTO THE CURRENT'})
if L06:
    c6 = L06['cams'][0]; keys.append({'area': '06', 's': s_of(np.array(L06['benny']['pos']) + T6) + L06['benny'].get('ahead', 0.0), 'pos': (np.array(c6['pos']) + T6).tolist(),
                                        'yaw': c6['yaw'], 'pitch': c6['pitch'], 'ref': c6['ref']})
    areas.append({'id': '06', 'kind': 'kit', 'dir': 'a06/', 'offset': T6.tolist(), 's0': s05_end + 3.0, 's1': LEVEL, 'title': '06 · CREST THE RINSE ARCH'})
# ---- connector pieces (Blender): the chamber's near wall with the doorway of 04's tube + a gold collar ring around it
CH = SEC['chamber']
conn = [{'name': 'cwall_04A', 'kind': 'wall_hole', 'z': z_end4, 'x0': CH['xl'] + T[0], 'x1': CH['xr'] + T[0], 'y0': -0.4, 'y1': CH['yc'],
         'hole': [D4['axis_x'], D4['axis_y'], R4], 'area': 'AB', 'fam': 'pink'},
        {'name': 'cring_04A', 'kind': 'collar', 'z': z_end4 + 0.06, 'axis': [D4['axis_x'], D4['axis_y']], 'r': R4 + 0.02, 'band': 0.3, 'area': '04', 'fam': 'ring'},
        {'name': 'cwater_04A', 'kind': 'strip', 'z0': z_end4 + 0.6, 'z1': z_end4 - 1.2, 'x0': D4['axis_x'] - R4, 'x1': D4['axis_x'] + R4, 'y': -0.01, 'area': '04', 'fam': 'pool'}] + conn_extra
world = {'version': 1, 'note': 'round 44: 04 -> A Bubble Dash -> B Sock Rescue in ONE scene (tools/world/world.html)', 'ds': DS, 'LEVEL': LEVEL,
         'route': {'points': route.round(5).tolist(), 'bank': bank.tolist()}, 'areas': areas, 'cam_keys': keys, 'connectors': conn,
         'conn_tubes': conn_tubes if L05 else [],
         'joins': [{'from': '04', 'to': 'A', 's': s04_end, 'kind': 'doorway', 'z': z_end4}] + ([{'from': 'B', 'to': '05', 's': s_B_end, 'kind': 'S-curve widening tube', 'length': 9.0}] if L05 else []),
         'start_s': keys[0]['s'], 'benny_h': L04['benny']['height']}
json.dump(world, open(os.path.join(OUT, 'world.json'), 'w'))
json.dump({'connectors': conn}, open(os.path.join(OUT, 'connectors_spec.json'), 'w'), indent=1)
if L06: print(f"06 offset {T6.round(3).tolist()}; 05 route ends s {s05_end:.2f}; 06 picture key s {keys[-1]['s']:.2f}; crest bank max {np.degrees(np.abs(bank).max()):.1f} deg")
if L05: print(f"05 offset {T5.round(3).tolist()}; Sock Rescue ends s {s_B_end:.2f}; 05 route from s {s05_0:.2f}")
print(f"04 tube end z {z_end4:.2f}; section offset {T.round(3).tolist()}; route {LEVEL:.2f} u (04 0-{s04_end:.2f}, AB {s04_end:.2f}-{LEVEL:.2f}); "
      f"picture keys s: 04 {keys[0]['s']:.2f}, Bubble Dash {s_bub:.2f}, Sock Rescue {s_sock:.2f}")
