# APPROVED | frame 0 side by side (approved scaled to height 915 and centre-cropped to 412 wide, as the lead's visual_check.py does):
# full frame and the coin region enlarged 2x, with a y grid every 50 px.
# usage: python3 -I compare_frame0.py <frame0.png> <approved.png> <out_dir>
import sys, os
from PIL import Image, ImageDraw
f0, ref, out = sys.argv[1:4]
A0 = Image.open(ref).convert('RGB'); w = round(A0.width * 915 / A0.height); A = A0.resize((w, 915), Image.LANCZOS).crop(((w - 412) // 2, 0, (w - 412) // 2 + 412, 915))
B = Image.open(f0).convert('RGB').resize((412, 915))
def grid(im, step=50):
    im = im.copy(); d = ImageDraw.Draw(im)
    for y in range(0, im.height, step): d.line([(0, y), (im.width, y)], fill=(255, 255, 255), width=1); d.text((2, y + 1), str(y), fill=(255, 255, 255))
    return im
def pair(a, b, label_a='APPROVED', label_b='FRAME 0 (merged)'):
    im = Image.new('RGB', (a.width * 2 + 6, a.height + 22), (20, 20, 20)); im.paste(a, (0, 22)); im.paste(b, (a.width + 6, 22))
    d = ImageDraw.Draw(im); d.text((4, 4), label_a, fill=(255, 255, 255)); d.text((a.width + 10, 4), label_b, fill=(255, 255, 255)); return im
os.makedirs(out, exist_ok=True)
pair(grid(A), grid(B)).save(os.path.join(out, 'approved_vs_frame0_full.png'))
box = (90, 270, 330, 480)  # coin trail region at 412x915
ca, cb = A.crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2), Image.LANCZOS), B.crop(box).resize(((box[2] - box[0]) * 2, (box[3] - box[1]) * 2), Image.LANCZOS)
pair(ca, cb, 'APPROVED coins (x2)', 'FRAME 0 coins (x2)').save(os.path.join(out, 'approved_vs_frame0_coins.png'))
bb = (40, 400, 372, 860)  # Benny + water line region
pair(grid(A).crop(bb), grid(B).crop(bb), 'APPROVED Benny', 'FRAME 0 Benny').save(os.path.join(out, 'approved_vs_frame0_benny.png'))
print('written', out)
