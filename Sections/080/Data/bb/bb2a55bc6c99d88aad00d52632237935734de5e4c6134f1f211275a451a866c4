"""Screen 05 round 9 (`&m05near=1`): mask of the approved design E's NEAR rows that are real painted water.

E's first rows (V < 0.35, s ≈ 129.7–132.1) hold the water between the bottom gold-frame pieces of the approved picture
(pink banks, foam piles, bubbles) but also, at the very top and at the sides, pieces of the near gold frame, its rim
and the pale wall corners that the locked view hides behind the camera-held frame. Riding exposes them as orange /
white blocks on the water. This tool flags them by colour (orange / gold hue, or pale low-saturation grey that is not
bright foam) plus the rim rows, dilates and softens the result and writes an 8-bit mask (1 = keep E):
  python3 -I tools/match05/near_mask.py <E.png> <out_mask.png> [vmax=0.35] [rim=0.11]
The shader samples it at (eUV.x, V / vmax); rows beyond vmax are always kept.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
vmax = float(sys.argv[3]) if len(sys.argv) > 3 else 0.35
rim = float(sys.argv[4]) if len(sys.argv) > 4 else 0.11
im = Image.open(src).convert('RGBA')
W, H = im.size
rows = int(round(H * vmax))
a = np.asarray(im, dtype=np.float32)[:rows] / 255.0
hsv = np.asarray(Image.fromarray((a[..., :3] * 255).astype(np.uint8)).convert('HSV'), dtype=np.float32) / 255.0
h, s, v = hsv[..., 0] * 360.0, hsv[..., 1], hsv[..., 2]
orange = (h > 8) & (h < 55) & (s > 0.3) & (v > 0.3)
grey = (s < 0.22) & (v > 0.35) & (v < 0.86)
bad = orange | grey
bad[: int(round(H * rim))] = True
# the pale wall corners with white highlight blocks outside the frame's inner arc (upper corners of the near rows)
yy, xx = np.mgrid[0:rows, 0:W]
bad |= (yy < H * 0.26) & ((xx < W * 0.17) | (xx > W * 0.83))
m = Image.fromarray(((~bad) * 255).astype(np.uint8))
m = m.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MinFilter(9))   # dilate the flagged pieces (~8 texels)
m = m.filter(ImageFilter.GaussianBlur(4))
m = m.resize((W // 2, rows // 2), Image.LANCZOS)
m.save(out)
k = np.asarray(m, dtype=np.float32) / 255.0
print(out, m.size, 'kept share', round(float(k.mean()), 3), 'rows', rows, 'vmax', vmax)
