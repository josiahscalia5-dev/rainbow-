"""r30b lead: the user's four numbered comparisons (docs/briefs/2026-11-20-r30/USER_R30.md §6.7): for each storyboard panel
  STORYBOARD PANEL (concept artwork = the approved target) | BASELINE (r30 v2 gameplay = the user's bottom row) | NEW (r30b gameplay)
all three in the SAME window: the panel's own area of the game frame, (28,250)-(811,1251) of 864x1536 (storyboard panel 1 registered onto
the approved picture by SIFT + RANSAC, 93 inliers, Benny coincides exactly: qa/match/06/r30b/align/). Full frames are saved beside them.
usage: python3 -I r30b_proof.py <baselineDir> <newDir> <outDir> b1,b2,b3,b4 n1,n2,n3,n4   (frame files <dir>/p<k>_<s>.png at 864x1536)"""
import sys, os, json
from PIL import Image, ImageDraw, ImageFont
B, N, OUT = sys.argv[1:4]
bs = sys.argv[4].split(','); ns = sys.argv[5].split(',')
os.makedirs(OUT, exist_ok=True)
SB = Image.open('/home/user/rainbow-/docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png').convert('RGB')
BOX = [(16, 100, 506, 724), (520, 100, 1010, 724), (16, 790, 506, 1398), (520, 790, 1010, 1398)]
NAMES = ['curl right over the crest', 'descend through the gold band', 'follow the winding slide', 'connect into Screen 07']
WIN = (28, 250, 811, 1251)
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f1, f2, f3 = ImageFont.truetype(FB, 40), ImageFont.truetype(FB, 26), ImageFont.truetype(FR, 22)
w, h = 783, 1000
for k in range(4):
    pan = SB.crop(BOX[k]).resize((w, h), Image.LANCZOS)
    fb = Image.open(f'{B}/p{k + 1}_{bs[k]}.png').convert('RGB'); fn = Image.open(f'{N}/p{k + 1}_{ns[k]}.png').convert('RGB')
    cols = [(pan, 'APPROVED TARGET', f'storyboard panel {k + 1} (concept artwork)', (255, 215, 120)),
            (fb.crop(WIN), 'BASELINE (r30 v2)', f'real gameplay, river s {bs[k]} (your bottom row)', (200, 200, 230)),
            (fn.crop(WIN), 'NEW (r30b candidate)', f'real gameplay, river s {ns[k]}', (140, 255, 190))]
    g = 24; W = 3 * w + 4 * g; H = 120 + h + 90
    sheet = Image.new('RGB', (W, H), (20, 12, 34)); d = ImageDraw.Draw(sheet)
    d.text((g, 26), f'{k + 1}  -  {NAMES[k].upper()}', font=f1, fill='white')
    for i, (im, t1, t2, col) in enumerate(cols):
        x = g + i * (w + g); sheet.paste(im, (x, 110))
        d.text((x, 110 + h + 12), t1, font=f2, fill=col); d.text((x, 110 + h + 48), t2, font=f3, fill=(220, 220, 235))
    sheet.save(f'{OUT}/{k + 1}_PANEL{k + 1}_APPROVED_BASELINE_NEW.jpg', quality=92)
    # separate full-size pictures too (no grid): the full game frames and the panel
    pan.save(f'{OUT}/{k + 1}a_APPROVED_storyboard_panel{k + 1}.png'); fb.save(f'{OUT}/{k + 1}b_BASELINE_full_s{bs[k]}.png'); fn.save(f'{OUT}/{k + 1}c_NEW_full_s{ns[k]}.png')
print('wrote', OUT)
