"""Round 39 (Sock Rescue fix 1): fit the 3D tunnel + camera to the candidate picture
references/candidates/bonus_sock_rescue_laundry_tunnel.webp (941 x 1672).
Measured by eye on zoomed, gridded crops (image px): gold ring openings (centre x, centre y, radius) from near to far, and Benny's water
point. Fitted: camera yaw / pitch, camera offset from the tunnel axis, axial ring positions (straight tunnel, radius 1, rings at 0.95).
Writes <out>/sockfit.json (world = camera frame at the start: camera at the origin looking down -z, +y up) + an overlay picture.
  python3 -I tools/bonus/fit_sock.py <outdir>"""
import sys, json, math, numpy as np
from scipy.optimize import least_squares
from PIL import Image, ImageDraw
REF = 'references/candidates/bonus_sock_rescue_laundry_tunnel.webp'
W, H = 941, 1672; F = (H / 2) / math.tan(math.radians(32)); CX, CY = W / 2, H / 2
RINGS = [(527, 667, 377), (565, 627, 200), (630, 625, 115), (663, 626, 66), (668, 630, 48)]   # ring openings, near -> far
RW = 0.95
def frame(p):
    yaw, pitch = p[0], p[1]
    a = np.array([math.sin(yaw) * math.cos(pitch), math.sin(pitch), -math.cos(yaw) * math.cos(pitch)])   # axis direction (camera coords)
    up = np.array([0.0, 1.0, 0.0]); nup = up - up.dot(a) * a; nup /= np.linalg.norm(nup); rr = np.cross(a, nup)
    return a, nup, rr
def proj(P): return np.array([CX + F * P[0] / -P[2], CY - F * P[1] / -P[2]])
def res(p):
    a, nup, rr = frame(p); A0 = -(p[2] * rr + p[3] * nup); out = []
    for (x, y, r), t in zip(RINGS, p[4:]):
        C = A0 + a * t; c = proj(C); out += [(c[0] - x) / 20, (c[1] - y) / 20, (F * RW / -C[2] - r) / max(8, 0.06 * r)]
    return out
p0 = [math.radians(-6), math.radians(6), 0.4, 0.05, 3.3, 6, 10, 17, 24]
sol = least_squares(res, p0); p = sol.x; a, nup, rr = frame(p); A0 = -(p[2] * rr + p[3] * nup)
print('yaw %.2f deg  pitch %.2f deg  camera right of axis %.3f  above axis %.3f' % (math.degrees(p[0]), math.degrees(p[1]), p[2], p[3]))
print('ring axial positions', [round(t, 3) for t in p[4:]], ' rms residual (scaled)', round(float(np.sqrt(np.mean(np.square(sol.fun)))), 3))
for (x, y, r), t in zip(RINGS, p[4:]):
    C = A0 + a * t; c = proj(C); print('  ring measured (%d,%d) r%d -> fitted (%.0f,%.0f) r%.0f' % (x, y, r, c[0], c[1], F * RW / -C[2]))
HW = 0.64; PD = float(nup.dot(A0) - HW)   # water / foam meet the big gold ring ~0.61 below its centre in the picture
# Benny's painted water point (bottom of his body) in the 05-painting pixel convention the kit uses (864 x 1536, centre 432, 768)
bx, by = 452, 1352; s05 = 1536 / H; bpx = [432 + (bx - CX) * s05, 768 + (by - CY) * s05]
ts = [float(t) for t in p[4:]]; sp = ts[-1] - ts[-2]
out = sys.argv[1] if len(sys.argv) > 1 else '.'
fit = {'A': a.tolist(), 'NUP': nup.tolist(), 'RR': rr.tolist(), 'A0': A0.tolist(), 'PN': nup.tolist(), 'PD': PD, 'HW': HW,
       'cam_fwd': [0, 0, -1], 'cam_up': [0, 1, 0], 'fov': 64.0, 'rings_t_fit': ts,
       # evenly spaced rings (natural motion) + the kit's depth curve (identity up to Z2, exponential beyond) reproduce the painted spacing
       'ring1_t': ts[0], 'S': 2.4, 'Z2': 4.0,
       'benny_start_px': bpx, 'img': [W, H], 'focal_px': F,
       'coins_px': [[455, 845], [508, 768], [545, 728], [572, 700], [595, 682], [612, 672], [627, 664], [640, 658]],   # painted coin trail (centres)
       'socks_px': [[432, 766], [645, 874]],                                                                          # painted socks (water line)
       'towels': [[2.7, -1, 0.62, 0.02, 0.32], [3.0, 1, 0.52, 0.02, 0.36]],   # t, side, rail height, inward from / to (estimated from the picture)
       'pods': [[4.2, 2.04], [3.7, 1.17]]}                                    # t, angle round the tunnel (estimated from the picture)
# river centre line (axis-relative lateral per axial t) through Benny's painted start and the painted coin trail, then the Screen-05 S-bends
K05 = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else None
def ray(px, py, h):
    fx = H / 2 / math.tan(math.radians(32)) * (1536 / H) * 0 + 768 / math.tan(math.radians(32))   # kit convention: 05-painting pixels
    d = np.array([(px - 432) / fx, -(py - 768) / fx, -1.0]); d /= np.linalg.norm(d); return d * ((PD + h) / d.dot(nup))
to05 = lambda x, y: (432 + (x - CX) * (1536 / H), 768 + (y - CY) * (1536 / H))
B0 = ray(*bpx, 0.0); tB0 = float(B0.dot(a)); latB0 = float((B0 - A0).dot(rr)); coinD = 0.15038523388874458 * np.linalg.norm(B0) / 1.186
pts = [(0.0, latB0), (tB0, latB0)]
for x, y in fit['coins_px'][:4]:
    P = ray(*to05(x, y), coinD * 0.75); pts.append((float(P.dot(a)), float(np.clip((P - A0).dot(rr), -0.45, 0.45))))
if K05:
    c05 = np.array(K05['river_center_axis']['c']); T1 = pts[-1][0] + 3.0
    ts = np.arange(0, 95, 0.05); xs = [p_[0] for p_ in pts] + [T1, T1 + 0.5]; ys = [p_[1] for p_ in pts] + [float(c05[0]), float(c05[10])]
    from scipy.interpolate import PchipInterpolator
    near = PchipInterpolator(xs, ys)(np.minimum(ts, T1)); far = np.interp(ts - T1, np.arange(len(c05)) * 0.05, c05)
    c = np.where(ts <= T1, near, far)
    fit['river_center_axis'] = {'t0': 0.0, 'dt': 0.05, 'c': [round(float(v), 4) for v in c]}
    cs_ = np.interp(tB0 + np.arange(0, 95 - tB0, 0.05), ts, c)
    fit['river_center'] = {'ds': 0.05, 'c': [round(float(v), 4) for v in cs_], 'ref': 'axis'}
    print('Benny start t %.3f lat %.3f; coin trail (t, lat):' % (tB0, latB0), [(round(t_, 2), round(l_, 2)) for t_, l_ in pts[2:]])
json.dump(fit, open(out + '/sockfit.json', 'w'), indent=1)
# overlay: fitted ring circles (red) + water line on the wall (cyan) over the picture
im = Image.open(REF).convert('RGB'); d = ImageDraw.Draw(im)
for t in ts:
    pts = []
    for k in range(0, 361, 4):
        th = math.radians(k); P = A0 + a * t + rr * RW * math.cos(th) + nup * RW * math.sin(th)
        if -P[2] > 0.05: pts.append(tuple(proj(P)))
    d.line(pts, fill=(255, 40, 40), width=3)
for side in (-1, 1):
    pts = []
    for t in np.linspace(0.6, 40, 200):
        x = side * math.sqrt(1 - HW * HW); P = A0 + a * t + rr * x - nup * HW
        if -P[2] > 0.05: pts.append(tuple(proj(P)))
    d.line(pts, fill=(40, 255, 255), width=3)
im.save(out + '/sockfit_overlay.jpg', quality=88); print('wrote', out + '/sockfit.json')
