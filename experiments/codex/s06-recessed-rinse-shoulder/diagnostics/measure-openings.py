"""Measure native full-frame color with the HUD and Benny included."""
from pathlib import Path
import argparse,hashlib,json
import numpy as np
from PIL import Image

def compare(ref,frame):
    image=np.asarray(Image.open(frame).convert("RGB"),dtype=np.int16)
    assert image.shape==ref.shape==(1536,864,3)
    d=np.abs(ref-image)
    return {'size':[864,1536],'rgbMae0to255':float(np.mean(d)),
            'pixelsWithMeanChannelErrorAtMost20':int(np.count_nonzero(d.sum(axis=2)<=60)),
            'totalPixels':int(d.shape[0]*d.shape[1]),'frameSHA256':hashlib.sha256(frame.read_bytes()).hexdigest()}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('reference',type=Path)
    p.add_argument('output',type=Path)
    p.add_argument('versions',nargs='+',help='version=path')
    args=p.parse_args()
    ref=np.asarray(Image.open(args.reference).convert('RGB'),dtype=np.int16)
    result={v:compare(ref,Path(f)) for v,f in [arg.split('=',1) for arg in args.versions]}
    args.output.write_text(json.dumps(result,indent=2)+'\n')
