"""r30 lead: Screen 06 'gold target' diagnosis sheet from the real-gameplay probe (tools/match06/r30_ring_probe.mjs).
usage: python3 -I make_diag.py <probe.json> <out.jpg>   (run from qa/match/06/r30/diag)"""
import json, sys, math
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/rainbow-/'
P = json.load(open(sys.argv[1]))
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FN = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
f_t, f_h, f_s, f_x = (ImageFont.truetype(FB, 30), ImageFont.truetype(FB, 21), ImageFont.truetype(FN, 18), ImageFont.truetype(FB, 15))
w, h = 432, 768
def load(p): return Image.open(p).convert('RGB').resize((w, h), Image.LANCZOS)
appr = load(R + 'references/06_crest_the_rinse_arch.png')
now = load(R + 'qa/match/06/r29/rings/g_asis/p14.png')
norings = load(R + 'qa/match/06/r29/rings/g_norings/p14.png')
# 1) NOW + every measured ring ahead drawn as an outline (probe ran at 864x1536 -> x0.5)
ov = now.copy(); d = ImageDraw.Draw(ov)
sc = w / P['viewport'][0]
ahead = [g for g in P['rings'] if g['ahead'] > 0]
for i, g in enumerate(ahead):
    cx, cy = g['screenCentre'][0] * sc, g['screenCentre'][1] * sc; r = g['screenRadiusPx'] * sc
    col = (0, 255, 255) if i % 2 == 0 else (255, 60, 200)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=2 if r > 20 else 1)
    if 1 <= i <= 5: d.text((cx + r * 0.71 + 3, cy - r * 0.71 - 18), f"{g['ahead']:.0f} u", font=f_x, fill=col, stroke_width=2, stroke_fill=(0, 0, 0))
vx, vy = (v * sc for v in P['vanishingPointPx'])
d.line([vx - 9, vy, vx + 9, vy], fill=(255, 255, 0), width=2); d.line([vx, vy - 9, vx, vy + 9], fill=(255, 255, 0), width=2)
# 2) top-down schematic of the straight tunnel (drum frame: a forward, r right)
sk = Image.new('RGB', (w, h), (24, 14, 40)); s = ImageDraw.Draw(sk)
cam = P['camera']['drum']; aMax = P['tube']['aTo']; Rt = 14
X0, Y0, kx = w * 0.72, h - 60, (h - 120) / (aMax - P['tube']['aFrom'])
def pt(a, r): return (X0 + r * kx * 2.2, Y0 - (a - P['tube']['aFrom']) * kx)
s.rectangle([*pt(aMax, -Rt)[:1], pt(aMax, -Rt)[1], *pt(P['tube']['aFrom'], Rt)], outline=(170, 110, 230), width=3)
for g in P['rings']:
    x1, y = pt(g['a'], -g['radius']); x2, _ = pt(g['a'], g['radius'])
    s.line([x1, y, x2, y], fill=(255, 190, 60), width=3)
cx, cy = pt(cam[0], cam[1])
half = math.radians(P['camera']['fovDeg'] / 2 * 0.5625 * 1.0)  # horizontal half-fov (portrait 9:16)
L = 260
ang = math.radians(P['camera']['angleToAxisDeg'])
for sgn in (-1, 1):
    a = ang * (1 if cam[1] < 0 else -1) + sgn * half
    s.line([cx, cy, cx + math.sin(a) * L * 0.25, cy - math.cos(a) * L], fill=(0, 255, 255), width=2)
s.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=(255, 80, 200))
s.text((cx + 12, cy - 6), 'camera', font=f_x, fill=(255, 120, 220))
s.text((12, 12), 'TOP VIEW (real game geometry)', font=f_h, fill='white')
s.text((12, 40), f"straight tube {aMax - P['tube']['aFrom']:.0f} u long,", font=f_s, fill=(220, 220, 255))
s.text((12, 62), f"radius {Rt} u; {len(P['rings'])} gold rings,", font=f_s, fill=(220, 220, 255))
s.text((12, 84), f"one every {ahead[1]['a'] - ahead[0]['a']:.1f} u", font=f_s, fill=(255, 200, 90))
s.text((12, h - 46), '(width drawn 2.2x for legibility)', font=f_x, fill=(150, 150, 190))
panels = [(appr, 'YOUR APPROVED 06'), (ov, 'NOW at your mark: rings measured'), (norings, 'TEST: 3D rings hidden'), (sk, 'WHY: one straight tube')]
gap, top, bot = 14, 70, 330
W = gap + len(panels) * (w + gap); H = top + h + bot
out = Image.new('RGB', (W, H), (20, 12, 34)); D = ImageDraw.Draw(out)
D.text((gap, 18), "Screen 06 at your red mark (14 % of the stage): what draws the gold 'target'", font=f_t, fill='white')
for i, (im, lab) in enumerate(panels):
    x = gap + i * (w + gap); out.paste(im, (x, top)); D.text((x, top + h + 8), lab, font=f_h, fill='white')
cn = len([g for g in ahead if g['screenRadiusPx'] < 520 and g['ahead'] > 30])
lines = [
    f"1. MESH m06_rings (modeled gold rings, m06ring): {len(P['rings'])} rings, every {ahead[1]['a'] - ahead[0]['a']:.2f} u, radius 13.6 u, 2.2 u wide, out to {ahead[-1]['ahead']:.0f} u ahead. The spacing was solved from the",
    "   approved picture's two nearest painted rings, then simply REPEATED down the whole tube. The far tube also narrows (radius 13.6 -> 3.1 u), squeezing the far rings tighter.",
    f"2. ALIGNMENT: the tube is perfectly STRAIGHT ({aMax - P['tube']['aFrom']:.0f} u). At your mark the camera is INSIDE it, {math.hypot(cam[1], cam[2]):.1f} u off its centre line, looking {P['camera']['angleToAxisDeg']:.0f} deg off its axis.",
    f"   So {cn} rings 30-{ahead[-1]['ahead']:.0f} u ahead project as nested circles whose centres sit within ~{int(max(abs(g['screenCentre'][0]-ahead[2]['screenCentre'][0]) for g in ahead[2:])/1)} px of each other = a bullseye.",
    "3. TEXTURE tile_tube.png (the purple wall tile unwrapped from your painting): each 59 u of wall also carries 2-3 PAINTED gold stripes across the depth,",
    "   so with the 3D rings hidden (3rd picture) the wall still draws rings. The approved-picture projection is NOT the cause (switching it off changes nothing here).",
    "In YOUR picture the tunnel points AWAY from the camera, to the upper right: 3-4 broad bands show as partial arcs with purple machinery between them; the deep rings only fill a small off-centre hole.",
    "FIX DIRECTION (your storyboard): curve the tunnel with the river (curl right + descend, gentle S-bend) so only 2-4 bands are in view, space the bands wider, drop the painted stripes.",
]
for k, t in enumerate(lines): D.text((gap, top + h + 44 + k * 34), t, font=f_s, fill=(255, 220, 140) if t.startswith('FIX') else (230, 230, 245))
out.save(sys.argv[2], quality=92)
print('saved', sys.argv[2], out.size)
