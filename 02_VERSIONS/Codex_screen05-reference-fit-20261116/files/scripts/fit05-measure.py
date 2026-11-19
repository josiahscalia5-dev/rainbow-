#!/usr/bin/env python3
"""Measure paused image bands against numeric reference traces; never edits images/game assets.

python3 scripts/fit05-measure.py --image baseline=qa/reference-fit/coordinates/baseline.png \
  --out qa/reference-fit/measure-baseline.json
Repeat --image label=path to compare identical supported rows. All distances are source pixels.
"""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, binary_closing, label

ROOT = Path(__file__).resolve().parents[1]
# Conservative exclusions traced from the preserved game's paused time-12 checkpoint. They are
# not inferred water edges. The reference's own annotations are also excluded. Moving the camera,
# actors or animation time invalidates this mask; this script is solely for the matched checkpoint.
CHECKPOINT_BENNY = [(375,767),(442,769),(473,787),(481,822),(477,862),(518,881),
 (534,928),(561,952),(563,982),(550,1009),(587,1017),(617,1047),(601,1072),
 (567,1081),(562,1124),(541,1167),(504,1186),(346,1188),(286,1168),(270,1116),
 (241,1086),(224,1055),(250,1028),(282,1014),(271,981),(272,951),(293,915),
 (329,893),(353,877),(338,844),(340,807)]
CHECKPOINT_BUBBLES = [(720,684,33),(738,773,22),(704,771,17),(192,749,22),
 (689,647,10),(792,726,9),(665,869,20),(663,894,17),(735,908,29)]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def exclusions(features, size, checkpoint):
    im = Image.new('1', size)
    draw = ImageDraw.Draw(im)
    source = features.get('manualExclusions', {})
    if source.get('bennyPolygon'):
        draw.polygon(source['bennyPolygon'], fill=1)
    for x,y,rx,ry in source.get('coinEllipses', []):
        draw.ellipse((x-rx-3,y-ry-3,x+rx+3,y+ry+3), fill=1)
    for x,y,r in source.get('bubbleCircles', []):
        draw.ellipse((x-r-2,y-r-2,x+r+2,y+r+2), fill=1)
    if checkpoint:
        draw.polygon(CHECKPOINT_BENNY, fill=1)
        for x,y,r in CHECKPOINT_BUBBLES:
            draw.ellipse((x-r,y-r,x+r,y+r), fill=1)
    return np.asarray(im, dtype=bool)


def stats(rows):
    accepted = [r for r in rows if r['supported']]
    def summarize(key):
        values = np.array([r['errorPixels'][key] for r in accepted])
        if not len(values):
            return None
        return {'meanAbsolute':float(np.abs(values).mean()), 'medianAbsolute':float(np.median(np.abs(values))),
                'maxAbsolute':float(np.abs(values).max()), 'meanSigned':float(values.mean())}
    return {'rowsRequested':len(rows), 'rowsSupported':len(accepted),
            'rowsUnsupported':len(rows)-len(accepted),
            'leftCoreErrorPixels':summarize('left'), 'rightCoreErrorPixels':summarize('right'),
            'centerErrorPixels':summarize('center'), 'widthErrorPixels':summarize('width')}


def measure(path, features, row_range, checkpoint=True):
    rgb = np.asarray(Image.open(path).convert('RGB'), dtype=float)
    h,w = rgb.shape[:2]
    if (w,h) != (features['image']['width'], features['image']['height']):
        raise ValueError(f'{path}: size {w}x{h} must exactly match reference dimensions; no resizing')
    blurred = gaussian_filter(rgb, sigma=(1.5,1.5,0))
    excluded = exclusions(features, (w,h), checkpoint)
    rows=[]
    for band in features['bands']:
        if band['kind'] != 'main':
            continue
        for p in band['points']:
            y=int(p['y'])
            if not row_range[0] <= y <= row_range[1]:
                continue
            expected=[float(p['coreLeft']),float(p['coreRight'])]
            centre=sum(expected)/2
            margin=max(70,min(130,(expected[1]-expected[0])*.8))
            lo=max(0,int(np.floor(expected[0]-margin))); hi=min(w-1,int(np.ceil(expected[1]+margin)))
            # A band's search cannot cross halfway to the other expected main band.
            for other in features['bands']:
                if other['kind']!='main' or other['id']==band['id']: continue
                op=next((q for q in other['points'] if q['y']==y),None)
                if op is None: continue
                oc=(op['coreLeft']+op['coreRight'])/2
                middle=(centre+oc)/2
                if oc>centre: hi=min(hi,int(np.floor(middle)))
                else: lo=max(lo,int(np.ceil(middle)))
            row=blurred[max(0,y-2):min(h,y+3)].mean(axis=0)
            r,g,b=row.T
            core=(r>g*1.3)&(b>g*1.2)&(r>110)
            # Same ten-pixel maximum glint interruption as the reference extractor.
            closed=binary_closing(np.pad(core,(8,8),mode='edge'),structure=np.ones(11))[8:-8]
            runs,n=label(closed[lo:hi+1])
            choices=[]
            for number in range(1,n+1):
                xx=np.where(runs==number)[0]+lo
                if len(xx)<6: continue
                left,right=int(xx[0]),int(xx[-1])
                mid=(left+right)/2
                distance=max(left-centre,centre-right,0)
                choices.append({'left':left,'right':right,'center':mid,'width':right-left,
                                'score':distance+abs(mid-centre)*.2,
                                'coreFraction':float(core[left:right+1].mean())})
            choices.sort(key=lambda c:c['score'])
            reasons=[]
            if p.get('confidence',0)<.9: reasons.append('reference_confidence_below_0.9')
            if p.get('occlusion'): reasons.append('reference_occluded_or_clipped')
            if any(v!='measured' for v in p.get('edgeVisibility',{}).values()): reasons.append('reference_edge_not_directly_measured')
            record={'band':band['id'],'y':y,'expected':{'left':expected[0],'right':expected[1],'center':centre,'width':expected[1]-expected[0]},
                    'referenceConfidence':p.get('confidence'), 'referenceOcclusion':p.get('occlusion',[]),
                    'searchWindow':[lo,hi], 'candidates':choices,'supported':False,'reasons':reasons,'measured':None,'errorPixels':None}
            if not choices:
                reasons.append('no_saturated_magenta_run_in_window')
            else:
                chosen=choices[0]; left,right=chosen['left'],chosen['right']
                if left<=lo or right>=hi: reasons.append('candidate_boundary_clipped_by_search_or_image')
                if len(choices)>1 and choices[1]['score']-chosen['score']<8: reasons.append('ambiguous_multiple_magenta_runs')
                if any(min(c['right'],expected[1])-max(c['left'],expected[0])>=6 for c in choices[1:]):
                    reasons.append('multiple_core_fragments_in_expected_band')
                if chosen['coreFraction']<.6: reasons.append('mostly_interpolated_highlight_gap')
                # A mask hit anywhere in the expected or measured band prevents aggregate credit.
                # Provisional pixel readings remain listed, never turned into zero-error samples.
                union_lo=max(0,int(min(left,expected[0]))); union_hi=min(w-1,int(max(right,expected[1])))
                if excluded[max(0,y-2):min(h,y+3),union_lo:union_hi+1].any(): reasons.append('actor_or_bubble_exclusion_intersects_band')
                gold=(r>150)&(g>90)&(r>b*1.25)&(g>b*1.2)
                if gold[union_lo:union_hi+1].sum()>=4: reasons.append('gold_coin_or_frame_pixels_intersect_band')
                record['measured']={k:chosen[k] for k in ['left','right','center','width']}
                record['errorPixels']={k:record['measured'][k]-record['expected'][k] for k in ['left','right','center','width']}
                record['supported']=not reasons
            rows.append(record)
    return {'path':str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),'sha256':digest(path),
            'checkpointOcclusionsApplied':checkpoint,'summary':stats(rows),
            'byBand':{band:stats([r for r in rows if r['band']==band]) for band in sorted({r['band'] for r in rows})},'rows':rows}


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--reference',default='qa/reference-fit/reference-features.json')
    ap.add_argument('--image',action='append',help='label=path; repeat for matched-row comparison')
    ap.add_argument('--out',default='qa/reference-fit/measure-baseline.json')
    ap.add_argument('--rows',default='600:850')
    args=ap.parse_args()
    feature_path=(ROOT/args.reference).resolve(); features=json.loads(feature_path.read_text())
    row_range=tuple(map(int,args.rows.split(':')))
    if len(row_range)!=2 or row_range[0]>row_range[1]: raise ValueError('--rows requires ascending start:end')
    out=(ROOT/args.out).resolve()
    if not out.is_relative_to(ROOT/'qa/reference-fit'): raise ValueError('Output must remain under qa/reference-fit')
    if out.exists(): raise FileExistsError('Choose a new --out; previous evidence is preserved')
    specs=args.image or ['baseline=qa/reference-fit/coordinates/baseline.png']
    images={}
    for spec in specs:
        name,sep,path=spec.partition('=')
        if not sep or not name or name in images: raise ValueError('Use unique label=path image arguments')
        images[name]=measure((ROOT/path).resolve(),features,row_range)
    reference_source=(ROOT/features['source']).resolve()
    calibration=measure(reference_source,features,row_range,False) if reference_source.exists() else None
    common=set.intersection(*[{(r['band'],r['y']) for r in image['rows'] if r['supported']} for image in images.values()])
    report={'schemaVersion':1,'reference':str(feature_path.relative_to(ROOT)),'referenceSha256':digest(feature_path),
      'rows':list(row_range),'units':'original 864x1536 image pixels; signed error = candidate minus reference',
      'method':'Gaussian sigma1.5, five-row mean; saturated core R>1.3G, B>1.2G, R>110. Close at most ten-pixel highlight holes. Select nearest magenta run within an expected-band corridor; ambiguous, clipped, low-confidence or occluded rows have no aggregate credit.',
      'limitations':['Colour-threshold measurements assess saturated-magenta core shape, not full aesthetic similarity, animation or gameplay.',
       'Expected corridors bound detectable displacement. Missing bands and clipped/ambiguous candidates remain unsupported, not zero error.',
       'Conservative actor/coin/bubble exclusions combine approved-image annotations and the preserved time-12 game checkpoint. Changed camera, actor locations or animation time require revised exclusions.',
       'Provisional measurements on unsupported rows may describe an occluder; inspect reasons before using them.',
       'Compare repeated images using commonSupportedRows summaries; per-image averages may use different subsets.',
       'Reference self-calibration exposes differences between the threshold estimator and editorial reference edges; it is not subtracted from measured error.'],
      'referenceSelfCalibration':{'summary':calibration['summary'],'byBand':calibration['byBand'],'rows':calibration['rows']} if calibration else None,
      'images':images,'commonSupportedRows':{'count':len(common),'keys':[[b,y] for b,y in sorted(common)],
       'summaries':{name:stats([r for r in image['rows'] if (r['band'],r['y']) in common]) for name,image in images.items()}}}
    out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'output':str(out.relative_to(ROOT)),'images':{name:image['summary'] for name,image in images.items()},
                     'referenceSelfCalibration':calibration['summary'] if calibration else None,'commonSupportedRows':len(common)},indent=2))


if __name__=='__main__': main()
