"""wave 8: splash extent. Whitish px (R>=170, G>=200, B>=225) in x 150-720, y 1100-1330 per side (L: x<432, R: x>=432),
their share of the box and the outermost x / lowest y with >= 3 whitish px per column / row. Usage: python3 -I splashext.py IMG..."""
import sys
import numpy as np
from PIL import Image
for p in sys.argv[1:]:
    a = np.asarray(Image.open(p).convert('RGB')).astype(int)[1100:1330, 150:720]
    m = (a[..., 0] >= 170) & (a[..., 1] >= 200) & (a[..., 2] >= 225)
    out = []
    for nm, sl in (('L', slice(0, 282)), ('R', slice(282, 570))):
        s = m[:, sl]
        cols = np.where(s.sum(0) >= 3)[0]; rows = np.where(s.sum(1) >= 3)[0]
        xs = (cols + 150 + sl.start) if len(cols) else [0]
        out.append(f'{nm} {100 * s.mean():4.1f}% x {min(xs)}-{max(xs)} ylow {(rows.max() + 1100) if len(rows) else 0}')
    print(p, ' | '.join(out))
