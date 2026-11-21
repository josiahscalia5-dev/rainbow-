#!/usr/bin/env python3
"""r29 lead: full-size ORIGINAL APPROVED / BEFORE / NEW stills of Screen 06 taken from the two continuous clips (same steering schedule),
at the same share of the screen (start, crest, tunnel entry, steering LEFT, steering RIGHT, late, exit, first 07 frames), + one labelled
overview sheet per group. usage: python3 -I make_stills.py <clip_before_dir> <clip_new_dir> <out_dir>"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
B, N, OUT = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
APP = Path('/home/user/rainbow-/references/06_crest_the_rinse_arch.png')
MOMENTS = [('01_start', 'Start (approved view)', 0.0), ('02_crest', 'Over the crest (12 %)', 0.12), ('03_into_tunnel', 'Into the ring tunnel (25 %)', 0.25),
           ('04_steer_LEFT', 'Steering hard LEFT (45 %)', 0.45), ('05_steer_RIGHT', 'Steering hard RIGHT (65 %)', 0.65), ('06_late', 'Late (80 %)', 0.80),
           ('07_exit', 'Exit of 06 (96 %)', 0.96), ('08_into_07', 'First frames of Screen 07 (+0.5 s)', None)]
fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
def pick(d, frac):
    fr = json.loads((d / 'frames.json').read_text())['frames']
    if frac is None:
        first07 = next(f for f in fr if f['stage'] != '06'); i = min(len(fr) - 1, first07['i'] + 12); return fr[i]
    in06 = [f for f in fr if f['stage'] == '06']
    return min(in06, key=lambda f: abs(f['frac'] - frac))
def label(im, title, sub):
    im = im.convert('RGB'); dr = ImageDraw.Draw(im)
    dr.rectangle([0, 1536 - 120, 864, 1536], fill=(20, 8, 40)); dr.text((24, 1536 - 108), title, font=fb, fill=(255, 255, 255)); dr.text((24, 1536 - 58), sub, font=fs, fill=(230, 210, 255))
    return im
app = Image.open(APP).convert('RGB').resize((864, 1536))
rows = []
for key, name, frac in MOMENTS:
    fb_, fn_ = pick(B, frac), pick(N, frac)
    d = OUT / key; d.mkdir(parents=True, exist_ok=True)
    a = label(app.copy(), 'ORIGINAL APPROVED', 'your approved Screen 06 (unchanged reference)')
    b = label(Image.open(B / 'f' / f"{fb_['i']:04d}.png"), f'BEFORE  ·  {name}', f"version you last saw · {fb_['stage']} s={fb_['s']:.1f} · {fb_['phase']}")
    n = label(Image.open(N / 'f' / f"{fn_['i']:04d}.png"), f'NEW  ·  {name}', f"deep-route candidate · {fn_['stage']} s={fn_['s']:.1f} · {fn_['phase']}")
    a.save(d / '1_ORIGINAL_APPROVED.png'); b.save(d / '2_BEFORE.png'); n.save(d / '3_NEW.png')
    rows.append((name, a, b, n)); print(key, 'BEFORE frame', fb_['i'], 'NEW frame', fn_['i'])
# overview sheets (3 columns x up to 4 rows each), 288x512 tiles
def sheet(rs, path):
    W, Hh = 288, 512; im = Image.new('RGB', (3 * W + 40, len(rs) * (Hh + 10) + 10), (27, 16, 41))
    for r, (_, a, b, n) in enumerate(rs):
        for c, x in enumerate((a, b, n)): im.paste(x.resize((W, Hh)), (10 + c * (W + 10), 10 + r * (Hh + 10)))
    im.save(path, quality=88)
sheet(rows[:4], OUT / 'SHEET_A_start_crest_tunnel_steerLEFT.jpg'); sheet(rows[4:], OUT / 'SHEET_B_steerRIGHT_late_exit_into07.jpg')
