"""r30b lead: which game moment matches each storyboard panel best (scenery only, Benny's area masked out).
The panel window in game pixels = (28,250)-(811,1251) of the 864x1536 frame (storyboard panel 1 registered onto the approved picture by
SIFT + RANSAC, 93 inliers: qa/match/06/r30b/align/panel1_to_approved.json; Benny coincides exactly). Every frame is cropped to that window
(scaled for other render sizes) and compared with each panel at 98x125 after a light blur:
  ncc  = normalized cross-correlation of the L channel (layout of light / dark: bands, walls, river)
  dE   = mean |Lab difference| (colour), both over the scenery mask (Benny's box x 0.22-0.78, y 0.36-1.0 of the window excluded)
score = ncc - dE / 100. Only a selection aid: it does not measure likeness and is not reported as a percentage.
usage: python3 -I r30b_panel_match.py <frameDir> [glob=s*.png]   (frame names s<pos>.png)"""
import sys, glob, os, re, json
import numpy as np, cv2
SB = cv2.imread('/home/user/rainbow-/docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png')
BOX = [(16, 100, 506, 724), (520, 100, 1010, 724), (16, 790, 506, 1398), (520, 790, 1010, 1398)]
W, H = 98, 125
def prep(img):
    im = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    im = cv2.GaussianBlur(im, (3, 3), 0)
    return cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
mask = np.ones((H, W), bool); mask[int(0.36 * H):, int(0.22 * W):int(0.78 * W)] = False
panels = [prep(SB[y0:y1, x0:x1]) for x0, y0, x1, y1 in BOX]
def window(img):
    h, w = img.shape[:2]; k = w / 864.0
    return img[int(250 * k):int(1251 * k), int(28 * k):int(811 * k)]
def score(a, b):
    La, Lb = a[..., 0][mask], b[..., 0][mask]
    ncc = float(np.corrcoef(La, Lb)[0, 1])
    dE = float(np.abs(a - b)[mask].mean())
    return ncc, dE, ncc - dE / 100
d = sys.argv[1]; pat = sys.argv[2] if len(sys.argv) > 2 else 's*.png'
rows = []
for f in sorted(glob.glob(os.path.join(d, pat))):
    m = re.match(r's([0-9.]+)\.png$', os.path.basename(f))
    if not m: continue
    g = prep(window(cv2.imread(f)))
    rows.append((float(m.group(1)), [score(g, p) for p in panels]))
rows.sort()
out = {}
for k in range(4):
    best = max(rows, key=lambda r: r[1][k][2])
    out[f'panel{k + 1}'] = {'best_s': best[0], 'ncc': round(best[1][k][0], 3), 'dE': round(best[1][k][1], 1)}
    print(f'panel {k + 1}: ' + '  '.join(f"s{r[0]:g}:{r[1][k][2]:+.3f}" for r in rows) + f'   -> best s {best[0]:g}')
json.dump({'rows': [[r[0], [[round(x, 3) for x in t] for t in r[1]]] for r in rows], 'best': out}, open(os.path.join(d, 'panel_match.json'), 'w'), indent=1)
