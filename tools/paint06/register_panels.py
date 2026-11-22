"""paint06 step 1: cut the four storyboard panels out of the user's sheet and register each one onto the approved
Screen 06 frame (864x1536) through the painted Benny they all share (SIFT on Benny's area, similarity transform).
out: qa/match/06/paint06/work/panelK.png + register.json"""
import json, sys
import cv2, numpy as np
from PIL import Image
R = '/home/user/rainbow-'
OUT = f'{R}/qa/match/06/paint06/work'
sheet = np.asarray(Image.open(f'{R}/docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png').convert('RGB'))
appr = np.asarray(Image.open(f'{R}/references/06_crest_the_rinse_arch.png').convert('RGB'))
BOX = {1: (14, 98, 505, 725), 2: (519, 98, 1011, 725), 3: (14, 787, 505, 1400), 4: (519, 787, 1011, 1400)}
sift = cv2.SIFT_create(6000)
ga = cv2.cvtColor(appr, cv2.COLOR_RGB2GRAY)
# Benny's area in the approved frame (hat + body + arms), measured on references/06
mA = np.zeros(ga.shape, np.uint8); mA[700:1200, 190:650] = 255
kA, dA = sift.detectAndCompute(ga, mA)
res = {}
for k, (x0, y0, x1, y1) in BOX.items():
    p = sheet[y0:y1, x0:x1].copy()
    Image.fromarray(p).save(f'{OUT}/panel{k}.png')
    gp = cv2.cvtColor(p, cv2.COLOR_RGB2GRAY)
    h, w = gp.shape
    mP = np.zeros(gp.shape, np.uint8); mP[int(h * 0.3):int(h * 0.98), int(w * 0.15):int(w * 0.85)] = 255
    kP, dP = sift.detectAndCompute(gp, mP)
    m = cv2.BFMatcher().knnMatch(dP, dA, k=2)
    good = [a for a, b in m if a.distance < 0.75 * b.distance]
    src = np.float32([kP[g.queryIdx].pt for g in good]); dst = np.float32([kA[g.trainIdx].pt for g in good])
    M, inl = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=3.0, maxIters=20000)
    sc = float(np.hypot(M[0, 0], M[1, 0])); rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    corners = cv2.transform(np.float32([[[0, 0]], [[w, 0]], [[0, h]], [[w, h]]]), M).reshape(-1, 2)
    # residual on inliers
    sel = inl.ravel() == 1
    err = np.linalg.norm(cv2.transform(src[sel][:, None], M).reshape(-1, 2) - dst[sel], axis=1)
    res[k] = {'box_in_sheet': [x0, y0, x1, y1], 'size': [w, h], 'M': M.tolist(), 'scale': sc, 'rot_deg': rot,
              'inliers': int(sel.sum()), 'median_err_px': float(np.median(err)), 'corners_in_frame': corners.round(1).tolist()}
    print(k, f'scale {sc:.4f} rot {rot:.2f}° inliers {sel.sum()} err {np.median(err):.2f}px corners', corners.round(0).tolist())
json.dump(res, open(f'{OUT}/register.json', 'w'), indent=1)
