"""Rainbow round 47 - ONE continuous river material for a kit screen (user: "the detailed painted water ahead has a visible boundary where it
meets the simpler striped water beneath Benny ... make the river read as one continuous body of water").
Why the old water had a boundary: two overlapping water surfaces (the drum-floor pool + a raised route ribbon that started abruptly in front of
Benny), each with its own camera-projected bake that only lines up from the picture camera and that switched to generated water wherever it was
magnified. This builds instead ONE texture in the river's own flow space - lat = sideways distance from Benny's route (metres), d = distance
along the route - that every water surface samples the same way (world.html / water_ribbon.js `stripWater`):
  1. RECTIFY the approved picture's clean plate into (lat, d) with the fitted picture camera, using exactly the shader's inverse mapping
     (z = route z at d, x = route x(z) + lat * sqrt(1 + slope^2)); keep only floor water (not Benny's guessed fill, HUD, gold, painted foam).
  2. DENSITY: how many picture pixels each strip texel gets; where the painting is too coarse for a close view (far ahead, foreshortened along
     the flow), the texel's alpha asks the shader for painted DETAIL (step 4) - smoothly, so no edge appears.
  3. CONTINUATION: a seamless loop ('tile') of the painted river cut from the stretch just ahead of Benny; the core strip cross-fades into it
     before the painted stretch and far ahead, the shader repeats it beyond the core -> the same painted river everywhere, no switch.
  4. DETAIL: the high-frequency part (white streaks, sparkles, arcs) of the sharpest painted water (the bottom of the picture, beside Benny),
     rectified at high density and made seamless - a luminance / highlight modulation the shader adds where alpha asks for it.
  5. FOAM: painted foam texels are replaced by the outer water; the foam's inner edge per d is measured and written to strip.json so the game
     places real 3D foam heaps along the actual river edges (world.html).
  python3 -I tools/screenkit/water_strip.py <game dir with layout.json, plate_0.png, mask_0.png> <out dir (baked/)>
Outputs: strip_core.png (RGBA: rgb = water colour, a = detail weight), strip_tile.png (RGB, periodic along d), strip_detail.png (RGB detail,
periodic both ways), strip.json (ranges, foam edges, stats), strip_debug.jpg."""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter, binary_opening, binary_closing, binary_dilation, uniform_filter1d

G, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
L = json.load(open(os.path.join(G, 'layout.json'))); CAM = L['cams'][0]; D = L['drum']; SC = L.get('water_strip', {})
plate = np.asarray(Image.open(os.path.join(G, CAM.get('plate', 'plate_0.png'))).convert('RGB'), np.float32) / 255.0
mask = np.asarray(Image.open(os.path.join(G, CAM.get('mask', 'mask_0.png'))).convert('L'))
Hp, Wp = plate.shape[:2]; K = Wp / CAM['img'][0]; F = CAM['focal_px'] * K; CX, CY = Wp / 2.0, Hp / 2.0
yaw, pitch = CAM['yaw'], CAM['pitch']; cy, sy, cp, sp = math.cos(yaw), math.sin(yaw), math.cos(pitch), math.sin(pitch)
Rm = np.array([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]]) @ np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]]); C = np.array(CAM['pos'], float)
HUD = (L.get('hud_rows', 205) + 10) * K
WY = D.get('pool_y', -0.02); XA, CH = D['axis_x'], D['chord']

# ---- the route and the shader's mapping (identical maths: route x by z, slope over +-0.03 u, arc length by z) -------------------------------
P = np.array(L['route']['points'], float); ds = L['route']['ds']; dP = np.arange(len(P)) * ds
zr = P[:, 2]; assert np.all(np.diff(zr) < 0), 'route z must decrease along the route'
zA, zB = zr[0], zr[-1]   # start (largest z) and end
def rx(z): return np.interp(z, zr[::-1], P[::-1, 0])
def slope(z): return (rx(z + 0.03) - rx(z - 0.03)) / 0.06
def z_of_d(d):   # arc length -> z, straight extensions beyond the ends (the shader's d_of_z inverse)
    return np.where(d < 0, zA - d, np.where(d > dP[-1], zB - (d - dP[-1]), np.interp(d, dP, zr)))
def world(lat, d):
    z = z_of_d(d); sl = slope(z); return np.stack([rx(z) + lat * np.sqrt(1 + sl * sl), np.full_like(z, WY), z], -1)
def project(Pw):
    q = (Pw - C) @ Rm; depth = -q[..., 2]
    return CX + F * q[..., 0] / np.maximum(depth, 1e-6), CY - F * q[..., 1] / np.maximum(depth, 1e-6), depth

# ---- 1. rectify the painted floor water -------------------------------------------------------------------------------------------------
LAT = SC.get('lat', 1.45); NL = SC.get('nl', 768); PXU = SC.get('px_per_u', 96); D0, D1 = SC.get('d0', -3.0), SC.get('d1', 28.0)
lat = np.linspace(-LAT, LAT, NL); dd = D0 + np.arange(int((D1 - D0) * PXU)) / PXU; NDv = len(dd)
LG, DG = np.meshgrid(lat, dd)                                   # rows = d, cols = lat
Pw = world(LG, DG); px, py, dep = project(Pw)
def sample(img, x, y, order=1):
    if img.ndim == 2: return map_coordinates(img.astype(np.float32), [y, x], order=order, mode='nearest')
    return np.stack([map_coordinates(img[..., c], [y, x], order=order, mode='nearest') for c in range(img.shape[2])], -1)
rgb = sample(plate, px, py); mk = sample(mask, px, py, order=0)
inside = (dep > 0.05) & (px >= 0) & (px <= Wp - 1) & (py >= HUD) & (py <= Hp - 1)
onfloor = np.abs(Pw[..., 0] - XA) < CH - 0.03
# colour classes on the plate itself (HSV-ish): gold / copper (rings, coins, trays), painted foam (white-lavender clumps, not thin streaks)
mx, mn = rgb.max(-1), rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-4); R_, G_, B_ = rgb[..., 0], rgb[..., 1], rgb[..., 2]
gold = (R_ > 0.45) & (R_ > B_ * 1.5) & (G_ > R_ * 0.35)
foam_raw = (mx > 0.78) & (sat < 0.28) & (B_ >= R_ * 0.92)
foam = binary_closing(binary_opening(foam_raw & inside, np.ones((5, 5))), np.ones((9, 9)))   # clumps, not the painting's thin white streaks
valid = inside & onfloor & (mk < 200) & ~gold & ~foam
# ---- 2. picture density: picture pixels per strip texel (along d / along lat) -> detail weight -----------------------------------------------
gx_d = np.gradient(px, axis=0); gy_d = np.gradient(py, axis=0); gx_l = np.gradient(px, axis=1); gy_l = np.gradient(py, axis=1)
f_d = np.hypot(gx_d, gy_d); f_l = np.hypot(gx_l, gy_l)          # picture pixels per texel
need = np.clip((1.0 / np.maximum(np.minimum(f_d, f_l), 1e-3) - 1.3) / 2.5, 0, 1)   # 0 = painting is sharp enough here, 1 = add full detail

# ---- 5 (first): painted foam -> outer water; the foam's inner edge per d ---------------------------------------------------------------------
def inner_edges(fm, ok):
    """per row: the lat where foam starts on each side (scanning outward from the centre); NaN where unknown"""
    left = np.full(fm.shape[0], np.nan); right = np.full(fm.shape[0], np.nan); c = NL // 2
    for i in range(fm.shape[0]):
        r = fm[i]; o = ok[i]
        if o[c - int(0.55 * NL / (2 * LAT)):c + int(0.55 * NL / (2 * LAT))].mean() < 0.5: continue   # need the river centre in view
        jr = np.nonzero(r[c:])[0]; jl = np.nonzero(r[:c][::-1])[0]
        if len(jr): right[i] = lat[c + jr[0]]
        if len(jl): left[i] = lat[c - 1 - jl[0]]
    return left, right
fe_l, fe_r = inner_edges(foam & onfloor, inside & onfloor)

def fill_rows(img, ok):
    """invalid texels: copy, per row, the nearest valid texel toward the river centre (outer water continues outward), then a light blur"""
    out = img.copy(); c = NL // 2
    for i in range(img.shape[0]):
        o = ok[i]
        if not o.any(): continue
        idx = np.nonzero(o)[0]
        for side in (1, -1):
            rng = range(c, NL) if side > 0 else range(c - 1, -1, -1); last = None
            for j in rng:
                if o[j]: last = j
                elif last is not None: out[i, j] = img[i, last]
            if last is None:   # nothing valid on this side of the centre: nearest valid texel overall
                for j in rng: out[i, j] = img[i, idx[np.argmin(np.abs(idx - j))]]
    return out

# ---- 3. the continuation tile: the painted river just ahead of Benny, made periodic along d ----------------------------------------------------
dB = float(L['cams'][0].get('s_ref', 1.2)) + L['benny'].get('ahead', 0.0)
T0, TL = SC.get('tile_d0', dB + 0.9), SC.get('tile_len', 3.2); OV = SC.get('tile_overlap', 0.9)
i0, i1, io = int((T0 - D0) * PXU), int((T0 + TL - D0) * PXU), int(OV * PXU)
win = fill_rows(rgb, valid)[i0 - io:i1]                          # the window + an overlap before it
tile = win[io:].copy(); w = (np.arange(io) / io)[:, None, None]   # last io rows of the tile blend into the rows before its start -> loops
tile[-io:] = tile[-io:] * (1 - w) + win[:io] * w
tile_need = need[i0:i1].mean()

# ---- 4. detail: the sharpest painted water (bottom of the picture beside Benny) as a seamless high-frequency tile -----------------------------
DL, DD = SC.get('det_lat', 0.5), SC.get('det_len', 0.42); DPX = SC.get('det_px_per_u', 512)
dl = np.linspace(0, DL, int(DL * DPX), endpoint=False); dz = np.linspace(0, DD, int(DD * DPX), endpoint=False)
cands = []
for side in (-1, 1):
    for l0 in np.arange(0.3, 0.95, 0.05):
        for d0 in np.arange(0.7, dB + 1.6, 0.05):
            LGd, DGd = np.meshgrid(side * (l0 + dl), d0 + dz); x_, y_, dp_ = project(world(LGd, DGd))
            if dp_.min() < 0.05 or x_.min() < 0 or x_.max() > Wp - 1 or y_.max() > Hp - 1 or y_.min() < HUD: continue
            m_ = sample(mask, x_, y_, order=0)
            if (m_ >= 200).mean() > 0.03: continue
            c_ = sample(plate, x_, y_); g_ = (c_[..., 0] > 0.45) & (c_[..., 0] > c_[..., 2] * 1.5)
            if g_.mean() > 0.03: continue
            f_ = np.hypot(np.gradient(x_, axis=0), np.gradient(y_, axis=0)).mean()
            cands.append((f_, side, l0, d0, c_))
if not cands: raise SystemExit('no clean detail source found')
cands.sort(key=lambda t: -t[0]); fbest, sside, sl0, sd0, src = cands[0]
lum = src @ np.array([0.299, 0.587, 0.114], np.float32); low = gaussian_filter(lum, 6, mode='wrap')
hp = lum - low                                                     # high-pass luminance (streaks, sparkles, arcs)
def make_periodic(a, ov=0.25):
    h, w_ = a.shape; oh, ow = int(h * ov), int(w_ * ov); b = a.copy()
    t = (np.arange(oh) / oh)[:, None]; b[-oh:] = a[-oh:] * (1 - t) + a[:oh] * t
    t = (np.arange(ow) / ow)[None, :]; c = b.copy(); c[:, -ow:] = b[:, -ow:] * (1 - t) + b[:, :ow] * t; return c
hp = make_periodic(hp); hp = hp / (np.abs(hp).max() + 1e-6)
det = np.stack([np.clip(0.5 + 0.5 * hp, 0, 1)] * 3, -1)        # 0.5 = no change

# ---- compose the core strip: painted where valid, the tile where not, cross-faded far ahead into the tile -------------------------------------
filled = fill_rows(rgb, valid)
tile_at = lambda dvals: tile[((dvals - T0) * PXU).astype(int) % tile.shape[0]]
TROW = tile_at(dd)                                                 # (NDv, NL, 3)
rowvalid = valid[:, np.abs(lat) < 0.9].mean(1)                     # how much of the river (|lat| < 0.9) is painted on this row
wp = np.clip((rowvalid - 0.35) / 0.3, 0, 1)
far0, far1 = SC.get('far_blend', [16.0, 22.0]); wp *= 1 - np.clip((dd - far0) / (far1 - far0), 0, 1)
wp = uniform_filter1d(wp, int(0.6 * PXU), mode='nearest')          # no sudden change along the flow
texw = gaussian_filter(valid.astype(np.float32), 2.0) * wp[:, None]
core = filled * texw[..., None] + TROW * (1 - texw[..., None])
alpha = need * texw + tile_need * (1 - texw)
# pure painted-foam rows in the tile were replaced already (fill_rows on the window); a last mild smoothing ACROSS the flow only at fills
core = np.clip(core, 0, 1)

# ---- outputs ------------------------------------------------------------------------------------------------------------------------------
Image.fromarray(np.dstack([(core * 255).round().astype(np.uint8), (np.clip(alpha, 0, 1) * 255).round().astype(np.uint8)]), 'RGBA').save(os.path.join(OUT, 'strip_core.png'))
Image.fromarray((np.clip(tile, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(OUT, 'strip_tile.png'))
Image.fromarray((det * 255).round().astype(np.uint8)).save(os.path.join(OUT, 'strip_detail.png'))
# foam edges along d (every 0.1 u): measured on the painting, else the tile's average edge; never inside Benny's reach (|lat| >= 0.62)
def smooth_nan(a, n):
    ok = ~np.isnan(a); v = np.where(ok, a, 0.0); wv = uniform_filter1d(ok.astype(float), n, mode='nearest'); return np.where(wv > 0.05, uniform_filter1d(v, n, mode='nearest') / np.maximum(wv, 1e-6), np.nan)
el, er = smooth_nan(fe_l, int(0.8 * PXU)), smooth_nan(fe_r, int(0.8 * PXU))
tl_l = np.nanmedian(el[i0:i1]) if np.isfinite(el[i0:i1]).any() else -0.85; tl_r = np.nanmedian(er[i0:i1]) if np.isfinite(er[i0:i1]).any() else 0.85
el = np.where(np.isnan(el), tl_l, el); er = np.where(np.isnan(er), tl_r, er)
step = int(0.1 * PXU); fd = dd[::step]
edges = {'d': fd.round(3).tolist(), 'left': np.minimum(el[::step], -0.62).round(3).tolist(), 'right': np.maximum(er[::step], 0.62).round(3).tolist(),
         'tile_left': round(float(min(tl_l, -0.62)), 3), 'tile_right': round(float(max(tl_r, 0.62)), 3)}
meta = {'lat': LAT, 'nl': NL, 'px_per_u': PXU, 'd0': D0, 'd1': float(dd[-1] + 1 / PXU), 'tile_d0': T0, 'tile_len': TL, 'det_lat': DL, 'det_len': DD,
        'route_z': [float(zA), float(zB)], 'route_len': float(dP[-1]), 'water_y': WY, 'detail_source': {'side': int(sside), 'lat0': round(float(sl0), 3), 'd0': round(float(sd0), 3), 'px_per_texel': round(float(fbest), 3)},
        'painted_rows': int((wp > 0.5).sum()), 'tile_detail_need': round(float(tile_need), 3), 'foam_edges': edges,
        'files': {'core': 'strip_core.png', 'tile': 'strip_tile.png', 'detail': 'strip_detail.png'}}
json.dump(meta, open(os.path.join(OUT, 'strip.json'), 'w'))
# debug sheet: core (alpha shown as a red tint), tile, validity
dbg = (core * 255).astype(np.uint8).copy(); dbg[..., 0] = np.maximum(dbg[..., 0], (alpha * 120).astype(np.uint8))
Image.fromarray(dbg).resize((NL // 2, NDv // 2)).save(os.path.join(OUT, 'strip_debug.jpg'), quality=85)
print(f"strip: {NDv} x {NL} texels, d {D0}..{D1}, painted rows {meta['painted_rows']}, tile d {T0:.2f}+{TL}, detail source {meta['detail_source']}, foam edges {tl_l:.2f} / {tl_r:.2f}")
