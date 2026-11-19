from pathlib import Path
import argparse,json
import numpy as np
from PIL import Image

p=argparse.ArgumentParser()
for name in ['diagnostics','confidence','approved','before','candidate','out']:p.add_argument(name,type=Path)
a=p.parse_args()
def frame(f):return np.asarray(Image.open(f).convert('RGB'),dtype=float)
before,new,approved=[frame(f) for f in [a.before,a.candidate,a.approved]]
weight=frame(a.diagnostics/'release-1.1-weight.png')
ids=frame(a.diagnostics/'release-1.1-id.png')
mask=np.array(Image.open(a.confidence))
samples=[]
for r in json.loads((a.diagnostics/'surfaces.json').read_text())['rayProbes']:
    x,y=r['p'];px,py=r['sourcePixel'];ox,oy=round(px),round(py)
    if not (0<=ox<864 and 448<=oy<704) or mask[oy-448,ox]<242:continue
    mat=r['object']
    if mat not in ('m06_tube','m06_rings') or weight[y,x,0]>3:continue
    chan=ids[y,x]
    if chan[2 if mat=='m06_tube' else 1]<240:continue
    # A small neighborhood on the same traced patch suppresses subpixel rounding at a metallic highlight.
    observed=tuple(map(float,approved[oy-1:oy+2,ox-1:ox+2].mean(axis=(0,1))))
    samples.append({'screen':[x,y],'world':r['world'],'surface':mat,'approvedXY':[round(px,3),round(py,3)],'beforeMAE_toKnownPaint':round(float(np.abs(before[y,x]-observed).mean()),2),'newMAE_toKnownPaint':round(float(np.abs(new[y,x]-observed).mean()),2)})
assert len(samples)>=10
result={'pose':'crest-release, +1.1 units','sampleCount':len(samples),'selection':'Retained ring or tube reached by a ray, retained projection weight at or below 3/255, locked source coordinate in the artwork-confirmed wall confidence mask at or above 242/255. Compare mean RGB difference from original nearby wall paint in a 3 by 3 footprint. This is local material evidence. The artwork supplies no approved whole frame for the moving pose.','beforeMean':round(np.mean([r['beforeMAE_toKnownPaint'] for r in samples]).item(),2),'newMean':round(np.mean([r['newMAE_toKnownPaint'] for r in samples]).item(),2),'samples':samples}
a.out.write_text(json.dumps(result,indent=2)+'\n')
print('Crest wall samples',len(samples),result['beforeMean'],'to',result['newMean'])
