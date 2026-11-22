"""Reference-Locked 3D Scene Builder - step 3 (BAKE) for a ring-tunnel screen (Screen 05 first).

PHYSICAL version of tools/kit05/bake_kit.py: the tunnel is real, world-space geometry seen through a normal perspective camera
(NO camera-relative depth curve g(), no camera-facing planes). Every texel below is the APPROVED picture's own pixel at the place
where that physical surface lands in the approved (start) camera view - a one-time bake into world-anchored textures, never a live
projection. Only surfaces whose physical position agrees with the painting get their own pixels (`own_until` in the screen config);
farther sections use one shared section tile cut from the near, high-resolution sections.

  python3 -I tools/reflock/bake_phys.py <screen config json> <outdir>

Writes (outdir): wall_own.png / ring_own.png (per-section atlases, own pixels feathered into the shared tile), wall_tile.png,
ring_tile.png (shared sections), paddle_own.png (the painted gold lifters on the 3D paddles), river_own.png (the painted water on the
physical river surface, linear in t), phys.json (geometry + atlas rows for reflock.html) and bake_report.json (coverage numbers).
"""
import sys, os, json
import numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
CFG = json.load(open(sys.argv[1])); OUT = sys.argv[2]; os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(REPO, CFG['camera_model']['module_dir']))
import kit_model as km                                   # fitted camera + tunnel frame of this screen (VP, ring 2, axis, water)
km.g = lambda z: np.asarray(z, float)                    # PHYSICAL: plain perspective, no depth curve (remap() looks g up at call time)
W, H, A, A0, RR, NUP, RT = km.W, km.H, km.A, km.A0, km.RR, km.NUP, km.RT
T = CFG['tunnel']; RING_IN, RING_W = T['ring_in'], T['ring_w']
S = T['spacing']; T_RING0 = T['ring0_t']                  # ring k at t = T_RING0 + k * S (uniform, world-fixed)
def ring_t(k): return T_RING0 + k * S
TH0, TH1 = np.radians(T['theta_deg'][0]), np.radians(T['theta_deg'][1])
project = km.project; wall_point = km.wall_point; height_above_water = km.height_above_water

ref = np.array(Image.open(os.path.join(REPO, CFG['reference'])).convert('RGB')).astype(np.float32)
cln = np.array(Image.open(os.path.join(REPO, CFG['clean_plate'])).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)
cover = cv2.dilate((np.abs(ref - cln).mean(2) > 30).astype(np.uint8), np.ones((9, 9), np.uint8))   # Benny, splash, coins, star, bubbles
cover[:CFG['hud_cover_rows']] = 1                                                                 # HUD bar + title
hsv = cv2.cvtColor(np.clip(ref, 0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
gold = ((hsv[..., 0] >= 5) & (hsv[..., 0] <= 32) & (hsv[..., 1] > 80) & (hsv[..., 2] > 90)).astype(np.uint8)
gold = cv2.dilate(gold, np.ones((5, 5), np.uint8))          # gold paddles / ring bands: never wall pixels
rep = {}

def px_ok(x, y, z, P, extra=None):
    ok = (z > 0.05) & (x >= 1) & (x < W - 2) & (y >= 1) & (y < H - 2) & (height_above_water(P) > -0.005)
    yi, xi = np.clip(y, 0, H - 1).astype(int), np.clip(x, 0, W - 1).astype(int)
    ok &= cover[yi, xi] == 0
    if extra is not None: ok &= extra
    return ok

def sample(img, x, y):
    return cv2.remap(img, x.astype(np.float32), y.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def behind_ring(P):
    """wall point P is hidden from the start camera by a gold ring band (physical: same projected annulus test)"""
    t = np.asarray(P) @ A; h = np.zeros(t.shape, bool)
    for j in range(0, T['n_rings']):
        tj = ring_t(j)
        if tj <= 0.05: continue
        h |= (t > tj) & (t <= tj * RT / RING_IN)
    return h

def paddle_place(k):
    """(t_off, [theta per side]) of the paddles of section k (painted placement for the sections the picture shows)"""
    o = CFG['paddles'].get('by_section', {}).get(str(k), {})
    return o.get('t_off', CFG['paddles']['t_off']), o.get('theta_rad', CFG['paddles']['theta_rad'])

def paddle_mask_world(P):
    """wall point P lies under a 3D paddle footprint (those pixels belong to the paddle, not the wall)"""
    t = np.asarray(P) @ A - (A0 @ A); d = np.asarray(P) - A0[None, None, :] - t[..., None] * A[None, None, :]
    th = np.arctan2(d @ NUP, d @ RR); m = np.zeros(t.shape, bool); PD = CFG['paddles']
    for k in range(PD['k0'], T['n_rings'] - 1):
        toff, ths = paddle_place(k); t1 = ring_t(k) + toff * S
        for thc in ths:
            m |= (t >= t1 - 0.02) & (t <= t1 + PD['length'] + 0.02) & (np.abs(np.angle(np.exp(1j * (th - thc)))) <= PD['half_width_rad'] + 0.03)
    return m

# ---------------- shared wall tile: best (nearest) copy among the sections that agree with the painting ----------------
TW, THt = 2048, 1024
th = np.linspace(TH0, TH1, TW)[None, :].repeat(THt, 0)
u = (np.arange(THt)[:, None] + 0.5) / THt * S * np.ones((1, TW))
best = np.full(th.shape, np.inf); bx = np.zeros(th.shape); by = np.zeros(th.shape)
for k in CFG['tile_sections']:
    P = wall_point(th, ring_t(k) + u); x, y, z = project(P)
    yi, xi = np.clip(y, 0, H - 1).astype(int), np.clip(x, 0, W - 1).astype(int)
    ok = px_ok(x, y, z, P, ~behind_ring(P)) & (gold[yi, xi] == 0) & ~paddle_mask_world(P)
    d = np.where(ok, z, np.inf); m = d < best; best[m] = d[m]; bx[m] = x[m]; by[m] = y[m]
wok = np.isfinite(best); wall = sample(cv2.GaussianBlur(ref, (0, 0), 0.6), bx, by)
# fill the texels never seen cleanly (paddle footprints, Benny, the water line) from the SAME tile rotated around the tunnel:
# the painted slot rows run around the circumference, so a texel 40-120 degrees away carries the same pattern (no smeared inpaint)
fill_ok = wok.copy(); deg = TW / np.degrees(TH1 - TH0)
for sh in [40, -40, 80, -80, 120, -120, 160, -160]:
    s = int(round(sh * deg)); src_ok = np.roll(fill_ok, s, 1) & ~fill_ok
    if s > 0: src_ok[:, :s] = False
    else: src_ok[:, s:] = False
    wall[src_ok] = np.roll(wall, s, 1)[src_ok]; fill_ok |= src_ok
wall8 = np.clip(wall, 0, 255).astype(np.uint8)
if (~fill_ok).any(): wall8 = cv2.inpaint(wall8, (~fill_ok).astype(np.uint8), 5, cv2.INPAINT_TELEA)
# (the section boundary needs no blend: it lies behind the gold ring band that starts every section)
Image.fromarray(wall8).save(os.path.join(OUT, 'wall_tile.png'))
rep['wall_tile'] = {'seen_clean': round(float(wok.mean()), 3), 'filled_by_rotation': round(float((fill_ok & ~wok).mean()), 3)}

# ---------------- shared ring tile (front face outer->inner, then inner face front->back) ----------------
RWt, RHt = 2048, 160
thr = np.linspace(TH0, TH1, RWt)[None, :].repeat(RHt, 0); v = (np.arange(RHt)[:, None] + 0.5) / RHt * np.ones((1, RWt))
def ring_P(k, a=thr, b=v):
    front = b < 0.5; rad = np.where(front, RT - (RT - RING_IN) * (b / 0.5), RING_IN); tt = ring_t(k) + np.where(front, 0.0, (b - 0.5) / 0.5 * RING_W)
    return A0 + tt[..., None] * A + rad[..., None] * (np.cos(a)[..., None] * RR + np.sin(a)[..., None] * NUP)
best = np.full(thr.shape, np.inf); rx = np.zeros(thr.shape); ry = np.zeros(thr.shape)
for k in CFG['ring_tile_rings']:
    P = ring_P(k); x, y, z = project(P); ok = px_ok(x, y, z, P); d = np.where(ok, z, np.inf); m = d < best; best[m] = d[m]; rx[m] = x[m]; ry[m] = y[m]
rok = np.isfinite(best); ring = sample(cv2.GaussianBlur(ref, (0, 0), 0.6), rx, ry); ring8 = np.clip(ring, 0, 255).astype(np.uint8)
if (~rok).any(): ring8 = cv2.inpaint(ring8, (~rok).astype(np.uint8), 5, cv2.INPAINT_TELEA)
Image.fromarray(ring8).save(os.path.join(OUT, 'ring_tile.png')); rep['ring_tile'] = {'seen': round(float(rok.mean()), 3)}

# ---------------- own-pixel atlases: each near section keeps the painting's pixels where it lands; feathered into the tile ----------------
def own_atlas(kind, ks, heights, tile, param, extra_fn=None):
    rows, meta, y0 = [], {}, 0
    for k, hh in zip(ks, heights):
        a = np.linspace(TH0, TH1, tile.shape[1])[None, :].repeat(hh, 0); b = (np.arange(hh)[:, None] + 0.5) / hh * np.ones((1, tile.shape[1]))
        P = param(k, a, b); x, y, z = project(P); ok = px_ok(x, y, z, P, None if extra_fn is None else extra_fn(P, x, y))
        own = sample(ref, x, y); base = cv2.resize(tile.astype(np.float32), (tile.shape[1], hh), interpolation=cv2.INTER_AREA)
        wgt = cv2.GaussianBlur(ok.astype(np.float32), (0, 0), 1.5) * ok
        rows.append(own * wgt[..., None] + base * (1 - wgt[..., None])); meta[str(k)] = [y0, y0 + hh, round(float(ok.mean()), 3)]; y0 += hh
    at = np.concatenate(rows, 0); pad = int(2 ** np.ceil(np.log2(at.shape[0]))) - at.shape[0]
    at = np.concatenate([at, np.zeros((pad, at.shape[1], 3), np.float32)], 0)
    Image.fromarray(np.clip(at, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f'{kind}_own.png'))
    return {'h': int(at.shape[0]), 'rows': meta}
tileW = np.array(Image.open(os.path.join(OUT, 'wall_tile.png'))).astype(np.float32); tileR = ring8.astype(np.float32)
def wall_extra(P, x, y):
    yi, xi = np.clip(y, 0, H - 1).astype(int), np.clip(x, 0, W - 1).astype(int)
    return ~behind_ring(P) & (gold[yi, xi] == 0) & ~paddle_mask_world(P)
OW = CFG['own']
wall_own = own_atlas('wall', OW['wall_sections'], OW['wall_rows'], tileW, lambda k, a, b: wall_point(a, ring_t(k) + b * S), wall_extra)
ring_own = own_atlas('ring', OW['rings'], OW['ring_rows'], tileR, lambda k, a, b: ring_P(k, a, b))
rep['own'] = {'wall': {k: v[2] for k, v in wall_own['rows'].items()}, 'ring': {k: v[2] for k, v in ring_own['rows'].items()}}

# ---------------- 3D paddles: the painted gold lifters baked onto the paddle surfaces (top face back->front, then the front lip) ----------------
PD = CFG['paddles']
def paddle_P(k, thc, a, b):
    t1 = ring_t(k) + paddle_place(k)[0] * S; dth = PD['half_width_rad']; thv = thc + (a - 0.5) * 2 * dth
    ext = np.sqrt(np.maximum(0, 1 - (2 * a - 1) ** 2)); rIn = RT - (RT - PD['r_inner']) * (0.55 + 0.45 * np.sqrt(ext))
    top = b < 0.7; f = np.where(top, b / 0.7, (b - 0.7) / 0.3)
    tt = np.where(top, t1 + PD['length'] * (1 - f), t1); rr = np.where(top, rIn, rIn + (RT - rIn) * f)
    return A0 + tt[..., None] * A + rr[..., None] * (np.cos(thv)[..., None] * RR + np.sin(thv)[..., None] * NUP)
PW_, PH_ = 256, 256; pa = (np.arange(PW_)[None, :] + 0.5) / PW_ * np.ones((PH_, 1)); pb = (np.arange(PH_)[:, None] + 0.5) / PH_ * np.ones((1, PW_))
prow, pmeta = [], {}
for k in PD['own_sections']:
    for j, thc in enumerate(paddle_place(k)[1]):
        P = paddle_P(k, thc, pa, pb); x, y, z = project(P); ok = px_ok(x, y, z, P)
        own = sample(ref, x, y); pmeta[f'{k}_{j}'] = [len(prow), round(float(ok.mean()), 3)]
        prow.append(np.where(ok[..., None], own, np.nan))
# texels not seen (back of the far paddles) take the mean painted gold of that paddle
pal = []
for r in prow:
    m = np.isfinite(r[..., 0]); mean = np.nanmean(r.reshape(-1, 3)[m.ravel()], 0) if m.any() else np.array([230, 150, 60.])
    r2 = r.copy(); r2[~m] = mean; pal.append(r2)
Image.fromarray(np.clip(np.concatenate(pal, 1), 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'paddle_own.png'))
rep['paddles'] = pmeta

# ---------------- the painted water on the PHYSICAL river surface (world place, linear in t; for the near water only) ----------------
RV = CFG['river_own']; HWD = float(np.sqrt(RT ** 2 - km.HW ** 2))
VW, VH = 1024, 2048
lat = np.linspace(-HWD, HWD, VW)[None, :].repeat(VH, 0); tv = (RV['t0'] + (np.arange(VH)[:, None] + 0.5) / VH * (RV['t1'] - RV['t0'])) * np.ones((1, VW))
Pw = A0 + tv[..., None] * A + lat[..., None] * RR - km.HW * NUP
x, y, z = project(Pw); vis = (z > 0.05) & (x >= 0) & (x < W - 1) & (y >= 0) & (y < H - 1)
yi, xi = np.clip(y, 0, H - 1).astype(int), np.clip(x, 0, W - 1).astype(int); vis &= (gold[yi, xi] == 0)
src = np.where(cover[..., None] > 0, cln, ref)            # under Benny / coins: the clean plate's water
water = sample(cv2.GaussianBlur(src, (0, 0), 0.6), np.clip(x, 0, W - 1), np.clip(y, 0, H - 1))
alpha = cv2.GaussianBlur(vis.astype(np.float32), (0, 0), 3.0) * vis
out = np.concatenate([np.clip(water, 0, 255), (alpha * 255)[..., None]], 2).astype(np.uint8)
Image.fromarray(out[::-1]).save(os.path.join(OUT, 'river_own.png'))   # row 0 = far end
rep['river_own'] = {'visible': round(float(vis.mean()), 3), 't0': RV['t0'], 't1': RV['t1']}

phys = km.export(); phys.update({'TH0': float(TH0), 'TH1': float(TH1), 'S': S, 'ring0_t': T_RING0, 'n_rings': T['n_rings'], 'RING_IN': RING_IN, 'RING_W': RING_W,
    'HWD': HWD, 'fov': km.SC['cam']['fov'], 'cam_fwd': km.F.tolist(), 'cam_up': km.U.tolist(), 'benny_start_px': CFG['benny_start_px'],
    'own': {'wall': wall_own, 'ring': ring_own, 'paddle': {'n': len(prow), 'map': pmeta}}, 'river_own': RV, 'paddles': PD})
json.dump(phys, open(os.path.join(OUT, 'phys.json'), 'w'), indent=1)
json.dump(rep, open(os.path.join(OUT, 'bake_report.json'), 'w'), indent=1)
print(json.dumps(rep))
