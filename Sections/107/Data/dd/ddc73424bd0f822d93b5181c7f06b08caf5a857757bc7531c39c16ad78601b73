"""Screen 05 proj05 — bake the TARGET water image (tools/proj05/make_target.py) onto the REAL game river, in the
river's own coordinates (u across -1..1, s = arc length), using the live game's per-pixel river coordinates from the
locked 05 camera (scripts/proj05-probe.mjs -> uv_river.f32). Everything is anchored to the river, not to the camera.

usage: python3 -I tools/proj05/bake.py <probe_dir> <target_dir> <out_dir>
outputs (out_dir, default assets/textures/water05/):
  proj05_E.png   EXACT layer: the approved water at ~screen resolution; rows follow s with the locked view's own
                 density, columns span the locked view's visible u-range per row (lookup in proj05_lut.json); alpha = valid
  proj05_N.png   NEAR layer: same water, full river width, uniform 24 texels per unit of s for s in [sN0, sN1]; alpha = coverage
  proj05_T.png   TILE layer: seamless periodic copy of the full-width mid river (s period L) for the rest of Screen 05
  proj05_D.png   DETAIL layer: luminance high-pass of the sharpest near water (the approved streaks / glints), seamless
                 in u and s, 0.5 = no change
  proj05_F.png   FAR layer: the far river block (far05.ts) in its own (uv.x, log depth) coordinates; alpha = valid
  proj05_lut.json  s -> (V, centre u, half range u) for proj05_E + all layer extents
coins are filled along the flow (s direction) in river space."""
import json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, gaussian_filter1d, binary_dilation, binary_erosion

probe, tdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
W, H = 864, 1536
R = np.fromfile(os.path.join(probe, "uv_river.f32"), np.float32).reshape(H, W, 4).astype(np.float64)
surf = np.abs(R[..., 2] - 1) < 0.01
wm = np.asarray(Image.open(os.path.join(tdir, "water_mask.png"))) > 127
# coins are filled in the target from the user's artwork (make_target.py); the along-s hole filling below stays for gaps
coin = np.zeros((H, W), bool)
tgt = np.asarray(Image.open(os.path.join(tdir, "target_05.png")).convert("RGB"), np.float64) / 255
# colour feedback from the live capture (tools/proj05/residual.py): what the bloom pass adds is taken out of the bake
if os.path.exists(os.path.join(tdir, "correction.npz")):
    tgt = np.clip(tgt - np.load(os.path.join(tdir, "correction.npz"))["c"].astype(np.float64), 0, 1)
U, S = R[..., 0], R[..., 1]
S_CUT = 182.0                                   # the real ribbon ends behind the far block's seam
use = surf & wm & (S < S_CUT)
ys, xs = np.nonzero(use)
su, ss, sc, scoin = U[use], S[use], tgt[use], coin[use]
# locked-view density along s (screen rows per unit s), per pixel
dsy = np.abs(np.gradient(S, axis=0))

# ---------------------------------------------------------------- E (exact) layer
sE0, sE1 = float(ss.min()) - 0.02, float(ss.max()) + 0.02
NL = 2048
sg = np.linspace(sE0, sE1, NL)
bin_i = np.clip(((ss - sE0) / (sE1 - sE0) * (NL - 1)).round().astype(int), 0, NL - 1)
umin = np.full(NL, np.nan); umax = np.full(NL, np.nan); dens = np.full(NL, np.nan)
order = np.argsort(bin_i); bi = bin_i[order]
starts = np.searchsorted(bi, np.arange(NL)); ends = np.searchsorted(bi, np.arange(NL), side="right")
dsel = dsy[use][order]; usel = su[order]
for k in range(NL):
    a, b = starts[k], ends[k]
    if b - a >= 3:
        uu = usel[a:b]
        umin[k], umax[k] = uu.min(), uu.max()
        dens[k] = 1.0 / max(np.median(dsel[a:b]), 1e-4)
def fill_nan(v):
    i = np.arange(len(v)); ok = np.isfinite(v)
    return np.interp(i, i[ok], v[ok])
umin, umax, dens = fill_nan(umin), fill_nan(umax), fill_nan(dens)
# u-range: running min / max over +-6 bins, then smooth (no wiggles), 1.5 % margin
from scipy.ndimage import minimum_filter1d, maximum_filter1d
umin = gaussian_filter1d(minimum_filter1d(umin, 25), 6) - 0.015
umax = gaussian_filter1d(maximum_filter1d(umax, 25), 6) + 0.015
umin, umax = np.clip(umin, -1, 1), np.clip(umax, -1, 1)
cE, wE = (umin + umax) / 2, np.maximum((umax - umin) / 2, 0.02)
dens = np.exp(gaussian_filter1d(np.log(np.clip(dens, 1, 400)), 8))
tex_d = np.maximum(dens * 1.3, 8.0)                  # texel rows per unit s (>= 8: the far rows stay sharp at the locked eye)
cum = np.concatenate([[0], np.cumsum((tex_d[1:] + tex_d[:-1]) / 2 * np.diff(sg))])
NE = int(min(2048, np.ceil(cum[-1])))
V = cum / cum[-1]
WE = 1024
def e_coords(u, s):
    v = np.interp(s, sg, V); c = np.interp(s, sg, cE); w = np.interp(s, sg, wE)
    return (0.5 + (u - c) / (2 * w)) * WE - 0.5, v * NE - 0.5

def splat(xf, yf, col, Wt, Ht):
    acc = np.zeros((Ht, Wt, col.shape[1])); wt = np.zeros((Ht, Wt))
    x0 = np.floor(xf).astype(int); y0 = np.floor(yf).astype(int); fx = xf - x0; fy = yf - y0
    for dx, dy, ww in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        xi, yi = x0 + dx, y0 + dy
        ok = (xi >= 0) & (xi < Wt) & (yi >= 0) & (yi < Ht)
        np.add.at(acc, (yi[ok], xi[ok]), col[ok] * ww[ok, None]); np.add.at(wt, (yi[ok], xi[ok]), ww[ok])
    return acc, wt

def finish(acc, wt, holew, fill_sigma=1.2, along_axis=0, max_gap=400, fill_all=False):
    """normalise; fill tiny gaps by normalised blur; coin holes by linear interpolation along s (axis 0)."""
    img = acc / np.maximum(wt, 1e-9)[..., None]
    valid = wt > 0.2
    hole = holew > np.maximum(wt, 1e-9) * 0.5         # coin pixels dominate this texel
    valid &= ~hole
    blur_w = gaussian_filter(valid.astype(float), fill_sigma)
    blur_c = np.stack([gaussian_filter(np.where(valid, img[..., i], 0), fill_sigma) for i in range(img.shape[2])], -1)
    gap = (~valid) & (blur_w > 0.12) & ~binary_dilation(hole, iterations=1)
    img[gap] = (blur_c / np.maximum(blur_w, 1e-6)[..., None])[gap]
    valid = valid | gap
    # coin holes: interpolate along s (columns), between valid texels at both ends
    hole_t = (binary_dilation(hole, iterations=2) & ~valid | hole) if not fill_all else (~valid | hole)
    Ht, Wt = valid.shape
    filled = np.zeros_like(valid)
    for x in range(Wt):
        col_h = hole_t[:, x]
        if not col_h.any(): continue
        vcol = valid[:, x] & ~col_h
        idx = np.nonzero(vcol)[0]
        if len(idx) < 2: continue
        hy = np.nonzero(col_h)[0]
        lo = np.searchsorted(idx, hy) - 1; hi = lo + 1
        ok = (lo >= 0) & (hi < len(idx))
        hy, lo, hi = hy[ok], lo[ok], hi[ok]
        y0_, y1_ = idx[lo], idx[hi]
        ok = (y1_ - y0_) <= max_gap
        hy, y0_, y1_ = hy[ok], y0_[ok], y1_[ok]
        t = ((hy - y0_) / np.maximum(y1_ - y0_, 1))[:, None]
        img[hy, x] = img[y0_, x] * (1 - t) + img[y1_, x] * t
        filled[hy, x] = True
    # soften the interpolated stripes across u a little
    if filled.any():
        sm = np.stack([gaussian_filter(img[..., i], (0.6, 1.5)) for i in range(img.shape[2])], -1)
        img[filled] = sm[filled]
    valid = valid | filled
    finish.filled = filled
    return img, valid

xE, yE = e_coords(su, ss)
accE, _ = splat(xE, yE, np.where(scoin[:, None], 0, sc), WE, NE)
holeE, _ = splat(xE, yE, scoin[:, None].astype(float), WE, NE)
wtE, _ = splat(xE, yE, (~scoin)[:, None].astype(float), WE, NE)
E, validE = finish(accE, wtE[..., 0], holeE[..., 0], max_gap=int(NE * 0.35))
alphaE = gaussian_filter(binary_erosion(validE, iterations=1).astype(float), 0.8)

# ---------------------------------------------------------------- N (near, full width) layer
sN0, sN1, dN, WN = 126.0, 166.0, 24, 512
NN = int((sN1 - sN0) * dN)
xN = (su + 1) / 2 * WN - 0.5; yN = (ss - sN0) * dN - 0.5
accN, _ = splat(xN, yN, np.where(scoin[:, None], 0, sc), WN, NN)
holeN, _ = splat(xN, yN, scoin[:, None].astype(float), WN, NN)
wtN, _ = splat(xN, yN, (~scoin)[:, None].astype(float), WN, NN)
N_, validN = finish(accN, wtN[..., 0], holeN[..., 0], fill_sigma=1.5, max_gap=int(12 * dN), fill_all=True)
realN = validN & ~finish.filled                    # texels that saw real approved water (not coin / gap fills)
# fill the remaining (unseen) gaps inside N by a wide normalised blur, but keep them flagged as weak
covN = gaussian_filter(validN.astype(float), 3.0)
alphaN = np.clip((covN - 0.35) / 0.5, 0, 1)

# ---------------------------------------------------------------- T (periodic tile) layer
# full-width mid river (s 145-159 is visible bank to bank from the locked eye), as LAYOUT only (the detail layer adds the
# fine streaks): rows interpolated, invalid texels filled with smooth weights (mirror of the other bank, then the
# column mean), so there are no hard fill edges; periodic with a 3-unit crossfade at the wrap
a_s, L, b = 145.0, 14.0, 3.0
NT = int(L * dN)
def rows_at(img, s_):
    y = np.clip((s_ - sN0) * dN - 0.5, 0, NN - 1.001); y0 = np.floor(y).astype(int); f = (y - y0)[:, None]
    return img[y0] * (1 - f[..., None] if img.ndim == 3 else 1 - f) + img[y0 + 1] * (f[..., None] if img.ndim == 3 else f)
sl = a_s + (np.arange(NT) + 0.5) / dN
# the tile trusts only texels that saw real water; everything else is first replaced by its column mean
colmeanN = (N_ * realN[..., None]).sum(0) / np.maximum(realN.sum(0), 1)[:, None]
N_t = np.where(realN[..., None], N_, colmeanN[None])
vN = np.clip((gaussian_filter(realN.astype(float), 2.0) - 0.5) * 2, 0, 1)
def layer(s_):
    c = rows_at(N_t, s_); w = rows_at(vN, s_)
    cm, wm_ = c[:, ::-1], w[:, ::-1]                      # mirrored bank
    colmean = (c * w[..., None]).sum(0) / np.maximum(w.sum(0), 1e-6)[:, None]
    w1 = np.clip(w, 0, 1); w2 = np.clip(wm_, 0, 1) * (1 - w1)
    w3 = np.clip(1 - w1 - w2, 0, 1)
    return (c * w1[..., None] + cm * w2[..., None] + colmean[None] * w3[..., None]) / np.maximum(w1 + w2 + w3, 1e-6)[..., None]
T_ = layer(sl)
blendr = sl - a_s < b
r = ((sl[blendr] - a_s) / b)[:, None, None]
T_[blendr] = layer(sl[blendr] + L) * (1 - r) + T_[blendr] * r
T_ = np.stack([gaussian_filter(T_[..., i], (3.0, 1.5), mode=("wrap", "nearest")) for i in range(3)], -1)

# ---------------------------------------------------------------- D (detail) layer
# streaky, glinting water under Benny (the user's isolated artwork, no bubbles or coins): s in [131.0, 134.4], u in [-0.3, 0.3]
du0, du1, ds0, ds1 = -0.30, 0.30, 131.0, 134.4
ND = 512
m = (su > du0 - 0.03) & (su < du1 + 0.03) & (ss > ds0 - 0.1) & (ss < ds1 + 0.1)
lum = (sc[m] * np.array([0.2126, 0.7152, 0.0722])).sum(1)
pad = 0.12                                    # crossfade fraction for seamless wrap
Wd = int(ND * (1 + pad)); Hd = int(ND * (1 + pad))
xd = (su[m] - du0) / (du1 - du0) * Wd - 0.5
yd = (ss[m] - ds0) / (ds1 - ds0) * Hd - 0.5
accD, wtD = splat(xd, yd, lum[:, None], Wd, Hd)
Dimg = accD[..., 0] / np.maximum(wtD, 1e-9)
okD = wtD > 0.05
bw = gaussian_filter(okD.astype(float), 1.5); bc = gaussian_filter(np.where(okD, Dimg, 0), 1.5)
Dimg = np.where(okD, Dimg, bc / np.maximum(bw, 1e-6))
hp = Dimg - gaussian_filter(Dimg, 14)          # high-pass: streaks, glints
p = int(ND * pad)
def wrap_axis(a, axis):
    a = np.moveaxis(a, axis, 0)
    n = a.shape[0] - p
    outa = a[:n].copy()
    r = (np.arange(p) / p)[:, None]
    outa[:p] = a[n:n + p] * (1 - r) + a[:p] * r
    return np.moveaxis(outa, 0, axis)
hpw = wrap_axis(wrap_axis(hp, 0), 1)
D = np.clip(0.5 + hpw * 1.0, 0, 1)

# ---------------------------------------------------------------- F (far river block) layer
# the forced-perspective far river (far05.ts): its own coordinates (uv.x across the floor chord, virtual depth Z)
farm = (np.abs(R[..., 2] - 3) < 0.01) & wm
fx_, fz_ = R[..., 0][farm], R[..., 1][farm]
fcol, fcoin = tgt[farm], coin[farm]
ZMAX = float(max(fz_.max(), 1.0)) if farm.any() else 400.0
WF_, HF_ = 512, 512
xF = fx_ * WF_ - 0.5; yF = np.log1p(np.maximum(fz_, 0)) / np.log1p(ZMAX) * HF_ - 0.5
accF, _ = splat(xF, yF, np.where(fcoin[:, None], 0, fcol), WF_, HF_)
holeF, _ = splat(xF, yF, fcoin[:, None].astype(float), WF_, HF_)
wtF, _ = splat(xF, yF, (~fcoin)[:, None].astype(float), WF_, HF_)
F_, validF = finish(accF, wtF[..., 0], holeF[..., 0], fill_sigma=1.5, max_gap=80, fill_all=True)
alphaF = np.clip((gaussian_filter(validF.astype(float), 1.5) - 0.3) / 0.5, 0, 1)

def save(img, a, name):
    rgba = np.concatenate([np.clip(img, 0, 1), np.clip(a, 0, 1)[..., None]], -1) if a is not None else np.clip(img, 0, 1)
    Image.fromarray((rgba * 255 + 0.5).astype(np.uint8)).save(os.path.join(out, name), optimize=True)
save(F_, alphaF, "proj05_F.png"); save(E, alphaE, "proj05_E.png"); save(N_, alphaN, "proj05_N.png"); save(T_, None, "proj05_T.png")
Image.fromarray((D * 255 + 0.5).astype(np.uint8)).save(os.path.join(out, "proj05_D.png"), optimize=True)

LUTN = 1024
sl_ = np.linspace(sE0, sE1, LUTN)
lut = dict(
    note="Screen 05 proj05 bake (tools/proj05/bake.py). E: s -> V (row), c (centre u), w (half range u); v grows with s.",
    E=dict(s0=sE0, s1=sE1, n=LUTN, width=WE, height=NE,
           V=[round(float(x), 7) for x in np.interp(sl_, sg, V)], c=[round(float(x), 5) for x in np.interp(sl_, sg, cE)],
           w=[round(float(x), 5) for x in np.interp(sl_, sg, wE)]),
    N=dict(s0=sN0, s1=sN1, width=WN, height=NN), T=dict(a=a_s, L=L, width=WN, height=NT),
    D=dict(u0=du0, u1=du1, s0=ds0, s1=ds1, size=int(Wd - p), lum_gain=1.0),
    F=dict(zmax=ZMAX, width=WF_, height=HF_, note="far block: x = uv.x, y = log(1 + Z) / log(1 + zmax)"),
    probe_camera_uTime=12)
json.dump(lut, open(os.path.join(out, "proj05_lut.json"), "w"))
rep = dict(E=[WE, NE], N=[WN, NN], T=[WN, NT], D=[int(Wd - p), int(Hd - p)], E_valid=float(validE.mean()), N_valid=float(validN.mean()),
           samples=int(use.sum()), coin_pixels=int(scoin.sum()), sE=[sE0, sE1])
print(json.dumps(rep))
