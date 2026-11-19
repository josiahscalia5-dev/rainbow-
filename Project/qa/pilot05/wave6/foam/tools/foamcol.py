"""Foam colour stats (wave 6). Usage: python3 -I foamcol.py IMG...
Mask = foam colour (R>=140,G>=140,B>=200), 7x7 opening, HUD + Benny bbox removed, big non-cyan blobs (bankcc.big_blobs).
Per region (left/right bank y540-1000, near L/R y1000-1400): px count, mean RGB, WHITE% = pixels with min(R,G,B)>=235
(pure white), SHADE% = pixels with B-R>=30 (blue/lavender shaded), mean lum. Also the tallest vertical foam run in the
right strip x>=640, y 700-1000 (the 'white heap' test) and the right-strip foam px."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'wave5', 'foam', 'tools'))
os.environ.setdefault('FOAM_OPEN', '3')
import numpy as np
from foammask import foam_mask
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bigblobs import big_blobs

REG = {'Lfar': (0, 432, 520, 1000), 'Rfar': (432, 864, 520, 1000), 'Lnear': (0, 432, 1000, 1400), 'Rnear': (432, 864, 1000, 1400)}
for p in sys.argv[1:]:
    m, a = foam_mask(p)
    k = big_blobs(m, a)
    print(p)
    for nm, (x0, x1, y0, y1) in REG.items():
        sub = k[y0:y1, x0:x1]; px = a[y0:y1, x0:x1][sub]
        if len(px) == 0:
            print(f'  {nm:6s} 0 px'); continue
        mn = px.min(1)
        print(f'  {nm:6s} {len(px):6d} px  mean RGB {px.mean(0).round().astype(int)}  WHITE {100*(mn>=235).mean():5.1f}%  SHADE(B-R>=30) {100*((px[:,2]-px[:,0])>=30).mean():5.1f}%  lum {px.mean():5.1f}')
    # heap test: right strip x 640-864, y 700-1000: foam px and per-column max vertical run
    sub = k[700:1000, 640:864]
    runs = []
    for x in range(sub.shape[1]):
        c = sub[:, x]; best = cur = 0
        for v in c:
            cur = cur + 1 if v else 0; best = max(best, cur)
        runs.append(best)
    print(f'  heapR x640-864 y700-1000: foam {100*sub.mean():5.1f}%  max vertical run {max(runs)} px  mean run(cols with foam) {np.mean([r for r in runs if r] or [0]):.0f} px')
