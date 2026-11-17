"""Round 5 (c): whiter beanie stripes. Crown-map texels of the white stripes (low saturation; the map whites are neutral
grey ~157, the pink cast on screen comes from the 08 light) get per-channel gains that cancel the cast.
usage: white08.py --g=1.0,1.04,1.01 [--out=crown_r5.png]"""
import sys
import numpy as np
from PIL import Image
o = dict(a[2:].split('=') for a in sys.argv[1:] if a.startswith('--'))
G = np.array([float(v) for v in o.get('g', '1.0,1.04,1.01').split(',')], np.float32)
OUT = o.get('out', 'crown_r5.png')
p = 'assets/textures/benny08/crown.png'
im = Image.open(p); mode = im.mode
a = np.asarray(im.convert('RGBA')).astype(np.float32)
rgb = a[..., :3]; mx = rgb.max(-1); mn = rgb.min(-1)
sat = (mx - mn) / np.maximum(mx, 1)
w = np.clip((mx - 90) / 40, 0, 1) * np.clip((0.3 - sat) / 0.1, 0, 1)   # white-stripe weight (0 on violet stripes)
new = rgb * G
rgb2 = rgb + (new - rgb) * w[..., None]
a[..., :3] = np.clip(rgb2, 0, 255)
Image.fromarray(a.astype(np.uint8), 'RGBA').convert(mode).save(f'assets/textures/benny08/{OUT}')
print('white texels', int((w > 0.5).sum()), 'of', w.size, '->', OUT)
