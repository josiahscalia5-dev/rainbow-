"""APPROVED Screen 08 Benny part masks (pom / crown / cuff / star / body incl. arm nubs) + per-part error / colour stats.
Adapted from line B's qa/pilot05/full_reference_match/benny/work/parts.py (read-only source, ccr-b0757dec-dj6l1o @99ab17b).
The 08 picture has no hand mask: the hat silhouette is an envelope polygon read off a 3x gridded crop of the approved
picture (x 297-560, y 852-1072), the parts inside it come from the colour classes; the body is the big pink fur
component below the cuff (holes filled). Splash / water / coin pixels are not Benny: the coin discs are cut out, and
white / blue splash over the fur is rejected later per pixel by the bake's colour-family test.
usage: python3 -I parts08.py <capture.png> [--png=OUT.png]   (prints per-part error of a capture vs approved)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from bennyseg08 import REF, W, H, load, colour_classes, bbox, biggest, rgb2hsv

# hat envelope (approved pixel coordinates; clockwise from the cuff's lower-left corner)
HAT_POLY = [(300, 1048), (296, 1030), (299, 1012), (309, 999), (322, 980), (334, 962), (346, 948), (358, 940),
            (358, 915), (361, 893), (371, 872), (390, 858), (425, 852), (460, 856), (481, 868), (492, 888),
            (494, 915), (494, 936), (507, 943), (522, 953), (536, 968), (548, 988), (556, 1008), (561, 1030),
            (558, 1048), (545, 1056), (500, 1062), (430, 1064), (350, 1060), (312, 1055)]
CROWN_TOP = 936  # the dome shows from here (above: pom fibres / water)
POM_ELL = (426, 908, 68, 58)  # cx, cy, rx, ry (pom-pom yarn ball, read off the gridded crop)
COINS = [(335, 862, 42), (400, 786, 35)]


def poly_mask(pts):
    im = Image.new('L', (W, H), 0)
    ImageDraw.Draw(im).polygon(pts, fill=255)
    return np.asarray(im) > 0


def approved_parts():
    a = load(REF)
    cls = colour_classes(a)
    yy, xx = np.mgrid[:H, :W]
    coin = np.zeros((H, W), bool)
    for cx, cy, r in COINS:
        coin |= (xx - cx) ** 2 + (yy - cy) ** 2 <= (r + 3) ** 2
    hat = poly_mask(HAT_POLY) & ~coin
    cx, cy, rx, ry = POM_ELL
    ell = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
    # pom = purple / pink yarn inside the ellipse, closed and filled (its white fibre tips included)
    pomc = ell & hat & np.isin(cls, [1, 2])
    pom = ndi.binary_fill_holes(ndi.binary_closing(pomc, np.ones((7, 7)))) & ell & hat
    pom = biggest(pom)
    # star = yellow component inside the hat + its orange rim
    star = biggest((cls == 4) & hat)
    star = ndi.binary_dilation(ndi.binary_fill_holes(ndi.binary_closing(star, np.ones((3, 3)))), iterations=2) & hat
    # cuff = the purple component in the hat's lower rows (closing joins the ribs), then everything below its top edge
    pur = ndi.binary_closing((cls == 2) & hat & (yy > 995), np.ones((5, 5))) & hat
    lab, k = ndi.label(pur)
    sz = ndi.sum(pur, lab, range(1, k + 1)); cyc = ndi.mean(yy, lab, range(1, k + 1))
    cand = [i for i in np.argsort(sz)[::-1] if cyc[i] > 1020][:1]
    cuff = lab == cand[0] + 1
    # extend each column of the cuff down to the hat's bottom edge (ribs with white highlights stay cuff)
    top = np.where(cuff.any(0), np.argmax(cuff, 0), H)
    cuff = hat & (yy >= top[None, :]) & (yy >= 1000)
    cuff &= ~star
    crown = hat & ~pom & ~cuff & ~star & (yy >= CROWN_TOP)
    # body = pink fur component under the hat (arm nubs included), holes filled
    box = (xx >= 240) & (xx <= 640) & (yy >= 1030) & (yy <= 1240)
    pink = ndi.binary_closing((cls == 1) & box, np.ones((5, 5))) & box
    body = ndi.binary_fill_holes(biggest(pink))
    body = ndi.binary_closing(body, np.ones((9, 9)))
    body = ndi.binary_fill_holes(body) & ~hat
    m = pom | crown | cuff | star | body
    return dict(pom=pom, crown=crown, cuff=cuff, star=star, body=body), a, m


if __name__ == '__main__':
    P, a, m = approved_parts()
    args = [x for x in sys.argv[1:] if not x.startswith('--')]
    opt = dict(x[2:].split('=', 1) for x in sys.argv[1:] if x.startswith('--') and '=' in x)
    if args:
        c = load(args[0]); d = np.abs(c - a).mean(-1); tot = d[m].sum()
        print(f"{'part':6s} {'px':>6s} {'mean':>6s} {'<=20':>5s} {'share':>6s}  approved_med  game_med")
        for n, p in P.items():
            print(f"{n:6s} {p.sum():6d} {d[p].mean():6.1f} {(d[p] <= 20).mean():5.2f} {d[p].sum() / tot:6.3f}  "
                  f"{np.median(a[p], 0).astype(int)}  {np.median(c[p], 0).astype(int)}  bbox {bbox(p)}")
        print('ALL', int(m.sum()), round(float(d[m].mean()), 2), round(float((d[m] <= 20).mean()), 3))
    else:
        for n, p in P.items():
            print(n, bbox(p))
    if 'png' in opt:
        o = (a * 0.35).astype(np.uint8)
        cols = dict(pom=(0, 255, 0), crown=(0, 255, 255), cuff=(0, 0, 255), star=(255, 255, 0), body=(255, 0, 0))
        for n, p in P.items():
            o[p] = (0.5 * np.array(cols[n]) + 0.5 * a[p]).astype(np.uint8)
        im = Image.fromarray(o).crop((220, 820, 660, 1260))
        im.resize((im.width * 2, im.height * 2), Image.NEAREST).save(opt['png'])
