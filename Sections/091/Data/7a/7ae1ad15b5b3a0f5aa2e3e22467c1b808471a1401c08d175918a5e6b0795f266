"""Prepare a native screen review and a phone PDF. All originals remain byte-identical."""
import argparse
import hashlib
import json
import os
import shutil
import tempfile
import zipfile
from io import BytesIO
from pathlib import Path

import fitz
from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas

def hashfile(path):
    with path.open('rb') as f: return hashlib.file_digest(f,'sha256').hexdigest()

def add_page(pdf, path, role, caption):
    with Image.open(path) as im:
        w,h=im.size
        size=504
        height=size*h/w
        pdf.setPageSize((size,height+52))
        pdf.setFillColorRGB(.12,.07,.16);pdf.rect(0,height,size,52,fill=1,stroke=0)
        pdf.setFillColorRGB(1,1,1);pdf.setFont('Helvetica-Bold',13);pdf.drawString(14,height+32,role)
        pdf.setFont('Helvetica',9);pdf.drawString(14,height+13,caption)
        if im.format=='JPEG':
            reader=ImageReader(str(path))
        else:
            buf=BytesIO();im.convert('RGB').save(buf,'JPEG',quality=90,subsampling=0);buf.seek(0);reader=ImageReader(buf)
        pdf.drawImage(reader,0,0,width=size,height=height);pdf.showPage()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    for arg in ('directory','phone'):parser.add_argument(arg,type=Path)
    parser.add_argument('mode',choices=['curve','coat']);parser.add_argument('verdict',choices=['Candidate','Rejected']);args=parser.parse_args()
    root,phone=args.directory,args.phone;phone.mkdir(parents=True,exist_ok=True)
    name='Crest_Curve' if args.mode=='curve' else 'Benny_Layered_Coat'
    title='Screen 06 crest curve' if args.mode=='curve' else 'Benny on Screen 06'
    pdf=Canvas(str(root/'Review_on_Android.pdf'),invariant=1,pageCompression=1)
    pdf.setTitle(title+' | Original, Claudia and Codex')
    add_page(pdf,root/'APPROVED.jpg','APPROVED ARTWORK','Original Screen 06 at 864 by 1536.')
    pages=1
    if args.mode=='coat':
        for f,label in [('APPROVED','Original fur'),('CLAUDIA_BEFORE','Claudia retained'),('CODEX_NEW','Codex '+args.verdict.lower())]:
            add_page(pdf,root/'character'/(f+'.png'),label.upper(),'Same native crop of the opening. Inspect the lower pink coat.');pages+=1
    captions={'opening':'Original approved camera','inlet':'Entrance from Screen 05','crest-release':'Crest release, +1.1','forward-03':'Forward +3','forward-06':'Forward +6','forward-10':'Forward +10','forward-20':'Forward +20','hard-left':'Hard-left steering','hard-right':'Hard-right steering','middle':'Middle of stage','deep':'Deep water','arch-exit':'Arch exit','last-in-stage':'Final approach','across-transition':'First view in Screen 07'}
    for fname,desc in captions.items():
        for folder,role in [('CLAUDIA_BEFORE','CLAUDIA BEFORE'),('CODEX_NEW','CODEX NEW | '+args.verdict.upper())]:
            add_page(pdf,root/folder/(fname+'.png'),role,desc+'. Real Three.js gameplay.');pages+=1
    pdf.save()
    with fitz.open(root/'Review_on_Android.pdf') as doc: assert len(doc)==pages
    names=[]
    for base in ['APPROVED.jpg','README_FIRST.md','REPORT.md','Review_on_Android.pdf','CLAUDIA_BEFORE','CODEX_NEW','AT_CLAUDIA_CAMERA','checks','character']:
        p=root/base
        if p.exists():names += [q.relative_to(root).as_posix() for q in ([p] if p.is_file() else sorted(p.rglob('*'))) if q.is_file()]
    hashes={path:hashfile(root/path) for path in names}
    zpath=root/'Screen06_Review.zip'
    with zipfile.ZipFile(zpath,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=2) as z:
        for path in names:
            z.write(root/path,path,compress_type=zipfile.ZIP_STORED if Path(path).suffix.lower() in {'.pdf','.png','.mp4','.jpg'} else zipfile.ZIP_DEFLATED)
        z.writestr('REVIEW_SHA256.json',json.dumps(hashes,indent=2)+'\n')
    with tempfile.TemporaryDirectory(dir=root.parent) as tmp:
        with zipfile.ZipFile(zpath) as z:
            assert z.testzip() is None and set(z.namelist())==set(hashes)|{'REVIEW_SHA256.json'};z.extractall(tmp)
        for path,h in hashes.items():
            actual=Path(tmp)/path; assert hashfile(actual)==h,path
            if actual.suffix in ['.jpg','.png']:
                with Image.open(actual) as im: im.verify()
    assert zpath.stat().st_size<150_000_000
    out='Rainbow_Screen06_'+name
    sources={'Review_on_Android.pdf':out+'_Review.pdf','Screen06_Review.zip':out+'_Review.zip',
             'CODEX_NEW/opening.png':out+'_Opening.png','CODEX_NEW/ride.mp4':out+'_Swim.mp4'}
    if args.mode=='coat':
        sources.update({'character/APPROVED.png':'Rainbow_Benny_Original_Detail.png','character/CLAUDIA_BEFORE.png':'Rainbow_Benny_Claudia_Detail.png','character/CODEX_NEW.png':'Rainbow_Benny_Layered_Coat_Detail.png'})
    for old,new in sources.items():
        dest=phone/new
        if dest.exists(): assert hashfile(dest)==hashfile(root/old)
        else:
            try:os.link(root/old,dest)
            except OSError:shutil.copyfile(root/old,dest)
    print('Verified',pages,'phone pages and',len(hashes),'archived files in',zpath.stat().st_size,'bytes')
if __name__=='__main__': main()
