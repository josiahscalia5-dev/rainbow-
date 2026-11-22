"""r30 benny06: Benny close-up vs the four storyboard panels (+ approved 06 at the start).
Painted Benny features per panel (colour): pompom top, body bottom (waterline), body centre x. Game Benny features from the
sweep mask capture. The game crop is aligned with ONE uniform scale (pom top -> bottom height) + translation, so proportion
errors still show; share of pixels with max channel |dRGB| <= 20 inside the painted Benny box (half-width 0.55 x height).
usage: python3 -I panels.py <maskdir> <outdir>   (maskdir: BEFORE_/NEW_<shot>.png + _mask.png from tools/benny30/sweep.mjs)"""
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFont
MD, OUT = sys.argv[1], sys.argv[2]
SB = Image.open('/home/user/rainbow-/docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png').convert('RGB')
AP = Image.open('/home/user/rainbow-/references/06_crest_the_rinse_arch.png').convert('RGB')
PANELS = [(16, 100, 506, 724), (520, 100, 1010, 724), (16, 790, 506, 1398), (520, 790, 1010, 1398)]
SHOT = ['c_238', 'd_266', 'e_310', 'g_387']
# painted Benny features per panel (panel-local px), read BY EYE from 1:1 crops (colour detection is confused by the purple
# tunnel / pink water edges): pompom top, waterline at the body centre, body centre x
PAINTED = [dict(top=298, bot=570, cx=250), dict(top=298, bot=570, cx=252), dict(top=272, bot=552, cx=245), dict(top=272, bot=555, cx=250)]

def painted_feats(img, rx0, ry0, rx1, ry1):
    a = np.asarray(img, int); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    pink = (R > 190) & (G < 150) & (B > 120) & (R - G > 80)
    vio = (B > 170) & (G < 130) & (R > 90) & (R < 215) & (B - G > 80)
    reg = np.zeros(pink.shape, bool); reg[ry0:ry1, rx0:rx1] = True
    pk = pink & reg
    cols = pk.sum(0); xs = np.nonzero(cols > 0.3 * cols.max())[0]
    cx = int(np.average(np.arange(len(cols)), weights=cols))
    band = np.zeros_like(reg); band[:, max(cx - 45, 0):cx + 45] = True
    rows = (pk & band).sum(1); ys = np.nonzero(rows > 45)[0]; bot = int(ys.max())
    vr = (vio & reg & band).sum(1)
    top = next(y for y in range(ry0 + 10, ry1) if all(vr[y:y + 12] >= 18))
    return dict(top=top, bot=bot, cx=cx)

def game_feats(mask, cap):
    m = np.asarray(mask, int); c = np.asarray(cap, int)
    chg = np.abs(m - c).max(-1) > 40
    R, G, B = m[..., 0], m[..., 1], m[..., 2]
    body = (R > 150) & (G < 60) & (B < 60) & chg
    pom = (G > 150) & (R < 60) & (B < 60) & chg
    cuff = (B > 150) & (R < 60) & (G < 60) & chg
    cx = int(np.nonzero(cuff)[1].mean())
    hw = np.nonzero(cuff.any(0))[0]; half = (hw.max() - hw.min()) / 2
    cb = body[:, int(cx - 0.4 * half):int(cx + 0.4 * half)]
    bot = int(np.nonzero(cb.any(1))[0].max())
    top = int(np.nonzero(pom.any(1))[0].min())
    return dict(top=top, bot=bot, cx=cx)

def aligned(cap, gf, pf, size):
    """warp the game capture so its features land on the painted features; return the painted-box crop (size)"""
    s = (pf['bot'] - pf['top']) / (gf['bot'] - gf['top'])
    H = pf['bot'] - pf['top']; hw = 0.55 * H
    bx0, by0, bx1, by1 = pf['cx'] - hw, pf['top'] - 0.06 * H, pf['cx'] + hw, pf['bot'] + 0.04 * H
    # painted box -> game coords
    gx0 = gf['cx'] + (bx0 - pf['cx']) / s; gx1 = gf['cx'] + (bx1 - pf['cx']) / s
    gy0 = gf['top'] + (by0 - pf['top']) / s; gy1 = gf['top'] + (by1 - pf['top']) / s
    return cap.crop((int(round(gx0)), int(round(gy0)), int(round(gx1)), int(round(gy1)))).resize(size, Image.LANCZOS), \
        (int(round(bx0)), int(round(by0)), int(round(bx1)), int(round(by1)))

def share(a, b):
    d = np.abs(np.asarray(a, float) - np.asarray(b, float)).max(-1)
    return round(100 * float((d <= 20).mean()), 1), round(float(np.abs(np.asarray(a, float) - np.asarray(b, float)).mean()), 1)

res = {}; rows = []
CW, CH = 300, 330
# row 0: approved start, same framing (no alignment) - the standard Benny box x200-700 y600-1260
ab = (200, 600, 700, 1260)
row = [('APPROVED 06 (start)', AP.crop(ab).resize((CW, CH)))]
for k in ('BEFORE', 'NEW'):
    cap = Image.open(f'{MD}/{k}_a_start.png').convert('RGB')
    sh = share(AP.crop(ab), cap.crop(ab)); res[f'start_{k}'] = sh
    row.append((f'{k} start  {sh[0]}% (box)', cap.crop(ab).resize((CW, CH))))
rows.append(row)
for i, (x0, y0, x1, y1) in enumerate(PANELS):
    pan = SB.crop((x0, y0, x1, y1))
    pf = PAINTED[i]
    row = []
    for k in ('BEFORE', 'NEW'):
        cap = Image.open(f'{MD}/{k}_{SHOT[i]}.png').convert('RGB'); mask = Image.open(f'{MD}/{k}_{SHOT[i]}_mask.png').convert('RGB')
        gf = game_feats(mask, cap)
        g, pb = aligned(cap, gf, pf, (pb_w := 0, 0) and None or (1, 1))  # placeholder to get the box
        bw, bh = pb[2] - pb[0], pb[3] - pb[1]
        g, pb = aligned(cap, gf, pf, (bw, bh))
        ref = pan.crop(pb)
        sh = share(ref, g); res[f'panel{i+1}_{k}'] = dict(share=sh[0], mean=sh[1], game=gf, painted=pf)
        row.append((f'{k} s{SHOT[i][2:]}  {sh[0]}%', g.resize((CW, CH))))
    row.insert(0, (f'STORYBOARD {i+1}', pan.crop(pb).resize((CW, CH))))
    rows.append(row)
sheet = Image.new('RGB', (3 * CW + 40, len(rows) * (CH + 28) + 10), (18, 14, 26))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
except Exception: font = ImageFont.load_default()
for r, row in enumerate(rows):
    for c, (lab, im) in enumerate(row):
        X, Y = 10 + c * (CW + 10), 6 + r * (CH + 28)
        d.text((X, Y), lab, fill=(255, 240, 160), font=font); sheet.paste(im, (X, Y + 22))
sheet.save(f'{OUT}/BENNY_CLOSEUP_SHEET.png')
json.dump(res, open(f'{OUT}/benny_numbers.json', 'w'), indent=1)
for k, v in res.items(): print(k, v if not isinstance(v, dict) else (v['share'], v['mean'], 'game', v['game'], 'painted', v['painted']))
