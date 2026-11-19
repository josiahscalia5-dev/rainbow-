"""Screen 08 r14 (`&m08nq=1`): the near water at the PAINTED scale while swimming (v2 of the account-13 helper).

`&m08near=1` (r11) lays the approved picture's own crisp near-river band (rows ~1250-1520 below Benny) along the river,
scaled evenly so its painted water spans the whole swim lane (+-2.95 u; the painted near water is +-1.28 u): every glint /
streak is shown ~2.3x larger than painted (big blurry white "flames", the band's texels magnified ~3x).
r12 `m08glint` (rejected) kept the painted scale only in a +-0.57 u middle and STRETCHED the rest of the lane ~3.4x (flat
smears) with a 1.25 u period (visible repeats). The account-13 v1 of this tool quilted the whole lane from small square
blocks laid out with the even 2.3x layout: the long painted streaks broke into a fish-scale patchwork.

v2 (r14): a tile at the painted scale (no magnification, no stretch anywhere), built only from the user's own near band:
* layout across the lane (x_b = lateral offset from the lane centre, u): the middle +-RC is the painted band 1:1 (painted
  position and scale: magenta band left, cyan centre, as at the bottom of the approved picture); from RC out to the lane
  bank the extra width is filled with the painted water of the SAME side (left: the outer magenta band, right: the outer
  cyan), the source position advancing slowly toward the painted water edge, the painted foam fringe at the lane bank.
* detail: image quilting (Efros & Freeman 2001) from blocks of the painted band at painted scale, TALL along the flow
  (1.36 u x 0.36 u) so the long streaks stay whole; each block taken within +-J of its layout position, joined along
  minimum-error seams; 8 u period along the river (the wrap joined by a seam too), so no short repeat.
* the three painted bubbles are filled along the flow first (as near08.py), so they are never copied.
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


# --- the painted near band (same bank trace as near08.py), at the painted scale --------------------------------------
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
a_s = np.linspace(-A, A, SW); z_s = np.linspace(Z0, Z1, SH)
AA, ZZ = np.meshgrid(a_s, z_s)
X = np.polyval(zc, ZZ) + AA * np.polyval(zh, ZZ)
px, py = project(np.stack([X, np.full_like(X, FY), ZZ], -1))
src = cv2.remap(plate, (px * Wp / W).astype(np.float32), (py * Hp / H).astype(np.float32), cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REFLECT)
src = np.clip(src, 0, 255)
# bubbles: filled along the flow (each texel = blend of the nearest clean texels above / below in its column)
bub = np.zeros(src.shape[:2], bool)
for bx, by, br in [(260, 1425, 36), (318, 1452, 15), (600, 1286, 24)]:
    bub |= ((px - bx) ** 2 + (py - by) ** 2) < (br + 5) ** 2
for i in np.where(bub.any(0))[0]:
    col = bub[:, i]; good = np.where(~col)[0]
    for j in np.where(col)[0]:
        lo = good[good < j]; hi = good[good > j]
        if len(lo) and len(hi):
            a0, b0 = lo[-1], hi[0]; w = (j - a0) / (b0 - a0); src[j, i] = (1 - w) * src[a0, i] + w * src[b0, i]
        elif len(lo): src[j, i] = src[lo[-1], i]
        elif len(hi): src[j, i] = src[hi[0], i]
print('source band', SW, 'x', SH, 'texels (', round(2 * A * HW, 2), 'u x', round(Z0 - Z1, 2), 'u ), half width', round(HW, 3))
src_raw = src.copy()

# --- rectification (v3): the painted streaks are S-curved INSIDE the band (~30 deg one way at its near end, ~30 deg the
# other way at its far end), so stacked pieces of it drew wavy "scales". The streak direction field (structure tensor of
# the band's fine detail, coherence-weighted, smoothed) is integrated into flow lines from the band's middle row; the band
# is resampled along them, so the painted streaks run straight along the river (the game lays the tile along the painted
# river's own S-curve). Pure resampling of the user's pixels (a lateral shift per texel, <= ~0.5 u).
Lm = src.mean(-1); hpf = Lm - cv2.GaussianBlur(Lm, (0, 0), 12)
gx = cv2.Sobel(hpf, cv2.CV_32F, 1, 0, ksize=5); gz = cv2.Sobel(hpf, cv2.CV_32F, 0, 1, ksize=5)
J11 = cv2.GaussianBlur(gx * gx, (0, 0), 30); J22 = cv2.GaussianBlur(gz * gz, (0, 0), 30); J12 = cv2.GaussianBlur(gx * gz, (0, 0), 30)
phi = 0.5 * np.arctan2(2 * J12, J11 - J22)
coh = np.sqrt((J11 - J22) ** 2 + 4 * J12 ** 2) / (J11 + J22 + 1e-6)
slope = np.clip(-np.tan(phi), -1.2, 1.2)
slope = cv2.GaussianBlur(slope * coh, (0, 0), 35) / np.maximum(cv2.GaussianBlur(coh, (0, 0), 35), 1e-4)
RM = SH // 2
xs = np.zeros((SH, SW), np.float32); xs[RM] = np.arange(SW)
for r in range(RM + 1, SH):   # down (far)
    xp = xs[r - 1]; xs[r] = xp + np.interp(xp, np.arange(SW), slope[r - 1])
for r in range(RM - 1, -1, -1):   # up (near)
    xp = xs[r + 1]; xs[r] = xp - np.interp(xp, np.arange(SW), slope[r + 1])
xs = np.clip(xs, 0, SW - 1)
src = cv2.remap(src, xs, np.repeat(np.arange(SH, dtype=np.float32)[:, None], SW, 1), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
src = np.clip(src, 0, 255)
print('rectified: max lateral shift', round(float(np.abs(xs - np.arange(SW)[None]).max() / DX), 3), 'u')

# --- layout: lane offset x_b (u) -> painted band position a ------------------------------------------------------------
# painted water (no foam) a = -0.81 .. 0.72, foam fringes -0.95 .. -0.81 and 0.72 .. 0.90 (column colour, r14);
# the lane centre sits on the painted water's centre c (as m08near: waterA mean)
c = (NJ['waterA'][0] + NJ['waterA'][1]) / 2
LANE = 2.95                                  # swim lane half width (u) (SWIM_HALF)
RC = 0.70                                    # middle +-RC: the painted band's layout 1:1
WT = LANE + 0.10                             # tile half width (u)
WL, WR = -0.81, 0.72                         # painted water edges (a, no foam); the tile is water only: in the lane's outer
                                             # 15 % the game fades to the projected (remapped) painted foam bank
BW, BH, OW, OH = 64, 224, 28, 96             # block (across, along), overlaps (texels)
SX, SY = BW - OW, BH - OH
BWA = BW / DX / HW                           # block width in a
KX = [-WT, -RC, RC, WT]
KA = [WL + 0.5 * BWA, c - RC / HW, c + RC / HW, WR - 0.5 * BWA]
lay = lambda xb: np.interp(xb, KX, KA)
TW = int(round(2 * WT * DX)) // 8 * 8
PERIOD = 8.0                                 # u along the river
TH = int(round(PERIOD * DZ))
xb_of = lambda col: -WT + 2 * WT * col / (TW - 1)
a2col = lambda a: (a + A) / (2 * A) * (SW - 1)
print('target', TW, 'x', TH, 'texels (', round(2 * WT, 2), 'u x', PERIOD, 'u ), middle layout 1:1 +-', RC, 'u')

# colour zones of the rectified band (v4): magenta band / pink-to-cyan transition / cyan; a block whose layout lies wholly
# in the magenta or the cyan zone may come from ANYWHERE in that zone (variety: the band is small), a block over the
# transition stays within +-0.10 u of its layout position (keeps the painted band order magenta -> cyan)
colm = src.mean(0)
zone = np.where((colm[:, 0] > 135) & (colm[:, 1] < 135), 1, np.where(colm[:, 0] < 95, 2, 0))
cw0, cw1 = int(math.ceil(a2col(WL))), int(a2col(WR))   # water-only source columns
zone[:cw0] = -1; zone[cw1:] = -1
for zn, nm in ((1, 'magenta'), (2, 'cyan')):
    cs = np.where(zone == zn)[0]
    print(nm, 'zone a', round(-A + 2 * A * cs.min() / (SW - 1), 3), '..', round(-A + 2 * A * cs.max() / (SW - 1), 3), len(cs), 'cols')
zI = {zn: np.concatenate([[0], np.cumsum(zone == zn)]) for zn in (1, 2)}
blk_in = lambda zn, c0: zI[zn][c0 + BW] - zI[zn][c0] == BW   # all BW columns of a source block in zone zn
NR, NC = SH - BH + 1, SW - BW + 1
nbx = int(math.ceil((TW - OW) / SX)); nby = int(math.ceil((TH + OH - BH) / SY)) + 1
out = np.zeros(((nby - 1) * SY + BH, nbx * SX + OW, 3), np.float32)
filled = np.zeros(out.shape[:2], bool)
# (v4) each block may also come MIRRORED left-right: after rectification the painted streaks run straight along the flow,
# so a mirrored block keeps them straight (no chevrons); it doubles the variety of the narrow magenta band
srcs = [np.ascontiguousarray(src.astype(np.float32)), np.ascontiguousarray(src[:, ::-1].astype(np.float32))]
uses = np.zeros((2, NR, NC), np.float32)


def min_cut_v(err):  # err (h, w) -> per row the column where the kept (old) part ends
    h, w = err.shape; E = err.copy(); back = np.zeros((h, w), int)
    for i in range(1, h):
        for j in range(w):
            lo, hi = max(0, j - 1), min(w, j + 2); k = lo + int(np.argmin(E[i - 1, lo:hi])); E[i, j] += E[i - 1, k]; back[i, j] = k
    path = np.zeros(h, int); path[-1] = int(np.argmin(E[-1]))
    for i in range(h - 1, 0, -1): path[i - 1] = back[i, path[i]]
    return path


def ssd(tmpl, dr=0):  # SSD of tmpl against every position of both sources, indexed by (mirror, block top-left r0, c0)
    return np.stack([(cv2.matchTemplate(sm, np.ascontiguousarray(tmpl), cv2.TM_SQDIFF) / tmpl[..., 0].size)[dr:dr + NR, :NC] for sm in srcs])


for by in range(nby):
    for bx in range(nbx):
        y0, x0 = by * SY, bx * SX
        xc = xb_of(min(x0 + BW / 2, TW - 1))
        al, ar = lay(xb_of(x0)), lay(xb_of(min(x0 + BW, TW - 1)))
        tc = a2col(lay(xc))
        okm = np.zeros((2, NR, NC), bool)
        zt = [zn for zn in (1, 2) if zone[int(round(a2col(al)))] == zn and zone[int(round(a2col(ar)))] == zn]
        if zt:
            cols = np.array([blk_in(zt[0], c0) for c0 in range(NC)])
            okm[0][:, cols] = True; okm[1][:, cols[::-1]] = True   # mirrored source: column c0 <-> SW - BW - c0
        jit = 0.10 * DX
        lo_c = int(max(cw0, min(cw1 - BW, tc - BW / 2 - jit))); hi_c = int(max(cw0, min(cw1 - BW, tc - BW / 2 + jit)))
        okm[0][:, lo_c:hi_c + 1] = True
        tgt = out[y0:y0 + BH, x0:x0 + BW]
        wrap = y0 + BH > TH; rs = max(y0, TH)
        E = np.zeros((2, NR, NC), np.float32)
        if bx > 0: E += ssd(tgt[:, :OW])
        if by > 0: E += ssd(tgt[:OH])
        if wrap:   # rows at / past TH must equal the tile's rows (row - TH): periodic along the river
            n = y0 + BH - rs
            E += ssd(out[rs - TH:rs - TH + n, x0:x0 + BW], rs - y0)
        E = E * (1 + 0.15 * uses) + 1.0     # mild penalty for re-using the same source region
        E[~okm] = np.inf
        flat = np.argsort(E, axis=None)[:4]
        mi, r0, c0 = np.unravel_index(int(rng.choice(flat)), E.shape)
        uses[mi, max(0, r0 - 40):r0 + 40, max(0, c0 - 24):c0 + 24] += 1
        uses[1 - mi, max(0, r0 - 40):r0 + 40, max(0, SW - BW - c0 - 24):SW - BW - c0 + 24] += 1
        blk = srcs[mi][r0:r0 + BH, c0:c0 + BW].copy()
        keep_old = np.zeros((BH, BW), bool)
        if bx > 0:   # left overlap: vertical min cut
            p = min_cut_v(((blk[:, :OW] - tgt[:, :OW]) ** 2).sum(-1))
            for i in range(BH): keep_old[i, :p[i]] = True
        if by > 0:   # top overlap: horizontal min cut
            p = min_cut_v(((blk[:OH, :] - tgt[:OH, :]) ** 2).sum(-1).T)
            for j in range(BW): keep_old[:p[j], j] = True
        # two-band seam (v4): the fine detail switches at the min cut (feathered 1.2 texels), the soft colour is blended over
        # a wide feather (sigma 8), so no straight block edge shows where the cut had to run along the overlap's border
        fm = filled[y0:y0 + BH, x0:x0 + BW].astype(np.float32)
        kh = np.where(fm > 0, cv2.GaussianBlur(keep_old.astype(np.float32), (0, 0), 1.2), 0.0)
        kl = np.where(fm > 0, cv2.GaussianBlur(keep_old.astype(np.float32), (0, 0), 8.0), 0.0)
        if bx == 0 and by == 0: kh[:] = 0; kl[:] = 0
        nlo = lambda im, m: cv2.GaussianBlur(im * m[..., None], (0, 0), 6) / np.maximum(cv2.GaussianBlur(m, (0, 0), 6), 1e-3)[..., None]
        tl, bl = nlo(tgt, np.maximum(fm, 1e-3)), nlo(blk, np.ones_like(fm))
        kh, kl = kh[..., None], kl[..., None]
        out[y0:y0 + BH, x0:x0 + BW] = kl * tl + (1 - kl) * bl + kh * (tgt - tl) + (1 - kh) * (blk - bl)
        filled[y0:y0 + BH, x0:x0 + BW] = True
    print('row', by + 1, '/', nby, flush=True)

# periodic: the rows past TH are the wrapped continuation of the top rows; join them over the overlap with a min cut
ov = out.shape[0] - TH
tile = out[:TH, :TW].copy()
if ov > 0:
    extra = out[TH:TH + ov, :TW]
    p = min_cut_v(((extra - tile[:ov]) ** 2).sum(-1).T)   # per column: rows above p come from `extra`
    m = np.zeros((ov, TW), np.float32)
    for j in range(TW): m[:p[j], j] = 1
    m = cv2.GaussianBlur(m, (5, 5), 1.0)[..., None]
    tile[:ov] = m * extra + (1 - m) * tile[:ov]
t8 = np.clip(tile, 0, 255).astype(np.uint8)
Image.fromarray(t8).save(out_png, optimize=True)
json.dump({'z0': float(Z0), 'period': PERIOD, 'halfWidth': WT, 'lane': LANE, 'core': RC, 'texelsPerU': [DX, DZ],
           'layout': {'x': KX, 'a': KA, 'c': c, 'paintedHalfWidth': HW}, 'block': [BW, BH], 'overlap': [OW, OH],
           'note': 'u = 0.5 + x_b / (2 halfWidth), x_b = lateral offset from the lane centre (u; |x| <= core 1:1, beyond: '
                   'core + (|x| - core) (lane - core) / (h - core) for a lane of half width h); v = (z0 - z) / period (repeat). '
                   'Painted scale; assembled by image quilting from the approved picture\'s own near band (nq08.py v4, r14: rectified along the painted flow, zone quilting, mirrored blocks allowed)'},
          open(out_json, 'w'), indent=1)
if dbg:
    Image.fromarray(src_raw.astype(np.uint8)).save(f'{dbg}/nq08_source_band.png')
    Image.fromarray(src.astype(np.uint8)).save(f'{dbg}/nq08_source_rectified.png')
    # the plain layout (no quilting: the band sampled at the layout position, stretched where the layout is) for comparison
    cols = a2col(lay(xb_of(np.arange(TW))))
    UU, VV = np.meshgrid(cols.astype(np.float32), np.arange(SH, dtype=np.float32))
    Image.fromarray(np.clip(cv2.remap(srcs[0], UU, VV, cv2.INTER_LINEAR), 0, 255).astype(np.uint8)).save(f'{dbg}/nq08_layout_plain.png')
print('wrote', out_png, t8.shape)
