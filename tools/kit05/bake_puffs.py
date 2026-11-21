"""Round 35 (lead): painted foam domes for the Screen 05 river banks (no AI). The user's isolated water art
(references/water/05_water_isolated_original.png) has a clean left foam bank of white-lavender domes (iso px x 0-270, y 730-880).
It is cut out (alpha = white + low saturation inside the bank), rotated level (-24 deg), its lower edge filled solid (the domes sit on
the water), upscaled 2x and cut into three overlapping pieces -> puffs.png (atlas: 3 cells of 256 x 128, stacked, row 0 = cell 0).
The game draws them as camera-facing billboards along both wall bases, so the banks stay round puffs from every position while Benny
swims (the round-33 wall-base foam strip was a flat band seen edge-on: it stretched into white spikes).
  python3 -I bake_puffs.py <kit dir>"""
import sys, os, numpy as np, cv2
from PIL import Image
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
out = sys.argv[1]
iso = np.array(Image.open(os.path.join(REPO, 'references/water/05_water_isolated_original.png')).convert('RGBA')).astype(np.float32)
rgb, a = iso[..., :3], iso[..., 3] / 255.0
hsv = cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
x0, y0, x1, y1 = 0, 730, 270, 880
white = np.clip((120 - hsv[..., 1]) / 70, 0, 1) * np.clip((hsv[..., 2] - 140) / 60, 0, 1) * a
m = ((a > 0.5) & (hsv[..., 1] < 70) & (hsv[..., 2] > 170)).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
big = [i for i in range(1, n) if st[i, 4] > 5000]                        # the two foam banks (sparkles on the water are small)
bank = cv2.dilate(np.isin(lab, big).astype(np.uint8), np.ones((11, 11), np.uint8))
alpha = cv2.GaussianBlur(white * bank, (0, 0), 0.7)
p = np.dstack([rgb, alpha * 255])[y0:y1, x0:x1]
h, w = p.shape[:2]; pad = np.zeros((h + 200, w + 200, 4), np.float32); pad[100:100 + h, 100:100 + w] = p
M = cv2.getRotationMatrix2D((100 + w / 2, 100 + h / 2), -24, 1.0)
r = cv2.warpAffine(pad, M, (w + 200, h + 200), flags=cv2.INTER_CUBIC)
ys, xs = np.nonzero(r[..., 3] > 20); r = r[ys.min():ys.max() + 1, xs.min() + 8:xs.max() - 7]   # trim the rotated crop's corners
H, W = r.shape[:2]
# solid foam along the bottom (the domes stand on the water): alpha ramps to 1 over the lowest 35 %, colour = the strip's own foam
rows = np.linspace(0, 1, H)[:, None]; base = np.clip((rows - 0.62) / 0.3, 0, 1)
col = r[..., :3].copy(); fa = r[..., 3:4] / 255.0
foamc = (col * fa).reshape(-1, 3).sum(0) / max(1e-3, fa.sum()); lav = np.array([214, 206, 240], np.float32)
fillc = np.where(fa > 0.3, col, lav * 0.6 + foamc * 0.4)
r = np.dstack([fillc, np.maximum(r[..., 3], base * 255)])
r = cv2.resize(r, (W * 2, H * 2), interpolation=cv2.INTER_LANCZOS4)
H2, W2 = r.shape[:2]; cells = []
for k in range(3):                                                    # three overlapping pieces, soft side edges
    c0 = int(k * (W2 - W2 // 3 - 20) / 2); piece = r[:, c0:c0 + W2 // 3 + 20].copy()
    pw = piece.shape[1]; e = np.minimum(np.arange(pw), pw - 1 - np.arange(pw)) / 24.0; piece[..., 3] *= np.clip(e, 0, 1)[None, :]
    cell = np.zeros((128, 256, 4), np.float32); pc = cv2.resize(piece, (256, int(round(256 * piece.shape[0] / pw))), interpolation=cv2.INTER_AREA)
    ph = min(128, pc.shape[0]); cell[128 - ph:] = pc[-ph:]                # bottom-aligned (the cell's bottom edge = the water line)
    cells.append(cell)
atlas = np.concatenate(cells, 0)
Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(out, 'puffs.png'))
print('puffs.png', atlas.shape, 'strip', (W, H), 'cell aspect', round(256 / max(1, int(round(256 * H2 / (W2 // 3 + 20)))), 2))
