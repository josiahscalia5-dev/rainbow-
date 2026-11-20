"""fur colour stats (pink pixels) inside a rectangle: mean RGB, HSV saturation / brightness p10/50/90.
usage: python3 -I tools/benny20/furstat.py <frame.png> x0 y0 x1 y1"""
import sys, json
import numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
x0, y0, x1, y1 = (int(v) for v in sys.argv[2:6])
c = a[y0:y1, x0:x1].reshape(-1, 3)
R, G, B = c[:, 0], c[:, 1], c[:, 2]
m = (R > 90) & (R > B + 5) & (G < 0.62 * R)
px = c[m] / 255
mx, mn = px.max(1), px.min(1)
sat = (mx - mn) / np.maximum(mx, 1e-6)
print(json.dumps({'n': int(m.sum()), 'mean': [int(v) for v in px.mean(0) * 255],
                  'sat': [round(float(np.percentile(sat, p)), 2) for p in (10, 50, 90)],
                  'val': [round(float(np.percentile(mx, p)), 2) for p in (10, 50, 90)]}))
