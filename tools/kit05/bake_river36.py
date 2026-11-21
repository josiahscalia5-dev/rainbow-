"""Round 36b (lead): a SHARP, seamless river section made only from the user's own painted water (no AI, no new design).

Problem (measured round 36): the painting has close-up detail only for the water right in front of Benny (t ~1-3.5: 400-1100 px per
world unit); everything further away is painted small, so a moving camera has to stretch it 2-4x and more.
Method: the sharpest painted water (the user's isolated water art, rows t 1.0-3.4 = one painted bend, colour-matched to the approved
picture's near water and straightened along the painted river core so its streaks run along the river) is laid along every bend of the
world river in one piece (mirrored for bends the other way, stretched x1.3 along the flow only), so every texel is the user's painted
near water at its native sharpness (500 px per world unit across, ~380 along). (A patch-quilting variant was tried first and rejected:
64-px patches broke the long painted streaks into blocks.) Periodic along v (one river period P = 3 ring sections), world-anchored and
bent along kit.json river_center_axis in the game (u = lateral from the river core).
  python3 -I bake_river36.py <kit dir>      (after bake_kit.py + bake_river35.py)
Writes river36.png (+ river36_source.png for review) and kit.json "river36"."""
import sys, os, json, time, numpy as np, cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_model import *

out = sys.argv[1]; rng = np.random.default_rng(36)
K = json.load(open(os.path.join(out, 'kit.json'))); R35 = K['river35']; P = R35['P']; TA = R35['ta']
HWD = float(np.sqrt(RT ** 2 - HW ** 2))
PX = 500.0                         # texels per world unit (across and along)
UMAX = 1.04                        # river-local lateral range of the texture: |u| <= UMAX (core +-0.31 + floor half chord 0.70)
B, O = 64, 18                      # patch size, overlap (px)

iso = np.array(Image.open(os.path.join(REPO, 'references/water/05_water_isolated_original.png')).convert('RGBA')).astype(np.float32)
ref = np.array(Image.open(os.path.join(REPO, 'references/05_flow_into_the_current.png')).convert('RGB')).astype(np.float32)
IH, IW = iso.shape[:2]; isoB = cv2.GaussianBlur(iso, (0, 0), 0.4)
world = lambda t, lat: A0 + np.asarray(t)[..., None] * A + np.asarray(lat)[..., None] * RR - HW * NUP
def sample(img, t, lat, sx=1.0, sy=1.0):
    x, y, _ = project(world(t, lat)); return cv2.remap(img, (x * sx).astype(np.float32), (y * sy).astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
# colour match isolated art -> the approved NEAR water (per channel mean / spread), as bake_river35 (coins / Benny / gold excluded)
tg = np.linspace(1.3, 3.2, 300); lg = np.linspace(-HWD, HWD, 400); TG, LG = np.meshgrid(tg, lg, indexing='ij')
aw = sample(ref, TG, LG); iw_ = sample(isoB, TG, LG, IW / W, IH / H)
hs = cv2.cvtColor(np.clip(aw, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
_, yg, _ = project(world(TG, LG))
okm = (iw_[..., 3] > 220) & ~cv2.dilate(((hs[..., 0] >= 8) & (hs[..., 0] <= 38) & (hs[..., 1] > 80)).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool) & (yg < 1000)
GAIN = [(iw_[..., c][okm].mean(), max(1e-3, iw_[..., c][okm].std()), aw[..., c][okm].mean(), aw[..., c][okm].std()) for c in range(3)]
def cmatch(x):
    o = x[..., :3].copy()
    for c, (bm, bs, am, as_) in enumerate(GAIN): o[..., c] = (o[..., c] - bm) / bs * as_ + am
    return np.clip(o, 0, 255)

# ---------------- source: the sharp painted near water, straightened along the painted core ----------------
RC = K['river_center_axis']; cax = np.array(RC['c']); core = lambda t: np.interp(t, RC['t0'] + RC['dt'] * np.arange(len(cax)), cax)
T0S, T1S = 1.0, 3.4
ts = T0S + (np.arange(int((T1S - T0S) * PX)) + 0.5) / PX; us = (np.arange(int(2 * HWD * PX)) + 0.5) / PX - HWD
TS, US = np.meshgrid(ts, us, indexing='ij'); LATS = US + core(ts)[:, None]
srcA = sample(isoB, TS, LATS, IW / W, IH / H); xs, ys, _ = project(world(TS, LATS))
valid = (srcA[..., 3] > 235) & (np.abs(LATS) < HWD - 0.01) & (xs * IW / W > 2) & (xs * IW / W < IW - 3) & (ys * IH / H < IH - 3)
src = cmatch(srcA)
# hue: the isolated art is a little greener than the approved near water: quantile-match the blue / cyan hues (as bake_river35)
def hsv8(x): return cv2.cvtColor(x.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_RGB2HSV).reshape(-1, 3).astype(np.float32)
ah = hsv8(aw[okm]); ah = ah[(ah[:, 1] > 60) & (ah[:, 0] >= 85) & (ah[:, 0] <= 125)]
th = hsv8(src); sb = (th[:, 1] > 40) & (th[:, 0] >= 85) & (th[:, 0] <= 125)
qs = np.linspace(0, 100, 101); th[sb, 0] = np.interp(th[sb, 0], np.percentile(th[sb, 0], qs), np.percentile(ah[:, 0], qs))
th[sb, 1] = np.clip(th[sb, 1] * np.median(ah[:, 1]) / max(1.0, np.median(th[sb, 1])), 0, 255)
src = cv2.cvtColor(th.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_HSV2RGB).reshape(src.shape).astype(np.float32)
# labels (soft): cyan / blue water, pink water, white foam (large white areas only: sparkles and streaks stay "water")
def labels(img):
    h = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32); H_, S_, V_ = h[..., 0], h[..., 1], h[..., 2]
    pink = ((H_ >= 135) | (H_ <= 5)) & (S_ > 70); white = (S_ < 60) & (V_ > 200)
    white = cv2.morphologyEx(white.astype(np.uint8), cv2.MORPH_OPEN, np.ones((15, 15), np.uint8)).astype(bool)
    cyan = ~pink & ~white
    L = np.dstack([cyan, pink, white]).astype(np.float32)
    return cv2.GaussianBlur(L, (0, 0), 10)
srcL = labels(src)
print('source', src.shape, 'valid %.2f' % valid.mean(), 'label shares cyan %.2f pink %.2f foam %.2f' % tuple(srcL[valid].mean(0)))
Image.fromarray(np.where(valid[..., None], src, 0).astype(np.uint8)[::-1]).save(os.path.join(out, 'river36_source.png'))

# ---------------- the river section: the painted near water in ONE piece per bend (no patches, no seams across the streaks) ----------------
# The painted near water (t 1.0-3.4) is one bend of the painting's river: cyan core, pink band on the outer (right) side of the bend.
# Each half period of the world river (P / 2 = one bend) gets one copy of it, stretched along the flow only (x P/2 / 2.4 = 1.3: the
# streaks run along the flow, so this keeps them crisp), mirrored left-right for the bends that turn the other way, so the pink band is
# always on the outer side as painted. Copies join with 0.45 u cross-fades along the flow. Columns outside the painted rows' own lateral
# range are reflected back inside them (the pink band continues to the floor edge; the foam domes stand there).
NV = int(round(P * PX)); NUo = int(round(2 * UMAX * PX)); uu = (np.arange(NUo) + 0.5) / PX - UMAX
Hs = src.shape[0]
lo = np.array([us[np.nonzero(v)[0].min()] if v.any() else -HWD for v in valid]) + 0.01      # each source row's valid lateral range
hi = np.array([us[np.nonzero(v)[0].max()] if v.any() else HWD for v in valid]) - 0.01
WB = 0.16                                                                   # width of the outermost painted band that is continued outward
def src_rows(rows_f, u, mirror):
    """sample the straightened source at fractional rows (len n) and lateral u (len m); mirror = flip left-right. Beyond a row's painted
    lateral range the OUTERMOST painted band (WB wide) is repeated outward by translation (two taps half a band apart, cross-faded, so
    there is no seam and no mirror image: mirroring made pink 'eye' shapes)"""
    r = np.clip(np.round(rows_f).astype(int), 0, Hs - 1); U = (-u if mirror else u)[None, :].repeat(len(r), 0)
    L0, L1 = lo[r][:, None], hi[r][:, None]
    def fold(off):
        d0 = np.mod(L0 - U + off, WB); d1 = np.mod(U - L1 + off, WB)
        return np.where(U < L0, L0 + d0, np.where(U > L1, L1 - d1, U)), np.where(U < L0, d0, np.where(U > L1, d1, WB / 2))
    def samp(Uq):
        col = (Uq + HWD) * PX - 0.5
        return np.dstack([cv2.remap(src[..., c].astype(np.float32), col.astype(np.float32), np.repeat(rows_f[:, None].astype(np.float32), len(u), 1),
                                    cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT) for c in range(3)])
    Ua, da = fold(0.0); Ub, db = fold(WB / 2)
    wa = 1 - np.abs(da / WB * 2 - 1); wb = 1 - np.abs(db / WB * 2 - 1)            # triangle weights: each tap fades out at its own seam
    inside = (U >= L0) & (U <= L1)
    wa = np.where(inside, 1.0, wa); wb = np.where(inside, 0.0, wb)
    return (samp(Ua) * wa[..., None] + samp(Ub) * wb[..., None]) / np.maximum(wa + wb, 1e-6)[..., None]
vv = (np.arange(NV) + 0.5) / PX; tw = TA + vv
c1 = np.gradient(core(tw), vv); c2 = np.gradient(c1, vv)
HALF = P / 2; XF = 0.45
# copies are centred on the river's apexes (v = 0, P/2, P ...: the core is periodic from its left-most apex at TA). The source (painted
# rows t 1.0-3.4) is centred on the painting's own apex at t ~2.4, where the core is furthest LEFT (curvature > 0) and the pink band is
# on the right = outer side. Apexes curving the other way (curvature < 0) get the mirrored copy.
cm = core(tw).mean(); bend = [float(core(TA + k * HALF) - cm) for k in range(2)]   # < 0: a left-most apex (curving like the source), > 0: right-most
mirror_k = [b > 0 for b in bend]
print('apex offsets from the mean core:', [round(b, 3) for b in bend], 'mirror', mirror_k)
river = np.zeros((NV, NUo, 3), np.float32); wsum = np.zeros((NV, 1, 1), np.float32)
for k in range(0, 3):                                                      # apex 2 = apex 0 of the next period: the wrap is continuous
    v0 = (k - 0.5) * HALF - XF / 2; v1 = (k + 0.5) * HALF + XF / 2        # copy k is centred on apex k, incl. the cross-fade margins
    sel = (vv >= v0) & (vv <= v1)
    if not sel.any(): continue
    vk = vv[sel] - v0; rows_f = vk / (v1 - v0) * (Hs - 1)
    w = np.clip(np.minimum(vk, (v1 - v0) - vk) / XF, 0, 1); w = w * w * (3 - 2 * w)
    if k in (0, 2): w = np.where((k == 0) & (vv[sel] < XF) | (k == 2) & (vv[sel] > P - XF), 1.0, w)   # period ends: no fade (continuous wrap)
    img = src_rows(rows_f, uu, mirror_k[k % 2])
    river[sel] += img * w[:, None, None]; wsum[sel] += w[:, None, None]
# periodic wrap: copies -1 and 2 are the neighbours across the period ends
river = river / np.maximum(wsum, 1e-6)
river = np.clip(river, 0, 255).astype(np.uint8)
Image.fromarray(river[::-1]).save(os.path.join(out, 'river36.png'))  # row 0 = far end of the period (texture v = 1 at the top)
K = json.load(open(os.path.join(out, 'kit.json'))); K['river36'] = {'ta': TA, 'P': P, 'umax': UMAX, 'px': PX, 'src_t': [T0S, T1S], 'mirror': mirror_k}
json.dump(K, open(os.path.join(out, 'kit.json'), 'w'), indent=1)
print('river36.png', river.shape)
