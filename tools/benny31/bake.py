"""Bake the APPROVED Screen 06 Benny's colours onto a generated mesh's UV texture, for an UNLIT material (texture x K):
the game's colour chain after the material (Neutral tone mapping at exposure 0.86 -> sRGB -> grade: saturation 1.36,
contrast 1.15) is inverted numerically, so at the approved rear view the screen shows the approved pixels.
Texels the rear view cannot see keep the model's own generated colours (same inversion, colour-matched to the bake).
usage: python3 -I bake.py <glb> <uvpass.f32> <size> <fit_render.png> <out_png> [K]"""
import io, json, struct, sys
import numpy as np, cv2
from PIL import Image
from scipy.spatial import cKDTree
sys.path.insert(0, '/home/user/rainbow-/tools/benny31')
from fit import align, A, FW, FH, WL
R = '/home/user/rainbow-'
glb, uvf, size, fitpng, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
K = float(sys.argv[6]) if len(sys.argv) > 6 else 4.0
TEX = 2048

# ---------------- forward colour chain (numpy copy of three r170 NeutralToneMapping + sRGB + src/render/grade.ts)
def neutral(c):
    c = c.copy(); x = c.min(axis=-1, keepdims=True)
    off = np.where(x < 0.08, x - 6.25 * x * x, 0.04); c = c - off
    peak = c.max(axis=-1, keepdims=True); sc = 0.76; d = 1 - sc
    newp = 1 - d * d / (peak + d - sc)
    comp = c * (newp / np.maximum(peak, 1e-6))
    g = 1 - 1 / (0.15 * (peak - newp) + 1)
    comp = comp * (1 - g) + newp * g
    return np.where(peak < sc, c, comp)
def srgb(c): c = np.clip(c, 0, 1); return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)
def grade(c):
    l = (c * np.array([0.2126, 0.7152, 0.0722])).sum(axis=-1, keepdims=True)
    col = l + (c - l) * 1.36; col = (col - 0.5) * 1.15 + 0.5
    return np.clip(col, 0, 1)
def forward(L): return grade(srgb(neutral(L * 0.86)))

# inverse by nearest neighbour on a dense grid + Gauss-Newton refinement
t = np.linspace(0, 1, 72) ** 2.0 * 6.0
G = np.stack(np.meshgrid(t, t, t, indexing='ij'), -1).reshape(-1, 3)
FG = forward(G); tree = cKDTree(FG)
def inverse(D):
    D = D.reshape(-1, 3); _, i = tree.query(D); L = G[i].copy()
    for _ in range(6):
        F0 = forward(L); r = D - F0
        J = np.zeros((len(L), 3, 3)); h = 1e-3
        for k in range(3):
            Lk = L.copy(); Lk[:, k] += h; J[:, :, k] = (forward(Lk) - F0) / h
        dL = np.linalg.lstsq if False else None
        Jt = np.transpose(J, (0, 2, 1)); JtJ = Jt @ J + 1e-6 * np.eye(3); Jtr = (Jt @ r[..., None])[..., 0]
        L = np.clip(L + np.linalg.solve(JtJ, Jtr[..., None])[..., 0], 0, 6.0)
    return L

# ---------------- approved target colours at the fitted view
uvp = np.frombuffer(open(uvf, 'rb').read(), np.float32).reshape(size, size, 4)[::-1]   # rows top-down
al = np.asarray(Image.open(fitpng).convert('RGBA'))[..., 3].astype(np.float32) / 255
s, dx, dy = align(al); fs = al.shape[0] / size                     # fit render px -> frame px; uv px -> fit px
yy, xx = np.mgrid[0:size, 0:size].astype(np.float32)
fx = s * ((xx + 0.5) * fs - 0.5) + dx; fy = s * ((yy + 0.5) * fs - 0.5) + dy
appr2 = np.asarray(Image.open(f'{R}/qa/match/06/paint06/work/appr06_seedvr2.png').convert('RGB')).astype(np.float32) / 255
# Benny's own colours carried ~14 px (1x) past his painted outline (push-pull from inside the matte), so mesh pixels that fall
# just outside the painted outline take fur / knit colours instead of water or the generator's paler colours
A2 = cv2.resize(A, (2 * FW, 2 * FH), interpolation=cv2.INTER_LINEAR)
# the painted outline carries light fur tips (a soft glow); on the harder mesh edge they read as a white line -> the outline
# band (~6 px at 1x) takes the colours from just inside instead
core = cv2.erode((A2 > 0.5).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))).astype(np.float32)
ext = appr2 * core[..., None]; wsum_i = core.copy(); acc_i = ext.copy()
for sg in (2, 4, 8, 16):
    n_ = cv2.GaussianBlur(ext, (0, 0), sg); d_ = cv2.GaussianBlur(core, (0, 0), sg)[..., None]
    fillv = n_ / np.maximum(d_, 1e-4); need = (wsum_i < 0.5)
    acc_i = np.where(need[..., None] & (d_ > 0.02), fillv, acc_i); wsum_i = np.maximum(wsum_i, (d_[..., 0] > 0.02).astype(np.float32))
appr2 = np.where(core[..., None] > 0, appr2, acc_i)
Am = cv2.dilate((A > 0.5).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (29, 29)))
inA = (fx >= 0) & (fx < FW - 1) & (fy >= 0) & (fy < WL - 2)
inA[inA] = Am[fy[inA].astype(int), fx[inA].astype(int)] > 0
sel = inA & (uvp[..., 3] > 0.5) & (uvp[..., 2] > 0.0)
D = cv2.remap(appr2, (2 * fx + 0.5).astype(np.float32), (2 * fy + 0.5).astype(np.float32), cv2.INTER_LINEAR)[sel]
L = inverse(D)
u = uvp[..., 0][sel]; v = uvp[..., 1][sel]; w = uvp[..., 2][sel] ** 2
tx = np.clip((u * TEX).astype(int), 0, TEX - 1); ty = np.clip((v * TEX).astype(int), 0, TEX - 1)
acc = np.zeros((TEX, TEX, 3)); wsum = np.zeros((TEX, TEX))
np.add.at(acc, (ty, tx), L * w[:, None]); np.add.at(wsum, (ty, tx), w)
print('approved samples', int(sel.sum()), 'texels hit', int((wsum > 0).sum()))

# ---------------- the model's own texture for everything else (as display colours -> same inversion)
b = open(glb, 'rb').read(); n = struct.unpack('<I', b[12:16])[0]; j = json.loads(b[20:20 + n]); bin0 = 20 + n + 8
bv = j['bufferViews'][j['images'][0]['bufferView']]
own = np.asarray(Image.open(io.BytesIO(b[bin0 + bv.get('byteOffset', 0): bin0 + bv.get('byteOffset', 0) + bv['byteLength']])).convert('RGB').resize((TEX, TEX), Image.LANCZOS)).astype(np.float32) / 255
hit = wsum > 0
Lb = np.zeros((TEX, TEX, 3)); Lb[hit] = acc[hit] / wsum[hit][:, None]
# colour-match the model's own texture to the baked approved colours where both exist (per-channel affine in display space)
Dap = forward(Lb[hit]); Down = own[hit]
Mfit = np.linalg.lstsq(np.c_[Down, np.ones(len(Down))], Dap, rcond=None)[0]
own_m = np.clip(np.c_[own.reshape(-1, 3), np.ones(TEX * TEX)] @ Mfit, 0, 1).reshape(TEX, TEX, 3)
Lown = inverse(own_m).reshape(TEX, TEX, 3)
# soft blend: approved bake where it has support (push-pull smoothed weight), the model's own colours elsewhere
wgt = cv2.GaussianBlur(np.minimum(1, wsum / 0.25).astype(np.float32), (0, 0), 3)
# UV islands of the mesh (rasterised triangles)
def accessor(i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]; off = bin0 + v.get('byteOffset', 0) + a.get('byteOffset', 0)
    comp = {5126: np.float32, 5125: np.uint32, 5123: np.uint16}[a['componentType']]; nc = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]
    return np.frombuffer(b[off: off + a['count'] * nc * np.dtype(comp).itemsize], comp).reshape(a['count'], nc)
prim = j['meshes'][0]['primitives'][0]
UV = accessor(prim['attributes']['TEXCOORD_0']); IDX = accessor(prim['indices']).reshape(-1, 3)
isl = np.zeros((TEX, TEX), np.uint8)
cv2.fillPoly(isl, list((UV[IDX] * TEX * 16).astype(np.int32)), 1, lineType=cv2.LINE_8, shift=4)
isl = cv2.dilate(isl, np.ones((3, 3), np.uint8))
nlab, lab = cv2.connectedComponents(isl, connectivity=8)
print('UV islands', nlab - 1, 'cover', round(float(isl.mean()) * 100, 1), '% of the texture')
# blend = closeness to a REAL projected texel of the SAME island (no colour leaking across islands); else the model's own colours
have = wsum > 0
Lfin = Lown.copy()
for i in range(1, nlab):
    ys, xs = np.where(lab == i)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    m = (lab[y0:y1, x0:x1] == i); h = have[y0:y1, x0:x1] & m
    if not h.any(): continue
    Lb_i = Lb[y0:y1, x0:x1]
    num = cv2.GaussianBlur((Lb_i * h[..., None]).astype(np.float32), (0, 0), 2.0); den = cv2.GaussianBlur(h.astype(np.float32), (0, 0), 2.0)[..., None]
    filled = np.where(h[..., None], Lb_i, num / np.maximum(den, 1e-4))
    dist = cv2.distanceTransform((~h).astype(np.uint8), cv2.DIST_L2, 5)
    w = (np.clip(1 - (dist - 2) / 8.0, 0, 1) * (den[..., 0] > 1e-3))[..., None]
    blk = Lfin[y0:y1, x0:x1]
    Lfin[y0:y1, x0:x1] = np.where(m[..., None], filled * w + blk * (1 - w), blk)
# gutter fill: texels outside every UV island take the nearest island colour (no white padding bleeding in at edges / mips)
Lg = Lfin * isl[..., None]; cv_ = isl.astype(np.float32); Lout = Lg.copy()
for sg in (1, 2, 4, 8, 16):
    num = cv2.GaussianBlur(Lg.astype(np.float32), (0, 0), sg); den = cv2.GaussianBlur(isl.astype(np.float32), (0, 0), sg)[..., None]
    upd = (cv_ < 0.5) & (den[..., 0] > 1e-3); Lout[upd] = (num / np.maximum(den, 1e-6))[upd]; cv_[upd] = 1
Lfin = np.where(isl[..., None] > 0, Lfin, Lout)
print('UV islands cover', round(float(isl.mean()) * 100, 1), '% of the texture')
V = np.clip(Lfin / K, 0, 1)
Image.fromarray((srgb(V) * 255 + 0.5).astype(np.uint8)).save(out)
json.dump({'K': K, 'samples': int(sel.sum()), 'texels': int(hit.sum()), 'colour_match': Mfit.tolist()}, open(out + '.json', 'w'), indent=1)
print('baked ->', out)
