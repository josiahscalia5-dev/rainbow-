"""Measure the yellow star on a Benny crop: largest yellow/gold connected blob inside the given region (fractions of the image).
usage: starm.py <img> [x0 y0 x1 y1 fractions]  -> median RGB, g/r, relief p10/50/90 of luminance, pixel count"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage
im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
H, W, _ = im.shape
fr = [float(v) for v in sys.argv[2:6]] if len(sys.argv) > 5 else [0.3, 0.1, 1.0, 0.7]
x0, y0, x1, y1 = int(fr[0] * W), int(fr[1] * H), int(fr[2] * W), int(fr[3] * H)
sub = im[y0:y1, x0:x1]
r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
mx = sub.max(-1); mn = sub.min(-1); sat = (mx - mn) / np.maximum(mx, 1)
hue = np.degrees(np.arctan2(np.sqrt(3) * (g - b), 2 * r - g - b)) % 360
m = (hue > 25) & (hue < 70) & (sat > 0.45) & (mx > 140) & (r > b + 80)
lab, n = ndimage.label(m)
if n == 0: print('no blob'); sys.exit()
sizes = ndimage.sum(m, lab, range(1, n + 1)); k = int(np.argmax(sizes)) + 1
mm = ndimage.binary_fill_holes(lab == k)
px = sub[mm]; med = np.median(px, 0); lum = px @ [0.299, 0.587, 0.114]
ys, xs = np.nonzero(mm)
print(f"{sys.argv[1].split('/')[-3:]} n={mm.sum()} med={med.round().astype(int).tolist()} g/r={med[1]/med[0]:.2f} b/r={med[2]/med[0]:.2f} "
      f"lum p10/50/90={np.percentile(lum,[10,50,90]).round().astype(int).tolist()} clip255={(px.max(-1)>=254).mean():.2f} bbox=({(xs.min()+x0)/W:.2f},{(ys.min()+y0)/H:.2f},{(xs.max()+x0)/W:.2f},{(ys.max()+y0)/H:.2f})")
