"""Screen 08 r13 (`&m08nq=1`): near water at the PAINTED glint size while swimming.

`&m08near=1` (r11) lays the approved picture's own crisp near-river band (rows ~1250-1520 below Benny) along the river,
but scaled evenly so its painted water spans the whole swim lane (+-2.95 u, the painted near water is +-1.28 u): every
glint / streak is shown ~2.3x larger than painted (big jagged white "flames", the band's texels magnified ~3x) and the
band (1.25 u long) repeats every 2.9 u.
This keeps the SAME lane layout (magenta band left, cyan middle, foam fringe on the lane banks: lane position sl -> band
position a = c + hw * sl, exactly as m08near) but rebuilds the DETAIL at the painted scale by image quilting
(Efros & Freeman 2001): the new tile is assembled only from blocks of the user's own near band (re-extracted from the plate
at painted scale; no new pixels, no procedural pattern), each block taken from the band position that the layout puts
there (+- 0.24 u), joined along minimum-error seams; 8 u long along the river (periodic, the wrap joined by a seam too),
so no short repeat is visible.
usage: python3 -I tools/match08/nq08.py <outPng> <outJson> [<debugDir>]
"""
import json, math, sys
import cv2
import numpy as np
from PIL import Image

out_png, out_json = sys.argv[1:3]
dbg = sys.argv[3] if len(sys.argv) > 3 else None
rng = np.random.default_rng(8013)
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


# --- the painted near band (same bank trace as near08.py) -------------------------------------------------------------
BANKS = [(1250, 178, 688), (1300, 140, 718), (1350, 108, 748), (1400, 80, 774), (1450, 52, 800), (1500, 28, 826)]
rows = []
for r, xl, xr in BANKS:
    pl, pr = unproject_floor(xl, r), unproject_floor(xr, r)
    rows.append(((pl[2] + pr[2]) / 2, (pl[0] + pr[0]) / 2, abs(pr[0] - pl[0]) / 2))
rows = np.array(rows)
zc = np.polyfit(rows[:, 0], rows[:, 1], 1); zh = np.polyfit(rows[:, 0], rows[:, 2], 1)
Z0, Z1 = rows[:, 0].max() - 0.05, rows[:, 0].min() + 0.05
HW = float(np.mean(rows[:, 2]))              # painted half width (u) used to turn band position a into world units
A = 1.1
D = 165.0                                    # texels per world unit (painted scale), both directions
SW = int(round(2 * A * HW * D)); SH = int(round((Z0 - Z1) * D))
a_s = np.linspace(-A, A, SW); z_s = np.linspace(Z0, Z1, SH)
AA, ZZ = np.meshgrid(a_s, z_s)
X = np.polyval(zc, ZZ) + AA * np.polyval(zh, ZZ)
px, py = project(np.stack([X, np.full_like(X, FY), ZZ], -1))
src = cv2.remap(plate, (px * Wp / W).astype(np.float32), (py * Hp / H).astype(np.float32), cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REFLECT)
src = np.clip(src, 0, 255)
# the three painted bubbles must not be copied: blocks touching them are not candidates
bub = np.zeros(src.shape[:2], bool)
for bx, by, br in [(260, 1425, 36), (318, 1452, 15), (600, 1286, 24)]:
    bub |= ((px - bx) ** 2 + (py - by) ** 2) < (br + 6) ** 2
print('source band', SW, 'x', SH, 'texels (', round(2 * A * HW, 2), 'u x', round(Z0 - Z1, 2), 'u ), half width', round(HW, 3))

# --- layout: lane position sl -> band position a (exactly the m08near mapping) -----------------------------------------
c = (NJ['waterA'][0] + NJ['waterA'][1]) / 2; hw = (NJ['waterA'][1] - NJ['waterA'][0]) / 2
SL = 1.05                                    # tile covers sl in [-SL, SL] (the shader fades the tile out by |sl| = 1)
LANE = 2.95                                  # swim lane half width (u) the tile is laid on (SWIM_HALF)
TW = 1024
DT = TW / (2 * SL * LANE)                    # target texels per world unit (~165)
PERIOD = 8.0                                 # u along the river
TH = int(round(PERIOD * DT))
B, O = 112, 32                               # block, overlap (texels)
STEP = B - O
J = int(round(0.24 * D))                     # lateral freedom of a block around its layout position
src_col = lambda tj: ((c + hw * (-SL + 2 * SL * tj / (TW - 1))) + A) / (2 * A) * (SW - 1)  # target col -> layout src col
print('target', TW, 'x', TH, 'texels, layout scale', round(DT * hw * HW / D * 0 + (2 * SL * LANE) / (2 * SL * hw * HW), 3))

nbx = int(math.ceil((TW - O) / STEP)); nby = int(math.ceil((TH - O) / STEP)) + 1   # +1 row: wraps onto the top
out = np.zeros(((nby) * STEP + O, nbx * STEP + O, 3), np.float32)
filled = np.zeros(out.shape[:2], bool)
srcm = src.astype(np.float32)
bubI = cv2.integral(bub.astype(np.uint8))


def bub_in(r0, c0):
    return bubI[r0 + B, c0 + B] - bubI[r0, c0 + B] - bubI[r0 + B, c0] + bubI[r0, c0] > 0


def min_cut_v(err):  # err: (h, w) -> per row the column where the left (old) part ends
    h, w = err.shape; E = err.copy(); back = np.zeros((h, w), int)
    for i in range(1, h):
        for j in range(w):
            lo, hi = max(0, j - 1), min(w, j + 2); k = lo + int(np.argmin(E[i - 1, lo:hi])); E[i, j] += E[i - 1, k]; back[i, j] = k
    path = np.zeros(h, int); path[-1] = int(np.argmin(E[-1]))
    for i in range(h - 1, 0, -1): path[i - 1] = back[i, path[i]]
    return path


for by in range(nby):
    for bx in range(nbx):
        y0, x0 = by * STEP, bx * STEP
        tc = src_col(min(x0 + B / 2, TW - 1))
        cmin = int(max(0, min(SW - B, tc - B / 2 - J))); cmax = int(max(0, min(SW - B, tc - B / 2 + J)))
        cand = [(r0, c0) for r0 in range(0, SH - B + 1, 3) for c0 in range(cmin, cmax + 1, 3) if not bub_in(r0, c0)]
        tgt = out[y0:y0 + B, x0:x0 + B]; msk = filled[y0:y0 + B, x0:x0 + B]
        # wrap: the last block row must also match the first rows (periodic along the river)
        wrap = by == nby - 1
        if msk.any() or wrap:
            errs = np.empty(len(cand), np.float32)
            for k, (r0, c0) in enumerate(cand):
                blk = srcm[r0:r0 + B, c0:c0 + B]
                d = ((blk - tgt) ** 2).sum(-1)
                e = float(d[msk].mean()) if msk.any() else 0.0
                if wrap:  # the block's rows below TH must equal the tile's first rows
                    ov = y0 + B - TH
                    if ov > 0:
                        e += float(((blk[B - ov:] - out[0:ov, x0:x0 + B]) ** 2).sum(-1).mean())
                errs[k] = e
            best = errs.min(); ok = np.where(errs <= best * 1.08 + 1e-3)[0]
            r0, c0 = cand[int(rng.choice(ok))]
        else:
            r0, c0 = cand[int(rng.integers(len(cand)))]
        blk = srcm[r0:r0 + B, c0:c0 + B].copy()
        keep_old = np.zeros((B, B), bool)
        if bx > 0:   # left overlap: vertical min cut
            e = ((blk[:, :O] - tgt[:, :O]) ** 2).sum(-1); p = min_cut_v(e)
            for i in range(B): keep_old[i, :p[i]] = True
        if by > 0:   # top overlap: horizontal min cut
            e = ((blk[:O, :] - tgt[:O, :]) ** 2).sum(-1); p = min_cut_v(e.T)
            for j in range(B): keep_old[:p[j], j] = True
        keep_old &= msk
        # feather the cut by 2 texels so the seam is not a hard pixel step
        kf = cv2.GaussianBlur(keep_old.astype(np.float32), (5, 5), 1.0)
        kf = np.where(msk, kf, 0.0)[..., None]
        out[y0:y0 + B, x0:x0 + B] = kf * tgt + (1 - kf) * blk
        filled[y0:y0 + B, x0:x0 + B] = True
    print('row', by + 1, '/', nby, flush=True)

# periodic: the rows past TH are the wrapped continuation of the top rows; join them over the overlap with a min cut
ov = out.shape[0] - TH
tile = out[:TH, :TW].copy()
if ov > 0:
    extra = out[TH:TH + ov, :TW]
    e = ((extra - tile[:ov]) ** 2).sum(-1); p = min_cut_v(e.T)   # per column: rows above p come from `extra`
    m = np.zeros((ov, TW), np.float32)
    for j in range(TW): m[:p[j], j] = 1
    m = cv2.GaussianBlur(m, (5, 5), 1.0)[..., None]
    tile[:ov] = m * extra + (1 - m) * tile[:ov]
t8 = np.clip(tile, 0, 255).astype(np.uint8)
Image.fromarray(t8).save(out_png, optimize=True)
json.dump({'SL': SL, 'lane': LANE, 'z0': float(Z0), 'period': PERIOD, 'texelsPerU': DT, 'srcTexelsPerU': D,
           'layout': {'c': c, 'hw': hw, 'A': A, 'halfWidth': HW}, 'block': B, 'overlap': O, 'jitterU': J / D,
           'note': 'u = 0.5 + sl / (2 SL), sl = lane position (-1 left bank .. 1 right bank); v = (z0 - z) / period (repeat). '
                   'Assembled by image quilting from the approved picture\'s own near band at painted scale (nq08.py)'},
          open(out_json, 'w'), indent=1)
if dbg:
    Image.fromarray(src.astype(np.uint8)).save(f'{dbg}/nq08_source_band.png')
    # the old tile shown at the same layout for comparison (what m08near draws over the same lane area)
    old = np.asarray(Image.open('assets/textures/match08/near08.png').convert('RGB')).astype(np.float32)
    jj = np.arange(TW); aa = c + hw * (-SL + 2 * SL * jj / (TW - 1)); u = (0.5 + aa / (2 * A)) * (old.shape[1] - 1)
    zl = NJ['zLen'] * (LANE / hw / NJ['halfWidth'])
    ii = np.arange(TH); v = ((ii / DT) / zl * old.shape[0]) % old.shape[0]
    UU, VV = np.meshgrid(u.astype(np.float32), v.astype(np.float32))
    Image.fromarray(np.clip(cv2.remap(old, UU, VV, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP), 0, 255).astype(np.uint8)).save(f'{dbg}/nq08_old_same_layout.png')
print('wrote', out_png, t8.shape)
