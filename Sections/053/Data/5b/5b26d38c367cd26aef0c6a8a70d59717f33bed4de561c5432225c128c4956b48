from pathlib import Path
from PIL import Image
import numpy as np,json,argparse
p=Path(__file__).parent
ap=argparse.ArgumentParser(description='Compare the complete native first Screen 07 frame with the 3D scene below its stage overlay.')
ap.add_argument('--retained',type=Path)
ap.add_argument('--new',type=Path)
ap.add_argument('--output',type=Path)
args=ap.parse_args();exported=p.parent
old=args.retained or (exported/'CLAUDIA_BEFORE/across-transition.png' if (exported/'APPROVED.jpg').exists() else Path('/tmp/rainbow-final-fidelity.RuUP0xJ2/repos/06/experiments/codex/fidelity-06/CLAUDIA_BEFORE/across-transition.png'))
new=args.new or (exported/'CODEX_NEW/across-transition.png' if (exported/'APPROVED.jpg').exists() else p/'qa-final/proof/06/NEW/across-transition.png')
def pixels(f):return np.asarray(Image.open(f).convert('RGB'),dtype=np.int16)
a=pixels(old);b=pixels(new);d=np.abs(a-b);mask=np.any(d>0,axis=2)
yy,xx=np.where(mask)
box=[int(xx.min()),int(yy.min()),int(xx.max()),int(yy.max())] if len(xx) else None
report={'frame':'across-transition native, first frame in Screen 07','wholeFrameChangedPixels':int(mask.sum()),'changedBoundsXYXY':box,'maximumSingleChannelDifference':int(d.max()),'maximumRGBSumDifference':int(d.sum(2).max()),'changedScenePixelsBelowHUDRow170':int(mask[170:].sum()),'sampledCanvasSize':[864,1536],'stageHudDifference':'Tiny color differences confined to the stage-name overlay above the playable scene.' if box else 'The entire frame is identical.'}
assert report['changedScenePixelsBelowHUDRow170']==0 and report['maximumRGBSumDifference']<=3
(args.output or p/'adjacent-screen-check.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
