"""Rainbow screen kit (round 45) - CLONE FILL for the small holes of a clean plate (the painted coins and loose bubbles the game draws itself).
The Telea fill (tools/reflock/plate.py, unchanged) smears a hole into a soft blob of the surrounding colours; once baked, those blobs showed
as round "ghost" discs on the river while Benny swims. Here every small hole is re-filled from the best-matching patch of the SAME painting
nearby (the ring of pixels around the hole compared at 48 candidate offsets; the source must contain no masked pixel), pasted with
Poisson blending (OpenCV seamlessClone), so the streaks, sparkles and colours continue through the hole. Large holes (Benny) keep Telea.
  python3 -I tools/screenkit/plate_clone.py <picture> <mask.png> <plate.png in/out> [--max-area 14000] [--top 190]"""
import sys, argparse, numpy as np, cv2
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('picture'); ap.add_argument('mask'); ap.add_argument('plate'); ap.add_argument('--max-area', type=int, default=14000); ap.add_argument('--top', type=int, default=190)
a = ap.parse_args()
im = np.array(Image.open(a.picture).convert('RGB')); H, W = im.shape[:2]
m = (np.array(Image.open(a.mask).convert('L').resize((W, H), Image.NEAREST)) > 127).astype(np.uint8)
plate = np.array(Image.open(a.plate).convert('RGB'))
n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8); done = 0; cloned = []
for i in range(1, n):
    x, y, w, h, area = st[i]
    if area > a.max_area or y < a.top: continue
    r = max(w, h); b = max(5, r // 4)
    comp = (lab == i).astype(np.uint8); dil = cv2.dilate(comp, np.ones((2 * b + 1, 2 * b + 1), np.uint8)); ring = (dil > 0) & (comp == 0) & (m == 0)
    x0, y0, x1, y1 = max(0, x - b), max(0, y - b), min(W, x + w + b), min(H, y + h + b)
    tgt = im[y0:y1, x0:x1].astype(np.float32); rg = ring[y0:y1, x0:x1]; best = None
    for k in (1.2, 1.6, 2.2):
        for t in np.linspace(0, 2 * np.pi, 16, endpoint=False):
            dx, dy = int(round(np.cos(t) * k * r)), int(round(np.sin(t) * k * r)); sx0, sy0, sx1, sy1 = x0 + dx, y0 + dy, x1 + dx, y1 + dy
            if sx0 < 0 or sy0 < a.top or sx1 > W or sy1 > H: continue
            if m[sy0:sy1, sx0:sx1][dil[y0:y1, x0:x1] > 0].any(): continue
            src = im[sy0:sy1, sx0:sx1].astype(np.float32); c = float(((src - tgt) ** 2)[rg].mean()) if rg.any() else 0.0
            if best is None or c < best[0]: best = (c, dx, dy)
    if best is None: continue
    _, dx, dy = best; src = plate.copy(); src[y0:y1, x0:x1] = im[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    cm = (cv2.dilate(comp, np.ones((5, 5), np.uint8)) * 255)
    ys, xs = np.nonzero(cm); cx, cy = int((xs.min() + xs.max()) // 2), int((ys.min() + ys.max()) // 2)
    try: plate = cv2.seamlessClone(src, plate, cm, (cx, cy), cv2.NORMAL_CLONE); done += 1; cloned.append(i)
    except cv2.error: pass
Image.fromarray(plate).save(a.plate)
# the mask keeps 255 where the plate is a Telea guess (Benny, HUD) and gets 128 where it is clone-filled painting (still 'game-drawn' for
# every > 127 test, but the bake trusts those plate pixels fully: no half-blended discs)
mm = np.array(Image.open(a.mask).convert('L')); mh, mw = mm.shape; lab_r = cv2.resize(lab.astype(np.int32).astype(np.float32), (mw, mh), interpolation=cv2.INTER_NEAREST).astype(np.int32)
mm[np.isin(lab_r, cloned) & (mm > 127)] = 128; Image.fromarray(mm).save(a.mask)
print('clone-filled', done, 'small holes of', n - 1)
