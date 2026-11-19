"""Screen 06 (?match06=1, r6 2026-11-17): river-water + foam-bank tiles for the NARROW fitted river (`&m06geo=1`,
`&m06flow=1`, qa/match/06/NOTES.md r6).
Measured through the locked camera: the painted river is only ~4.5 u wide at Benny (the frame edges at Benny's row are
lateral -2.1 .. +2.1, foam banks right there) while the game river is 7 u (+1 u bank) — the r3 floor was 2x too wide.
* tile_river6.png: the painted water just below Benny's wake (s = Benny-1.66 .. Benny-0.96, lateral -1.5 .. +0.95: cyan
  centre, magenta sides, white streaks), the two soap bubbles in it inpainted, RECTIFIED into the floor's (lateral, s)
  coordinates through the locked camera. ONE period across the whole water width (no mirroring = no chevrons), made
  seamless along s (last 35 % cross-faded into the start); the shader lays it STRETCH x longer so the streaks run with the
  flow and blends two offset copies to hide the period.
* tile_foam6.png: the painted right foam bank (bubbly lilac foam), seamless along its height, for the banks.
Writes both tiles and `tiles.r6` in proj06.json.
usage: python3 -I tools/match06/make_river06.py <probe06.json> <cam06_locked.json> <dir> [qa dir]"""
import json, sys
import numpy as np, cv2
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from geo06 import Geo
g = Geo(sys.argv[1], sys.argv[2]); d = sys.argv[3]
qa = sys.argv[4] if len(sys.argv) > 4 else None
A = cv2.imread(f"{d}/plate06_hybrid.png")
# soap bubbles inside the sampled water (hand-placed circles on the 864x1536 picture) -> inpaint
bub = np.zeros(A.shape[:2], np.uint8)
for (x, y, r) in [(695, 1350, 44), (88, 1450, 46), (58, 1192, 18)]:
    cv2.circle(bub, (x, y), r, 255, -1)
Ai = cv2.inpaint(A, bub, 9, cv2.INPAINT_TELEA).astype(np.float32)

S0, S1, L0, L1, PX = g.sB - 1.66, g.sB - 0.96, -1.5, 0.95, 200   # right of +0.95: inpainted bubble blur
STRETCH = 5.0
ns, nl = int((S1 - S0) * PX), int((L1 - L0) * PX)
ss = np.linspace(S1, S0, ns)                      # row 0 = far end (larger s)
ll = np.linspace(L0, L1, nl)
SS, LL = np.meshgrid(ss, ll, indexing="ij")
u, v, _ = g.proj(g.floor(SS.ravel(), LL.ravel()))
T = cv2.remap(Ai, u.reshape(SS.shape).astype(np.float32), v.reshape(SS.shape).astype(np.float32), cv2.INTER_CUBIC)
k = int(0.35 * ns); n = ns - k
w = np.linspace(0, 1, k)[:, None, None]
out = T[:n].copy(); out[:k] = T[n:] * (1 - w) + T[:k] * w
# lift the deepest shadow at the lateral ends slightly (they were sampled close to the foam) - keep the painted colours
cv2.imwrite(f"{d}/tile_river6.png", np.clip(out, 0, 255).astype(np.uint8))

# foam bank: the painted right bank between the bubbles (x 760..864, y 1090..1330), seamless vertically
F = A[1090:1330, 760:864].astype(np.float32)
kf = int(0.3 * F.shape[0]); nf = F.shape[0] - kf
wf = np.linspace(0, 1, kf)[:, None, None]
Fo = F[:nf].copy(); Fo[:kf] = F[nf:] * (1 - wf) + F[:kf] * wf
cv2.imwrite(f"{d}/tile_foam6.png", np.clip(Fo, 0, 255).astype(np.uint8))

L = json.load(open(f"{d}/proj06.json"))
L["tiles"]["r6"] = {
    "note": "r6 narrow river: water |l| <= Wc, foam bank Wc..Wb (raised hb), tunnel wall rising from Wb (tools/match06/make_river06.py)",
    "Wc": 2.3, "Wb": 3.6, "hb": 0.18,
    "river": {"s": [S0, S1], "lateral": [L0, L1], "period": STRETCH * n / PX, "pxPerU": PX, "stretch": STRETCH},
    "foamPeriod": 1.6,
    "wallFrom": 0.35,
}
json.dump(L, open(f"{d}/proj06.json", "w"), indent=1)
print("tile_river6", out.shape, "tile_foam6", Fo.shape, L["tiles"]["r6"])
if qa:
    cv2.imwrite(f"{qa}/tile_river6_x3.png", cv2.resize(np.clip(np.vstack([out] * 3), 0, 255).astype(np.uint8), None, fx=1, fy=STRETCH / 2))
