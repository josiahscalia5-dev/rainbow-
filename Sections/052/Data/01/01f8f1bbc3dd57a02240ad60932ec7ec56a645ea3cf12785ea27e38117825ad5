"""Check the retained and experimental real-game captures, including complete swims."""
import argparse
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path
from PIL import Image
import numpy as np

def read(path):
    return json.loads(path.read_text())

def rgb(path):
    with Image.open(path) as im:
        if im.size != (864,1536): raise ValueError(f'Unexpected native frame {path.name}')
        return np.asarray(im.convert('RGB'), dtype=np.int16)

def stream(file):
    command=['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=codec_name,width,height,nb_frames,avg_frame_rate,duration','-of','json',str(file)]
    result=read_output(command)['streams'][0]
    subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(file),'-f','null','-'],check=True)
    return result

def read_output(args):
    return json.loads(subprocess.check_output(args))

def matching(left,right,fields):
    if len(left)!=len(right):raise ValueError('Different sample counts')
    for i,(a,b) in enumerate(zip(left,right)):
        for field in fields:
            if a.get(field)!=b.get(field):raise ValueError(f'Comparison differs at {i}, {field}')

def main():
    p=argparse.ArgumentParser()
    for arg in ['approved','before','new','repeat','comparator','baseline','destination']:p.add_argument(arg,type=Path)
    args=p.parse_args()
    approved,before,new=args.approved,args.before,args.new
    source=read(args.baseline)
    checksum=source['references'][source['officialArtwork']]
    if checksum!=hashlib.sha256(approved.read_bytes()).hexdigest():raise ValueError('Reference changed')
    bposes,nposes=[read(d/'poses.json') for d in (before,new)]
    matching(bposes,nposes,['name','kind','value','steer','simFrames','target','stageBounds','clock','shaderTime','state','camera','benny'])
    broute,nroute=[read(d/'route.json')['frames'] for d in (before,new)]
    matching(broute,nroute,['i','time','shaderTime','s','stage','lat','steer','hearts','coins','camera'])
    clips=[stream(d/'ride.mp4') for d in (before,new)]
    if clips[0]!=clips[1] or clips[1]['codec_name']!='h264' or int(clips[1]['nb_frames'])!=len(nroute):raise ValueError('Unmatched films')
    if min(f['hearts'] for f in nroute)!=5 or nroute[-1]['stage']==nroute[0]['stage']:raise ValueError('Unfinished stage')
    checks=read(new/'gameplay.json')['checks']
    if len(checks)!=8 or not all(c['pass'] for c in checks.values()):raise ValueError('Failed gameplay checks')
    safe=read(new/'full-safe-ride.json')['success']
    if tuple(safe[k] for k in ('start','coins','score','hearts','stage','collisions'))!=(1330,91,2240,5,'11',[]):raise ValueError('Full ride regression')
    report={'retained':source['retained'],'approvedSHA256':checksum,'native':[864,1536],'simulationHz':60,'matchedCamerasStatesSteeringClocks':True,'uninterruptedFilm':clips[1],'matchedMovieFrames':len(nroute),'numberOfNativePoses':len(nposes),'assertions':{k:v['pass'] for k,v in checks.items()},'fullRide':{k:safe[k] for k in ('start','coins','score','hearts','stage','collisions')},'checkpoints':{},'transitions':[(f['time'],f['stage']) for i,f in enumerate(nroute) if not i or f['stage']!=nroute[i-1]['stage']]}
    report['opening']=read_output([sys.executable,str(args.comparator),str(approved),str(before/'opening.png'),'--candidate',str(new/'opening.png'),'--repeat',str(args.repeat)])
    if report['opening']['beforeVsRepeat']['exactDifferences']!=0 or report['opening']['beforeVsCandidate']['exactDifferences']!=0:raise ValueError('Opening no longer matches retained')
    for bp,np_ in zip(bposes,nposes):
        if 'skip' in bp:continue
        base=rgb(before/(bp['name']+'.png'));trial=rgb(new/(bp['name']+'.png'))
        diff=np.abs(base-trial).max(2)
        report['checkpoints'][bp['name']]={'changedPixels':int(np.count_nonzero(diff)),'pixelsWithAChannelChangingOver10':int(np.count_nonzero(diff>10)),'drawsBeforeNew':[bp['gl']['calls'],np_['gl']['calls']],'trianglesBeforeNew':[bp['gl']['triangles'],np_['gl']['triangles']],'contextLost':np_['gl']['contextLost']}
        if np_['gl']['contextLost']:raise ValueError('WebGL context lost')
    args.destination.write_text(json.dumps(report,indent=2)+'\n')
    print(len(nposes),'matched poses and',len(nroute),'matched frames;',len(checks),'checks; full ride',safe['score'], 'with',safe['hearts'],'hearts.')

if __name__=='__main__':
    main()
