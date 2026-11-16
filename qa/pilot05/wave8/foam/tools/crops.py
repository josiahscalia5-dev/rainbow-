"""wave 8 foam crops: ref | baseline | NOW for the foam/splash regions. Usage: python3 -I crops.py NOW.png OUTDIR"""
import sys
from PIL import Image
now, out = sys.argv[1], sys.argv[2]
R = Image.open('references/05_flow_into_the_current.png').convert('RGB')
B = Image.open('qa/pilot05/wave8/baseline/05.png').convert('RGB')
N = Image.open(now).convert('RGB')
BOX = {'leftrim': (0, 560, 330, 840, 2), 'rightrim': (560, 560, 864, 980, 2), 'leftnear': (0, 960, 260, 1360, 2),
       'rightnear': (600, 1050, 864, 1380, 2), 'splash': (220, 1060, 650, 1300, 2)}
for nm, (x0, y0, x1, y1, s) in BOX.items():
    w, h = x1 - x0, y1 - y0
    o = Image.new('RGB', (3 * w + 8, h), 'black')
    for i, im in enumerate((R, B, N)):
        o.paste(im.crop((x0, y0, x1, y1)), (i * (w + 4), 0))
    o = o.resize((o.width * s // 2 * 2 // 2, o.height * s // 2 * 2 // 2), Image.LANCZOS) if s != 2 else o.resize((int(o.width * 1.4), int(o.height * 1.4)), Image.LANCZOS)
    o.save(f'{out}/crop_{nm}.png')
