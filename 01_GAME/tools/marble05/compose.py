"""Compose the full-size camera-locked comparison pictures (separate files, no grid) + metrics.
usage: python3 -I tools/marble05/compose.py <scratch_dir> <out_dir>"""
import json, os, sys
import numpy as np
from PIL import Image
sp, out = sys.argv[1], sys.argv[2]
cmp_, mov = os.path.join(out, "compare"), os.path.join(out, "moved")
os.makedirs(cmp_, exist_ok=True); os.makedirs(mov, exist_ok=True)
L = lambda p: Image.open(p)
appr = L("references/05_flow_into_the_current.png").convert("RGB")
art = L("qa/pilot05/proj/align/artwork_aligned_864x1536.png").convert("RGBA")
raw = L(os.path.join(sp, "mf/spark_fullres_locked.png")).convert("RGB")
riv = L(os.path.join(sp, "blender_out/river_marble_locked.png")).convert("RGBA")
appr.save(os.path.join(cmp_, "1_APPROVED.png"))
raw.save(os.path.join(cmp_, "2_MARBLE_RAW_locked.png"))
new = raw.convert("RGBA"); new.alpha_composite(riv); new = new.convert("RGB")
new.save(os.path.join(cmp_, "3_NEW_marble_geometry_plus_projected_artwork_locked.png"))
# moved camera (1 tunnel radius forward): Marble world + projected river on Marble geometry; river-only pair
rawm = L(os.path.join(sp, "mf/spark_full500k_moved1R.png")).convert("RGBA")
rm = L(os.path.join(sp, "blender_out/river_marble_moved1R.png")).convert("RGBA")
rf = L(os.path.join(sp, "blender_out/river_flat_moved1R.png")).convert("RGBA")
x = rawm.copy(); x.alpha_composite(rm); x.convert("RGB").save(os.path.join(mov, "A_moved1R_marble_world_plus_projected_river.png"))
for name, im in (("B_moved1R_river_on_MARBLE_geometry.png", rm), ("C_moved1R_river_on_IDEAL_flat_floor.png", rf)):
    bg = Image.new("RGBA", im.size, (0, 0, 0, 255)); bg.alpha_composite(im); bg.convert("RGB").save(os.path.join(mov, name))
# metrics
A = np.asarray(art, float)[..., 3] / 255 > 0.5
ra = np.asarray(riv, float)[..., 3] / 255
n_ = np.asarray(new, float) / 255; ar = np.asarray(art.convert("RGB"), float) / 255
rows = np.arange(1536)[:, None] * np.ones((1, 864))
inp = (rows >= 197) & (rows < 767)
cov = lambda m: float((ra[m] > 0.5).mean())
mad = lambda m: float(np.abs(n_[m] - ar[m]).mean() * 255)
raw_ = np.asarray(raw, float) / 255; ap = np.asarray(appr, float) / 255
res = dict(
    note="Projection from the SAME camera reproduces the artwork wherever the mesh exists, so the locked view mainly tests coverage; the moved-camera pictures test the geometry.",
    water_footprint_px=int(A.sum()),
    coverage_of_artwork_water_by_marble_mesh=dict(all=cov(A), input_rows_197_767=cov(A & inp), below_row_767=cov(A & (rows >= 767))),
    new_vs_artwork_mean_abs_rgb_in_water=dict(all=mad(A), input_rows=mad(A & inp), below_row_767=mad(A & (rows >= 767))),
    marble_raw_vs_approved_mean_abs_rgb=dict(water_input_rows=float(np.abs(raw_ - ap)[A & inp].mean() * 255), water_below_767=float(np.abs(raw_ - ap)[A & (rows >= 767)].mean() * 255)),
)
json.dump(res, open(os.path.join(out, "compare_metrics.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
