"""Round 36: likeness of MOVING frames to the approved Screen 05 picture, compensating the forward motion.
Moving forward down the painted tunnel looks to the eye like the approved picture zooming in about its bright core (the vanishing point).
For each game frame (412 x 915 phone frame) this finds the zoom k (about the painted core) + a small shift that makes the approved picture
match best, then reports, on the scenery (below the HUD, Benny's box excluded):
  px20      share of pixels within 20 levels (fine detail must match)
  ssim      structural similarity
  coarse20  share within 20 levels at 1/4 size (layout + colours: what reads at a glance)
  python3 -I zoom_likeness.py <frame or dir> [...] [--json out.json]"""
import sys, os, glob, json, numpy as np, cv2
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith('--')]; jout = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
if jout in args: args.remove(jout)
HERE = os.path.dirname(os.path.abspath(__file__)); W, H = 412, 915
ref = Image.open(os.path.join(HERE, '..', '..', 'references', '05_flow_into_the_current.png')).convert('RGB')
sc = H / ref.height; rw = round(ref.width * sc); x0 = (rw - W) // 2
REF = np.array(ref.resize((rw, H), Image.LANCZOS)).astype(np.float32)          # full width, cropped per transform
VP = (500.0 * sc, 474.0 * sc)                                                 # painted core (kit_model.VP) in the scaled picture
mask = np.ones((H, W), bool); mask[:125] = False; mask[400:780, 50:362] = False
def warp(k, dx, dy):
    # output pixel (x, y) <- approved at VP + (x + x0 - dx - VP) / k
    M = np.array([[1 / k, 0, VP[0] - (VP[0] - x0 + dx) / k], [0, 1 / k, VP[1] - (VP[1] + dy) / k]], np.float32)
    return cv2.warpAffine(REF, M, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
def ssim(a, b):
    a = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); b = cv2.cvtColor(b.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    g = lambda x: cv2.GaussianBlur(x, (0, 0), 1.5); ma, mb = g(a), g(b); va, vb, cab = g(a * a) - ma ** 2, g(b * b) - mb ** 2, g(a * b) - ma * mb
    C1, C2 = 6.5025, 58.5225; return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))
def score(im, R):
    d = np.abs(im - R).mean(2); s4 = lambda x: cv2.resize(x, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    m4 = cv2.resize(mask.astype(np.uint8), (W // 4, H // 4), interpolation=cv2.INTER_NEAREST).astype(bool)
    return float((d[mask] < 20).mean()), float(ssim(im, R)[mask].mean()), float((np.abs(s4(im) - s4(R)).mean(2)[m4] < 20).mean())
files = []
for a in args: files += sorted(glob.glob(os.path.join(a, '*.jpg'))) if os.path.isdir(a) else [a]
res = {}
for f in files:
    im = np.array(Image.open(f).convert('RGB').resize((W, H))).astype(np.float32)
    best = None
    for k in np.arange(1.0, 3.01, 0.05):                                      # coarse search on the 1/4-size layout score
        for dx in range(-40, 41, 10):
            for dy in range(-30, 31, 10):
                c = score(im, warp(k, dx, dy))[2]
                if best is None or c > best[0]: best = (c, k, dx, dy)
    _, k, dx, dy = best
    for kk in np.arange(k - 0.04, k + 0.041, 0.02):                          # refine
        for ddx in range(dx - 6, dx + 7, 3):
            for ddy in range(dy - 6, dy + 7, 3):
                c = score(im, warp(kk, ddx, ddy))[2]
                if c > best[0]: best = (c, kk, ddx, ddy)
    _, k, dx, dy = best; p, s, c = score(im, warp(k, dx, dy))
    res[os.path.basename(f)] = {'zoom': round(float(k), 2), 'shift': [dx, dy], 'px20': round(p, 3), 'ssim': round(s, 3), 'coarse20': round(c, 3)}
    print(f, res[os.path.basename(f)], flush=True)
if jout: json.dump(res, open(jout, 'w'), indent=1)
