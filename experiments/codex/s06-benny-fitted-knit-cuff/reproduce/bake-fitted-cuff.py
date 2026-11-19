"""Bake the original rolled cuff in circumferential UV coordinates under measured game lighting."""
import argparse, hashlib, json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter

ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('original',type=Path)
ap.add_argument('calibrations',type=Path)
ap.add_argument('output',type=Path)
args=ap.parse_args()
digest=hashlib.sha256(args.original.read_bytes()).hexdigest()
if digest!='3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe':
    raise ValueError('Unexpected original artwork')
def rgb(path): return np.asarray(Image.open(path).convert('RGB'),float)/255
src=rgb(args.original); caldir=args.calibrations
cal=json.loads((caldir/'cuff-calibration.json').read_text()); sat=cal['uniforms']['uSat'];contrast=1.15
def display_radiance(color,x,y):
    horizontal=(x/864-.5)*.75;vertical=y/1536-.5
    position=np.clip((np.sqrt(horizontal**2+vertical**2)-.25)/.50,0,1)
    vignette=1-cal['uniforms']['uVig']*position*position*(3-2*position)
    c=(color/vignette[...,None]-.5)/contrast+.5
    luminance=c@np.array([.2126,.7152,.0722])
    c=np.clip(luminance[...,None]+(c-luminance[...,None])/sat,0,.975)
    c=np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
    peak=c.max(axis=-1)
    high=peak>=.76
    restored=np.where(high,.0576/np.maximum(1-peak,.001)-.24+.76,peak)
    bleach=1-1/(.15*(restored-peak)+1)
    c=(c-bleach[...,None]*peak[...,None])/(1-bleach[...,None])
    c*=np.divide(restored,peak,out=np.ones_like(restored),where=peak>0)[...,None]
    low=c.min(axis=-1); offset=np.where(low>=.04,.04,np.sqrt(np.maximum(low,0))/2.5-low)
    return (c+offset[...,None])/cal['exposure']
w,h=192,64
center_x,radius=407.,156.
repeats=7
angle_span=2*np.pi/repeats
theta=(np.arange(w)+.5)/w*angle_span-angle_span/2
v=(np.arange(h)+.5)/h
anchors=np.array([[300,950,1002],[324,957,1011],[350,964,1017],[380,968.5,1022],[408,970.4,1025.8],[438,970.3,1025],[461,968.8,1023.3],[480,966.5,1020.2],[492,965,1018]],float)
def sample(angles):
    xs=center_x+radius*np.sin(angles)
    top=np.interp(xs,anchors[:,0],anchors[:,1])+4
    bottom=np.interp(xs,anchors[:,0],anchors[:,2])-4
    ys=top[None,:]+v[:,None]*(bottom-top)[None,:]
    xx=np.broadcast_to(xs,ys.shape)
    values=np.stack([map_coordinates(src[:,:,c],[ys,xx],order=1,mode='nearest') for c in range(3)],axis=-1)
    return display_radiance(values,xx,ys)
base=sample(theta)
# The circumference closes through an eight-texel overlap of the same photographed ribbed fabric.
distance=np.minimum(np.arange(w)+.5,w-np.arange(w)-.5)
fade=.5*np.clip(1-distance/10.,0,1)**2
neighbors=sample(np.where(theta<0,theta+angle_span,theta-angle_span))
base=base*(1-fade[None,:,None])+neighbors*fade[None,:,None]
ys,xs=np.mgrid[1040:1065,349:468]
calibrated=[]
for k in [.08,.28]:
    img=rgb(caldir/('calibration-'+str(k)+'.png'))
    calibrated.append(np.median(display_radiance(img[ys,xs],xs,ys),axis=(0,1)))
light=(calibrated[1]-calibrated[0])/.20
spec=calibrated[0]-light*.08
if np.min(light)<.2: raise ValueError('Cuff light solve failed')
# Remove slow angular lighting from the photograph. Leave the yarn ridges and the violet color intact.
smooth=gaussian_filter(base,sigma=(10,20,0),mode=('nearest','wrap','nearest'))
target_median=np.median(smooth,axis=(0,1))
corrected=base/(np.maximum(smooth,.02)/np.maximum(target_median,.02))**.65
linear=np.clip((corrected-spec)/light,.003,1.0)
srgb=np.where(linear<=.0031308,12.92*linear,1.055*linear**(1/2.4)-.055)
args.output.parent.mkdir(parents=True,exist_ok=True)
Image.fromarray(np.rint(255*srgb).astype('uint8')).save(args.output,optimize=True)
print(json.dumps({'sourceSHA256':digest,'mode':'Original Screen 06 cuff, angular unwrap and live two-point material calibration','nativeLandmarksXYtopBottom':anchors.tolist(),'nativeCuffCenterX':center_x,'outerRadiusPx':radius,'circumferentialRepeats':repeats,'atlasSize':[w,h],'lightingLinearRGB':light.tolist(),'specularApproxLinearRGB':spec.tolist(),'calibrationSelectionXYXY':[349,1040,468,1065],'sourceAngularSpan':angle_span,'sha256':hashlib.sha256(args.output.read_bytes()).hexdigest()},indent=2))
