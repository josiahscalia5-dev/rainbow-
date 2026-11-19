import json,math,gzip,base64,sys
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from pathlib import Path
pointfit_dir=Path(__file__).resolve().parent
src=json.load(gzip.open(pointfit_dir/'prior-8742-source.json.gz','rt'))
l=json.loads((pointfit_dir/'donor-world-layout.json').read_text());w=np.array([a['p'] for a in l['water']]);r=np.array([a['r'] for a in l['water']]);u=np.array([a['u'] for a in l['water']]);st=np.array([a['s'] for a in l['water']]);m=np.array(l['camera']['matrixWorld']).reshape(4,4).T;f=768/math.tan(math.radians(31))
mats={cam['name']:np.array(cam['matrixWorld']).reshape(4,4).T for cam in src['cameras']};print(list(mats))
trees={}
for obj in src['meshes']:
 a=np.frombuffer(base64.b64decode(obj['attributes']['position']['data']),dtype='<f4').reshape(-1,3); idx=np.frombuffer(base64.b64decode(obj['index']['data']),dtype='<u4').reshape(-1,3) if obj['index'] else np.arange(len(a)).reshape(-1,3)
 trees[obj['name']]=BVHTree.FromPolygons(a,idx,all_triangles=True)
def ray(cam,x,y):
 mat=mats[cam];d=mat[:3,0]*(x-432)/f+mat[:3,1]*(768-y)/f-mat[:3,2];return Vector(mat[:3,3]),Vector(d).normalized()
def local(p):
 j=np.argmin(np.linalg.norm(w-p,axis=1));dp=p-w[j];return (float(st[j]),float(dp@r[j]),float(dp@u[j]))
def survey(a,x,y,z):return a@np.array([(x-432)*z/f,(768-y)*z/f,-z,1])
def projection(a,p):
 pt=np.linalg.inv(a)@p;return (432-f*pt[0]/pt[2],768+f*pt[1]/pt[2])
samples=[]
for x in range(140,421,10):
 for y in range(440,761,2):
  o,d=ray('Camera_Forward_3',x,y);p,n,i,depth=trees['m06_arched_water'].ray_cast(o,d)
  if p is not None and depth<19:
   s,lat,height=local(np.array(p));samples.append(dict(x=x,sky=y,d=round(depth,2),s=round(s,2),lat=round(lat,2),h=round(height,2)));break
print('SKY',samples)
origPts=[(250,578,17),(316,588,19),(364,577,20.9),(402,575,22.6),(457,588,24.5),(510,610,26.7),(558,638,28.7)]
res=[]
for x,y,z0 in origPts:
 options=[]
 for d in np.arange(z0-.3,60,.2):
  pt=survey(m,x,y,d);sx,sy=projection(mats['Camera_Forward_3'],pt);row=min(samples,key=lambda w:abs(w['x']-sx));s,lat,h=local(pt[:3]);options.append(dict(depth=round(d,1),proposed_x=round(sx,1),proposed_y=round(sy,1),foreground=row['sky'],gap=round(row['sky']-sy,1),station=round(s,2),lat=round(lat,2),height=round(h,2)))
 res.append(dict(native=[x,y],existing=options[0],under6width23rise=next((a for a in reversed(options) if a['lat']>-6 and a['height']<2.3),None),for24pixelpocket=next((a for a in options if a['gap']>=24),None)))
print('FIT',json.dumps(res))
(pointfit_dir/'constraints.json').write_text(json.dumps(dict(nearWaterAtPlus3=samples,fit=res),indent=2)+'\n')
curve=[(-250,1130,1150,6.1),(-140,820,860,7.7),(-50,658,790,8.65),(0,589,720,9.7),(84,530,650,12.0),(172,493,604,16.3),(250,482,578,20.5),(316,484,588,24.2),(364,493,577,24.9),(402,503,575,25.3),(457,523,588,25.8),(510,550,610,26.9),(558,582,638,28.7),(606,614,663,30.0),(655,650,685,31.8),(682,676,699,32.8),(701,701,720,33.4),(715,737,750,33.9),(733,778,802,34.5),(755,830,848,35.3),(780,875,886,36.9),(804,899,905,38.5),(821,908,911,39.1)]
seat=[]
for x,top,inner,z in curve:
 pt=survey(m,x,inner,z-min(.58,(inner-top)*.007));center=survey(m,x,(inner+top)/2,z)
 ix=np.argmin(np.linalg.norm(w-pt[:3],axis=1));sec=l['water'][ix]; pd=Vector(w[ix]-(sec['leftWidth']-.22)*r[ix])
 tri,n,ind,e=trees['m06_arched_water'].ray_cast(pd+Vector((0,3,0)),Vector((0,-1,0)))
 base=list(tri if tri else pd);seat.append([round(float(a),3) for a in base])
print('SEATS',seat);(pointfit_dir/'survey-and-seats.json').write_text(json.dumps(dict(curve=curve,seat=seat),indent=2)+'\n')
