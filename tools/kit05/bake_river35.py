"""Round 35 (lead): the Screen 05 river = the user's OWN painted river, laid on the kit water in its world place and repeated every
three ring sections (no AI, no procedural pink bands).

Why: the round-34 ribbon tile (straightened water art + hue-shifted pink + procedural foam edges) showed blocky pink chevrons, a
horizontal seam grid and a uniform blue sheet once Benny swam past the painted start view. Measured on the user's isolated water art
(references/water/05_water_isolated_original.png) cast onto the kit water (top-down, world units): the painted river is ONE S-river
whose cyan core swings -0.21 (t 2.4) -> +0.255 (t 4.25) -> -0.40 (t 8.4) -> +0.23 (t 10.7) - i.e. it repeats about every 6.0-6.45 u
= 3 ring sections (3 S = 6.276). Rows t 2.4 and t 2.4 + 3 S look alike (pink mostly right, foam on the right bank).

Texture river35.png (RGB, rows: prefix t 0.6 .. TA (native, sharp) + one period TA .. TA + P; saved far-end-first like river.png):
  * every texel = the isolated art (colour-matched to the APPROVED water) sampled where that world point lands in the approved view
    (through kit_model.project, i.e. the same depth curve as the game)
  * the period is closed with a lateral drift (its end row is shifted so its cyan core lines up with the start) + a 0.8 u cross-fade
  * far painted rows are low-resolution (t 8: 150 px/u across, 22 px/u along vs 600 / 220 near): the SHARP painted streaks of the near
    rows (t 1.4-3.5), straightened along the river core and re-bent along the period's core, are added as luminance high-pass detail
    where the painting is softer than the texture grid (detail transfer; the painted colours / layout stay the painting's).
kit.json gets "river35" (layout) and new river_center / river_center_axis (the same periodic core line: Benny's path, lanes, coins).
  python3 -I bake_river35.py <kit dir>      (run after bake_kit.py; setup_kit.sh does)"""
import sys, os, json, numpy as np, cv2
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit_model import *

out = sys.argv[1]
HWD = float(np.sqrt(RT ** 2 - HW ** 2))
P = 3 * S                      # period: three ring sections (measured painted river period 6.0-6.45 u)
TA = 2.40                      # period start (cyan core at its left swing, foam on the right bank) - best matching rows TA / TA + P
T_PRE = 0.60                   # prefix start (behind Benny's painted start the camera never looks)
NU = 768                       # lateral texels over [-HWD, HWD]  (549 px per world unit)
PX_V = 245.0                   # texels per world unit along the river
X_SEAM = 0.8                   # cross-fade length at the period seam (world units)

iso = np.array(Image.open(os.path.join(REPO, 'references/water/05_water_isolated_original.png')).convert('RGBA')).astype(np.float32)
ref = np.array(Image.open(os.path.join(REPO, 'references/05_flow_into_the_current.png')).convert('RGB')).astype(np.float32)
IH, IW = iso.shape[:2]
isoB = cv2.GaussianBlur(iso, (0, 0), 0.5)

def world(t, lat):
    return A0 + np.asarray(t)[..., None] * A + np.asarray(lat)[..., None] * RR - HW * NUP

def reflect(lat):
    """lateral positions beyond the floor edge are mirrored back inside (pink edge bands stay at the edge, never clamped bars)"""
    L = 2 * HWD; x = np.mod(lat + HWD, 2 * L); return np.where(x > L, 2 * L - x, x) - HWD

def sample_iso(t, lat):
    x, y, _ = project(world(t, reflect(lat)))
    return cv2.remap(isoB, (x * IW / W).astype(np.float32), (y * IH / H).astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

# ---- colour match: isolated art -> the APPROVED water (per channel mean / spread where both show river, coins / Benny excluded) ----
tg = np.linspace(1.3, 9.0, 600); lg = np.linspace(-HWD, HWD, 500); TG, LG = np.meshgrid(tg, lg, indexing='ij')
xg, yg, _ = project(world(TG, LG))
aw = cv2.remap(ref, xg.astype(np.float32), yg.astype(np.float32), cv2.INTER_LINEAR)
iw_ = sample_iso(TG, LG)
hsv = cv2.cvtColor(np.clip(aw, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
goldish = (hsv[..., 0] >= 8) & (hsv[..., 0] <= 38) & (hsv[..., 1] > 80)
benny = (yg > 1000)                                                        # the painted Benny + splash sit in the lowest rows
okm = (iw_[..., 3] > 220) & ~cv2.dilate(goldish.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool) & ~benny
GAIN = [];
for ch in range(3):
    a, b = aw[..., ch][okm], iw_[..., ch][okm]; GAIN.append((b.mean(), max(1e-3, b.std()), a.mean(), a.std()))
def cmatch(img):
    o = img[..., :3].copy()
    for ch, (bm, bs, am, as_) in enumerate(GAIN): o[..., ch] = (o[..., ch] - bm) / bs * as_ + am
    return o
print('colour match (iso mean/std -> approved):', [tuple(round(float(v), 1) for v in g) for g in GAIN])

# ---- the painted river core c_p(t): centroid of the cyan water per row (top-down), smoothed ----
tc = np.arange(0.5, 12.0, 0.02); lc = np.linspace(-HWD, HWD, 600); TC, LC = np.meshgrid(tc, lc, indexing='ij')
td = cmatch(sample_iso(TC, LC)); td = cv2.GaussianBlur(td, (0, 0), 4)
hh = cv2.cvtColor(np.clip(td, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
cy = ((hh[..., 0] >= 85) & (hh[..., 0] <= 110) & (hh[..., 1] > 110)).astype(np.float32)
cp_raw = (cy * lc[None, :]).sum(1) / np.maximum(cy.sum(1), 1)
k = np.exp(-0.5 * (np.arange(-40, 41) * 0.02 / 0.22) ** 2); k /= k.sum()
cp = np.convolve(np.pad(cp_raw, 40, mode='edge'), k, mode='valid')
c_p = lambda t: np.interp(t, tc, cp)
DRIFT = float(c_p(TA + P) - c_p(TA))
print('painted core: c(TA)=%.3f c(TA+P)=%.3f drift %.3f  P %.3f' % (c_p(TA), c_p(TA + P), DRIFT, P))

# ---- the texture: prefix (t T_PRE..TA) + period (phi 0..P) ----
NPRE = int(round((TA - T_PRE) * PX_V)); NV = int(round(P * PX_V)); lat = np.linspace(-HWD, HWD, NU)
tpre = T_PRE + (np.arange(NPRE) + 0.5) / NPRE * (TA - T_PRE)
phi = (np.arange(NV) + 0.5) / NV * P
dr = DRIFT * phi / P                                                       # lateral drift that closes the period
def rows(tt, shift):
    """isolated-art texels, colour-matched; where the art is transparent (beyond its foam banks = the wall in the painting) the foam
    is continued by inpainting from the nearest painted foam (white-lavender puffs), never left black"""
    T_, L_ = np.meshgrid(tt, lat, indexing='ij'); s = sample_iso(T_, L_ + shift[:, None]); rgb = cmatch(s); a = s[..., 3] / 255.0
    # beyond the painted foam bank the isolated art is transparent: in the approved picture that is more foam (the bank runs up to the
    # wall), so it becomes soft white-lavender foam (a little darker deeper in, like the painted puffs' shading), never smeared water
    if (a < 0.99).any():
        dist = cv2.distanceTransform((a < 0.5).astype(np.uint8), cv2.DIST_L2, 5)
        shade = np.clip(dist / 60.0, 0, 1)[..., None]
        foam = np.array([238, 234, 252], np.float32) * (1 - shade) + np.array([206, 196, 236], np.float32) * shade
        rgb = rgb * a[..., None] + foam * (1 - a[..., None])
    # texels whose world point falls OUTSIDE the painting (its left / right picture edge cuts the floor near the walls at t ~3.5-5.5)
    # would be mirror images of the picture border (V-chevrons): continue them along the flow from the nearest painted rows instead
    x, y, _ = project(world(T_, reflect(L_ + shift[:, None]))); off = (x < 1) | (x > W - 2) | (y < 1) | (y > H - 2)
    if off.any():
        r_ = np.arange(off.shape[0])
        for c in np.nonzero(off.any(0))[0]:
            v = ~off[:, c]
            if not v.any(): continue
            for ch in range(3): rgb[~v, c, ch] = np.interp(r_[~v], r_[v], rgb[v, c, ch])
        print('  off-picture texels continued along the flow: %.1f %%' % (100 * off.mean()))
    return rgb
pre = rows(tpre, np.zeros(NPRE))
per = rows(TA + phi, dr)
wsm = (phi > P - X_SEAM); w = np.zeros(NV); w[wsm] = (phi[wsm] - (P - X_SEAM)) / X_SEAM; w = w * w * (3 - 2 * w)
per2 = rows(TA + phi[wsm] - P, dr[wsm] - DRIFT)                           # the rows before TA, lined up with the drifted end
per[wsm] = per[wsm] * (1 - w[wsm, None, None]) + per2 * w[wsm, None, None]
c_win = c_p(TA + phi) - dr                                                 # the period's core line (texture coordinates)
c_win[wsm] = c_win[wsm] * (1 - w[wsm]) + (c_p(TA + phi[wsm] - P) - dr[wsm] + DRIFT) * w[wsm]

# ---- detail transfer: sharp near streaks (t 1.4..1.4+S), straightened along the core, re-bent along the period's core ----
LD = S                                                                     # one ring section -> exactly 3 repeats per period
td0 = 1.40; ND = int(round(LD * PX_V)); X = int(0.25 * PX_V)              # ND rows = one period of the detail, X = cross-fade rows
tdv = td0 + (np.arange(ND + X) + 0.5) / ND * LD                             # sampled X rows longer than one period
TD, LD_ = np.meshgrid(tdv, lat, indexing='ij'); D = cmatch(sample_iso(TD, LD_ + c_p(tdv)[:, None] - c_p(td0)))
SIG = float(os.environ.get('R35_SIG', 7.0))   # band split: colours / layout above ~0.03 u from the painting itself, streaks below it
Dl = D @ np.array([0.299, 0.587, 0.114]); HPs = Dl - cv2.GaussianBlur(Dl, (0, 0), SIG)
ww = ((np.arange(X) + 0.5) / X)[:, None]                                    # periodic: the first X rows fade in from the rows after the end
HP = HPs[:ND].copy(); HP[:X] = HPs[:X] * ww + HPs[ND:ND + X] * (1 - ww)
def detail_at(phi_rows, core):
    v = (np.mod(phi_rows, LD) / LD * ND)[:, None].repeat(NU, 1)
    u = (reflect(lat[None, :] - core[:, None] + c_p(td0)) + HWD) / (2 * HWD) * (NU - 1)
    return cv2.remap(HP.astype(np.float32), u.astype(np.float32), v.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
# how much softer than the texture grid each painted row is (lateral px per world unit in the isolated art vs NU / 2HWD)
def softness(tt):
    x0, y0, _ = project(world(tt, np.zeros_like(tt))); x1, y1, _ = project(world(tt, np.full_like(tt, 0.05)))
    nat = np.hypot(x1 - x0, y1 - y0) * IW / W / 0.05; return np.clip(1 - nat / (NU / (2 * HWD)), 0, 1)
GK, GP = float(os.environ.get('R35_GAIN', 1.6)), float(os.environ.get('R35_POW', 0.6))
# where the painted row is softer than the texture grid, the GAME adds the sharp painted streaks live (river35_detail.png, streaming with the
# current, near the camera only); the per-row weight goes into the texture's alpha. The texture itself stays the painting's own pixels.
w_per = np.clip(softness(TA + phi) ** GP * GK, 0, 1); w_pre = np.clip(softness(tpre) ** GP * GK, 0, 1)
c_pre = c_p(tpre)
g_per = w_per
# the detail strip: luminance high-pass of the sharp near rows, straightened along the core (u = lateral - core + c_p(td0)), periodic
# along the river with length LD (= one ring section); stored as 128 + 1.0 x detail (8-bit grey)
Image.fromarray(np.clip(128 + HP[::-1], 0, 255).astype(np.uint8)).save(os.path.join(out, 'river35_detail.png'))
tex = np.clip(np.concatenate([pre, per], 0), 0, 255).astype(np.uint8)
# hue: the isolated art's water is a little greener-cyan than the APPROVED picture's azure water (measured: hue 95-100 = 32 % of the
# saturated texels vs 19 % in the approved water). Quantile-match the hue of the blue / cyan texels (OpenCV hue 85-125) and their
# saturation to the approved NEAR water's (t < 3.2, coins / Benny excluded; the painting's farther water is ~6 deg greener); pinks, purples and the white foam are left exactly as painted.
def hsv8(x): return cv2.cvtColor(x.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_RGB2HSV).reshape(-1, 3).astype(np.float32)
ah = hsv8(np.clip(aw[okm & (TG < 3.2)], 0, 255));   # the NEAR painted water (what fills the screen while swimming)
ah = ah[(ah[:, 1] > 60) & (ah[:, 0] >= 85) & (ah[:, 0] <= 125)]
th = hsv8(tex); selb = (th[:, 1] > 40) & (th[:, 0] >= 85) & (th[:, 0] <= 125)
qs = np.linspace(0, 100, 101); srcq = np.percentile(th[selb, 0], qs); dstq = np.percentile(ah[:, 0], qs)
hm = np.interp(th[selb, 0], srcq, dstq); edge = np.clip(np.minimum(th[selb, 0] - 85, 125 - th[selb, 0]) / 5.0, 0, 1)
th[selb, 0] = th[selb, 0] + (hm - th[selb, 0]) * edge
th[selb, 1] = np.clip(th[selb, 1] * np.median(ah[:, 1]) / max(1.0, np.median(th[selb, 1])), 0, 255)
tex = cv2.cvtColor(th.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_HSV2RGB).reshape(tex.shape)
print('hue match (blue/cyan texels): median hue %.1f -> %.1f' % (np.median(srcq), np.median(dstq)))
alpha = (np.concatenate([w_pre, w_per])[:, None].repeat(NU, 1) * 255).astype(np.uint8)
Image.fromarray(np.dstack([tex, alpha])[::-1], 'RGBA').save(os.path.join(out, 'river35.png'))
print('river35.png', tex.shape, 'prefix rows', NPRE, 'period rows', NV, 'detail gain far/near', round(float(g_per.max()), 2), round(float(g_per.min()), 2))

# ---- the river core line for the game: painted core up to TA, then the periodic (drift-closed) core; Benny starts on it ----
def core(t):
    t = np.asarray(t, float); ph = np.mod(t - TA, P)
    cper = np.interp(ph, phi, c_win, period=P)
    return np.where(t < TA, c_p(np.maximum(t, 0.5)), cper)
kit = json.load(open(os.path.join(out, 'kit.json')))
DS = 0.05; ss = np.arange(0, 60.0 + 1e-9, DS); tt = np.arange(0, 95.0 + 1e-9, DS)
# Benny's LANE CENTRE line: the painted river core, except (1) he starts at his painted spot (0.1 right of the cyan core there) and
# eases onto the core over the first 1.8 u (value and slope 0 at the start = the approved start frame), and (2) it is held 0.27 u
# from the tunnel axis (soft knee) so his outer lane + body stay on the water at the sharpest painted bends (core reaches 0.31 there)
LANE_LIM, LANE_KNEE = 0.27, 0.2
cB = core(TB0 + ss); m_ = np.abs(cB); cB = np.where(m_ > LANE_KNEE, np.sign(cB) * (LANE_KNEE + (LANE_LIM - LANE_KNEE) * np.tanh((m_ - LANE_KNEE) / (LANE_LIM - LANE_KNEE))), cB)
x_ = np.clip(ss / 1.8, 0, 1); cB = LATB0 + (cB - LATB0) * x_ * x_ * (3 - 2 * x_)
kit['river_center'] = {'ds': DS, 'c': [round(float(x), 4) for x in cB - LATB0], 'src': 'round35 painted core (bake_river35.py)'}
kit['river_center_axis'] = {'t0': 0.0, 'dt': DS, 'c': [round(float(x), 4) for x in core(tt)], 'lat_start': LATB0, 't_start': TB0}
kit['river35'] = {'t_pre': T_PRE, 'ta': TA, 'P': P, 'n_pre': NPRE, 'n_per': NV, 'hwd': HWD, 'drift': DRIFT, 'detail': {'L': LD, 'c0': float(c_p(td0))}}
json.dump(kit, open(os.path.join(out, 'kit.json'), 'w'), indent=1)
print('core range', round(float(core(tt).min()), 3), round(float(core(tt).max()), 3), 'Benny start lat', round(LATB0, 3))
