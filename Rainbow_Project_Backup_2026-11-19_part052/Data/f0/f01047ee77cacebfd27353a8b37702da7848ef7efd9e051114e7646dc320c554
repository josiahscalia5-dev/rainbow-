"""Create an Android PDF with one whole native frame per page and two labeled detail pages."""
import argparse
from io import BytesIO
from pathlib import Path
from PIL import Image
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.utils import ImageReader
import fitz

parser=argparse.ArgumentParser()
parser.add_argument('screen',choices=['06','07'])
for arg in ['approved','before','new','destination']:parser.add_argument(arg,type=Path)
parser.add_argument('--status',required=True,choices=['CANDIDATE','REJECTED'])
args=parser.parse_args()
cfg={
 '06':('Crest the Rinse Arch','Benny rises over the crest at +1.1 units.',(427,390,864,650),'Right-hand wall where the gold rings cross the crest.'),
 '07':('Dive the Washer Tube','Benny approaches the bottom of the plunge.',(16,495,752,1050),'River and foam at the mouth of the plunge.')
}
title,view,crop,detail=cfg[args.screen]
cv=Canvas(str(args.destination),pageCompression=1,invariant=1)
cv.setTitle('Rainbow '+args.screen+' | '+title)
cv.setAuthor('Rainbow visual review')
pageWidth=504
def page(pic,caption,text,detailCrop=False):
    with Image.open(pic) as im:
        assert im.size==(864,1536)
        if detailCrop:
            im=im.crop(crop)
        width,height=im.size
        drawHeight=pageWidth*height/width
        if pic==args.approved and im.format=='JPEG':
            source=ImageReader(str(pic))
        else:
            buf=BytesIO();im.convert('RGB').save(buf,'JPEG',quality=91,subsampling=0,optimize=True)
            buf.seek(0);source=ImageReader(buf)
        cv.setPageSize((pageWidth,drawHeight+56))
        cv.setFillColorRGB(.12,.07,.18);cv.rect(0,drawHeight,pageWidth,56,fill=1,stroke=0)
        cv.setFillColorRGB(1,1,1);cv.setFont('Helvetica-Bold',14);cv.drawString(14,drawHeight+33,'Screen '+args.screen+' | '+caption)
        cv.setFont('Helvetica',9);cv.drawString(14,drawHeight+15,text)
        cv.drawImage(source,0,0,width=pageWidth,height=drawHeight)
        cv.showPage()
page(args.approved,'APPROVED',title+' | Original artwork at its opening viewpoint.')
page(args.before,'CLAUDIA BEFORE',view+' Retained playable game.')
page(args.new,'CODEX NEW | '+args.status,view+' Isolated visual experiment.')
page(args.before,'CLAUDIA BEFORE | detail',detail,True)
page(args.new,'CODEX NEW | detail',detail,True)
cv.save()
with fitz.open(args.destination) as doc:
    assert len(doc)==5
    for i,p in enumerate(doc):
        entries=p.get_images()
        assert len(entries)==1 and p.get_text().strip()
        if i<3: assert entries[0][2:4]==(864,1536)
        p.get_pixmap(matrix=fitz.Matrix(.2,.2))
print(args.destination.name,args.destination.stat().st_size,'bytes, 5 pages with 3 native whole images.')
