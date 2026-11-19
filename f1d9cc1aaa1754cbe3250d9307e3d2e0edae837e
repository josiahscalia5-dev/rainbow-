"""Approved Screen 08 vs the fal environment-only plate: geometry fit + per-region numbers (same measures as
tools/qa/screen_match.py: mean |dRGB|, share within 10/20 levels, luminance SSIM, blurred LAYOUT)."""
import json, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import gaussian_filter

A_PATH, P_PATH, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
A = np.asarray(Image.open(A_PATH).convert("RGB"), float)
H, W = A.shape[:2]
Pfull = Image.open(P_PATH).convert("RGB")

# regions that were SUPPOSED to change (removed items), in approved pixel coordinates
removed = np.zeros((H, W), bool)
removed[:190, :] = True                                   # HUD bar + title banner band
removed[840:1245, 220:650] = True                          # Benny + splash directly around him
coins = [(479, 601, 12), (454, 608, 13), (420, 616, 15), (383, 633, 18), (428, 662, 20), (497, 686, 24),
         (467, 737, 29), (400, 786, 35), (335, 862, 42)]
yy, xx = np.mgrid[:H, :W]
for cx, cy, r in coins:
    removed |= (xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 10) ** 2
kept = ~removed

def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))

def metrics(C, m):
    d = np.abs(A - C).mean(-1); sm = ssim_map(A, C)
    Ab = np.stack([gaussian_filter(A[..., k], 8) for k in range(3)], -1)
    Cb = np.stack([gaussian_filter(C[..., k], 8) for k in range(3)], -1)
    db = np.abs(Ab - Cb).mean(-1)
    return dict(mean_abs=round(float(d[m].mean()), 2), within_10=round(float((d[m] <= 10).mean()), 4),
                within_20=round(float((d[m] <= 20).mean()), 4), ssim_lum=round(float(sm[m].mean()), 4),
                layout_mean_abs=round(float(db[m].mean()), 2), layout_within_20=round(float((db[m] <= 20).mean()), 4)), d

# 1) as delivered, squeezed to 864x1536 (what a naive comparison does)
C_naive = np.asarray(Pfull.resize((W, H), Image.LANCZOS), float)

# 2) geometry: SIFT matches on the kept scenery, affine (RANSAC), plate resized keeping its aspect
Pw = Pfull.resize((W, round(Pfull.size[1] * W / Pfull.size[0])), Image.LANCZOS)
P = np.asarray(Pw, float)
g1 = cv2.cvtColor(A.astype(np.uint8), cv2.COLOR_RGB2GRAY); g2 = cv2.cvtColor(P.astype(np.uint8), cv2.COLOR_RGB2GRAY)
sift = cv2.SIFT_create(6000)
k1, d1 = sift.detectAndCompute(g1, kept.astype(np.uint8) * 255)
k2, d2 = sift.detectAndCompute(g2, None)
mt = cv2.BFMatcher().knnMatch(d1, d2, k=2)
good = [m for m, n in mt if m.distance < 0.7 * n.distance]
src = np.float32([k2[m.trainIdx].pt for m in good]); dst = np.float32([k1[m.queryIdx].pt for m in good])
M, inl = cv2.estimateAffine2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=2.0, maxIters=20000)
sx, sy = float(np.hypot(M[0, 0], M[1, 0])), float(np.hypot(M[0, 1], M[1, 1]))
res = np.linalg.norm((src[inl.ravel() == 1] @ M[:, :2].T + M[:, 2]) - dst[inl.ravel() == 1], axis=1)
C_al = cv2.warpAffine(P.astype(np.float32), M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE).astype(float)
# plate pixel offset vs simple squeeze: where does the plate's content land, compared with squeezing it?
geo = dict(matches=len(good), inliers=int(inl.sum()), median_residual_px=round(float(np.median(res)), 2),
           scale_x=round(sx, 4), scale_y_vs_aspect_resize=round(sy, 4), shift_x_px=round(float(M[0, 2]), 1),
           shift_y_px=round(float(M[1, 2]), 1), rotation_deg=round(float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))), 3))

bands = {"upper chamber y190-600 (walls, rings, door, towel, upper spouts)": (190, 600),
         "middle y600-840 (river start, lower spouts, foam)": (600, 840),
         "Benny rows y840-1245 outside his box (side walls, rings, foam, bubbles)": (840, 1245),
         "bottom y1245-1536 (near river, foam, ring feet)": (1245, 1536)}
out = {"geometry_fit": geo, "naive_squeeze": {}, "aligned": {}}
for name, C in (("naive_squeeze", C_naive), ("aligned", C_al)):
    m_all, d = metrics(C, np.ones((H, W), bool))
    m_kept, _ = metrics(C, kept)
    m_rem, _ = metrics(C, removed)
    out[name] = {"whole_frame": m_all, "kept_scenery": m_kept, "removed_areas(expected to differ)": m_rem,
                 "bands_kept": {b: metrics(C, kept & (yy >= r0) & (yy < r1))[0] for b, (r0, r1) in bands.items()}}
    if name == "aligned":
        dk = gaussian_filter(d, 3) * kept
        heat = np.clip(dk / 60.0, 0, 1)
        vis = (A * 0.45 + np.dstack([heat * 255, heat * 40, heat * 40]) * 0.55 + 0).clip(0, 255)
        Image.fromarray(vis.astype(np.uint8)).save(OUT + "/diff_heat_aligned.png")
        Image.fromarray(C.clip(0, 255).astype(np.uint8)).save(OUT + "/plate_aligned_864x1536.png")
        # where are the biggest kept-scenery differences? 12 x 24 grid cells, worst 8
        cells = []
        for gy in range(24):
            for gx in range(12):
                y0, y1, x0, x1 = gy * 64, (gy + 1) * 64, gx * 72, (gx + 1) * 72
                m = kept[y0:y1, x0:x1]
                if m.mean() > 0.5:
                    cells.append((float(d[y0:y1, x0:x1][m].mean()), x0, y0))
        cells.sort(reverse=True)
        out["worst_kept_cells_mean_abs_x_y_64px"] = [[round(c, 1), x, y] for c, x, y in cells[:10]]
        out["mean_rgb_kept"] = dict(approved=[round(float(A[..., k][kept].mean()), 1) for k in range(3)],
                                    plate=[round(float(C[..., k][kept].mean()), 1) for k in range(3)])
        hsvA = cv2.cvtColor(A.astype(np.uint8), cv2.COLOR_RGB2HSV); hsvC = cv2.cvtColor(C.clip(0, 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
        out["mean_saturation_value_kept"] = dict(approved=[round(float(hsvA[..., 1][kept].mean()), 1), round(float(hsvA[..., 2][kept].mean()), 1)],
                                                 plate=[round(float(hsvC[..., 1][kept].mean()), 1), round(float(hsvC[..., 2][kept].mean()), 1)])
json.dump(out, open(OUT + "/plate_vs_approved_08.json", "w"), indent=1)
print(json.dumps(out, indent=1))
