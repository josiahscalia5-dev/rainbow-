"""Screen 04 round 9 `&m04mouth=1`: the approved GOLD WASHER OPENING as a texture for the modeled mouth ring.

The painted mouth ring (thick polished gold band, thin bright lips, a row of glowing bulbs along both lips, dark groove
below) is unwrapped from the approved pixels through the locked projector on the fitted mouth plane (z0, proj04.json),
STRAIGHTENED (the painted ring is not a perfect circle: every angle column is aligned to the centre's profile by
cross-correlation of its radial edges, the shift curve smoothed along the angle), cleaned of the foam / bubbles that
overlap its outer lip (inpainted along the ring) and made periodic (outside the painted arc the ring is mirrored).
The glowing bulbs are detected as the hot spots along the band (local brightness maxima) and written with their
(psi, rho) so the game can draw them as crisp glowing bulbs at any distance.

  python3 -I tools/match04/mouth04.py assets/textures/match04
writes tile_mouth.png (cols psi -pi..pi, rows rho RHO[0] (top) .. RHO[1]), mouth04.json (rows, bulbs, shift curve).
Source = plate04_hybrid_fal.png (approved pixels; the mouth ring is original paint there)."""
import json, math, sys
import numpy as np, cv2
from scipy.ndimage import median_filter, gaussian_filter1d

d = sys.argv[1]
L = json.load(open(f"{d}/proj04.json"))
W, H = L["camera"]["size"]; tf = math.tan(math.radians(L["camera"]["fov"]) / 2); asp = W / H
MW = np.array(L["camera"]["matrixWorld"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
D, U, X = (np.array(L[k], float) for k in "DUX"); T = L["tube"]
A = cv2.imread(f"{d}/plate04_hybrid_fal.png").astype(np.float32)
NC = 4096                                   # psi columns -pi..pi
RHO_FULL = (4.9, 2.6); NRF = 920            # unwrap rows (0.0025 u)
RHO = (4.45, 3.25)                          # rows kept in the tile (outer lip + pink edge .. groove + inner band top)
GOOD = (-1.80, 1.45)                        # painted arc with a reliable band (beyond: water / foam / bent band)

def proj(P):
    q = (P - C) @ R
    return ((q[..., 0] / -q[..., 2] / (tf * asp) + 1) / 2 * W).astype(np.float32), ((1 - q[..., 1] / -q[..., 2] / tf) / 2 * H).astype(np.float32)

cen = np.array(T["mouth"], float)           # mouth centre on the fitted plane z0
psi = -np.pi + np.arange(NC) * 2 * np.pi / NC
rho = np.linspace(RHO_FULL[0], RHO_FULL[1], NRF)
RH, PS = np.meshgrid(rho, psi, indexing="ij")
P = cen + RH[..., None] * (np.cos(PS)[..., None] * U + np.sin(PS)[..., None] * X)
u, v = proj(P)
unw = cv2.remap(A, u, v, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

# ---- straighten: align every column's radial edge profile to the centre's (3 iterations, robust smoothing) ----------
luma = unw @ np.array([0.11, 0.59, 0.3], np.float32)
feat = np.diff(cv2.GaussianBlur(luma, (0, 0), sigmaX=8, sigmaY=2.4), axis=0)
lo, hi, S = 220, 700, 100                   # rows (0.0025 u) with band + groove + inner band; max shift +-0.25 u
c0, c1 = int((math.pi - 2.13) / (2 * math.pi) * NC), int((math.pi + 2.13) / (2 * math.pi) * NC)
cm = NC // 2
tmpl = feat[lo:hi, cm - 80:cm + 80].mean(1)
shift = np.zeros(NC)
step = 4                                    # correlate every 4th column (smooth curve anyway)
shifts = np.arange(-S, S + 1, 2)
for it in range(3):
    cs = np.arange(c0, c1, step)
    tz = (tmpl - tmpl.mean()) / (np.linalg.norm(tmpl - tmpl.mean()) + 1e-6)
    cc = np.zeros((len(cs), len(shifts)))
    for k, c in enumerate(cs):
        for j, s in enumerate(shifts):
            p = feat[lo + s:hi + s, c]; pz = p - p.mean()
            cc[k, j] = float(np.dot(pz, tz) / (np.linalg.norm(pz) + 1e-6))
    # continuous path (Viterbi): best correlation with a penalty on jumps between neighbouring columns, so the
    # alignment never locks onto the next ring's edge for a few columns
    lam = 0.02
    J = np.abs(shifts[:, None] - shifts[None, :]) / 2.0
    acc = cc[0].copy(); back = np.zeros((len(cs), len(shifts)), int)
    for k in range(1, len(cs)):
        tot = acc[None, :] - lam * J                          # [to, from]
        back[k] = np.argmax(tot, 1); acc = cc[k] + tot[np.arange(len(shifts)), back[k]]
    path = np.zeros(len(cs), int); path[-1] = int(np.argmax(acc))
    for k in range(len(cs) - 1, 0, -1): path[k - 1] = back[k, path[k]]
    sh = shifts[path].astype(float)
    sm = gaussian_filter1d(sh, 10)
    shift = np.interp(np.arange(NC), cs, sm)
    al = np.stack([feat[lo + int(round(shift[c])):hi + int(round(shift[c])), c] for c in range(c0, c1, step)], 1)
    tmpl = np.median(al, 1)
rows = np.arange(NRF, dtype=np.float32)[:, None] + shift[None, :].astype(np.float32)
mx = np.repeat(np.arange(NC, dtype=np.float32)[None], NRF, 0)
st = cv2.remap(unw, mx, rows, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

# ---- keep the band rows ----------------------------------------------------------------------------------------------
r0 = int(round((RHO_FULL[0] - RHO[0]) / (RHO_FULL[0] - RHO_FULL[1]) * (NRF - 1)))
r1 = int(round((RHO_FULL[0] - RHO[1]) / (RHO_FULL[0] - RHO_FULL[1]) * (NRF - 1)))
tile = st[r0:r1 + 1].copy()
NR = tile.shape[0]
rho_t = np.linspace(RHO[0], RHO[1], NR)

# ---- clean foam / bubbles overlapping the outer lip: whitish-lilac (low saturation, bright, blue >= red*0.8) --------
hsv = cv2.cvtColor(np.clip(tile, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
Bc, Gc, Rc = tile[..., 0], tile[..., 1], tile[..., 2]
foam = (hsv[..., 1] < 95) & (hsv[..., 2] > 170) & (Bc > 0.78 * Rc)
foam &= (rho_t[:, None] > 3.62)            # only on / outside the band's outer half (the lower band has white glints)
foam = cv2.dilate(foam.astype(np.uint8), np.ones((7, 9), np.uint8))
tile = cv2.inpaint(np.clip(tile, 0, 255).astype(np.uint8), foam, 9, cv2.INPAINT_TELEA).astype(np.float32)

# ---- periodic: mirror outside the good arc, cross-fade where the two mirrored halves meet under the water -------------
g0, g1 = int((GOOD[0] + math.pi) / (2 * math.pi) * NC), int((GOOD[1] + math.pi) / (2 * math.pi) * NC)
full = tile.copy()
src = np.arange(NC)
for c in range(NC):
    if c < g0: src[c] = g0 + (g0 - c)
    elif c > g1: src[c] = g1 - (c - g1)
# the two mirrored regions meet at the bottom (psi = +-pi): a column there takes the nearer mirror
for c in range(NC):
    if c < g0 or c > g1:
        dl = (g0 - c) % NC if c < g0 else (NC - c + g0)   # distance (cols) back to the left good end going down
        dr = (c - g1) % NC if c > g1 else (c + NC - g1)   # distance to the right good end
        sl = g0 + dl; sr = g1 - dr
        sl = min(max(sl, g0), g1); sr = min(max(sr, g0), g1)
        w = np.clip((dl - dr) / 120.0 * 0.5 + 0.5, 0, 1)      # 0 = left mirror, 1 = right mirror
        full[:, c] = tile[:, sl] * (1 - w) + tile[:, sr] * w
tile = full

# ---- bulbs: hot spots along the band (painted glowing bulbs on both lips) -------------------------------------------
lum = tile @ np.array([0.11, 0.59, 0.3], np.float32)
ls = cv2.GaussianBlur(lum, (0, 0), sigmaX=6, sigmaY=3)
# the band rows (outer lip .. lower lip) found from the centre's mean profile of the straightened tile
prof = ls[:, cm - 400:cm + 400].mean(1)
bulbs = []
band = [(r, rho_t[r]) for r in range(NR)]
for name, rlo, rhi in (("outer", 4.20, 3.92), ("inner", 3.80, 3.50)):
    ra, rb = int(np.argmin(np.abs(rho_t - rlo))), int(np.argmin(np.abs(rho_t - rhi)))
    sub = ls[ra:rb]
    rowmax = sub.max(0); rowarg = sub.argmax(0) + ra
    sm = gaussian_filter1d(rowmax, 6)
    base = median_filter(sm, 301)
    for c in range(g0, g1):
        if sm[c] == sm[max(g0, c - 60):min(g1, c + 61)].max() and sm[c] > base[c] + 14 and sm[c] > 205:
            bulbs.append({"lip": name, "psi": float(psi[c]), "rho": float(rho_t[rowarg[c]]), "lum": float(sm[c])})
# mirror the bulbs into the mirrored arcs
mir = []
for b in bulbs:
    for end in GOOD:
        p2 = 2 * end - b["psi"]
        if (p2 < GOOD[0] or p2 > GOOD[1]) and -math.pi <= p2 <= math.pi:
            mir.append({**b, "psi": p2, "mirrored": True})
bulbs += mir

def sharpen(img, s=1.6, k=0.45): return np.clip(img + k * (img - cv2.GaussianBlur(img, (0, 0), s)), 0, 255)
cv2.imwrite(f"{d}/tile_mouth.png", sharpen(tile).astype(np.uint8))
json.dump({"note": "tools/match04/mouth04.py: painted mouth ring, straightened; cols psi -pi..pi (0 = top, + = right), rows rho top..bottom on the fitted mouth plane z0",
           "rho": RHO, "size": [NC, NR], "good": GOOD, "bulbs": bulbs,
           "shift_rows_0p0025u": [round(float(shift[c]), 1) for c in range(0, NC, 64)]},
          open(f"{d}/mouth04.json", "w"), indent=1)
print("tile_mouth", tile.shape, "bulbs", len(bulbs), [(b['lip'], round(b['psi'], 2), round(b['rho'], 2)) for b in bulbs if not b.get('mirrored')])
