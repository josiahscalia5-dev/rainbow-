"""Fit the input-picture camera inside a Marble world: homography between a guess render (known camera) and the picture.
python3 -I align.py <render.png> <picture.png> <render_fov> <lookx,looky,lookz> <out.json> [check.jpg]"""
import sys, json, math, numpy as np, cv2
ren_p, ref_p, rfov, look, out = sys.argv[1:6]
W, H = 540, 960
ref = cv2.resize(cv2.imread(ref_p), (W, H)); ren = cv2.resize(cv2.imread(ren_p), (W, H))
sift = cv2.SIFT_create(5000)
k1, d1 = sift.detectAndCompute(cv2.cvtColor(ren, cv2.COLOR_BGR2GRAY), None)
k2, d2 = sift.detectAndCompute(cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY), None)
good = [a for a, b in cv2.BFMatcher().knnMatch(d1, d2, k=2) if a.distance < 0.75 * b.distance]
p1 = np.float32([k1[a.queryIdx].pt for a in good]); p2 = np.float32([k2[a.trainIdx].pt for a in good])
Hm, mask = cv2.findHomography(p1, p2, cv2.RANSAC, 6.0)
f1 = (H / 2) / math.tan(math.radians(float(rfov) / 2)); K1 = np.array([[f1, 0, W / 2], [0, f1, H / 2], [0, 0, 1]])
best = None
for fov2 in np.arange(40, 120, 0.5):
    f2 = (H / 2) / math.tan(math.radians(fov2 / 2)); K2 = np.array([[f2, 0, W / 2], [0, f2, H / 2], [0, 0, 1]])
    R = np.linalg.inv(K2) @ Hm @ K1; R = R / np.cbrt(np.linalg.det(R)); U, s, Vt = np.linalg.svd(R); Rn = U @ Vt
    e = np.linalg.norm(R - Rn)
    if best is None or e < best[0]: best = (e, fov2, Rn)
e, fov2, R = best
f = np.array([float(x) for x in look.split(',')]); f /= np.linalg.norm(f)
z = -f; x = np.cross([0, 1, 0], z); x /= np.linalg.norm(x); y = np.cross(z, x); M = np.stack([x, y, z], 1)
ow = lambda v: M @ np.array([v[0], -v[1], -v[2]])
fwd = ow(R[2]); up = -ow(R[1]); fwd /= np.linalg.norm(fwd); up /= np.linalg.norm(up)
res = {'matches': len(good), 'inliers': int(mask.sum()), 'fov': float(fov2), 'fit_err': float(e), 'fwd': fwd.tolist(), 'up': up.tolist()}
json.dump(res, open(out, 'w'), indent=1); print(json.dumps(res))
if len(sys.argv) > 6: cv2.imwrite(sys.argv[6], np.concatenate([ref, cv2.warpPerspective(ren, Hm, (W, H))], 1))
