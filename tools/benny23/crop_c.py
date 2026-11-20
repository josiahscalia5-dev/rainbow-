"""Benny-centred close-up: crop a square-ish box around Benny's projected screen box (bbox from shots.json, the bounding box is loose (fur shells, hat), so 0.92 of it),
same 450x540 aspect as tools/benny20/crop.py, resized to 675x810 so it sits next to qa/benny/r22/approved/0N_benny.png.
usage: python3 -I tools/benny23/crop_c.py <shotDir>   (writes <name>_crop.png for every shot in shots.json)"""
import sys, json
from PIL import Image
d = sys.argv[1]
for s in json.load(open(f'{d}/shots.json')):
    im = Image.open(f"{d}/{s['name']}.png").convert('RGB')
    b = s.get('box')
    if not isinstance(b, list):
        b = [170, 900, 620, 1440]
    cx, cy = (b[0] + b[2]) / 2, (b[1] + b[3]) / 2
    h = max((b[3] - b[1]) * 0.92, (b[2] - b[0]) * 0.92 * 540 / 450, 200)
    w = h * 450 / 540
    x0, y0 = max(0, cx - w / 2), max(0, cy - h / 2)
    x0, y0 = min(x0, im.width - w), min(y0, im.height - h)
    im.crop((round(x0), round(y0), round(x0 + w), round(y0 + h))).resize((675, 810), Image.LANCZOS).save(f"{d}/{s['name']}_crop.png")
