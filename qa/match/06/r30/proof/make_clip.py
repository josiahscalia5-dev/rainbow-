"""r30 lead: label the uninterrupted NEW gameplay clip (frames from tools/match06/r30_clip.mjs) and encode 1.0x + 0.5x mp4, plus
STORYBOARD_vs_GAMEPLAY.jpg (the user's 4 storyboard panels above the real-gameplay frames at those route moments).
usage: python3 -I make_clip.py <framesDir> <outDir> <s07> <f1,f2,f3,f4>   (frame indices for the storyboard panels)"""
import json, sys, os, subprocess
from PIL import Image, ImageDraw, ImageFont
FR, OUT, S07 = sys.argv[1], sys.argv[2], float(sys.argv[3])
PICK = [int(x) for x in sys.argv[4].split(',')]
meta = json.load(open(f'{FR}/frames.json'))['log']
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
f1, f2 = ImageFont.truetype(FB, 22), ImageFont.truetype(FB, 19)
def part(s):
    if s >= S07: return 'SCREEN 07 - Dive the Washer Tube', (120, 230, 255)
    if s < 234: return '0  opening crest (approved view kept)', (255, 255, 255)
    if s < 262: return '1  curl right + descend', (255, 220, 140)
    if s < 300: return '2  beneath the gold bands', (255, 200, 90)
    if s < S07 - 24: return '3  gentle S-bend', (255, 160, 230)
    return '4  into Screen 07 (its gold-collared mouth)', (160, 255, 200)
lab = f'{OUT}/_lab'; os.makedirs(lab, exist_ok=True)
for m in ([] if os.environ.get('SHEET_ONLY') else meta):
    im = Image.open(f"{FR}/{m['i']:04d}.png").convert('RGB').resize((540, 960), Image.LANCZOS)
    c = Image.new('RGB', (540, 1024), (20, 12, 34)); c.paste(im, (0, 64)); d = ImageDraw.Draw(c)
    t, col = part(m['s'])
    d.text((10, 6), 'SCREEN 06 NEW &m06curl=1 - real gameplay, no cuts', font=f2, fill='white')
    d.text((10, 34), f"{t}", font=f1, fill=col); d.text((430, 34), f"t {m['t']:5.2f}s", font=f2, fill=(200, 200, 230))
    c.save(f"{lab}/{m['i']:04d}.png")
for spd, pts in (() if os.environ.get('SHEET_ONLY') else (('1x', '1.0'), ('0.5x', '2.0'))):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{lab}/%04d.png', '-vf', f'setpts={pts}*PTS', '-r', '24',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', f'{OUT}/SCREEN06_NEW_route_into_07_{spd}.mp4'], check=True)
# storyboard panels vs gameplay
SB = Image.open('/home/user/rainbow-/docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png').convert('RGB')
boxes = [(16, 100, 506, 724), (520, 100, 1010, 724), (16, 790, 506, 1398), (520, 790, 1010, 1398)]
names = ['1 curl right over the crest', '2 descend through the gold band', '3 follow the winding slide', '4 connect into Screen 07']
ph, gh = 560, 960; pw = int(490 * ph / 624); gw = 540; g = 18
W = g + 4 * (max(pw, gw) + g); out = Image.new('RGB', (W, 90 + ph + 50 + gh + 60), (20, 12, 34)); d = ImageDraw.Draw(out)
ft = ImageFont.truetype(FB, 34)
d.text((g, 22), 'Your storyboard (top) vs the SAME moments in real gameplay of the new route (bottom)', font=ft, fill='white')
for k in range(4):
    x = g + k * (max(pw, gw) + g)
    out.paste(SB.crop(boxes[k]).resize((pw, ph), Image.LANCZOS), (x + (max(pw, gw) - pw) // 2, 90))
    d.text((x, 90 + ph + 10), 'STORYBOARD ' + names[k], font=f2, fill=(255, 220, 140))
    m = meta[PICK[k]]
    out.paste(Image.open(f"{FR}/{m['i']:04d}.png").convert('RGB').resize((gw, gh), Image.LANCZOS), (x + (max(pw, gw) - gw) // 2, 90 + ph + 50))
    d.text((x, 90 + ph + 50 + gh + 12), f"GAMEPLAY t {m['t']:.1f} s, river s {m['s']:.0f}", font=f1, fill='white')
out.save(f'{OUT}/STORYBOARD_vs_GAMEPLAY.jpg', quality=90)
print('done', len(meta), 'frames')
