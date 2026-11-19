"""Separate ring, panel and foam paint so each stays on its corresponding 3D surface."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, binary_dilation, gaussian_filter
base,dest=map(Path,sys.argv[1:3]);source=np.array(Image.open(base/'plate06_hybrid.png').convert('RGB'),np.float32)/255;mask=np.array(Image.open(base/'mask06.png').convert('RGB'),np.float32)/255;r,g,b=source.transpose(2,0,1);wall=mask[:,:,1]>.48;gold=(r>b+.09)&(g>b+.025)&(r>.49)&wall;gold=binary_closing(gold,iterations=2);gold=binary_dilation(gold,iterations=3)&wall;foam=(b>.67)&(g>.59)&(r>.58)&(abs(r-b)<.28)&(abs(g-r)<.24)&(~wall);uncertain=mask[:,:,0];channels=np.stack([gaussian_filter(gold.astype(float),1.1),gaussian_filter(foam.astype(float),.9),uncertain],axis=-1);Image.fromarray(np.rint(channels*255).astype('uint8')).save(dest,optimize=True)
