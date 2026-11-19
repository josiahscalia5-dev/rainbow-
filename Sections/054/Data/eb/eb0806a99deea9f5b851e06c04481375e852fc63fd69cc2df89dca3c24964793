from pathlib import Path
from PIL import Image
import numpy as np,json
import argparse
root=Path(__file__).resolve().parent
parser=argparse.ArgumentParser(description='Measure visible pale contributions in matched Screen 07 layer captures.')
parser.add_argument('captures',type=Path, nargs='?',default=root/'outlet-diagnostics')
parser.add_argument('output',type=Path, nargs='?',default=root/'outlet-layer-ownership.json')
args=parser.parse_args();d=args.captures
def pale(file):
    a=np.asarray(Image.open(file).convert('RGB'),dtype=np.int16)[90:690]
    return (a.min(2)>166)&(a.max(2)-a.min(2)<77)
result={'viewport':[432,768],'includedRows':[90,690],'rule':'All RGB channels >166 and their range <77. Count light pixels that stop meeting the threshold when visibility of the named layer is disabled, also checking the other visibility toggle on the identical frame. Because overlapping pale surfaces can conceal each other this is a visible contribution count.','poses':{}}
for pose in ['plunge-bottom','last-in-stage','across-transition']:
    result['poses'][pose]={}
    for role in ['BEFORE','NEW']:
        files=[d/role/(pose+'-'+p+'.png') for p in ['all','berm-off','foam-off','water-ribbon-off']]
        a,b,foam,river=map(pale,files)
        result['poses'][pose][role]={'paleInAllLayers':int(a.sum()),'lostWithFoamOffButPersistsWithWaterOff':int((a&~foam&river).sum()),'lostWithWaterOffButPersistsWithFoamOff':int((a&foam&~river).sum()),'lostWithEitherLayerOff':int((a&~foam&~river).sum()),'persistsWithBothIndependentToggles':int((a&foam&river).sum()),'lostWithContinuousBermOff':int((a&~b).sum())}
args.output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result['poses']['plunge-bottom']))
