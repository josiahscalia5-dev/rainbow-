"""Screen 08 r13 (`&m08urcup=1`): the upper-right spout cup as one seamless painted cup while swimming.

In the approved view the gold arch's inner edge runs diagonally across the upper-right cup: its right part and its top
were never painted. The kept m08cup fills a hidden point from its mirror point (vertical plane through the cup axis and
the projector), but the top near the axis is hidden on BOTH sides -> plain gold patch with X-shaped seams (the arch edge
and its mirror image). The fitted proxy was also an UPRIGHT half-dome narrower than the painted cup, while the painted
cup is a twin of the upper-left one drawn TILTED (leaning ~10 deg toward the chamber centre, its underside dish seen
strongly from below: dish ellipse centre ~(741, 437), half-width ~72 px, rising to the right): mirroring the tilted band
about an upright axis drew the X, and painted cup pixels lay on the door wall and slid off the cup.

1. Refit (proxy only; the approved view still shows the same plate pixels): a tilted cup (rim centre, dome height, band
   height, roll, pitch; radius = the upper-left twin's) least-squares fitted to the painted dish outline, cap / band line
   and cap outline (rms ~2.6 px).
2. Unrolled cup texture in cup coordinates (u = azimuth, 0.5 = toward the projector; v = underside disc 0-0.15, band
   0.15-0.45, dome 0.45-1): a texel takes the user's plate pixel where the approved view saw that cup point inside the
   painted cup outline (cupmask08 UR polygon, eroded 2 px, not grazing); else its mirror texel (u -> 1 - u, same as
   m08cup); the remaining hole (the doubly hidden top next to the axis) continues the same row from both sides (shifted
   copy of the neighbouring painted row piece, cross-faded), never a generic tile.
The game uses the texture for the whole cup once the camera leaves the approved viewpoint (identical pixels where
painted -> no seam), so the cup keeps one continuous perforated cap, band and underside.
usage: python3 -I tools/match08/urcup08.py <out.png> <out.json> [<debug.png>]
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

out_png, out_json = sys.argv[1], sys.argv[2]
dbg = sys.argv[3] if len(sys.argv) > 3 else None
W, H = 864, 1536
L = json.load(open('assets/textures/match08/proj08.json'))
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
VP = M[:3, 3]
V = np.linalg.inv(M); f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H


def proj(p):
    h = np.append(p, 1) @ V.T; x, y, z = h[0], h[1], -h[2]
    return np.array([(x * f / asp / z * 0.5 + 0.5) * W, (0.5 - y * f / z * 0.5) * H])


UR = [(664, 435), (665, 417.5), (672, 400), (685, 380), (695, 367), (702, 365), (712, 375), (722, 390), (740, 410),
      (755, 417.5), (770, 430), (780, 447.5), (775, 455), (752, 461), (715, 464), (675, 457.5)]  # = cupmask08.py
s = L['spouts']['UR']; c0 = np.array(s['c'], float)


# --- 1. refit: a TILTED cup (the painted cup leans ~10 deg toward the chamber centre and shows its underside dish
# strongly from below). Fitted to the painted dish outline, the cap / band line and the cap outline (traced by eye on a
# 10 px grid at 5-6x zoom); the cup's right part is hidden behind the arch, so its radius is the upper-left twin's (same
# depth, mirrored pair): rx = spouts.UL.rx. Unknowns: rim centre x, y (z = the fitted cup depth), dome height ry, band
# height B, roll (in the picture plane) and pitch (top away from the projector).
from scipy.optimize import least_squares
from scipy.spatial import ConvexHull
DISH = [(668, 440), (690, 430), (710, 421), (730, 415), (747, 411), (672, 455), (700, 459), (720, 461), (740, 462), (760, 458),
        (777, 450), (666, 448)]
RIM = [(665, 432), (680, 414), (700, 398), (720, 385)]
CAP = [(664, 425), (672, 400), (685, 380), (695, 367), (702, 365)]
RXF = L['spouts']['UL']['rx']; Z0 = c0[2]


def rot(v, k, t):
    k = k / np.linalg.norm(k); return v * math.cos(t) + np.cross(k, v) * math.sin(t) + k * np.dot(k, v) * (1 - math.cos(t))


def frame(roll, pitch, R):
    d = VP - R; d[1] = 0; d /= np.linalg.norm(d)
    side = np.cross(np.array([0, 1.0, 0]), d)
    a = rot(rot(np.array([0, 1.0, 0]), side, pitch), d, roll)
    e1 = (VP - R) - np.dot(VP - R, a) * a; e1 /= np.linalg.norm(e1)
    return a, e1, np.cross(a, e1)


def model(q):
    x, y, ry_, B_, roll, pitch = q
    R = np.array([x, y, Z0]); a, e1, e2 = frame(roll, pitch, R)
    ph = np.linspace(-math.pi, math.pi, 181)
    ring = lambda hh: np.array([proj(R + hh * a + RXF * (math.cos(t) * e1 + math.sin(t) * e2)) for t in ph])
    dome = np.array([proj(R + ry_ * math.sin(th) * a + RXF * math.cos(th) * (math.cos(t) * e1 + math.sin(t) * e2))
                     for th in np.linspace(0, math.pi / 2, 16) for t in ph[::4]])
    return R, a, e1, ring(-B_), ring(0.0), dome


def segd(P, poly):
    A = poly[:-1]; ab = poly[1:] - A
    t = np.clip(((P - A) * ab).sum(1) / np.maximum((ab * ab).sum(1), 1e-9), 0, 1)
    return float(np.min(np.linalg.norm(A + t[:, None] * ab - P, axis=1)))


def res(q):
    R, a, e1, bot, top, dome = model(q)
    pts = np.concatenate([dome, bot, top]); hull = pts[ConvexHull(pts).vertices]; hull = np.concatenate([hull, hull[:1]])
    return np.array([segd(np.array(p, float), bot) for p in DISH] + [segd(np.array(p, float), top) for p in RIM]
                    + [segd(np.array(p, float), hull) for p in CAP])


# (start with the top away from the projector: the painted underside dish is seen from below -> pitch < 0)
sol = least_squares(res, [c0[0] + 0.8, c0[1], 2.2, 0.7, math.radians(10), math.radians(-14)], x_scale=[0.5, 0.5, 0.5, 0.3, 0.2, 0.2])
q = sol.x
R, a, e1, _, _, _ = model(q); e2 = np.cross(a, e1)
c = R; rx = RXF; ry = q[2]; BAND = q[3]
print('tilted refit: rim centre', R.round(4), 'axis', a.round(4), 'rx', round(rx, 4), 'ry', round(ry, 4), 'band', round(BAND, 4),
      'roll', round(math.degrees(q[4]), 2), 'pitch', round(math.degrees(q[5]), 2), 'rms px', round(float(np.sqrt((res(q) ** 2).mean())), 2))

# --- 2. unrolled texture ------------------------------------------------------------------------------------------
TW, TH = 1024, 512
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
PH, PW = plate.shape[:2]
mask = Image.new('L', (W * 4, H * 4), 0)
ImageDraw.Draw(mask).polygon([(x * 4, y * 4) for x, y in UR], fill=255)
mask = np.asarray(mask.filter(ImageFilter.MinFilter(17))) > 127  # eroded 2 px (x4 supersampled)


def surface(u, v):
    """cup point + outward normal for texture coordinates (vectorised); frame a (axis), e1 (toward the projector), e2"""
    t = (u - 0.5) * 2 * math.pi
    ca, sa = np.cos(t)[..., None], np.sin(t)[..., None]
    rad = ca * e1 + sa * e2
    P = np.zeros(u.shape + (3,)); N = np.zeros(u.shape + (3,))
    d = v < 0.15; b = (v >= 0.15) & (v < 0.45); m = v >= 0.45
    rho = (v / 0.15)[..., None]
    P[d] = (rho * rx * rad - BAND * a)[d]; N[d] = -a
    sb = ((v - 0.15) / 0.30)[..., None]
    P[b] = (rx * rad - BAND * (1 - sb) * a)[b]; N[b] = rad[b]
    th = ((v - 0.45) / 0.55 * (math.pi / 2))[..., None]
    ct, st = np.cos(th), np.sin(th)
    P[m] = (rx * ct * rad + ry * st * a)[m]
    N[m] = (ct * rad / rx + st * a / ry)[m]
    N /= np.linalg.norm(N, axis=-1, keepdims=True)
    return P + c, N


uu, vv = np.meshgrid((np.arange(TW) + 0.5) / TW, (np.arange(TH) + 0.5) / TH)
P, N = surface(uu, vv)
h = np.concatenate([P, np.ones(P.shape[:2] + (1,))], -1) @ V.T
zc = -h[..., 2]
fx = (h[..., 0] * f / asp / zc * 0.5 + 0.5) * W; fy = (0.5 - h[..., 1] * f / zc * 0.5) * H
toV = VP - P; toV /= np.linalg.norm(toV, axis=-1, keepdims=True)
facing = (N * toV).sum(-1)
inside = np.zeros_like(facing, bool)
ix, iy = np.clip((fx * 4).astype(int), 0, W * 4 - 1), np.clip((fy * 4).astype(int), 0, H * 4 - 1)
inside = mask[iy, ix] & (fx >= 0) & (fx < W) & (fy >= 0) & (fy < H)
valid = inside & (facing > 0.2)
# bilinear plate sample (plate = the approved frame at PW x PH)
px, py = fx * PW / W - 0.5, fy * PH / H - 0.5
x0, y0 = np.clip(np.floor(px).astype(int), 0, PW - 2), np.clip(np.floor(py).astype(int), 0, PH - 2)
ax, ay = np.clip(px - x0, 0, 1)[..., None], np.clip(py - y0, 0, 1)[..., None]
col = (plate[y0, x0] * (1 - ax) * (1 - ay) + plate[y0, x0 + 1] * ax * (1 - ay) + plate[y0 + 1, x0] * (1 - ax) * ay
       + plate[y0 + 1, x0 + 1] * ax * ay)
tex = np.zeros((TH, TW, 3), np.float32); tex[valid] = col[valid]
ok = valid.copy()
src = np.full((TH, TW), 0, np.uint8); src[valid] = 1  # 1 painted, 2 mirror, 3 continued
# mirror (u -> 1 - u), as m08cup does in the shader; the painted water stream leaving the underside stays where it is
# painted but is never a mirror source (no second stream on the hidden half)
stream = valid & (vv < 0.15) & (col[..., 2] > 140) & (col[..., 1] > 85)  # light blue / white on the mauve dish
from scipy.ndimage import binary_dilation, distance_transform_edt
stream = binary_dilation(stream, iterations=6) & valid
srcok = ok & ~stream
mv = srcok[:, ::-1] & ~ok
tex[mv] = tex[:, ::-1][mv]; ok |= mv; src[mv] = 2


# row continuation: each hole run takes the neighbouring painted piece of the same row, shifted by the run length
# (left half of the run from the left, right half from the right), cross-faded over 6 texels; rows without any painted
# texel copy the nearest row below that has one
def fill_row(row, okr):
    n = len(row); out = row.copy(); good = okr.copy()
    if not okr.any(): return out, good
    j = 0
    while j < n:
        if okr[j]: j += 1; continue
        k = j
        while k < n and not okr[k]: k += 1
        a, b = j, k  # hole [a, b)
        ln = b - a
        if a > 0 and b < n:
            mid = (a + b) // 2
            for t in range(a, b):
                if t < mid: sidx = t - ln
                else: sidx = t + ln
                sidx = min(max(sidx, 0), n - 1)
                if okr[sidx]: out[t] = row[sidx]
                else: out[t] = row[a - 1] if t < mid else row[b]
            # cross-fade at the run's middle
            for t in range(max(a, mid - 6), min(b, mid + 6)):
                w = (t - (mid - 6)) / 12.0
                l_ = row[min(max(t - ln, 0), n - 1)] if okr[min(max(t - ln, 0), n - 1)] else row[a - 1]
                r_ = row[min(max(t + ln, 0), n - 1)] if okr[min(max(t + ln, 0), n - 1)] else row[b]
                out[t] = l_ * (1 - w) + r_ * w
        else:
            fillv = row[b] if a == 0 and b < n else row[a - 1]
            out[a:b] = fillv
        good[a:b] = True
        j = k
    return out, good


# the dome (cap) above the painted rows was never painted (behind the arch): a periodic tile of the painted cap itself
# (pink perforated, largest fully painted block of dome texels, last 25 % of each direction cross-faded into the start)
# continues it, cross-faded into the painted / mirrored texels over 10 texels; band and underside use the row continuation
dome_rows = np.nonzero((np.arange(TH) + 0.5) / TH >= 0.47)[0]
best = None
for h_ in (64, 48, 40, 32):
    for r0 in range(dome_rows[0], TH - h_):
        span = (src[r0:r0 + h_] == 1).all(0)
        if not span.any(): continue
        # longest run of columns painted in every row of the block
        runs, j = [], 0
        while j < TW:
            if span[j]:
                k = j
                while k < TW and span[k]: k += 1
                runs.append((k - j, j)); j = k
            else: j += 1
        ln, c0_ = max(runs)
        if ln >= 48 and (best is None or ln * h_ > best[0]): best = (ln * h_, r0, h_, c0_, ln)
    if best: break
if best:
    _, r0, th_, cu0, tw_ = best
    tile = tex[r0:r0 + th_, cu0:cu0 + tw_].copy()
    ov_y, ov_x = th_ // 4, tw_ // 4
    wy = np.linspace(0, 1, ov_y)[:, None, None]; tile[:ov_y] = tile[:ov_y] * wy + tile[th_ - ov_y:] * (1 - wy)
    tile = tile[:th_ - ov_y]
    wx = np.linspace(0, 1, ov_x)[None, :, None]; tile[:, :ov_x] = tile[:, :ov_x] * wx + tile[:, tw_ - ov_x:] * (1 - wx)
    tile = tile[:, :tw_ - ov_x]
    ty, tx = tile.shape[:2]
    dome = np.zeros((TH, TW), bool); dome[dome_rows] = True
    need = dome & ~ok
    rr, cc = np.nonzero(dome)
    tiled = np.zeros_like(tex); tiled[rr, cc] = tile[(rr - r0) % ty, (cc - cu0) % tx]
    dist = distance_transform_edt(~ok)
    w = np.clip(dist / 10.0, 0, 1)[..., None]
    sel = dome & ~ok
    # painted neighbour colour for the cross-fade: the row continuation result (computed below) is not ready yet, so fade
    # from the nearest painted / mirrored texel (edt indices)
    _, (iy_, ix_) = distance_transform_edt(~ok, return_indices=True)
    near = tex[iy_, ix_]
    tex[sel] = (near * (1 - w) + tiled * w)[sel]
    src[sel] = 3; ok |= sel
    print('cap tile rows', r0, r0 + th_, 'cols', cu0, cu0 + tw_)
hole = ~ok
for r in range(TH):
    tex[r], ok_r = fill_row(tex[r], ok[r])
    if ok[r].any(): src[r][hole[r]] = 3
    ok[r] = ok_r
rows_any = ok.any(1)
for r in range(TH):
    if not rows_any[r]:
        rr = r - 1
        while rr >= 0 and not rows_any[rr]: rr -= 1
        if rr >= 0: tex[r] = tex[rr]; src[r] = 3
# soften the continued texels a little across rows (row-to-row jitter of the shifted copies), painted texels untouched
cont = src == 3
blur = np.asarray(Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
tex[cont] = tex[cont] * 0.5 + blur[cont] * 0.5
Image.fromarray(np.clip(tex, 0, 255).astype(np.uint8)).save(out_png)
json.dump({'note': 'upper-right cup refit + unrolled cup texture (tools/match08/urcup08.py): u = azimuth (0.5 toward the projector), '
                   'v = underside 0-0.15, band 0.15-0.45, dome 0.45-1', 'c': [round(float(x), 5) for x in c], 'rx': round(float(rx), 5),
           'ry': round(float(ry), 5), 'band': round(float(BAND), 5), 'a': [round(float(x), 6) for x in a], 'e1': [round(float(x), 6) for x in e1],
           'texels': {'painted': int((src == 1).sum()), 'mirror': int((src == 2).sum()), 'continued': int((src == 3).sum())}},
          open(out_json, 'w'), indent=1)
print('texels painted', int((src == 1).sum()), 'mirror', int((src == 2).sum()), 'continued', int((src == 3).sum()))
if dbg:
    vis = np.clip(tex, 0, 255).astype(np.uint8).copy()
    tint = np.array([[0, 0, 0], [0, 0, 0], [0, 120, 255], [255, 255, 0]], np.float32)
    vv2 = vis.astype(np.float32); m2 = src >= 2
    vv2[m2] = vv2[m2] * 0.7 + tint[src[m2]] * 0.3
    Image.fromarray(vv2.astype(np.uint8)).save(dbg)
