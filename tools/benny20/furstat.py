"""fur colour stats: mean RGB, HSV saturation / brightness p10/50/90.
  rect mode:  python3 -I tools/benny20/furstat.py <frame.png> x0 y0 x1 y1        (pink pixels in the rectangle)
  mask mode:  python3 -I tools/benny20/furstat.py <frame.png> --mask <mask.png>  (fur-red mask pixels below the cuff)"""
import sys, json
import numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
if sys.argv[2] == '--mask':
    mk = np.asarray(Image.open(sys.argv[3]).convert('RGB')).astype(int)
    r, g, b = mk[..., 0], mk[..., 1], mk[..., 2]
    fur = (r > 150) & (g < 100) & (b < 100)
    cuff = (b > 150) & (r < 100) & (g < 100)
    fur[:, :100] = False; fur[:, -100:] = False; fur[:700] = False; cuff[:700] = False
    ys, xs = np.nonzero(cuff)
    xc = int(np.median(xs)) if len(xs) else a.shape[1] // 2
    col = np.nonzero(cuff[:, xc - 3:xc + 4].any(1))[0]
    if len(col): fur[:col.max() + 4] = False
    c = a[fur]
    R, G, B = c[:, 0], c[:, 1], c[:, 2]
    c = c[(R > 60) & (R > B + 5) & (G < 0.62 * R)]
else:
    x0, y0, x1, y1 = (int(v) for v in sys.argv[2:6])
    c = a[y0:y1, x0:x1].reshape(-1, 3)
    R, G, B = c[:, 0], c[:, 1], c[:, 2]
    c = c[(R > 90) & (R > B + 5) & (G < 0.62 * R)]
px = c / 255
mx, mn = px.max(1), px.min(1)
sat = (mx - mn) / np.maximum(mx, 1e-6)
print(json.dumps({'n': int(len(px)), 'mean': [int(v) for v in px.mean(0) * 255],
                  'sat': [round(float(np.percentile(sat, p)), 2) for p in (10, 50, 90)],
                  'val': [round(float(np.percentile(mx, p)), 2) for p in (10, 50, 90)]}))
