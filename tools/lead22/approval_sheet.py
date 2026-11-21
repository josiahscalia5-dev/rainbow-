"""Lead r22: labelled approval sheet ORIGINAL APPROVED (unchanged) | GAME NOW - <where> | GENERATED PROPOSAL (not yet approved).
Same layout as the round-21 FOR_APPROVAL_04_* sheets. The original is only read, never written.
usage: python3 -I tools/lead22/approval_sheet.py <original.png> <game_frame.png> <proposal.png> "<where>" <out.png>"""
import sys
from PIL import Image, ImageDraw, ImageFont
orig, game, prop, where, out = sys.argv[1:6]
H = 1536; BAR = 60; GAP = 20
def load(p):
    im = Image.open(p).convert("RGB"); return im.resize((round(im.width * H / im.height), H), Image.LANCZOS)
ims = [load(orig), load(game), load(prop)]
labels = [("ORIGINAL APPROVED (unchanged)", (255, 255, 255)), (f"GAME NOW - {where}", (190, 205, 255)),
          ("GENERATED PROPOSAL (not yet approved)", (255, 225, 120))]
W = sum(i.width for i in ims) + GAP * (len(ims) - 1)
sheet = Image.new("RGB", (W, H + BAR), (22, 16, 34)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
except OSError: font = ImageFont.load_default()
x = 0
for im, (t, c) in zip(ims, labels):
    sheet.paste(im, (x, BAR)); d.text((x + 12, 14), t, fill=c, font=font); x += im.width + GAP
sheet.save(out); print(out, sheet.size)
