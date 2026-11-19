"""Fit Marble's origin camera (focal length + principal point) to the image Marble was given
(qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png = approved 05 rows 197-767).
usage: python3 -I tools/marble05/fit_camera.py <world_dir> <out.json>"""
import json, sys, os
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from splatlib import load_ply, zbuffer

wd, outp = sys.argv[1], sys.argv[2]
S = load_ply(os.path.join(wd, "splats_500k.ply"), min_alpha=0.3)
ref = np.asarray(Image.open("qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png").convert("RGB"), float) / 255
H0, W0 = ref.shape[:2]
k = 2  # work at half resolution
W, H = W0 // k, H0 // k
refs = np.asarray(Image.fromarray((ref * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), float) / 255

def score(f, dx, dy):
    r = zbuffer(S["xyz"], S["rgb"], f / k, W / 2 + dx / k, H / 2 + dy / k, W, H)
    c = r["cov"]
    if c.sum() < 0.3 * W * H:
        return 9, c.mean()
    a, b = r["img"][c], refs[c]
    a = a - a.mean(0); b = b - b.mean(0)
    ncc = (a * b).sum() / np.sqrt((a * a).sum() * (b * b).sum())
    return -ncc, c.mean()

best = None
log = []
for f in np.arange(300, 1301, 25):
    s, cv = score(f, 0, 0)
    log.append((float(f), float(-s), float(cv)))
    if best is None or s < best[0]:
        best = (s, f, 0, 0)
f0 = best[1]
for f in np.arange(f0 - 30, f0 + 31, 5):
    for dx in range(-24, 25, 8):
        for dy in range(-24, 25, 8):
            s, cv = score(f, dx, dy)
            if s < best[0]:
                best = (s, f, dx, dy)
s, f, dx, dy = best
res = dict(world_dir=wd, image="qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png", image_size=[W0, H0],
           convention="OpenCV pinhole at the PLY origin, +x right, +y down, +z forward (Marble splat frame)",
           f_px=float(f), cx=float(W0 / 2 + dx), cy=float(H0 / 2 + dy), ncc=float(-s),
           hfov_deg=float(np.degrees(2 * np.arctan(W0 / 2 / f))), vfov_deg_crop=float(np.degrees(2 * np.arctan(H0 / 2 / f))),
           coarse_scan=log, splats_used=int(len(S["xyz"])), splats_total=int(S["n_total"]))
# the full approved frame (864x1536): the crop starts at row 197
res["full_frame"] = dict(size=[864, 1536], f_px=float(f), cx=float(W0 / 2 + dx), cy=float(H0 / 2 + dy + 197),
                         vfov_deg=float(np.degrees(np.arctan((H0 / 2 + dy + 197) / f) + np.arctan((1536 - (H0 / 2 + dy + 197)) / f))))
json.dump(res, open(outp, "w"), indent=1)
print(json.dumps({k_: v for k_, v in res.items() if k_ != "coarse_scan"}, indent=1))
