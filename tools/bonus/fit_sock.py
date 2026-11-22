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
HW = 0.714; PD = float(nup.dot(A0) - HW)
# Benny's painted water point (bottom of his body) in the 05-painting pixel convention the kit uses (864 x 1536, centre 432, 768)
bx, by = 452, 1352; s05 = 1536 / H; bpx = [432 + (bx - CX) * s05, 768 + (by - CY) * s05]
ts = [float(t) for t in p[4:]]; sp = ts[-1] - ts[-2]
out = sys.argv[1] if len(sys.argv) > 1 else '.'
fit = {'A': a.tolist(), 'NUP': nup.tolist(), 'RR': rr.tolist(), 'A0': A0.tolist(), 'PN': nup.tolist(), 'PD': PD, 'HW': HW,
       'cam_fwd': [0, 0, -1], 'cam_up': [0, 1, 0], 'fov': 64.0, 'rings_t': ts + [ts[-1] + sp * (k + 1) for k in range(40)], 'Z2': 1000.0,
       'benny_start_px': bpx, 'img': [W, H], 'focal_px': F}
json.dump(fit, open(out + '/sockfit.json', 'w'), indent=1)
# overlay: fitted ring circles (red) + water line on the wall (cyan) over the picture
im = Image.open(REF).convert('RGB'); d = ImageDraw.Draw(im)
for t in fit['rings_t'][:8]:
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
