# QA contact sheet (scratch only, never a deliverable): python3 -I sheet08.py <out.png> <w> <dir1> <dir2> ... -- <frame names>
import sys
from PIL import Image
a = sys.argv[1:]; out, w = a[0], int(a[1]); k = a.index('--'); dirs, names = a[2:k], a[k + 1:]
h = int(w * 1536 / 864)
S = Image.new('RGB', (w * len(names), h * len(dirs)))
for r, d in enumerate(dirs):
    for c, n in enumerate(names):
        S.paste(Image.open(f'{d}/{n}.png').convert('RGB').resize((w, h)), (c * w, r * h))
S.save(out)
