"""Rainbow screen kit - preview verdict + contact sheet (round 45), run by preview.cjs after it has captured the stills.
Per still: hole pixels (pure green sentinel background showing through the world), Benny inside the frame, Benny's size on screen vs the picture
view, camera clearance (clipping), water gap under Benny (floating), colour look vs the approved picture (hue / saturation histogram
correlation below the HUD), plus the measured likeness at the picture view(s) (compare_screen.py, unchanged 20-level threshold).
  python3 -I tools/screenkit/preview_sheet.py <preview dir> <NN|-> <area|-> <game folder>
Writes preview.json (frames + verdict) and preview_sheet.jpg (rows = places along the level, columns = left / centre / right lanes + gray)."""
import sys, os, json, subprocess
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
out, NN, area, game = sys.argv[1:5]; raw = json.load(open(os.path.join(out, 'preview_raw.json'))); W, H = 412, 915
if NN == '-' and area != '-': NN = area if area.isdigit() else '-'
ref = None
if NN != '-':
    rp = json.load(open(os.path.join(REPO, '.claude/skills/rainbow-screen-builder/screens.json')))['screens'][NN]['reference']
    im = Image.open(os.path.join(REPO, rp)).convert('RGB'); s = H / im.height; im = im.resize((round(im.width * s), H), Image.LANCZOS); x = (im.width - W) // 2
    ref = np.asarray(im.crop((x, 0, x + W, H)))
def hs_hist(a):
    hsv = cv2.cvtColor(a[110:], cv2.COLOR_RGB2HSV); h = cv2.calcHist([hsv], [0, 1], None, [36, 16], [0, 180, 0, 256]); return cv2.normalize(h, h).flatten()
ref_h = hs_hist(ref) if ref is not None else None
pic_h = None
for f in raw['frames']:
    a = np.asarray(Image.open(os.path.join(out, f['file'])).convert('RGB')).astype(int)
    f['holes_px'] = int(((a[..., 1] > 200) & (a[..., 0] < 70) & (a[..., 2] < 70)).sum())
    b = f['box']; f['benny_in_frame'] = bool(b['x0'] >= 0 and b['x1'] <= W and b['y0'] >= 0 and b['y1'] <= H); f['benny_h_px'] = round(b['y1'] - b['y0'], 1)
    if f['mode'] == 'textured' and ref_h is not None: f['colour_look'] = round(float(cv2.compareHist(ref_h, hs_hist(a.astype(np.uint8)), cv2.HISTCMP_CORREL)), 3)
    if f['tag'] == 'picture' and f['mode'] == 'textured' and pic_h is None: pic_h = f['benny_h_px']
for f in raw['frames']:
    if pic_h: f['benny_size_vs_picture'] = round(f['benny_h_px'] / pic_h, 3)
# likeness at the picture view(s)
mask = next((p for p in [os.path.join(game, 'mask_0.png'), os.path.join(game, f'a{area}', 'mask_0.png')] if os.path.exists(p)), None)
likeness = []
for f in raw['frames']:
    if f['tag'] == 'picture' and f['mode'] == 'textured' and mask and NN != '-':
        r = subprocess.run(['python3', '-I', os.path.join(HERE, 'compare_screen.py'), NN, os.path.join(out, f['file']), mask, os.path.join(out, 'compare'), '--tag', f['file'][:-4]], stdout=subprocess.PIPE, text=True)
        try: d = json.loads(r.stdout); f['likeness'] = d['new']; likeness.append({'file': f['file'], **d['new']})
        except Exception: f['likeness'] = None
# verdict
issues = []
for f in raw['frames']:
    q = f.get('qa') or {}; tag = f"{f['mode']} {f['tag']} lane {f['lane']} (s {f['s']})"
    if f['holes_px'] > 40: issues.append(['FAIL', tag, f"{f['holes_px']} hole pixels (green)"])
    if not f['benny_in_frame']: issues.append(['FAIL', tag, f"Benny outside the frame {f['box']}"])
    if q.get('camClear') is not None and q['camClear'] < 0.04: issues.append(['FAIL', tag, f"camera {q['camClear']} u from scenery (clipping)"])
    elif q.get('camClear') is not None and q['camClear'] < 0.1: issues.append(['WARN', tag, f"camera only {q['camClear']} u from scenery"])
    if f['mode'] == 'textured' and q.get('waterGap') is None: issues.append(['FAIL', tag, 'no water mesh under Benny'])
    elif f['mode'] == 'textured' and abs(q.get('waterGap') or 0) > 0.04: issues.append(['WARN', tag, f"water gap {q['waterGap']} u under Benny"])
    if f.get('benny_size_vs_picture') and not 0.8 <= f['benny_size_vs_picture'] <= 1.25: issues.append(['WARN', tag, f"Benny's size on screen x{f['benny_size_vs_picture']} vs the picture view"])
    if f.get('colour_look') is not None and f['colour_look'] < 0.6: issues.append(['WARN', tag, f"colour look {f['colour_look']} vs the approved picture"])
verdict = 'FAIL' if any(i[0] == 'FAIL' for i in issues) else 'WARN' if issues else 'PASS'
looks = [f['colour_look'] for f in raw['frames'] if f.get('colour_look') is not None]
summary = {'verdict': verdict, 'issues': issues, 'likeness_picture_view': likeness, 'colour_look_min': min(looks) if looks else None,
           'colour_look_mean': round(float(np.mean(looks)), 3) if looks else None, 'holes_total': sum(f['holes_px'] for f in raw['frames']), 'frames': len(raw['frames']),
           'seconds': raw.get('seconds'), 'errors': raw.get('errors')}
json.dump({**raw, 'summary': summary, 'verdict': verdict}, open(os.path.join(out, 'preview.json'), 'w'), indent=1)
# contact sheet: rows = places, columns = left / centre / right textured + centre gray
places = sorted({(f['s'], f['tag']) for f in raw['frames']}); cols = [('textured', -1), ('textured', 0), ('textured', 1), ('gray', 0)]
tw, th = 206, 458; sheet = Image.new('RGB', (len(cols) * (tw + 6) + 6, len(places) * (th + 30) + 40), (24, 10, 40)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
except Exception: font = ImageFont.load_default()
d.text((8, 10), f"{NN if NN != '-' else ''} {('area ' + area) if area != '-' else ''}  preview: {verdict}   columns: left / centre / right lane (textured), centre (gray geometry test)", fill=(255, 255, 255), font=font)
by = {(f['s'], f['tag'], f['mode'], f['lane']): f for f in raw['frames']}
for r, (s, tag) in enumerate(places):
    for c, (mode, lane) in enumerate(cols):
        f = by.get((s, tag, mode, lane)); x, y = 6 + c * (tw + 6), 40 + r * (th + 30)
        if not f: continue
        sheet.paste(Image.open(os.path.join(out, f['file'])).convert('RGB').resize((tw, th)), (x, y))
        lab = f"{tag} s{s:.1f} L{lane:+d}" + (f" look {f['colour_look']}" if f.get('colour_look') is not None else '') + (f" HOLES {f['holes_px']}" if f['holes_px'] > 40 else '')
        d.text((x + 2, y + th + 4), lab[:34], fill=(255, 120, 120) if f['holes_px'] > 40 else (230, 230, 230), font=font)
sheet.save(os.path.join(out, 'preview_sheet.jpg'), quality=86)
print(json.dumps({k: summary[k] for k in ('verdict', 'likeness_picture_view', 'colour_look_min', 'colour_look_mean', 'holes_total', 'frames', 'seconds')}, indent=1))
for i in issues[:25]: print(' ', *i)
