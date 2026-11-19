"""Edge padding for a straight-alpha projection texture (coordinator tool, Screen 05 full reference match).

The baked foam-strip texture assets/textures/water05/proj05_A.png stores transparent texels as BLACK (rgb 0) and its
low-alpha edge texels nearly black. Bilinear filtering then mixes black into the edge colours, and the strip's stochastic
alpha dither keeps a few of those dark fragments: a dotted black line along the top of the left foam bank in the locked
05 frame (x 180-330, y 545-560). This tool keeps ALPHA unchanged and replaces the RGB of every texel that is not fully
opaque with the RGB of its nearest fully opaque texel, so filtering can no longer pull in black.

usage: python3 -I tools/proj05/pad_alpha.py <in.png> <out.png>
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGBA')).copy()
opaque = a[..., 3] == 255
if not opaque.any():
    sys.exit('no fully opaque texel: nothing to pad from')
# nearest opaque texel for every texel
_, (iy, ix) = ndimage.distance_transform_edt(~opaque, return_indices=True)
fill = ~opaque
a[fill, :3] = a[iy[fill], ix[fill], :3]
Image.fromarray(a, 'RGBA').save(dst, optimize=True)
print(f'padded {int(fill.sum())} texels (alpha kept) -> {dst}')
