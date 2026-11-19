"""Screen 04 M4 (`&m04arrow=1`): the projected plate WITHOUT the painted chevron arrows, used on the water only once the
camera has left the approved view, so the crisp world-anchored arrows drawn by the water shader do not double with the
painted ones. Mask = bright, low-saturation pixels of the river between the tunnel walls (x 320-620, y 690-1010),
dilated; OpenCV Telea inpainting (local, free).  usage: python3 -I tools/match04/nochev04.py <plate.png> <out.png>"""
import sys
import cv2
import numpy as np
src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src, cv2.IMREAD_COLOR)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
m = ((hsv[..., 2] > 205) & (hsv[..., 1] < 95)).astype(np.uint8) * 255
roi = np.zeros_like(m); roi[690:1010, 320:620] = 255
m &= roi
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
m = cv2.dilate(m, np.ones((9, 9), np.uint8))
res = cv2.inpaint(img, m, 9, cv2.INPAINT_TELEA)
cv2.imwrite(out, res)
cv2.imwrite(out.replace('.png', '_mask.png'), m)
print('masked px', int((m > 0).sum()))
