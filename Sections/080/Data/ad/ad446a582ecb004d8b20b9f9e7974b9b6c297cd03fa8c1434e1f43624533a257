"""Screen 04: composite the ONE fal clean plate (qa/match/04/fal/, request 01a1ea70-42d8-7943-b035-7bb5f129d872) into
the texture plate - ONLY inside plate04_fillmask.png (HUD, title, Benny, coins); the user's original pixels everywhere
else. The plate is aligned to the approved picture first (ECC affine, measured outside the fill mask).
Writes NEW files (milestone 1/2 plate04_hybrid.png stays untouched): plate04_hybrid_fal.png + plate04_fal_alignment.json.
usage: python3 -I tools/match04/fal_plate04.py <approved.png> <fal plate.png> <out dir>"""
import sys, json
import numpy as np, cv2
src, fal, out = sys.argv[1:4]
A = cv2.imread(src); H, W = A.shape[:2]
P0 = cv2.imread(fal)
P = cv2.resize(P0, (W, H), interpolation=cv2.INTER_AREA)            # 1536x2752 -> 864x1536 (aspect 0.558 vs 0.5625)
M = cv2.imread(f"{out}/plate04_fillmask.png", cv2.IMREAD_GRAYSCALE)
g = lambda im: cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255, (0, 0), 1.5)
valid = cv2.erode((M == 0).astype(np.uint8) * 255, np.ones((25, 25), np.uint8)); valid[:200] = 0   # skip HUD strip
warp = np.eye(2, 3, dtype=np.float32)
cc, warp = cv2.findTransformECC(g(A), g(P), warp, cv2.MOTION_AFFINE,
                                (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), valid, 5)
Pa = cv2.warpAffine(P, warp, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
outside = (valid > 0)
d0 = np.abs(A.astype(int) - P.astype(int)).max(2)[outside]; d1 = np.abs(A.astype(int) - Pa.astype(int)).max(2)[outside]
# colour match the plate to the original around the mask (per channel gain/offset in a ring around the fill)
ring = (cv2.dilate(M, np.ones((41, 41), np.uint8)) > 0) & (M == 0); ring[:200] = False
Pf = Pa.astype(np.float32)
for c in range(3):
    a, b = Pf[..., c][ring], A[..., c][ring].astype(np.float32)
    k = b.std() / max(a.std(), 1e-3); Pf[..., c] = (Pf[..., c] - a.mean()) * k + b.mean()
a = cv2.GaussianBlur(M.astype(np.float32) / 255, (0, 0), 3)[..., None]
plate = np.clip(A * (1 - a) + Pf * a, 0, 255).astype(np.uint8)
cv2.imwrite(f"{out}/plate04_hybrid_fal.png", plate)
rep = {"fal_request_id": "01a1ea70-42d8-7943-b035-7bb5f129d872", "ecc": float(cc), "affine": warp.tolist(),
       "outside_mask_within20_before_align": float((d0 <= 20).mean()), "outside_mask_within20_after_align": float((d1 <= 20).mean()),
       "composited_share": float((M > 0).mean())}
json.dump(rep, open(f"{out}/plate04_fal_alignment.json", "w"), indent=1); print(rep)
