"""Lead r6: measured (not subjective) numbers for moving-gameplay frames vs the approved picture, below the HUD strip
(rows >= 13.5 %). LAYOUT20 = share of pixels within 20 levels after a sigma-8 blur (composition + colour, like
tools/qa/screen_match.py LAYOUT). PALETTE = histogram intersection of hue x saturation (24 x 8 bins, value > 0.15) —
how close the colour palette stays, independent of where things are. Moving frames are seen from other viewpoints, so
LAYOUT naturally falls as the camera travels; PALETTE shows whether the approved look (colours/materials) survives.
usage: python3 -I motion_metrics.py <approved.png> <frame.png> [...]  -> one line per frame"""
import sys
import numpy as np
from PIL import Image, ImageFilter
ref = Image.open(sys.argv[1]).convert('RGB')
W, H = ref.size; top = int(H * 0.135)
def prep(im):
    im = im.convert('RGB').resize((W, H))
    return im
def hsv_hist(a):
    hsv = np.asarray(Image.fromarray(a).convert('HSV'), dtype=np.float32) / 255.0
    m = hsv[..., 2] > 0.15
    h, _, _ = np.histogram2d(hsv[..., 0][m], hsv[..., 1][m], bins=[24, 8], range=[[0, 1], [0, 1]])
    return h / max(h.sum(), 1)
R = np.asarray(ref)[top:]; Rb = np.asarray(ref.filter(ImageFilter.GaussianBlur(8)), dtype=np.int16)[top:]
Rh = hsv_hist(R)
for f in sys.argv[2:]:
    im = prep(Image.open(f)); A = np.asarray(im)[top:]
    Ab = np.asarray(im.filter(ImageFilter.GaussianBlur(8)), dtype=np.int16)[top:]
    lay = float((np.abs(Ab - Rb).max(axis=2) <= 20).mean())
    pal = float(np.minimum(hsv_hist(A), Rh).sum())
    print(f"{f.split('/')[-1][:-4]:22s} LAYOUT20 {lay*100:5.1f} %  PALETTE {pal*100:5.1f} %")
