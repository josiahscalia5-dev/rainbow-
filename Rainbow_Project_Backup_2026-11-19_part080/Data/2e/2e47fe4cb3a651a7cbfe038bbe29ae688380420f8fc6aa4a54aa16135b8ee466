"""Screen 05 full reference match — comparison masks of the APPROVED image (864x1536), one region per pixel.
Regions (Part 16 of the user's order): 1 gold rings + front gold frame, 2 purple walls + perforations, 3 side fittings,
4 water, 5 foam banks, 6 Benny + hat, 7 wake / splash, 8 coins, 9 bubbles, 10 HUD + text, 11 distant tunnel + end glow.
(12 = the whole frame.) Built from the approved picture only (colour rules + the registered water footprint + hand-checked
boxes / circles); nothing is excluded: every pixel belongs to exactly one region.
usage: python3 -I tools/match05/regions.py  ->  qa/pilot05/full_reference_match/masks/{region_index.png, region_preview.png, regions.json, <name>.png}"""
import json, os
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import binary_dilation, binary_closing, binary_opening, binary_fill_holes, label, gaussian_filter

OUT = "qa/pilot05/full_reference_match/masks"
T = "qa/pilot05/proj/target"
os.makedirs(OUT, exist_ok=True)
ap = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB")).astype(float) / 255
H, W = ap.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
R_, G_, B_ = ap[..., 0], ap[..., 1], ap[..., 2]
hsv = cv2.cvtColor((ap * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(float)
Hh, Ss, Vv = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
foot = np.asarray(Image.open(f"{T}/water_mask.png")) > 127                      # water + foam footprint (registered artwork)
blob = ~(np.asarray(Image.open("qa/worldlabs/05/05_env_mask.png").convert("L")) > 127) & (yy >= 760)   # Benny + splash dome
coins = np.asarray(Image.open(f"{T}/coin_mask.png")) > 127
VP = (497, 478)

# 10 HUD: top bar and level banner (rounded boxes measured on the approved picture)
hud = ((xx >= 30) & (xx <= 832) & (yy >= 12) & (yy <= 106)) | ((xx >= 114) & (xx <= 752) & (yy >= 110) & (yy <= 186))
# 6 Benny + hat: fur pink / hat purple / hat white / star gold inside the dome, largest filled component
pink = (R_ > 0.72) & (G_ < 0.62) & (B_ > 0.35) & (R_ - G_ > 0.22) & (Hh > 290)
purple = (B_ > 0.45) & (R_ > 0.25) & (G_ < 0.45) & (Hh > 250) & (Hh < 295)
star = (R_ > 0.8) & (G_ > 0.6) & (B_ < 0.45)
hatw = (Vv > 0.8) & (Ss < 0.25) & (yy > 880) & (yy < 1010) & (xx > 280) & (xx < 580)
b = (pink | purple | star | hatw) & blob & (yy < 1215) & (xx > 215) & (xx < 625)
b = binary_fill_holes(binary_closing(b, iterations=6))
lab, n = label(b)
benny = lab == (1 + np.argmax([(lab == i).sum() for i in range(1, n + 1)])) if n else b
benny = binary_fill_holes(binary_closing(benny, iterations=4))
# 7 wake / splash: the rest of the dome from Benny's shoulders down (white-blue spray, droplets, filaments)
splash = blob & ~benny & (yy >= 1010)
# 9 bubbles: hand-checked circles
bub = np.zeros((H, W), bool)
BUB = json.load(open(f"{OUT}/bubbles_approved.json"))
for c in BUB:
    bub |= (xx - c["x"]) ** 2 + (yy - c["y"]) ** 2 <= (c["r"] + 1.5) ** 2
# 5 foam banks: large pale clusters inside the footprint (thin white highlights removed by an opening)
pale = (Ss < 0.38) & (Vv > 0.72) & foot
foam = binary_opening(pale, iterations=5)
foam = binary_dilation(foam, iterations=4) & pale | foam
lab, n = label(binary_closing(foam, iterations=3))
keep = np.zeros_like(foam)
for i in range(1, n + 1):
    m = lab == i
    if m.sum() > 500: keep |= m
foam = keep & ~blob
# 11 distant tunnel + end glow: disc about the vanishing point (rings / walls there are a few pixels wide)
glow = ((xx - VP[0]) ** 2 + (yy - VP[1]) ** 2 <= 62 ** 2) & ~foot
# gold (rings, frame, fittings)
gold = (R_ > 0.5) & (R_ - B_ > 0.18) & (G_ > 0.25) & (G_ < R_ + 0.02) & (Hh > 8) & (Hh < 62) & (Ss > 0.25)
gold = binary_closing(gold, iterations=2)
# 3 side fittings: hand-checked boxes (left 1-3, right 1-3), gold inside each box
FIT = dict(L1=(52, 300, 222, 432), L2=(244, 408, 338, 478), L3=(366, 448, 404, 480), R1=(712, 388, 864, 540), R2=(626, 384, 702, 458), R3=(584, 428, 618, 466))
fit = np.zeros((H, W), bool)
for k, (x0, y0, x1, y1) in FIT.items():
    fit |= gold & (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)
# the front gold frame at the bottom (it lies over the water footprint): gold + its white-gold highlights, rows > 1100
frame = (R_ > 0.55) & (G_ > 0.30) & (B_ < 0.50) & (R_ - B_ > 0.22) & (yy > 1100)
frame = binary_dilation(binary_closing(frame, iterations=4), iterations=3) & (yy > 1100) & ~benny & ~blob
lab, n = label(frame)
fr = np.zeros_like(frame)
for i in range(1, n + 1):
    m = lab == i
    if m.sum() > 3000: fr |= m
frame = fr
# foam banks only within 80 px of the footprint's edge (mid-river white flares are water highlights)
edge_d = cv2.distanceTransform(foot.astype(np.uint8), cv2.DIST_L2, 5)
foam = foam & (edge_d < 80) & ~frame
foot = foot & ~frame
occupied = hud | benny | splash | coins | bub
water = foot & ~foam & ~occupied
foam = foam & ~occupied
rest = ~(hud | foot | benny | splash | coins | bub | frame)
glow = glow & rest
fit = fit & rest & ~glow
rings = (gold & rest & ~glow & ~fit) | (frame & ~occupied)
walls = rest & ~glow & ~fit & ~rings
idx = np.zeros((H, W), np.uint8)
order = [(2, walls), (1, rings), (3, fit), (11, glow), (4, water), (5, foam), (9, bub & ~hud), (7, splash & ~coins), (6, benny), (8, coins & ~hud), (10, hud)]
for i, m in order: idx[m] = i
idx[idx == 0] = 2
NAMES = {1: "gold_rings_and_front_frame", 2: "purple_walls", 3: "side_fittings", 4: "water", 5: "foam_banks", 6: "benny_and_hat", 7: "wake_splash", 8: "coins", 9: "bubbles", 10: "hud_and_text", 11: "distant_tunnel_and_glow"}
Image.fromarray(idx).save(f"{OUT}/region_index.png")
COL = {1: (255, 190, 0), 2: (110, 40, 170), 3: (255, 120, 0), 4: (0, 170, 255), 5: (235, 235, 255), 6: (255, 60, 160), 7: (150, 255, 255), 8: (255, 255, 0), 9: (0, 255, 120), 10: (90, 90, 90), 11: (255, 255, 200)}
pv = np.zeros((H, W, 3), np.uint8)
for i, c in COL.items(): pv[idx == i] = c
Image.fromarray((0.6 * pv + 0.4 * ap * 255).astype(np.uint8)).save(f"{OUT}/region_preview.png")
info = dict(vp_estimate=VP, fittings_boxes=FIT, bubbles=len(BUB), regions={NAMES[i]: dict(id=i, px=int((idx == i).sum()), share=round(float((idx == i).mean()), 4)) for i in NAMES})
json.dump(info, open(f"{OUT}/regions.json", "w"), indent=1)
for i, nme in NAMES.items(): Image.fromarray(((idx == i) * 255).astype(np.uint8)).save(f"{OUT}/{nme}.png")
print(json.dumps(info["regions"]))
