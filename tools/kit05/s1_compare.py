"""Round 34 S1: likeness numbers of game stills vs the APPROVED Screen 05 picture, measured exactly like compare_r33.py (412 x 915 phone
frame, approved scaled to the same vertical field of view with the sides cropped; scenery = below the HUD rows minus the Benny box).
  python3 -I s1_compare.py <image or dir> [more ...] [--json out.json]
Frame-0 images (name contains 's0.0' or 'f_0000'): share of scenery pixels within 20 levels, mean abs diff, SSIM, colour-look, sharpness.
Other images (the camera has moved, no pixel counterpart): colour-look correlation (hue/sat histogram) + sharpness vs approved, and
the same two numbers for the river area only (lower half below the core) so river changes are visible in the numbers."""
import sys, os, json, glob, numpy as np, cv2
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith('--')]; jout = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
if jout in args: args.remove(jout)
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'references', '05_flow_into_the_current.png')
W, H = 412, 915
ref = Image.open(REF).convert('RGB'); sc = H / ref.height; rw = round(ref.width * sc)
ref = np.array(ref.resize((rw, H), Image.LANCZOS))[:, (rw - W) // 2:(rw - W) // 2 + W].astype(np.float32)
mask = np.ones((H, W), bool); mask[:125] = False; mask[400:780, 50:362] = False
river = mask.copy(); river[:300] = False                       # water + lower walls (below the core row ~230)
def ssim(a, b):
    a = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); b = cv2.cvtColor(b.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    k = lambda x: cv2.GaussianBlur(x, (0, 0), 1.5); ma, mb = k(a), k(b); va, vb, cab = k(a * a) - ma ** 2, k(b * b) - mb ** 2, k(a * b) - ma * mb
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2; return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))
def hs_corr(a, b, m):
    def h(x): hsv = cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2HSV); hh = cv2.calcHist([hsv], [0, 1], m.astype(np.uint8), [36, 16], [0, 180, 0, 256]); return cv2.normalize(hh, hh).flatten()
    return float(cv2.compareHist(h(a), h(b), cv2.HISTCMP_CORREL))
def sharp(x, m): g = cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); return float(np.abs(cv2.Laplacian(g, cv2.CV_32F))[m].mean())
files = []
for a in args: files += sorted(glob.glob(os.path.join(a, '*.jpg')) + glob.glob(os.path.join(a, '*.png'))) if os.path.isdir(a) else [a]
res = {}
for f in files:
    im = np.array(Image.open(f).convert('RGB').resize((W, H))).astype(np.float32); n = os.path.basename(f)
    r = {'colour_look_corr': round(hs_corr(im, ref, mask), 3), 'sharpness_vs_approved': round(sharp(im, mask) / sharp(ref, mask), 3),
         'river_colour_corr': round(hs_corr(im, ref, river), 3), 'river_sharpness': round(sharp(im, river) / sharp(ref, river), 3)}
    if 's0.0_' in n or 'f_0000' in n:
        d = np.abs(im - ref).mean(2)
        r.update({'share_within_20_levels': round(float((d[mask] < 20).mean()), 3), 'mean_abs_diff_levels': round(float(d[mask].mean()), 1),
                  'ssim_scenery': round(float(ssim(im, ref)[mask].mean()), 3), 'river_share_within_20': round(float((d[river] < 20).mean()), 3)})
    res[n] = r; print(n, json.dumps(r))
if jout: json.dump(res, open(jout, 'w'), indent=1)
