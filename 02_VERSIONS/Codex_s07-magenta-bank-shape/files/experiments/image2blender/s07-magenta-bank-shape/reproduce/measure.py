"""Aligned full-frame inspection, local outline error, and foreground colour occupancy."""
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing

root=Path.cwd();compare=root/'comparison'
def rgb(f):return np.array(Image.open(f).convert('RGB'),dtype=np.int16)
a=rgb('inputs/approved-07.png')
def occupancy(img):
    window=img[1262:1491,40:824]
    r,g,b=window[:,:,0],window[:,:,1],window[:,:,2]
    return 100*float(np.mean((r>145)&(r-g>55)&(b-g>32)))
metrics={'nativeSize':[864,1536],'approvedForegroundMagentaPercent':occupancy(a),'foregroundROI':{'x':'[40,824)','y':'[1262,1491)','mask':'R > 145, R - G > 55, B - G > 32 on 8-bit RGB. Describes colour coverage only.'},'pairs':{}}
for ref in sorted(compare.glob('CLAUDIA_BEFORE_*.png')):
    name=ref.stem.removeprefix('CLAUDIA_BEFORE_')
    before=rgb(ref);new=rgb(compare/('IMAGE2BLENDER_TEST_'+name+'.png'))
    assert before.shape==a.shape==new.shape
    differ=np.any(before!=new,axis=-1)
    result={'changedWholeFramePixels':int(differ.sum()),'changedHUDPixelsFirst180Rows':int(differ[:180].sum()),'beforeForegroundMagentaPercent':occupancy(before),'testForegroundMagentaPercent':occupancy(new)}
    if name=='opening':
        for label,im in [('before',before),('test',new)]:
            result[label+'VsApprovedWholeFrameWithin20Percent']=100*float(np.mean(np.abs(a-im).sum(2)<=60))
    metrics['pairs'][name]=result
model=np.array(Image.open('image2blender-runs/s07_banks/renders/final_reference.png').convert('RGBA'))
x=np.arange(864);edge=[]
for y in [1274,1298,1327,1361,1385,1420,1440,1455,1472,1492,1500]:
    rows=a[y-2:y+3]
    pink=(rows[:,:,0]-rows[:,:,1]>55)&(rows[:,:,2]-rows[:,:,1]>32)&(rows[:,:,0]>145)
    refmask=binary_closing(pink.mean(0)>.3,structure=np.ones(16))
    ref=int(x[refmask&(x<520)].max());test=int(x[(model[y,:,3]>190)&(x<525)].max())
    edge.append({'y':y,'referenceInnerEdgeX':ref,'modelInnerEdgeX':test,'absoluteErrorPixels':abs(ref-test)})
metrics['visibleLowerLeftBankAtApprovedAngle']={'method':'11 scanlines below Benny. Rightmost contiguous saturated-magenta reference pixels in the left window compared with the rendered geometry alpha edge. These are same-image fit checks and do not measure novel views.','rows':edge,'medianErrorPixels':float(np.median([v['absoluteErrorPixels'] for v in edge])),'maxErrorPixels':max(v['absoluteErrorPixels'] for v in edge)}
(compare/'measurements.json').write_text(json.dumps(metrics,indent=2)+'\n')
print('Approved magenta coverage',round(metrics['approvedForegroundMagentaPercent'],1))
for k,v in metrics['pairs'].items():print(k,v['changedWholeFramePixels'],round(v['beforeForegroundMagentaPercent'],2),round(v['testForegroundMagentaPercent'],2))
print('Opening similarity',round(metrics['pairs']['opening']['testVsApprovedWholeFrameWithin20Percent'],4))
