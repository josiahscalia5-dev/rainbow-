"""Build seamless yarn and fur detail from three documented swatches of the Screen 06 original."""
from pathlib import Path
import argparse,json,hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument("original",type=Path);parser.add_argument("output",type=Path)
args=parser.parse_args()
raw=args.original.read_bytes()
if hashlib.sha256(raw).hexdigest()!='3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe':raise ValueError('Screen 06 original does not match its reference manifest.')
source=Image.open(args.original).convert('RGB')
patches={'body':[370,1056,450,1136],'knit':[378,980,442,1012],'pom':[391,780,447,836]}
planes=[]
for name,box in patches.items():
    a=np.asarray(source.crop(box),dtype=float)
    l=np.log(np.maximum(a@[.2126,.7152,.0722],12.0))
    # Remove broad lighting. The tile carries the photographed fiber across the curved material.
    detail=l-gaussian_filter(l,5.0 if name=='knit' else 6.5)
    h,w=detail.shape
    boundary=np.zeros_like(detail)
    boundary[0,:]=detail[-1,:]-detail[0,:];boundary[-1,:]=detail[0,:]-detail[-1,:]
    boundary[:,0]+=detail[:,-1]-detail[:,0];boundary[:,-1]+=detail[:,0]-detail[:,-1]
    px=2*np.pi*np.arange(w)/w;py=2*np.pi*np.arange(h)/h
    denom=2*np.cos(px)[None,:]+2*np.cos(py)[:,None]-4;denom[0,0]=1
    smooth=np.fft.fft2(boundary)/denom;smooth[0,0]=0
    tile=detail-np.fft.ifft2(smooth).real
    ampl=max(np.percentile(np.abs(tile),96),1e-4)
    tile=np.clip(.5+.44*tile/ampl,0,1)
    planes.append(np.array(Image.fromarray(np.rint(255*tile).astype('uint8')).resize((128,128),Image.Resampling.LANCZOS)))
args.output.parent.mkdir(exist_ok=True,parents=True);Image.fromarray(np.stack(planes,axis=2)).save(args.output,optimize=True)
print(json.dumps({'source':str(args.original.name),'approvedSHA256':hashlib.sha256(raw).hexdigest(),'sourceBoxesXYXY':patches,'outputSize':[128,128],'textureSHA256':hashlib.sha256(args.output.read_bytes()).hexdigest(),'channels':['body fur local contrast','knitted cuff local contrast','pom yarn local contrast']},indent=2))
