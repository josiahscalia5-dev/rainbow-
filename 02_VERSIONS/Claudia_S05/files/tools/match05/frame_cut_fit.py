"""Screen 05 round 3 (`?framecut05=1`): the near gold frame's LEFT corner piece ends in a straight RADIAL cut
(tools/env05/frame_fit.py pieces_after: th1 = -127 deg at both band edges). The approved frame's cut is slanted: at the
bottom of the screen the gold reaches ~40 px further right. Here the end angle may differ between the inner edge (th1,
t = 0) and the outer edge (thOut, t = 1); everything else of the piece stays as fitted. Same objective as frame_fit.py
(approved frame px missed + approved water px covered, rows >= 1100) judged near the cut only (x < 330, y >= 1300).
usage: python3 -I tools/match05/frame_cut_fit.py <out.json>"""
import json, sys
import numpy as np
from PIL import Image
W, H = 864, 1536
M = "qa/pilot05/full_reference_match/masks"
idx = np.asarray(Image.open(f"{M}/region_index.png"))
rid = {k: v["id"] for k, v in json.load(open(f"{M}/regions.json"))["regions"].items()}
yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
zone = (yy >= 1300) & (xx < 330)
pos = (idx == rid["gold_rings_and_front_frame"]) & zone
neg = (idx == rid["water"]) & zone
cx, cy, a0, w, d, t0, t1 = 434.0, 1028.0, 456.0, 190.0, 1, -157.0, -127.0
rho = np.hypot(xx - cx, cy - yy); th = np.degrees(np.arctan2(cy - yy, xx - cx))
tt = np.clip((rho - a0) / w, 0, 1)
band = (rho >= a0) & (rho <= a0 + w)
lip = None
def region(th1, thO):
    end = th1 + tt * (thO - th1)          # end angle varies linearly across the band
    return band & (th >= t0) & (th <= end)
def cost(th1, thO):
    m = region(th1, thO)
    return int((pos & ~m).sum()), int((neg & m).sum())
best = (t1, t1); c0 = sum(cost(*best)); bc = c0
for th1 in np.arange(t1 - 3, t1 + 3.01, 0.25):
    for thO in np.arange(t1 - 2, t1 + 12.01, 0.25):
        c = sum(cost(th1, thO))
        if c < bc: bc, best = c, (float(th1), float(thO))
res = dict(before=dict(th1=t1, thOut=t1, missed_and_covered=cost(t1, t1)), after=dict(th1=best[0], thOut=best[1], missed_and_covered=cost(*best)))
print(json.dumps(res)); json.dump(res, open(sys.argv[1], "w"), indent=1)
