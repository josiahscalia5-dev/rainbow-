"""r30 benny06: labelled full-size APPROVED | BEFORE | NEW stills per standard position + one overview sheet.
For moving positions the 'APPROVED' column is the matching storyboard panel (scaled to frame height, labelled as such)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
O = '/home/user/rainbow-/qa/match/06/r30/benny06'
AP = Image.open('/home/user/rainbow-/references/06_crest_the_rinse_arch.png').convert('RGB')
SB = Image.open('/home/user/rainbow-/docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png').convert('RGB')
PANELS = [(16, 100, 506, 724), (520, 100, 1010, 724), (16, 790, 506, 1398), (520, 790, 1010, 1398)]
POS = [('a_start', 'start s 198.91', AP, 'APPROVED 06'), ('b_marked', 's 214.86 (marked)', None, ''),
       ('c_238', 's 238', 0, 'STORYBOARD 1'), ('d_266', 's 266', 1, 'STORYBOARD 2'), ('e_310', 's 310', 2, 'STORYBOARD 3'), ('g_387', 's 387', 3, 'STORYBOARD 4')]
try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
except Exception: F = ImageFont.load_default()
def lab(im, t):
    im = im.copy(); d = ImageDraw.Draw(im); d.rectangle((0, 0, im.width, 44), fill=(20, 12, 30)); d.text((12, 6), t, fill=(255, 235, 150), font=F); return im
thumbs = []
for name, pos, ref, rl in POS:
    b = Image.open(f'{O}/BEFORE/{name}.png').convert('RGB'); n = Image.open(f'{O}/NEW/{name}.png').convert('RGB')
    if isinstance(ref, int):
        p = SB.crop(PANELS[ref]); r = Image.new('RGB', (864, 1536), (20, 12, 30)); ps = p.resize((864, int(864 * p.height / p.width)))
        r.paste(ps, (0, (1536 - ps.height) // 2)); rl = f'{rl} (concept panel)'
    elif ref is None:
        r = Image.new('RGB', (864, 1536), (20, 12, 30)); rl = '(no painted view)'
    else:
        r = ref
    row = [lab(r, rl), lab(b, f'BEFORE v2  {pos}'), lab(n, f'NEW v2&b30=1  {pos}')]
    out = Image.new('RGB', (864 * 3 + 20, 1536), (20, 12, 30))
    for i, im in enumerate(row): out.paste(im, (i * 874, 0))
    out.save(f'{O}/{name}_APPROVED_BEFORE_NEW.png')
    thumbs.append(out.resize((out.width // 4, out.height // 4)))
sheet = Image.new('RGB', (thumbs[0].width * 2 + 10, (thumbs[0].height + 10) * 3), (20, 12, 30))
for i, t in enumerate(thumbs): sheet.paste(t, ((i % 2) * (t.width + 10), (i // 2) * (t.height + 10)))
sheet.save(f'{O}/OVERVIEW_SHEET.png')
A = np.asarray(Image.open(f'{O}/BEFORE/a_start.png').convert('RGB'), int); Bn = np.asarray(Image.open(f'{O}/NEW/a_start.png').convert('RGB'), int)
same = np.abs(A - Bn).max(-1) == 0; m = np.ones(same.shape, bool); m[600:1260, 200:700] = False
print('start frame: identical pixels outside the Benny box', round(100 * same[m].mean(), 2), '% ; whole frame', round(100 * same.mean(), 2), '%')
