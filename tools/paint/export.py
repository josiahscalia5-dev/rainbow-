"""Approved-artwork chain -> assets/textures/paint/ : one layout (paint.json) for every keyframe in route order.
05k0 = the approved Screen 05 picture (built by plate_full.py); 06k0..06k4 = the existing paint06 plates (approved 06 + the four storyboard
panels, files stay in assets/textures/paint06/). Coin paths: for each collectible painted coin the game's coin distance d (course units ahead
of Benny) and its painted place; the path between them follows the picture's perspective (size = c/(d+D0), y = yh + k/(d+D0))."""
import json, sys
import cv2, numpy as np
from PIL import Image
R = '/home/user/rainbow-'; O = f'{R}/assets/textures/paint'
FW, FH, MX, MY, S = 864, 1536, 144, 192, 1.25
PW, PH = FW + 2 * MX, FH + 2 * MY
keys = []

def depth_export(src, dst):
    d = np.asarray(Image.open(src).convert('L')).astype(np.float32)
    d = cv2.GaussianBlur(cv2.medianBlur(d.astype(np.uint8), 7).astype(np.float32), (0, 0), 6)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5); d = ((d - lo) / max(hi - lo, 1)).clip(0, 1)
    d = cv2.resize(d, (PW // 6, PH // 6), interpolation=cv2.INTER_AREA)
    Image.fromarray((d * 255).round().astype(np.uint8)).save(dst)
    fr = d[MY // 6:(MY + FH) // 6, MX // 6:(MX + FW) // 6]; thr = np.percentile(fr, 2.0); ys, xs = np.where(fr <= thr)
    return [round(float((xs.mean() + 0.5) * 6), 1), round(float((ys.mean() + 0.5) * 6), 1)]

# ---- 05k0
W = f'{R}/qa/match/05/paint05/work'
Image.open(f'{W}/plate.png').convert('RGB').save(f'{O}/05k0_plate.jpg', quality=94, subsampling=0)
Image.open(f'{W}/benny.png').save(f'{O}/05k0_benny.png', optimize=True)
Image.open(f'{W}/coin.png').save(f'{O}/05_coin.png', optimize=True)
vp05 = depth_export(f'{W}/depth_raw.png', f'{O}/05k0_depth.png')
L = json.load(open(f'{W}/layers.json')); coins = json.load(open(f'{W}/coins.json'))
dd = np.array([c['dist'] for c in coins]); sz = np.array([c['d'] for c in coins]); yy = np.array([c['c'][1] for c in coins]); xx = np.array([c['c'][0] for c in coins])
# size = c/(d+D0): fit D0 on a grid, then c, then y = yh + k/(d+D0)
best = None
for D0 in np.linspace(2, 20, 361):
    u = 1 / (dd + D0); cc = (sz * u).sum() / (u * u).sum(); e = ((cc * u - sz) ** 2).sum()
    if best is None or e < best[0]: best = (e, D0, cc)
_, D0, cc = best; u = 1 / (dd + D0); A = np.c_[np.ones_like(u), u]; yh, ky = np.linalg.lstsq(A, yy, rcond=None)[0]
BX = 421.0   # Benny's centre x (frame px) = where a coin meets him
samples = []
U = 1 / (dd + D0)                                  # painted coins in perspective space (decreasing with d)
for d in np.arange(-6.0, 64.01, 0.25):
    uu = 1 / max(d + D0, 0.35)
    if d <= dd[0]: x = BX + (xx[0] - BX) * max(d, 0) / dd[0]
    elif d >= dd[-1]: x = xx[-1] + (xx[-1] - xx[-2]) * min(d - dd[-1], 8) / (dd[-1] - dd[-2])
    else: x = float(np.interp(d, dd, xx))
    # y and diameter: EXACTLY the painted coins between them (interpolated in perspective space), the fitted perspective beyond,
    # anchored to the nearest / farthest painted coin so there is no jump
    if uu >= U[0]: y = yy[0] + ky * (uu - U[0]); dia = sz[0] * uu / U[0]
    elif uu <= U[-1]: y = yy[-1] + ky * (uu - U[-1]); dia = sz[-1] * uu / U[-1]
    else: y = float(np.interp(uu, U[::-1], yy[::-1])); dia = float(np.interp(uu, U[::-1], sz[::-1]))
    samples.append([round(float(d), 2), round(float(x), 1), round(float(y), 1), round(float(dia), 1)])
cb = Image.open(f'{W}/coin.png').size
keys.append({'id': '05k0', 'screen': '05', 'rest': {'mark': '05_crest', 'off': 0.0}, 'files': {'plate': 'paint/05k0_plate.jpg', 'benny': 'paint/05k0_benny.png', 'depth': 'paint/05k0_depth.png'},
             'benny_frame_px': [round(v, 1) for v in L['benny_frame_px']], 'pivot': [421, 1185], 'vp_frame_px': vp05,
             'push': 0.003, 'push_min': -0.06, 'push_max': 0.2,
             'coins': {'sprite': 'paint/05_coin.png', 'sprite_px': [cb[0] / S, cb[1] / S], 'sprite_coin_d': float(coins[0]['d']), 'stage': '05',
                       'D0': round(float(D0), 3), 'c': round(float(cc), 2), 'samples': samples,
                       # paint-mode coin layout for this stage: distances from the rest moment (the 7 painted coins + 3 pre-crest ones, all on the core)
                       'layout': [-16.0, -12.5, -9.0] + [float(c['dist']) for c in coins], 'lat': 0.0}})
print('05 coin fit: D0', round(D0, 2), 'c', round(cc, 1), 'yh', round(yh, 1), 'k', round(ky, 1))
# ---- 06k0..06k4 (existing paint06 assets)
P6 = json.load(open(f'{R}/assets/textures/paint06/paint06.json'))
REST06 = [10, 21, 32, 43, 53]
for K in P6['keys']:
    k = K['k']
    keys.append({'id': f'06k{k}', 'screen': '06', 'rest': {'stage': '06', 'off': REST06[k]},
                 'files': {'plate': f'paint06/k{k}_plate.jpg', 'benny': f'paint06/k{k}_benny.png', 'depth': f'paint06/k{k}_depth.png'},
                 'benny_frame_px': K['benny_frame_px'], 'pivot': [418, 1190], 'vp_frame_px': K['vp_frame_px'],
                 'push': 0.022, 'push_min': -0.16, 'push_max': 0.3})
lay = {'frame': [FW, FH], 'margin': [MX, MY], 'plate_frame_px': [PW, PH], 'plate_scale': S, 'keys': keys,
       # when each keyframe is revealed over the previous one: [centre s, half width] (course units); 06k0 right at the 05->06 join
       'reveal': {'06k0': {'stage': '06', 'off': 0.6, 'half': 1.6}},
       'speed': {'06': 0.5}}
json.dump(lay, open(f'{O}/paint.json', 'w'), indent=1)
print('keys', [k['id'] for k in keys])
