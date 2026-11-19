"""Screen 04 round 9 BLUEPRINT: structural measurements of the approved picture (frame px, 864 x 1536) + an annotated
overlay. usage: python3 -I tools/match04/blueprint04.py references/04_through_the_five_arrows.png <out_overlay.png> <out.json>"""
import json, sys
import numpy as np, cv2
from scipy import ndimage as ndi
A = cv2.imread(sys.argv[1]); H, W = A.shape[:2]
B, G, R = [A[..., i].astype(int) for i in range(3)]
hsv = cv2.cvtColor(A, cv2.COLOR_BGR2HSV).astype(int)
out = {}
# --- arrows: white-cyan glowing bars in the centre lane --------------------------------------------------------------
arrow = (R > 175) & (G > 225) & (B > 235) & (B - R > 15)
arrow[:650] = False; arrow[1000:] = False; arrow[:, :300] = False; arrow[:, 640:] = False
arrow = ndi.binary_opening(arrow, np.ones((2, 3)))
lab, n = ndi.label(ndi.binary_closing(arrow, np.ones((5, 9))))
arr = []
for i, sl in enumerate(ndi.find_objects(lab)):
    ys, xs = sl; area = int((lab[sl] == i + 1).sum())
    if area > 150: arr.append({"x0": xs.start, "x1": xs.stop, "y0": ys.start, "y1": ys.stop, "area": area})
arr.sort(key=lambda a: -a["y1"]); out["arrows"] = arr
# --- coins: saturated gold discs left of the lane ---------------------------------------------------------------------
coin = (R > 200) & (G > 140) & (G < 225) & (B < 90) & (hsv[..., 1] > 150)
coin[:650] = False; coin[:, 460:] = False
lab, n = ndi.label(ndi.binary_opening(coin, np.ones((3, 3))))
cs = []
for i, sl in enumerate(ndi.find_objects(lab)):
    ys, xs = sl; area = int((lab[sl] == i + 1).sum())
    if area > 250: cs.append({"cx": (xs.start + xs.stop) // 2, "cy": (ys.start + ys.stop) // 2, "w": xs.stop - xs.start, "h": ys.stop - ys.start})
# keep the painted coin line (the five coins on the left of the lane); other gold blobs are ring glints / the bowl rim
cs = [c for c in cs if c["cy"] < 1100 and abs(c["cy"] - (974 - (c["cx"] - 176) * 1.06)) < 30]
cs.sort(key=lambda c: -c["cy"]); out["coins"] = cs
# --- river: per row, the cyan lane and the pink / magenta bands (below the vanishing point) ----------------------------
cyan = (B > 190) & (G > 140) & (R < 170) & (B > R + 40)
pink = (R > 190) & (B > 120) & (G < 140) & (R > G + 80)
rows = {}
for y in (720, 760, 800, 850, 900, 950, 1000, 1100, 1200, 1300, 1400, 1500):
    c = np.nonzero(cyan[y])[0]; p = np.nonzero(pink[y])[0]
    rows[y] = {"cyan_px": int(len(c)), "cyan_x": [int(np.percentile(c, 5)), int(np.percentile(c, 95))] if len(c) > 10 else None,
               "pink_px": int(len(p)), "pink_left_px": int((p < W // 2).sum()), "pink_right_px": int((p >= W // 2).sum())}
out["river_rows"] = rows
# --- foam: bright low-saturation lilac-white, outside the arrow lane ------------------------------------------------
foam = (hsv[..., 1] < 70) & (hsv[..., 2] > 200) & (B >= R - 10)
foam[:300] = False
foam = ndi.binary_opening(foam, np.ones((5, 5)))
lab, n = ndi.label(ndi.binary_closing(foam, np.ones((9, 9))))
fs = []
for i, sl in enumerate(ndi.find_objects(lab)):
    ys, xs = sl; area = int((lab[sl] == i + 1).sum())
    if area > 2500: fs.append({"x0": xs.start, "x1": xs.stop, "y0": ys.start, "y1": ys.stop, "area": area})
out["foam"] = fs
# --- nested rings: dark grooves along the ray from the vanishing point straight up -----------------------------------
VP = (490, 690); MC = (435, 790)
lum = cv2.GaussianBlur(A.astype(np.float32) @ np.array([0.11, 0.59, 0.3], np.float32), (0, 0), 1.5)
prof = [float(lum[VP[1] - t, VP[0] - int(t * 0.16)]) for t in range(0, 300)]
pr = np.array(prof); sm = ndi.uniform_filter1d(pr, 5)
grooves = [t for t in range(8, 295) if sm[t] == sm[max(0, t - 6):t + 7].min() and sm[t] < ndi.uniform_filter1d(pr, 31)[t] - 12]
out["ring_grooves_px_above_vp"] = grooves
out["fixed"] = {"vanishing_point": VP, "mouth_centre_px": MC,
                "mouth_inner_px": {"top": [434, 445], "left": [87, 790], "right": [782, 794]},
                "mouth_outer_px": {"top": [434, 392], "left": [37, 788], "right": [834, 793]},
                "painted_band_px_top": [402, 460], "basin_rim_top_px": 338,
                "porthole_px": {"cx": 437, "cy": 228, "r": 122}, "console_px": [0, 180, 350, 380], "tshirt_display_px": [70, 225, 215, 325],
                "towels_px": [610, 180, 864, 300], "shelf_px": [565, 300, 864, 360], "benny_px": [190, 975, 590, 1400]}
json.dump(out, open(sys.argv[3], "w"), indent=1)
# --- overlay ------------------------------------------------------------------------------------------------------------
O = A.copy()
ov = O.copy()
def T(img, s, p, c=(255, 255, 255)):
    cv2.putText(img, s, p, cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 4, cv2.LINE_AA); cv2.putText(img, s, p, cv2.FONT_HERSHEY_SIMPLEX, 0.55, c, 1, cv2.LINE_AA)
cv2.ellipse(O, MC, (348, 345), 0, 180, 360, (0, 255, 0), 2); cv2.ellipse(O, MC, (398, 398), 0, 180, 360, (0, 200, 0), 2)
T(O, "OPENING inner r~347px / outer ~398px, centre (435,790)", (20, 1030), (120, 255, 120))
cv2.circle(O, VP, 6, (0, 0, 255), -1); T(O, "VP (490,690)", (500, 680), (120, 120, 255))
for g in grooves:
    t = g; cv2.circle(O, (VP[0] - int(t * 0.16), VP[1] - t), 4, (255, 0, 255), -1)
T(O, f"{len(grooves)} ring grooves VP->mouth top", (500, 640), (255, 120, 255))
for i, a in enumerate(arr):
    cv2.rectangle(O, (a["x0"], a["y0"]), (a["x1"], a["y1"]), (255, 255, 0), 2); T(O, f"A{i+1}", (a["x1"] + 4, a["y1"]), (255, 255, 0))
for i, c in enumerate(cs):
    cv2.circle(O, (c["cx"], c["cy"]), max(c["w"], c["h"]) // 2 + 3, (0, 215, 255), 2); T(O, f"C{i+1}", (c["cx"] - 60, c["cy"]), (0, 215, 255))
for f in fs:
    cv2.rectangle(O, (f["x0"], f["y0"]), (f["x1"], f["y1"]), (255, 255, 255), 2)
T(O, "FOAM (white boxes): low piles at the frame edges", (20, 1525), (255, 255, 255))
for y, r in rows.items():
    if r["cyan_x"]: cv2.line(O, (r["cyan_x"][0], y), (r["cyan_x"][1], y), (255, 200, 0), 2)
T(O, "CYAN LANE (blue lines, 5-95 %)", (560, 1060), (255, 200, 0))
cv2.circle(O, (437, 228), 122, (255, 128, 0), 2); T(O, "ROOM: porthole", (330, 370 - 20), (255, 160, 60))
cv2.rectangle(O, (0, 180), (350, 380), (255, 128, 0), 2); T(O, "console", (10, 395), (255, 160, 60))
cv2.rectangle(O, (565, 180), (864, 360), (255, 128, 0), 2); T(O, "towels+shelf", (650, 375), (255, 160, 60))
cv2.line(O, (0, 392), (300, 360), (0, 128, 255), 2); cv2.line(O, (300, 360), (470, 338), (0, 128, 255), 2); cv2.line(O, (470, 338), (864, 376), (0, 128, 255), 2)
T(O, "basin rim (pink bowl below)", (560, 420), (0, 160, 255))
cv2.rectangle(O, (190, 975), (590, 1400), (180, 180, 180), 2); T(O, "BENNY", (330, 1420), (200, 200, 200))
cv2.ellipse(O, (470, 1000), (560, 560), 0, 100, 180, (0, 128, 255), 2); T(O, "near bowl rim (gold arc, bottom-left)", (20, 1370), (0, 160, 255))
cv2.imwrite(sys.argv[2], O)
print(json.dumps({k: out[k] for k in ("arrows", "coins", "ring_grooves_px_above_vp")}, indent=None))
print(json.dumps(out["river_rows"])); print(json.dumps(out["foam"]))
