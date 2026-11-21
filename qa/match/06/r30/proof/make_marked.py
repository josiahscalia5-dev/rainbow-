"""r30 lead: APPROVED | BEFORE (the version the user marked) | NEW (&m06curl=1) at the user's red-marked spot (river s 214.86),
full-size 864x1536 gameplay frames, labelled. usage: python3 -I proof/make_marked.py (from qa/match/06/r30)"""
from PIL import Image, ImageDraw, ImageFont
R = '/home/user/rainbow-/'
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FN = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
ft, fh, fs = ImageFont.truetype(FB, 40), ImageFont.truetype(FB, 30), ImageFont.truetype(FN, 25)
ims = [(R + 'references/06_crest_the_rinse_arch.png', 'YOUR APPROVED 06', 'reference'),
       ('stills_BEFORE/b_marked.png', 'BEFORE - what you marked', 'one straight tube: rings nest into a target'),
       ('stills_NEW/b_marked.png', 'NEW - same spot, real gameplay', 'tunnel curls right: 3 broad bands, purple between')]
w, h, g = 864, 1536, 24
out = Image.new('RGB', (g + 3 * (w + g), 110 + h + 110), (20, 12, 34)); d = ImageDraw.Draw(out)
d.text((g, 30), "Screen 06 at your red mark (river distance 214.9 - identical spot in BEFORE and NEW)", font=ft, fill='white')
for i, (p, a, b) in enumerate(ims):
    x = g + i * (w + g); out.paste(Image.open(p).convert('RGB').resize((w, h)), (x, 110))
    d.text((x, 110 + h + 14), a, font=fh, fill='white'); d.text((x, 110 + h + 56), b, font=fs, fill=(255, 220, 140))
out.save('proof/MARKED_SPOT_approved_before_new.jpg', quality=90); print(out.size)
