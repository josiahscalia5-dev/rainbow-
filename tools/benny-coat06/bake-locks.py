"""Recover a small tile of overlapping pink locks from the authoritative original Screen 06."""
import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

APPROVED_SHA = "3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe"
TILE = 96
MARGIN = 18

def rgb(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float64) / 255

def srgb_to_linear(value):
    return np.where(value <= .04045, value / 12.92, ((value + .055) / 1.055) ** 2.4)

def periodic_swatch(image, x, y):
    # Blend overlapping margins while keeping individual interior tufts intact.
    t = np.arange(TILE)
    yy, xx = np.meshgrid(t, t, indexing="ij")
    blend = np.clip((t - (TILE - MARGIN)) / MARGIN, 0, 1)
    blend = (blend * blend * (3 - 2 * blend))
    result = np.zeros((TILE,TILE,3))
    for dx, wx in [(0,1-blend),(-TILE,blend)]:
        for dy, wy in [(0,1-blend),(-TILE,blend)]:
            # Periodic margins are only sampled where the weight is nonzero.
            result += image[y+yy+dy,x+xx+dx] * (wy[:,None] * wx[None,:])[:,:,None]
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("original","measurements","tile","report"):
        parser.add_argument(name, type=Path)
    parser.add_argument('--refinement', type=Path, help='Optional measured appearance feedback from the first live coat')
    args=parser.parse_args()
    assert hashlib.sha256(args.original.read_bytes()).hexdigest()==APPROVED_SHA
    source=rgb(args.original)
    locks=periodic_swatch(source,380,1043)
    lum=locks @ np.array([.2126,.7152,.0722])
    detail=lum-gaussian_filter(lum,6,mode='wrap')
    p5,p95=np.percentile(detail,[5,95])
    relief=np.clip((detail-p5)/(p95-p5),0,1)
    # Subtract broad lighting baked into the swatch. The real curved body's
    # material and lights reproduce the large-scale shading during a turn.
    linear=srgb_to_linear(locks)
    average=np.maximum(0.009,gaussian_filter(linear,(11,11,0),mode='wrap'))
    ratios=np.clip(linear/average,.52,1.85)
    ref=srgb_to_linear(source[1084:1118,391:456])
    low=srgb_to_linear(rgb(args.measurements/'cal-0.1.png')[1084:1118,391:456])
    high=srgb_to_linear(rgb(args.measurements/'cal-0.38.png')[1084:1118,391:456])
    slope=np.maximum(.025,(high-low)/.28)
    albedo=np.clip(np.median(.10+(ref-low)/slope,axis=(0,1)),.008,.97)
    physical_rgb=np.clip(ratios*albedo[None,None,:],0,1)
    image=np.dstack([physical_rgb,relief])
    args.tile.parent.mkdir(parents=True,exist_ok=True)
    quantized=np.uint8(np.rint(image*255))
    if args.refinement:
        feedback=json.loads(args.refinement.read_text())
        quantized[:,:,:3]=np.rint(np.clip(quantized[:,:,:3].astype(float)*feedback['linearFeedback'],0,255)).astype('uint8')
        quantized[:,:,3]=np.rint(gaussian_filter(quantized[:,:,3].astype(float),feedback['heightBlurInTileTexels'],mode='wrap')).astype('uint8')
    Image.fromarray(quantized,'RGBA').save(args.tile)
    report={"originalSHA256":APPROVED_SHA,"sourceSize":[864,1536],"sourcePatchXYWH":[380,1043,TILE,TILE],
            "calibrationSWATCHXYXY":[391,1084,456,1118],"calibrationLinearGray":[.10,.38],
            "localMedianLinearAlbedo":albedo.tolist(),"bilinearCalibrationModel":"Per-channel linear approximation between the two retained-light photographs. Includes postprocessing.",
            "relief":"5th to 95th percentile of local luminance contrast after subtracting a 6-pixel Gaussian. Existing 20 real fur shells determine depth.",
            "textureCoordinates":"12 material tiles per body circumference, 5.2 per pi radians of latitude. Hidden flanks continue the same photographed lock pattern."}
    args.report.write_text(json.dumps(report,indent=2)+'\n')
    print("Linear body coat albedo",albedo.round(3).tolist())

if __name__=="__main__":
    main()
