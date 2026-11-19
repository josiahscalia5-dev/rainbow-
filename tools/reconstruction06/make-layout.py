"""Build a shared world-space layout for the calibrated crest, drum, rings, paddles and shore."""
import json,sys,math
from pathlib import Path
import numpy as np
from scipy.interpolate import PchipInterpolator, CubicHermiteSpline
from scipy.ndimage import maximum_filter1d, gaussian_filter1d
from scipy.optimize import brentq

coursefile,fitfile,projector,destination=map(Path,sys.argv[1:5]);c=json.loads(coursefile.read_text());fit=json.loads(fitfile.read_text());l=json.loads(projector.read_text());m=np.array(l['camera']['matrixWorld']).reshape(4,4).T;rot=m[:3,:3];eye=m[:3,3];f=768/math.tan(math.radians(l['camera']['fov']/2));heads=c['rows'];ss=np.array([a['s']-c['inlet'] for a in heads]);route=np.array([a['p'] for a in heads]);lateral=np.array([a['r'] for a in heads]);ups=np.array([a['u'] for a in heads]);end=c['exit']-c['inlet'];keys=np.array(fit['stationFromInlet'])
def unit(v):return v/np.maximum(1e-12,np.linalg.norm(v,axis=-1,keepdims=True))
def sample(s,a):return np.array([np.interp(s,ss,col) for col in a.T]).T
def backproject(x,y,d):return eye+rot@np.array([(x-432)*d/f,(768-y)*d/f,-d])
def pix(p):
 v=(p-eye)@rot;return np.stack((432-f*v[...,0]/v[...,2],768+f*v[...,1]/v[...,2]),axis=-1)
def dump(a):return np.asarray(a).round(6).tolist()
# The fully visible concentric lips have different centres in the artwork. The far return turns out of sight.
# The extra wide inlet and the unseen outlet enclose the actual banked gameplay route.
zkeys=np.array([-24.,-8.,7.,19.,34.,49.,65.,80.,94.,106.,120.,139.,161.,182.]);xp=[440,486,520,551,594,635,660,681,690,696,738,1088,1410,1775];yp=[615,610,600,591,578,577,615,650,661,675,706,780,774,755]
anchor=np.stack([backproject(x,y,z) for x,y,z in zip(xp,yp,zkeys)]);axis=PchipInterpolator(zkeys,anchor,axis=0);ds=np.arange(-23.,182.01,.4);v=unit(axis.derivative()(ds));rr=unit(np.cross(v,[0,1,0]));uu=unit(np.cross(rr,v));cent=axis(ds);distance=np.r_[0.,np.cumsum(np.linalg.norm(np.diff(cent,axis=0),axis=1))]
# Protect all playable positions, including the wider shoulder and camera near the entrance.
baseRadius=np.interp(ds,[-24,18,38,55,67,79,91,103,116,140,182],[14.8,15,15,14.3,12.1,9.5,7.3,5.8,5.4,6.2,6.5]);required=np.zeros(len(ds));
for j in np.flatnonzero((ss>=-10)&(ss<=end+3)):
 for offset in [-3.85,0,3.85]:
  p=route[j]+lateral[j]*offset; closest=np.argmin(np.linalg.norm(cent-p,axis=1));radial=p-cent[closest];required[closest]=max(required[closest],np.linalg.norm(radial)+.65)
required=maximum_filter1d(required,size=17,mode='nearest');radius=np.maximum(baseRadius,gaussian_filter1d(required,7));radius=np.maximum(radius,required);radius=gaussian_filter1d(radius,3.0)
# Keep the washer section a gradual machined taper even where the playable channel needs extra space.
for i in range(1,len(radius)):radius[i]=max(radius[i],radius[i-1]-.26*(ds[i]-ds[i-1]))
for i in range(len(radius)-2,-1,-1):radius[i]=max(radius[i],radius[i+1]-.26*(ds[i+1]-ds[i]))
radius=gaussian_filter1d(radius,3.4)
def shell(z):
 p=axis(z);t=unit(axis.derivative()(z));r=unit(np.cross(t,[0,1,0]));u=unit(np.cross(r,t));return p,t,r,u,float(np.interp(z,ds,radius)),float(np.interp(z,ds,distance))
# Four ring lips are calibrated to the visible crown heights. Earlier and hidden rings inherit their real section frames.
def top(z):
 p,t,r,u,rad,arc=shell(z);ang=np.linspace(0,2*np.pi,192);points=p+rad*(r*np.cos(ang)[:,None]+u*np.sin(ang)[:,None]);return float(pix(points)[:,1].min())
ringDepth=[-9.,6.5,21.];landmarks=[]
for target,lo,hi in [(62,26.,53.),(240,40.,71.),(403,54.,84.),(510,61.,98.),(580,69.,108.),(628,77.,116.),(657,83.,132.)]:
 grid=np.arange(lo,hi+.1,.1);zt=next((brentq(lambda z:top(z)-target,x,y) for x,y in zip(grid,grid[1:]) if (top(x)-target)*(top(y)-target)<=0), min(grid,key=lambda z:abs(top(z)-target)));ringDepth.append(round(float(zt),4));landmarks.append([target,round(float(zt),3),round(top(zt),2)])
for z in [128.,145.,165.]:
 if min(abs(z-other) for other in ringDepth)>8.:ringDepth.append(z)
ringDepth=sorted(set(ringDepth));assert np.diff(ringDepth).min()>3.0;rings=[]
for i,z in enumerate(ringDepth):
 p,t,r,u,rad,d=shell(z); h=min(1.04,.080*rad);rings.append(dict(z=z,p=dump(p),t=dump(t),r=dump(r),u=dump(u),radius=round(rad,5),halfWidth=round(h,5),depth=round(rad*.039,5),distance=round(d,5)))
# Use the original course through the complete playable stage. Beyond its exit the pictured ribbon returns
# toward the distant ring opening. Those off-course sections are visual overlap before the next stage takes over.
s0=-13.;s1=end+4;grid=np.arange(s0,s1+.01,.42);grid=np.r_[grid,s1] if grid[-1]<s1-.02 else grid
p0=sample(s1,route);tan=unit(sample(s1+.18,route)-sample(s1-.18,route));a,tanA,rA,uA,rad,_=shell(89.);p1=a-uA*(rad*.915)+rA*rad*.21;pa,ta,ra,ua,rd,_=shell(132.);p2=pa-ua*rd*.91+ra*rd*.23;length1=max(34.,np.linalg.norm(p1-p0)*1.12);length2=np.linalg.norm(p2-p1)*1.09;extension=CubicHermiteSpline([0.,length1,length1+length2],[p0,p1,p2],[tan,tanA,ta],axis=0)
extra=np.arange(.45,length1+length2,.5);allstations=np.r_[grid,s1+extra];positions=np.concatenate([sample(grid,route),extension(extra)]);rt=unit(np.gradient(positions,axis=0));rx=unit(np.cross(rt,[0,1,0]));up=unit(np.cross(rx,rt));nearRight=unit(sample(grid,lateral));nearUp=unit(sample(grid,ups));rx[:len(grid)]=nearRight;up[:len(grid)]=nearUp
for i,travel in enumerate(extra):
 blend=min(travel/9.,1);rx[len(grid)+i]=unit((1-blend)*nearRight[-1]+blend*rx[len(grid)+i]);up[len(grid)+i]=unit(np.cross(rx[len(grid)+i],rt[len(grid)+i]))
widths={}
for name in ['leftWidth','rightWidth','leftRise','rightRise']:
 original=np.array(fit[name]);cross=PchipInterpolator(keys,original);vals=cross(np.clip(grid,keys[0],keys[-1]));far=np.interp(extra,[0,length1,length1+length2],[vals[-1],1.48 if 'Width' in name else .13,1.15 if 'Width' in name else .11]);widths[name]=np.r_[vals,far]
rows=[]
for i,st in enumerate(allstations):rows.append({'s':round(float(st),5),'p':dump(positions[i]),'r':dump(rx[i]),'u':dump(up[i]),**{k:round(float(v[i]),5) for k,v in widths.items()}})
# Cast through the two approved upper-left paddles and attach their backs to the physical wall.
paddles=[]
for x,y,half in [(286,244,1.38),(156,399,1.48)]:
 ray=unit(backproject(x,y,1)-eye)
 def signed(travel):
  pp=eye+ray*travel;i=np.argmin(np.linalg.norm(cent-pp,axis=1));return np.linalg.norm(pp-cent[i])-radius[i]
 tt=brentq(signed,.01,92.);point=eye+ray*tt;i=np.argmin(np.linalg.norm(cent-point,axis=1));p,t,r,u,rad,d=shell(ds[i]);nr=unit(point-p-t*np.dot(point-p,t));paddles.append(dict(p=dump(p+nr*(rad-.16)),normal=dump(nr),t=dump(t),halfWidth=half,anchorPx=[x,y]))
# Each photographed paddle has a distinct outline. Rays intersect the physical wall and form a closed,
# beveled solid between the seated back and the visible painted front. The cross-sections stay in world space.
profiles=[[(211,229),(224,207),(242,181),(257,183),(279,191),(309,207),(340,228),(353,248),(362,277),(361,288),(354,295),(338,298),(314,290),(282,278),(243,258),(216,241)],[(72,402),(82,372),(89,352),(101,347),(125,349),(150,358),(185,371),(216,386),(229,399),(239,422),(241,433),(236,443),(224,449),(205,451),(169,442),(122,427),(88,416),(73,409)]]
for paddle,poly in zip(paddles,profiles):
 front=[];back=[]
 for px,py in poly:
  ray=unit(backproject(px,py,1)-eye)
  def residual(travel):
   pp=eye+ray*travel;i=np.argmin(np.linalg.norm(cent-pp,axis=1));return np.linalg.norm(pp-cent[i])-radius[i]
  wallHit=brentq(residual,.02,105.);back.append(dump(eye+ray*(wallHit+.025)));front.append(dump(eye+ray*(wallHit-.63)))
 paddle['front']=front;paddle['back']=back
# Additional left-wall lifters belong to the unseen reach and remain fixed to named drum bays.
for z,a in [(62.,2.61),(83.,2.26)]:
 p,t,r,u,rad,d=shell(z);n=r*np.cos(a)+u*np.sin(a);paddles.append(dict(p=dump(p+n*(rad-.22)),normal=dump(n),t=dump(t),halfWidth=1.22,anchorPx=None))
sections=[{'p':dump(p),'r':dump(r),'u':dump(u),'radius':round(float(rad),5),'distance':round(float(d),5)} for p,r,u,rad,d in zip(cent,rr,uu,radius,distance)]
result={'stage':[c['inlet'],c['exit']],'camera':l['camera'],'water':rows,'drum':sections,'rings':rings,'paddles':paddles,'ringCrownFits':landmarks,'waterFit':fit['fitMetrics'],'provenance':'All coordinates in the original Three.js game, +Y up. The source camera and playable centreline are retained. Hidden drum radii, return bend and foam groups are interpretations.'};destination.write_text(json.dumps(result,separators=(',',':'))+'\n');print('rings',[(r['z'],r['radius']) for r in rings],'crown fits',landmarks,'course extent',end)
