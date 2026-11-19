from collections import deque
import numpy as np

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

