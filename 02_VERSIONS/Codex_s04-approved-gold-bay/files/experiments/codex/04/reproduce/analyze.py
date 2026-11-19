"""Validate matched scene states and measure differences in the real gameplay captures."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
SCREENS = ('04', '05', '06', '07', '08')
VARIANTS = ('BEFORE', 'NEW')


def load(path):
    return json.loads(path.read_text())


def rgba(path):
    with Image.open(path) as im:
        assert im.size == (864, 1536), path
        return np.asarray(im.convert('RGB'), dtype=np.int16)


def validate_stills(folder, sid):
    results = []
    records = [load(folder / v / 'poses.json') for v in VARIANTS]
    assert [v['name'] for v in records[0]] == [v['name'] for v in records[1]]
    for before, new in zip(*records):
        name = before['name']
        if 'skip' in before:
            assert before == new
            results.append({'name': name, 'skipped': before['skip'], 'exit': before['exit'], 'requested': before['target']})
            continue
        for key in ('camera', 'clock', 'shaderTime', 'state', 'steer','benny','simFrames'):
            assert before[key] == new[key], (sid, name, key, before[key], new[key])
        for rec in (before,new):
            assert not rec['gl']['contextLost'], (sid,name)
        files = [folder / v / (name + '.png') for v in VARIANTS]
        d = np.abs(rgba(files[0]) - rgba(files[1])).max(axis=2)
        ys, xs = np.where(d >= 16)
        bounds = None if not len(xs) else [int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
        results.append({'name':name, 'stage':before['state']['stage'], 's':before['state']['s'],
                        'steer':before['steer'], 'hearts':before['state']['hearts'],
                        'changedPixels':int(np.count_nonzero(d)), 'channelDeltaAtLeast16':len(xs),
                        'boundsAt16':bounds, 'beforeDraws':before['gl'],'newDraws':new['gl']})
    suites = [load(folder / v / 'gameplay.json') for v in VARIANTS]
    assert all(len(s['checks']) == 8 and all(c['pass'] for c in s['checks'].values()) for s in suites)
    for s in suites:
        picks = s['checks']['realCoinPickups']
        assert [picks[k] for k in ('startCoins', 'collected','endCoins')] == [1330,91,2240]
    assert suites[0]['checks']['victory']['finalState']['hearts'] == suites[1]['checks']['victory']['finalState']['hearts']
    if sid=='04':
        for variant in VARIANTS:
            safe=load(folder/variant/'full-safe-ride.json')['success']
            assert safe['hearts']==5 and safe['coins']==91 and safe['score']==2240 and not safe['collisions']
    return results


def probe_video(path):
    cmd = ['ffprobe','-v','error','-select_streams','v:0','-show_entries',
           'stream=width,height,nb_frames,r_frame_rate,codec_name','-of','json',str(path)]
    return json.loads(subprocess.check_output(cmd))['streams'][0]


def decode_video(path):
    cmd = ['ffmpeg','-v','error','-threads','1','-i',str(path),'-f','rawvideo',
           '-pix_fmt','rgb24','-threads','1','pipe:1']
    raw = subprocess.check_output(cmd)
    return np.frombuffer(raw,dtype=np.uint8).reshape((-1,576,324,3))


def validate_ride(folder, sid):
    logs = [load(folder / v / 'route.json') for v in VARIANTS]
    paths = [folder / v / 'ride.mp4' for v in VARIANTS]
    a,b=[log['frames'] for log in logs]
    assert len(a)==len(b)>1 and a[0]['stage']==sid and a[-1]['stage']!=sid
    assert all(earlier['s'] < later['s'] for earlier,later in zip(a,a[1:]))
    assert any(f['steer']>0.1 for f in a) and any(f['steer']<-0.1 for f in a)
    for f,g in zip(a,b):
        for key in ('i','time','shaderTime','s','stage','lat','steer','hearts','coins','camera'):
            assert f[key]==g[key],(sid,f['i'],key)
        assert f['hearts']==5
    streams=[probe_video(p) for p in paths]
    assert all(int(s['nb_frames'])==len(a) and s['width']==324 and s['height']==576 and s['r_frame_rate']=='12/1' for s in streams)
    frames = [decode_video(p) for p in paths]
    transitions=[]
    for i in range(1,len(a)):
        vals = []
        for video in frames:
            diff=np.abs(video[i].astype(np.int16)-video[i-1].astype(np.int16))
            vals.append(round(float(diff.mean()),3))
        transitions.append({'frame':i,'s':a[i]['s'],'stage':a[i]['stage'],
                            'beforeMeanChannelChange':vals[0],'newMeanChannelChange':vals[1]})
    ranks=sorted(transitions,key=lambda r:abs(r['newMeanChannelChange']-r['beforeMeanChannelChange']),reverse=True)[:4]
    return {'frames':len(a),'fps':12,'duration':len(a)/12,'start':a[0]['s'],'end':a[-1]['s'],
            'nextStage':a[-1]['stage'],'minimumHearts':min(f['hearts'] for f in a),
            'allMatchedStates':True,'streams':streams,'largestRelativeTemporalChanges':ranks,
            'temporalChanges':transitions}


def main():
    for sid in sys.argv[1:] or SCREENS:
        folder = ROOT/'proof'/sid
        output={'screen':sid,'stills':validate_stills(folder,sid),'ride':validate_ride(folder,sid)}
        (folder/'motion-checks.json').write_text(json.dumps(output,indent=2)+'\n')
        print(sid, len([s for s in output['stills'] if 'skipped' not in s]), output['ride']['frames'],flush=True)

if __name__ == '__main__':
    main()
