"""Screen 04 'Through the Five Arrows' - FIT step of the screen kit (round 44). Measures the user's approved picture
references/04_through_the_five_arrows.png (read-only) and writes ONE physical world for it: <out>/layout.json (components for
tools/screenkit/blender_kit.py, the fitted picture camera, Benny, coins, the five arrows, route) + a fit overlay.
  python3 -I tools/screenkit/screens/04/fit04.py <out dir> [--da2 <inverse depth .npy (optional guide, unused)>]

Measured on the picture (864 x 1536 px):
  * the warm-gold ring tunnel: ring circles RANSAC-fitted on gold edges (qa/world/r44/04/measure): centres drift toward the vanishing point as
    the radius shrinks -> vanishing point and camera offset from the tunnel axis by least squares (centre = VP + (-ox, +oy) * radius).
  * the water line at the mouth ring: the gold mouth ring (centre (437, 833), r 418) disappears under the water at y ~ 1000 on both sides ->
    the axis lies 167 / 418 = 0.40 tunnel radii above the water; with the camera 0.734 above the water (kit convention) this fixes the radius.
  * Benny: water contact under his body (395, 1388), pompom top (400, 965).
  * the five white arrows lying on the tunnel's water (centre of each chevron, painted width) and the five coins left of them (centre, radius).
  * the funnel: the pink / cyan swirl around the tunnel mouth, much wider than tall (left / right edges of the frame, but only up to y ~ 330 above
    the mouth) -> an elliptical bell mouth; the laundry-room wall above it (porthole, control panel, towel shelf) is a wall at the funnel rim.
"""
import sys, os, json, math, argparse
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, '..', '..')); REPO = os.path.abspath(os.path.join(KIT, '..', '..'))
sys.path.insert(0, KIT)
import fitlib as fl   # noqa: E402

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--da2')
ap.add_argument('--set', action='append', default=[], help='controlled test: key=json layout override (arrow_tilt=50 tilts the arrows)')
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
REF = 'references/04_through_the_five_arrows.png'; W, H = 864, 1536
M = dict(rings=[(437.1, 832.9, 418.4), (439.2, 789.6, 343.0), (434.6, 780.3, 329.3), (437.9, 794.5, 268.1), (438.7, 782.9, 209.9), (448.4, 776.3, 176.7),
                (468.0, 739.0, 100.0)],
         mouth=(437.1, 832.9, 418.4), mouth_waterline_y=1000.0,
         benny_water=(395.0, 1388.0), benny_top=(400.0, 965.0),
         arrows=[(450.0, 945.0, 210.0), (457.0, 865.0, 165.0), (464.0, 805.0, 115.0), (471.0, 764.0, 78.0), (479.0, 726.0, 45.0)],
         coins=[(175.0, 975.0, 55.0), (262.0, 872.0, 40.0), (330.0, 792.0, 28.0), (378.0, 742.0, 20.0), (424.0, 712.0, 13.0)],
         funnel_rim_y_top=330.0, porthole=(415.0, 250.0, 175.0),
         bubbles=[(65, 352, 45), (783, 386, 65), (233, 383, 18), (30, 425, 15), (322, 218, 25), (492, 228, 25), (585, 278, 15), (60, 557, 25),
                  (835, 607, 28), (777, 520, 20), (82, 910, 18), (793, 982, 22), (829, 1098, 20), (770, 1255, 65), (720, 1475, 42), (662, 1305, 22)])
cam = fl.Cam(W, H)
# ---- vanishing point + camera offset from the axis: least squares over the ring circles (cx = vx - ox * r, cy = vy + oy * r)
A_, b_ = [], []
for cx, cy, r in M['rings']:
    A_.append([1, 0, -r, 0]); b_.append(cx); A_.append([0, 1, 0, r]); b_.append(cy)
vx, vy, ox, oy = np.linalg.lstsq(np.array(A_), np.array(b_), rcond=None)[0]
VP = (float(vx), float(vy))
yaw, pitch = fl.yaw_pitch_from_vp(cam, VP)
cam.set(yaw, pitch, [0.0, fl.CAM_H, 0.0])
# ---- tunnel radius: axis above the water by k_w radii (mouth ring water line); camera above the axis by oy radii
k_w = (M['mouth_waterline_y'] - M['mouth'][1]) / M['mouth'][2]
R = fl.CAM_H / (k_w + oy); ya_rel = k_w * R                    # axis height above the water
# axis line in the world: through the point (camera - right * ox R - up * oy R), direction -z (horizontal tunnel, VP fixes the camera)
axis_pt = np.array([cam.C[0] - ox * R, cam.C[1] - oy * R, 0.0]); xa, ya = float(axis_pt[0]), float(axis_pt[1])
assert abs(ya - ya_rel) < 1e-6
# depth of each painted ring (camera on the axis approximation, as the kit does for 06): d = F R / r_px
z_rings = sorted({round(-(cam.F * R / r), 3) for (_, _, r) in M['rings']}, reverse=True)
z_mouth = z_rings[0]
chord = math.sqrt(max(0.01, R * R - ya * ya))
# ---- Benny: his water point and painted height
Pb = cam.on_plane_y(*M['benny_water']); dtop = cam.ray(*M['benny_top']); lam = (Pb[2] - cam.C[2]) / dtop[2]; HB = float((cam.C + lam * dtop)[1])
# ---- the five arrows: game-drawn 3D chevrons lying ON the water (masked out of the bake, like the coins). The painted perspective is
# compressed (the farthest arrow sits on the ring vanishing point = the horizon of a level water plane, i.e. infinitely far), so the arrows are
# placed as equal real objects: width = the nearest arrow's (its centre is reliable on the water plane), depth of each from its painted width
P1 = cam.on_plane_y(*M['arrows'][0][:2]); d1 = float(-(cam.R.T @ (P1 - cam.C))[2]); ARROW_W = M['arrows'][0][2] * d1 / cam.F
arrows = []
for x, y, wpx in M['arrows']:
    dep = cam.F * ARROW_W / wpx; P = cam.C + cam.depth_dir(x, y) * dep; P[1] = 0.0          # on the water, at the painted depth
    arrows.append({'pos': P, 'width': ARROW_W, 'tilt': 55.0})   # tilted up 55 deg (apex raised, near edge on the water): reads like the painted chevrons from Benny's low camera
# ---- coins: equal real size -> depth from the painted radius (as fit06); they float on the water left of the arrows
COIN_D_PER_BENNY = 0.477; COIN_R = 0.5 * COIN_D_PER_BENNY * HB; kc = COIN_R * cam.F
coins = [cam.C + cam.depth_dir(x, y) * (kc / r) for x, y, r in M['coins']]
# ---- route: Benny -> the arrows' centre line -> straight down the tunnel to its far end (the next area takes over there)
ax_line = np.mean([p['pos'][0] for p in arrows[:3]])          # the arrows lie on the channel centre
far = z_mouth - 30.0
ctrl = [Pb + np.array([0, 0, 1.2]), Pb, np.array([0.5 * (Pb[0] + ax_line), 0.0, 0.5 * (Pb[2] + arrows[0]['pos'][2])])]
ctrl += [np.array([ax_line, 0.0, p['pos'][2]]) for p in arrows]
ctrl += [np.array([ax_line, 0.0, z]) for z in np.arange(arrows[-1]['pos'][2] - 2.0, far, -2.0)]
route, s = fl.catmull_rom(np.array(ctrl), 0.05)
route[:, 1] = 0.0
bank = np.zeros(len(route))
# ---- funnel (elliptical bell mouth around the tunnel mouth) and the wall at its rim
dep_rim = -z_mouth - 0.8                                       # the funnel rim lies 0.8 u in front of the mouth
y_top = cam.C[1] + (H / 2 - M['funnel_rim_y_top']) * dep_rim / cam.F + math.tan(-pitch) * 0.0
b_rim = max(R * 1.12, y_top - ya)                              # vertical semi-axis: the painted top of the swirl
a_rim = 3.2                                                    # horizontal semi-axis: beyond both frame edges at that depth
funnel = {'axis_x': xa, 'axis_y': ya, 'z_in': z_mouth, 'r_in': R * 1.06, 'z_out': z_mouth + 0.8, 'a_out': a_rim, 'b_out': b_rim}
wall = {'z': z_mouth + 0.8, 'x0': xa - 6.0, 'x1': xa + 6.0, 'y0': -0.3, 'y1': ya + 4.6, 'hole': [xa, ya, a_rim, b_rim]}
pool_front = {'x0': xa - a_rim - 0.5, 'x1': xa + a_rim + 0.5, 'z0': cam.C[2] + 1.5, 'z1': z_mouth, 'y': -0.02}
lay = {'screen': '04', 'title': 'THROUGH THE FIVE ARROWS', 'ref': REF, 'fov': cam.fov, 'img': [W, H], 'focal_px': cam.F,
       'cams': [cam.json(REF, {'name': 'ref04', 's_ref': float(np.argmin(np.linalg.norm(route - Pb, axis=1)) * 0.05)})],
       'benny': {'pos': Pb, 'height': HB, 'bsize': 1.19, 'lift': 0.03, 'ahead': 0.15},   # same physical rule as the r43b 06 Benny (12 % immersed)
       'coin_radius': COIN_R, 'coins': coins,
       'route': {'ds': 0.05, 'points': route, 'bank': bank, 'width': 2 * chord * 0.92},
       'drum': {'axis_x': xa, 'axis_y': ya, 'r': R, 'z0': z_mouth, 'z_far': z_mouth - 10.0, 'z1': far - 2.0, 'seg': 1.5, 'seg_far': 6.0, 'chord': chord,
                'cam_off_R': [float(ox), float(oy)], 'pool_y': -0.02},
       'rings': {'z': z_rings, 'spacing': 0.95, 'band': 0.22},
       'funnel': funnel, 'wall': wall, 'pool_front': pool_front, 'arrows': arrows, 'mouth_ring': {'z': z_mouth + 0.02, 'r': R * 1.07, 'band': 0.34},
       'paddles': [], 'bubbles': [], 'no_route_ribbon': True, 'slot_tile': [1.6, 0.95],
       # r44 controlled tests at the picture camera (qa/world/r44/04/): no foam along the tube's water edges 84.5 -> 86.2 %, finer bakes -> 87.3 %
       'foam_pool': False, 'bake_res': {'pool_front': [2048, 2048], 'funnel': [4096, 1024], 'wall': [4096, 1024]}, 'tunnel_style': 'gold',
       'palette': {'wallA': '#a3501f', 'wallB': '#ffc46a', 'wallM': '#e48a35', 'slot': '#6a2a12'},   # warm-gold tunnel (measured: gold 17 % of the picture)
       'splash_scale': 0.6, 'lod_bias': -0.8, 'bake_dens': [1, 4], 'number': '04', 'next': 'A', 'coins_start': 1330}
for kv in a.set:                                               # one factor at a time: the default stays the measured layout above
    k, v = kv.split('=', 1); v = json.loads(v)
    if k == 'arrow_tilt':
        for ar in lay['arrows']: ar['tilt'] = v
    else: lay[k] = v
fl.dump(os.path.join(a.out, 'layout.json'), lay)
# ---- overlay: everything projected back into the picture
im = Image.open(os.path.join(REPO, REF)).convert('RGB'); d = ImageDraw.Draw(im)
def P2(P): return tuple(cam.proj(P)[0])
for z in z_rings:
    pts = [P2([xa + R * math.cos(t), ya + R * math.sin(t), z]) for t in np.linspace(0, 2 * math.pi, 73)]; d.line(pts, fill=(0, 255, 0), width=2)
pts = [P2([xa + a_rim * math.cos(t), ya + b_rim * math.sin(t), z_mouth + 0.8]) for t in np.linspace(0, 2 * math.pi, 97)]; d.line(pts, fill=(255, 0, 255), width=2)
d.line([P2(p) for p in route[::10]], fill=(255, 255, 0), width=3)
for ar in arrows: x, y = P2(ar['pos']); d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(0, 255, 255), width=2)
for c in coins: x, y = P2(c); d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 128, 0), width=3)
x, y = P2(Pb); d.ellipse([x - 8, y - 8, x + 8, y + 8], outline=(255, 0, 0), width=3); x, y = VP; d.line([x - 15, y, x + 15, y], fill=(255, 0, 0), width=3); d.line([x, y - 15, x, y + 15], fill=(255, 0, 0), width=3)
im.save(os.path.join(a.out, 'fit_overlay.jpg'), quality=88)
print(f"VP ({VP[0]:.1f}, {VP[1]:.1f}); cam yaw {math.degrees(yaw):.2f} pitch {math.degrees(pitch):.2f} deg; tunnel R {R:.3f} axis ({xa:.3f}, {ya:.3f}) "
      f"cam off/R ({ox:.3f}, {oy:.3f}); mouth z {z_mouth:.2f}; Benny water ({Pb[0]:.3f}, {Pb[2]:.3f}) height {HB:.3f}; chord {chord:.3f}")
print('arrows (x, z, width):', [(round(p['pos'][0], 2), round(p['pos'][2], 2), round(p['width'], 3)) for p in arrows])
print('coins (x, y, z):', [[round(v, 2) for v in c] for c in coins]); print('funnel rim a, b:', round(a_rim, 2), round(b_rim, 2), 'route length', round(float(s[-1]), 2))
