"""measure approved vs game Benny: bbox per part, centre-column band runs, row widths.
usage: measure.py <game_capture.png> <game_mask_capture.png> [cx]"""
import sys, json; sys.path.insert(0,'qa/pilot05/full_reference_match/benny')
import numpy as np
from PIL import Image
from bennyseg import *
cap, mcap = sys.argv[1], sys.argv[2]
a=load(REF); m=np.asarray(Image.open(MASK))>0
g=load(cap); gm=load(mcap)
R,G,B=gm[...,0],gm[...,1],gm[...,2]
chg=np.abs(gm-g).sum(-1)>40
R=np.where(chg,R,128);G=np.where(chg,G,128);B=np.where(chg,B,128)
body=(R>150)&(G<60)&(B<60)
pom=(G>150)&(R<60)&(B<60)
cuff=(B>150)&(R<60)&(G<60)
crown=(R<60)&(G>150)&(B>150)&(np.abs(G-B)<40)
hatbox=np.zeros_like(body); 
hb=bbox(crown|cuff)
star=(R<40)&(G<40)&(B<40)
yy,xx=np.mgrid[:1536,:864]
star&=(xx>=hb['x0'])&(xx<=hb['x1'])&(yy>=hb['y0'])&(yy<=hb['y1'])
star=biggest(star)
for n,v in [('body',body),('pom',pom),('cuff',cuff),('crown',crown),('star',star)]:
    globals()['g_'+n]=v
gall=body|pom|cuff|crown|star
out={'game':{k:bbox(v) for k,v in dict(all=gall,hat=pom|cuff|crown|star,pom=pom,crown=crown,cuff=cuff,star=star,body=body).items()}}
# approved parts
cls=colour_classes(a)
ystar=biggest((cls==4)&m)
out['approved']={'all':bbox(m),'star':bbox(ystar)}
print(json.dumps(out,indent=0))
cx=int(sys.argv[3]) if len(sys.argv)>3 else 424
def runs(lab,names,y0=740,y1=1200):
    prev=None; s=None; res=[]
    for y in range(y0,y1):
        k=lab[y]
        if k!=prev:
            if prev is not None: res.append((s,y-1,names.get(prev,str(prev))))
            prev=k; s=y
    res.append((s,y1-1,names.get(prev,str(prev))))
    return res
# game centre column: part ids from mask, stripes from capture classes
gc=colour_classes(g)
lab=[]
for y in range(740,1200):
    sl=slice(cx-6,cx+7)
    if body[y,sl].mean()>0.5: lab.append('body')
    elif pom[y,sl].mean()>0.5: lab.append('pom')
    elif cuff[y,sl].mean()>0.5: lab.append('cuff')
    elif crown[y,sl].mean()>0.5:
        v=np.bincount(gc[y,sl],minlength=5); lab.append('crown_'+'oPUWY'[v.argmax()])
    else: lab.append('-')
lab=['']*740+lab
print('GAME centre column', [r for r in runs(lab,{})])
for y in range(770,1200,10):
    ra=np.nonzero(m[y])[0]; rg=np.nonzero(gall[y])[0]
    fa=f'{ra.min()}-{ra.max()} w{ra.max()-ra.min()+1}' if len(ra) else '-'
    fg=f'{rg.min()}-{rg.max()} w{rg.max()-rg.min()+1}' if len(rg) else '-'
    print(y,'APP',fa,' GAME',fg)
