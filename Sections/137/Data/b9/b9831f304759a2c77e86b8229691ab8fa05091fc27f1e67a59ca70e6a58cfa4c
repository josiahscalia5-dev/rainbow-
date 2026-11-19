"""benny08 round 3: crisper knit / yarn — unsharp-mask (local contrast) boost of a benny08 map, mean tone kept
(lead review: painted cuff ribs crisp, white bands clean, pom tufts defined; measured: approved highlights brighter).
usage: python3 -I crisp08.py <in.png> <out.png> [--amount=0.6] [--sigma=2.0]"""
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
a_in, a_out = [a for a in sys.argv[1:] if not a.startswith('--')]
k, s = float(opt.get('amount', 0.6)), float(opt.get('sigma', 2.0))
A = np.asarray(Image.open(a_in).convert('RGB'), float)
lo = np.stack([gaussian_filter(A[..., c], s, mode='wrap') for c in range(3)], -1)
B = np.clip(A + k * (A - lo), 0, 255)
Image.fromarray(B.round().astype(np.uint8)).save(a_out)
print(a_out, 'amount', k, 'sigma', s, 'mean before', A.mean((0, 1)).round(1).tolist(), 'after', B.mean((0, 1)).round(1).tolist())
