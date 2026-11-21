"""Bake the Screen 05 tunnel kit textures from the ORIGINAL approved pixels (round 33). No AI, no repainting: every texel is a
bilinear sample of references/05_flow_into_the_current.png at the place where the kit surface lands in the approved camera view
(through the same depth curve the game uses). Only where Benny / coins / star / HUD cover the scenery does the round-32 clean plate
(same picture with those removed, pixel-aligned: median difference 1-3 levels elsewhere) fill in.
  python3 -I bake_kit.py <outdir>
Writes wall.png (periodic: one ring-to-ring section, all copies share it), ring.png (front face + inner face of a gold ring),
river.png (the water surface, log-spaced along the tunnel), kit.json (geometry for kit05.html), and coverage maps for the report."""
import sys, json, numpy as np, cv2
from PIL import Image
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from kit_model import *

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
ref = np.array(Image.open(os.path.join(REPO, 'references/05_flow_into_the_current.png')).convert('RGB')).astype(np.float32)
cln = np.array(Image.open(os.path.join(REPO, 'qa/worldlabs/05/r32/input_05_clean.png')).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)
cover_obj = cv2.dilate((np.abs(ref - cln).mean(2) > 30).astype(np.uint8), np.ones((9, 9), np.uint8))   # Benny, splash, coins, star
cover = cover_obj.copy(); cover[:205] = 1                            # + HUD bar and title (and the repainted rows behind them)
src = np.where(cover[..., None] > 0, cln, ref)                        # original pixels, clean plate only under Benny / coins / HUD
srcm = cv2.GaussianBlur(src, (0, 0), 0.6)                             # tiny pre-blur against aliasing in the farther samples

def sample(x, y):
    return cv2.remap(srcm, x.astype(np.float32), y.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

TH0, TH1 = np.radians(-50), np.radians(230)                          # wall above the water: sin(theta) > -HW/RT (-45.6 .. 225.6 deg)
RINGS = range(-2, 40)

def hidden_by_ring(t):
    """wall at axial t (seen from the start camera, approx. on the axis) is behind a gold ring band"""
    gt = g(t); h = np.zeros(t.shape, bool)
    for j in RINGS:
        tj = ring_t(j)
        if tj <= 0.05: continue
        gj = g(tj); h |= (t > tj) & (gt <= gj * RT / RING_IN)
    return h

def best_of(copies, P_of, extra_ok=None):
    """for every texel take the copy seen largest (nearest) in the approved picture where it is visible"""
    shp = None; best_d = None; best_x = best_y = None
    for c in copies:
        P = P_of(c); x, y, z = project(P)
        ok = (z > 0.05) & (x >= 1) & (x < W - 2) & (y >= 1) & (y < H - 2) & (height_above_water(P) > -0.005)
        if extra_ok is not None: ok &= extra_ok(c, P)
        cov = cover[np.clip(y, 0, H - 1).astype(int), np.clip(x, 0, W - 1).astype(int)] > 0
        d = np.where(ok, g(np.asarray(P) @ A) * np.where(cov, 4.0, 1.0), np.inf)   # original pixels first; the clean plate only as last resort
        if best_d is None: best_d, best_x, best_y = d, x, y
        else:
            m = d < best_d; best_d = np.where(m, d, best_d); best_x = np.where(m, x, best_x); best_y = np.where(m, y, best_y)
    return best_x, best_y, np.isfinite(best_d), best_d

# ---------------- wall: periodic tile, theta x one ring spacing ----------------
TW, TH_ = 2048, 1024
th = np.linspace(TH0, TH1, TW)[None, :].repeat(TH_, 0)
u = (np.arange(TH_)[:, None] + 0.5) / TH_ * S * np.ones((1, TW))      # 0 .. S behind the ring's front face
def wall_P(k): return wall_point(th, ring_t(k) + u)
wx, wy, wok, wd = best_of(range(1, 12), wall_P, lambda k, P: ~hidden_by_ring(np.asarray(P) @ A))
wall = sample(wx, wy); wall[~wok] = 0
# texels never visible (e.g. low on the walls, behind foam): fill from the neighbours along the tunnel / around it
fill = (~wok).astype(np.uint8)
wall8 = np.clip(wall, 0, 255).astype(np.uint8)
if fill.any(): wall8 = cv2.inpaint(wall8, fill, 5, cv2.INPAINT_TELEA)
Image.fromarray(wall8).save(os.path.join(out, 'wall.png'))
src_k = np.zeros(wok.shape, np.uint8)
for k in range(1, 12):
    x, y, z = project(wall_P(k)); src_k[np.isclose(wx, x) & wok] = k
Image.fromarray((src_k * 20).astype(np.uint8)).save(os.path.join(out, 'wall_sourcecopy.png'))
print('wall: visible texels', round(float(wok.mean()), 3), 'copies used', np.bincount(src_k[wok].ravel(), minlength=12)[1:].tolist())

# ---------------- gold ring: v 0..0.5 front face (outer -> inner), 0.5..1 inner face (front -> back) ----------------
RW_, RH_ = 2048, 160
thr = np.linspace(TH0, TH1, RW_)[None, :].repeat(RH_, 0)
v = (np.arange(RH_)[:, None] + 0.5) / RH_ * np.ones((1, RW_))
def ring_P(k):
    front = v < 0.5; rad = np.where(front, RT - (RT - RING_IN) * (v / 0.5), RING_IN); tt = ring_t(k) + np.where(front, 0.0, (v - 0.5) / 0.5 * RING_W)
    return wall_point(thr, tt, 1.0) * 0 + A0 + tt[..., None] * A + rad[..., None] * (np.cos(thr)[..., None] * RR + np.sin(thr)[..., None] * NUP)
rx, ry, rok, rd = best_of(range(1, 12), ring_P)
ring = sample(rx, ry); ring8 = np.clip(ring, 0, 255).astype(np.uint8)
if (~rok).any(): ring8 = cv2.inpaint(ring8, (~rok).astype(np.uint8), 5, cv2.INPAINT_TELEA)
Image.fromarray(ring8).save(os.path.join(out, 'ring.png'))
print('ring: visible texels', round(float(rok.mean()), 3))

# ---------------- water surface (river + foam banks), not periodic: lateral x log-spaced axial t ----------------
HWD = float(np.sqrt(RT ** 2 - HW ** 2)); T0, T1 = 0.25, 60.0
VW, VH = 1024, 4096
lat = np.linspace(-HWD, HWD, VW)[None, :].repeat(VH, 0)
tv = T0 * (T1 / T0) ** ((np.arange(VH)[:, None] + 0.5) / VH) * np.ones((1, VW))
Pw = A0 + tv[..., None] * A + lat[..., None] * RR - HW * NUP
x, y, z = project(Pw); ok = (z > 0.05) & (x >= 0) & (x < W - 1) & (y >= 0) & (y < H - 1)
xc, yc = np.clip(x, 0, W - 1), np.clip(y, 0, H - 1)
# the water comes ONLY from the original pixels; where Benny / his splash / coins / the star cover it, the painted streaks are continued
# along the flow (linear between the last visible texel before and the first after, per column = per lateral position)
water = cv2.remap(cv2.GaussianBlur(ref, (0, 0), 0.6), xc.astype(np.float32), yc.astype(np.float32), cv2.INTER_LINEAR)
vis = ok & (cover_obj[yc.astype(int), xc.astype(int)] == 0)
# the hidden spots are filled from the user's ORIGINAL isolated Screen 05 water artwork (same design, no Benny / coins), sampled at the
# same kit water coordinates and colour-matched (per channel mean / spread over the commonly visible water), feathered over ~8 texels
iso = np.array(Image.open(os.path.join(REPO, 'references/water/05_water_isolated_original.png')).convert('RGBA').resize((W, H), Image.LANCZOS)).astype(np.float32)
isoW = cv2.remap(cv2.GaussianBlur(iso, (0, 0), 0.6), xc.astype(np.float32), yc.astype(np.float32), cv2.INTER_LINEAR)
both = vis & (isoW[..., 3] > 200) & (tv < 4.0)
isoC = isoW[..., :3].copy()
for ch in range(3):
    a, b = water[..., ch][both], isoW[..., ch][both]; isoC[..., ch] = (isoC[..., ch] - b.mean()) / max(1e-3, b.std()) * a.std() + a.mean()
fillw = cv2.GaussianBlur((~vis).astype(np.float32), (0, 0), 4.0); fillw = np.maximum(fillw, (~vis).astype(np.float32))
water = water * (1 - fillw[..., None]) + isoC * fillw[..., None]
rows = np.arange(VH); hole = isoW[..., 3] <= 200
for c in range(VW):                                        # where even the water artwork has no water (outside its river), continue along the flow
    v = ~(hole[:, c] & ~vis[:, c])
    if v.all() or not v.any(): continue
    for ch in range(3): water[~v, c, ch] = np.interp(rows[~v], rows[v], water[v, c, ch])
water8 = np.clip(water, 0, 255).astype(np.uint8)
Image.fromarray((vis * 255).astype(np.uint8)[::-1]).save(os.path.join(out, 'river_visible.png'))
Image.fromarray(water8[::-1]).save(os.path.join(out, 'river.png'))      # row 0 = far end (texture v = 1 at the top)
print('water: visible texels', round(float(ok.mean()), 3), 'half width', round(HWD, 3))

kit = export(); kit.update({'TH0': TH0, 'TH1': TH1, 'water': {'T0': T0, 'T1': T1, 'HWD': HWD}, 'textures': ['wall.png', 'ring.png', 'river.png'],
            'benny_start_px': [432, 1180], 'fov': SC['cam']['fov'], 'cam_fwd': F.tolist(), 'cam_up': U.tolist()})
json.dump(kit, open(os.path.join(out, 'kit.json'), 'w'), indent=1)
print('wrote', out)

# ---------------- per-section OWN pixels (round 33b): exact painting at the start, cross-faded to the sharp tile as Benny approaches ----
from PIL import Image as _I
tileW = np.array(_I.open(os.path.join(out, 'wall.png'))).astype(np.float32); tileR = np.array(_I.open(os.path.join(out, 'ring.png'))).astype(np.float32)
srcO = ref                                   # own pixels: no pre-blur (the atlas rows oversample the painting 2-3x)
def own_atlas(kind, ks, heights, tile, param):
    rows, meta, y0 = [], {}, 0
    for k, hh in zip(ks, heights):
        a = np.linspace(TH0, TH1, tile.shape[1])[None, :].repeat(hh, 0); b = (np.arange(hh)[:, None] + 0.5) / hh * np.ones((1, tile.shape[1]))
        Pk = param(k, a, b); x, y, z = project(Pk)
        ok = (z > 0.05) & (x >= 1) & (x < W - 2) & (y >= 1) & (y < H - 2) & (height_above_water(Pk) > -0.005)
        ok &= cover[np.clip(y, 0, H - 1).astype(int), np.clip(x, 0, W - 1).astype(int)] == 0
        if kind == 'wall': ok &= ~hidden_by_ring(np.asarray(Pk) @ A)
        ownpx = cv2.remap(srcO, x.astype(np.float32), y.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        base = cv2.resize(tile, (tile.shape[1], hh), interpolation=cv2.INTER_AREA)
        wgt = cv2.GaussianBlur(ok.astype(np.float32), (0, 0), 1.5) * ok          # feather the own/tile border
        rows.append(ownpx * wgt[..., None] + base * (1 - wgt[..., None])); meta[k] = [y0, y0 + hh, round(float(ok.mean()), 3)]; y0 += hh
    at = np.concatenate(rows, 0); pad = int(2 ** np.ceil(np.log2(at.shape[0]))) - at.shape[0]
    at = np.concatenate([at, np.zeros((pad, at.shape[1], 3), np.float32)], 0)
    _I.fromarray(np.clip(at, 0, 255).astype(np.uint8)).save(os.path.join(out, f'{kind}_own.png'))
    return {'h': at.shape[0], 'rows': meta}
wall_own = own_atlas('wall', range(0, 8), [512, 512, 256, 192, 128, 96, 64, 64], tileW, lambda k, a, b: wall_point(a, ring_t(k) + b * S))
def ring_param(k, a, b):
    front = b < 0.5; rad = np.where(front, RT - (RT - RING_IN) * (b / 0.5), RING_IN); tt = ring_t(k) + np.where(front, 0.0, (b - 0.5) / 0.5 * RING_W)
    return A0 + tt[..., None] * A + rad[..., None] * (np.cos(a)[..., None] * RR + np.sin(a)[..., None] * NUP)
ring_own = own_atlas('ring', range(1, 10), [160, 160, 96, 64, 48, 32, 32, 32, 32], tileR, ring_param)
kit = json.load(open(os.path.join(out, 'kit.json'))); kit['own'] = {'wall': wall_own, 'ring': ring_own, 'fade': [0.55, 0.85]}
json.dump(kit, open(os.path.join(out, 'kit.json'), 'w'), indent=1)
print('own pixels: wall', {k: v[2] for k, v in wall_own['rows'].items()}, 'ring', {k: v[2] for k, v in ring_own['rows'].items()})

# ---------------- flowing river tile (round 33c): seamless, full-width open water only (the foam banks are on the lower walls) ----------
# A = the user's isolated water art, B = the approved water (+ its water-art fill), both over the kit water rows where the water art covers
# the FULL width; cycle = A, B, A reversed, B reversed, each join cross-faded -> period 4 x (t1 - t0), no stretched texels.
cov = (isoW[..., 3] > 200).mean(1)                                   # full-width coverage per log row
okr = np.nonzero((cov > 0.985) & (tv[:, 0] > 0.9))[0]; r0 = okr[0]; r1 = r0
while r1 + 1 < VH and cov[r1 + 1] > 0.985: r1 += 1                  # first unbroken full-width run only (near water, crisp)
RT0 = float(tv[r0, 0]); RT1 = float(tv[r1, 0])
seg_n = 384                                                          # rows per segment (linear in t)
def strip(srcimg):
    ts = RT0 + (np.arange(seg_n) + 0.5) / seg_n * (RT1 - RT0); rf = np.log(ts / T0) / np.log(T1 / T0) * VH - 0.5
    return np.stack([cv2.remap(srcimg[..., ch].astype(np.float32), np.tile(np.arange(VW, dtype=np.float32), (seg_n, 1)),
                                np.repeat(rf.astype(np.float32)[:, None], VW, 1), cv2.INTER_LINEAR) for ch in range(3)], -1)
SA, SB = strip(isoC), strip(water)
parts = [SA, SB, SA[::-1], SB[::-1]]; X = seg_n // 4
wv = ((np.arange(X) + 0.5) / X)[:, None, None]
tile = parts[0]
for nxt in parts[1:]:                                                # overlapping joins: blend X rows, the next part continues after them
    tile = np.concatenate([tile[:-X], (1 - wv) * tile[-X:] + wv * nxt[:X], nxt[X:]], 0)
tile = np.concatenate([(1 - wv) * tile[-X:] + wv * tile[:X], tile[X:-X]], 0)   # cyclic: the end flows into the start
NR = tile.shape[0]; L_TILE = (RT1 - RT0) * NR / seg_n
# colour (round 33e): put the flowing tile's cyans and pinks ON the painting's own cyan / pink (median hue + saturation of the APPROVED
# visible water), keeping every detail; a Lab CDF match tried first made the cyan greener and paler (colour look 0.70 -> 0.41)
def hsv_of(x): return cv2.cvtColor(np.clip(x, 0, 255).astype(np.uint8).reshape(-1, 1, 3), cv2.COLOR_RGB2HSV).reshape(-1, 3).astype(np.float32)
ap = hsv_of(water[vis & (tv > 0.9) & (tv < 8.0)]); th_ = hsv_of(tile)
CY = lambda h: (h >= 80) & (h <= 110); PK = lambda h: (h >= 140) & (h <= 170)       # OpenCV hue units (0-180)
for cls in (CY, PK):
    ma, mt = cls(ap[:, 0]) & (ap[:, 1] > 120), cls(th_[:, 0]) & (th_[:, 1] > 60)
    if ma.sum() < 100 or mt.sum() < 100: continue
    dh = np.median(ap[ma, 0]) - np.median(th_[mt, 0]); ks = np.median(ap[ma, 1]) / max(1.0, np.median(th_[mt, 1]))
    sel = cls(th_[:, 0]); th_[sel, 0] = np.clip(th_[sel, 0] + dh, 0, 179); th_[sel, 1] = np.clip(th_[sel, 1] * ks, 0, 255)
    print('colour class: hue shift %.1f (x2 deg), saturation x%.2f' % (dh, ks))
tile = cv2.cvtColor(th_.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_HSV2RGB).reshape(tile.shape).astype(np.float32)
Image.fromarray(np.clip(tile[::-1], 0, 255).astype(np.uint8)).save(os.path.join(out, 'river_tile.png'))   # row 0 = far end
kit = json.load(open(os.path.join(out, 'kit.json'))); kit['river_tile'] = {'t0': RT0, 'L': L_TILE, 'painted_until': 14.0, 'painted_fade': 6.0}
json.dump(kit, open(os.path.join(out, 'kit.json'), 'w'), indent=1); print('river tile', tile.shape, 'source rows t', round(RT0, 3), '..', round(RT1, 3), 'period', round(L_TILE, 3))

# ---------------- built level for the acceptance test (track.json in the game folder) ----------------
LEVEL = 32.16; bdir = cam_dir(432, 1180); B0 = bdir * (-CAM_H / (bdir @ NUP)); tB0 = float(B0 @ A)
sec = lambda tb: int(np.floor((tb - ring_t(0)) / S)); k0 = sec(tB0)
trk = {'trail_s': [round(x, 4) for x in np.arange(0, LEVEL + 1e-9, 0.05).tolist()] + ([LEVEL] if abs(np.arange(0, LEVEL + 1e-9, 0.05)[-1] - LEVEL) > 1e-6 else []),
       'N': sec(tB0 + LEVEL) - k0 + 1, 'kit': {'tB0': tB0, 'ring0': float(ring_t(0)), 'k0': k0}}
json.dump(trk, open(os.path.join(out, 'track.json'), 'w')); print('track.json: path end', trk['trail_s'][-1], 'sections', trk['N'], 'Benny axial start', round(tB0, 3), 'first section', k0)
kit = json.load(open(os.path.join(out, 'kit.json'))); kit['level'] = trk['kit']; json.dump(kit, open(os.path.join(out, 'kit.json'), 'w'), indent=1)
