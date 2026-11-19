"""Read the actual front-surface IDs recorded from the WebGL camera at both versions."""
import json
from pathlib import Path
import sys
from collections import Counter
from PIL import Image

before,after,out=map(Path,sys.argv[1:])
areas={'opening':(78,155,117,174),'forward-03':(72,180,106,188),
       'forward-06':(50,135,65,150),'hard-left':(8,122,61,145)}
result={'dimensions':[270,480],'screenCoordinates':'zero origin at top left, exclusive right/bottom','samples':{}}
for label,folder in [('previous',before),('revised',after)]:
    logs=json.loads((folder/'surface-ids.json').read_text())
    for pose in logs:
        name=pose['name']
        record=result['samples'].setdefault(name,{})
        coverage=pose['coverage']
        data={'upperVisiblePixels':coverage['m06_crest_upper_water']['pixels'],
              'undersideVisiblePixels':coverage['m06_crest_outer_soffit']['pixels']}
        if name in areas:
            key={tuple(o['rgb']):o['name'] for o in pose['key']}
            roi=areas[name]
            with Image.open(folder/(name+'-opaque-surface-id.png')) as image:
                bins=Counter(key.get(tuple(rgb),'other drawn content') for rgb in image.convert('RGB').crop(roi).getdata())
            data['region']=roi
            data['visibleRegionPixelsByFirstSurface']=dict(bins.most_common())
        record[label]=data
out.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result['samples'],indent=1))
