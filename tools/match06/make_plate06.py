"""Screen 06 (?match06=1): texture plate = the user's ORIGINAL approved pixels; PROVISIONAL local fill (OpenCV Telea
inpainting + high frequencies of mirrored artwork patches) only where the HUD bar, title banner, Benny (above his
ripples) and the 15 painted coins are (the game draws those itself). The ripples/splash round Benny stay (scenery).
A fal nano-banana-2/edit clean plate is prepared (qa/match/06/FAL_PLATE_REQUEST.md) but NOT run.
usage: python3 -I tools/match06/make_plate06.py <approved.png> <out dir>"""
import sys, json
import numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
A = cv2.imread(src, cv2.IMREAD_COLOR); H, W = A.shape[:2]
M = np.zeros((H, W), np.uint8)
# HUD bar + title banner (rounded pills)
cv2.rectangle(M, (30, 10), (830, 104), 255, -1)
cv2.rectangle(M, (128, 110), (736, 188), 255, -1)
# Benny: pom-pom, beanie (with star), body + paws, down to where his fur meets the ripples
cv2.ellipse(M, (415, 805), (92, 80), 0, 0, 360, 255, -1)
cv2.ellipse(M, (415, 935), (162, 90), 0, 0, 360, 255, -1)
cv2.ellipse(M, (420, 1085), (222, 100), 0, 0, 360, 255, -1)
cv2.ellipse(M, (420, 1150), (140, 40), 0, 0, 360, 255, -1)
# beanie corners + cuff (the ellipses leave its lower corners) and the fur outline measured on the picture (pink fur pixels)
cv2.rectangle(M, (252, 860), (582, 1012), 255, -1)
fur = (A[..., 2].astype(int) > 190) & (A[..., 1].astype(int) < 140) & (A[..., 0].astype(int) > 110) & (A[..., 0].astype(int) < 230)
roi = np.zeros((H, W), bool); roi[940:1190, 195:650] = True
M[cv2.dilate((fur & roi).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0] = 255
# the picture's 15 coins (centre, width, height of the gold blobs): real pickups in the game
COINS = [(267.6, 716.1, 101, 92), (178.6, 623.8, 82, 70), (234.3, 548.1, 59, 52), (319.6, 521.3, 43, 35), (407.6, 534.0, 32, 27),
         (505.9, 586.1, 22, 22), (557.5, 623.0, 19, 18), (594.8, 644.1, 19, 17), (619.1, 654.7, 19, 15), (642.7, 662.7, 16, 16),
         (659.5, 668.0, 14, 15), (675.2, 675.9, 13, 14), (687.8, 684.4, 10, 10), (696.0, 692.1, 7, 9), (703.4, 701.1, 8, 7)]
for x, y, w, h in COINS:
    cv2.ellipse(M, (int(x), int(y)), (int(w * 0.62 + 3), int(h * 0.62 + 4)), 0, 0, 360, 255, -1)
M = cv2.dilate(M, np.ones((7, 7), np.uint8))
fill = cv2.inpaint(A, M, 9, cv2.INPAINT_TELEA)
def tiled(patch, h, w):
    p = np.concatenate([patch, patch[:, ::-1]], 1); p = np.concatenate([p, p[::-1]], 0)
    return np.tile(p, (h // p.shape[0] + 1, w // p.shape[1] + 1, 1))[:h, :w].astype(np.float32)
def hi(img, s=10): img = img.astype(np.float32); return img - cv2.GaussianBlur(img, (0, 0), s)
low = cv2.GaussianBlur(fill.astype(np.float32), (0, 0), 8)
tex = np.zeros_like(low)
tex[:200] = hi(tiled(A[300:420, 380:540], 200, W))[:200]           # slotted purple tunnel wall, under the HUD + title
tex[200:700] = hi(tiled(A[560:640, 60:140], 500, W))               # cyan/pink river (crest coins)
tex[700:] = hi(tiled(A[1300:1460, 330:530], H - 700, W))           # cyan streaky water below Benny
filled = np.clip(low + 0.85 * tex, 0, 255)
a = cv2.GaussianBlur(M.astype(np.float32) / 255, (0, 0), 3)[..., None]
plate = np.clip(A * (1 - a) + filled * a, 0, 255).astype(np.uint8)
cv2.imwrite(f"{out}/plate06_hybrid.png", plate)
cv2.imwrite(f"{out}/plate06_fillmask.png", M)
json.dump({"filled_share": float((M > 0).mean()), "coins_px": COINS}, open(f"{out}/plate06.json", "w"), indent=1)
print("filled share", (M > 0).mean())
