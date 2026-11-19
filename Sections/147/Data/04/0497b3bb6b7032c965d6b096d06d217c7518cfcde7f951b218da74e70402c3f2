"""Screen 04 round 15 `&m04rpaint=k`: the user's PAINTED inner gold rings, straightened from the approved picture, as a
texture for every modeled inner ring band (src/world/match04m4.ts GOLD_FRAG).

The painted tunnel is a telescope of rounded copper-gold rings whose centres drift toward the vanishing point and whose
outlines are slightly elliptic, so neither a straight-cylinder unwrap nor the simple drifting-centre model gives straight
rings. Here the painting gets its OWN ring coordinate system:
  1. log-polar unwrap around the drifting centres (make_tiles04.py model) -> painted grooves at the tunnel top (dark
     minima) -> groove curves tracked along the angle -> one circle fitted to every groove (q = 0, 1, 2, ... = groove
     index, q continuous in between: centre and log radius interpolated);
  2. unwrap in (angle, q) -> the residual waviness of every groove tracked again (smooth path search) and fitted with a
     low-order Fourier series of the angle -> straightened coordinates: q_k(psi) + s * (q_k+1(psi) - q_k(psi)),
     s = position inside the painted period (0 = groove, then the band, the bright lip line, back to the next groove);
  3. ONE clean painted period (ring index K, default 1 = the second inner ring, or a period-aligned median of rings)
     resampled straight from the approved pixels (no double resampling), bubbles masked and filled from neighbouring
     angles of the same row, the wall below the painted good arc (water, foam) mirrored from the upper walls.
The user's pixels are only straightened and filled, never repainted.

  python3 -I tools/match04/ring_paint04.py assets/textures/match04 [K or K1,K2,...] [out_dir_for_diagnostics]
writes tile_ring_paint.png (columns psi -pi..pi, psi 0 = tunnel top, + = screen RIGHT as in the shader's `ang`; rows
s 0 (groove) .. 1 (next groove), going deeper) and ring_paint04.json (period list, lip position, good arc, fits)."""
import json, math, sys
import numpy as np, cv2
from scipy.ndimage import gaussian_filter, gaussian_filter1d
from scipy.signal import find_peaks
from scipy.interpolate import PchipInterpolator

d = sys.argv[1]
KS = [int(x) for x in (sys.argv[2] if len(sys.argv) > 2 else "1").split(",")]
DIAG = sys.argv[3] if len(sys.argv) > 3 else None
A = cv2.imread(f"{d}/plate04_hybrid.png").astype(np.float32)   # approved pixels, Benny / coins filled
LW = np.array([0.11, 0.59, 0.3], np.float32)                      # BGR luma
VP, MC, RM = np.array([490., 690.]), np.array([434., 792.]), 347.0
NCP = 1024                                                         # analysis columns
psiA = np.linspace(-np.pi, np.pi, NCP, endpoint=False)            # analysis angle, + = screen RIGHT, 0 = top


def at(cx, cy, R, ang):
    """screen point on a circle (centre cx, cy, radius R) at tunnel angle ang (0 = top, + = right)"""
    return cx + R * np.sin(ang), cy - R * np.cos(ang)


def viterbi(cost, lam):
    nr, nc = cost.shape
    acc = cost[:, 0].copy(); back = np.zeros((nr, nc), int)
    J = (np.arange(nr)[:, None] - np.arange(nr)[None, :]).astype(np.float32) ** 2
    for c in range(1, nc):
        tot = acc[None, :] + lam * J
        back[:, c] = np.argmin(tot, 1); acc = cost[:, c] + tot[np.arange(nr), back[:, c]]
    p = np.zeros(nc, int); p[-1] = int(np.argmin(acc))
    for c in range(nc - 1, 0, -1): p[c - 1] = back[p[c], c]
    return p


# ---- 1. log-polar unwrap around the drifting centres, grooves at the top, tracked, circle per groove ---------------
NRL = 600
lr = np.linspace(np.log(370), np.log(40), NRL); rl = np.exp(lr)
RR, PS = np.meshgrid(rl, psiA, indexing="ij")
cc = VP[None, None] + (RR / RM)[..., None] * (MC - VP)[None, None]
u, v = at(cc[..., 0], cc[..., 1], RR, PS)
pol = cv2.remap(A, u.astype(np.float32), v.astype(np.float32), cv2.INTER_CUBIC)
Lp = gaussian_filter(pol @ LW, (1.0, 4.0))
top = NCP // 2
prof = Lp[:, top - 6:top + 6].mean(1)
pk, pr = find_peaks(-prof, prominence=40)
pk = [int(p) for p in pk if rl[p] > 100]
# a lip bevel can sit between two dark lines (first inner ring): of two minima closer than 30 rows the DEEPER one is the
# groove in front of the next band
starts = [p for i, p in enumerate(pk) if not (i + 1 < len(pk) and pk[i + 1] - p < 30)][:5]
print("top grooves (log-polar rows):", starts, "r px", np.round(rl[starts], 1).tolist())
fits = []
for s0 in starts:
    tr = np.zeros(NCP); cf = np.zeros(NCP)
    for direc in (1, -1):
        row, c = float(s0), top
        while 0 <= c < NCP:
            lo, hi = max(0, int(row) - 4), min(NRL, int(row) + 5)
            j = lo + int(np.argmin(Lp[lo:hi, c]))
            seg = Lp[max(0, j - 12):j + 13, c]; cf[c] = seg.mean() - Lp[j, c]
            row = j if c == top else 0.6 * row + 0.4 * j
            tr[c] = j; c += direc
    tr = gaussian_filter1d(tr, 6)
    cols = np.array([c for c in range(150, 800) if cf[c] > 8])
    rr = np.interp(tr[cols], np.arange(NRL), rl)
    ccx = VP[0] + rr / RM * (MC[0] - VP[0]); ccy = VP[1] + rr / RM * (MC[1] - VP[1])
    x, y = at(ccx, ccy, rr, psiA[cols])
    M = np.c_[2 * x, 2 * y, np.ones_like(x)]
    sol = np.linalg.lstsq(M, x * x + y * y, rcond=None)[0]
    fits.append([sol[0], sol[1], math.sqrt(sol[2] + sol[0] ** 2 + sol[1] ** 2)])
fits = np.array(fits)
qk = np.arange(len(fits))
fx = PchipInterpolator(qk, fits[:, 0]); fy = PchipInterpolator(qk, fits[:, 1]); fr = PchipInterpolator(qk, np.log(fits[:, 2]))
print("groove circles (cx, cy, R):", fits.round(1).tolist())


def circ(q, ang):
    return at(fx(q), fy(q), np.exp(fr(q)), ang)


# ---- 2. unwrap in (q, angle), residual waviness of every groove -> Fourier fit -> straightened coordinates ---------
RPR = 120; Q0 = -0.4
qq = Q0 + np.arange(int((len(fits) - 1 + 0.6 - Q0) * RPR)) / RPR
QQ, PS = np.meshgrid(qq, psiA, indexing="ij")
u, v = circ(QQ, PS)
qun = cv2.remap(A, u.astype(np.float32), v.astype(np.float32), cv2.INTER_CUBIC)
Lq = gaussian_filter(qun @ LW, (0.8, 2.5))
C0, C1 = 150, 870                                                  # columns with painted wall (analysis grid)
medp = np.median(Lq[:, 400:620], 1)
gpk, _ = find_peaks(-medp, prominence=15)
gq = [float(qq[p]) for p in gpk]
# the groove of every period = the strongest dark minimum near each integer q
gro = []
for k in range(len(fits)):
    cand = [g for g in gq if abs(g - k) < 0.3]
    if not cand: continue
    gro.append(min(cand, key=lambda g: medp[int(round((g - Q0) * RPR))]))
print("painted grooves at the top (q):", np.round(gro, 3))
basis = lambda a: np.stack([np.ones_like(a), np.cos(a), np.sin(a), np.cos(2 * a), np.sin(2 * a), np.cos(3 * a), np.sin(3 * a)], 1)
cols = np.arange(C0, C1)
Bf = basis(psiA[cols]); Ball = basis(psiA)
gcurve = []
for g in gro:
    r0 = int(round((g - Q0) * RPR)); lo, hi = max(0, r0 - 26), r0 + 27
    p = viterbi(Lq[lo:hi, C0:C1], 0.6) + lo
    qt = Q0 + p / RPR
    # robust Fourier fit (two passes, drop outliers)
    w = np.ones(len(cols), bool)
    for _ in range(3):
        coef = np.linalg.lstsq(Bf[w], qt[w], rcond=None)[0]
        res = qt - Bf @ coef; w = np.abs(res) < max(0.02, 2.5 * np.std(res[w]))
    gcurve.append(coef)
    print(f"  groove q~{g:.3f}: residual wave {np.ptp(Bf @ coef):.3f} q, fit rms {np.std(res[w]):.4f} q, kept {w.mean():.2f}")
gcurve = np.array(gcurve)


def gq_at(k, ang):
    return basis(np.atleast_1d(ang)) @ gcurve[k]


# ---- 3. the painted period(s): (s, psi) -> screen, straight from the approved pixels ---------------------------------
NS, NC = 160, 2048
GL0, GL1 = -1.66, 1.86                                             # painted wall arc used to straighten the lip line
psi = np.linspace(-np.pi, np.pi, NC, endpoint=False)
s = (np.arange(NS) + 0.5) / NS
periods = []
for K in KS:
    g0, g1 = gq_at(K, psi), gq_at(K + 1, psi)
    qmap = g0[None, :] + s[:, None] * (g1 - g0)[None, :]
    u, v = circ(qmap, psi[None, :].repeat(NS, 0))
    t = cv2.remap(A, u.astype(np.float32), v.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    # second landmark: the bright lip line (brightest row in s 0.55..0.95), tracked along the angle, Fourier-fitted,
    # then every column re-timed piecewise-linearly so the lip line is one straight row (s_lip of the upper walls)
    lt = gaussian_filter(t @ LW, (1.0, 6.0))
    a0, a1 = int(NS * 0.55), int(NS * 0.95)
    sub = lt[a0:a1, ::2]
    pth = viterbi(-sub, 2.0) + a0
    pc = psi[::2]; wc = (pc > GL0) & (pc < GL1)
    Bl = basis(pc[wc]); lp = pth[wc].astype(float)
    w = np.ones(len(lp), bool)
    for _ in range(3):
        coef = np.linalg.lstsq(Bl[w], lp[w], rcond=None)[0]
        res = lp - Bl @ coef; w = np.abs(res) < max(2.0, 2.5 * np.std(res[w]))
    # Fourier curve + a small, smoothed local correction (straightens the lip right up to the ends of the painted arc)
    fl = basis(pc) @ coef
    loc = np.where(wc, np.clip(gaussian_filter1d(np.where(wc, pth - fl, 0.0), 8), -6, 6), 0.0)
    lipc = (np.interp(psi, pc, fl + loc) + 0.5) / NS                # lip s per column
    lipref = float(np.median(lipc[np.abs(psi) < 0.6]))
    print(f"  ring {K}: lip line s {lipref:.3f} (wave {np.ptp(lipc[np.abs(psi) < 1.7]):.3f})")
    s_src = np.where(s[:, None] <= lipref, s[:, None] / lipref * lipc[None, :],
                     lipc[None, :] + (s[:, None] - lipref) / (1 - lipref) * (1 - lipc[None, :]))
    qmap = g0[None, :] + s_src * (g1 - g0)[None, :]
    u, v = circ(qmap, psi[None, :].repeat(NS, 0))
    t = cv2.remap(A, u.astype(np.float32), v.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    periods.append(t)
    if DIAG: cv2.imwrite(f"{DIAG}/period_K{K}.png", np.clip(t, 0, 255).astype(np.uint8))
tile = periods[0] if len(periods) == 1 else np.median(np.stack(periods), 0)

# ---- painted good arc: the wall between the water / foam on both sides (per column: gold = warm, saturated) --------
hsv = cv2.cvtColor(np.clip(tile, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
B, G, R = tile[..., 0], tile[..., 1], tile[..., 2]
warm = gaussian_filter1d(np.median(R / np.maximum(B, 1), 0), 6)   # copper-gold: red >> blue; water / pink foam: not
mid = NC // 2
gl = mid; gr = mid
while gl > 0 and warm[gl - 1] > 1.8: gl -= 1
while gr < NC - 1 and warm[gr + 1] > 1.8: gr += 1
GOOD = (float(psi[gl]) + 0.03, float(psi[gr]) - 0.03)              # keep a margin from the water boundary
print("painted good arc (rad, + = right):", np.round(GOOD, 3))

# ---- bubbles over the rings: bright, low-saturation, cool (blue >= 0.85 red) texels -> fill from neighbouring angles
bub = (B > 0.85 * R) & (G > 0.55 * R) & (hsv[..., 2] > 150)
bub = cv2.morphologyEx(bub.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
bub = cv2.dilate(bub, np.ones((5, 9), np.uint8)).astype(bool)
g0c, g1c = int((GOOD[0] + np.pi) / (2 * np.pi) * NC), int((GOOD[1] + np.pi) / (2 * np.pi) * NC)
bub[:, :g0c] = False; bub[:, g1c:] = False
print(f"bubble texels masked in the good arc: {bub[:, g0c:g1c].mean() * 100:.2f} %")
filled = tile.copy()
for rI in range(NS):
    m = bub[rI, g0c:g1c]
    if m.any():
        xs = np.arange(g0c, g1c); good = ~m
        for ch in range(3): filled[rI, g0c:g1c, ch] = np.interp(xs, xs[good], tile[rI, g0c:g1c, ch][good])
tile = filled

# ---- outside the good arc (under the water / behind the foam): CONTINUE the painted wall by repeating its last SPAN
# of angle (a mirror would draw a symmetric V of the lip line = a mark on every ring); the arc end is cross-faded into
# the repeated block so the joint has no seam; left and right continuations meet (cross-faded) at the bottom
SPAN, FADE = int(0.8 / (2 * np.pi) * NC), 48
t0 = tile.copy()
jj = np.linspace(0, 1, FADE)[None, :, None]
tile[:, g1c - FADE:g1c] = t0[:, g1c - FADE:g1c] * (1 - jj) + t0[:, g1c - SPAN - FADE:g1c - SPAN] * jj
tile[:, g0c:g0c + FADE] = t0[:, g0c:g0c + FADE] * jj + t0[:, g0c + SPAN:g0c + SPAN + FADE] * (1 - jj)
right = lambda dd: tile[:, g1c - SPAN + (dd % SPAN)]               # continuation to the right of the arc
left = lambda dd: tile[:, g0c + SPAN - 1 - (dd % SPAN)]            # continuation to the left (going backwards)
full = tile.copy()
for c in range(NC):
    if c < g0c or c >= g1c:
        dr = (c - g1c) % NC; dl = (g0c - 1 - c) % NC
        w = np.clip((dr - dl) / 120.0 * 0.5 + 0.5, 0, 1)            # 0 = right continuation, 1 = left
        full[:, c] = right(dr) * (1 - w) + left(dl) * w
tile = full
# seamless along s (the groove row repeats): blend the last rows into the first
n = 6; w = np.linspace(0, 1, n)[:, None, None]; tile[-n:] = tile[-n:] * (1 - w) + tile[:1] * w

# ---- the painted profile (median over the upper walls): groove / band / lip positions inside the period --------------
lum = tile @ LW
tp = np.median(lum[:, int(NC * 0.38):int(NC * 0.62)], 1)
s_lip = float(s[int(np.argmax(tp[int(NS * 0.45):])) + int(NS * 0.45)])
s_dark = float(s[int(np.argmin(tp))])
print(f"painted period profile: lip line at s={s_lip:.3f}, darkest at s={s_dark:.3f}")
cv2.imwrite(f"{d}/tile_ring_paint.png", np.clip(tile, 0, 255).astype(np.uint8))
json.dump({"note": "tools/match04/ring_paint04.py: painted inner gold ring, straightened; cols psi -pi..pi (0 = top, + = screen right), "
                   "rows s 0 (groove) .. 1 (next groove), going deeper",
           "periods": KS, "size": [NC, NS], "good": GOOD, "s_lip": s_lip, "s_dark": s_dark,
           "groove_circles": fits.round(2).tolist(), "grooves_top_q": [round(g, 3) for g in gro],
           "profile": [round(float(x), 1) for x in tp]},
          open(f"{d}/ring_paint04.json", "w"), indent=1)
if DIAG:
    cv2.imwrite(f"{DIAG}/qun.png", np.clip(qun, 0, 255).astype(np.uint8))
    vis = np.clip(qun, 0, 255).astype(np.uint8).copy()
    for k in range(len(gcurve)):
        qy = ((Ball @ gcurve[k]) - Q0) * RPR
        for c in range(NCP):
            y = int(round(qy[c]))
            if 0 <= y < vis.shape[0]: vis[y, c] = (0, 255, 0)
    cv2.imwrite(f"{DIAG}/qun_grooves.png", vis)
    cv2.imwrite(f"{DIAG}/bubble_mask.png", (bub * 255).astype(np.uint8))
print("tile_ring_paint", tile.shape)
