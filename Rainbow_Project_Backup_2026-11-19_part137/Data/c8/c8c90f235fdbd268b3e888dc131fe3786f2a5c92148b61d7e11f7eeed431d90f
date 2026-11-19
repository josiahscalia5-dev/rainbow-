"""wave 9: tone of the foam px inside the clump boxes (same mask as clumpcol.py): luminance percentiles p10/p50/p90 and
median RGB of the darkest / middle / brightest thirds. Usage: python3 -I clumptone.py IMG..."""
import sys
import numpy as np
from PIL import Image
BOX = {'Lclump': (0, 1000, 150, 1120), 'LLclump': (0, 1200, 240, 1345), 'LRclump': (620, 1200, 864, 1345), 'Lrim': (0, 600, 300, 830)}
for p in sys.argv[1:]:
    a = np.asarray(Image.open(p).convert('RGB')).astype(int)
    out = []
    for nm, (x0, y0, x1, y1) in BOX.items():
        s = a[y0:y1, x0:x1].reshape(-1, 3)
        r, g, b = s[:, 0], s[:, 1], s[:, 2]
        m = (r >= 140) & (g >= 140) & (b >= 200) & ~((b - r > 90) & (g - r > 40))
        px = s[m]
        if len(px) < 30:
            out.append(f'{nm} -'); continue
        L = px @ np.array([0.3, 0.59, 0.11])
        o = np.argsort(L); n = len(o)
        t = [np.median(px[o[int(n * a0):int(n * a1)]], 0).astype(int) for a0, a1 in ((0, .33), (.33, .66), (.66, 1))]
        out.append(f'{nm} L{np.percentile(L, 10):.0f}/{np.median(L):.0f}/{np.percentile(L, 90):.0f} ' + ' '.join('%02X%02X%02X' % tuple(c) for c in t))
    print(p.split('/')[-2] if '/' in p else p, ' | '.join(out))
