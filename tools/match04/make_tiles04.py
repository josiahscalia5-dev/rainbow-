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

# ---- milestone 2: tile_ring.png = ONE painted gold ring, straight and seamless along the tunnel ----------------------
# The painted rings are not concentric with a straight cylinder (their centres drift toward the vanishing point), so an
# unwrap through the cylinder gives wavy, smeared rings. Instead: the ring's cross-section (groove, lip, groove, polished
# band) is read straight off the approved picture along the tunnel top (x 445-485, y RING_Y), and the angle-dependent
# colour (side reflections, pink/violet glints, the long specular streaks) from a polar unwrap of the painted tunnel
# around its drifting ring centres (axial mean over the near rings). tile = profile(s) x colour ratio(angle).
# columns = psi -pi..pi (psi 0 = tunnel top, +pi/2 = left wall, seam at the bottom under the water), rows = one ring.
RING_Y = (517, 575)
prof = A[RING_Y[0]:RING_Y[1], 445:485].mean(1)                       # (rows, 3) BGR along the ring
prof = cv2.resize(prof[None], (192, 1), interpolation=cv2.INTER_CUBIC)[0]  # 192 samples along one ring period
n = 10; w = np.linspace(0, 1, n)[:, None]; prof[-n:] = prof[-n:] * (1 - w) + prof[0] * w   # seamless period
VP, MC, RM = np.array([490., 690.]), np.array([434., 792.]), 347.0     # vanishing point, mouth-ring centre/radius (px)
f = (H / 2) / t; zm = f * T["r"] / RM
psi = np.linspace(-np.pi, np.pi, 1024, endpoint=False); ax = np.linspace(2.0, 12.0, 160)
AX, PS = np.meshgrid(ax, psi)
r = f * T["r"] / (zm + AX)
c = VP[None, None] + (r / RM)[..., None] * (MC - VP)[None, None]
th = PS + np.pi / 2                                                    # angle from +x (screen right), up positive
u = (c[..., 0] + r * np.cos(th)).astype(np.float32); v = (c[..., 1] - r * np.sin(th)).astype(np.float32)
pol = cv2.remap(A, u, v, cv2.INTER_LINEAR)
g = np.median(pol, axis=1)                                             # (1024, 3) colour per angle
low = np.cos(psi) < -0.35                      # under the water plane (never seen): reflect the wall above the waterline
refl = np.where(psi > 0, np.pi - psi, -np.pi - psi)
g[low] = g[np.round((refl[low] + np.pi) / (2 * np.pi) * 1024).astype(int) % 1024]
top = np.argmin(np.abs(psi)); gt = g[max(0, top - 8):top + 8].mean(0)
g = cv2.GaussianBlur(g[:, None], (1, 0), sigmaX=1, sigmaY=2)[:, 0]
ratio = np.clip(g / np.maximum(gt, 1), 0.35, 3.0)
ring = np.clip(prof[None, :, :] * ratio[:, None, :], 0, 255)           # (1024 psi, 192 s)
ring = sharpen(ring.astype(np.float32), 1.2, 0.35)
cv2.imwrite(f"{d}/tile_ring.png", np.ascontiguousarray(ring.transpose(1, 0, 2)).astype(np.uint8))  # rows = s, cols = psi
meta = json.load(open(f"{d}/tiles04.json"))
meta["ring"] = {"psi": [-math.pi, math.pi], "rowsAlongTunnel": "one ring period", "sourceY": RING_Y, "size": [1024, 192],
                "period_u": 6.5, "lipAxial_u": 7.1, "lipS": round((526 - RING_Y[0]) / (RING_Y[1] - RING_Y[0]), 3)}
json.dump(meta, open(f"{d}/tiles04.json", "w"), indent=1)
print("ring tile written")
