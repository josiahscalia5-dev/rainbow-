"""Big-blob foam metrics. mask = foammask.foam_mask (colour R,G,B >= 140,140,200, 7x7 opening, Benny bbox
and HUD removed). Blobs = 4-connected components with area >= 1200 px (drops glints/streaks/bubble rims) whose mean colour
is not cyan (mean R >= mean G - 25) and that are not flat streaks (bbox h <= 40 px and w >= 3h): drops the
water's light reflection streaks.
Per side (L: x<432, R: x>=432), rows y 950..1400 (near camera):
  WIDTH(row) = innermost foam x - outermost foam x + 1 of the big-blob mask in that half-row
  NEAR = mean WIDTH over rows that contain foam, also max; COVER = % of rows with foam
ROWS = % of rows y 700..1400 whose outer 40-px strip (frame edge) is >= 50 % big-blob foam (wall test)
"""
import sys
from collections import deque
import numpy as np
from PIL import Image
sys.path.insert(0, sys.argv[1])
from foammask import foam_mask

def big_blobs(m, A, amin=1200):
    H, W = m.shape
    lab = np.zeros(m.shape, np.int32); keep = np.zeros(m.shape, bool)
    ys, xs = np.nonzero(m); cur = 0
    for y0, x0 in zip(ys, xs):
        if lab[y0, x0]: continue
        cur += 1; q = deque([(y0, x0)]); lab[y0, x0] = cur; pts = []
        while q:
            y, x = q.popleft(); pts.append((y, x))
            for yy, xx in ((y+1, x), (y-1, x), (y, x+1), (y, x-1)):
                if 0 <= yy < H and 0 <= xx < W and m[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = cur; q.append((yy, xx))
        if len(pts) >= amin:
            p = np.array(pts)
            col = A[p[:, 0], p[:, 1]].mean(0)
            if col[0] < col[1] - 25: continue  # cyan-white water glint/reflection streak, not soap foam
            bh = p[:, 0].max() - p[:, 0].min() + 1; bw = p[:, 1].max() - p[:, 1].min() + 1
            if bh <= 40 and bw >= 3 * bh: continue  # flat wide streak (water reflection band), not a clump
            keep[p[:, 0], p[:, 1]] = True
    return keep

for p in sys.argv[2:]:
    m, a = foam_mask(p)
    k = big_blobs(m, a)
    H, W = k.shape; h = W // 2
    line = []
    for side in ('L', 'R'):
        half = k[:, :h] if side == 'L' else k[:, h:][:, ::-1]
        wid = []
        for y in range(950, 1400):
            xs = np.where(half[y])[0]
            wid.append(xs.max() - xs.min() + 1 if len(xs) else 0)
        wid = np.array(wid); nz = wid[wid > 0]
        rows = 100 * (half[700:1400, :40].mean(1) >= 0.5).mean()
        area = 100 * half[540:].mean() * (h / W)  # % of the full image area below y 540 (this half)
        ext = 0
        for y in range(700, H):
            xs = np.where(half[y])[0]
            if len(xs): ext = max(ext, xs.max() + 1)
        line.append(f'{side}: EXT(y>700) {ext:3d}px ({100*ext/W:4.1f}%)  NEAR mean {nz.mean() if len(nz) else 0:5.1f}px ({100*(nz.mean() if len(nz) else 0)/W:4.1f}%) max {wid.max():3d}px ({100*wid.max()/W:4.1f}%) COVER {100*len(nz)/len(wid):5.1f}%  ROWS {rows:5.1f}%  AREA(y>540) {area:4.1f}%')
    print(p); print('   ' + '\n   '.join(line))
    vis = a.copy(); vis[k] = (vis[k] * 0.3 + np.array([0, 255, 0]) * 0.7).astype(int)
    Image.fromarray(vis.astype(np.uint8)).resize((432, 768)).save(sys.argv[1] + '/cc_' + p.replace('/', '_'))
