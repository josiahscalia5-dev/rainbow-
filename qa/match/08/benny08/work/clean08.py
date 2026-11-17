"""Round 5 (d, arm edges): pale / whitish texels baked into the fur maps (splash and highlight pixels of the approved
picture picked up at the arm and body outlines) show as jagged pale streaks on the arm puffs. Texels whose saturation is
below --sat (and that are bright) are refilled with the normalized blur of the surrounding good fur texels.
usage: clean08.py [--sat=0.36] -> assets/textures/benny08/{armL,armR,body}_r5.png (from armL, armR, body_r3)"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
o = dict(a[2:].split('=') for a in sys.argv[1:] if a.startswith('--'))
SAT = float(o.get('sat', 0.36))
for src, dst in [('armL', 'armL_r5'), ('armR', 'armR_r5'), ('body_r3', 'body_r5')]:
    a = np.asarray(Image.open(f'assets/textures/benny08/{src}.png').convert('RGB')).astype(np.float32)
    mx = a.max(-1); mn = a.min(-1); s = (mx - mn) / np.maximum(mx, 1)
    bad = (s < SAT) & (mx > 120)
    bad = ndi.binary_dilation(bad, iterations=1)
    good = (~bad).astype(np.float32)
    out = a.copy()
    for sig in (2, 4, 8):
        num = np.stack([ndi.gaussian_filter(a[..., c] * good, sig, mode='wrap') for c in range(3)], -1)
        den = ndi.gaussian_filter(good, sig, mode='wrap')[..., None]
        fill = num / np.maximum(den, 1e-4)
        todo = bad & (den[..., 0] > 0.2) & (out is not None)
        out[todo] = fill[todo]; bad = bad & ~todo
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(f'assets/textures/benny08/{dst}.png')
    print(src, '->', dst, 'refilled texels', int((((s < SAT) & (mx > 120))).sum()))
