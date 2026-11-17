"""Screen 05 coins (coins05): bake the coin FACE texture from the approved picture's nearest coin.
The approved coin 1 (references/05_flow_into_the_current.png, face ellipse centre (474.0, 723.25), semi-axes 48.5 x 36.25
px, measured: left/right face edge x 426 / 522, top 687, face/edge-band boundary 759.5 on the centre column) is
un-foreshortened from its screen ellipse to a disc and written as a 256 x 256 upright texture (texel = DISPLAY colour;
src/gameplay/coins.ts shows it through the post-chain inverse PROJ05_INVERSE so the screen shows these colours).
The disc is sampled at 0.975 of the ellipse so the water around the coin never bleeds into the rim; texels outside the
disc copy the nearest rim texel (clean mipmaps).
usage (repo root): python3 -I qa/pilot05/full_reference_match/coins/coin_bake.py
  -> assets/textures/coins05/coin05_face.png"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

AP = "references/05_flow_into_the_current.png"
OUT = "assets/textures/coins05/coin05_face.png"
CX, CY, A, B = 474.0, 723.25, 48.5, 36.25
N = 256
SHRINK = 0.975

ap = np.asarray(Image.open(AP).convert("RGB"), float)
j, i = np.mgrid[0:N, 0:N]
x = (i + 0.5) / (N / 2) - 1.0          # -1..1, right
y = (j + 0.5) / (N / 2) - 1.0          # -1..1, down (texture is upright: row 0 = top of the coin)
r = np.hypot(x, y)
inside = r <= 1.0
# clamp outside texels onto the rim circle (nearest rim texel)
k = np.where(r > 1.0, 1.0 / np.maximum(r, 1e-6), 1.0)
xs = CX + x * k * A * SHRINK
ys = CY + y * k * B * SHRINK
# CX, CY, A, B are in pixel-index coordinates (pixel centre = integer index), as map_coordinates expects
out = np.stack([ndi.map_coordinates(ap[..., c], [ys, xs], order=3, mode="nearest") for c in range(3)], -1)
out = np.clip(out, 0, 255).astype(np.uint8)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
Image.fromarray(out).save(OUT, optimize=True)
print("wrote", OUT, out.shape, "mean face colour", out[inside].reshape(-1, 3).mean(0).round(1))
