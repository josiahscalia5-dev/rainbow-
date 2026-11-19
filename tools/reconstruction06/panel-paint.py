"""Rectify a clean patch of the artist's perforated metal on the calibrated drum."""
import json,sys,numpy as np,math
from pathlib import Path
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter
lfile,base,out,record=map(Path,sys.argv[1:5]);j=json.loads(lfile.read_text());ss=j['drum'];p=np.array([s['p'] for s in ss]);up=np.array([s['u'] for s in ss]);r=np.array([s['r'] for s in ss]);rad=np.array([s['radius'] for s in ss]);st=np.array([s['distance'] for s in ss]);mw=np.array(j['camera']['matrixWorld']).reshape(4,4).T;foc=768/math.tan(math.radians(31));im=np.asarray(Image.open(base/'plate06_hybrid.png').convert('RGB'),dtype=float);labels=np.asarray(Image.open(out.parent/'art_materials.png'));wall=np.asarray(Image.open(base/'mask06.png'))[:,:,1];
def pos(theta,d):
 c=np.stack([np.interp(d,st,a) for a in p.T],-1);rt=np.stack([np.interp(d,st,a) for a in r.T],-1);ut=np.stack([np.interp(d,st,a) for a in up.T],-1);radius=np.interp(d,st,rad);q=c+radius[...,None]*(rt*np.cos(theta)[...,None]+ut*np.sin(theta)[...,None]);cam=(q-mw[:3,3])@mw[:3,:3];return 432-foc*cam[...,0]/cam[...,2],768+foc*cam[...,1]/cam[...,2],-cam[...,2]
aw,depthWidth=4.00,2.12

def grid(th,d,nx,ny):
 yy,xx=np.mgrid[0:ny,0:nx];a=th+(xx/(nx-1)-.5)*aw/np.interp(d,st,rad);ds=d+(yy/(ny-1)-.5)*depthWidth;return pos(a,ds)
chosen=[]
for d in np.arange(40,105,1.4):
 for th in np.arange(-.12,3.39,.065):
  x,y,z=grid(th,d,20,13);X=np.rint(x).astype(int);Y=np.rint(y).astype(int)
  if X.min()<4 or X.max()>859 or Y.min()<185 or Y.max()>918 or z.min()<5:continue
  good=(wall[Y,X]>220)&(labels[Y,X,0]<18)&(labels[Y,X,2]<80)
  if good.mean()<.985:continue
  rgb=im[Y,X];lum=rgb.mean(-1);size=np.hypot(x[6,-1]-x[6,0],y[6,-1]-y[6,0])*np.hypot(x[-1,10]-x[0,10],y[-1,10]-y[0,10]);quality=np.std(lum)*min(size,24000)**.45*(1-abs(np.mean(lum<90)-.18));chosen.append((quality,th,d,int(X.min()),int(Y.min()),int(X.max()),int(Y.max())))
if not chosen:raise ValueError('No source wall patch with a clean silhouette.');
best=max(chosen);_,th,d,*box=best;x,y,z=grid(th,d,384,192);coords=np.stack((y,x));patch=np.stack([map_coordinates(im[:,:,ch],coords,order=1,mode='nearest') for ch in range(3)],axis=-1);Image.fromarray(np.uint8(np.clip(patch,0,255))).save(out,optimize=True);record.write_text(json.dumps({'source':'plate06_hybrid.png','regionXYXY':box,'physicalArcWidth':aw,'physicalLength':depthWidth,'angle':th,'station':d},indent=2)+'\n');print('Clean approved metal',box,round(th,3),round(d,2))
