"""Screen 08 r11 (`&m08cup=1`): outline mask of the two upper spout cups as PAINTED in the approved picture.

The fitted half-dome proxies are rounder than the painted cups (a shallow perforated cap, a gold band, a flat perforated
underside), so their shoulders carried wall / arch pixels: while Benny swims the cup tops looked cut off by a straight
line with wall slots above it. The mask (plate uv = approved frame) says where each painted cup is:
  R = painted cup pixel (UL, UR, outlines traced by eye on a 10 px grid at 4x zoom, +-2 px)
  G = upper-right cup hidden behind the gold arch's inner edge: the cup continued as its own mirror image about its
      vertical axis (x = UR_AXIS; the painted underside's lowest point / the mirror of its left edge)
The shader cuts the cup proxies (colour and depth bake) to R or G and fills G from the mirrored painted pixels, so the
wall behind the shoulders gets its own pixels and the cups keep their painted outline.
usage: python3 -I tools/match08/cupmask08.py <outPng> [<debugPng>]
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw

out = sys.argv[1]
dbg = sys.argv[2] if len(sys.argv) > 2 else None
W, H = 864, 1536
UL = [(147.5, 396), (150, 385), (160, 370), (175, 352), (192, 339), (202, 332), (215, 327.5), (230, 327.5), (250, 330),
      (270, 337), (290, 352), (305, 367), (315, 382), (317.5, 392), (317.5, 405), (305, 415), (270, 424), (230, 427),
      (180, 417), (155, 407)]
UR = [(664, 435), (665, 417.5), (672, 400), (685, 380), (695, 367), (702, 365), (712, 375), (722, 390), (740, 410),
      (755, 417.5), (770, 430), (780, 447.5), (775, 455), (752, 461), (715, 464), (675, 457.5)]
UR_AXIS = 720.0


def poly_mask(pts):
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return np.asarray(m) > 127


r = poly_mask(UL) | poly_mask(UR)
g = poly_mask([(2 * UR_AXIS - x, y) for x, y in UR]) & ~r
rgb = np.zeros((H, W, 3), np.uint8)
rgb[..., 0] = r * 255
rgb[..., 1] = g * 255
Image.fromarray(rgb).save(out)
print('R px', int(r.sum()), 'G px', int(g.sum()))

# coverage check: the proxy (dome + underside disc, proj08.json) must cover the painted outline, else cup pixels would
# land on the wall behind it
L = json.load(open('assets/textures/match08/proj08.json'))
M = np.array(L['camera']['matrixWorld']).reshape(4, 4).T
V = np.linalg.inv(M); f = 1 / math.tan(math.radians(L['camera']['fov']) / 2); asp = W / H


def proj(p):
    h = np.append(p, 1) @ V.T; x, y, z = h[0], h[1], -h[2]
    return (x * f / asp / z * 0.5 + 0.5) * W, (0.5 - y * f / z * 0.5) * H


for k, pts, kx, ky in [('UL', UL, 1.0, 1.0), ('UR', UR, 1.0, 1.0)]:
    s = L['spouts'][k]; c = np.array(s['c'])
    sil = Image.new('L', (W, H), 0); d = ImageDraw.Draw(sil)
    for th0, th1 in zip(np.linspace(0, math.pi / 2, 24)[:-1], np.linspace(0, math.pi / 2, 24)[1:]):
        for ph0, ph1 in zip(np.linspace(0, 2 * math.pi, 73)[:-1], np.linspace(0, 2 * math.pi, 73)[1:]):
            q = [c + np.array([s['rx'] * kx * math.cos(t) * math.cos(p), s['ry'] * ky * math.sin(t), s['rx'] * kx * math.cos(t) * math.sin(p)])
                 for t, p in [(th0, ph0), (th0, ph1), (th1, ph1), (th1, ph0)]]
            d.polygon([proj(v) for v in q], fill=255)
    sm = np.asarray(sil) > 127
    want = poly_mask(pts) | (g if k == 'UR' else np.zeros_like(g))
    print(k, 'painted px', int(want.sum()), 'not covered by the proxy', int((want & ~sm).sum()), 'proxy px outside', int((sm & ~want).sum()))
if dbg:
    im = np.asarray(Image.open('references/08_final_spin_chamber.png').convert('RGB')).copy()
    im[r] = (im[r] * 0.5 + np.array([255, 0, 0]) * 0.5).astype(np.uint8)
    im[g] = (im[g] * 0.5 + np.array([0, 255, 0]) * 0.5).astype(np.uint8)
    Image.fromarray(im).crop((100, 300, 864, 500)).save(dbg)
