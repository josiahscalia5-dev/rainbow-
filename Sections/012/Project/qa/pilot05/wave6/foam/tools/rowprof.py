"""Per-row foam extents (big-blob mask, 7x7 opening): for y in steps of 20, left/right half: [x_min-x_max] and px count."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'wave5', 'foam', 'tools'))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('FOAM_OPEN', '3')
import numpy as np
from foammask import foam_mask
from bigblobs import big_blobs
ims = sys.argv[1:]
ks = []
for p in ims:
    m, a = foam_mask(p); ks.append(big_blobs(m, a))
print('   y  ' + '  |  '.join(os.path.basename(os.path.dirname(p)) or p for p in ims))
for y in range(500, 1440, 20):
    cols = []
    for k in ks:
        band = k[y:y + 20]
        out = []
        for x0, x1 in ((0, 432), (432, 864)):
            xs = np.where(band[:, x0:x1].any(0))[0]
            out.append(f'{x0+xs.min():3d}-{x0+xs.max():3d} {band[:, x0:x1].sum()//20:3d}' if len(xs) else '    -       ')
        cols.append(' / '.join(out))
    print(f'{y:5d} ' + '  |  '.join(cols))
