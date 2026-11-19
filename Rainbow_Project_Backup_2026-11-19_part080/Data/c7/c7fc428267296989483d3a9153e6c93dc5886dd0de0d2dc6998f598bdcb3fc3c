"""r7: pixel diff of two capture folders (same file names). usage: python3 -I diff0px_r7.py <dirA> <dirB> [out.json]
Per file: differing pixels (any channel), their row span, max level, and the count outside the title banner rows 33-204
(the animated banner differs between any two captures)."""
import json, os, sys
import numpy as np
from PIL import Image
A, B = sys.argv[1], sys.argv[2]
res = {}
for f in sorted(os.listdir(A)):
    if not f.endswith('.png') or not os.path.exists(os.path.join(B, f)): continue
    a = np.asarray(Image.open(os.path.join(A, f)).convert('RGB')).astype(int); b = np.asarray(Image.open(os.path.join(B, f)).convert('RGB')).astype(int)
    d = np.abs(a - b).max(2); m = d > 0; ys = np.where(m.any(1))[0]; o = m.copy(); o[33:205] = False
    res[f] = {'differing': int(m.sum()), 'rows': [int(ys.min()), int(ys.max())] if len(ys) else None, 'max': int(d.max()), 'outside_banner': int(o.sum())}
print(json.dumps(res, indent=1))
if len(sys.argv) > 3: json.dump(res, open(sys.argv[3], 'w'), indent=1)
