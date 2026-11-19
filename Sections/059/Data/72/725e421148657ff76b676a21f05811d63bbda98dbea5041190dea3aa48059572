"""Lift traced image edges to Claudia's saved water plane with the locked camera."""
import json,math
from pathlib import Path
import numpy as np
from scipy.interpolate import PchipInterpolator
from PIL import Image, ImageDraw
p=Path('inputs')
layout=json.loads((p/'proj07.json').read_text());cam=layout['camera']
mw=np.array(cam['matrixWorld']).reshape((4,4),order='F');origin=mw[:3,3]
base=np.array(layout['water']);up=np.array(layout['U']);right=np.array(layout['X']);front=np.array(layout['D'])
def ray(px,y):
    d=mw[:3,:3]@np.array([(2*px/864-1)*(864/1536)*math.tan(math.radians(31)),(1-2*y/1536)*math.tan(math.radians(31)),-1])
    q=origin+d*(np.dot(up,base-origin)/np.dot(up,d))-base
    return [float(right@q),float(front@q)]
# Bounds adjoining the cyan water are the firmest measurements. The negative / overscan
# values continue a cropped edge outside frame. Benny hides the middle left edge.
rows_left=[(1528,145,480),(1480,93,375),(1430,34,256),(1375,-8,163),(1315,-45,104),(1265,-47,96),(1215,-34,121),(1170,-17,161),(1130,-3,202),(1090,34,228),(1050,112,268),(990,211,322),(930,272,360),(860,292,385),(800,284,410),(755,291,389),(715,321,400),(680,368,445),(650,412,492),(628,466,527),(611,508,553)]
rows_right=[(1528,780,1020),(1450,708,994),(1375,679,954),(1315,686,915),(1250,694,879),(1195,728,838),(1140,748,873),(1080,769,899),(1010,775,911),(945,747,898),(880,705,865),(825,635,823),(787,553,749),(745,514,619),(705,524,580),(667,584,645),(640,638,689),(615,654,689)]
out={'pixel_edges':{},'traces':{},'notes':'Native image pixel coordinates. Edges hidden by Benny, foam or the picture boundary are inferred continuations. Local Blender coordinates are lateral, forward, height.'}
im=Image.open(p/'approved-07.png').convert('RGB');draw=ImageDraw.Draw(im)
for side,rows in [('left',rows_left),('right',rows_right)]:
    out['pixel_edges'][side]=rows
    labels=('outer','inner') if side=='left' else ('inner','outer')
    for idx,tag in enumerate(labels):
        pts=[ray(r[idx+1],r[0]) for r in rows]
        out['traces'][side+'_'+tag]=sorted([[round(y,6),round(x,6)] for x,y in pts])
        draw.line([(r[idx+1],r[0]) for r in rows],fill=('yellow' if tag=='inner' else 'white'),width=3)
im.thumbnail((432,768));im.save('traced-inspect.png')
(p/'trace.json').write_text(json.dumps(out,indent=2))
for s,tr in out['traces'].items():
    x,y=np.transpose(tr);print(s,[(round(float(a),1),round(float(b),1)) for a,b in zip(x[::3],y[::3])])
