"""Round 39 (Sock Rescue fix 2, free fill): clean scenery plate of the candidate picture. Removes what the game draws itself (HUD, mission bar,
Benny + his splash, coins, socks, the big bubble, boost arrows, Bubble Blast / Turbo Spin buttons) and fills those areas from their
surroundings (OpenCV Telea inpainting at quarter size, blended in; free, soft where the hole is large).
  python3 -I tools/bonus/plate_sock.py <outdir>   -> sock_plate.png, sock_plate_mask.png"""
import sys, numpy as np, cv2
from PIL import Image, ImageDraw
REF = 'references/candidates/bonus_sock_rescue_laundry_tunnel.webp'
im = np.array(Image.open(REF).convert('RGB')); H, W = im.shape[:2]
m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
d.rectangle([0, 0, W, 212], fill=255)                                            # HUD + mission bar
d.ellipse([255, 885, 655, 1185], fill=255); d.ellipse([185, 1060, 715, 1395], fill=255)   # Benny (pom, hat, body, arms)
d.polygon([(120, 1330), (300, 1250), (640, 1250), (840, 1330), (820, 1480), (130, 1480)], fill=255)   # his splash
for cx, cy, r in [(455, 845, 56), (508, 768, 38), (545, 728, 30), (572, 700, 24), (595, 682, 18), (612, 672, 15), (627, 664, 13), (640, 658, 11), (652, 653, 10), (663, 648, 9)]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)                        # coin trail
d.polygon([(560, 730), (725, 720), (735, 880), (555, 885)], fill=255); d.polygon([(398, 700), (468, 698), (472, 768), (395, 770)], fill=255)   # socks
d.ellipse([118, 665, 312, 860], fill=255)                                        # big bubble
d.polygon([(350, 1380), (590, 1380), (600, 1672), (340, 1672)], fill=255)        # boost arrows
d.rectangle([10, 1395, 210, 1650], fill=255); d.rectangle([730, 1395, 930, 1650], fill=255)   # Bubble Blast / Turbo Spin
for cx, cy, r in [(198, 1010, 42), (100, 1310, 36), (785, 1160, 44), (128, 1180, 14), (740, 1255, 14), (320, 1065, 14)]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)                        # loose bubbles
mask = np.array(m) > 0
# round 39b: texture-aware fill (OpenCV contrib FSR, free) when available: keeps streaks / sparkle instead of a smooth smudge
import os
CVC = os.environ.get('CV_CONTRIB')
if CVC:
    sys.path.insert(0, CVC); import importlib; cv2 = importlib.reload(cv2)
small = cv2.resize(im, (W // 4, H // 4), interpolation=cv2.INTER_AREA); ms = cv2.resize(mask.astype(np.uint8) * 255, (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)
fill = cv2.inpaint(small, cv2.dilate(ms, np.ones((3, 3), np.uint8)), 6, cv2.INPAINT_TELEA)
fill = cv2.resize(fill, (W, H), interpolation=cv2.INTER_CUBIC)
fine = cv2.inpaint(im, mask.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)       # full-size pass keeps small holes crisp
dist = cv2.distanceTransform(mask.astype(np.uint8), cv2.DIST_L2, 5); k = np.clip(dist / 14.0, 0, 1)[..., None]
out = im.copy(); out[mask] = (fine * (1 - k) + fill * k)[mask].astype(np.uint8)
# round 39b: small holes (coins, socks, bubbles) get a sharp patch of the picture's own neighbouring water / wall at the same depth row
# (copied from beside the hole, feathered), instead of a smooth smudge
holes = [(cx - r, cy - r, cx + r, cy + r) for cx, cy, r in [(455, 845, 56), (508, 768, 38), (545, 728, 30), (572, 700, 24), (595, 682, 18), (612, 672, 15), (627, 664, 13),
         (640, 658, 11), (652, 653, 10), (663, 648, 9), (198, 1010, 42), (100, 1310, 36), (785, 1160, 44), (128, 1180, 14), (740, 1255, 14), (320, 1065, 14)]]
holes += [(555, 720, 735, 885), (395, 698, 472, 770), (118, 665, 312, 860)]
holes_left = []
for x0, y0, x1, y1 in sorted(holes, key=lambda b: (b[2] - b[0])):
    x0, y0, x1, y1 = [int(v) for v in (x0 - 6, y0 - 6, x1 + 6, y1 + 6)]; w, h = x1 - x0, y1 - y0; best = None
    for dx, dy in [(w + 10, 0), (-(w + 10), 0), (2 * w + 20, 0), (-(2 * w + 20), 0), (0, h + 10), (w + 10, h + 10), (-(w + 10), h + 10)]:
        a0, a1, b0, b1 = x0 + dx, x1 + dx, y0 + dy, y1 + dy
        if a0 < 0 or a1 > W or b0 < 213 or b1 > H: continue
        bad = mask[b0:b1, a0:a1].mean() + 0.002 * abs(dy) / max(h, 1)        # prefer the same depth row
        if best is None or bad < best[0]: best = (bad, dx, dy)
    if best is None or best[0] > 0.3: holes_left.append((x0, y0, x1, y1)); continue   # no clean neighbour: leave it to the live 3D material
    _, dx, dy = best; hm = mask[y0:y1, x0:x1].astype(np.uint8)
    fe = np.clip(cv2.distanceTransform(hm, cv2.DIST_L2, 5) / 6.0, 0, 1)[..., None]
    patch = out[y0 + dy:y1 + dy, x0 + dx:x1 + dx].astype(np.float32); cur = out[y0:y1, x0:x1].astype(np.float32)
    out[y0:y1, x0:x1] = (cur * (1 - fe) + patch * fe).astype(np.uint8)
print('sharp neighbour patches for', len(holes), 'small holes')
o = sys.argv[1] if len(sys.argv) > 1 else '.'
big = Image.new('L', (W, H), 0); db = ImageDraw.Draw(big)                      # areas too large for a clean free fill: let the live 3D material show
db.rectangle([0, 0, W, 212], fill=255); db.ellipse([255, 885, 655, 1185], fill=255); db.ellipse([185, 1060, 715, 1395], fill=255)
db.polygon([(120, 1330), (300, 1250), (640, 1250), (840, 1330), (820, 1480), (130, 1480)], fill=255); db.polygon([(350, 1380), (590, 1380), (600, 1672), (340, 1672)], fill=255)
db.rectangle([10, 1395, 210, 1650], fill=255); db.rectangle([730, 1395, 930, 1650], fill=255)
for x0, y0, x1, y1 in holes_left: db.ellipse([x0 + 6, y0 + 6, x1 - 6, y1 - 6], fill=255)
print('holes left to the live material:', len(holes_left))
alpha = 255 - cv2.GaussianBlur(np.array(big), (0, 0), 14)
Image.fromarray(np.dstack([out, alpha])).save(o + '/sock_plate.png'); Image.fromarray(mask.astype(np.uint8) * 255).save(o + '/sock_plate_mask.png')
print('plate', W, H, 'filled share %.1f%%' % (100 * mask.mean()))
