"""sheets.py <before dir> <after dir> <out dir> s1 s2 ... : APPROVED | BEFORE | AFTER side by side per position (540x960 each)."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
b, a, o = sys.argv[1:4]; os.makedirs(o, exist_ok=True)
ref = Image.open('/home/user/rainbow-/references/05_flow_into_the_current.png').convert('RGB').resize((540, 960), Image.LANCZOS)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except Exception: font = ImageFont.load_default()
for s in sys.argv[4:]:
    ims = [ref, Image.open(f'{b}/s_{s}.png').convert('RGB'), Image.open(f'{a}/s_{s}.png').convert('RGB')]
    sheet = Image.new('RGB', (540 * 3 + 40, 1010), (24, 16, 34)); d = ImageDraw.Draw(sheet)
    for i, (im, lab) in enumerate(zip(ims, ['APPROVED', f'BEFORE  s={s}', f'AFTER  s={s}'])):
        sheet.paste(im, (10 + i * 550, 45)); d.text((10 + i * 550, 8), lab, fill=(255, 230, 150), font=font)
    sheet.save(f'{o}/sheet_s{s}.jpg', quality=90); print('sheet', s)
