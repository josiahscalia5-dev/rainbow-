"""Screen 08 r13 (`&m08cupw=1`): painted outline mask of the upper spout cups for the cup shader.

R = upper-right cup as painted (cupmask08.py polygon, traced by eye on a 10 px grid), G = upper-left cup; both eroded by
2 px so the arch's anti-aliased edge (gold) and the wall just outside the cup never count as cup pixels.
The shader (UR cup, off the approved viewpoint only) takes a cup point's own plate pixel only inside this outline, else its
mirror point's, else the painted cap / band copied across the arch edge from just inside it, else the gold patch.
usage: python3 -I tools/match08/cupw08.py <out.png>
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H, K = 864, 1536, 4
UL = [(147.5, 396), (150, 385), (160, 370), (175, 352), (192, 339), (202, 332), (215, 327.5), (230, 327.5), (250, 330),
      (270, 337), (290, 352), (305, 367), (315, 382), (317.5, 392), (317.5, 405), (305, 415), (270, 424), (230, 427),
      (180, 417), (155, 407)]
UR = [(664, 435), (665, 417.5), (672, 400), (685, 380), (695, 367), (702, 365), (712, 375), (722, 390), (740, 410),
      (755, 417.5), (770, 430), (780, 447.5), (775, 455), (752, 461), (715, 464), (675, 457.5)]


def mask(pts):
    m = Image.new('L', (W * K, H * K), 0)
    ImageDraw.Draw(m).polygon([(x * K, y * K) for x, y in pts], fill=255)
    return m.filter(ImageFilter.MinFilter(2 * 2 * K + 1)).resize((W, H), Image.BOX)


rgb = np.zeros((H, W, 3), np.uint8)
rgb[..., 0] = np.asarray(mask(UR)); rgb[..., 1] = np.asarray(mask(UL))
Image.fromarray(rgb).save(sys.argv[1])
print('UR px', int((rgb[..., 0] > 127).sum()), 'UL px', int((rgb[..., 1] > 127).sum()))
