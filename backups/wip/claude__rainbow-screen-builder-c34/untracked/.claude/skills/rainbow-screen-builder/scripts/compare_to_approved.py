"""Rainbow Screen Builder — measure game frames against the screen's APPROVED picture (generalised from tools/kit05/compare_r33.py;
its five numbers are computed with exactly the same formulas, so round-33 results stay comparable).

  python3 -I compare_to_approved.py <approved.png | screen:NN> <NEW frame.jpg | run dir> [--before <frame | run dir>]
        [--frames 0,15,30] [--mask screen:NN | auto:<analysis.json> | hud=125;box=50,400,362,780 | none | <mask.png>]
        [--aligned 0 | all | none] [--out DIR] [--tag NAME] [--owners owners.json]

* The approved picture is shown as the game frame shows it: scaled to the frame height (915), centre-cropped to the width (412).
* SCENERY mask: below the HUD rows, minus exclusion boxes (Benny + his splash: he is the same 3D model in every build and is judged
  separately). `screen:NN` = the validated mask in ../screens.json; `auto:` = analyze_reference.py's estimate (confirm it first).
* ALIGNED frames (default: frame 0 of a run, or a single image) are taken from the approved camera: compared pixel by pixel —
  share of scenery pixels whose mean |RGB difference| < 20 levels, mean difference, SSIM, colour look (hue/sat histogram correlation)
  and sharpness (Laplacian energy) vs the approved. MOVING frames (camera has moved; no approved counterpart): colour look, sharpness
  and the balance of Rainbow colour classes (water / pink / gold / purple / foam) vs the approved.
* WHERE the differences are (aligned frames): mismatch share per colour region of the approved picture and per 3x3 screen zone,
  with the specialist who owns that region (step 7 of the skill: route the biggest differences).
* Pictures for the user: APPROVED / BEFORE / NEW as SEPARATE full-size phone frames with a label band (never a grid), + a diff heat map.
Writes <out>/compare.json and prints it."""
import sys, os, json, glob, argparse
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from analyze_reference import classes, reference_in_phone_frame   # noqa: E402  (same colour classes + crop rule as the analysis)
SKILL = os.path.dirname(HERE); REPO = os.path.abspath(os.path.join(SKILL, '..', '..', '..'))
W, H = 412, 915
DEFAULT_OWNERS = {   # colour region of the approved picture -> who fixes it (round-34 ownership map; override with --owners)
    'water_cyan': 'water-fx-specialist (in round 34: S1 washer-environment-modeler owns the water surface bake)',
    'pink_edge': 'water-fx-specialist (pink / magenta river edges)',
    'gold': 'washer-environment-modeler (gold rings, machinery); coins -> path-camera-transition-engineer (coin layout)',
    'purple': 'washer-environment-modeler (perforated purple walls)',
    'foam_white': 'foam-bubbles-particles (foam banks, bubbles, splashes)',
    'near_black': 'washer-environment-modeler (dark gaps / unseen surfaces) + playwright-visual-qa (dark-patch check)',
    'other': 'reference-match-director (triage)',
}


def screens_cfg():
    return json.load(open(os.path.join(SKILL, 'screens.json')))


def resolve_ref(arg):
    if arg.startswith('screen:'):
        s = screens_cfg()['screens'][arg.split(':', 1)[1]]; return os.path.join(REPO, s['reference']), s
    return arg, None


def build_mask(spec, scr):
    m = np.ones((H, W), bool); info = {'spec': spec}
    if spec is None or spec == 'none':
        return m, info
    if spec.startswith('screen:'):
        cm = screens_cfg()['screens'][spec.split(':', 1)[1]].get('compare_mask')
        if not cm:
            raise SystemExit(f'no validated compare_mask for {spec} in screens.json: use auto:<analysis.json> or hud=..;box=..')
        hud, boxes = cm['hud_rows'], cm['exclude_boxes_xyxy']; info['validated'] = cm.get('validated')
    elif spec.startswith('auto:'):
        sm = json.load(open(spec[5:]))['suggested_compare_mask']; hud, boxes = sm['hud_rows'], sm['exclude_boxes_xyxy']; info['status'] = sm.get('status')
    elif spec.startswith('hud='):
        kv = dict(p.split('=', 1) for p in spec.split(';')); hud = int(kv['hud'])
        boxes = [[int(v) for v in b.split(',')] for b in kv.get('box', '').split('|') if b]
    else:
        mm = np.array(Image.open(spec).convert('L').resize((W, H), Image.NEAREST)) > 127; info['file'] = spec; return mm, info
    m[:hud] = False
    for x0, y0, x1, y1 in boxes:
        m[y0:y1, x0:x1] = False                       # NOTE row/column order as in compare_r33.py: mask[400:780, 50:362]
    info.update({'hud_rows': hud, 'exclude_boxes_xyxy': boxes, 'scenery_share_of_frame': round(float(m.mean()), 3)})
    return m, info


def frames_of(path, idx):
    if os.path.isdir(path):
        if idx is None:
            fs = sorted(glob.glob(os.path.join(path, 'f_*.jpg')))
            return [(int(os.path.basename(f)[2:6]), f) for f in fs[:1]]
        return [(i, os.path.join(path, f'f_{i:04d}.jpg')) for i in idx if os.path.exists(os.path.join(path, f'f_{i:04d}.jpg'))]
    return [(0, path)]


def load(f):
    return np.array(Image.open(f).convert('RGB').resize((W, H))).astype(np.float32)      # same call as compare_r33.py


def ssim_map(a, b):
    a = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); b = cv2.cvtColor(b.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    k = lambda x: cv2.GaussianBlur(x, (0, 0), 1.5); ma, mb = k(a), k(b); va, vb, cab = k(a * a) - ma ** 2, k(b * b) - mb ** 2, k(a * b) - ma * mb
    C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2; return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))


def hs_corr(a, b, mask):
    def h(x):
        hsv = cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2HSV); hh = cv2.calcHist([hsv], [0, 1], mask.astype(np.uint8), [36, 16], [0, 180, 0, 256]); return cv2.normalize(hh, hh).flatten()
    return float(cv2.compareHist(h(a), h(b), cv2.HISTCMP_CORREL))


def sharp(x, mask):
    g = cv2.cvtColor(x.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32); return float(np.abs(cv2.Laplacian(g, cv2.CV_32F))[mask].mean())


def label(im, text, sub=''):
    band = 46 if sub else 30; out = Image.new('RGB', (W, H + band), (24, 10, 36)); out.paste(Image.fromarray(im.astype(np.uint8)), (0, band))
    d = ImageDraw.Draw(out)
    try:
        f1 = ImageFont.truetype('DejaVuSans-Bold.ttf', 17); f2 = ImageFont.truetype('DejaVuSans.ttf', 12)
    except Exception:
        f1 = f2 = ImageFont.load_default()
    d.text((8, 5), text, fill=(255, 255, 255), font=f1)
    if sub:
        d.text((8, 27), sub, fill=(230, 200, 255), font=f2)
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('approved'); ap.add_argument('new'); ap.add_argument('--before'); ap.add_argument('--frames')
    ap.add_argument('--mask'); ap.add_argument('--aligned', default='0'); ap.add_argument('--out'); ap.add_argument('--tag', default='')
    ap.add_argument('--owners'); ap.add_argument('--no-pictures', action='store_true')
    a = ap.parse_args()
    ref_path, scr = resolve_ref(a.approved)
    mask_spec = a.mask or (a.approved if a.approved.startswith('screen:') else 'none')
    mask, minfo = build_mask(mask_spec, scr)
    owners = dict(DEFAULT_OWNERS, **(json.load(open(a.owners)) if a.owners else {}))
    ref = reference_in_phone_frame(np.array(Image.open(ref_path).convert('RGB')), W, H)
    cl, _ = classes(ref); s_ref = sharp(ref, mask)
    region = np.full((H, W), 'other', dtype=object)
    for k in ('water_cyan', 'pink_edge', 'gold', 'purple', 'foam_white', 'near_black'):
        region[cl[k] & (region == 'other')] = k
    idx = [int(x) for x in a.frames.split(',')] if a.frames else None
    new = frames_of(a.new, idx); before = dict(frames_of(a.before, [i for i, _ in new])) if a.before else {}
    aligned = (lambda i: True) if a.aligned == 'all' else (lambda i: False) if a.aligned == 'none' else (lambda i, s=set(int(v) for v in a.aligned.split(',')): i in s)
    out = a.out or (os.path.join(a.new if os.path.isdir(a.new) else os.path.dirname(os.path.abspath(a.new)), 'compare'))
    os.makedirs(out, exist_ok=True); tag = (a.tag + '_') if a.tag else ''
    res = {'approved': os.path.abspath(ref_path), 'phone_frame': [W, H], 'mask': minfo,
           'rule': 'scenery = below the HUD minus the exclusion boxes; aligned frames compared pixel by pixel with the approved picture '
                   '(mean |RGB diff| < 20 levels = "within 20 levels"); formulas identical to tools/kit05/compare_r33.py', 'frames': {}}
    ref_shares = {k: float(cl[k][mask].mean()) for k in ('water_cyan', 'pink_edge', 'gold', 'purple', 'foam_white')}
    if not a.no_pictures:
        label(ref, f'APPROVED  {os.path.basename(ref_path)[:34]}').save(os.path.join(out, f'{tag}APPROVED.jpg'), quality=93)
    for i, f in new:
        row = {}
        for name, path in (('new', f), ('before', before.get(i))):
            if not path:
                continue
            im = load(path); r = {'file': os.path.abspath(path), 'colour_look_corr': round(hs_corr(im, ref, mask), 3), 'sharpness_vs_approved': round(sharp(im, mask) / s_ref, 3)}
            c2, _ = classes(im); r['class_balance_vs_approved'] = {k: [round(float(c2[k][mask].mean()), 3), round(v, 3)] for k, v in ref_shares.items()}
            if aligned(i):
                diff = np.abs(im - ref).mean(2); bad = (diff >= 20) & mask
                r.update({'mean_abs_diff_levels': round(float(diff[mask].mean()), 1), 'share_within_20_levels': round(float((diff[mask] < 20).mean()), 3),
                          'ssim_scenery': round(float(ssim_map(im, ref)[mask].mean()), 3),
                          'whole_frame_within_20_levels': round(float((diff < 20).mean()), 3)})
                tot = max(1, int(bad.sum())); regs = []
                for k in ('water_cyan', 'pink_edge', 'gold', 'purple', 'foam_white', 'near_black', 'other'):
                    rk = (region == k) & mask
                    if rk.sum() < 50:
                        continue
                    regs.append({'region': k, 'share_of_scenery': round(float(rk.sum() / mask.sum()), 3), 'mismatch_inside': round(float(bad[rk].mean()), 3),
                                 'share_of_all_mismatch': round(float(bad[rk].sum() / tot), 3), 'owner': owners.get(k, owners['other'])})
                regs.sort(key=lambda t: -t['share_of_all_mismatch']); r['regions'] = regs
                zones = {}
                ys = np.linspace(int(np.argmax(mask.any(1))), H, 4).astype(int); xs = np.linspace(0, W, 4).astype(int)
                for zi, zn in enumerate(('top', 'middle', 'bottom')):
                    for zj, zm in enumerate(('left', 'centre', 'right')):
                        zm_ = np.zeros_like(mask); zm_[ys[zi]:ys[zi + 1], xs[zj]:xs[zj + 1]] = True; zm_ &= mask
                        if zm_.sum():
                            zones[f'{zn}-{zm}'] = round(float(bad[zm_].sum() / tot), 3)
                r['zones_share_of_all_mismatch'] = dict(sorted(zones.items(), key=lambda t: -t[1]))
                r['route_first'] = [f"{g['region']} ({round(100 * g['share_of_all_mismatch'])} % of the mismatch) -> {g['owner']}" for g in regs[:3]]
                if name == 'new' and not a.no_pictures:
                    heat = cv2.applyColorMap(np.clip(diff * 4, 0, 255).astype(np.uint8), cv2.COLORMAP_INFERNO)[..., ::-1].astype(np.float32)
                    heat[~mask] = heat[~mask] * 0.25
                    label(heat, f'DIFF  NEW vs APPROVED  f{i:04d}', 'bright = far from the approved; dimmed = HUD / Benny (not scenery)').save(os.path.join(out, f'{tag}DIFF_NEW_f{i:04d}.jpg'), quality=90)
            row[name] = r
            if not a.no_pictures:
                sub = (f"scenery {100 * r['share_within_20_levels']:.1f} % within 20 levels  SSIM {r['ssim_scenery']:.2f}  colour {r['colour_look_corr']:.2f}"
                       if 'share_within_20_levels' in r else f"moving view  colour look {r['colour_look_corr']:.2f}  sharpness {r['sharpness_vs_approved']:.2f}")
                label(im, f'{name.upper()}  frame {i}', sub).save(os.path.join(out, f'{tag}{name.upper()}_f{i:04d}.jpg'), quality=93)
        res['frames'][str(i)] = row
    json.dump(res, open(os.path.join(out, f'{tag}compare.json'), 'w'), indent=1)
    print(json.dumps(res, indent=1))


if __name__ == '__main__':
    main()
