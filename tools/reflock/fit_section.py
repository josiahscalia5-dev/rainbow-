"""Reference-Locked 3D Scene Builder - FIT step for the Bubble Dash -> Sock Rescue section (round 40).

Fits ONE physical world to the user's two approved pictures (references/candidates/*.webp, never modified):
  * Bubble Dash Chamber (941x1672): camera in the pink chamber, golden arch ahead, tunnel behind it.
  * Sock Rescue tunnel (941x1672): camera inside the tunnel (round-39 ring fit, tools/bonus/fit_sock.py, straight perspective).
World: y up, water surface y = 0, tunnel axis = the -z axis direction at x = 0. Scale: the Bubble Dash camera is 0.734 above the water
(the kit convention); the Sock Rescue picture is scaled so the painted Benny has the same real height in both pictures.
All measurements are image pixels read off gridded crops of the pictures (listed below), so every number can be re-checked.
  python3 -I tools/reflock/fit_section.py <outdir>   -> section.json (+ fit overlays for both pictures, bake masks)
"""
import sys, os, json, math
import numpy as np
from scipy.optimize import least_squares
from scipy.interpolate import PchipInterpolator
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
W, H = 941, 1672; FOV = 64.0; F = (H / 2) / math.tan(math.radians(FOV / 2)); CX, CY = W / 2, H / 2
BUB = 'references/candidates/bonus_bubble_dash_chamber.webp'; SOCK = 'references/candidates/bonus_sock_rescue_laundry_tunnel.webp'

def rot(yaw, pitch):
    """camera rotation (three.js Euler YXZ: yaw about +y = turn left, pitch about +x = look up); columns = camera axes in world"""
    cy, sy, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
    Ry = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]); Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); return Ry @ Rx
def proj(R, C, P):
    q = R.T @ (np.asarray(P, float) - C); return np.array([CX + F * q[0] / -q[2], CY - F * q[1] / -q[2]]), -q[2]
def ray(R, px, py):
    d = np.array([(px - CX) / F, -(py - CY) / F, -1.0]); d = R @ d; return d / np.linalg.norm(d)
def on_plane_y(R, C, px, py, y=0.0):
    d = ray(R, px, py); lam = (y - C[1]) / d[1]; return C + lam * d

# ======================= Bubble Dash picture (measured px) =======================
B = dict(vp=(585, 785), arch_c=(500, 797), arch_in=200, arch_out=262, water_at_arch=857,
         benny_water=(420, 1380), benny_top=(420, 1003),
         coins=[(567, 1010, 38), (531, 930, 30), (494, 868, 22), (531, 843, 15), (561, 830, 12), (583, 818, 9), (600, 810, 7), (612, 804, 6)],
         outlet_L=(110, 650, 88), outlet_R=(862, 655, 85), fall_L=(225, 885), fall_R=(740, 905),
         tower=(590, 285, 465, 712, 530),            # centre x, top y, left x, right x, bottom y
         bubbles=[(565, 245, 30), (490, 308, 17), (415, 390, 47), (497, 455, 15), (440, 505, 18), (676, 485, 18), (898, 400, 35), (742, 660, 25),
                  (88, 820, 37), (75, 1010, 30), (878, 900, 16), (885, 1075, 58), (90, 1540, 95), (210, 1595, 28), (795, 1600, 65)])
h = 0.734
# yaw / pitch from the vanishing point of the axis (the axis is parallel to the water)
def vp_res(p):
    R = rot(p[0], p[1]); q = R.T @ np.array([0, 0, -1.0]); return [CX + F * q[0] / -q[2] - B['vp'][0], CY - F * q[1] / -q[2] - B['vp'][1]]
yaw_b, pitch_b = least_squares(vp_res, [0.0, 0.0]).x; Rb = rot(yaw_b, pitch_b)
# camera x, axis height, arch distance from the arch centre + the water line under it
def arch_res(p):
    Xc, ya, za = p; C = np.array([Xc, h, 0.0]); c, _ = proj(Rb, C, [0, ya, -za]); w, _ = proj(Rb, C, [0, 0, -za])
    return [c[0] - B['arch_c'][0], c[1] - B['arch_c'][1], w[1] - B['water_at_arch']]
Xc, ya, za = least_squares(arch_res, [0.8, 0.6, 14.0]).x; Cb = np.array([Xc, h, 0.0])
_, dep = proj(Rb, Cb, [0, ya, -za]); R_IN = B['arch_in'] * dep / F; R_OUT = B['arch_out'] * dep / F
Pb = on_plane_y(Rb, Cb, *B['benny_water']); dtop = ray(Rb, *B['benny_top'])
lam = (Pb[2] - Cb[2]) / dtop[2]; HB = float((Cb + lam * dtop)[1])                 # painted Benny height (pom-pom top above the water)
print('bubble cam: yaw %.2f pitch %.2f deg, camera x %.3f; axis height %.3f, arch at z -%.2f, arch R in %.3f out %.3f; Benny at (%.3f, %.3f) height %.3f'
      % (math.degrees(yaw_b), math.degrees(pitch_b), Xc, ya, za, R_IN, R_OUT, Pb[0], Pb[2], HB))
# ======================= Sock Rescue picture: round-39 straight-perspective ring fit, rescaled =======================
SF = json.load(open(os.path.join(OUT, 'sockfit.json'))) if os.path.exists(os.path.join(OUT, 'sockfit.json')) else None
assert SF, 'run tools/bonus/fit_sock.py <outdir> first (writes sockfit.json)'
a = np.array(SF['A']); nup = np.array(SF['NUP']); rr = np.array(SF['RR']); A0 = np.array(SF['A0']); HWs = SF['HW']
yaw_s = math.atan2(a[0], -a[2]); pitch_s = math.asin(a[1])                       # the axis seen from the sock camera (camera frame)
# sock camera relative to the axis (sock units): right / above
off_r = float(-(A0 @ rr)); off_u = float(-(A0 @ nup))
# Benny in the sock picture (painted water point + pom-pom top), in the sock camera frame: water plane nup.P = nup.A0 - HW
S_BW, S_BT = (452, 1365), (452, 905)
def ray_s(px, py): d = np.array([(px - CX) / F, -(py - CY) / F, -1.0]); return d / np.linalg.norm(d)
pd = float(nup @ A0 - HWs); dw = ray_s(*S_BW); Pbs = dw * (pd / (dw @ nup)); dt_ = ray_s(*S_BT)
lam = (Pbs @ a) / (dt_ @ a); HBs = float((dt_ * lam) @ nup - pd)
k = HB / HBs
print('sock picture: yaw %.2f pitch %.2f (camera vs axis), camera %.3f right / %.3f above the axis, Benny height %.3f sock units -> scale %.3f'
      % (math.degrees(yaw_s), math.degrees(pitch_s), off_r, off_u, HBs, k))
RS = 1.0 * k; RS_RING = 0.95 * k; YAX_S = HWs * k                                  # sock tunnel radius, ring opening, axis height above water
FUNNEL = 6.0
Z_SC = za + FUNNEL + 1.0                                                           # the sock picture's camera: 1 u after the funnel ends
Cs = np.array([off_r * k, YAX_S + off_u * k, -Z_SC])
# camera rotation: the axis must appear at the measured direction a (camera frame) -> world forward of the axis = -z
def sock_rot_res(p):
    R = rot(p[0], p[1]); q = R.T @ np.array([0, 0, -1.0]); return list(q - a)
ys, ps = least_squares(sock_rot_res, [0.1, -0.1]).x; Rs = rot(ys, ps)
rings_s = [float(-(Z_SC + t * k)) for t in SF['rings_t_fit']]
# Benny's world point in the sock picture
qb = Pbs * k; Pbs_w = Cs + Rs @ qb                                                  # camera-frame point -> world (camera frame is scaled by k)
print('sock cam world (%.3f, %.3f, %.3f), Benny at (%.3f, %.3f, %.3f), rings z' % (*Cs, *Pbs_w), [round(r, 2) for r in rings_s])
# coins of the sock picture (painted centres -> water points), scaled into the world
coins_s = []
for x, y in SF['coins_px'][:6]:
    d = ray_s(x, y + 6); P = d * (pd / (d @ nup)) * k; coins_s.append((Cs + Rs @ P).tolist())
socks_s = []
for x, y in SF['socks_px']:
    d = ray_s(x, y); P = d * (pd / (d @ nup)) * k; socks_s.append((Cs + Rs @ P).tolist())
# ======================= route: the painted river (Benny -> coin trail -> arch -> funnel -> sock Benny -> sock coins -> exit) =======================
coins_b = []
for x, y, r in B['coins']:
    coins_b.append(on_plane_y(Rb, Cb, x, y + 0.75 * r).tolist())                   # the coin's bottom lies on the water
coins_room = [c for c in coins_b if c[2] > -za + 1.0]   # painted far coins (painting perspective) would land inside the tunnel: chamber coins only
pts = [(Pb[2] + 1.6, Pb[0]), (Pb[2], Pb[0])] + [(c[2], c[0]) for c in coins_room] + [(-za + 0.5, 0.15), (-za - 3.0, 0.1), (Pbs_w[2], Pbs_w[0])] \
      + [(c[2], c[0]) for c in coins_s[1:5]] + [(rings_s[-1] - 1.0, 0.0), (rings_s[-1] - 20.0, 0.0)]
pts = sorted(set((round(z, 3), x) for z, x in pts), key=lambda p: -p[0])           # increasing distance along -z
zs = np.array([-p[0] for p in pts]); xs = np.array([p[1] for p in pts])
keep = np.concatenate([[True], np.diff(zs) > 0.3]); zs, xs = zs[keep], xs[keep]
cl = PchipInterpolator(zs, xs); DS = 0.1; dgrid = np.arange(zs[0], zs[-1], DS); center = cl(dgrid)
# inside the tunnel the river line keeps Benny's whole lane range (+-0.3 u + his half width) clear of the walls
def chord_at(d):
    z = -d; f0, f1 = -za - 0.6, -za - FUNNEL
    if z >= f0: R, Y = R_IN, ya
    elif z >= f1: k_ = (f0 - z) / (f0 - f1); k_ = k_ * k_ * (3 - 2 * k_); R, Y = R_IN + (RS - R_IN) * k_, ya + (YAX_S - ya) * k_
    else: R, Y = RS, YAX_S
    return math.sqrt(max(0.01, R * R - Y * Y))
lim = np.array([chord_at(d) - 0.45 if d > za - 0.5 else 9.0 for d in dgrid]); center = np.clip(center, -lim, lim)
from scipy.ndimage import gaussian_filter1d; center = np.where(dgrid > za - 0.5, gaussian_filter1d(center, 6), center)
# ======================= chamber layout from the picture =======================
XL = R_OUT + 0.9; XR = R_OUT + 0.9; YC = 5.2                                       # side walls, ceiling height
def wall_hit(px, py, xwall):
    d = ray(Rb, px, py); lam = (xwall - Cb[0]) / d[0]; return Cb + lam * d
oL = wall_hit(B['outlet_L'][0], B['outlet_L'][1], -XL); oR = wall_hit(B['outlet_R'][0], B['outlet_R'][1], XR)
_, dL = proj(Rb, Cb, oL); _, dR = proj(Rb, Cb, oR)
fL = on_plane_y(Rb, Cb, *B['fall_L']); fR = on_plane_y(Rb, Cb, *B['fall_R'])
tz = -za - 2.6; tw = (B['tower'][3] - B['tower'][2]) / F * (za + 2.6) / 2; tx = (B['tower'][0] - CX) / F * (za + 2.6) + Cb[0]
ttop = h + (CY - B['tower'][1]) / F * (za + 2.6); tbot = h + (CY - B['tower'][4]) / F * (za + 2.6)
bub3d = []
for x, y, r in B['bubbles']:                                                       # depth guess from the radius (real bubbles ~0.06-0.3 u)
    rw = 0.05 + 0.25 * min(1, r / 95.0); dist = rw * F / r; d = ray(Rb, x, y); P = Cb + d * dist; P[1] = max(P[1], rw + 0.02); bub3d.append(P.tolist() + [rw])
sec = {'fov': FOV, 'img': [W, H], 'focal_px': F,
       'cams': {'bubble': {'pos': Cb.tolist(), 'yaw': yaw_b, 'pitch': pitch_b, 'ref': BUB}, 'sock': {'pos': Cs.tolist(), 'yaw': ys, 'pitch': ps, 'ref': SOCK}},
       'benny': {'bubble': Pb.tolist(), 'sock': Pbs_w.tolist(), 'height': HB},
       'tunnel': {'axis_y_arch': ya, 'axis_y_sock': YAX_S, 'z_arch': -za, 'r_arch_in': R_IN, 'r_arch_out': R_OUT, 'funnel': [-za - 0.6, -za - FUNNEL],
                  'r_sock': RS, 'ring_open_sock': RS_RING, 'rings_sock': rings_s,
                  # round 41: the washer tube CONTINUES past the painted rings (same rings / pods / towels / walls), so Benny never swims into an
                  # empty room: the level ends inside the tube (the game takes over there) and the bright light is far down the tube
                  'rings_extra': [rings_s[-1] - 6.5 * (i + 1) for i in range(6)], 'z_level_end': rings_s[-1] - 6.5,
                  'z_exit': rings_s[-1] - 6.5 * 6 - 3.0, 'z_end': rings_s[-1] - 6.5 * 6 - 3.0 - 9.0},
       'chamber': {'xl': -XL, 'xr': XR, 'yc': YC, 'z_near': 2.0, 'outlet_L': oL.tolist() + [B['outlet_L'][2] * dL / F], 'outlet_R': oR.tolist() + [B['outlet_R'][2] * dR / F],
                   'fall_L': fL.tolist(), 'fall_R': fR.tolist(), 'tower': [tx, tz, tw, tbot, ttop]},
       'route': {'z0': float(dgrid[0]), 'ds': DS, 'x': [round(float(v), 4) for v in center]},
       'coins': {'bubble': coins_b, 'sock': coins_s}, 'socks': socks_s, 'bubbles': bub3d,
       'sock_fit': {'towels': SF['towels'], 'pods': SF['pods'], 'scale': k, 'z_cam': -Z_SC, 'axis_y': YAX_S}}
json.dump(sec, open(os.path.join(OUT, 'section.json'), 'w'), indent=1)
# ---------------- overlays: fitted arch / rings / water line / Benny / coins drawn onto both pictures ----------------
def overlay(ref, R, C, path, extra):
    im = Image.open(os.path.join(REPO, ref)).convert('RGB'); d = ImageDraw.Draw(im)
    def circ(zc, yc, r, col, w=3):
        pts = []
        for i in range(0, 361, 4):
            th = math.radians(i); P = [r * math.cos(th), yc + r * math.sin(th), zc]
            p, z = proj(R, C, P)
            if z > 0.05: pts.append(tuple(p))
        if len(pts) > 1: d.line(pts, fill=col, width=w)
    extra(d, circ); im.save(path, quality=88)
def ex_b(d, circ):
    circ(-za, ya, R_IN, (255, 40, 40)); circ(-za, ya, R_OUT, (255, 200, 40))
    for z in rings_s: circ(z, YAX_S, RS_RING, (40, 255, 255), 2)
    for c in coins_b: p, _ = proj(Rb, Cb, c); d.ellipse([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5], outline=(0, 255, 0), width=3)
    p, _ = proj(Rb, Cb, Pb); d.ellipse([p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8], outline=(0, 255, 0), width=3)
    for z, x in zip(dgrid[::5], center[::5]):
        p, zz = proj(Rb, Cb, [x, 0, -z])
        if zz > 0.2: d.point(tuple(p), fill=(255, 255, 255))
overlay(BUB, Rb, Cb, os.path.join(OUT, 'fit_bubble_overlay.jpg'), ex_b)
def ex_s(d, circ):
    for z in rings_s: circ(z, YAX_S, RS_RING, (255, 40, 40))
    for c in coins_s: p, _ = proj(Rs, Cs, c); d.ellipse([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5], outline=(0, 255, 0), width=3)
    p, _ = proj(Rs, Cs, Pbs_w); d.ellipse([p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8], outline=(0, 255, 0), width=3)
overlay(SOCK, Rs, Cs, os.path.join(OUT, 'fit_sock_overlay.jpg'), ex_s)
# ---------------- bake masks (white = the game draws this itself: HUD, Benny, splash, coins, socks, loose bubbles, buttons) ----------------
m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
d.rectangle([0, 0, W, 214], fill=255); d.rounded_rectangle([34, 262, 424, 382], 40, fill=255)                       # HUD + title + badge
d.ellipse([268, 985, 580, 1235], fill=255); d.ellipse([215, 1120, 640, 1400], fill=255)                             # Benny
d.polygon([(95, 1290), (250, 1240), (620, 1240), (760, 1300), (740, 1470), (120, 1470)], fill=255)                 # his splash
for x, y, r in B['coins']: d.ellipse([x - r - 8, y - r - 8, x + r + 8, y + r + 12], fill=255)
for x, y, r in B['bubbles']: d.ellipse([x - r - 5, y - r - 5, x + r + 5, y + r + 5], fill=255)
m.save(os.path.join(OUT, 'mask_bubble.png'))
print('wrote', os.path.join(OUT, 'section.json'))
