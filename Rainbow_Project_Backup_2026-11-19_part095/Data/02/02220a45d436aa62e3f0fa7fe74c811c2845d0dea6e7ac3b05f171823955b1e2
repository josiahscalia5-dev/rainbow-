from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
import fitz,os,hashlib,shutil
from PIL import Image
root=Path('repo/experiments/codex/s06-benny-layered-coat')
cv=Canvas(str(root/'Benny_on_your_phone.pdf'),invariant=1,pageCompression=1)
cv.setTitle('Benny | Original fur and the playable Screen 06 coat')
roles=[('character/APPROVED.png','YOUR ORIGINAL BENNY','Inspect the overlapping pink tufts and soft shade where the fur meets the water.'),
       ('character/CLAUDIA_BEFORE.png','CLAUDIA BEFORE','Retained gameplay. Same camera, pose and native crop.'),
       ('character/CODEX_NEW.png','CODEX NEW | CANDIDATE','The proposed body coat. Hat, pom-pom, hands and body scale are retained.'),
       ('character/CLAUDIA_BEFORE-hard-right.png','CLAUDIA BEFORE | TURNING RIGHT','Matched crop while Benny swims through Screen 06.'),
       ('character/CODEX_NEW-hard-right.png','CODEX NEW | TURNING RIGHT','Look at the tufts on the exposed side of his back.'),
       ('APPROVED.jpg','YOUR ORIGINAL SCREEN 06','Exact original artwork, full frame.'),
       ('CLAUDIA_BEFORE/opening.png','CLAUDIA BEFORE | FULL FRAME','Retained opening at 864 by 1536.'),
       ('CODEX_NEW/opening.png','CODEX NEW | FULL FRAME','Candidate at the same camera, pose and clock.')]
for fn,title,cap in roles:
 with Image.open(root/fn) as im: w,h=im.size
 width=432; height=width*h/w
 cv.setPageSize((width,height+43));cv.setFillColorRGB(.12,.07,.16);cv.rect(0,height,width,43,fill=1,stroke=0)
 cv.setFillColorRGB(1,1,1);cv.setFont('Helvetica-Bold',12);cv.drawString(12,height+26,title)
 cv.setFont('Helvetica',8);cv.drawString(12,height+10,cap)
 cv.drawImage(ImageReader(str(root/fn)),0,0,width=width,height=height);cv.showPage()
cv.save()
with fitz.open(root/'Benny_on_your_phone.pdf') as pdf: assert len(pdf)==len(roles)
dest=Path('/workspace/shared/downloads/Rainbow_Benny_Original_Before_After.pdf')
if not dest.exists():shutil.copyfile(root/'Benny_on_your_phone.pdf',dest)
assert hashlib.sha256(dest.read_bytes()).digest()==hashlib.sha256((root/'Benny_on_your_phone.pdf').read_bytes()).digest()
print(len(roles),dest.stat().st_size)
p=root/'PHONE_REVIEW.md';p.write_text(p.read_text().replace('[View the phone PDF](Review_on_Android.pdf)','[Open the short Benny comparison](Benny_on_your_phone.pdf) · [View every stage position](Review_on_Android.pdf)'))
