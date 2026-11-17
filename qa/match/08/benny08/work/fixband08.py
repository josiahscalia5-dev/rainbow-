"""benny08 round 3: repair the dark band just below the beanie cuff in the 08 body map (benny-character-artist, 2026-11-17).
The body bake (bake08.py, and line B's benny05 bake before it) carries a darker strip at the top edge of the seen fur
(map rows ~195-235): the painted cuff's shadow / lower edge landed on the fur texels just under the game's cuff. Since
round 2 seats the beanie higher on 08 (hatOff), that strip shows as a muddy dark-magenta band the approved picture does not
have. This tool lifts those rows to the fur tone just below them (per-pixel gain from smoothed luminance: the knit-free
fur detail stays), and replaces the few whitish splash specks baked into the band with the local median fur colour.
Writes a NEW map (the round-2 body.png stays; benny05.ts picks body_r3.png only with round 3 on, `b08r3=0` = previous).
usage: python3 -I fixband08.py [--y0=190] [--y1=236] [--ref0=238] [--ref1=262] [--out=assets/textures/benny08/body_r3.png]"""
import sys, json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, median_filter

opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
y0, y1 = int(opt.get('y0', 190)), int(opt.get('y1', 236))
r0, r1 = int(opt.get('ref0', 238)), int(opt.get('ref1', 262))
src = opt.get('src', 'assets/textures/benny08/body.png')
out = opt.get('out', 'assets/textures/benny08/body_r3.png')
A = np.asarray(Image.open(src).convert('RGB'), float)
H, W = A.shape[:2]
LUM = np.array([0.2126, 0.7152, 0.0722])
L = (A * LUM).sum(-1)
# low-pass luminance (wraps around in u: the map is a cylinder)
Ls = gaussian_filter(L, (3, 10), mode=('nearest', 'wrap'))
T = gaussian_filter(L[r0:r1].mean(0), 10, mode='wrap')  # target tone per column: the fur just below the band
y = np.arange(H)[:, None]
# weight: 1 inside [y0+8, y1-6], smooth ramps to 0 at y0 and y1 (no visible seam)
w = np.clip(np.minimum((y - y0) / 8.0, (y1 - y) / 6.0), 0, 1)
g = np.clip(T[None, :] / np.maximum(Ls, 1), 1.0, 1.7)
G = 1 + (g - 1) * w
B = np.clip(A * G[..., None], 0, 255)
if opt.get('mode', 'copy') == 'copy':
    # fur detail: the band rows take the fur rows just below them (shifted down by the band height), blended by w —
    # strands keep their downward direction; the lifted tone above stays as the low-pass base
    sh = y1 - y0 + 2
    idx = np.clip(np.arange(H) + sh, 0, H - 1)
    Cp = A[idx]
    hp = Cp - np.stack([gaussian_filter(Cp[..., c], (3, 10), mode=('nearest', 'wrap')) for c in range(3)], -1)
    lo = np.stack([gaussian_filter(B[..., c], (3, 10), mode=('nearest', 'wrap')) for c in range(3)], -1)
    B = np.clip(B * (1 - w[..., None]) + (lo + hp) * w[..., None], 0, 255)
# whitish splash specks inside the band (low saturation, bright) → local median fur colour
mx, mn = B.max(-1), B.min(-1)
sat = (mx - mn) / np.maximum(mx, 1)
band = (y >= y0 - 10) & (y <= y1 + int(opt.get("speck_below", 10)))
speck = band & (sat < 0.30) & (mx > 150)
speck = gaussian_filter(speck.astype(float), 1.0) > 0.15
med = np.stack([median_filter(B[..., c], size=9, mode='wrap') for c in range(3)], -1)
B[speck] = med[speck]
Image.fromarray(B.round().astype(np.uint8)).save(out)
L2 = (B * LUM).sum(-1)
rep = dict(src=src, out=out, rows=[y0, y1], ref_rows=[r0, r1], specks=int(speck.sum()),
           band_lum_before=round(float(L[y0 + 8:y1 - 6].mean()), 1), band_lum_after=round(float(L2[y0 + 8:y1 - 6].mean()), 1),
           ref_lum=round(float(L[r0:r1].mean()), 1), changed_px=int((np.abs(B - A).max(-1) > 0.5).sum()))
print(json.dumps(rep))
if 'report' in opt:
    json.dump(rep, open(opt['report'], 'w'), indent=1)
