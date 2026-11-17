"""Write the separate full-size comparison pictures + 3x Benny close-ups (no grids / collages).
usage: python3 -I pictures08.py <current_864.png> <new_864.png> [<current_1080x1920.png> <new_1080x1920.png>]
-> qa/match/08/benny08/{APPROVED_08,CURRENT_08,NEW_08}.png (864x1536, the approved picture's own size, pixel-comparable),
   {CURRENT,NEW}_08_1080x1920.png (phone-size renders), closeup_{APPROVED,CURRENT,NEW}.png (x 250-610, y 845-1225, 3x)"""
import sys, shutil
from PIL import Image
OUT = 'qa/match/08/benny08'
REF = 'references/08_final_spin_chamber.png'
BOX = (250, 845, 610, 1225)
shutil.copyfile(REF, f'{OUT}/APPROVED_08.png')  # byte copy, the reference itself is never touched
shutil.copyfile(sys.argv[1], f'{OUT}/CURRENT_08.png')
shutil.copyfile(sys.argv[2], f'{OUT}/NEW_08.png')
if len(sys.argv) > 4:
    shutil.copyfile(sys.argv[3], f'{OUT}/CURRENT_08_1080x1920.png')
    shutil.copyfile(sys.argv[4], f'{OUT}/NEW_08_1080x1920.png')
for lab, p in [('APPROVED', REF), ('CURRENT', sys.argv[1]), ('NEW', sys.argv[2])]:
    im = Image.open(p).convert('RGB').crop(BOX)
    im.resize((im.width * 3, im.height * 3), Image.LANCZOS).save(f'{OUT}/closeup_{lab}.png')
print('written')
