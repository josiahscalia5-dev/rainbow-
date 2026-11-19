"""wave 8: foam colour inside the near-clump / rim boxes only (no splash): mask R>=140, G>=140, B>=200 and not a
saturated cyan water px (B-R > 90 and G-R > 40 = water). WHITE = min(RGB) >= 235, SHADE = B-R >= 30, BLUE = B-R >= 60.
Usage: python3 -I clumpcol.py IMG..."""
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
        if len(px) == 0:
            out.append(f'{nm} 0'); continue
        mn = px.min(1)
        out.append(f'{nm} {len(px)} W{100 * (mn >= 235).mean():.0f} S{100 * ((px[:, 2] - px[:, 0]) >= 30).mean():.0f} B{100 * ((px[:, 2] - px[:, 0]) >= 60).mean():.0f}')
    print(p.split('/')[-2] if '/' in p else p, ' | '.join(out))
