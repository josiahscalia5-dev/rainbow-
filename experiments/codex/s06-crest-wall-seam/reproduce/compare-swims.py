"""Scan every matched MP4 frame for changes and additional abrupt visual jumps."""
from pathlib import Path
import argparse,json,subprocess
import numpy as np

def decode(file):
    args=['ffmpeg','-v','error','-threads','2','-i',str(file),'-vf','scale=216:384:flags=area','-f','rawvideo','-pix_fmt','rgb24','pipe:1']
    raw=subprocess.check_output(args)
    return np.frombuffer(raw,dtype=np.uint8).reshape((-1,384,216,3))

def main():
    parser=argparse.ArgumentParser()
    for k in ['before','new','route','output']:parser.add_argument(k,type=Path)
    a=parser.parse_args();base=decode(a.before);trial=decode(a.new)
    frames=json.loads(a.route.read_text())['frames']
    assert len(base)==len(trial)==len(frames)
    rows=[];pb=None;pn=None
    for i,(b,n,f) in enumerate(zip(base,trial,frames)):
        b=b[35:345].astype(np.int16);n=n[35:345].astype(np.int16)
        diff=np.abs(b-n)
        row={'time':f['time'],'stage':f['stage'],'station':f['s'],'camera':f['camera'],'changedPixels_channelGt18':int(np.sum(np.max(diff,axis=2)>18)),'averageChannelDifference':round(diff.mean().item(),3)}
        if i:
            row['temporalDeltaBefore']=round(np.mean(np.abs(b-pb)).item(),3)
            row['temporalDeltaNew']=round(np.mean(np.abs(n-pn)).item(),3)
            row['addedTemporalDelta']=round(row['temporalDeltaNew']-row['temporalDeltaBefore'],3)
        rows.append(row);pb=b;pn=n
    top=sorted(rows,key=lambda r:r['changedPixels_channelGt18'],reverse=True)[:5]
    result={'method':'Decoded real H.264 clips, averaged to 216 by 384 pixels. Measure rows 35 through 344 to exclude the HUD. Changed count uses maximum absolute channel difference above 18. Adjacent-frame mean absolute RGB change identifies moments to inspect for popping. Compression can produce small differences beyond the changed surface. These are diagnostics, not accuracy scores for unseen viewpoints.','frames':len(rows),'highestDifferenceTimes':[r['time'] for r in top],'largestIncreaseInAdjacentFrameChange':max(rows[1:],key=lambda r:r['addedTemporalDelta']),'timeline':rows}
    a.output.write_text(json.dumps(result,indent=2)+'\n')
    print('Scanned',len(rows),'frames. Largest pair differences at',result['highestDifferenceTimes'])
if __name__=='__main__':main()
