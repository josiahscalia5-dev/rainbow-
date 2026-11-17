"""Screen 05 HUD (hud05): cut the four static HUD ICONS out of the approved picture (heart, white plus, coin, pause button)
as RGBA sprites for src/ui/hud.ts. Live values (hearts "5/5", the coin counter, the level title) stay DOM text.
Each sprite is a rectangle / circle of the approved pixels around the icon, measured on
references/05_flow_into_the_current.png (864 x 1536). Inside the top bar the approved background is a flat purple
(mean ~ (88, 2, 127), std ~5 levels), the same colour the hud05 CSS bar is filled with, so the crop edge is feathered
(alpha ramps to 0 over the outer FEATHER px) instead of matted.
usage (repo root): python3 -I qa/pilot05/full_reference_match/hud/icon_bake.py -> assets/textures/hud05/*.png"""
import os, json
import numpy as np
from PIL import Image

AP = "references/05_flow_into_the_current.png"
OUT = "assets/textures/hud05"
ap = np.asarray(Image.open(AP).convert("RGB"), np.uint8)
os.makedirs(OUT, exist_ok=True)
# name: (kind, geometry, feather px). rect: (x0, y0, x1, y1) inclusive-exclusive; circle: (cx, cy, r_out)
ICONS = {
    "heart05": ("rect", (60, 21, 154, 95), 4.0),
    "plus05": ("rect", (254, 28, 310, 77), 3.0),
    "coin05": ("circle", (419.5, 57.0, 44.0), 3.0),
    "pause05": ("circle", (774.5, 56.5, 47.0), 2.5),
}
meta = {}
for name, (kind, g, fe) in ICONS.items():
    if kind == "rect":
        x0, y0, x1, y1 = g
        rgb = ap[y0:y1, x0:x1]
        h, w = rgb.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w] + 0.5
        d = np.minimum.reduce([xx, w - xx, yy, h - yy])
        a = np.clip(d / fe, 0, 1)
        box = (x0, y0, w, h)
    else:
        cx, cy, r = g
        x0, y0 = int(np.floor(cx - r)), int(np.floor(cy - r))
        x1, y1 = int(np.ceil(cx + r)) + 1, int(np.ceil(cy + r)) + 1
        rgb = ap[y0:y1, x0:x1]
        h, w = rgb.shape[:2]
        yy, xx = np.mgrid[0:h, 0:w]
        rr = np.hypot(xx + x0 - cx, yy + y0 - cy)
        a = np.clip((r - rr) / fe, 0, 1)
        box = (x0, y0, w, h)
    img = np.dstack([rgb, (a * 255 + 0.5).astype(np.uint8)])
    Image.fromarray(img, "RGBA").save(f"{OUT}/{name}.png", optimize=True)
    meta[name] = dict(left=box[0], top=box[1], width=box[2], height=box[3])
    print(name, meta[name])
json.dump(meta, open(f"{OUT}/hud05_icons.json", "w"), indent=1)
