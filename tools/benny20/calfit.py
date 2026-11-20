"""Solve per-part albedo (linear RGB) from a grey calibration sweep rendered through the live 04 lighting + post chain.
Each sweep frame sets every part's albedo factor to grey k (probe variants c1..cN, names *_k<k>.png + *_mask.png).
Per part and channel the rendered MEAN of the part's pixels is interpolated over log k and inverted for the APPROVED mean.
usage: python3 -I tools/benny20/calfit.py <probe_dir>"""
import sys, glob, re, json
import numpy as np
from PIL import Image

d = sys.argv[1]
TARGET = {  # approved means (tools/benny20/score.py regions; crown = cream-white stripe; cuff = ribbed band)
    'fur': (207, 74, 151), 'pom': (133, 30, 229), 'cuff': (103, 16, 209), 'star': (252, 195, 70),
}
rows = []
for f in sorted(glob.glob(f'{d}/*_k*.png')):
    if f.endswith('_mask.png'):
        continue
    k = float(re.search(r'_k([0-9.]+)\.png$', f).group(1))
    img = np.asarray(Image.open(f).convert('RGB')).astype(float)
    mk = np.asarray(Image.open(f[:-4] + '_mask.png').convert('RGB')).astype(int)
    r, g, b = mk[..., 0], mk[..., 1], mk[..., 2]
    box = np.zeros(r.shape, bool); box[860:1460, 120:744] = True
    m = {
        'fur': (r > 150) & (g < 100) & (b < 100) & box,
        'pom': (g > 150) & (r < 100) & (b < 100) & box,
        'cuff': (b > 150) & (r < 100) & (g < 100) & box,
        'star': (r < 60) & (g < 60) & (b < 60) & box,
    }
    # body fur below the cuff only (like the approved region)
    ys = np.nonzero(m['cuff'][:, 398:403].any(1))[0]
    if len(ys): m['fur'][:ys.max() + 4] = False
    # shrink by one pixel against edge blending
    from scipy import ndimage as ndi
    rows.append((k, {p: img[ndi.binary_erosion(v, iterations=2)].mean(0) for p, v in m.items()}))
rows.sort()
ks = np.array([k for k, _ in rows])
out = {}
for p, tgt in TARGET.items():
    alb = []
    for c in range(3):
        y = np.array([v[p][c] for _, v in rows])
        t = tgt[c]
        if t <= y[0]:
            a = ks[0] * (t / max(y[0], 1e-3)) ** 2.2
        elif t >= y[-1]:
            a = ks[-1] * (t / max(y[-1], 1e-3)) ** 2.2
        else:
            a = float(np.exp(np.interp(t, y, np.log(ks))))
        alb.append(round(float(a), 4))
    out[p] = {'albedo_linear': alb, 'rendered_means': {str(k): [int(x) for x in v[p]] for k, v in rows}, 'target': tgt}
print(json.dumps(out, indent=1))
