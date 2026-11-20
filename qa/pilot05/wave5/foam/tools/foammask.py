"""Foam-bank mask + near-camera width/height metrics (wave 5, foam specialist).
mask  = foam-coloured pixels (R >= 140, G >= 140, B >= 200: white / lavender / blue-lavender soap; cyan water
        has R < 80, pink bands and walls have G < 110, gold rings have B < 200), morphologically OPENED with an 11x11 box
        (drops water glints, thin flow streaks, droplet spray), Benny bbox x230-612 y760-1200 removed.
width(row) per side = number of mask pixels in that half of the row (x<432 left, x>=432 right).
near-camera bank width = mean of width(row) over rows y = 900..1400 (Benny level to near bottom),
                         as % of the 864-px image width.
"""
import os
import sys
import numpy as np
from PIL import Image

def erode(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        out &= np.roll(m, dy, 0)
    m2 = out.copy()
    for dx in range(-r, r + 1):
        m2 &= np.roll(out, dx, 1)
    return m2

def dilate(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        out |= np.roll(m, dy, 0)
    m2 = out.copy()
    for dx in range(-r, r + 1):
        m2 |= np.roll(out, dx, 1)
    return m2

def foam_mask(p):
    a = np.asarray(Image.open(p).convert('RGB')).astype(int)
    mn = a.min(2); mx = a.max(2)
    m = (a[..., 0] >= 140) & (a[..., 1] >= 140) & (a[..., 2] >= 200)
    r = int(os.environ.get('FOAM_OPEN', '5'))  # 3 = 7x7 opening, 5 = 11x11
    m = dilate(erode(m, r), r)
    m[760:1200, 230:612] = False
    m[:200] = False  # HUD
    return m, a

def metrics(p, y0=900, y1=1400):
    m, a = foam_mask(p)
    H, W = m.shape
    L = m[y0:y1, :W // 2].sum(1); R = m[y0:y1, W // 2:].sum(1)
    return m, a, 100 * L.mean() / W, 100 * R.mean() / W

if __name__ == '__main__':
    outdir = sys.argv[1]
    for p in sys.argv[2:]:
        m, a, l, r = metrics(p)
        H, W = m.shape
        print(f'{p}: near-camera bank width (mean px-count y900-1400)  L {l:.1f}%  R {r:.1f}%')
        for y0, y1 in ((560, 700), (700, 900), (900, 1100), (1100, 1300), (1300, 1536)):
            Lw = m[y0:y1, :W // 2].sum(1).mean(); Rw = m[y0:y1, W // 2:].sum(1).mean()
            print(f'   rows {y0}-{y1}: L {Lw:6.1f}px {100*Lw/W:5.1f}%   R {Rw:6.1f}px {100*Rw/W:5.1f}%')
        vis = a.copy(); vis[m] = (vis[m] * 0.3 + np.array([0, 255, 0]) * 0.7).astype(int)
        Image.fromarray(vis.astype(np.uint8)).resize((432, 768)).save(outdir + '/mask_' + p.replace('/', '_'))
