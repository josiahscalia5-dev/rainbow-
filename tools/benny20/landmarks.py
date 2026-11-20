"""Benny landmarks in an 864x1536 frame (Screen 04 start-view box x 170-620, y 900-1440 by default):
colour classes (violet knit / pom, cream-white knit, pink fur, gold star) -> per-class bbox, pixel count, median colour,
and the cuff's width at its lower rows. Read-only; for comparing APPROVED vs game captures at the same camera.
usage: python3 -I tools/benny20/landmarks.py <frame.png> [x0 y0 x1 y1]"""
import sys, json
import numpy as np
from PIL import Image

a = sys.argv[1:]
box = tuple(int(v) for v in a[1:5]) if len(a) >= 5 else (170, 900, 620, 1440)
im = np.asarray(Image.open(a[0]).convert('RGB')).astype(int)
x0, y0, x1, y1 = box
c = im[y0:y1, x0:x1]
R, G, B = c[..., 0], c[..., 1], c[..., 2]
cls = {
    # violet yarn: blue-dominant, little green, not cyan
    'violet': (B > 140) & (G < 110) & (B > R + 25) & (R > 40) & (B > G + 90),
    # cream-white / lilac-white knit
    'white': (R > 175) & (G > 130) & (B > 175) & (np.abs(R - B) < 60) & (G < np.minimum(R, B)) & (G > 0.55 * B),
    # pink fur: red-dominant, blue below red, low green
    'fur': (R > 120) & (R > B + 15) & (G < 0.62 * R) & (B > 60),
    'gold': (R > 200) & (G > 140) & (B < 120) & (R > B + 100),
}
out = {}
for k, m in cls.items():
    ys, xs = np.nonzero(m)
    if len(xs) < 20:
        out[k] = None
        continue
    # robust bbox: 1st / 99th percentiles
    out[k] = dict(n=int(m.sum()),
                  x=[int(np.percentile(xs, 1)) + x0, int(np.percentile(xs, 99)) + x0],
                  y=[int(np.percentile(ys, 1)) + y0, int(np.percentile(ys, 99)) + y0],
                  med=[int(v) for v in np.median(c[m], 0)],
                  mean=[int(v) for v in c[m].mean(0)])
# row profile: width of violet per row (cuff = the widest violet rows)
vw = cls['violet'].sum(1)
rows = [(int(y + y0), int(w)) for y, w in enumerate(vw) if w > 0]
if rows:
    wmax = max(w for _, w in rows)
    wide = [y for y, w in rows if w > 0.75 * wmax]
    out['cuff_rows'] = [min(wide), max(wide), wmax]
# fur lightness distribution (dark creases vs light tips)
fm = cls['fur']
if fm.sum() > 20:
    L = c[fm].mean(1)
    out['fur_L_p10_p50_p90'] = [int(np.percentile(L, p)) for p in (10, 50, 90)]
print(json.dumps(out))
