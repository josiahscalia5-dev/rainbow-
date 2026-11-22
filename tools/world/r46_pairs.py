"""Rainbow round 46 - labelled side-by-side pairs for the user (APPROVED | NEW at the picture view, BEFORE (r45b) | NEW at the same swimming
positions, both from tools/screenkit/preview.cjs runs of the SAME checker), plus the numbers table.
  python3 -I tools/world/r46_pairs.py <before preview dir> <new preview dir> <screen NN> <out dir>
Every frame is the real 412 x 915 game render (no crop, no retouch); the approved picture is scaled to the same height."""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
REFS = {'05': 'references/05_flow_into_the_current.png', '06': 'references/06_crest_the_rinse_arch.png'}


def font(sz):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p): return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def band(im, text, col):
    W, H = im.size; out = Image.new('RGB', (W, H + 44), col); out.paste(im, (0, 44)); d = ImageDraw.Draw(out); d.text((10, 10), text, fill='white', font=font(20)); return out


def pair(a, la, b, lb, path):
    A = band(a, la, (60, 30, 90)); B = band(b, lb, (20, 90, 60)); W = Image.new('RGB', (A.width + B.width + 8, max(A.height, B.height)), 'white')
    W.paste(A, (0, 0)); W.paste(B, (A.width + 8, 0)); W.save(path, quality=92)


def main():
    bdir, ndir, nn, out = sys.argv[1:5]; os.makedirs(out, exist_ok=True)
    ref = Image.open(os.path.join(REPO, REFS[nn])).convert('RGB'); new_pic = Image.open(os.path.join(ndir, 'tex_picture_l0.png')).convert('RGB')
    ref = ref.resize((round(ref.width * new_pic.height / ref.height), new_pic.height), Image.LANCZOS)
    pair(ref, f'APPROVED {nn} (your picture)', new_pic, f'NEW game {nn} - picture camera', os.path.join(out, f'{nn}_1_APPROVED_vs_NEW_picture_view.jpg'))
    bpic = Image.open(os.path.join(bdir, 'tex_picture_l0.png')).convert('RGB')
    pair(bpic, f'BEFORE (r45b) {nn} - picture camera', new_pic, f'NEW (r46) {nn} - picture camera', os.path.join(out, f'{nn}_2_BEFORE_vs_NEW_picture_view.jpg'))
    nj = json.load(open(os.path.join(ndir, 'preview.json'))); bj = json.load(open(os.path.join(bdir, 'preview.json')))
    tags = [f['tag'] for f in nj['frames'] if f.get('mode') == 'textured' and f['tag'] != 'picture']
    seen = []
    for t in tags:
        if t in seen: continue
        seen.append(t)
    k = 3
    for t in seen:
        for lane in (-1, 0, 1):
            fn = os.path.join(ndir, f'tex_{t}_l{lane}.png')
            tb = t if os.path.exists(os.path.join(bdir, f'tex_{t}_l{lane}.png')) else next((x for x in os.listdir(bdir) if x.startswith('tex_' + t.split('_')[0]) and x.endswith(f'_l{lane}.png')), None)
            fb = os.path.join(bdir, f'tex_{tb}_l{lane}.png') if tb and not tb.startswith('tex_') else (os.path.join(bdir, tb) if tb else None)
            if not (os.path.exists(fn) and fb and os.path.exists(fb)): continue
            ln = {-1: 'left lane', 0: 'centre lane', 1: 'right lane'}[lane]
            pair(Image.open(fb).convert('RGB'), f'BEFORE (r45b) {nn} {t} {ln}', Image.open(fn).convert('RGB'), f'NEW (r46) {nn} {t} {ln}', os.path.join(out, f'{nn}_{k}_BEFORE_vs_NEW_{t}_{ln.replace(" ", "_")}.jpg'))
            k += 1
    def summ(j):
        s = j['summary']; lp = s['likeness_picture_view'][0]
        return {'picture_view_within_20_levels_pct': round(100 * lp['share_within_20_levels'], 1), 'picture_view_ssim': lp['ssim_scenery'], 'picture_view_sharpness': lp['sharpness_vs_approved'],
                'repeat_views_within_20_mean_pct': round(100 * s['repeat_within_20_mean'], 1), 'colour_look_mean': s['colour_look_mean'], 'hole_pixels': s['holes_total'],
                **{f'swimming_style_{g}': v['style_pct_mean'] for g, v in s['surfaces_while_swimming'].items()}}
    T = {'screen': nn, 'before_r45b': summ(bj), 'new_r46': summ(nj)}
    json.dump(T, open(os.path.join(out, f'{nn}_numbers.json'), 'w'), indent=1); print(json.dumps(T))


if __name__ == '__main__':
    main()
