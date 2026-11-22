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
small = cv2.resize(im, (W // 4, H // 4), interpolation=cv2.INTER_AREA); ms = cv2.resize(mask.astype(np.uint8) * 255, (W // 4, H // 4), interpolation=cv2.INTER_NEAREST)
fill = cv2.inpaint(small, cv2.dilate(ms, np.ones((3, 3), np.uint8)), 6, cv2.INPAINT_TELEA)
fill = cv2.resize(fill, (W, H), interpolation=cv2.INTER_CUBIC)
fine = cv2.inpaint(im, mask.astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)       # full-size pass keeps small holes crisp
dist = cv2.distanceTransform(mask.astype(np.uint8), cv2.DIST_L2, 5); k = np.clip(dist / 14.0, 0, 1)[..., None]
out = im.copy(); out[mask] = (fine * (1 - k) + fill * k)[mask].astype(np.uint8)
o = sys.argv[1] if len(sys.argv) > 1 else '.'
big = Image.new('L', (W, H), 0); db = ImageDraw.Draw(big)                      # areas too large for a clean free fill: let the live 3D material show
db.rectangle([0, 0, W, 212], fill=255); db.ellipse([255, 885, 655, 1185], fill=255); db.ellipse([185, 1060, 715, 1395], fill=255)
db.polygon([(120, 1330), (300, 1250), (640, 1250), (840, 1330), (820, 1480), (130, 1480)], fill=255); db.polygon([(350, 1380), (590, 1380), (600, 1672), (340, 1672)], fill=255)
db.rectangle([10, 1395, 210, 1650], fill=255); db.rectangle([730, 1395, 930, 1650], fill=255)
alpha = 255 - cv2.GaussianBlur(np.array(big), (0, 0), 14)
Image.fromarray(np.dstack([out, alpha])).save(o + '/sock_plate.png'); Image.fromarray(mask.astype(np.uint8) * 255).save(o + '/sock_plate_mask.png')
print('plate', W, H, 'filled share %.1f%%' % (100 * mask.mean()))
