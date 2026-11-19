from pathlib import Path
import json, argparse
import numpy as np
from PIL import Image
from scipy.signal import find_peaks
p=Path(__file__).parent
ap=argparse.ArgumentParser(description='Measure the photographed and playable cuff at their corresponding native positions.')
ap.add_argument('--original',type=Path,default=p/'verified-original-06.jpg')
ap.add_argument('--retained',type=Path,default=p.parent/'character-check/rendered/06/with-benny.png')
ap.add_argument('--new',type=Path,default=p/'qa-final/proof/06/NEW/opening.png')
ap.add_argument('--output',type=Path,default=p/'cuff-appearance.json')
args=ap.parse_args();original,game,new=args.original,args.retained,args.new
source_box=[349,982,468,1013]
game_box=[349,1040,468,1065]
def sample(f,box):
    image=np.asarray(Image.open(f).convert('RGB').crop(box),float)
    percent=np.percentile(image,[10,50,90],axis=(0,1))
    gray=image@np.array([.2126,.7152,.0722])
    profile=np.median(gray,axis=0)
    peaks,_=find_peaks(profile,distance=4,prominence=3)
    return {'rgbPercentiles10_50_90':np.round(percent,1).tolist(),'luminanceSpread90minus10':round(float(np.percentile(gray,90)-np.percentile(gray,10)),2),'observedRibPeaks':len(peaks),'medianRibPitchPixels':float(np.median(np.diff(peaks))) if len(peaks)>=3 else None,'pixelCount':int(gray.size)}
a=sample(original,source_box);b=sample(game,game_box);c=sample(new,game_box)
def median_distance(v):
    return float(np.abs(np.array(v['rgbPercentiles10_50_90'][1])-a['rgbPercentiles10_50_90'][1]).mean())
out={'method':'Native central visible cuff swatches, measured at the actual location of the cuff in each image. Percentiles describe palette and variation. Rib pitch is the median separation of prominent peaks of row-median luminance. These are component observations, not an opening-frame similarity score.','originalBoxXYXY':source_box,'retainedAndNewBoxXYXY':game_box,'original':a,'retained':b,'new':c,'retainedMedianColorDistance':median_distance(b),'newMedianColorDistance':median_distance(c)}
args.output.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
