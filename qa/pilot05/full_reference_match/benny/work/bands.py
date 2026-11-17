import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from bennyseg import *
a=load(REF); g=load(sys.argv[1])
def runs_at(img,x,y0=860,y1=1045):
    cls=colour_classes(img)
    col=cls[:,x-3:x+4]
    lab=[]
    for y in range(y0,y1):
        v=np.bincount(col[y],minlength=5); lab.append('oPUWY'[v.argmax()])
    # smooth: median filter
    s=''.join(lab)
    res=[];prev=None;st=y0
    for i,ch in enumerate(s):
        if ch!=prev:
            if prev: res.append(f'{prev}{st}-{y0+i-1}')
            prev=ch; st=y0+i
    res.append(f'{prev}{st}-{y1-1}')
    return [r for r in res if int(r[1:].split('-')[1])-int(r[1:].split('-')[0])>=3]
for x in range(300,560,25):
    print(x,'APP ',' '.join(runs_at(a,x)))
    print(x,'GAME',' '.join(runs_at(g,x)))
# class colour medians in hat area
for nm,img in [('APP',a),('GAME',g)]:
    cls=colour_classes(img); yy,xx=np.mgrid[:1536,:864]
    hat=(yy>880)&(yy<985)&(xx>300)&(xx<540)
    w=hat&(cls==3); p=hat&(cls==2)
    print(nm,'white',w.sum(),np.median(img[w],0).astype(int),np.percentile(img[w],[10,90],axis=0).astype(int).tolist(),' purple',p.sum(),np.median(img[p],0).astype(int),np.percentile(img[p],[10,90],axis=0).astype(int).tolist())
