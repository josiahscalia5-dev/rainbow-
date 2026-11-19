"""Screen 06 (?match06=1): proxy layout (proj06.json) + design tiles UNWRAPPED from the plate (original approved pixels)
through the locked camera onto the proxy geometry's own coordinates, for the views the approved picture never resolved
(moving camera close to the walls / the water):
  tile_tube.png   the painted tunnel wall (gold rings + slotted purple metal) over the wall ABOVE the water
                  (angle -asin(hA/R) .. pi + asin(hA/R)) x TUBE_S along the river: ring-structured, mirrored along s
  tile_floor.png  the painted near water, lateral -Lf..Lf x FLOOR_S along the river (mirrored along s)
usage: python3 -I tools/match06/make_tiles06.py <probe06.json> <cam06_locked.json> <dir>"""
import json, math, sys
import numpy as np, cv2
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from geo06 import Geo
g = Geo(sys.argv[1], sys.argv[2]); d = sys.argv[3]
A = cv2.imread(f"{d}/plate06_hybrid.png").astype(np.float32)
TUBE_S = (g.sB + 20.0, g.sB + 32.0); FLOOR_S = (g.sB - 2.8, g.sB + 4.0)
a0 = -math.asin(g.hA / g.R); a1 = math.pi - a0
def sharpen(img, s=2.0, k=0.5): return np.clip(img + k * (img - cv2.GaussianBlur(img, (0, 0), s)), 0, 255)
th = np.linspace(a0, a1, 1024); ss = np.linspace(*TUBE_S, 384)
SS, TH = np.meshgrid(ss, th)                                  # rows = angle, cols = s
P = g.tube(SS.ravel(), TH.ravel()).reshape(*SS.shape, 3)
u, v, _ = g.proj(P); tube = cv2.remap(A, u.astype(np.float32), v.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
cv2.imwrite(f"{d}/tile_tube.png", sharpen(tube).astype(np.uint8))
ll = np.linspace(-g.Lf, g.Lf, 512); ss = np.linspace(*FLOOR_S, 384)
SS, LL = np.meshgrid(ss, ll)                                  # rows = lateral, cols = s
P = g.floor(SS.ravel(), LL.ravel()).reshape(*SS.shape, 3)
u, v, _ = g.proj(P); flo = cv2.remap(A, u.astype(np.float32), v.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
cv2.imwrite(f"{d}/tile_floor.png", sharpen(flo).astype(np.uint8))
L = g.layout_json()
L["tiles"] = {"tube": {"angle": [a0, a1], "s": TUBE_S, "period": TUBE_S[1] - TUBE_S[0]}, "floor": {"lateral": [-g.Lf, g.Lf], "s": FLOOR_S, "period": FLOOR_S[1] - FLOOR_S[0]}}
json.dump(L, open(f"{d}/proj06.json", "w"), indent=1)
print(json.dumps(L["tiles"]), "s0", L["s0"], "s1", L["s1"])
