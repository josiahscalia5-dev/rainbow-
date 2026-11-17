import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from bennyseg import *
a=load(REF); m=np.asarray(Image.open(MASK))>0
cls=colour_classes(a)
H,S,V=rgb2hsv(a)
yy,xx=np.mgrid[:1536,:864]
pink=(cls==1)&m
# body = mask below the hat: the cuff bottom boundary = lowest purple-ribbed row per column
pur=ndi.binary_closing((cls==2)&m,np.ones((5,5)))
wht=ndi.binary_closing((cls==3)&m&(yy<1035),np.ones((3,3)))
lab,k=ndi.label(pur); sz=ndi.sum(pur,lab,range(1,k+1)); cy=ndi.mean(yy,lab,range(1,k+1))
for i in np.argsort(sz)[::-1][:8]: print('purple comp',i+1,int(sz[i]),round(cy[i],1), bbox(lab==i+1))
lab2,k2=ndi.label(wht); sz2=ndi.sum(wht,lab2,range(1,k2+1)); cy2=ndi.mean(yy,lab2,range(1,k2+1))
for i in np.argsort(sz2)[::-1][:6]: print('white comp',i+1,int(sz2[i]),round(cy2[i],1), bbox(lab2==i+1))
