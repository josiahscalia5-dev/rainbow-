"""Benny close-up crop (lead's box x 170-620, y 900-1440 of the 864x1536 frame, scaled 1.5x).
usage: python3 -I tools/benny20/crop.py <in.png> <out.png> [x0 y0 x1 y1]"""
import sys
from PIL import Image
a = sys.argv[1:]
box = tuple(int(v) for v in a[2:6]) if len(a) >= 6 else (170, 900, 620, 1440)
im = Image.open(a[0]).convert('RGB').crop(box)
im = im.resize((round(im.width * 1.5), round(im.height * 1.5)), Image.LANCZOS)
im.save(a[1])
