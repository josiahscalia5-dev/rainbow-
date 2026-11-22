"""Rainbow screen kit (round 45) - PAINTED DETAIL TILES for the ribbon water. The clean ribbon water (water_ribbon.js) gives the band layout; inside
each band the look must be the painting's own (luminous streaks, glints, silky texture). From the floor swatch (the approved picture flattened
onto the drum floor by bake.js: tpl_floor.jpg, x across / d along the flow, ~400 px per metre) this cuts the purest CYAN window and the purest
PINK window, and makes each seamless (offset-and-cross-fade), so the shader can tile them at a fixed size in the world: they never smear.
  python3 -I tools/screenkit/water_detail.py <baked dir with tpl_floor.jpg + manifest.json> [--size 256]
Writes detail_cyan.jpg, detail_pink.jpg and manifest.json 'water_detail' {cyan_mean, pink_mean, tile_m}."""
import sys, os, json, argparse
import numpy as np, cv2
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('baked'); ap.add_argument('--size', type=int, default=256); a = ap.parse_args()
man = json.load(open(os.path.join(a.baked, 'manifest.json'))); F = man['templates']['floor']
im = np.asarray(Image.open(os.path.join(a.baked, F['file'])).convert('RGB')); Hh, Ww = im.shape[:2]
hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV).astype(np.float32); H, S, V = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
cls = {'cyan': ((H > 180) & (H < 218) & (S > 0.35) & (V > 0.55)).astype(np.float32), 'pink': ((H > 288) & (H < 338) & (S > 0.42) & (V > 0.55)).astype(np.float32)}
N = a.size; out = {}
for k, m in cls.items():
    sc = cv2.boxFilter(m, -1, (N, N), normalize=True, borderType=cv2.BORDER_CONSTANT)   # share of the class in an N x N window centred at each pixel
    sc[:N // 2] = 0; sc[-N // 2:] = 0; sc[:, :N // 2] = 0; sc[:, -N // 2:] = 0
    y, x = np.unravel_index(np.argmax(sc), sc.shape); p = im[y - N // 2:y + N // 2, x - N // 2:x + N // 2].astype(np.float32)
    # seamless: blend the patch with itself shifted by half a tile, weighted toward the shifted copy at the borders
    # two separable passes: across, then along. Each pass blends the patch with itself rolled by half a tile, weighted to the ORIGINAL in the middle
    # (where the rolled copy has its seam) and to the rolled copy at the borders (which then match across the wrap): no seam anywhere
    t = np.linspace(0, 1, N); wv = np.clip(np.minimum(t, 1 - t) * 2.2, 0, 1) ** 0.8
    p = p * wv[None, :, None] + np.roll(p, N // 2, 1) * (1 - wv[None, :, None])
    p = p * wv[:, None, None] + np.roll(p, N // 2, 0) * (1 - wv[:, None, None])
    tile = p.clip(0, 255).astype(np.uint8)
    Image.fromarray(tile).save(os.path.join(a.baked, f'detail_{k}.jpg'), quality=94)
    out[f'{k}_mean'] = [round(float(v) / 255, 4) for v in tile.reshape(-1, 3).mean(0)]; out[f'{k}_share'] = round(float(sc[y, x]), 3); out[f'{k}_at'] = [int(x), int(y)]
out['tile_m'] = round(N * F['xw'] / Ww, 4)          # the tile's size in metres (the floor swatch's own scale)
man['water_detail'] = out; json.dump(man, open(os.path.join(a.baked, 'manifest.json'), 'w')); print('water detail', out)
