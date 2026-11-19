"""Screen 04 milestone 3 (?match04=1, default on; &river04=0 = milestone-2 river): the river design for the views the
approved picture never resolved (camera riding down the slide), taken from the APPROVED painted water around Benny
(pink swirl ribbons, cyan streams, foam banks; fal clean plate under Benny/coins) instead of the narrow cyan strip
inside the tunnel that milestone 2 used.
  tile_river3.png  lateral RIV_X x along RIV_A (Benny's water point = 0, down the slide). Pixels the approved frame never
                   showed (near corners) or that belong to the mouth ring are filled by extending the painted water along
                   the flow (column-wise, from the nearest painted row further down the slide). Seamless along the slide.
  tile_chev3.png   milestone-2 tile_river.png RGB + alpha = its glowing chevron arrow only (white/cyan-white core), laid
                   over the swirl tile in the shader with its own period -> arrows keep their painted look, and the two
                   periods (5.2 u / 5.3 u) never line up into an obvious repeat.
usage: python3 -I tools/match04/make_river04_m3.py assets/textures/match04"""
import json, math, sys
import numpy as np, cv2
d = sys.argv[1]
L = json.load(open(f"{d}/proj04.json"))
W, H = L["camera"]["size"]; t = math.tan(math.radians(L["camera"]["fov"]) / 2); asp = W / H
MW = np.array(L["camera"]["matrixWorld"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
D, U, X = (np.array(L[k], float) for k in "DUX"); base = np.array(L["water"], float)
A = cv2.imread(f"{d}/plate04_hybrid_fal.png").astype(np.float32)
RIV_X, RIV_A = (-4.0, 4.0), (1.0, 6.4)
def proj(P):
    q = (P - C) @ R; return ((q[..., 0] / -q[..., 2] / (t * asp) + 1) / 2 * W).astype(np.float32), ((1 - q[..., 1] / -q[..., 2] / t) / 2 * H).astype(np.float32)
NX, NA = 640, 600
x = np.linspace(*RIV_X, NX); a = np.linspace(*RIV_A, NA)
XX, AA = np.meshgrid(x, a)                                     # row 0 = nearest (a = RIV_A[0])
u, v = proj(base + XX[..., None] * X + AA[..., None] * D)
riv = cv2.remap(A, u, v, cv2.INTER_CUBIC)
ok = (u >= 2) & (u <= W - 3) & (v >= 2) & (v <= H - 3)
hsv = cv2.cvtColor(np.clip(riv, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV)
ring = (hsv[..., 0] >= 8) & (hsv[..., 0] <= 28) & (hsv[..., 1] > 90)   # gold/orange = mouth ring or tunnel wall, not water
ring = cv2.dilate(ring.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
ok &= ~ring
# fill along the flow: each invalid pixel takes the nearest valid pixel of its column (prefer further down the slide)
for j in range(NX):
    col = ok[:, j]
    if col.all() or col.mean() < 0.35: continue
    idx = np.where(col)[0]
    nearest = idx[np.clip(np.searchsorted(idx, np.arange(NA)), 0, len(idx) - 1)]
    riv[~col, j] = riv[nearest[~col], j]
# columns the approved frame barely showed (outermost banks): copy the nearest well-painted column
good = np.where(ok.mean(0) >= 0.35)[0]
for j in range(NX):
    if ok[:, j].mean() < 0.35: riv[:, j] = riv[:, good[np.argmin(np.abs(good - j))]]
filled = (~ok).mean()
# seamless along the slide (same cross-fade as milestone 2): last n rows fade into the first n, which are then dropped
n = int(0.14 * NA); w = np.linspace(0, 1, n)[:, None, None]; da = (RIV_A[1] - RIV_A[0]) / (NA - 1)
riv[-n:] = riv[-n:] * (1 - w) + riv[:n] * w
riv = riv[n:]; A0 = RIV_A[0] + n * da; A1 = A0 + riv.shape[0] * da
sharp = np.clip(riv + 0.4 * (riv - cv2.GaussianBlur(riv, (0, 0), 1.5)), 0, 255)
cv2.imwrite(f"{d}/tile_river3.png", sharp.astype(np.uint8))          # row 0 = nearest (flipY false in the shader)
# chevron overlay from the milestone-2 river tile
c = cv2.imread(f"{d}/tile_river.png").astype(np.float32)
mn = c.min(2); lum = c.mean(2)
m = np.clip((mn - 150) / 60, 0, 1) * np.clip((lum - 175) / 45, 0, 1)
m = cv2.GaussianBlur(cv2.dilate(m, np.ones((3, 3), np.uint8)), (0, 0), 1.5)
xc = np.abs(np.linspace(-4, 4, c.shape[1]))                     # arrow only (river centre), not the side glints
m *= np.clip((2.1 - xc) / 0.3, 0, 1)[None, :]
cv2.imwrite(f"{d}/tile_chev3.png", np.dstack([c, np.clip(m * 255, 0, 255)]).astype(np.uint8))
meta = json.load(open(f"{d}/tiles04.json"))
meta["river3"] = {"lateral": RIV_X, "alongFromBenny": [A0, A1], "size": [NX, riv.shape[0]], "filledFraction": round(float(filled), 3),
                  "source": "plate04_hybrid_fal.png (approved pixels + fal clean plate under Benny/coins)"}
json.dump(meta, open(f"{d}/tiles04.json", "w"), indent=1)
print("river3", meta["river3"], "chevron mask mean", float(m.mean()))
