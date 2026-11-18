"""Continue the hidden washer wall at the third paddle using the same bay of the approved artwork."""
from pathlib import Path
import json
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_dilation, map_coordinates, gaussian_filter
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve


def painter(source, layout_path, mask_path, output):
    art=np.asarray(Image.open(source).convert('RGB'),dtype=np.float64)
    mask=np.asarray(Image.open(mask_path).convert('L'),dtype=float)/255
    x0,y0=336,382
    g=json.loads(Path(layout_path).read_text())
    cam=g['camera']
    world_axes=np.array([g['X'],g['U'],-np.array(g['D'])])
    eye=world_axes@(np.array(cam['pos'])-g['water'])
    view=np.array(cam['matrixWorld']).reshape(4,4).T[:3,:3]
    focal=np.tan(np.radians(cam['fov']/2)); h,w=mask.shape
    Y,X=np.mgrid[:h,:w];U=x0+X+.5;V=y0+Y+.5
    rays=np.stack([(U/432-1)*focal*864/1536,(1-V/768)*focal,-np.ones_like(U)],axis=-1)@view.T@world_axes.T
    cy=np.array([g['tube']['ax'],g['tube']['h']]);R=g['tube']['r']
    b=2*(rays[:,:,:2]@(eye[:2]-cy));a=(rays[:,:,:2]**2).sum(axis=2);c=((eye[:2]-cy)**2).sum()-R**2
    t=(-b+np.sqrt(b*b-4*a*c))/(2*a)
    p=eye+rays*t[:,:,None];theta=np.arctan2(p[:,:,1]-cy[1],p[:,:,0]-cy[0])
    observed=art[y0:y0+h,x0:x0+w]
    interior=mask>.020
    # Keep the unknown region away from the crop edge for a true measured boundary.
    interior[[0,-1],:]=False;interior[:,[0,-1]]=False
    border=binary_dilation(interior,iterations=6)&~interior
    full_mask=np.zeros(art.shape[:2],np.uint8)
    full_mask[y0:y0+h,x0:x0+w]=(mask>.06).astype(np.uint8)
    picks=[]
    def sample(angle):
        q=p.copy();q[:,:,0]=cy[0]+R*np.cos(theta+angle);q[:,:,1]=cy[1]+R*np.sin(theta+angle)
        cp=(q-eye)@world_axes@view
        d=-cp[:,:,2]
        x=432*(1+cp[:,:,0]/d/focal/(864/1536))-.5;y=768*(1-cp[:,:,1]/d/focal)-.5
        rgb=np.stack([map_coordinates(channel,[y,x],order=1,mode='nearest') for channel in art.transpose(2,0,1)],axis=-1)
        contaminated=map_coordinates(full_mask,[y,x],order=0,mode='constant',cval=1)
        return rgb,contaminated
    for ang in np.r_[np.linspace(-1.65,-.12,160),np.linspace(.12,1.65,160)]:
        guess,contam=sample(ang)
        if contam[interior].mean()>.015:continue
        error=np.abs(guess[border]-observed[border]).mean()
        picks.append((float(error),float(ang)))
    if not picks:raise RuntimeError('No unobstructed source bay')
    cost,angle=min(picks);guess,_=sample(angle)
    # Fit the neighbouring wall to the photographed boundary while retaining its own perforations and reflections.
    yy,xx=np.where(interior);index=np.full((h,w),-1,int);index[yy,xx]=np.arange(len(xx))
    ri=[];ci=[];coef=[];rhs=np.zeros((len(xx),3))
    for row,(y,x) in enumerate(zip(yy,xx)):
        ri.append(row);ci.append(row);coef.append(4.0)
        for dy,dx in ((0,-1),(0,1),(-1,0),(1,0)):
            ny,nx=y+dy,x+dx
            rhs[row]+=guess[y,x]-guess[ny,nx]
            if interior[ny,nx]:
                ri.append(row);ci.append(index[ny,nx]);coef.append(-1.0)
            else:rhs[row]+=observed[ny,nx]
    lap=coo_matrix((coef,(ri,ci)),shape=(len(xx),len(xx))).tocsr()
    patch=observed.copy();patch[yy,xx]=np.clip(spsolve(lap,rhs),0,255)
    img=Image.fromarray(patch.round().astype('uint8')).convert('RGBA')
    img.putalpha(Image.fromarray(np.rint(mask*255).astype('uint8')))
    img.save(output)
    print(json.dumps({'nativeCropXYXY':[336,382,444,458],'source':'Same cylindrical bay in the approved image',
        'chosenAngularOffsetRadians':angle,'meanBoundaryChannelErrorBeforeGradientFit':cost,'unknownWallPixelsSolved':len(xx),
        'wallRadius':R,'boundary':'Four-neighbour gradient continuation with the original photographic boundary fixed.'},indent=2))


if __name__=='__main__':
    painter(*sys.argv[1:])
