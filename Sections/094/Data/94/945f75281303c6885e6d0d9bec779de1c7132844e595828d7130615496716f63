from pathlib import Path
import json
from PIL import Image
from scipy.ndimage import gaussian_filter, binary_dilation
import numpy as np
root=Path.cwd()
file=root/'games/06/references/06_crest_the_rinse_arch.png'
def rgb(p):return np.asarray(Image.open(p).convert('RGB'),dtype=np.int16)
cur,old,ref=rgb(root/'proof/06/NEW/opening.png'),rgb(root/'proof/06/BEFORE/opening.png'),rgb(file)
hide=rgb(root/'authoring/hidden-fur_body.png');part=(np.abs(old-hide).sum(2)>30)
# The analysis region is the physically visible retained body, common to both pictures.
central=np.zeros(part.shape,bool);central[1080:1176,327:535]=True;central &= part
def describe(a,m):
 d=np.mean(np.abs(a-ref),axis=-1)
 y=0.2126*a[:,:,0]+.7152*a[:,:,1]+.0722*a[:,:,2]
 fine=y-gaussian_filter(y,1.15)
 locks=gaussian_filter(y,1.15)-gaussian_filter(y,4)
 return {'meanAbsoluteRGB':float(d[m].mean()),'medianColor':[float(v) for v in np.median(a[m],axis=0)],'fineDetailRMS':float(np.sqrt(np.mean(fine[m]**2))),'tuftScaleRMS':float(np.sqrt(np.mean(locks[m]**2)))}
changed=np.any(cur!=old,axis=2)
results={'commonCentralSwatch':[327,1080,535,1176],'visibleCorePixels':int(central.sum()),'method':'Native photograph and two real game captures. RMS luminance bands use a 1.15 px and 4 px Gaussian. Mean color error is absolute RGB on a 0-255 scale. The independent mask hides only the actual body in the retained render.',
 'core':{name:describe(im,central) for name,im in [('original',ref),('retained',old),('experiment',cur)]},
 'visibleRetainedBody':{name:describe(im,part) for name,im in [('original',ref),('retained',old),('experiment',cur)]},
 'changedPixels':int(changed.sum()),'changedOutside2PixelBodyMargin':int((changed & ~binary_dilation(part,iterations=2)).sum()),'maximumOutsideMarginChannelDelta':int(abs(cur-old).max(axis=2)[~binary_dilation(part,iterations=2)].max())}
parts=json.loads((root/'authoring/native-parts.json').read_text())
results['nativeParts']=parts;results['originalHandRead']={'wholeXYXY':[202,733,636,1191],'wholeWidthHeight':[435,459],'hatXYXY':[261,733,574,1026],'pomApproximateXYXY':[326,731,499,878],'softBoundaryUncertaintyPixels':8}
folder=root/'repo/experiments/codex/s06-benny-layered-coat/character';folder.mkdir(parents=True,exist_ok=True)
for name,im in [('APPROVED',ref),('CLAUDIA_BEFORE',old),('CODEX_NEW',cur)]:
 native=Image.fromarray(np.uint8(im)).crop((154,658,704,1293));native.save(folder/(name+'.png'))
 little=Image.fromarray(np.uint8(im)).crop((180,705,660,1215));little.thumbnail((330,350));little.save(root/'diagnostics'/(name+'-inspection.jpg'),quality=91)
(root/'authoring/character-comparison.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({k:results[k] for k in ['core','visibleRetainedBody','changedPixels','changedOutside2PixelBodyMargin','maximumOutsideMarginChannelDelta']},indent=1))
