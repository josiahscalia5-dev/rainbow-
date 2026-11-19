"""horizontal extent of the colour class under (xc, y) for several rows (same classes as runs.py, gaps <= 6 px bridged).
usage: python3 -I tools/benny20/widths.py <frame.png> <xc> <y>..."""
import sys
import numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
xc = int(sys.argv[2])
def cls(p):
    r, g, b = p
    if b > 120 and g < 110 and b > r + 25 and b > g + 70: return 'V'
    if r > 175 and g > 130 and b > 175: return 'W'
    if r > 110 and r > b + 10 and g < 0.62 * r: return 'P'
    return '.'
for y in (int(v) for v in sys.argv[3:]):
    row = [cls(im[y - 1:y + 2, x].mean(0)) for x in range(im.shape[1])]
    k = row[xc]
    l = xc
    gap = 0
    while l > 0 and gap <= 6:
        l -= 1; gap = 0 if row[l] == k else gap + 1
    r = xc; gap = 0
    while r < len(row) - 1 and gap <= 6:
        r += 1; gap = 0 if row[r] == k else gap + 1
    print(f'y{y} {k}: {l + 7}-{r - 7} w={r - l - 14}')
