"""Verify the native openings and every state of an uninterrupted game capture."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image

root=Path(sys.argv[1]); parent=Path(sys.argv[2]); mode=sys.argv[3]
spec=json.loads((root/'source.json').read_text())
proof=root/'proof/06';before=proof/'BEFORE';after=proof/'NEW'
art=root/'games/06'/spec['officialArtwork']
def read(file): return json.loads(file.read_text())
def image(file): return np.asarray(Image.open(file).convert('RGB'),dtype=np.int16)
def output(args): return json.loads(subprocess.check_output(args))
assert hashlib.sha256(art.read_bytes()).hexdigest()==spec['references'][spec['officialArtwork']]
opening=output([sys.executable,str(parent/'compare-opening.py'),str(art),str(before/'opening.png'),'--candidate',str(after/'opening.png'),'--repeat',str(before/'opening-repeat.png')])
assert opening['beforeVsRepeat']['exactDifferences']==0
prev,trial=[read(p/'poses.json') for p in [before,after]]
assert len(prev)==len(trial)==14
fields=['name','kind','value','steer','simFrames','target','stageBounds','clock','shaderTime']
framefields=['i','time','shaderTime','s','stage','lat','steer','hearts']
if mode=='coat':
 fields+=['state','camera','benny'];framefields+=['coins','camera']
scenes={}
for b,n in zip(prev,trial):
 assert all(b[f]==n[f] for f in fields),(b['name'],[f for f in fields if b[f]!=n[f]])
 assert all(b['state'][f]==n['state'][f] for f in ('s','stage','lat','hearts','paused','bennyVisible')),b['name']
 assert n['gl']['contextLost'] is False
 name=b['name'];bi,ni=[image(p/(name+'.png')) for p in [before,after]]
 assert bi.shape==ni.shape==(1536,864,3)
 d=np.max(abs(bi-ni),axis=2)
 scenes[name]={'maxChannelDifference':int(d.max()),'changedPixels':int(np.sum(d>0)),'pixelsChangeGreaterThan10':int(np.sum(d>10)),
  'scoreBeforeNew':[b['state']['coins'],n['state']['coins']],'renderCalls':[b['gl']['calls'],n['gl']['calls']],
  'visibleTriangles':[b['gl']['triangles'],n['gl']['triangles']],'FOVBeforeNew':[b['camera']['fov'],n['camera']['fov']]}
 if mode=='curve':
  fi=image(proof/'NEW_AT_CLAUDIA_CAMERA'/(name+'.png'))
  scenes[name]['changedPixelsAtRetainedCamera']=int(np.sum(np.any(bi!=fi,axis=2)))
streams=[]
for folder in [before,after]+([proof/'NEW_AT_CLAUDIA_CAMERA'] if mode=='curve' else []):
 f=folder/'ride.mp4'
 s=output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_frames,avg_frame_rate,duration','-of','json',str(f)])['streams'][0]
 assert s['codec_name']=='h264' and int(s['nb_frames'])==63 and s['width']==648 and s['height']==1152
 subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(f),'-f','null','-'],check=True);streams.append(s)
bfilm,nfilm=[read(d/'route.json')['frames'] for d in [before,after]]
assert len(bfilm)==len(nfilm)==63
for b,n in zip(bfilm,nfilm):
 assert all(b[f]==n[f] for f in framefields), (n['i'],[f for f in framefields if b[f]!=n[f]])
assert nfilm[-1]['stage']=='07' and nfilm[0]['stage']=='06' and min(f['hearts'] for f in nfilm)==5
checks=read(after/'gameplay.json')['checks'];assert len(checks)==8 and all(c['pass'] for c in checks.values())
full=read(after/'full-safe-ride.json')['success']
assert [full[f] for f in ['start','score','coins','hearts','stage','collisions']]==[1330,2240,91,5,'11',[]]
if mode=='curve':
 fixed=read(proof/'NEW_AT_CLAUDIA_CAMERA/film-cameras.json')
 assert fixed['frames']==len(nfilm) and fixed['maxMatrixError']<1e-8
else: fixed={'maxMatrixError':0}
metrics={'variant':mode,'source':spec['commit'],'retained':spec['retained'],'originalSHA256':spec['references'][spec['officialArtwork']],
 'nativeSize':[864,1536],'simulationHz':60,'fixedPoses':14,'uninterruptedComparisonFrames':63,'streams':streams,'matchingMotionFields':framefields,
 'filmScoreDiffersAtFrames':sum(a['coins']!=b['coins'] for a,b in zip(nfilm,bfilm)),'maximumMatchedCameraError':fixed['maxMatrixError'],
 'opening':opening,'nativeMotion':scenes,'eightGameplayAssertions':{k:v['pass'] for k,v in checks.items()},
 'safeFullRide':{k:full[k] for k in ['start','score','coins','hearts','stage','collisions']},
 'transitionTo07AtSeconds':next(f['time'] for f in nfilm if f['stage']=='07')}
(root/'authoring/motion.json').write_text(json.dumps(metrics,indent=2)+'\n')
print(metrics['fixedPoses'],metrics['uninterruptedComparisonFrames'],metrics['safeFullRide'],opening)
