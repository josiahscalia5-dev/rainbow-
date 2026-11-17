import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny')
import numpy as np
from PIL import Image
from bennyseg import *
a=load(REF); m=np.asarray(Image.open(MASK))>0
cls=colour_classes(a); cls[~m]=0
pal=np.array([[0,0,0],[255,0,0],[0,0,255],[0,255,255],[0,0,0]],np.uint8)
pal[4]=[255,255,0]
o=pal[cls]; o[~m]=(a[~m]*0.3).astype(np.uint8)
Image.fromarray(o).crop((200,740,640,1220)).save('qa/pilot05/full_reference_match/benny/work/ref_classes.png')
for k,n in enumerate(['other','pink','purple','white','yellow']): print(n,(cls==k).sum() if k else ((cls==0)&m).sum())
