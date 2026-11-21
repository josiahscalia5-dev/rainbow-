"""sheets.py <out dir> <label> <before png> <after png> [<label> <before> <after> ...]:
APPROVED | BEFORE | AFTER side by side, each scaled to 960 px high keeping its own aspect (no stretching)."""
import sys, os
from PIL import Image, ImageDraw, ImageFont
o = sys.argv[1]; os.makedirs(o, exist_ok=True)
H = 960
def fit(im): return im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
ref = fit(Image.open('/home/user/rainbow-/references/05_flow_into_the_current.png').convert('RGB'))
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
except Exception: font = ImageFont.load_default()
args = sys.argv[2:]
for k in range(0, len(args), 3):
    lab, b, a = args[k:k + 3]
    ims = [ref, fit(Image.open(b).convert('RGB')), fit(Image.open(a).convert('RGB'))]
    Wt = sum(im.width for im in ims) + 10 * 4
    sheet = Image.new('RGB', (Wt, H + 55), (24, 16, 34)); d = ImageDraw.Draw(sheet); x = 10
    for im, l in zip(ims, ['APPROVED', f'BEFORE  {lab}', f'AFTER  {lab}']):
        sheet.paste(im, (x, 45)); d.text((x, 8), l, fill=(255, 230, 150), font=font); x += im.width + 10
    sheet.save(f'{o}/sheet_{lab}.jpg', quality=90); print('sheet', lab)
