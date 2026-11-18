"""Screen 08 r14 (`&m08nq=1`): the near water at the PAINTED scale while swimming (v6 of the account-13 helper).

`&m08near=1` (r11) lays the approved picture's own crisp near-river band (rows ~1250-1520 below Benny) along the river,
scaled evenly so its painted water spans the whole swim lane (+-2.95 u; the painted near water is +-1.28 u): every glint /
streak is shown ~2.3x larger than painted (big blurry white "flames", the band's texels magnified ~3x).
Tried before and dropped: r12 `m08glint` (painted scale only in a +-0.57 u middle, the rest of the lane STRETCHED ~3.4x:
flat smears; 1.25 u period: visible repeats); account-13 v1 / r14 v2-v4 (image quilting of the band in blocks: the band's
streaks are S-curved inside it -> wavy "scales" between stacked blocks; after straightening, blocks narrower than a glint
cut the painted glints into small bright fragments -> a glittery speed-line look; the narrow magenta band repeated).

v6 (r14), built only from the user's own near band, at the painted scale everywhere (no magnification, no stretch):
1. rectify: the painted streaks are S-curved inside the band (~30 deg one way at its near end, ~30 deg the other way at
   its far end). The streak direction field (structure tensor) is integrated into flow lines and the band resampled along
   them, so its streaks run straight down the columns (in the game the tile follows the painted river's own S-curve).
2. split: BASE satin (each painted glint filled in along its column = along the flow) + GLINTS (each painted glint one
   soft-edged sprite with its own painted colour, cut from the UNRECTIFIED band: its exact painted shape and angle).
3. base across the lane: the middle +-RC keeps the painted layout 1:1 (magenta band left, cyan centre, as at the bottom of
   the approved picture); toward the banks the extra width is laid from whole painted columns of the same colour zone
   (left: magenta band, right: cyan), in short runs (0.1-0.3 u, mirrored at random: the streaks are straight, so a mirror
   draws no chevrons), each run at its own phase along the flow, runs cross-faded; along the flow each column is the band
   made periodic (its far end cross-faded into its near end).
4. glints back on WHOLE at their painted size and the painted density of their zone, Poisson-scattered over an 8 u period
   (so no short repeat), blended over the base with their own painted colour.
The three painted bubbles are filled along the flow first (as near08.py), so they are never copied.
usage: python3 -I tools/match08/nq08.py <outPng> <outJson> [<debugDir>]
"""
import json, math, sys
import cv2
import numpy as np
from PIL import Image

out_png, out_json = sys.argv[1:3]
dbg = sys.argv[3] if len(sys.argv) > 3 else None
rng = np.random.default_rng(8014)
L = json.load(open('assets/textures/match08/proj08.json'))
NJ = json.load(open('assets/textures/match08/near08.json'))
plate = np.asarray(Image.open('assets/textures/match08/plate08_hybrid.png').convert('RGB')).astype(np.float32)
Hp, Wp = plate.shape[:2]
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
V = np.linalg.inv(M); W, H = L['camera']['size']; f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H
VP = M[:3, 3]; FY = L['floorY']


def project(p):
    h = np.concatenate([p, np.ones(p.shape[:-1] + (1,))], -1) @ V.T
    x, y, z = h[..., 0], h[..., 1], -h[..., 2]
    return (x * f / asp / z * 0.5 + 0.5) * W, (0.5 - y * f / z * 0.5) * H


def unproject_floor(u, v):
    x = (u / W - 0.5) * 2 * asp / f; y = (0.5 - v / H) * 2 / f
    d = M[:3, :3] @ np.array([x, y, -1.0]); s = (FY - VP[1]) / d[1]
    return VP + s * d


def fill_cols(img, mask):  # each masked texel = interpolation of the nearest clean texels above / below in its column
    out = img.copy()
    for i in np.where(mask.any(0))[0]:
        good = np.where(~mask[:, i])[0]
        if not len(good): continue
        js = np.where(mask[:, i])[0]
        out[js, i] = np.stack([np.interp(js, good, img[good, i, k]) for k in range(3)], -1)
    return out


# --- 0. the painted near band (same bank trace as near08.py), at the painted scale ------------------------------------
BANKS = [(1250, 178, 688), (1300, 140, 718), (1350, 108, 748), (1400, 80, 774), (1450, 52, 800), (1500, 28, 826)]
rows = []
for r, xl, xr in BANKS:
    pl, pr = unproject_floor(xl, r), unproject_floor(xr, r)
    rows.append(((pl[2] + pr[2]) / 2, (pl[0] + pr[0]) / 2, abs(pr[0] - pl[0]) / 2))
rows = np.array(rows)
zc = np.polyfit(rows[:, 0], rows[:, 1], 1); zh = np.polyfit(rows[:, 0], rows[:, 2], 1)
Z0, Z1 = rows[:, 0].max() - 0.05, rows[:, 0].min() + 0.05
HW = float(np.mean(rows[:, 2]))              # painted half width (u): band position a -> world units
A = 1.1
DX, DZ = 220.0, 165.0                        # texels per u across / along (the plate holds ~320-460 / ~240 px per u here)
SW = int(round(2 * A * HW * DX)); SH = int(round((Z0 - Z1) * DZ))
AA, ZZ = np.meshgrid(np.linspace(-A, A, SW), np.linspace(Z0, Z1, SH))
X = np.polyval(zc, ZZ) + AA * np.polyval(zh, ZZ)
px, py = project(np.stack([X, np.full_like(X, FY), ZZ], -1))
src = np.clip(cv2.remap(plate, (px * Wp / W).astype(np.float32), (py * Hp / H).astype(np.float32), cv2.INTER_CUBIC,
                        borderMode=cv2.BORDER_REFLECT), 0, 255)
bub = np.zeros(src.shape[:2], bool)
for bx, by, br in [(260, 1425, 36), (318, 1452, 15), (600, 1286, 24)]:
    bub |= ((px - bx) ** 2 + (py - by) ** 2) < (br + 5) ** 2
src = fill_cols(src, bub)
src_raw = src.copy()
print('source band', SW, 'x', SH, 'texels (', round(2 * A * HW, 2), 'u x', round(Z0 - Z1, 2), 'u ), half width', round(HW, 3))

# --- 1. rectify along the painted flow ----------------------------------------------------------------------------------
Lm = src.mean(-1); hpf = Lm - cv2.GaussianBlur(Lm, (0, 0), 12)
gx = cv2.Sobel(hpf, cv2.CV_32F, 1, 0, ksize=5); gz = cv2.Sobel(hpf, cv2.CV_32F, 0, 1, ksize=5)
J11 = cv2.GaussianBlur(gx * gx, (0, 0), 30); J22 = cv2.GaussianBlur(gz * gz, (0, 0), 30); J12 = cv2.GaussianBlur(gx * gz, (0, 0), 30)
phi = 0.5 * np.arctan2(2 * J12, J11 - J22)
coh = np.sqrt((J11 - J22) ** 2 + 4 * J12 ** 2) / (J11 + J22 + 1e-6)
slope = np.clip(-np.tan(phi), -1.2, 1.2)
slope = cv2.GaussianBlur(slope * coh, (0, 0), 35) / np.maximum(cv2.GaussianBlur(coh, (0, 0), 35), 1e-4)
RM = SH // 2
xs = np.zeros((SH, SW), np.float32); xs[RM] = np.arange(SW)
for r in range(RM + 1, SH):
    xs[r] = xs[r - 1] + np.interp(xs[r - 1], np.arange(SW), slope[r - 1])
for r in range(RM - 1, -1, -1):
    xs[r] = xs[r + 1] - np.interp(xs[r + 1], np.arange(SW), slope[r + 1])
xs = np.clip(xs, 0, SW - 1)
src = np.clip(cv2.remap(src, xs, np.repeat(np.arange(SH, dtype=np.float32)[:, None], SW, 1), cv2.INTER_CUBIC,
                        borderMode=cv2.BORDER_REFLECT), 0, 255)
print('rectified: max lateral shift', round(float(np.abs(xs - np.arange(SW)[None]).max() / DX), 3), 'u')

# --- 2. base satin + glints ---------------------------------------------------------------------------------------------
GL_MIN, GL_DIL = 200, 7                      # only the bright compact glint cores become sprites; the softer painted
                                             # highlight streaks stay in the satin base
def split(img):  # -> glint support mask, base satin (glints filled along the columns), glint coverage
    cm = cv2.morphologyEx((img.min(-1) > GL_MIN).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    sp = cv2.dilate(cm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * GL_DIL + 1, 2 * GL_DIL + 1))).astype(bool)
    bs = fill_cols(img, sp)
    bs = np.where(sp[..., None], cv2.GaussianBlur(bs, (0, 0), 1.0), bs)
    cv_ = np.clip((lum(img) - lum(bs)) / np.maximum(255 - lum(bs), 8), 0, 1) ** 0.8 * cv2.GaussianBlur(sp.astype(np.float32), (0, 0), 3.5)
    return sp, bs, cv_


lum = lambda im: im @ np.array([0.3, 0.55, 0.15], np.float32)
sup, base, _ = split(src)                    # base satin from the RECTIFIED band (its streaks run down the columns)
# the glint sprites from the UNRECTIFIED band: each keeps its exact painted shape and its painted diagonal angle
sup_r, base_r, cov = split(src_raw)
bub_near = cv2.dilate(bub.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))).astype(bool)
nlab, lab, stats, cents = cv2.connectedComponentsWithStats(sup_r.astype(np.uint8), 8)
sprites = []
for k in range(1, nlab):
    x, y, w, h, area = stats[k]
    if area < 60 or y <= 2 or y + h >= SH - 2: continue          # tiny, or cut by the band's near / far end
    if (bub_near & (lab == k)).any(): continue                    # next to a painted bubble (its rim would be copied)
    if -A + 2 * A * x / (SW - 1) < -0.80 or -A + 2 * A * (x + w) / (SW - 1) > 0.70: continue   # foam blobs of the banks
    pad = 6; x0s, y0s, x1s, y1s = max(0, x - pad), max(0, y - pad), min(SW, x + w + pad), min(SH, y + h + pad)
    own = cv2.dilate((lab[y0s:y1s, x0s:x1s] == k).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    cy = int(min(SH - 1, round(cents[k][1])))
    crect = float(np.argmin(np.abs(xs[cy] - cents[k][0])))      # its column in the rectified band (for its colour zone)
    sprites.append({'rgb': src_raw[y0s:y1s, x0s:x1s].astype(np.float32), 'a': (cov[y0s:y1s, x0s:x1s] * own).astype(np.float32),
                    'cx': crect, 'w': x1s - x0s, 'h': y1s - y0s})
print('glints', len(sprites), 'sprites; base / glint split at min(RGB) >', GL_MIN)

# --- layout: lane offset x_b (u) -> painted band position a ------------------------------------------------------------
c = (NJ['waterA'][0] + NJ['waterA'][1]) / 2  # the lane centre sits on the painted water's centre (as m08near)
LANE = 2.95                                  # swim lane half width (u) (SWIM_HALF)
RC = 0.70                                    # middle +-RC: the painted band's layout 1:1
WT = LANE + 0.10                             # tile half width (u)
WL, WR = -0.81, 0.72                         # painted water edges (a, no foam); the tile is water only: in the lane's outer
                                             # 15 % the game fades to the projected (remapped) painted foam bank
KX = [-WT, -RC, RC, WT]
KA = [WL + 0.03, c - RC / HW, c + RC / HW, WR - 0.03]
lay = lambda xb: np.interp(xb, KX, KA)
TW = int(round(2 * WT * DX)) // 8 * 8
PZ = SH - int(SH * 0.3)                      # period of one painted column along the flow (texels), see 3.
TH = int(round(8.0 * DZ / PZ)) * PZ          # ~8 u along the river, a whole number of column periods (no wrap seam)
PERIOD = TH / DZ
xb_of = lambda col: -WT + 2 * WT * np.asarray(col, np.float64) / (TW - 1)
a2col = lambda a: (np.asarray(a) + A) / (2 * A) * (SW - 1)
print('target', TW, 'x', TH, 'texels (', round(2 * WT, 2), 'u x', PERIOD, 'u ), middle layout 1:1 +-', RC, 'u')

colm = base.mean(0)
zone = np.where((colm[:, 0] > 135) & (colm[:, 1] < 135), 1, np.where(colm[:, 0] < 95, 2, 0))
cw0, cw1 = int(math.ceil(a2col(WL))), int(a2col(WR))
zone[:cw0] = -1; zone[cw1:] = -1
for zn, nm in ((1, 'magenta'), (2, 'cyan')):
    cs = np.where(zone == zn)[0]
    print(nm, 'zone a', round(-A + 2 * A * cs.min() / (SW - 1), 3), '..', round(-A + 2 * A * cs.max() / (SW - 1), 3), len(cs), 'cols')

# --- 3. base across the lane: whole painted columns, periodic along the flow --------------------------------------------
OVZ = SH - PZ                                # each source column made periodic (far end cross-faded into the near end)
wz = (np.arange(OVZ) / OVZ)[:, None, None]
per = base[:PZ].copy(); per[:OVZ] = (1 - wz) * base[PZ:PZ + OVZ] + wz * base[:OVZ]
lay_col = a2col(lay(xb_of(np.arange(TW))))   # source column the layout puts at each target column
tzone = zone[np.clip(np.round(lay_col).astype(int), 0, SW - 1)]
# runs: (target start, length, source start, mirror, phase); in the middle and over the transition the painted layout
# itself (source column = layout column, one phase), elsewhere runs of whole columns of the same zone from anywhere in it
runs = []; j = 0
while j < TW:
    zt = tzone[j]
    core = abs(xb_of(j)) <= RC or zt not in (1, 2)
    n = int(rng.integers(24, 66))
    if core:
        k = j
        while k < TW and (abs(xb_of(k)) <= RC or tzone[k] not in (1, 2)) and k - j < n: k += 1
        runs.append((j, k - j, None, False, 0)); j = k; continue
    k = j
    while k < TW and tzone[k] == zt and not abs(xb_of(k)) <= RC and k - j < n: k += 1
    cs = np.where(zone == zt)[0]
    s0 = int(rng.integers(cs.min(), max(cs.min() + 1, cs.max() - (k - j) + 2)))
    runs.append((j, k - j, s0, bool(rng.random() < 0.5), int(rng.integers(PZ)))); j = k
XF = 14                                        # cross-fade between runs (columns)
acc = np.zeros((TH, TW, 3), np.float32); wsum = np.zeros((TW,), np.float32)
rowsT = np.arange(TH)
for (j0, n, s0, mir, ph) in runs:
    for dj in range(-XF, n + XF):
        jt = j0 + dj
        if not 0 <= jt < TW: continue
        w = 1.0 if 0 <= dj < n else max(0.0, 1.0 - (dj + 0.5 if dj < 0 else dj - n + 0.5) / XF)
        if w <= 0: continue
        if s0 is None:
            sc = float(lay_col[jt]); ph_ = 0
        else:
            sc = float(s0 + ((n - 1 - dj) if mir else dj)); ph_ = ph
        sc = min(max(sc, 0), SW - 1); i0 = int(sc); fr = sc - i0; i1 = min(i0 + 1, SW - 1)
        rr = (rowsT + ph_) % PZ                 # rows at the painted scale, wrapped (period PZ texels along the flow)
        acc[:, jt] += w * ((1 - fr) * per[rr, i0] + fr * per[rr, i1]); wsum[jt] += w
tile = acc / np.maximum(wsum, 1e-6)[None, :, None]
# run-level tone: neighbouring runs come from differently lit parts of the band (vertical tone stripes); the wide lateral
# colour trend is taken from the painted layout (its column means, smoothed), the run's own fine streak lines are kept
g1 = lambda v, s: cv2.GaussianBlur(v[None].astype(np.float32), (0, 0), sigmaX=s, sigmaY=0.1)[0]
prof_lay = colm[np.clip(np.round(lay_col).astype(int), 0, SW - 1)]
tile += (g1(prof_lay, 24) - g1(tile.mean(0), 10))[None]
base_tile = tile.copy()

# --- 4. the glints back on, whole -------------------------------------------------------------------------------------
sz = {zn: [s for s in sprites if zone[int(np.clip(round(s['cx']), 0, SW - 1))] == zn] for zn in (0, 1, 2)}
src_area = {zn: max(1, int((zone == zn).sum())) * SH for zn in (0, 1, 2)}
placed = []
for zn in (1, 0, 2):
    if not sz[zn]: continue
    cols = np.where(tzone == zn)[0]
    n_t = int(round(len(sz[zn]) / src_area[zn] * len(cols) * TH))
    mind = 0.6 * float(np.median([max(s['w'], s['h']) for s in sz[zn]]))
    tries = got = 0
    while got < n_t and tries < 40 * max(n_t, 1):
        tries += 1
        pxx, pyy = float(rng.choice(cols)), float(rng.uniform(0, TH))
        if any(math.hypot(pxx - qx, min(abs(pyy - qy), TH - abs(pyy - qy))) < mind for qx, qy in placed): continue
        placed.append((pxx, pyy)); got += 1
        s = sz[zn][int(rng.integers(len(sz[zn])))]
        rgb, al = (s['rgb'][:, ::-1], s['a'][:, ::-1]) if rng.random() < 0.5 else (s['rgb'], s['a'])
        h_, w_ = al.shape; x0p, y0p = int(round(pxx - w_ / 2)), int(round(pyy - h_ / 2))
        xa, xb2 = max(0, x0p), min(TW, x0p + w_)
        if xb2 <= xa: continue
        ty = (y0p + np.arange(h_)) % TH       # rows wrap (periodic tile), columns clip
        a3 = al[:, xa - x0p:xb2 - x0p, None]
        tile[ty, xa:xb2] = tile[ty, xa:xb2] * (1 - a3) + rgb[:, xa - x0p:xb2 - x0p] * a3
    print('zone', zn, 'glints placed', got, '/', n_t)
t8 = np.clip(tile, 0, 255).astype(np.uint8)
Image.fromarray(t8).save(out_png, optimize=True)
json.dump({'z0': float(Z0), 'period': PERIOD, 'halfWidth': WT, 'lane': LANE, 'core': RC, 'texelsPerU': [DX, DZ],
           'layout': {'x': KX, 'a': KA, 'c': c, 'paintedHalfWidth': HW}, 'glints': len(placed),
           'note': 'u = 0.5 + x_b / (2 halfWidth), x_b = lateral offset from the lane centre (u; |x| <= core 1:1, beyond: '
                   'core + (|x| - core) (lane - core) / (h - core) for a lane of half width h); v = (z0 - z) / period (repeat). '
                   'Painted scale; from the approved picture\'s own near band (nq08.py v6, r14: rectified along the painted flow, '
                   'base satin from whole painted columns, the painted glints put back whole)'},
          open(out_json, 'w'), indent=1)
if dbg:
    Image.fromarray(src_raw.astype(np.uint8)).save(f'{dbg}/nq08_source_band.png')
    Image.fromarray(src.astype(np.uint8)).save(f'{dbg}/nq08_source_rectified.png')
    Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).save(f'{dbg}/nq08_source_base.png')
    Image.fromarray(np.clip(base_tile, 0, 255).astype(np.uint8)).save(f'{dbg}/nq08_base_tile.png')
print('wrote', out_png, t8.shape)
