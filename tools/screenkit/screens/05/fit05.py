"""Screen 05 'Flow Into the Current' - FIT step of the screen kit (round 44, for the one connected world). Measures the user's approved picture
references/05_flow_into_the_current.png (read-only) and writes ONE physical world for it (<out>/layout.json + fit overlay).
  python3 -I tools/screenkit/screens/05/fit05.py <out dir> [--set key=json] [--tube-len L] [--open-end]
Measured on the picture (864 x 1536 px, gridded crops qa/world/r44/05/measure):
  * the bright tunnel core (vanishing point) at (500, 474); the big gold ring (top (440, 205), sides at the frame edges): circle (437, 560) r 420
    -> camera offset from the tube axis = ((500-437)/420, (560-474)/420) radii (right, up); the inner rings agree within the painting's slack.
  * the water line at that ring: the foam banks meet the wall at y ~ 700 on both sides -> the axis is (700-560)/420 radii above the water;
    with the camera 0.734 above the water this fixes the tube radius.
  * Benny: water contact (430, 1185), pompom top (430, 770). Coins (centre, radius): the painted S-trail. Copper trays (centre, width).
  * the river fills the tube floor (pink edges + cyan core, S-curves through the coins): the floor water is the tube's own pool; Benny's
    route = a smooth curve THROUGH his water point and every coin's water point (coins stay collectable), then straight on down the tube.
"""
import sys, os, json, math, argparse
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, '..', '..')); REPO = os.path.abspath(os.path.join(KIT, '..', '..'))
sys.path.insert(0, KIT)
import fitlib as fl   # noqa: E402

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--da2'); ap.add_argument('--set', action='append', default=[])
ap.add_argument('--tube-len', type=float, default=40.0); ap.add_argument('--open-end', action='store_true')
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
REF = 'references/05_flow_into_the_current.png'; W, H = 864, 1536
M = dict(vp=(500.0, 474.0), ring=(437.0, 560.0, 420.0), waterline_y=700.0,
         benny_water=(430.0, 1185.0), benny_top=(430.0, 770.0),
         coins=[(474.0, 728.0, 47.0), (548.0, 660.0, 30.0), (482.0, 612.0, 27.0), (431.0, 575.0, 20.0), (466.0, 546.0, 13.0), (495.0, 533.0, 10.0),
                (519.0, 523.0, 8.0), (535.0, 510.0, 6.0)],
         paddles=[(140.0, 365.0, 150.0), (290.0, 445.0, 90.0), (655.0, 425.0, 75.0), (790.0, 470.0, 145.0)])
cam = fl.Cam(W, H)
yaw, pitch = fl.yaw_pitch_from_vp(cam, M['vp']); cam.set(yaw, pitch, [0.0, fl.CAM_H, 0.0])
cx, cy, r = M['ring']; ox = (M['vp'][0] - cx) / r; oy = (cy - M['vp'][1]) / r          # camera right of / above the axis, in radii
k_w = (M['waterline_y'] - cy) / r; R = fl.CAM_H / (k_w + oy)
xa, ya = float(cam.C[0] - ox * R), float(cam.C[1] - oy * R); chord = math.sqrt(max(0.01, R * R - ya * ya))
z_ring0 = -(cam.F * R / r)
Pb = cam.on_plane_y(*M['benny_water']); dtop = cam.ray(*M['benny_top']); lam = (Pb[2] - cam.C[2]) / dtop[2]; HB = float((cam.C + lam * dtop)[1])
COIN_R = 0.5 * 0.477 * HB; kc = COIN_R * cam.F
deps = [kc / rr for _, _, rr in M['coins']]
for i in range(1, len(deps)):
    if M['coins'][i][2] < 12: deps[i] = max(deps[i], deps[i - 1] + 1.2)
coins = [cam.C + cam.depth_dir(x, y) * dz for (x, y, _), dz in zip(M['coins'], deps)]
water_pts = [P - np.array([0, COIN_R, 0]) for P in coins]
for w in water_pts: w[1] = 0.0
far = water_pts[-1][2] - a.tube_len
ctrl = [Pb + np.array([0, 0, 1.2]), Pb] + water_pts + [np.array([water_pts[-1][0] * (1 - k) + xa * k, 0.0, water_pts[-1][2] - 3.0 * (j + 1)]) for j, k in enumerate([0.3, 0.6, 0.85, 1.0])]
# r45: the painted S-river keeps winding along the whole tube (the approved picture's S: about +-0.3 drum radii, one swing every ~3 rings),
# easing in from the coin trail and straightening for the last 6 u (the world joins 05 -> 06 on the axis)
WA, WL = 0.3 * R, 3.0 * 2.6; z_w0 = ctrl[-1][2]
for z in np.arange(z_w0 - 1.5, far, -1.5):
    k_in = min(1.0, (z_w0 - z) / 4.0); k_out = min(1.0, max(0.0, (z - far) / 6.0)); ctrl.append(np.array([xa + WA * k_in * k_out * math.sin(2 * math.pi * (z_w0 - z) / WL), 0.0, z]))
route, s = fl.catmull_rom(np.array(ctrl), 0.05)
route[:, 1] = 0.0
paddles = []
for x, y, wpx in M['paddles']:
    P = fl.ray_cylinder(cam.C, cam.ray(x, y), np.array([xa, ya, 0.0]), np.array([0, 0, -1.0]), R)
    if P is not None:
        dep = float(-(cam.R.T @ (P - cam.C))[2]); paddles.append({'pos': P, 'width': wpx * dep / cam.F})
lay = {'screen': '05', 'title': 'FLOW INTO THE CURRENT', 'ref': REF, 'fov': cam.fov, 'img': [W, H], 'focal_px': cam.F,
       'cams': [cam.json(REF, {'name': 'ref05', 's_ref': float(np.argmin(np.linalg.norm(route - Pb, axis=1)) * 0.05)})],
       'benny': {'pos': Pb, 'height': HB, 'bsize': 1.19, 'lift': 0.03, 'ahead': 0.15},
       'coin_radius': COIN_R, 'coins': coins,
       'route': {'ds': 0.05, 'points': route, 'bank': np.zeros(len(route)), 'width': 2 * chord * 0.9},
       'drum': {'axis_x': xa, 'axis_y': ya, 'r': R, 'z0': 3.0, 'z_far': z_ring0 - 14.0, 'z1': far if a.open_end else far - 2.0, 'open_end': bool(a.open_end),
                'seg': 2.0, 'seg_far': 8.0, 'chord': chord, 'cam_off_R': [ox, oy], 'pool_y': -0.02},
       'rings': {'z': [z_ring0], 'spacing': 2.6, 'band': 0.32},
       # r44: the painted S-river as its own water ribbon along Benny's route (one-factor test: start view unchanged 83.5 %, pink river edge in motion)
       'paddles': paddles, 'bubbles': [], 'no_route_ribbon': False, 'route_flume': False, 'foam_pool': True,
       'bake_res': {'pool': [1024, 2048]}, 'splash_scale': 0.6, 'lod_bias': -0.8, 'bake_dens': [1, 4], 'number': '05', 'next': '06', 'coins_start': 1420,
       # r45: the painted foam (domes where the picture paints foam) near the picture view; the RB_FoamBank clusters start two rings further,
       # the painted trays repeat every 2 ring spacings along the whole tube (RB_MachineryRow)
       'foam_from_picture': False, 'foam_pool_from': z_ring0 - 5 * 2.6, 'machinery': {'every': 2},   # r45: 3D foam only beyond the painted stretch (it covered the painted pink edges)
       'foam_style': {'spacing': 0.7, 'size': 1.45, 'height': 0.78, 'spread': 1.2},   # r45: the painted banks are thick, fluffy and continuous
       # r45 (user: "the pink and blue and purplish water"): the painted FLOOR across the whole drum (every band) from the stretch ahead of Benny,
       # world-anchored and flowing, on the river and the pool along the whole level (bake.js floor swatch)
       'templates': {'floor': {'from': 2.2, 'len': 3.0}}}
# r45: the repeated trays stay out of the camera's band (camera height +- 0.5 u: Benny's outer lanes brought the chase camera within 4 cm)
lay['machinery'] = {'every': 2, 'clear_y': [float(cam.C[1]), 0.5], 'scale': 0.8, 'z_from': float(z_ring0 - 5 * 2.6)}   # beyond the painted stretch
# r45: the approved composition while swimming: the camera keeps the picture's view down the drum and slides with Benny (world cam_axis);
# the water is the clean ribbon water drawn from the painting's structure (tools/screenkit/water_ribbon.js)
lay['cam_axis'] = {'follow': 0.6}; lay['water_style'] = 'ribbon'
# r45 (look while swimming, measured against the picture): the bright warm core at the end of the tunnel (camera-relative glow), foam banks that
# frame the S-river like the painted ones (just outside its pink edges), and the painted bubbles along both banks
lay['far_glow'] = {'start': 7.0, 'end': 26.0, 'strength': 0.8, 'color': [1.0, 0.92, 0.72]}
lay['foam_banks'] = [{'side': s_, 'off': 0.5, 'spacing': 0.15, 'size': 0.075, 's0': lay['cams'][0]['s_ref'] + 14.0, 'seed': 21 + s_} for s_ in (-1, 1)]   # beyond the painted stretch, clear of the lanes
lay['lod_bias'] = -1.4   # r45: the painted detail stays crisp at grazing angles (the top-of-frame walls / rings carried 2/3 of the mismatch)
lay['bubbles_banks'] = {'from': 14.0, 'every': 0.55, 'lat': [0.55, 1.15], 'r': [0.025, 0.075], 'h': 0.4}; lay['bubbles_from'] = 14.0   # beyond the painted stretch
# the painted S-river (pink edges + cyan core) at the coin trail: 310 px wide at y 650 -> its real width at that depth (river ribbon option)
Pr = cam.on_plane_y(485.0, 650.0); RIVER_W = 310.0 * float(-(cam.R.T @ (Pr - cam.C))[2]) / cam.F; lay['river_width'] = RIVER_W; lay['route']['width'] = RIVER_W
for kv in a.set:
    k, v = kv.split('=', 1); v = json.loads(v)
    if k == 'river_ribbon' and v:                                # one-factor test: the S-river as its own water ribbon along Benny's route
        lay['no_route_ribbon'] = False; lay['route_flume'] = False; lay['route']['width'] = RIVER_W
    else: lay[k] = v
fl.dump(os.path.join(a.out, 'layout.json'), lay)
im = Image.open(os.path.join(REPO, REF)).convert('RGB'); d = ImageDraw.Draw(im)
P2 = lambda P: tuple(cam.proj(P)[0])
for z in [z_ring0, z_ring0 - 2.6, z_ring0 - 5.2, z_ring0 - 10.4]:
    d.line([P2([xa + R * math.cos(t), ya + R * math.sin(t), z]) for t in np.linspace(0, 2 * math.pi, 73)], fill=(0, 255, 0), width=2)
d.line([P2(p) for p in route[::8]], fill=(255, 255, 0), width=3)
for c in coins: x, y = P2(c); d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 128, 0), width=3)
for p in paddles: x, y = P2(p['pos']); d.ellipse([x - 8, y - 8, x + 8, y + 8], outline=(0, 255, 255), width=3)
im.save(os.path.join(a.out, 'fit_overlay.jpg'), quality=88)
print(f"cam yaw {math.degrees(yaw):.2f} pitch {math.degrees(pitch):.2f}; tube R {R:.3f} axis ({xa:.3f}, {ya:.3f}) off/R ({ox:.3f}, {oy:.3f}); ring z {z_ring0:.2f}; "
      f"Benny water ({Pb[0]:.3f}, {Pb[2]:.3f}) h {HB:.3f}; chord {chord:.3f}; route {float(s[-1]):.1f} u; paddles {len(paddles)}")
