"""Round-5 variant review set (separate full-size files, no collages).
usage: python3 -I review08.py <outdir> <label> <capture_dir_with_08.png_and_m/>  (label e.g. 2_r2)
       python3 -I review08.py <outdir> 1_APPROVED
close-up crop = closeup_APPROVED.png's crop (x 250-610, y 845-1225, 3x)."""
import sys, shutil
from PIL import Image
OUT, LAB = sys.argv[1], sys.argv[2]
REF = 'references/08_final_spin_chamber.png'
BOX = (250, 845, 610, 1225)
src = REF if LAB.startswith('1_') else f'{sys.argv[3]}/08.png'
shutil.copyfile(src, f'{OUT}/{LAB}_08_approved_view.png')
im = Image.open(src).convert('RGB').crop(BOX)
im.resize((im.width * 3, im.height * 3), Image.LANCZOS).save(f'{OUT}/{LAB}_closeup.png')
if not LAB.startswith('1_'):
    for k, f in [('move_forward', 'f06_forward6u'), ('move_steer_left', 's_left_steer'), ('move_steer_right', 's_right_steer')]:
        shutil.copyfile(f'{sys.argv[3]}/m/{f}.png', f'{OUT}/{LAB}_{k}.png')
print(LAB, 'written')
