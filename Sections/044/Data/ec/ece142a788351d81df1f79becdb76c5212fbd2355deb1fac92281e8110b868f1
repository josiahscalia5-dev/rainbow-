"""Screen 06 (?match06=1): proxy layout (proj06.json) + design tiles UNWRAPPED from the plate (original approved pixels)
through the locked camera onto the proxy geometry's own coordinates, for the views the approved picture never resolved
(moving camera close to the walls / the water):
  tile_tube.png   the painted tunnel wall (gold rings + slotted purple metal) unwrapped around the painted vanishing point
                  (angle x 1/r): ring-structured, mapped on the tube as (wall angle, s), mirrored repeat
  tile_floor.png  the painted cyan/pink water below Benny, mapped on the floor as (lateral, s), mirrored repeat
usage: python3 -I tools/match06/make_tiles06.py <probe06.json> <cam06_locked.json> <dir>"""
import json, math, sys
import numpy as np, cv2
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from geo06 import Geo
g = Geo(sys.argv[1], sys.argv[2]); d = sys.argv[3]
A = cv2.imread(f"{d}/plate06_hybrid.png").astype(np.float32)
def sharpen(img, s=2.0, k=0.5): return np.clip(img + k * (img - cv2.GaussianBlur(img, (0, 0), s)), 0, 255)
# tube: the painted tunnel unwrapped around its own vanishing point (rings are concentric there): rows = angle over the
# clean upper-left wall sector (no river), cols = uniform in 1/r (= uniform in depth -> uniform along the tube), so the
# gold rings become straight bands across the tile at their painted spacing
VP, R1, R2, ANG = (660.0, 632.0), 110.0, 340.0, (35.0, 140.0)
th = np.radians(np.linspace(*ANG, 1024)); ir = np.linspace(1 / R2, 1 / R1, 384)
IR, TH = np.meshgrid(ir, th); r = 1 / IR
tube = cv2.remap(A, (VP[0] + r * np.cos(TH)).astype(np.float32), (VP[1] - r * np.sin(TH)).astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
cv2.imwrite(f"{d}/tile_tube.png", sharpen(tube).astype(np.uint8))
TUBE_PERIOD = g.Fpx * g.R * (1 / R1 - 1 / R2)               # the tile's length along the tube at the painted ring spacing
# floor: the painted cyan/pink water below Benny (ripples + streaks, no foam), mirrored in the shader
flo = A[1250:1530, 150:720]
cv2.imwrite(f"{d}/tile_floor.png", flo.astype(np.uint8))
a0 = -math.asin(g.hA / g.R); a1 = math.pi - a0
L = g.layout_json()
L["tiles"] = {"tube": {"wallAngle": [a0, a1], "sectorDeg": ANG, "vp": VP, "r": [R1, R2], "period": TUBE_PERIOD, "anglePeriod": math.radians(ANG[1] - ANG[0])},
              "floor": {"px": [150, 1250, 720, 1530], "lateralPeriod": 2 * g.Lf / 1.6, "period": (2 * g.Lf / 1.6) * 280 / 570}}
json.dump(L, open(f"{d}/proj06.json", "w"), indent=1)
print(json.dumps(L["tiles"]), "s0", L["s0"], "s1", L["s1"])
