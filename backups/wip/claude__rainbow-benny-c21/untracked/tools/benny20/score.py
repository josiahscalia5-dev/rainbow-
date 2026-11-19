"""Score a Benny render against the APPROVED Screen 04 Benny (same camera: the 04 start view).
APPROVED parts: GrabCut silhouette (tools/benny20/approved_mask04.png, made once by approved_mask.py) split by colour
(pink fur / violet+cream hat / pompom = hat colours above the crown's top band). GAME parts: the flat-colour mask render
(probe.mjs / shots.mjs B20_MASK=1: fur red, pom green, crown cyan, cuff blue, star black on white).
Prints IoU (all / hat incl. pom / fur), landmark rows on the centre column, widths, and colour medians per part in the
real render vs the approved.  usage: python3 -I tools/benny20/score.py <render.png> <render_mask.png>"""
import sys, json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
APP = '/home/user/rainbow-/references/04_through_the_five_arrows.png'
am = np.asarray(Image.open(f'{HERE}/approved_mask04.png').convert('L')) > 127
A = np.asarray(Image.open(APP).convert('RGB')).astype(int)
img = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
mk = np.asarray(Image.open(sys.argv[2]).convert('RGB')).astype(int)
r, g, b = mk[..., 0], mk[..., 1], mk[..., 2]
gm = {
    'fur': (r > 150) & (g < 100) & (b < 100),
    'pom': (g > 150) & (r < 100) & (b < 100),
    'crown': (g > 150) & (b > 150) & (r < 100),
    'cuff': (b > 150) & (r < 100) & (g < 100),
    'star': (r < 60) & (g < 60) & (b < 60),
}
# HTML HUD overlays are in the screenshot too: keep only Benny's box
box = np.zeros(mk.shape[:2], bool); box[860:1460, 120:744] = True
for k in gm: gm[k] &= box
gall = gm['fur'] | gm['pom'] | gm['crown'] | gm['cuff'] | gm['star']
ghat = gm['pom'] | gm['crown'] | gm['cuff'] | gm['star']
R, G, B = A[..., 0], A[..., 1], A[..., 2]
afur = am & (R > 90) & (R > B + 5) & (G < 0.62 * R)
# hat = approved silhouette minus fur, above the fur's top region (arms are fur too)
ahat = am & ~afur
ahat[1290:] = False
# star pixels (gold) are not in the GrabCut mask: add them to the approved hat
astar = (R > 200) & (G > 140) & (B < 120)
astar[:1100] = False; astar[1200:] = False; astar[:, :440] = False; astar[:, 560:] = False
ahat |= astar
aall = am | astar


def iou(a, b):
    return float((a & b).sum() / max(1, (a | b).sum()))


def bbox(m):
    ys, xs = np.nonzero(m)
    return [int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())] if len(xs) else None


def col_rows(m, x=400):
    ys = np.nonzero(m[:, x - 2:x + 3].any(1))[0]
    return [int(ys.min()), int(ys.max())] if len(ys) else None


out = {
    'iou_all': round(iou(gall, aall), 4), 'iou_hat': round(iou(ghat, ahat), 4), 'iou_fur': round(iou(gm['fur'], afur | (am & ~ahat)), 4),
    'bbox_all': [bbox(gall), bbox(aall)],
    'hat_bbox': [bbox(ghat), bbox(ahat)],
    'cuff_bottom_c': [col_rows(gm['cuff'])[1] if col_rows(gm['cuff']) else None, 1271],
    'fur_c': [col_rows(gm['fur']), [1280, 1396]],
    'pom_bbox': bbox(gm['pom']),
}
# frame-to-frame camera settle moves Benny a few px: best IoU over vertical shifts + cuff height as a fraction of Benny
best = (0, -1, -1, -1)
for dy in range(-50, 51, 2):
    sh = lambda m: np.roll(m, dy, 0)
    v = (iou(sh(gall), aall), iou(sh(ghat), ahat), iou(sh(gm['fur']), afur | (am & ~ahat)))
    if v[0] > best[1]: best = (dy, *[round(x, 4) for x in v])
out['shift_best'] = {'dy': best[0], 'iou_all': best[1], 'iou_hat': best[2], 'iou_fur': best[3]}
bb = bbox(gall); cbt = col_rows(gm['cuff'])
if bb and cbt: out['cuff_frac'] = [round((cbt[1] - bb[2]) / (bb[3] - bb[2]), 3), round((1271 - 965) / (1408 - 965), 3)]
# colour medians in the real render per game part vs approved
amed = {'fur': np.median(A[afur & (np.arange(A.shape[0])[:, None] > 1275)], 0)}
for k in ('fur', 'pom', 'cuff', 'crown', 'star'):
    m = gm[k]
    # erode a little: skip the anti-aliased edges
    if m.sum() > 50:
        v = img[m]
        L = v.mean(1)
        out[f'med_{k}'] = [int(x) for x in np.median(v, 0)] + [f'L p10/50/90 {[int(np.percentile(L, p)) for p in (10, 50, 90)]}']
# lead's fur measure (r20): pink body pixels below the cuff, HSV saturation / brightness p10/50/90 + mean RGB
def hsv_stats(px):
    px = px.astype(float) / 255
    mx, mn = px.max(1), px.min(1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    return {'mean': [int(v) for v in (px.mean(0) * 255)], 'sat': [round(float(np.percentile(sat, p)), 2) for p in (10, 50, 90)],
            'val': [round(float(np.percentile(mx, p)), 2) for p in (10, 50, 90)]}
cb = out['cuff_bottom_c'][0] or 1250
gf = gm['fur'].copy(); gf[:cb + 4] = False
pinkg = (img[..., 0] > 90) & (img[..., 0] > img[..., 2] + 5) & (img[..., 1] < 0.62 * img[..., 0])
if (gf & pinkg).sum() > 50: out['fur_hsv'] = hsv_stats(img[gf & pinkg])
af = afur.copy(); af[:1275] = False
out['fur_hsv_approved'] = hsv_stats(A[af])
out['approved_med'] = {'fur': [213, 71, 150, 'L 106/144/184'], 'pom': [133, 30, 229, 'L 78/130/178'], 'cuff': [103, 16, 209],
                       'crown_white': [233, 182, 233], 'crown_violet': [104, 15, 216], 'star': [252, 195, 70]}
print(json.dumps(out))
