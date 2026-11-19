"""Screen 07 (?match07=1): texture plate = the user's ORIGINAL approved pixels; PROVISIONAL local fill (smooth colour from
the surrounding pixels + high frequencies from a mirrored artwork patch) only where the HUD bar, title banner, Benny and the eight
coins are (the game draws those itself). A fal nano-banana-2/edit clean plate is prepared
(qa/match/07/FAL_PLATE_REQUEST.md) but NOT run. Also cuts the material patches and the ring-structured tiles:
  tile_wall.png   the painted tunnel wall UNWRAPPED through the locked camera over one painted ring bay (rings R2..R3),
                  angle -32..212 deg (water line right, over the top, water line left) x along; the shader repeats it
                  every BAY u along the axis so its rings line up with the painted rings R1/R2 (no smearing deep inside)
  tile_river.png  the painted river (cyan/pink swirls + foam banks) unwrapped on the water plane, lateral -5..5 u x one
                  stretch ahead of Benny (cross-faded for a seamless repeat along the tube)
(fill = normalized convolution of the surrounding original pixels, not Telea.)
usage: python3 -I tools/match07/make_plate07.py <approved.png> <proj07.json> <coins07.json> <out dir>"""
import sys, json, math
import numpy as np, cv2

src, projf, coinf, out = sys.argv[1:5]
A = cv2.imread(src, cv2.IMREAD_COLOR); H, W = A.shape[:2]
L = json.load(open(projf)); CO = json.load(open(coinf))["coins"]
M = np.zeros((H, W), np.uint8)
# HUD bar + title banner (rounded pills)
cv2.rectangle(M, (30, 10), (830, 104), 255, -1)
cv2.rectangle(M, (124, 110), (742, 186), 255, -1)
# Benny: pom-pom, beanie (with star), body + paws, down to where his fur meets the water (splash ring kept)
cv2.ellipse(M, (430, 852), (88, 82), 0, 0, 360, 255, -1)
cv2.ellipse(M, (425, 972), (172, 88), 0, 0, 360, 255, -1)
cv2.ellipse(M, (425, 1118), (222, 100), 0, 0, 360, 255, -1)
cv2.ellipse(M, (425, 1175), (140, 48), 0, 0, 360, 255, -1)
for c in CO:
    x, y, d = c["px"]; cv2.ellipse(M, (x, y), (int(d * 0.58) + 2, int(d * 0.52) + 2), 0, 0, 360, 255, -1)
M = cv2.dilate(M, np.ones((7, 7), np.uint8))
# low frequencies: normalized convolution of the surrounding ORIGINAL pixels (no Telea streaks across the big Benny hole)
keep = (M == 0).astype(np.float32)
def nconv(s): return cv2.GaussianBlur(A.astype(np.float32) * keep[..., None], (0, 0), s) / np.maximum(cv2.GaussianBlur(keep, (0, 0), s), 1e-4)[..., None]
fill = np.where((cv2.GaussianBlur(keep, (0, 0), 12) > 0.02)[..., None], nconv(12), nconv(40))
def tiled(patch, h, w):
    p = np.concatenate([patch, patch[:, ::-1]], 1); p = np.concatenate([p, p[::-1]], 0)
    return np.tile(p, (h // p.shape[0] + 1, w // p.shape[1] + 1, 1))[:h, :w].astype(np.float32)
def hi(img, s=10): img = img.astype(np.float32); return img - cv2.GaussianBlur(img, (0, 0), s)
low = cv2.GaussianBlur(fill.astype(np.float32), (0, 0), 4)
tex = np.zeros_like(low)
tex[:200] = hi(tiled(A[200:300, 560:700], 200, W))[:200]            # slotted tunnel wall under the HUD + title
tex[200:] = hi(tiled(A[1250:1400, 120:300], H - 200, W))             # swirling cyan/pink water (under Benny, coins)
filled = np.clip(low + 0.85 * tex, 0, 255)
a = cv2.GaussianBlur(M.astype(np.float32) / 255, (0, 0), 3)[..., None]
plate = np.clip(A * (1 - a) + filled * a, 0, 255).astype(np.uint8)
cv2.imwrite(f"{out}/plate07_hybrid.png", plate)
cv2.imwrite(f"{out}/plate07_fillmask.png", M)
# material patches (mirrored-repeat in the shader): gold band, slotted purple wall, foam, river
cv2.imwrite(f"{out}/patch_gold.png", A[440:520, 0:40])
cv2.imwrite(f"{out}/patch_wall.png", A[560:680, 40:160])
# ---- ring-structured tiles through the locked camera ----
Wc, Hc = L["camera"]["size"]; t = math.tan(math.radians(L["camera"]["fov"]) / 2); asp = Wc / Hc
MW = np.array(L["camera"]["matrixWorld"]).reshape(4, 4).T; C = MW[:3, 3]; R = MW[:3, :3]
D, U, X, base = (np.array(L[k], float) for k in ("D", "U", "X", "water")); T = L["tube"]
P_ = plate.astype(np.float32)
def proj(P):
    q = (P - C) @ R; return ((q[..., 0] / -q[..., 2] / (t * asp) + 1) / 2 * Wc).astype(np.float32), ((1 - q[..., 1] / -q[..., 2] / t) / 2 * Hc).astype(np.float32)
def sharpen(img, s=2.0, k=0.5): return np.clip(img + k * (img - cv2.GaussianBlur(img, (0, 0), s)), 0, 255)
th0, th1 = math.radians(-32), math.radians(212)
a2, a3 = L["rings"]["R2"], L["rings"]["R3"]
th = np.linspace(th1, th0, 1024)          # rows: left water line (top of the image) .. over the top .. right water line
al = np.linspace(a2, a3, 512)             # columns: along the axis, ring R2 at column 0, ring R3 at the last column
AL, TH = np.meshgrid(al, th)
cen = base + T["ax"] * X + T["h"] * U
P = cen + AL[..., None] * D + T["r"] * (np.cos(TH)[..., None] * X + np.sin(TH)[..., None] * U)
u, v = proj(P)
wall = cv2.remap(P_, u, v, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
cv2.imwrite(f"{out}/tile_wall.png", sharpen(wall).astype(np.uint8))
# river: rows = along (far at the top), columns = lateral
RIV_X, RIV_A = (-5.0, 5.0), (6.0, 16.0)
# seamless repeat: the far band (top rows, along a1-B..a1) fades into the stretch just before a0 (what follows the
# bottom row when the tile wraps), so the tile's top row continues exactly into its bottom row
x = np.linspace(*RIV_X, 512); n = 80; Lr = RIV_A[1] - RIV_A[0]
aa = np.linspace(RIV_A[1], RIV_A[0], 512); B = Lr * n / 511
def unwrap(alongs):
    XX, AA = np.meshgrid(x, alongs); P = base + XX[..., None] * X + AA[..., None] * D
    u, v = proj(P); return cv2.remap(P_, u, v, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
riv = unwrap(aa); ext = unwrap(aa[:n] - Lr)
w = np.linspace(1, 0, n)[:, None, None]          # row 0 (along a1) = ext (along a0) -> continuous across the wrap
riv[:n] = riv[:n] * (1 - w) + ext * w
cv2.imwrite(f"{out}/tile_river.png", sharpen(riv).astype(np.uint8))
json.dump({"filled_share": float((M > 0).mean()), "wall": {"theta": [th0, th1], "along": [a2, a3], "bay": a2 - L["rings"]["R1"]},
           "river": {"lateral": RIV_X, "along": RIV_A}}, open(f"{out}/tiles07.json", "w"), indent=1)
print("filled share", round((M > 0).mean(), 4))
