"""Check the registered cameras, game state, video frames and completed original gameplay tests."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image

previous, revised, original, output = map(Path, sys.argv[1:5])
labels = {'previous':previous, 'revised':revised}
reference_hash = hashlib.sha256(original.read_bytes()).hexdigest()
assert reference_hash == '3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe'
results = {'originalSha256':reference_hash,'matchedPoses':{},'videos':{},'gameplay':{}}
pose_fields = ('camera','clock','shaderTime','simFrames','kind','steer','target','stageBounds','state','benny')
frame_fields = ('i','time','shaderTime','s','stage','lat','steer','hearts','coins','camera')
pose_data, routes = {},{}
for label,folder in labels.items():
    poses = json.loads((folder/'poses.json').read_text())
    assert all(not p.get('skip') for p in poses) and len(poses)==14
    pose_data[label] = {p['name']:p for p in poses}
    for sample in poses:
        with Image.open(folder/(sample['name']+'.png')) as f:
            assert f.format=='PNG' and f.size==(864,1536)
            f.verify()
        assert not sample['gl']['contextLost']
    route = json.loads((folder/'route.json').read_text())
    movie = folder/'ride.mp4'
    stream = json.loads(subprocess.check_output(['ffprobe','-v','error','-of','json','-show_entries',
        'stream=codec_name,width,height,r_frame_rate,nb_frames,duration',str(movie)]))['streams'][0]
    subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'],check=True)
    frames = route['frames']
    assert stream['codec_name']=='h264' and (stream['width'],stream['height'])==(648,1152)
    assert int(stream['nb_frames'])==len(frames) and int(float(stream['duration'])*12+.5)==len(frames)
    assert all(f['hearts']==5 and f['i']==i for i,f in enumerate(frames))
    assert all(a['s']<b['s'] for a,b in zip(frames,frames[1:]))
    assert frames[0]['stage']=='06' and frames[-1]['stage']=='07'
    assert min(f['steer'] for f in frames)<-.3 and max(f['steer'] for f in frames)>.3
    results['videos'][label]={**stream,'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),
        'rangeGameUnits':[frames[0]['s'],frames[-1]['s']],'rangeSteering':[min(f['steer'] for f in frames),max(f['steer'] for f in frames)],
        'stages':[frames[0]['stage'],frames[-1]['stage']],'minimumHearts':min(f['hearts'] for f in frames)}
    routes[label]=frames
    checks=json.loads((folder/'gameplay.json').read_text())['checks']
    safe=json.loads((folder/'full-safe-ride.json').read_text())['success']
    assert len(checks)==8 and all(v['pass'] for v in checks.values())
    assert checks['realCoinPickups']['collected']==91 and safe['start']==1330 and safe['score']==2240
    assert safe['coins']==91 and safe['stage']=='11' and safe['hearts']==5 and len(safe['collisions'])==0
    results['gameplay'][label]={k:safe[k] for k in ('start','score','hearts','coins','stage','collisions','margin')}
    results['gameplay'][label]['gameplayAssertionsPassed']=len(checks)
assert pose_data['previous'].keys()==pose_data['revised'].keys()
for name,first in pose_data['previous'].items():
    last=pose_data['revised'][name]
    assert all(first[f]==last[f] for f in pose_fields),(name,[f for f in pose_fields if first[f]!=last[f]])
    results['matchedPoses'][name]={'fieldsVerified':pose_fields,'gameUnits':last['state']['s'],
        'previousDraw':first['gl'],'revisedDraw':last['gl']}
left,right=routes['previous'],routes['revised']
assert len(left)==len(right)
assert all(a[f]==b[f] for a,b in zip(left,right) for f in frame_fields)
results['matchedVideoFrames']=len(right)
results['matchedFrameFields']=frame_fields
results['allViewsHaveSameCharacterAndCamera']=True
output.write_text(json.dumps(results,indent=2)+'\n')
print(len(pose_data['revised']),'identical game/camera poses;',len(right),'matched continuous video frames;',results['gameplay']['revised'])
