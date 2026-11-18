"""Screen 08 r13 (`&m08urcup=1`): the upper-right spout cup as one seamless painted cup while swimming.

In the approved view the gold arch's inner edge runs diagonally across the upper-right cup: its right part and its top
were never painted. The kept m08cup fills a hidden point from its mirror point (vertical plane through the cup axis and
the projector), but the top near the axis is hidden on BOTH sides -> plain gold patch with X-shaped seams (the arch edge
and its mirror image), and the fitted proxy was narrower than the painted cup (painted right edge x ~780 / axis x 720 /
cap top y ~362 vs proxy 760 / 713 / 370), so painted cup pixels lay on the door wall and slid off the cup.

1. Refit (proxy only; the approved view still shows the same plate pixels): axis through the painted axis (x 720,
   cupmask08.UR_AXIS), left silhouette at the painted left edge (x 664) at rim height, pole at y 361 (just above the
   painted cap top at x 702, y 365) -> centre x / rx / ry.
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
AXIS_X, LEFT_X, POLE_Y = 720.0, 664.0, 361.0
BAND = 1.55  # m08cupg upper-right band height (src/world/match08.ts)
s = L['spouts']['UR']; c0 = np.array(s['c'], float)


# --- 1. refit: shift the centre along x, solve rx (left silhouette at rim height) and ry (pole) -----------------------
def left_edge(c, rx):
    return min(proj(c + np.array([rx * math.cos(a), 0, rx * math.sin(a)]))[0] for a in np.linspace(0, 2 * math.pi, 721))


c = c0.copy()
for _ in range(30):
    c[0] += (AXIS_X - proj(c)[0]) * (np.linalg.norm(c - VP) / (f * H / 2))
rx = s['rx']
for _ in range(40):
    e = left_edge(c, rx) - LEFT_X
    rx += e * (np.linalg.norm(c - VP) / (f * H / 2))
ry = s['ry']
for _ in range(40):
    e = proj(c + np.array([0, ry, 0]))[1] - POLE_Y
    ry += e * (np.linalg.norm(c - VP) / (f * H / 2))
print('refit centre', c.round(4), 'rx', round(rx, 4), 'ry', round(ry, 4), '(was', c0.round(4), s['rx'], s['ry'], ')')
print('check axis', proj(c).round(1), 'left', round(left_edge(c, rx), 1), 'pole', proj(c + np.array([0, ry, 0])).round(1))

# --- 2. unrolled texture ------------------------------------------------------------------------------------------
TW, TH = 1024, 512
phi0 = math.atan2(VP[2] - c[2], VP[0] - c[0])  # azimuth toward the projector -> u = 0.5
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
PH, PW = plate.shape[:2]
mask = Image.new('L', (W * 4, H * 4), 0)
ImageDraw.Draw(mask).polygon([(x * 4, y * 4) for x, y in UR], fill=255)
mask = np.asarray(mask.filter(ImageFilter.MinFilter(17))) > 127  # eroded 2 px (x4 supersampled)


def surface(u, v):
    """cup point + outward normal for texture coordinates (vectorised)"""
    a = phi0 + (u - 0.5) * 2 * math.pi
    ca, sa = np.cos(a), np.sin(a)
    P = np.zeros(u.shape + (3,)); N = np.zeros(u.shape + (3,))
    d = v < 0.15; b = (v >= 0.15) & (v < 0.45); m = v >= 0.45
    rho = v / 0.15
    P[d] = np.stack([rho[d] * rx * ca[d], np.full(d.sum(), -BAND), rho[d] * rx * sa[d]], -1); N[d] = (0, -1, 0)
    sb = (v - 0.15) / 0.30
    P[b] = np.stack([rx * ca[b], -BAND * (1 - sb[b]), rx * sa[b]], -1); N[b] = np.stack([ca[b], 0 * ca[b], sa[b]], -1)
    th = (v - 0.45) / 0.55 * (math.pi / 2)
    ct, st = np.cos(th), np.sin(th)
    P[m] = np.stack([rx * ct[m] * ca[m], ry * st[m], rx * ct[m] * sa[m]], -1)
    N[m] = np.stack([ct[m] * ca[m] / rx, st[m] / ry, ct[m] * sa[m] / rx], -1)
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
# mirror (u -> 1 - u), as m08cup does in the shader
mv = ok[:, ::-1] & ~ok
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
                   'v = underside 0-0.15, band 0.15-0.45, dome 0.45-1', 'c': [round(float(x), 5) for x in c], 'rx': round(rx, 5),
           'ry': round(ry, 5), 'band': BAND, 'phi0': round(phi0, 6),
           'texels': {'painted': int((src == 1).sum()), 'mirror': int((src == 2).sum()), 'continued': int((src == 3).sum())}},
          open(out_json, 'w'), indent=1)
print('texels painted', int((src == 1).sum()), 'mirror', int((src == 2).sum()), 'continued', int((src == 3).sum()))
if dbg:
    vis = np.clip(tex, 0, 255).astype(np.uint8).copy()
    tint = np.array([[0, 0, 0], [0, 0, 0], [0, 120, 255], [255, 255, 0]], np.float32)
    vv2 = vis.astype(np.float32); m2 = src >= 2
    vv2[m2] = vv2[m2] * 0.7 + tint[src[m2]] * 0.3
    Image.fromarray(vv2.astype(np.uint8)).save(dbg)
