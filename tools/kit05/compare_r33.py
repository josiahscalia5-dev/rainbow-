"""Round 33: APPROVED | CURRENT (round-32 splat build) | KIT, measured the same way.
python3 -I compare_r33.py <current run dir> <kit run dir> <outdir> [frames=0,15,30]
Frame 0 = the approved camera in both builds, so it is compared pixel by pixel with the approved picture (scaled to the 412 x 915 phone
frame: same vertical field of view, sides cropped). Scenery = everything below the HUD minus a generous box around Benny (both builds
use the same Benny model, so he is not part of the scenery comparison). Later frames have no approved counterpart (the camera has moved):
for them the colour look (hue/saturation histogram correlation with the approved scenery) and sharpness (Laplacian energy relative to the
approved) are reported, plus the pictures."""
import sys, os, json, numpy as np, cv2
from PIL import Image
cur, kit, out = sys.argv[1:4]; frames = [int(x) for x in (sys.argv[4] if len(sys.argv) > 4 else '0,15,30').split(',')]
os.makedirs(out, exist_ok=True)
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'references', '05_flow_into_the_current.png')
W, H = 412, 915
ref = Image.open(REF).convert('RGB'); sc = H / ref.height; rw = round(ref.width * sc)
ref = np.array(ref.resize((rw, H), Image.LANCZOS))[:, (rw - W) // 2:(rw - W) // 2 + W].astype(np.float32)
mask = np.ones((H, W), bool); mask[:125] = False; mask[400:780, 50:362] = False     # HUD rows; Benny box
def load(d, i): return np.array(Image.open(os.path.join(d, f'f_{i:04d}.jpg')).convert('RGB').resize((W, H))).astype(np.float32)
def ssim(a, b):
    a = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); b = cv2.cvtColor(b.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    k = lambda x: cv2.GaussianBlur(x, (0, 0), 1.5); ma, mb = k(a), k(b); va, vb, cab = k(a * a) - ma ** 2, k(b * b) - mb ** 2, k(a * b) - ma * mb
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2; return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))
def hs_corr(a, b):
    def h(x): hsv = cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2HSV); m = mask.astype(np.uint8); hh = cv2.calcHist([hsv], [0, 1], m, [36, 16], [0, 180, 0, 256]); return cv2.normalize(hh, hh).flatten()
    return float(cv2.compareHist(h(a), h(b), cv2.HISTCMP_CORREL))
def sharp(x): g = cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); return float(np.abs(cv2.Laplacian(g, cv2.CV_32F))[mask].mean())
res = {'rule': 'scenery = below the HUD, Benny box excluded; frame 0 compared pixel by pixel with the approved picture', 'frames': {}}
s_ref = sharp(ref)
for i in frames:
    row = {}
    for name, d in (('current', cur), ('kit', kit)):
        try: im = load(d, i)
        except FileNotFoundError: continue
        r = {'colour_look_corr': round(hs_corr(im, ref), 3), 'sharpness_vs_approved': round(sharp(im) / s_ref, 3)}
        if i == 0:
            diff = np.abs(im - ref).mean(2)
            r.update({'mean_abs_diff_levels': round(float(diff[mask].mean()), 1), 'share_within_20_levels': round(float((diff[mask] < 20).mean()), 3),
                      'ssim_scenery': round(float(ssim(im, ref)[mask].mean()), 3)})
        row[name] = r
    res['frames'][str(i)] = row
    ims = [ref] + [load(d, i) for d in (cur, kit) if os.path.exists(os.path.join(d, f'f_{i:04d}.jpg'))]
    sheet = np.full((H, W * len(ims) + 12 * (len(ims) - 1), 3), 255, np.uint8)
    for j, im in enumerate(ims): sheet[:, j * (W + 12):j * (W + 12) + W] = im.astype(np.uint8)
    Image.fromarray(sheet).save(os.path.join(out, f'APPROVED_CURRENT_KIT_f{i:04d}.jpg'), quality=92)
json.dump(res, open(os.path.join(out, 'compare_r33.json'), 'w'), indent=1); print(json.dumps(res, indent=1))
