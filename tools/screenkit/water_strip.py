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
LAT = SC.get('lat', 1.45); NL = SC.get('nl', 768); PXU = SC.get('px_per_u', 80); D0 = SC.get('d0', -8.0); D1 = SC.get('d1', float(len(P) - 1) * L['route']['ds'] + 0.5)
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

# ---- painted foam: inner edge per d (scanning outward from the river centre) --------------------------------------------------------------------
def inner_edges(fm, ok):
    left = np.full(fm.shape[0], np.nan); right = np.full(fm.shape[0], np.nan); c = NL // 2; hw = int(0.55 * NL / (2 * LAT))
    for i in range(fm.shape[0]):
        if ok[i, c - hw:c + hw].mean() < 0.5: continue
        jr = np.nonzero(fm[i, c:])[0]; jl = np.nonzero(fm[i, :c][::-1])[0]
        if len(jr): right[i] = lat[c + jr[0]]
        if len(jl): left[i] = lat[c - 1 - jl[0]]
    return left, right
fe_l, fe_r = inner_edges(foam & onfloor, inside & onfloor)
dB = float(CAM.get('s_ref', 1.2)) + L['benny'].get('ahead', 0.0)   # Benny's painted water point along the route

# ---- 3. fill the unusable texels of the painted rows (Benny's guessed fill, gold, painted foam) smoothly: pull-push (no streaks) ------------------
def pullpush(img, w):
    """normalized-convolution pyramid fill: invalid texels take a smooth blend of the valid texels around them (all scales)"""
    levels = [(img * w[..., None], w.astype(np.float32))]
    while min(levels[-1][1].shape) > 4:
        a, b = levels[-1]; h, w_ = b.shape[0] // 2 * 2, b.shape[1] // 2 * 2
        a2 = a[:h, :w_].reshape(h // 2, 2, w_ // 2, 2, 3).sum((1, 3)); b2 = b[:h, :w_].reshape(h // 2, 2, w_ // 2, 2).sum((1, 3))
        levels.append((a2, b2))
    a, b = levels[-1]; cur = a / np.maximum(b, 1e-6)[..., None]
    for a, b in reversed(levels[:-1]):
        up = np.repeat(np.repeat(cur, 2, 0), 2, 1); up = np.pad(up, ((0, b.shape[0] - up.shape[0]), (0, b.shape[1] - up.shape[1]), (0, 0)), mode='edge')
        up = gaussian_filter(up, (1, 1, 0)); wb = np.clip(b, 0, 1)[..., None]; cur = a / np.maximum(b, 1e-6)[..., None] * wb + up * (1 - wb)
    return cur
filled = np.clip(pullpush(rgb, valid), 0, 1)

# ---- 4. the continuation: image QUILTING from the sharp painted stretch (d where the painting has >= ~1 picture px per texel along the flow) ----
# non-periodic: each new 0.8 u piece is the source window (or its mirror across the river) whose overlap matches best, joined by a minimum-error
# cut across the river - the same painted texture everywhere, no loop, no switch.
QS0, QS1 = SC.get('quilt_src', [dB + 0.95, dB + 3.25]); qa, qb = int((QS0 - D0) * PXU), int((QS1 - D0) * PXU)
SRC = filled[qa:qb]; SRC = np.concatenate([SRC, SRC[:, ::-1]], 0)            # + its mirror across the river (the river is near symmetric)
PH, PO = int(SC.get('quilt_patch', 0.8) * PXU), int(SC.get('quilt_overlap', 0.25) * PXU); rng = np.random.default_rng(47)
half = SRC.shape[0] // 2; cands = [j for j in range(0, half - PH)] + [half + j for j in range(0, half - PH)]
def mincut(e):   # e: (PO, NL) error -> per lat column the row where the new patch takes over (smooth seam across the river)
    E = e.copy(); back = np.zeros_like(E, dtype=np.int8)
    for i in range(1, E.shape[1]):
        prev = np.stack([np.r_[np.inf, E[:-1, i - 1]], E[:, i - 1], np.r_[E[1:, i - 1], np.inf]], 0); k = prev.argmin(0); back[:, i] = k - 1; E[:, i] += prev[k, np.arange(E.shape[0])]
    cut = np.zeros(E.shape[1], int); cut[-1] = int(E[:, -1].argmin())
    for i in range(E.shape[1] - 1, 0, -1): cut[i - 1] = cut[i] + back[cut[i], i]
    return np.clip(cut, 0, E.shape[0] - 1)
def quilt_forward(seed, n_rows):
    out = seed.copy(); recent = []
    while out.shape[0] < seed.shape[0] + n_rows:
        tail = out[-PO:]; errs = np.array([((SRC[j:j + PO, ::4] - tail[:, ::4]) ** 2).sum() for j in cands])
        order = [k for k in np.argsort(errs) if all(abs(cands[k] - r) > PH // 2 for r in recent)][:12] or list(np.argsort(errs)[:12])   # r47b: varied
        j = cands[int(rng.choice(order))]; patch = SRC[j:j + PH]; recent = (recent + [j])[-3:]
        cut = mincut(((patch[:PO] - tail) ** 2).sum(-1)); rows = np.arange(PO)[:, None]
        blend = np.where((rows < cut[None, :])[..., None], tail, patch[:PO]); blend = gaussian_filter(blend, (1.0, 0.0, 0.0))
        out = np.concatenate([out[:-PO], blend, patch[PO:]], 0)
    return out[seed.shape[0]:seed.shape[0] + n_rows]
P0, P1 = SC.get('painted', [0.8, dB + 3.25]); p0, p1 = int((P0 - D0) * PXU), int((P1 - D0) * PXU)
# Q = a whole synthesized painted river (quilted from the sharp stretch, seeded with the painted rows themselves so it joins them)
Q = filled.copy(); Q[p1:] = quilt_forward(filled[p1 - PO * 2:p1], NDv - p1); Q[:p0] = quilt_forward(filled[p0:p0 + PO * 2][::-1], p0)[::-1]
inner = quilt_forward(filled[qa:qa + PO * 2], p1 - p0)                       # texture for the holes INSIDE the painted stretch (Benny, foam, gold)
# curved flow: beyond the painted stretch the bands swing across the river like the painted ribbons (fades in, never inside the painted rows)
SA, SL = SC.get('swing', [0.22, 6.5]); fade = np.clip((dd - P1 - 0.5) / 3.0, 0, 1) + np.clip((P0 - 0.5 - dd) / 3.0, 0, 1)
shift = SA * np.sin(2 * np.pi * (dd - P1) / SL) * np.clip(fade, 0, 1) + 0.6 * SA * np.sin(2 * np.pi * (dd - P1) / (SL * 0.43) + 1.3) * np.clip(fade, 0, 1)
for i in np.nonzero(np.abs(shift) > 1e-4)[0]:
    for c in range(3): Q[i, :, c] = np.interp(lat - shift[i], lat, Q[i, :, c])
core = Q.copy()
# the painting's broad structure over the far stretch (low frequencies only, where the picture has them): the picture-camera view keeps its colours
LF1 = SC.get('lowfreq_until', 14.0); lf_rows = (dd > P1) & (dd < LF1)
rowok = valid[:, np.abs(lat) < 0.9].mean(1)
w_lf = np.clip((rowok - 0.3) / 0.3, 0, 1) * lf_rows * np.clip((LF1 - dd) / 3.0, 0, 1) * np.clip((dd - P1) / 0.6, 0, 1)
w_lf = uniform_filter1d(w_lf, int(0.5 * PXU), mode='nearest')
sig = (np.clip(2.0 / np.maximum(f_d[:, NL // 2], 1e-3), 2, 40), 6.0)
for i0_ in range(p1, min(NDv, int((LF1 - D0) * PXU)), 64):   # band-wise blur with the local picture resolution along d
    i1_ = min(NDv, i0_ + 64); sd = float(np.median(sig[0][i0_:i1_]))
    lo_p = gaussian_filter(filled, (sd, 6.0, 0))[i0_:i1_]; lo_q = gaussian_filter(core, (sd, 6.0, 0))[i0_:i1_]
    core[i0_:i1_] = np.clip(core[i0_:i1_] + (lo_p - lo_q) * w_lf[i0_:i1_, None, None], 0, 1)
# painted rows: the painting exactly where it is valid; in its holes the surrounding painted colours (smooth fill) + painted TEXTURE (quilt detail)
texw = gaussian_filter(valid.astype(np.float32), 1.5); keep = slice(p0, p1)
hole = filled[keep] + (inner - gaussian_filter(inner, (6, 6, 0)))
core[keep] = filled[keep] * texw[keep][..., None] + np.clip(hole, 0, 1) * (1 - texw[keep][..., None])
core = np.clip(core, 0, 1)

# ---- 5. foam: the painted foam banks' inner edges (medians over the painted stretch) -> real 3D foam heaps along the river edges (world.html) --
okr = (dd > 1.5) & (dd < 10)
def med(a):
    v = a[okr]; v = v[np.isfinite(v)]; return float(np.median(v)) if len(v) else np.nan
fl_, fr_ = med(fe_l), med(fe_r)
FL = min(fl_ if np.isfinite(fl_) else -0.85, -0.66); FR = max(fr_ if np.isfinite(fr_) else 0.85, 0.66)   # never inside Benny's reach (lanes +-0.3 + body)
# under / beyond the foam banks: plain outer water (the painting's soft cyan-lavender beside the foam), no wall-coloured smears
outer = np.median(filled[(dd > 1.5) & (dd < 4.5)][:, (np.abs(lat) > 0.6) & (np.abs(lat) < 0.75)].reshape(-1, 3), 0)
wo = np.clip((np.maximum(FL - 0.08 - lat, lat - FR - 0.08)) / 0.12, 0, 1)[None, :, None]
core = core * (1 - wo) + outer[None, None, :] * wo

# ---- outputs ------------------------------------------------------------------------------------------------------------------------------
Image.fromarray((core * 255).round().astype(np.uint8)).save(os.path.join(OUT, 'strip_core.jpg'), quality=93)
meta = {'lat': LAT, 'nl': NL, 'px_per_u': PXU, 'd0': D0, 'd1': float(dd[-1] + 1 / PXU), 'painted': [P0, P1], 'quilt_src': [QS0, QS1], 'lowfreq_until': LF1,
        'route_z': [float(zA), float(zB)], 'route_len': float(dP[-1]), 'water_y': WY, 'foam_edges': {'left': round(FL, 3), 'right': round(FR, 3), 'measured': [fl_, fr_]},
        'picture_px_per_texel_along_flow': {str(d): round(float(np.median(f_d[int((d - D0) * PXU), NL // 2 - 60:NL // 2 + 60])), 2) for d in (1, 2, 3, 4, 6, 8, 10, 14) if D0 < d < D1},
        'file': 'strip_core.jpg'}
json.dump(meta, open(os.path.join(OUT, 'strip.json'), 'w'), indent=1)
Image.fromarray((core * 255).astype(np.uint8)).resize((NL // 2, NDv // 2)).transpose(Image.FLIP_TOP_BOTTOM).save(os.path.join(OUT, 'strip_debug.jpg'), quality=85)
print(f"strip: {NDv} x {NL} texels, d {D0}..{meta['d1']:.2f}, painted d {P0}..{P1:.2f}, quilt source d {QS0:.2f}..{QS1:.2f}, foam edges {FL:.2f} / {FR:.2f} (measured {fl_:.2f} / {fr_:.2f})")
