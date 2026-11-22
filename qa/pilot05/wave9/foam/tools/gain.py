"""wave 9: where did NOW get closer / further from the ref than PREV? 1/4-scale |dRGB| maps (box blur 3), prints the mean
change per 1/4-scale tile row band in the lower frame and saves a red(worse)/green(better) map. Usage: gain.py PREV NOW OUT"""
import sys
import numpy as np
from PIL import Image, ImageFilter
ref = Image.open('references/05_flow_into_the_current.png').convert('RGB').resize((216, 384), Image.BOX)
P = Image.open(sys.argv[1]).convert('RGB').resize((216, 384), Image.BOX)
N = Image.open(sys.argv[2]).convert('RGB').resize((216, 384), Image.BOX)
r = np.asarray(ref).astype(float)
dp = np.abs(np.asarray(P).astype(float) - r).mean(2)
dn = np.abs(np.asarray(N).astype(float) - r).mean(2)
g = dn - dp
for nm, (x0, y0, x1, y1) in {'LL': (0, 1130, 330, 1345), 'LR': (560, 1130, 864, 1345), 'Lclump': (0, 990, 200, 1130), 'splashC': (200, 1060, 660, 1330), 'Rrim': (600, 640, 864, 980), 'Lrim': (0, 560, 330, 840)}.items():
    s = g[y0 // 4:y1 // 4, x0 // 4:x1 // 4]
    print(f'{nm}: dmad {s.mean():+.2f} (PREV {dp[y0 // 4:y1 // 4, x0 // 4:x1 // 4].mean():.1f} NOW {dn[y0 // 4:y1 // 4, x0 // 4:x1 // 4].mean():.1f})')
im = np.zeros((384, 216, 3), np.uint8)
im[..., 0] = np.clip(g * 4, 0, 255); im[..., 1] = np.clip(-g * 4, 0, 255)
Image.fromarray(im).resize((432, 768), Image.NEAREST).save(sys.argv[3])
