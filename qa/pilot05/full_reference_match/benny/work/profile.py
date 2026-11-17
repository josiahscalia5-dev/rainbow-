import sys; sys.path.insert(0,'qa/pilot05/full_reference_match/benny')
import numpy as np
from PIL import Image
from bennyseg import *
a=load(REF); m=np.asarray(Image.open(MASK))>0
cls=colour_classes(a)
ys,xs=np.nonzero(m); print('mask bbox',xs.min(),xs.max(),ys.min(),ys.max(), 'cx',xs.mean().round(1),'cy',ys.mean().round(1))
# centre column class runs
cx=int(sys.argv[1]) if len(sys.argv)>1 else 424
col=cls[:,cx-6:cx+7]
names='o P U W Y'.split()
prev=None; start=None
for y in range(760,1195):
    vals=np.bincount(col[y],minlength=5); k=int(vals.argmax())
    if not m[y,cx]: k=-1
    if k!=prev:
        if prev is not None: print(f'{start}-{y-1} {names[prev] if prev>=0 else "-"} ({y-start})')
        prev=k; start=y
print(f'{start}-{y} {names[prev] if prev>=0 else "-"}')
# row widths of mask
for y in range(770,1195,10):
    r=np.nonzero(m[y])[0]
    print(y, r.min(), r.max(), r.max()-r.min()+1)
