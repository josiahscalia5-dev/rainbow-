"""Screen 05 round 18 (`&m05wcrisp=1`): the painted METAL of the approved near wall bay N1, without its slots.

The wall atlas (assets/textures/env05/wall05e.png, built by tools/env05/proj_bake.py from the APPROVED picture) holds the
approved near bay N1 in rows 592 … 847 (u = angle round the tube, 2048 texels; v = depth within the bay, 256 texels). It is
the sharpest and cleanest painted wall of the atlas. This tool removes its dark slots (and their pink rims) by
interpolating ALONG THE TUNNEL (v) across each slot — the painted light streaks run along the tunnel, so they stay
continuous — then takes one profile round the tube (2048 x 4). The game shader (src/vfx/proj05Tunnel.ts,
M05WCRISP_GLSL) uses it as the metal colour of the crisp slotted wall where a far bay's picture is magnified while swimming;
the slots themselves are drawn there at the painted size and shape.

usage: python3 -I tools/match05/wall_field05.py [out_dir]   (default assets/textures/match05/m05wcrisp)
Pixels used: the user's approved picture only (via the existing bake). No generated texture.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, gaussian_filter1d

out = sys.argv[1] if len(sys.argv) > 1 else "assets/textures/match05/m05wcrisp"
os.makedirs(out, exist_ok=True)
atlas = np.asarray(Image.open("assets/textures/env05/wall05e.png").convert("RGB")).astype(np.float32) / 255.0
meta = json.load(open("assets/textures/env05/env05.json"))["wall"]["rows"]["N1"]
N1 = atlas[meta["y0"]:meta["y0"] + meta["h"]]          # (256, 2048, 3)
H, W = N1.shape[:2]
lum = N1 @ np.array([0.299, 0.587, 0.114], np.float32)
r, g, b = N1[..., 0], N1[..., 1], N1[..., 2]
# slot cores: dark plum; bubble outlines / other non-wall bits: not purple-ish (low min(r, b) - g) and not bright
core = lum < 0.30
odd = ((np.minimum(r, b) - g) < 0.06) & (lum < 0.75)
mask = binary_dilation(core, structure=np.ones((7, 9), bool)) | binary_dilation(odd, structure=np.ones((3, 3), bool))
clean = N1.copy()
ys = np.arange(H)
for x in range(W):
    m = mask[:, x]
    if m.all():
        continue
    if m.any():
        good = ~m
        for c in range(3):
            clean[m, x, c] = np.interp(ys[m], ys[good], N1[good, x, c])
# a column that was all slot / non-wall: take its neighbours'
bad_cols = mask.all(0)
if bad_cols.any():
    good_x = np.where(~bad_cols)[0]
    for c in range(3):
        for y in range(H):
            clean[y, bad_cols, c] = np.interp(np.where(bad_cols)[0], good_x, clean[y, good_x, c])
# ONE profile round the tube: the painted streaks run along the tunnel (straight lines toward the vanishing point), the
# atlas draws them slightly tilted, so averaging many rows would blur them round the tube. Per column: the median of the
# un-masked texels of the central band (rows 96 … 159) of N1, gaps filled from the slot-free interpolation above.
band = slice(96, 160)
prof = np.zeros((W, 3), np.float32)
for x in range(W):
    good = ~mask[band, x]
    src = N1[band, x] if good.sum() >= 6 else clean[band, x]
    sel = src[good] if good.sum() >= 6 else src
    prof[x] = np.median(sel, axis=0)
# a light smoothing round the tube (one texel) only against single-texel noise
prof = gaussian_filter1d(prof, sigma=0.7, axis=0, mode="wrap")
field = np.repeat(prof[None], 4, axis=0)
img = (np.clip(field, 0, 1) * 255 + 0.5).astype(np.uint8)
Image.fromarray(img).save(os.path.join(out, "wall_field.png"), optimize=True)
rep = {"source": "assets/textures/env05/wall05e.png row N1 (rows 96-159, slots removed)", "w": W, "h": 4,
       "masked_fraction": float(mask.mean()), "mean_rgb": [float(v) for v in prof.mean(0)]}
json.dump(rep, open(os.path.join(out, "wall_field.json"), "w"), indent=1)
print(json.dumps(rep))
