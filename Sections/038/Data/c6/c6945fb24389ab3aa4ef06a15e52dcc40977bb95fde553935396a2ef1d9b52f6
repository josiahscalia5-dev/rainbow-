"""Screen 04 (?match04=1): design tiles UNWRAPPED from the approved artwork through the locked camera, for the views the
approved picture never resolved (moving camera deep in the tunnel / close to the water):
  tile_tunnel.png  the painted gold rings on the tunnel wall, angle 0..pi (upper half, mirrored in the shader) x one ring
                   band along the axis (TUN_A from the mouth) - follows the ring geometry, no stretching along the walls
  tile_river.png   the painted cyan river with ONE chevron arrow, lateral -4..4 u x RIV_A along the slide (repeats down the
                   slide, flows in the shader)
Source = plate04_hybrid.png (original pixels; coins/Benny filled). usage: python3 -I tools/match04/make_tiles04.py <dir>"""
import json, math, sys
import numpy as np, cv2
d = sys.argv[1]
L = json.load(open(f"{d}/proj04.json"))
W, H = L["camera"]["size"]; t = math.tan(math.radians(L["camera"]["fov"]) / 2); asp = W / H
MW = np.array(L["camera"]["matrixWorld"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
D, U, X = (np.array(L[k], float) for k in "DUX"); base = np.array(L["water"], float); T = L["tube"]
A = cv2.imread(f"{d}/plate04_hybrid.png").astype(np.float32)
TUN_A, RIV_A, RIV_X = (1.0, 5.5), (8.8, 14.8), (-4.0, 4.0)
def proj(P):
    q = (P - C) @ R; return ((q[..., 0] / -q[..., 2] / (t * asp) + 1) / 2 * W).astype(np.float32), ((1 - q[..., 1] / -q[..., 2] / t) / 2 * H).astype(np.float32)
def sharpen(img, s=2.0, k=0.6): return np.clip(img + k * (img - cv2.GaussianBlur(img, (0, 0), s)), 0, 255)
# tunnel: rows = angle 0 (right) .. pi (left) over the top, columns = axial distance from the mouth
th = np.linspace(0, np.pi, 1024); a = np.linspace(*TUN_A, 256)
AA, TH = np.meshgrid(a, th)
cen = np.array(T["mouth"], float)
P = cen + AA[..., None] * D + T["r"] * (np.cos(TH)[..., None] * X + np.sin(TH)[..., None] * U)
u, v = proj(P); tun = cv2.remap(A, u, v, cv2.INTER_CUBIC)
cv2.imwrite(f"{d}/tile_tunnel.png", sharpen(tun).astype(np.uint8))
# river: rows = along the slide (far at the top: t grows down the slide), columns = lateral
x = np.linspace(*RIV_X, 512); a = np.linspace(*RIV_A, 512)
XX, AA = np.meshgrid(x, a)
P = base + XX[..., None] * X + AA[..., None] * D
u, v = proj(P); riv = cv2.remap(A, u, v, cv2.INTER_CUBIC)
# make the along-slide repeat seamless: cross-fade the last 12 % into the first rows
n = int(0.12 * riv.shape[0]); w = np.linspace(0, 1, n)[:, None, None]
riv[-n:] = riv[-n:] * (1 - w) + riv[:n] * w
cv2.imwrite(f"{d}/tile_river.png", sharpen(riv).astype(np.uint8))
json.dump({"tunnel": {"angle": [0, math.pi], "axialFromMouth": TUN_A, "size": [256, 1024]}, "river": {"lateral": RIV_X, "alongFromBenny": RIV_A, "size": [512, 512]}},
          open(f"{d}/tiles04.json", "w"), indent=1)
print("tiles written")
