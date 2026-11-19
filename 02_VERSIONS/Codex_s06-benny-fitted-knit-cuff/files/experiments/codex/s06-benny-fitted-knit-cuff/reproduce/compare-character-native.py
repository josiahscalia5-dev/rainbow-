"""Measure the frozen opening and identify which native pixels the material pilot changed."""
from pathlib import Path
import json,argparse
import numpy as np
from PIL import Image
from scipy import ndimage
p=Path(__file__).parent; c=p.parent/'character-check'; exported=p.parent
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--original',type=Path)
ap.add_argument('--retained',type=Path)
ap.add_argument('--new',type=Path)
ap.add_argument('--without-benny',type=Path)
ap.add_argument('--output',type=Path)
args=ap.parse_args()
is_export=(exported/'APPROVED.jpg').is_file()
x0,y0,x1,y1=[145,640,695,1275]

def pixels(f): return np.asarray(Image.open(f).convert('RGB'),dtype=np.int16)
art=pixels(args.original or (exported/'APPROVED.jpg' if is_export else p/'verified-original-06.jpg'))
before=pixels(args.retained or (exported/'CLAUDIA_BEFORE/opening.png' if is_export else c/'rendered/06/with-benny.png'))
no_actor=pixels(args.without_benny or (exported/'measurements/opening-without-benny.png' if is_export else c/'rendered/06/without-benny.png'))
candidate=pixels(args.new or (exported/'CODEX_NEW/opening.png' if is_export else p/'qa-final/proof/06/NEW/opening.png'))
assert before.shape == candidate.shape == art.shape == (1536,864,3)
def score(a,b):
    delta=np.abs(a-b)
    return {'meanAbsoluteChannelError':round(float(delta.mean()),6),'pixelsInsideTolerance20':int((delta.mean(axis=2)<=20).sum()),'samplePixels':int(delta.shape[0]*delta.shape[1])}
original_crop=art[y0:y1,x0:x1]
b_crop=before[y0:y1,x0:x1];c_crop=candidate[y0:y1,x0:x1]
delta=np.abs(candidate-before).sum(2)
roi=np.zeros(delta.shape,dtype=bool);roi[y0:y1,x0:x1]=True
actor=np.abs(before-no_actor).sum(2)>5;actor=ndimage.binary_dilation(actor,iterations=2)
report={'fixedCropXYXY':[x0,y0,x1,y1],'measurement':'Native opening, fixed rectangle. It includes the actor and neighboring water. Soft original silhouettes are hand read within roughly eight pixels.','originalVsRetainedCrop':score(original_crop,b_crop),'originalVsExperimentalCrop':score(original_crop,c_crop),'anyChangedOutsideCrop':int(((delta>0)&~roi).sum()),'sumRGBOver30OutsideCrop':int(((delta>30)&~roi).sum()),'sumRGBOver30InsideCrop':int(((delta>30)&roi).sum()),'anyChangedOutsideVisibleActorPlus2px':int(((delta>0)&~actor).sum()),'approximateOriginalSize':[435,459],'retainedSize':[448,477]}
(args.output or p/'character-pixels.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
