import sys
from PIL import Image, ImageDraw, ImageFont
# usage: triptych.py out.png h label1=path1 label2=path2 ...
out, H = sys.argv[1], int(sys.argv[2])
items = [a.split('=',1) for a in sys.argv[3:]]
ims = []
for lab, p in items:
    im = Image.open(p).convert('RGB')
    w = round(im.width * H / im.height)
    ims.append((lab, im.resize((w, H), Image.LANCZOS)))
pad, top = 8, 34
W = sum(i.width for _, i in ims) + pad * (len(ims) + 1)
canvas = Image.new('RGB', (W, H + top + pad), (24, 18, 32))
d = ImageDraw.Draw(canvas)
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception: f = ImageFont.load_default()
x = pad
for lab, im in ims:
    canvas.paste(im, (x, top)); d.text((x + 6, 7), lab, fill=(255, 255, 255), font=f); x += im.width + pad
canvas.save(out)
print(out, canvas.size)
