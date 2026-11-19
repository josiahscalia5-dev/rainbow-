import json
from pathlib import Path
import numpy as np
from PIL import Image
base=Path('/tmp/rainbow06-repair/qa/analysis/final-authoritative/NEW')
trial=Path('/tmp/rainbow06-fit/qa/analysis/final-authoritative/NEW')
def check(folder):
 sam=next(v for v in json.load((folder/'surface-ids.json').open()) if v['name']=='forward-03')
 ids=np.asarray(Image.open(folder/'forward-03-opaque-surface-id.png').convert('RGB'))
 rgb=np.asarray(Image.open(folder/'forward-03.png').convert('RGB'),dtype=float)
 width=ids.shape[1];height=ids.shape[0]; rx=slice(round(230/864*width),round(340/864*width));ry=slice(round(574/1536*height),round(602/1536*height)); raw=ids[ry,rx,:];color=rgb[ry,rx,:]
 result={'nativeTargetRect':[230,574,340,602],'diagnosticWidth':width,'diagnosticHeight':height,'pixelCount':int(raw.size/3),'surfaces':{},'rgbPurpleDominant':int(((color[:,:,2]>color[:,:,0]*1.03)&(color[:,:,2]>color[:,:,1]*1.12)).sum()),'trackedRefLipHits':sam['lipRays']}
 for e in sam['key']:
  result['surfaces'][e['name']]=int(np.all(raw==np.array(e['rgb']),axis=2).sum())
 return result
if all((f/'forward-03-opaque-surface-id.png').exists() for f in [base,trial]):
 ds={'priorFit':check(base),'pairedCameraFit':check(trial)}
 Path('/tmp/rainbow06-fit/qa/analysis/two-camera-gap.json').write_text(json.dumps(ds,indent=2)+'\n')
 for k,t in ds.items():print(k,t['pixelCount'],[(n,v) for n,v in t['surfaces'].items() if v],t['rgbPurpleDominant'])
