"""Round 40: free 'clean plate' of an approved picture for the bake (no AI, no credits): the areas the game draws itself (mask: HUD, Benny,
splash, coins, socks, loose bubbles, buttons) are filled from their own surroundings (OpenCV Telea inpainting: a quarter-size pass for big
holes + a full-size pass for small ones, blended by distance into the hole). The plate is only a bake SOURCE: inside the mask the bake
gives it a reduced weight, outside the mask the bake uses the untouched picture pixels.
  python3 -I tools/reflock/plate.py <picture> <mask.png (white = fill)> <out.png>"""
import sys, numpy as np, cv2
from PIL import Image
im = np.array(Image.open(sys.argv[1]).convert('RGB')); H, W = im.shape[:2]
m = (np.array(Image.open(sys.argv[2]).convert('L').resize((W, H), Image.NEAREST)) > 127).astype(np.uint8)
small = cv2.resize(im, (W // 4, H // 4), interpolation=cv2.INTER_AREA); ms = cv2.resize(m * 255, (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)
fill = cv2.resize(cv2.inpaint(small, cv2.dilate(ms, np.ones((3, 3), np.uint8)), 6, cv2.INPAINT_TELEA), (W, H), interpolation=cv2.INTER_CUBIC)
fine = cv2.inpaint(im, m * 255, 5, cv2.INPAINT_TELEA)
k = np.clip(cv2.distanceTransform(m, cv2.DIST_L2, 5) / 14.0, 0, 1)[..., None]
out = im.copy(); sel = m > 0; out[sel] = (fine * (1 - k) + fill * k)[sel].astype(np.uint8)
Image.fromarray(out).save(sys.argv[3]); print('plate', sys.argv[3], 'filled share', round(float(m.mean()), 3))
