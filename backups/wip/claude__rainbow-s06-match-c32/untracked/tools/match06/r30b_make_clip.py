"""r30b lead: label the ONE uninterrupted real-gameplay clip (tools/match06/r30_clip.mjs frames: 1/24 s of the real simulation each, no cuts)
and encode it at normal speed (1.0x) and half speed (0.5x); plus HANDOFF_06_to_07.jpg = the frames around the actual 06 -> 07 entrance.
usage: python3 -I r30b_make_clip.py <framesDir> <outDir> <s07> <query-name>"""
import json, sys, os, subprocess
from PIL import Image, ImageDraw, ImageFont
FR, OUT, S07, QN = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
meta = json.load(open(f'{FR}/frames.json'))['log']
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f1, f2 = ImageFont.truetype(FB, 22), ImageFont.truetype(FB, 18)
def part(s):
    if s >= S07: return 'SCREEN 07 - actual entry (Dive the Washer Tube)', (120, 230, 255)
    if s < 219: return 'approved start view -> onto the crest', (255, 255, 255)
    if s < 236: return '1  curl right over the crest', (255, 220, 140)
    if s < 276: return '2  descend through the gold band', (255, 200, 90)
    if s < 318: return '3  follow the winding slide', (255, 160, 230)
    return '4  connect into Screen 07', (160, 255, 200)
lab = f'{OUT}/_lab'; os.makedirs(lab, exist_ok=True)
for m in meta:
    im = Image.open(f"{FR}/{m['i']:04d}.png").convert('RGB').resize((540, 960), Image.LANCZOS)
    c = Image.new('RGB', (540, 1024), (20, 12, 34)); c.paste(im, (0, 64)); d = ImageDraw.Draw(c)
    t, col = part(m['s'])
    d.text((10, 6), 'Screen 06 r30b - real gameplay, no cuts', font=f2, fill='white'); d.text((440, 6), f"t {m['t']:5.2f}s", font=f2, fill=(200, 200, 230))
    d.text((10, 34), t, font=f2 if len(t) > 40 else f1, fill=col)
    c.save(f"{lab}/{m['i']:04d}.png")
for spd, pts in (('1x', '1.0'), ('0.5x', '2.0')):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{lab}/%04d.png', '-vf', f'setpts={pts}*PTS', '-r', '24',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', f'{OUT}/SCREEN06_r30b_into_07_{spd}.mp4'], check=True)
# the actual hand-over: frames ~1 s and ~0.25 s before the 07 entrance, and ~0.25 s / ~1 s after it
iE = next(i for i, m in enumerate(meta) if m['s'] >= S07)
pick = [max(0, iE - 24), max(0, iE - 6), min(len(meta) - 1, iE + 6), min(len(meta) - 1, iE + 24)]
W = 4 * 540 + 5 * 16; sheet = Image.new('RGB', (W, 1024 + 70), (20, 12, 34)); d = ImageDraw.Draw(sheet)
for k, i in enumerate(pick):
    sheet.paste(Image.open(f"{lab}/{meta[i]['i']:04d}.png"), (16 + k * 556, 60))
d.text((16, 14), f'The actual 06 -> 07 hand-over in the same uninterrupted clip (07 entrance at river s {S07:.1f}); HUD title switches to 07', font=ImageFont.truetype(FB, 26), fill='white')
sheet.save(f'{OUT}/HANDOFF_06_to_07.jpg', quality=90)
json.dump({'frames': len(meta), 'seconds': round(len(meta) / 24, 2), 's07': S07, 'handoff_frames': [meta[i] for i in pick]}, open(f'{OUT}/clip_info.json', 'w'), indent=1)
print('done', len(meta), 'frames', round(len(meta) / 24, 2), 's')
