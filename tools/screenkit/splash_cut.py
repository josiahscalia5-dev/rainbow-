"""Rainbow screen kit (round 45) - Benny's splash cut from the screen's OWN approved picture. The shared splash.png carried a patch of dark
painted water under the spray (it showed as a dark smudge under Benny) and, at the size the screens use, its white spray barely showed.
This cuts the WHITE SPRAY around Benny's waterline out of the approved picture (bright, low-saturation pixels; Benny's pink fur and the
water are transparent), feathers it, and records where his water contact sits in it and how many picture pixels his painted height is,
so the game draws it at his real water point, at his size, exactly where the painting has it.
  python3 -I tools/screenkit/splash_cut.py <picture> <segNN.json> <out dir>   -> splash_pic.png + splash_pic.json"""
import sys, os, json
import numpy as np, cv2
from PIL import Image
pic, segp, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True); sp = json.load(open(segp))
im = np.asarray(Image.open(pic).convert('RGB')).astype(np.float32); H, W = im.shape[:2]
bx0, by0, bx1, by1 = sp['benny_box']; cx, cy, rx, ry = sp.get('splash_ellipse', [(bx0 + bx1) / 2, by1, (bx1 - bx0) * 0.6, 60])
hw = int(max(rx * 1.35, (bx1 - bx0) * 0.85)); x0, x1 = int(max(0, cx - hw)), int(min(W, cx + hw)); y0, y1 = int(max(0, cy - 2.4 * ry)), int(min(H, cy + 2.0 * ry))
c = im[y0:y1, x0:x1]; R, G, B = c[..., 0], c[..., 1], c[..., 2]
luma = 0.299 * R + 0.587 * G + 0.114 * B; mx = c.max(-1); mn = c.min(-1); sat = (mx - mn) / np.maximum(mx, 1)
a = np.clip((luma - 165) / 55, 0, 1) * np.clip((0.55 - sat) / 0.3, 0, 1)                      # white / pale-cyan spray and foam
pink = np.clip((R - G - 35) / 50, 0, 1) * (R > B * 0.85); a *= 1 - pink                         # Benny's fur (pink) stays out
yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32); e = ((xx - cx) / (hw * 0.98)) ** 2 + ((yy - cy) / (2.2 * ry)) ** 2
a *= np.clip((1.0 - e) / 0.35, 0, 1)                                                              # elliptical feather: no rectangle edges
a = cv2.GaussianBlur(a, (0, 0), 1.0)
rgba = np.dstack([c, a * 255]).clip(0, 255).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(os.path.join(out, 'splash_pic.png'))
meta = {'w_px': int(x1 - x0), 'h_px': int(y1 - y0), 'anchor_px': [float(cx - x0), float(by1 - y0)], 'benny_px': float(by1 - by0), 'alpha_share': round(float((a > 0.3).mean()), 3)}
json.dump(meta, open(os.path.join(out, 'splash_pic.json'), 'w')); print('splash', meta)
