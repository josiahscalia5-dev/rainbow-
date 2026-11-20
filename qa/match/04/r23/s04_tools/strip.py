# r23 s04 QA helper: side-by-side crops (x0,y0,x1,y1) of the same shot from several folders -> one strip (for my own eyes only)
import sys
from PIL import Image, ImageDraw
out, shot, box = sys.argv[1], sys.argv[2], tuple(int(v) for v in sys.argv[3].split(','))
dirs = sys.argv[4:]
ims = []
for d in dirs:
    p = d if d.endswith('.png') else f'{d}/{shot}.png'
    ims.append(Image.open(p).convert('RGB').crop(box))
w, h = ims[0].size
W = Image.new('RGB', (len(ims) * (w + 8), h + 22), 'white')
dr = ImageDraw.Draw(W)
for i, (im, d) in enumerate(zip(ims, dirs)):
    W.paste(im, (i * (w + 8), 22)); dr.text((i * (w + 8) + 4, 4), d.rstrip('/').split('/')[-1][:40], fill='black')
W.save(out)
