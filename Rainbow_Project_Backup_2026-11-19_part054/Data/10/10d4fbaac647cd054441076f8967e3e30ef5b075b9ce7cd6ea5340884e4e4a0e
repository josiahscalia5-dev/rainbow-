"""Sample the first visible inner gold bay from the original artwork onto its local material axes."""
import argparse
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates, gaussian_filter1d

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument("artwork",type=Path);parser.add_argument("fit",type=Path);parser.add_argument("output",type=Path)
args=parser.parse_args()
raw=args.artwork.read_bytes()
parser_sha = "1b0ccdacbb4c97e9ea67c4910080668ebaf6a6c326249ef40340bc1472676193"
if hashlib.sha256(raw).hexdigest() != parser_sha:
    raise ValueError("The input differs from the verified original Screen 04 artwork.")
src=np.array(Image.open(args.artwork).convert("RGB"),dtype=float)
assert src.shape==(1536,864,3)
fit=json.loads(args.fit.read_text());first,second=np.array(fit["groove_circles"][:2],dtype=float)
width,height=768,160
angle=((np.arange(width)+.5)/width-.5)*2*np.pi
s=(np.arange(height)+.5)/height
circle=first[None,:]+(second-first)[None,:]*s[:,None]
x=circle[:,0:1]+circle[:,2:3]*np.sin(angle)[None,:]
y=circle[:,1:2]-circle[:,2:3]*np.cos(angle)[None,:]
texture=np.stack([map_coordinates(src[:,:,i],[y,x],order=1,mode='nearest') for i in range(3)],axis=2)
# The downstream side/bottom of the entrance is occluded by the original water.
# The game applies this atlas only to the unobscured sector with a smooth angular border.
valid=np.abs(angle)<1.54
lf=np.median(np.mean(texture[:,valid],axis=2),axis=1)
# Locate the bright shoulder within the late part of the physical groove-to-groove period.
hi=np.flatnonzero((s>.55)&(s<.92))
crest=float(s[hi[np.argmax(gaussian_filter1d(lf,2)[hi])]])
img=Image.fromarray(np.rint(np.clip(texture,0,255)).astype('uint8'),'RGB')
args.output.parent.mkdir(parents=True,exist_ok=True);img.save(args.output,optimize=True)
print(json.dumps({'sha256':hashlib.sha256(raw).hexdigest(),'atlas':[width,height],
 'physicalBayFit':fit["groove_circles"][:2],'trustedAnglesRadians':[-1.54,1.54],
 'brightShoulderPhase':crest,'rowsNearToFar':True,'archiveSHA256':hashlib.sha256(args.output.read_bytes()).hexdigest()},indent=2))
