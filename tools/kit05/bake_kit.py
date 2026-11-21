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
rows = np.arange(VH)
for c in range(VW):
    v = vis[:, c]
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
