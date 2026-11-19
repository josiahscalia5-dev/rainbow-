import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny'); sys.path.insert(0,'qa/pilot05/full_reference_match/benny/work')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from parts import approved_parts
from geom import load_uv
P,a,m=approved_parts()
u=load_uv(sys.argv[1]); idm=np.rint(u[...,2]).astype(int); idm[np.abs(u[...,2]-idm)>0.01]=0
G=dict(pom=idm==4,crown=idm==2,cuff=idm==3,star=idm==5,body=np.isin(idm,[1,6,7,8,9]))
o=a.copy()*0.55
def edge(mk): return mk&~ndi.binary_erosion(mk)
for k,c in dict(pom=(0,255,0),cuff=(0,120,255),star=(255,255,0),body=(255,0,0),crown=(0,255,255)).items():
    o[edge(P[k])]=(255,255,255)
    o[edge(G[k])]=c
im=Image.fromarray(o.astype(np.uint8)).crop((220,760,630,1210))
im.resize((im.width*2,im.height*2),Image.NEAREST).save(sys.argv[2])
