"""Round 38: water look statistics of a frame (approved picture or game render), so the live water can be tuned to the approved water by numbers.
   python3 -I tools/bonus/water_stats.py <img> [<img> ...]
Region = lower water area (55-97 % of the height, full width) minus Benny's box (22-78 % x 48-86 % y). Per region:
 blue / pink / white shares, mean colour (sRGB) of blue and pink pixels, HSV saturation + value of blue, highlight share (luma > 0.85),
 fine detail = mean |Laplacian| of luma (how much fine streak / glitter texture there is), streak share = bright thin lines (luma 0.1 above a 7 px blur)."""
import sys
import numpy as np
from PIL import Image, ImageFilter

def stats(path):
    im = Image.open(path).convert('RGB'); W, H = im.size
    a = np.asarray(im).astype(np.float32) / 255.0
    y0, y1 = int(0.55 * H), int(0.97 * H)
    m = np.zeros((H, W), bool); m[y0:y1, :] = True
    m[int(0.48 * H):int(0.86 * H), int(0.22 * W):int(0.78 * W)] = False
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1); sat = (mx - mn) / (mx + 1e-6); luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    blue = m & (b > r + 0.12) & (b >= g - 0.02); pink = m & (r > g + 0.2) & (b > g + 0.1); white = m & (mn > 0.84)
    L = np.asarray(im.convert('L').filter(ImageFilter.FIND_EDGES)).astype(np.float32) / 255.0
    blur = np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(3.5))).astype(np.float32) / 255.0
    n = m.sum()
    f = lambda k: float(k.sum() / n)
    col = lambda k: tuple(int(round(v * 255)) for v in a[k].mean(0)) if k.sum() else None
    return {'blue': f(blue), 'pink': f(pink), 'white': f(white), 'blue_rgb': col(blue), 'pink_rgb': col(pink),
            'blue_sat': float(sat[blue].mean()) if blue.sum() else 0, 'blue_val': float(mx[blue].mean()) if blue.sum() else 0,
            'highlight': f(m & (luma > 0.85)), 'detail': float(L[m].mean()), 'streaks': f(m & (luma - blur > 0.1))}

if __name__ == '__main__':
    keys = ['blue', 'pink', 'white', 'highlight', 'streaks', 'detail', 'blue_sat', 'blue_val']
    print('%-34s' % 'frame' + ''.join('%10s' % k for k in keys) + '   blue_rgb        pink_rgb')
    for p in sys.argv[1:]:
        s = stats(p); print('%-34s' % p.split('/')[-1][:34] + ''.join('%10.3f' % s[k] for k in keys) + '   %-15s %s' % (s['blue_rgb'], s['pink_rgb']))
