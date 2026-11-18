"""r7 M3 '?m07ring=1': straighten the painted gold rings of the ring-bay wall tile (tile_wall_clean.png).
In the unwrap the gold band drifts across the rows (u ~ 0.75 at the top rows to ~0.19 at the bottom: a slanted band),
so repeated deep in the tube the rings render as twisted diagonal bands instead of round rings. Per row the circular
centroid of the gold pixels is measured, smoothed over the rows and each row is rolled (sub-pixel, wrap-around) so the
band centre lands on u = 0 (= the fitted ring depth R2 the shader anchors the bay to). Only a per-row horizontal shift:
colours and the slot pattern are untouched.
usage: python3 -I tools/match07/straighten_wall07.py"""
import json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d

SRC = 'assets/textures/match07/tile_wall_clean.png'
DST = 'assets/textures/match07/tile_wall_ring.png'
im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(np.float32)
hsv = np.asarray(im.convert('HSV')).astype(np.float32) / 255
H, W = a.shape[:2]
gold = ((hsv[..., 0] > 0.03) & (hsv[..., 0] < 0.14) & (hsv[..., 1] > 0.35) & (hsv[..., 2] > 0.6)).astype(np.float32)
ang = np.exp(2j * np.pi * np.arange(W) / W)
z = (gold * ang[None, :]).sum(1)
z = gaussian_filter1d(z.real, 24) + 1j * gaussian_filter1d(z.imag, 24)  # smooth the band direction over rows
wgt = np.abs(z)
ok = wgt > 3
phase = np.unwrap(np.angle(z))
rows = np.arange(H)
phase = np.interp(rows, rows[ok], phase[ok])  # rows without gold (water-line rows) keep the nearest shift
shift = phase / (2 * np.pi) * W  # band centre (px) per row
out = np.empty_like(a)
x = np.arange(W, dtype=np.float32)
for y in range(H):
    src = (x + shift[y]) % W
    i0 = np.floor(src).astype(int); f = (src - i0)[:, None]; i1 = (i0 + 1) % W
    out[y] = a[y, i0] * (1 - f) + a[y, i1] * f
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(DST)
# check: band centre per row after
g2 = np.asarray(Image.open(DST).convert('HSV')).astype(np.float32) / 255
gold2 = ((g2[..., 0] > 0.03) & (g2[..., 0] < 0.14) & (g2[..., 1] > 0.35) & (g2[..., 2] > 0.6)).astype(np.float32)
c2 = [float((np.angle((gold2[y] * ang).sum()) / (2 * np.pi) * W) % W) for y in range(0, H, 64) if gold2[y].sum() > 10]
rep = {'src': SRC, 'dst': DST, 'shift_px_min_max': [float(shift.min()), float(shift.max())],
       'band_centre_after_px_every64rows': [round(c if c < W / 2 else c - W, 1) for c in c2]}
json.dump(rep, open('qa/match/07/r7/straighten_wall07.json', 'w'), indent=1)
print(json.dumps(rep))
