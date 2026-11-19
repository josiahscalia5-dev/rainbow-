"""Screen 06 (?match06=1, r6 2026-11-17): fit the WATER surface to the painted water outline.
The r2/r3 river floor is the game river's width + 1 u of bank each side; from the approved camera it covers the whole
frame below the crest line, so the painted tunnel walls / crest-loop hole / foam banks were projected onto WATER geometry
and became a giant water wall once the camera moved (qa/match/06/NOTES.md, r6).
For every floor row s and lateral offset l (floor = pos + l*right, |l| <= Lf) this projects the point into the approved
camera, z-buffers floor + tube from the projector and keeps a row's lateral extent where the VISIBLE samples fall inside
the painted water outline (mask06 G, plus a few px of foam). Rows the projector does not see (behind the crest, outside
the frame) keep a default half-width (the game river's half-width, no 1 u bank) so the moving camera still rides on water.
Output: assets/textures/match06/water06.json {s: [...], lo: [...], hi: [...]} (lateral extents, smoothed along s).
usage: python3 -I tools/match06/fit_water06.py <probe.json> <cam06_locked.json> <plate dir> [qa dir]"""
import sys, json, math
import numpy as np, cv2
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from geo06 import Geo

probe, camf, d = sys.argv[1:4]
qa = sys.argv[4] if len(sys.argv) > 4 else None
P = json.load(open(probe)); C = json.load(open(camf))
lay = json.load(open(f"{d}/proj06.json"))
g = Geo(P, C)
W, H = g.W, g.H
mask = cv2.imread(f"{d}/mask06.png")            # BGR: G channel = no-water
water = mask[:, :, 1] < 128
# allow ~6 px of foam bank around the painted water so the bank foam stays on the water edge
water_d = cv2.dilate(water.astype(np.uint8), np.ones((13, 13), np.uint8)) > 0

ds, dl = 0.1, 0.05
S = np.arange(lay["s0"], lay["s1"], ds)
Lf = lay["Lfloor"]
Ls = np.arange(-Lf, Lf + 1e-6, dl)
SS, LL = np.meshgrid(S, Ls, indexing="ij")
X = g.floor(SS.ravel(), LL.ravel()).reshape(len(S), len(Ls), 3)
u, v, z = g.proj(X.reshape(-1, 3)); u = u.reshape(SS.shape); v = v.reshape(SS.shape); z = -z.reshape(SS.shape)

# z-buffer from the projector: floor samples + tube (the tube can hide floor behind the crest / beyond the frame edge)
zb = np.full((H, W), np.inf)
def splat(uu, vv, zz):
    ok = (zz > 0.3) & (uu >= 0) & (uu < W) & (vv >= 0) & (vv < H)
    iu = uu[ok].astype(int); iv = vv[ok].astype(int); zz = zz[ok]
    o = np.argsort(-zz)                      # far first, near last wins
    zb[iv[o], iu[o]] = zz[o]
splat(u.ravel(), v.ravel(), z.ravel())
TH = np.linspace(0, 2 * math.pi, 720, endpoint=False)
Stube = np.arange(lay["s0"], lay["s1"] + lay["ext"], 0.25)
ST, TT = np.meshgrid(Stube, TH, indexing="ij")
XT = g.tube(ST.ravel(), TT.ravel())
ut, vt, zt = g.proj(XT); splat(ut, vt, -zt)
# close pinholes of the point splat
zb = -cv2.dilate(-np.where(np.isinf(zb), -1e9, zb).astype(np.float32), np.ones((3, 3), np.uint8)) if False else zb
zbe = cv2.erode(np.where(np.isinf(zb), 1e9, zb).astype(np.float32), np.ones((5, 5), np.uint8))

inside = (z > 0.3) & (u >= 0) & (u < W) & (v >= 0) & (v < H)
iu = np.clip(u.astype(int), 0, W - 1); iv = np.clip(v.astype(int), 0, H - 1)
vis = inside & (z <= zbe[iv, iu] * 1.02 + 0.05)
inw = vis & water_d[iv, iu]
half_def = np.array([P and min(Lf, 0.5 * w) for w in np.interp(np.minimum(S, g.s1), [f["s"] for f in P["frames"]], [f["w"] for f in P["frames"]])])

lo = np.full(len(S), np.nan); hi = np.full(len(S), np.nan); seen = np.zeros(len(S), bool)
for i in range(len(S)):
    if vis[i].sum() < 0.25 * len(Ls):
        continue                                  # row mostly hidden / outside the picture: decided below
    seen[i] = True
    w_ = inw[i]
    # the river centre is at l = 0: grow the water interval out from the visible sample nearest the centre
    c = len(Ls) // 2
    idx = np.where(w_)[0]
    if len(idx) == 0:
        lo[i] = hi[i] = 0.0; continue
    c0 = idx[np.argmin(np.abs(idx - c))]
    a = c0
    while a - 1 >= 0 and (w_[a - 1] or not vis[i, a - 1]): a -= 1
    b = c0
    while b + 1 < len(Ls) and (w_[b + 1] or not vis[i, b + 1]): b += 1
    lo[i], hi[i] = Ls[a], Ls[b]
# rows not seen by the projector: the game river's own half-width (no extra bank)
lo = np.where(seen, lo, -half_def); hi = np.where(seen, hi, half_def)
# never narrower than the game river itself (Benny steers up to |lat| 2.95 and must stay on water) and never wider than
# the r3 floor (river + 1 u bank)
lo = np.clip(lo, -half_def - 1.0, -half_def); hi = np.clip(hi, half_def, half_def + 1.0)
# smooth along s (no jagged banks); 1 u window
k = int(round(1.0 / ds)) | 1
ker = np.ones(k) / k
lo_s = np.convolve(np.pad(lo, k // 2, mode="edge"), ker, "valid"); hi_s = np.convolve(np.pad(hi, k // 2, mode="edge"), ker, "valid")
step = 5
out = {"note": "Screen 06 water surface lateral extents fitted to the painted water (tools/match06/fit_water06.py)",
       "s": [round(float(x), 3) for x in S[::step]], "lo": [round(float(x), 3) for x in lo_s[::step]],
       "hi": [round(float(x), 3) for x in hi_s[::step]], "seen": [bool(x) for x in seen[::step]]}
json.dump(out, open(f"{d}/water06.json", "w"), indent=0)
for i in range(0, len(S), 20):
    print(f"s {S[i]:7.2f} seen {int(seen[i])} vis {vis[i].mean():.2f} inw {inw[i].mean():.2f} lo {lo_s[i]:6.2f} hi {hi_s[i]:6.2f} def {half_def[i]:.2f}")
if qa:
    # check picture: footprint of the NEW water surface (red) vs the painted water outline (green edge) from the projector
    A = cv2.imread(f"{d}/plate06_hybrid.png").astype(np.float32)
    keep = (LL >= np.interp(SS, S, lo_s)) & (LL <= np.interp(SS, S, hi_s)) & vis
    fp = np.zeros((H, W), np.uint8); fp[iv[keep], iu[keep]] = 255
    fp = cv2.morphologyEx(fp, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    A[fp > 0] = 0.55 * A[fp > 0] + 0.45 * np.array([0, 0, 255])
    edge = cv2.Canny(water.astype(np.uint8) * 255, 50, 150) > 0
    A[cv2.dilate(edge.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0] = (0, 255, 0)
    cv2.imwrite(f"{qa}/water06_fit_check.png", A.astype(np.uint8))
    old = np.zeros((H, W), np.uint8); okk = vis & (np.abs(LL) <= np.minimum(half_def[:, None] + 1.0, Lf)); old[iv[okk], iu[okk]] = 255
    old = cv2.morphologyEx(old, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    print("floor footprint px: OLD", int((old > 0).sum()), "outside painted water", int(((old > 0) & ~water).sum()),
          "| NEW", int((fp > 0).sum()), "outside painted water", int(((fp > 0) & ~water).sum()))
