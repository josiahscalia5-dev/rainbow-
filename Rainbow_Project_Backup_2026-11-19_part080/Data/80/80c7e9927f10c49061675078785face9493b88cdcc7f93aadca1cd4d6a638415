"""game part geometry from a UV pass (uv.f32 of rect 200,740,440,480) vs approved parts. usage: geom.py <uv.f32>"""
import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny'); sys.path.insert(0,'qa/pilot05/full_reference_match/benny/work')
import numpy as np
from bennyseg import bbox
from parts import approved_parts
X0,Y0,W,H=200,740,440,480
def load_uv(p):
    u=np.fromfile(p,np.float32).reshape(H,W,4)[::-1]
    full=np.zeros((1536,864,4),np.float32); full[Y0:Y0+H,X0:X0+W]=u
    return full
if __name__=='__main__':
    u=load_uv(sys.argv[1]); idm=np.rint(u[...,2]).astype(int); idm[np.abs(u[...,2]-idm)>0.01]=0
    P,a,m=approved_parts()
    G=dict(pom=idm==4,crown=idm==2,cuff=idm==3,star=idm==5,body=np.isin(idm,[1,6,7,8,9]))
    G['all']=idm>0
    P['all']=m
    print(f"{'part':6s} | {'approved bbox x0-x1, y0-y1 (w x h) centre':48s} | game")
    for k in ['all','pom','crown','cuff','star','body']:
        A=bbox(P[k]); B=bbox(G[k])
        f=lambda b: f"{b['x0']}-{b['x1']}, {b['y0']}-{b['y1']} ({b['w']}x{b['h']}) c({b['cx']},{b['cy']}) {b['px']}px"
        print(f"{k:6s} | {f(A):48s} | {f(B)}")
    # IoU of each part
    for k in ['pom','crown','cuff','star','body','all']:
        i=(P[k]&G[k]).sum(); un=(P[k]|G[k]).sum(); print(k,'IoU',round(i/un,3))
    cx=424
    def runs(lab):
        res=[];prev=None;s=0
        for y in range(760,1200):
            if lab[y]!=prev:
                if prev is not None: res.append(f'{prev}{s}-{y-1}')
                prev=lab[y]; s=y
        res.append(f'{prev}{s}-1199'); return ' '.join(res)
    names={0:'-',1:'B',2:'C',3:'U',4:'P',5:'S',6:'a',7:'a'}
    lab=[names.get(np.bincount(idm[y,cx-5:cx+6],minlength=11).argmax(),'?') for y in range(1536)]
    print('GAME centre', runs(lab))
    pl=np.zeros((1536,864),int)
    for i,k in enumerate(['body','cuff','crown','pom','star'],1): pl[P[k]]=i
    nm={0:'-',1:'B',2:'U',3:'C',4:'P',5:'S'}
    lab=[nm[np.bincount(pl[y,cx-5:cx+6],minlength=6).argmax()] for y in range(1536)]
    print('APPR centre', runs(lab))
    for y in range(780,1195,15):
        ra=np.nonzero(m[y])[0]; rg=np.nonzero(G['all'][y])[0]
        f=lambda r: f'{r.min()}-{r.max()} w{r.max()-r.min()+1}' if len(r) else '-'
        print(y,'APP',f(ra),' GAME',f(rg))
