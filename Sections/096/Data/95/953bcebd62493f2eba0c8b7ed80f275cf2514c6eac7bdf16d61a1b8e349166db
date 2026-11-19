"""Fit the visible shoulders of the real ride to the artist's fixed crest silhouette."""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from scipy.ndimage import gaussian_filter1d

course_path, asset_path, dest = map(Path,sys.argv[1:4]);course=json.loads(course_path.read_text());layout=json.loads((asset_path/'proj06.json').read_text())
records=course['rows']; stations=np.array([q['s'] for q in records])-course['inlet'];center=np.array([q['p'] for q in records]);right=np.array([q['r'] for q in records]);up=np.array([q['u'] for q in records]);view=np.array(layout['camera']['matrixWorld']).reshape(4,4).T
focal=768/np.tan(np.deg2rad(layout['camera']['fov']/2));rotation=view[:3,:3];eye=view[:3,3]
def project(p):
 v=(p-eye)@rotation;d=np.maximum(0.04,-v[:,2]);return np.array([432+focal*v[:,0]/d,768-focal*v[:,1]/d]).T

# The fits use a fixed camera and fixed world cross-sections. Station 10 is under Benny at the approved camera.
keys=np.array([5,8,10,12,14,16,18,20,22,24,27,30,34,39,47,54.]);n=len(keys)
control=np.tile([3.42,3.42,.14,.14],(n,1));control[-1,:2]=3.35
reference=np.asarray(Image.open(asset_path/'mask06.png').convert('RGB'))[:,:,1]<128
step=5;W,H=173,308;target=reference[::step,::step];region=np.zeros_like(target);region[90:255]=True
st=np.arange(5.25,45.1,.35);co=np.array([np.interp(st,stations,v) for v in center.T]).T;ri=np.array([np.interp(st,stations,v) for v in right.T]).T;uu=np.array([np.interp(st,stations,v) for v in up.T]).T
# One side rises around the crest. The centre of the ride always stays on the original water plane.
def raster(c):
 vals=np.array([np.interp(st,keys,v) for v in c.T]);left=project(co-ri*vals[0,:,None]+uu*vals[2,:,None])/step;centre=project(co)/step;edge=project(co+ri*vals[1,:,None]+uu*vals[3,:,None])/step
 img=Image.new('1',(W,H));draw=ImageDraw.Draw(img)
 for a,b in ((left,centre),(centre,edge)):
  faces=np.stack((a[:-1],a[1:],b[1:],b[:-1]),axis=1);coords=np.rint(np.clip(faces,-2000,2000)).astype(int).reshape(-1,8).tolist()
  for face in coords:draw.polygon(face,fill=1)
 return np.asarray(img)

def score(c):
 y=raster(c);falsepos=(y&~target&region).sum();miss=(~y&target&region).sum();rough=np.square(np.diff(c,n=2,axis=0)).sum();width=np.square(c[:,:2]-2.9).sum();height=np.square(c[:,2:]-.12).sum();holeExtra=(y[109:143,58:117]&~target[109:143,58:117]).sum(); return float(1.24*falsepos+miss+2.8*holeExtra+6.0*rough+1.5*width+2.0*height)
initial=score(control);best=initial
for step_w,step_h in [(1.2,.72),(.65,.40),(.34,.21),(.18,.11)]:
 for _ in range(2):
  for row in [7,6,8,5,9,4,10,3,11,2,12,1,13]:
   for col in [0,1,2,3]:
    val=control[row,col];winner=val
    for direction in (-1,1):
     width_limit=3.39 if keys[row]<49 else 3.25
     control[row,col]=np.clip(val+direction*(step_w if col<2 else step_h),width_limit if col<2 else -.85,5.5 if col<2 else 1.05)
     value=score(control)
     if value<best:best,winner=value,control[row,col]
    control[row,col]=winner
metrics={}
for label,c in [('fixed-width',np.tile([2.3,2.3,.18,.18],(n,1))),('fitted',control)]:
 predicted=raster(c);inter=(predicted&target&region).sum();union=((predicted|target)&region).sum();metrics[label]=dict(silhouetteIoUInCrestCrop=float(inter/union),extra=int((predicted&~target&region).sum()),missing=int((~predicted&target&region).sum()))
result={'stationFromInlet':keys.tolist(),'leftWidth':control[:,0].round(4).tolist(),'rightWidth':control[:,1].round(4).tolist(),'leftRise':control[:,2].round(4).tolist(),'rightRise':control[:,3].round(4).tolist(),'fitMetrics':metrics,'scope':'Static water silhouette in original screen, y=450–1274 at one fifth resolution. Unseen widths are interpretations. The centre remains on the unmodified ride.'}
dest.write_text(json.dumps(result,indent=2)+'\n');print(metrics)
