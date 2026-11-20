"""flow ghosting: each flowing frame vs the flow-off frame of the SAME instant (same waves, Benny, coins), water region"""
import sys, os, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
sys.path.insert(0, 'tools/proj05')
from tunnel_common import load_approved, masks, H, W
M = masks(load_approved())
rows = np.arange(H)[:, None] * np.ones((1, W))
water = M['water'] & (rows >= 204) & (rows < 1420)
def ssim(a, b):
    la, lb = (a * [0.2126, 0.7152, 0.0722]).sum(-1), (b * [0.2126, 0.7152, 0.0722]).sum(-1)
    s = 1.5; C1, C2 = 6.5, 58.5
    ma, mb = gaussian_filter(la, s), gaussian_filter(lb, s)
    va, vb = gaussian_filter(la * la, s) - ma * ma, gaussian_filter(lb * lb, s) - mb * mb
    cab = gaussian_filter(la * lb, s) - ma * mb
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2))
def sharp(a):
    l = (a * [0.2126, 0.7152, 0.0722]).sum(-1)
    return float(np.abs(l - gaussian_filter(l, 2.0))[water].mean())
ref, dirs = sys.argv[1], sys.argv[2:]
n = len([f for f in os.listdir(ref + '/still') if f.endswith('.png')])
out = {}
for d in dirs:
    r = []
    for i in range(n):
        a = np.asarray(Image.open(f'{ref}/still/{i:04d}.png').convert('RGB'), float)
        b = np.asarray(Image.open(f'{d}/still/{i:04d}.png').convert('RGB'), float)
        dd = np.abs(a - b).mean(-1)
        r.append((float(dd[water].mean()), float((dd[water] <= 10).mean()), float(ssim(a, b)[water].mean()), sharp(b) / max(sharp(a), 1e-6)))
    r = np.array(r); out[d] = r
    print(os.path.basename(d), 'per frame SSIM:', ' '.join(f'{x:.2f}' for x in r[:, 2]))
    print('   cycle mean: |d| %.1f  within10 %.3f  SSIM %.3f  detail contrast kept %.2f   worst frame: SSIM %.3f, contrast %.2f' % (r[:, 0].mean(), r[:, 1].mean(), r[:, 2].mean(), r[:, 3].mean(), r[:, 2].min(), r[:, 3].min()))
