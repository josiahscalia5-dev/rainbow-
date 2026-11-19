"""Compare opaque game surface IDs from matched geometry diagnostics."""
import argparse
import json
from pathlib import Path
import numpy as np
from PIL import Image

def inspect(directory):
    records = {r['name']: r for r in json.loads((directory / 'surface-ids.json').read_text())}
    panel = 'm06_crest_outer_soffit'
    out = {}
    for name in ('opening','forward-03','forward-06','forward-20','hard-left','hard-right'):
        row = records[name]
        out[name] = {
            'casingPixelsInFull270x480Frame': row['coverage'][panel]['pixels'],
            'screenRayAtFractionalXY_35_39': row['hits'][0],
        }
        if name == 'forward-03':
            ids = np.asarray(Image.open(directory / (name+'-opaque-surface-id.png')).convert('RGB'))
            color = np.asarray(Image.open(directory / (name+'.png')).convert('RGB'), dtype=np.float64)
            # This rectangle was set in the preceding two-camera experiment. It is
            # immediately left of the pom-pom, just under the photographed far crest.
            x0,y0,x1,y1=230,574,340,602
            height,width=ids.shape[:2]
            x = slice(round(x0/864*width), round(x1/864*width))
            y = slice(round(y0/1536*height), round(y1/1536*height))
            crop = ids[y,x]; rgb=color[y,x]
            out[name]['previouslySpecifiedAperture']={
                'nativeRectangle': [x0,y0,x1,y1],
                'sampleCount': int(crop.shape[0]*crop.shape[1]),
                'counts': {k['name']: int(np.all(crop == k['rgb'],axis=2).sum()) for k in row['key']},
                'purpleColorSamples':int(((rgb[:,:,2]>rgb[:,:,0]*1.03)&(rgb[:,:,2]>rgb[:,:,1]*1.12)).sum()),
            }
    return out

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('parent',type=Path); p.add_argument('trial',type=Path); p.add_argument('selected',type=Path);p.add_argument('report',type=Path)
    a=p.parse_args()
    d={'method':'Separate opaque WebGL pass at 270 x 480. Identical camera and retained simulation for each version. Ray depth is in game units. These are visibility measurements, not an artwork similarity score.',
       'previousCameraFit': inspect(a.parent),'openUndersideTrial':inspect(a.trial),'seatedCrestCandidate':inspect(a.selected)}
    a.report.write_text(json.dumps(d,indent=2)+'\n')
if __name__=='__main__': main()
