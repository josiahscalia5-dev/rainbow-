"""approved part masks (colour components inside masks/benny_and_hat.png) + per-part error / colour stats.
usage: parts.py <capture.png> [<mask_capture.png>]"""
import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from bennyseg import *
def approved_parts():
    a=load(REF); m=np.asarray(Image.open(MASK))>0
    cls=colour_classes(a); yy,xx=np.mgrid[:1536,:864]
    pur=ndi.binary_closing((cls==2)&m,np.ones((5,5)))&m
    lab,k=ndi.label(pur); sz=ndi.sum(pur,lab,range(1,k+1)); cy=ndi.mean(yy,lab,range(1,k+1))
    order=np.argsort(sz)[::-1]
    comps=[(lab==i+1,cy[i]) for i in order[:3]]
    cuff=[c for c,y in comps if 980<y<1010][0]; pom=[c for c,y in comps if y<870][0]; band=[c for c,y in comps if 900<y<950][0]
    star=ndi.binary_fill_holes(ndi.binary_closing(biggest((cls==4)&m),np.ones((3,3))))
    star=ndi.binary_dilation(star,iterations=1)&m
    hat_rows=np.zeros_like(m)
    # crown = mask pixels between pom and cuff that are not pom/cuff/star
    cy_c=bbox(cuff); 
    crown=m&~pom&~cuff&~star&(yy<cy_c['cy'])&(yy>800)
    # body = remaining mask pixels below the cuff top
    pomf=ndi.binary_fill_holes(pom)
    crown&=~pomf
    body=m&~pomf&~cuff&~star&~crown
    # pom: fill to its silhouette
    return dict(pom=pomf&m,crown=crown,cuff=cuff,star=star,body=body), a, m
if __name__=='__main__':
    P,a,m=approved_parts()
    c=load(sys.argv[1]); d=np.abs(c-a).mean(-1)
    tot=d[m].sum()
    print(f"{'part':6s} {'px':>6s} {'mean':>6s} {'<=20':>5s} {'share_of_err':>8s}  approved_med  game_med(at approved px)")
    for n,p in P.items():
        print(f"{n:6s} {p.sum():6d} {d[p].mean():6.1f} {(d[p]<=20).mean():5.2f} {d[p].sum()/tot:8.3f}  {np.median(a[p],0).astype(int)}  {np.median(c[p],0).astype(int)}  bbox {bbox(p)}")
    print('ALL', m.sum(), round(d[m].mean(),2), round((d[m]<=20).mean(),3))
    if len(sys.argv)>2:
        # game parts from the flat-ID capture
        g=c; gm=load(sys.argv[2]); chg=np.abs(gm-g).sum(-1)>40
        R,G,B=[np.where(chg,gm[...,i],128) for i in range(3)]
        GP=dict(body=(R>150)&(G<60)&(B<60),pom=(G>150)&(R<60)&(B<60),cuff=(B>150)&(R<60)&(G<60),crown=(R<60)&(G>150)&(B>150))
        for n,p in GP.items(): print('game',n,p.sum(),'median',np.median(g[p],0).astype(int),'mean',g[p].mean(0).astype(int))
        for n,p in P.items(): print('appr',n,p.sum(),'median',np.median(a[p],0).astype(int),'mean',a[p].mean(0).astype(int))
    o=np.zeros((1536,864,3),np.uint8)
    cols=dict(pom=(0,255,0),crown=(0,255,255),cuff=(0,0,255),star=(0,0,0),body=(255,0,0))
    for n,p in P.items(): o[p]=cols[n]
    Image.fromarray(o).crop((200,740,640,1220)).save('qa/pilot05/full_reference_match/benny/work/ref_parts.png')
