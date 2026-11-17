"""Screen 08 region numbers, approved vs capture (same regions as tools/imageblaster/plate_compare.py and
qa/match/08/scenery_metrics_*.json): SCENERY = not the HUD/title band (y < 190), not Benny + splash (x 220-650,
y 840-1245) - the definition behind the recorded "scenery 97.4 %" (coins included; reproduces upper 98.9 / lower 99.2 %);
SCENERY_NOCOINS = the same without the nine painted coins (+10 px, plate_compare.py); bands upper 190-600 /
middle 600-840 / lower 840+ (scenery only);
BENNY+SPLASH = the box x 220-650, y 840-1245; WHOLE = every pixel. Measures: mean |dRGB|, share within 20 levels,
luminance SSIM (7x7 Gaussian sigma 1.5).
usage: python3 -I regions08.py <capture.png> [<capture2.png> ...] [--json=OUT]"""
import json, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

REF = 'references/08_final_spin_chamber.png'
A = np.asarray(Image.open(REF).convert('RGB'), float)
H, W = A.shape[:2]
yy, xx = np.mgrid[:H, :W]
benny = np.zeros((H, W), bool); benny[840:1245, 220:650] = True
removed = benny.copy(); removed[:190] = True
for cx, cy, r in [(479, 601, 12), (454, 608, 13), (420, 616, 15), (383, 633, 18), (428, 662, 20), (497, 686, 24),
                  (467, 737, 29), (400, 786, 35), (335, 862, 42)]:
    removed |= (xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 10) ** 2
scen = (yy >= 190) & ~benny
REG = {'scenery': scen, 'upper': scen & (yy < 600), 'middle': scen & (yy >= 600) & (yy < 840),
       'lower': scen & (yy >= 840), 'scenery_nocoins': ~removed, 'benny+splash': benny, 'whole': np.ones((H, W), bool)}


def ssim_map(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))


def regions(path):
    C = np.asarray(Image.open(path).convert('RGB'), float)
    d = np.abs(A - C).mean(-1); sm = ssim_map(A, C)
    return {k: dict(within_20=round(float((d[m] <= 20).mean()), 4), ssim=round(float(sm[m].mean()), 4),
                    mean_abs=round(float(d[m].mean()), 2)) for k, m in REG.items()}


if __name__ == '__main__':
    caps = [a for a in sys.argv[1:] if not a.startswith('--')]
    opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
    out = {}
    for p in caps:
        out[p] = r = regions(p)
        print(p)
        for k, v in r.items():
            print(f"  {k:13s} <=20 {100 * v['within_20']:5.1f} %  SSIM {v['ssim']:.3f}  mean {v['mean_abs']:6.2f}")
    if 'json' in opt:
        json.dump(out, open(opt['json'], 'w'), indent=1)
