"""Extract only the signed edge contrast of painted purple slots from the retained wall atlas."""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, maximum_filter, label, find_objects

src,metadata,out=map(Path,sys.argv[1:])
pixels=np.asarray(Image.open(src).convert('RGB'),dtype=np.float32)
rows=json.loads(metadata.read_text())['wall']['rows']
detail=np.full(pixels.shape[:2],128,dtype=np.uint8)
stats={}
for key,row in rows.items():
    y,h=row['y0'],row['h']
    p=pixels[y:y+h]
    r,g,b=p.transpose(2,0,1)
    l=.299*r+.587*g+.114*b
    field=gaussian_filter(l,sigma=(max(1,h/85),3.2),mode=('nearest','wrap'))
    # Dark violet holes in painted metal. Keep compact connected features and their adjoining bevel.
    hole=(l < field-10) & (l<99) & (b>g+8) & (r>g+4)
    labels,count=label(hole)
    mask=np.zeros_like(hole)
    for i,box in enumerate(find_objects(labels),1):
        if box is None:continue
        bh=box[0].stop-box[0].start;bw=box[1].stop-box[1].start
        if 2<=bw<=40 and 1<=bh<=max(8,int(h*.24)) and (bw*bh)>=5:
            mask[box] |= labels[box]==i
    skirt=gaussian_filter(maximum_filter(mask.astype(np.float32),size=(max(3,int(h/40)),9)),sigma=1.3)
    # Zero DC and a conservative bound preserve colour and the original bay lighting.
    relief=np.clip((l-field)*.86,-21,21)*skirt
    detail[y:y+h]=np.rint(128+relief).astype(np.uint8)
    stats[key]=int(np.count_nonzero(abs(relief)>=3))
Image.fromarray(detail).save(out,optimize=True)
print(json.dumps({'sourceSize':[pixels.shape[1],pixels.shape[0]],'evidencePixelsByBay':stats,'maxSignedDisplayChannelAdjustment':21}))
