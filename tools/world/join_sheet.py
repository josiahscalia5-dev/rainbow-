"""Round 44: join sheet + numbers from tools/world/join_audit.cjs captures.
For every join of the route (04 -> A -> B -> 05 -> 06 -> 07 -> 08 -> 09 -> 10): EXIT frames | ENTRANCE frames side by side, and the measured
change across the join between the last exit frame and the first entrance frame (HUD band excluded):
  * colour jump: CIE76 delta-E of the mean Lab colour of the scenery band (y 12-55 % of the frame) and of the water band (y 60-100 %)
  * page load: whether the app reloads a page there today (a hard cut + loading screen)
python3 -I tools/world/join_sheet.py <captures dir> <out.jpg> <out.json>"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw

cap, out_jpg, out_json = sys.argv[1:4]
JOINS = [  # (label, exit frames, entrance frames, page load today)
    ('04 -> A  Bubble Dash', ['J1_04_exit_a', 'J1_04_exit_b'], ['J1_A_entrance_a', 'J1_A_entrance_b'], True),
    ('A -> B  Sock Rescue', ['J2_A_exit_b'], ['J2_B_entrance_a'], False),
    ('B -> 05', ['J3_B_exit_a', 'J3_B_exit_b'], ['J3_05_entrance_a', 'J3_05_entrance_b'], True),
    ('05 -> 06 (rebuilt 06)', ['J4_05_exit_a', 'J4_05_exit_b'], ['K6_kit06_entrance_picture'], True),
    ('06 (rebuilt) -> 07', ['K6_kit06_exit_a', 'K6_kit06_exit_b'], ['J5_07_entrance_a', 'J5_07_entrance_b'], True),
    ('07 -> 08', ['J6_07_exit_a', 'J6_07_exit_b'], ['J6_08_entrance_a', 'J6_08_entrance_b'], False),
    ('08 -> 09', ['J7_08_exit_a', 'J7_08_exit_b'], ['J7_09_entrance_a', 'J7_09_entrance_b'], False),
    ('09 -> 10', ['J8_09_exit_a', 'J8_09_exit_b'], ['J8_10_entrance_a', 'J8_10_entrance_b'], False),
]


def lab(a):
    a = a / 255.0
    a = np.where(a > 0.04045, ((a + 0.055) / 1.055) ** 2.4, a / 12.92)
    xyz = a @ np.array([[0.4124, 0.2126, 0.0193], [0.3576, 0.7152, 0.1192], [0.1805, 0.0722, 0.9505]])
    xyz = xyz / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def bands(name):
    im = np.asarray(Image.open(f'{cap}/{name}.png').convert('RGB'), dtype=np.float64)
    h = im.shape[0]
    L = lab(im)
    return L[int(0.12 * h):int(0.55 * h)].reshape(-1, 3).mean(0), L[int(0.60 * h):].reshape(-1, 3).mean(0)


W, H, LBL = 160, 356, 34
rows = []
sheet = Image.new('RGB', (W * 4 + 230, len(JOINS) * (H + LBL)), (24, 10, 36))
d = ImageDraw.Draw(sheet)
for r, (label, ex, en, pl) in enumerate(JOINS):
    y = r * (H + LBL)
    s0, w0 = bands(ex[-1]); s1, w1 = bands(en[0])
    dE_s, dE_w = float(np.linalg.norm(s0 - s1)), float(np.linalg.norm(w0 - w1))
    rows.append({'join': label, 'page_load_today': pl, 'colour_jump_scenery_dE': round(dE_s, 1), 'colour_jump_water_dE': round(dE_w, 1),
                 'exit_frames': ex, 'entrance_frames': en})
    frames = (ex + [None] * (2 - len(ex)))[:2] + (en + [None] * (2 - len(en)))[:2]
    for i, n in enumerate(frames):
        x = 230 + i * W
        if n:
            sheet.paste(Image.open(f'{cap}/{n}.png').convert('RGB').resize((W, H)), (x, y + LBL))
        d.text((x + 3, y + 4), ('EXIT' if i < 2 else 'ENTRANCE') + (f'  {n.split("_", 1)[1]}' if n else ''), fill=(255, 255, 255))
    d.line([(230 + 2 * W - 1, y + LBL), (230 + 2 * W - 1, y + LBL + H)], fill=(255, 230, 80), width=3)
    d.text((8, y + 40), label, fill=(255, 230, 120))
    d.text((8, y + 70), ('PAGE LOAD today (hard cut)' if pl else 'same scene today'), fill=(255, 120, 120) if pl else (140, 230, 140))
    d.text((8, y + 100), f'colour jump scenery dE {dE_s:.1f}', fill=(230, 230, 230))
    d.text((8, y + 120), f'colour jump water   dE {dE_w:.1f}', fill=(230, 230, 230))
sheet.save(out_jpg, quality=86)
json.dump({'joins': rows, 'note': 'dE = CIE76 difference of the mean Lab colour across the join (last exit frame vs first entrance frame); '
           'about 2 is barely visible, above 10 is an obvious change'}, open(out_json, 'w'), indent=1)
for row in rows:
    print(f"{row['join']:24s} page load {str(row['page_load_today']):5s}  scenery dE {row['colour_jump_scenery_dE']:5.1f}  water dE {row['colour_jump_water_dE']:5.1f}")
