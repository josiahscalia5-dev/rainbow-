"""Round 33c: foam bank strip cut from the APPROVED painting's own left foam bank (no AI): the bank is rotated level, its white-lavender
foam kept (alpha from low saturation + high brightness), mirrored to tile seamlessly along the river. python3 -I bake_foam.py <outdir>"""
import sys, os, numpy as np, cv2
from PIL import Image
out = sys.argv[1]; REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
im = np.array(Image.open(os.path.join(REPO, 'references/05_flow_into_the_current.png')).convert('RGB'))
c = (130, 725); ang = -17.0                                              # left bank centre and direction (full-resolution pixels)
M = cv2.getRotationMatrix2D(c, ang, 1.0); rot = cv2.warpAffine(im, M, (im.shape[1], im.shape[0]), flags=cv2.INTER_CUBIC)
band = rot[c[1] - 60:c[1] + 30, max(0, c[0] - 130):c[0] + 130].astype(np.float32)   # foam band, 260 x 90
hsv = cv2.cvtColor(band.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32) / [180, 255, 255]
a = np.clip((0.42 - hsv[..., 1]) / 0.2, 0, 1) * np.clip((hsv[..., 2] - 0.62) / 0.15, 0, 1)
a = cv2.GaussianBlur(a, (0, 0), 0.8)
rows = np.linspace(0, 1, band.shape[0])[:, None]; a = np.maximum(a, np.clip((rows - 0.78) / 0.15, 0, 1) * 0.9)   # solid foam at the water line
rgba = np.dstack([band, a * 255]); tile = np.concatenate([rgba, rgba[:, ::-1]], 1)                               # mirror -> seamless along the river
tile = cv2.resize(tile, (1024, 256), interpolation=cv2.INTER_CUBIC)
Image.fromarray(np.clip(tile, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(out, 'foam.png')); print('foam', tile.shape, 'mean alpha', round(float(a.mean()), 3))
