"""r30b lead: label the uninterrupted zig-zag steering clip (tools/match06/r30_clip.mjs with STEER=zigzag) with Benny's lateral position and the
live coin counter, and encode it at normal speed. usage: python3 -I r30b_make_steer.py <framesDir> <outDir> <s07>"""
import json, sys, os, subprocess
from PIL import Image, ImageDraw, ImageFont
FR, OUT, S07 = sys.argv[1], sys.argv[2], float(sys.argv[3])
meta = json.load(open(f'{FR}/frames.json'))['log']
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f1, f2 = ImageFont.truetype(FB, 20), ImageFont.truetype(FB, 16)
lab = f'{OUT}/_steer'; os.makedirs(lab, exist_ok=True)
c0 = meta[0].get('coins', 0); lats = [m.get('lat', 0) for m in meta]
for m in meta:
    im = Image.open(f"{FR}/{m['i']:04d}.png").convert('RGB').resize((432, 768), Image.LANCZOS)
    c = Image.new('RGB', (432, 868), (20, 12, 34)); c.paste(im, (0, 100)); d = ImageDraw.Draw(c)
    d.text((8, 6), 'STEERING TEST - real gameplay, no cuts', font=f1, fill='white')
    d.text((8, 34), f"{'SCREEN 07' if m['s'] >= S07 else 'SCREEN 06'}   t {m['t']:5.2f}s   lateral {m.get('lat', 0):+.2f}", font=f2, fill=(255, 220, 140))
    d.text((8, 58), f"coins picked up so far: +{(m.get('coins', c0) - c0)}", font=f2, fill=(140, 255, 190))
    # lateral position bar
    x = 216 + int(180 * max(-1.0, min(1.0, m.get('lat', 0) / 2.6))); d.rectangle((36, 84, 396, 90), fill=(70, 50, 100)); d.ellipse((x - 7, 80, x + 7, 94), fill=(255, 120, 200))
    c.save(f"{lab}/{m['i']:04d}.png")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{lab}/%04d.png', '-r', '24', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                '-crf', '22', f'{OUT}/STEER_zigzag_06_1x.mp4'], check=True)
info = {'frames': len(meta), 'seconds': round(len(meta) / 24, 2), 'lat_min': min(lats), 'lat_max': max(lats), 'coins_gained': meta[-1].get('coins', c0) - c0,
        'stages': sorted({m.get('stage') for m in meta})}
json.dump(info, open(f'{OUT}/steer_info.json', 'w'), indent=1); print(info)
