"""colour-class runs down a column (V violet, W cream-white, P pink fur, . other) for APPROVED vs game frames.
usage: python3 -I tools/benny20/runs.py <x> <y0> <y1> <frame.png>..."""
import sys
import numpy as np
from PIL import Image
x, y0, y1 = (int(v) for v in sys.argv[1:4])
def cls(p):
    r, g, b = p
    if b > 120 and g < 110 and b > r + 25 and b > g + 70: return 'V'
    if r > 175 and g > 130 and b > 175: return 'W'
    if r > 110 and r > b + 10 and g < 0.62 * r: return 'P'
    return '.'
for f in sys.argv[4:]:
    im = np.asarray(Image.open(f).convert('RGB')).astype(int)
    seq = [cls(im[y, x - 2:x + 3].mean(0)) for y in range(y0, y1)]
    runs, s = [], 0
    for i in range(1, len(seq) + 1):
        if i == len(seq) or seq[i] != seq[s]:
            if i - s >= 4: runs.append(f'{seq[s]}{y0 + s}-{y0 + i - 1}')
            s = i
    print(f.split('/')[-2] + '/' + f.split('/')[-1], ' '.join(runs))
