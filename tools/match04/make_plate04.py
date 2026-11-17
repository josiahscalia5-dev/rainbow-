"""Screen 04 (?match04=1): texture plate = the user's ORIGINAL approved pixels; PROVISIONAL local fill (OpenCV
inpainting, Telea) only where the HUD bar, title banner, Benny and the five coins are (the game draws those itself).
A fal nano-banana-2/edit clean plate is prepared (qa/match/04/FAL_PLATE_REQUEST.md) but NOT run.
Also cuts the material patches for unseen surfaces (tunnel rings, water, room wall) from the artwork.
usage: python3 -I tools/match04/make_plate04.py <approved.png> <out dir>"""
import sys, json
import numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
A = cv2.imread(src, cv2.IMREAD_COLOR); H, W = A.shape[:2]
M = np.zeros((H, W), np.uint8)
# HUD bar + title banner (rounded pills)
cv2.rectangle(M, (55, 12), (808, 108), 255, -1)
cv2.rectangle(M, (98, 112), (768, 190), 255, -1)
# Benny: pom-pom, beanie (with star), body + paws; down to where his fur meets the water
cv2.ellipse(M, (400, 1032), (84, 78), 0, 0, 360, 255, -1)
cv2.ellipse(M, (395, 1160), (172, 92), 0, 0, 360, 255, -1)
cv2.ellipse(M, (392, 1290), (224, 130), 0, 0, 360, 255, -1)
# the picture's coins (centre, diameter): they are real pickups in the game
COINS = [(175, 970, 112), (262, 872, 82), (330, 792, 58), (378, 742, 40), (423, 712, 26)]
for x, y, d in COINS:
    cv2.ellipse(M, (x, y), (int(d * 0.62), int(d * 0.58)), 0, 0, 360, 255, -1)
M = cv2.dilate(M, np.ones((7, 7), np.uint8))
fill = cv2.inpaint(A, M, 9, cv2.INPAINT_TELEA)
# texture the large fills: low frequencies from the inpainting (colour continuity), high frequencies from a mirrored
# tiling of an artwork patch (swirling water under Benny, room/foam under the HUD) so moving views see texture, not smears
def tiled(patch, h, w):
    p = np.concatenate([patch, patch[:, ::-1]], 1); p = np.concatenate([p, p[::-1]], 0)
    return np.tile(p, (h // p.shape[0] + 1, w // p.shape[1] + 1, 1))[:h, :w].astype(np.float32)
def hi(img, s=10): img = img.astype(np.float32); return img - cv2.GaussianBlur(img, (0, 0), s)
low = cv2.GaussianBlur(fill.astype(np.float32), (0, 0), 10)
tex = np.zeros_like(low)
tex[:200] = hi(tiled(A[230:330, 590:700], 200, W))[:200]           # room / foam above, under the HUD + title
tex[200:] = hi(tiled(A[1110:1250, 30:180], H - 200, W))             # swirling cyan/pink water left of Benny (Benny, coins)
filled = np.clip(low + 0.85 * tex, 0, 255)
a = cv2.GaussianBlur(M.astype(np.float32) / 255, (0, 0), 3)[..., None]
plate = np.clip(A * (1 - a) + filled * a, 0, 255).astype(np.uint8)
cv2.imwrite(f"{out}/plate04_hybrid.png", plate)
cv2.imwrite(f"{out}/plate04_fillmask.png", M)
# material patches cut from the ORIGINAL artwork (mirrored-repeat tiled in the shader)
cv2.imwrite(f"{out}/patch_gold.png", A[560:700, 600:720])      # inner tunnel rings (gold bands)
cv2.imwrite(f"{out}/patch_water.png", A[1110:1250, 30:180])     # swirling cyan/pink water (no foam)
cv2.imwrite(f"{out}/patch_wall.png", A[300:420, 560:700])       # pink room wall / foam edge
json.dump({"filled_share": float((M > 0).mean()), "coins_px": COINS}, open(f"{out}/plate04.json", "w"), indent=1)
print("filled share", (M > 0).mean())
