"""Screen 06 (?match06=1, r3 2026-11-17): river-floor tile v2 = the painted water just below Benny (s = Benny - 2.0 ..
Benny - 1.05, lateral -1.05 .. 0.95: streaks + ripples, no foam / bubbles / fill) RECTIFIED through the locked camera into
the floor's own (lateral, s) coordinates, then made seamless along s (the last 35 % cross-faded into the start) so the
shader can REPEAT it along the river instead of mirroring it (the mirrored perspective crop of r2 drew kaleidoscope
diamonds + floating foam blobs on the water while riding). Laterally it stays mirrored (streaks run along the river).
usage: python3 -I tools/match06/make_floor06.py <probe06.json> <cam06_locked.json> <dir>   -> <dir>/tile_floor2.png"""
import json, sys
import numpy as np, cv2
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from geo06 import Geo
g = Geo(sys.argv[1], sys.argv[2]); d = sys.argv[3]
A = cv2.imread(f"{d}/plate06_hybrid.png").astype(np.float32)
S0, S1, L0, L1, PX = g.sB - 2.0, g.sB - 1.05, -1.05, 0.95, 220        # PX = tile pixels per world unit (no bubbles at the sides)
STRETCH = 4.0                       # laid 4x longer along the river: the painted streaks fan out diagonally; stretched they run
                                    # with the flow and the repeat period becomes ~2.5 u instead of 0.6 u
ns, nl = int((S1 - S0) * PX), int((L1 - L0) * PX)
ss = np.linspace(S1, S0, ns)                                         # tile row 0 = far end (larger s)
ll = np.linspace(L0, L1, nl)
SS, LL = np.meshgrid(ss, ll, indexing="ij")
u, v, _ = g.proj(g.floor(SS.ravel(), LL.ravel()))
T = cv2.remap(A, u.reshape(SS.shape).astype(np.float32), v.reshape(SS.shape).astype(np.float32), cv2.INTER_CUBIC)
# seamless along s: rows [0, n-k) kept, the last k rows blended into the first k (period = n - k rows)
k = int(0.35 * ns); n = ns - k
w = np.linspace(0, 1, k)[:, None, None]
out = T[:n].copy(); out[:k] = T[n:] * (1 - w) + T[:k] * w
cv2.imwrite(f"{d}/tile_floor2.png", np.clip(out, 0, 255).astype(np.uint8))
L = json.load(open(f"{d}/proj06.json"))
L["tiles"]["floor2"] = {"s": [S0, S1], "lateral": [L0, L1], "lateralPeriod": L1 - L0, "period": STRETCH * n / PX, "pxPerU": PX, "stretch": STRETCH}
json.dump(L, open(f"{d}/proj06.json", "w"), indent=1)
print("tile_floor2", out.shape, L["tiles"]["floor2"])
