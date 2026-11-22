"""Screen 06 'Crest the Rinse Arch' - FIT step of the screen kit (round 43). Measures the user's approved picture
references/06_crest_the_rinse_arch.png (read-only) and writes ONE physical world for it: <out>/layout.json (components for
tools/screenkit/blender_kit.py, the fitted picture camera, Benny, coins, route) + fit overlays.
  python3 -I tools/screenkit/screens/06/fit06.py <out dir> [--da2 <inverse depth .npy of the picture (optional guide)>]

Measured on the picture (864 x 1536 px; every number re-checkable on the gridded crops in qa/reflock/r43/06/measure/):
  * drum axis vanishing point (700, 605): where the RANSAC-fitted gold ring circles converge (centres (600,520) r 260, (652,586) r 167,
    (674,593) r 76); their centres drift toward the VP with shrinking radius -> camera offset from the drum axis (fitlib.ring_offsets).
  * Benny: water contact under his body (425, 1175), pompom top (418, 735); the camera is CAM_H above the water there.
  * the coin trail on the crest (analyze_reference.py coins, radii 46 -> 8.6 px): coins are equal in size, so each coin's painted
    radius gives its depth (depth = k / radius); k from the first coin, which floats on the water just ahead of Benny's lane.
  * the crest ribbon = a smooth curve through Benny's water point and the coin points (coin centre lowered to the water), rising up
    to the left (the arch), turning right over the crest and descending into the drum toward the vanishing point, then continuing on
    the drum floor (Screen 07 takes over there).
  * drum radius: the painted drum wall must enclose the crest with a margin and pass the paddles; see DRUM_R below.
Optional guide (adopted only as a guide, round 43 evaluation): Depth Anything V2's inverse depth of the picture, calibrated on the
floor water (exact depth from the water plane), is printed next to the coin depths as a cross-check; it never sets geometry.
"""
import sys, os, json, math, argparse
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); KIT = os.path.abspath(os.path.join(HERE, '..', '..')); REPO = os.path.abspath(os.path.join(KIT, '..', '..'))
sys.path.insert(0, KIT)
import fitlib as fl   # noqa: E402

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--da2'); a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
REF = 'references/06_crest_the_rinse_arch.png'; W, H = 864, 1536
M = dict(vp=(700.0, 605.0), rings=[(600.0, 520.0, 260.0), (652.0, 586.0, 167.0), (674.0, 593.0, 76.0)],
         benny_water=(425.0, 1175.0), benny_top=(418.0, 735.0),
         coins=[(267.5, 716.7, 46.0), (178.9, 623.6, 37.1), (234.3, 547.8, 26.5), (320.3, 520.7, 18.8), (407.7, 533.3, 14.0), (506.0, 585.2, 10.0),
                (557.3, 621.7, 9.0), (594.9, 643.4, 9.0), (619.2, 654.2, 8.6)],
         paddles=[(285.0, 240.0, 150.0), (155.0, 398.0, 165.0)],          # painted tray centre x, y and painted width (px)
         bubbles=[(70, 742, 34), (233, 380, 16), (262, 465, 18), (108, 478, 18), (88, 1452, 38), (695, 1352, 38), (205, 862, 26), (365, 645, 20), (434, 505, 15),
                  (790, 890, 14), (693, 1218, 24), (520, 566, 12), (10, 950, 30), (45, 1185, 16)])
cam = fl.Cam(W, H)
yaw, pitch = fl.yaw_pitch_from_vp(cam, M['vp'])
cam.set(yaw, pitch, [0.0, fl.CAM_H, 0.0])
# ---- Benny: his water point and painted height (pompom top above the water)
Pb = cam.on_plane_y(*M['benny_water']); dtop = cam.ray(*M['benny_top']); lam = (Pb[2] - cam.C[2]) / dtop[2]; HB = float((cam.C + lam * dtop)[1])
# ---- coins: equal real size -> depth from the painted radius. The first coin floats on the water (its lowest point on y = 0).
def coin_at(px, py, r, k):
    d = cam.depth_dir(px, py); return cam.C + d * (k / r)
COIN_D_PER_BENNY = 0.477        # coin diameter / Benny height in the proven Bubble Dash fit (section.json): same coins, same Benny
COIN_R = 0.5 * COIN_D_PER_BENNY * HB; k = COIN_R * cam.F     # camera-space depth of a coin = k / painted radius
coins = [coin_at(x, y, r, k) for x, y, r in M['coins']]
water_pts = [P - np.array([0, COIN_R, 0]) for P in coins]                                  # the river surface under each coin
# ---- optional Depth Anything V2 cross-check (guide only): calibrate on floor water pixels, print its depth at the coins
da2_check = None
if a.da2 and os.path.exists(a.da2):
    D = np.load(a.da2).astype(np.float64); ys = np.arange(1250, 1500, 25); xs = np.arange(120, 760, 40); A_, b_ = [], []
    for y in ys:
        for x in xs:
            P = cam.on_plane_y(x, y); z = float(-(cam.R.T @ (P - cam.C))[2]); A_.append([D[y, x], 1.0]); b_.append(1.0 / z)
    s_, t_ = np.linalg.lstsq(np.array(A_), np.array(b_), rcond=None)[0]
    da2_check = [{'coin': i, 'depth_from_size': round(float(k / r), 3), 'depth_da2': round(float(1.0 / max(1e-4, s_ * np.median(D[int(y) - 2:int(y) + 3, int(x) - 2:int(x) + 3]) + t_)), 3)}
                 for i, (x, y, r) in enumerate(M['coins'])]
# ---- drum: axis along -z (vanishing at the VP); camera offset from the axis from the drifting ring centres
oxR, oyR = fl.ring_offsets(cam, M['vp'], [r[:3] for r in M['rings']])
# camera-frame offsets -> world: the camera's right / up axes (the axis direction is -z in the world)
Rc = cam.R; right_w, up_w = Rc[:, 0], Rc[:, 1]
def axis_for(R):
    p = cam.C - (oxR * right_w + oyR * up_w) * R; return float(p[0]), float(p[1])
# drum radius: the smallest drum (axis from the painted ring drift) that holds the whole crest ribbon + Benny with a wall margin
WALL_MARGIN = 0.55
def need(R):
    xa_, ya_ = axis_for(R); return max(math.hypot(P[0] - xa_, P[1] - ya_) for P in water_pts + [Pb]) + 0.41 + WALL_MARGIN - R
DRUM_R = float(fl.least_squares(lambda r: [need(r[0])], [3.0], bounds=(1.0, 12.0)).x[0])
axis_pt = np.array([*axis_for(DRUM_R), 0.0])
ya, xa = float(axis_pt[1]), float(axis_pt[0])
chord = math.sqrt(max(0.01, DRUM_R ** 2 - ya ** 2))          # half width of the water pool on the drum floor (water plane y = 0)
z_ring = [-(cam.F * DRUM_R / r) for (_, _, r) in M['rings']]  # depth of each painted ring (camera on the axis approximation)
# ---- crest route: Benny -> the coin trail (rising arch to the left, crest, descent to the right) -> drum floor toward the VP -> exit
P0 = Pb.copy(); behind = Pb + np.array([0, 0, 1.2])
far = water_pts[-1]; tail = []
for i in range(1, 7):   # after the last coin: glide down onto the pool and run along the drum toward the far end
    kk = i / 6.0; tail.append(np.array([far[0] + (xa + 0.25 - far[0]) * kk, far[1] * (1 - kk) ** 2, far[2] - 1.8 * i]))
tail += [np.array([xa + 0.25, 0.0, far[2] - 10.8 - 2.0 * j]) for j in range(1, 7)]
ctrl = np.array([behind, P0] + water_pts + tail)
route, s = fl.resample(fl.smooth_polyline(ctrl, 2), 0.05)
route[:, 1] = np.maximum(route[:, 1], 0.0)            # never below the pool surface (the landing glides onto the water)
from scipy.ndimage import gaussian_filter1d as _g1
route[:, 1] = np.maximum(_g1(route[:, 1], 6), 0.0)
# bank: lean into the turn (lateral acceleration), max 40 deg, plus the arch's own slope sideways
tg = np.gradient(route, axis=0); tg /= np.linalg.norm(tg, axis=1, keepdims=True)
cur = np.gradient(tg, axis=0) / 0.05; lat = cur - tg * (cur * tg).sum(1, keepdims=True)
bank = np.clip(np.array([np.cross(tg[i], [0, 1.0, 0]) @ lat[i] for i in range(len(tg))]) * 0.18, -0.7, 0.7)
from scipy.ndimage import gaussian_filter1d
bank = gaussian_filter1d(bank, 12)
WIDTH = 0.82                     # ribbon width (u): Benny's lanes +-0.3 + his half width + painted margins (crest painted ~250 px at depth ~2.7)
lay = {'screen': '06', 'title': 'CREST THE RINSE ARCH', 'ref': REF, 'fov': cam.fov, 'img': [W, H], 'focal_px': cam.F,
       'cams': [cam.json(REF, {'name': 'ref06', 's_ref': float(np.argmin(np.linalg.norm(route - Pb, axis=1)) * 0.05)})],
       'benny': {'pos': Pb, 'height': HB, 'bsize': 1.03},   # bsize: the model's box matched to the SAM 2 silhouette of the painted Benny (iterated)
       'coin_radius': COIN_R, 'coins': coins,
       'route': {'ds': 0.05, 'points': route, 'bank': bank, 'width': WIDTH},
       'drum': {'axis_x': xa, 'axis_y': ya, 'r': DRUM_R, 'z0': 3.0, 'z1': float(route[-1][2] - 4.0), 'chord': chord, 'cam_off_R': [oxR, oyR]},
       'rings': {'z': z_ring, 'spacing': 3.2, 'band': 0.32},
       'paddles': [], 'bubbles': [], 'da2_check': da2_check}
# paddles: ray through the painted tray centre meets the drum wall
for x, y, wpx in M['paddles']:
    P = fl.ray_cylinder(cam.C, cam.ray(x, y), np.array([xa, ya, 0.0]), np.array([0, 0, -1.0]), DRUM_R)
    if P is not None:
        dep = float(-(cam.R.T @ (P - cam.C))[2]); lay['paddles'].append({'pos': P, 'width': wpx * dep / cam.F})
for x, y, r in M['bubbles']:
    rw = 0.03 + 0.12 * min(1, r / 40.0); dist = rw * cam.F / r; P = cam.C + cam.ray(x, y) * dist; lay['bubbles'].append(list(P) + [rw])
fl.dump(os.path.join(a.out, 'layout.json'), lay)
print('cam yaw %.2f pitch %.2f deg; Benny water (%.3f, %.3f), height %.3f; coin radius %.3f; drum R %.2f axis (%.3f, %.3f) chord %.2f; ring z %s'
      % (math.degrees(yaw), math.degrees(pitch), Pb[0], Pb[2], HB, COIN_R, DRUM_R, xa, ya, chord, [round(z, 2) for z in z_ring]))
print('coins (x, y, z):', [[round(float(v), 2) for v in c] for c in coins])
if da2_check: print('DA2 cross-check:', da2_check)
# ---- overlays: route, ribbon edges, coins, drum rings, paddles projected onto the picture
im = Image.open(os.path.join(REPO, REF)).convert('RGB'); d = ImageDraw.Draw(im)
def P2(P):
    p, z = cam.proj(P); return (tuple(p), z)
for i in range(0, len(route) - 1, 2):
    for off, col in ((0, (255, 255, 255)), (WIDTH / 2, (0, 255, 0)), (-WIDTH / 2, (0, 255, 0))):
        rgt = np.cross(tg[i], [0, 1.0, 0]); rgt /= np.linalg.norm(rgt); a1, z1 = P2(route[i] + rgt * off); a2, z2 = P2(route[i + 1] + rgt * off)
        if z1 > 0.1 and z2 > 0.1: d.line([a1, a2], fill=col, width=2)
for c in coins:
    (x, y), z = P2(c); rr = COIN_R * cam.F / z; d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=(255, 0, 0), width=3)
for zr in z_ring + [z_ring[-1] - 3.2 * i for i in range(1, 8)]:
    pts = []
    for t in range(0, 361, 6):
        P = np.array([xa + DRUM_R * math.cos(math.radians(t)), ya + DRUM_R * math.sin(math.radians(t)), zr]); (x, y), z = P2(P)
        if z > 0.1: pts.append((x, y))
    if len(pts) > 2: d.line(pts, fill=(0, 255, 255), width=2)
for pd in lay['paddles']:
    (x, y), z = P2(pd['pos']); d.ellipse([x - 10, y - 10, x + 10, y + 10], outline=(255, 255, 0), width=4)
(x, y), _ = P2(Pb); d.ellipse([x - 9, y - 9, x + 9, y + 9], outline=(255, 0, 255), width=4)
im.save(os.path.join(a.out, 'fit06_overlay.jpg'), quality=86)
# top + side views of the route and drum (sanity)
V = Image.new('RGB', (900, 500), 'white'); dv = ImageDraw.Draw(V)
def tv(P): return (450 + P[0] * 60, 40 - P[2] * 8)
def sv(P): return (40 - P[2] * 8 + 0 * 450, 460 - P[1] * 60)
for i in range(len(route) - 1):
    dv.line([tv(route[i]), tv(route[i + 1])], fill=(0, 0, 255), width=2); dv.line([sv(route[i]), sv(route[i + 1])], fill=(255, 0, 0), width=2)
for c in coins: x, y = tv(c); dv.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(0, 160, 0))
dv.line([tv([xa - DRUM_R, 0, 3]), tv([xa - DRUM_R, 0, -50])], fill=(150, 150, 150)); dv.line([tv([xa + DRUM_R, 0, 3]), tv([xa + DRUM_R, 0, -50])], fill=(150, 150, 150))
dv.line([sv([0, ya + DRUM_R, 3]), sv([0, ya + DRUM_R, -50])], fill=(150, 150, 150)); dv.line([sv([0, 0, 3]), sv([0, 0, -50])], fill=(0, 200, 255))
x, y = tv(cam.C); dv.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(255, 0, 255))
V.save(os.path.join(a.out, 'fit06_views.png'))
