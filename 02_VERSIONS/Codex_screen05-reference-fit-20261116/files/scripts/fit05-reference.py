#!/usr/bin/env python3
"""Extract reviewable numeric Screen 05 landmarks, never runtime image pixels.

Coordinates use the original 864x1536 approved image, origin at upper left.
Band windows and visibility are hand-identified; edges are measured from blurred
source RGB. White glint gaps are closed only over short spans. Feature overlays
are QA annotations of the APPROVED image, not rendered game results.
"""
from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter, binary_closing, label

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'references/05_flow_into_the_current.png'
OUT = ROOT / 'qa/reference-fit'
OUT.mkdir(parents=True, exist_ok=True)
image = Image.open(SOURCE).convert('RGB')
rgb = np.asarray(image).astype(float)
H, W = rgb.shape[:2]
assert (W,H) == (864,1536)
blur = gaussian_filter(rgb, sigma=(1.5,1.5,0))

# Hand-identified search centres. These are not final edges: source pixels determine those.
MAIN_L = [(500,466),(510,475),(520,479),(530,470),(540,443),(550,410),(560,382),(570,348),(580,323),(590,300),(600,290),(610,285),(620,289),(630,300),(640,313),(650,325),(660,337),(670,347),(680,352),(690,353),(700,350),(710,340),(720,323),(730,300),(740,270),(750,239),(760,210),(780,160),(800,123),(820,95),(840,77),(860,58),(880,39),(900,25),(920,14),(940,5)]
MAIN_R = [(500,511),(510,554),(520,575),(530,576),(540,566),(550,541),(560,517),(570,518),(580,534),(590,565),(600,600),(610,638),(620,671),(630,700),(640,723),(650,738),(660,758),(670,774),(680,786),(690,788),(700,782),(710,777),(720,769),(730,762),(740,755),(750,749),(760,729),(780,695),(800,666),(820,625),(840,614),(850,622),(860,630),(880,653),(900,680),(920,711),(940,753),(960,794),(980,832),(1000,859),(1020,886),(1040,917)]
WAKE_L = [(1220,280),(1230,259),(1240,241),(1250,221),(1260,202),(1270,186),(1280,172),(1290,161),(1300,151),(1310,143),(1320,137),(1330,134),(1340,133)]
WAKE_R = [(1220,564),(1230,571),(1240,576),(1250,592),(1260,606),(1270,620),(1280,635),(1290,649),(1300,661),(1310,676),(1320,687),(1330,700),(1340,714)]

# Actor/coin occlusion masks. No inferred band edges behind these objects are emitted.
exclude = Image.new('1',(W,H)); ed=ImageDraw.Draw(exclude)
BENNY=[(410,773),(480,779),(508,796),(519,829),(517,867),(545,884),(569,928),(580,969),(564,1002),(608,1017),(625,1046),(621,1081),(591,1100),(576,1158),(557,1183),(527,1198),(367,1198),(332,1175),(304,1135),(291,1101),(253,1100),(226,1075),(226,1048),(243,1021),(281,1006),(268,970),(279,927),(303,897),(332,880),(337,833),(360,796)]
ed.polygon(BENNY,fill=1)
COINS=[(474,727,57,52),(550,657,38,32),(484,608,29,25),(431,575,25,20),(468,545,19,15),(495,531,15,12),(520,519,12,9),(530,507,9,7),(523,499,7,6),(510,492,6,5)]
for x,y,rx,ry in COINS: ed.ellipse((x-rx,y-ry,x+rx,y+ry),fill=1)
BUBBLES=[(82,904,35),(137,988,16),(721,1055,17),(721,1205,35),(95,1251,34),(798,870,36),(696,840,16),(822,703,31),(184,661,20),(180,851,10),(661,1369,18)]
for x,y,r in BUBBLES: ed.ellipse((x-r,y-r,x+r,y+r),fill=1)
excluded=np.asarray(exclude).astype(bool)

# River-interior windows deliberately omit foam banks, walls and lower gold frame.
INTERIOR=[(500,479,513),(520,476,580),(540,408,587),(560,300,548),(580,262,569),(600,246,646),(620,258,718),(640,289,773),(660,309,803),(680,304,814),(700,270,810),(720,196,795),(740,114,767),(760,25,739),(780,0,702),(800,0,675),(820,0,649),(840,0,650),(860,0,670),(880,0,719),(900,0,767),(920,0,809),(940,0,850),(960,0,855),(980,8,855),(1000,40,855),(1020,81,854),(1040,113,855),(1060,84,852),(1080,20,845),(1100,12,833),(1120,22,819),(1140,39,800),(1160,52,784),(1180,64,769),(1200,79,754),(1220,92,748),(1240,107,740),(1260,122,731),(1280,141,719),(1300,160,707),(1320,181,693),(1340,201,676),(1360,215,658),(1380,233,642),(1400,246,626),(1420,257,609),(1440,270,586),(1450,300,566)]
water=np.zeros((H,W),dtype=bool)
for y in range(INTERIOR[0][0],INTERIOR[-1][0]+1):
 lo=np.interp(y,[p[0] for p in INTERIOR],[p[1] for p in INTERIOR]);hi=np.interp(y,[p[0] for p in INTERIOR],[p[2] for p in INTERIOR])
 water[y,int(np.ceil(lo)):int(np.floor(hi))]=True
water &= ~excluded

def run_near(mask, centre, half_window):
 lo=max(0,int(centre-half_window));hi=min(W,int(centre+half_window)+1)
 if hi<=lo:return None
 m=mask[lo:hi].copy()
 # Close short glint interruptions, but keep array/image clipping explicit.
 m=np.pad(m,(8,8),mode='edge');m=binary_closing(m,structure=np.ones(11))[8:-8]
 labels,n=label(m)
 choices=[]
 for i in range(1,n+1):
  xs=np.where(labels==i)[0]+lo
  if len(xs)<3:continue
  l,r=int(xs[0]),int(xs[-1]);distance=max(l-centre,centre-r,0)
  choices.append((distance+abs((l+r)/2-centre)*0.12,l,r))
 return min(choices)[1:] if choices else None

def bands_for(name,kind,anchors):
 points=[]
 for y in range(anchors[0][0],anchors[-1][0]+1,10):
  centre=float(np.interp(y,[a[0] for a in anchors],[a[1] for a in anchors]))
  if centre<-25 or centre>W+25:continue
  row=blur[y-2:y+3].mean(axis=0);r,g,b=row.T
  core=(r>g*1.3)&(b>g*1.2)&(r>110)
  outer=(r>g*1.04)&(b>g*1.12)&(r>65)
  # Broader near bands, tiny far bands. Wake tails avoid the gold frame.
  win=float(np.interp(y,[500,600,750,950,1200,1350],[23,70,115,135,55,82]))
  if kind=='wake':win=62
  core &= ~excluded[y];outer &= ~excluded[y]
  a=run_near(core,centre,win)
  if a is None:continue
  a0,a1=a
  # Outer shoulders must attach to the measured core, not another pink object.
  mid=(a0+a1)/2
  z=run_near(outer,mid,win+25)
  l,r=(min(a0,z[0]),max(a1,z[1])) if z else (a0,a1)
  confidence=0.94 if y>=560 else 0.72
  occ=[]
  if l==0 or r==W-1:occ.append('image_clipped');confidence=min(confidence,0.62)
  if abs(mid-centre)>win*.65:occ.append('weak_manual_window_match');confidence=min(confidence,0.45)
  if kind=='wake':confidence=min(confidence,0.78);occ.append('splash_highlight_contamination_possible')
  points.append(dict(y=y,left=int(l),right=int(r),coreLeft=int(a0),coreRight=int(a1),center=round(mid,2),confidence=confidence,occlusion=occ))
 return dict(id=name,kind=kind,points=points)

# Hand-traced interval anchors disambiguate glints, foam and bubble occlusions.
# Intermediate rows are measured only in a narrow corridor around these edges.
EDGE_ANCHORS={
 'main_left':[(520,460,498),(530,451,474),(540,435,451),(550,402,433),(560,359,406),(570,321,378),(580,291,356),(590,267,338),(600,253,327),(610,243,325),(620,236,329),(630,236,347),(640,243,371),(650,261,390),(660,291,405),(670,308,413),(680,313,413),(690,310,408),(700,300,398),(710,282,385),(720,258,370),(730,232,349),(740,203,323),(750,178,300),(760,139,274),(770,115,262),(780,87,238),(790,60,222),(800,41,206),(810,26,192),(820,9,179),(830,0,167),(840,0,155),(850,0,146),(860,0,136),(870,0,120),(880,0,116),(890,0,99),(900,0,87),(910,0,80),(920,0,73),(930,0,57),(940,0,49),(950,0,39),(960,0,30),(970,0,19)],
 'main_right':[(520,565,583),(530,565,586),(540,550,580),(550,521,560),(560,501,532),(570,496,542),(580,507,556),(590,532,592),(600,564,637),(610,599,679),(620,631,710),(630,659,738),(640,678,758),(650,696,778),(660,713,795),(670,727,810),(680,737,819),(690,742,821),(700,745,822),(710,744,824),(720,739,833),(730,728,840),(740,714,825),(750,693,806),(760,670,796),(770,645,794),(780,616,772),(790,601,759),(800,586,740),(810,575,719),(820,567,708),(830,561,689),(840,558,684),(850,558,686),(860,560,686),(870,563,690),(880,568,699),(890,575,711),(900,580,726),(910,587,744),(920,595,768),(930,605,804),(940,617,826),(950,627,849),(960,640,863),(970,654,863),(980,669,863),(990,681,863),(1000,695,863),(1010,712,863),(1020,728,863),(1030,739,863),(1040,752,863),(1050,768,863),(1060,780,863),(1070,793,863),(1080,803,863),(1090,811,863),(1100,817,863),(1110,836,863),(1120,848,863)],
 'wake_left':[(1240,215,265),(1250,193,257),(1260,172,250),(1270,149,244),(1280,133,239),(1290,119,237),(1300,106,228),(1310,88,217),(1320,89,209),(1330,98,200),(1340,108,190),(1350,118,170),(1360,129,155)],
 'wake_right':[(1240,571,604),(1250,570,624),(1260,565,643),(1270,572,665),(1280,581,681),(1290,589,701),(1300,598,715),(1310,608,732),(1320,621,749),(1330,628,755),(1340,640,746),(1350,659,735),(1360,669,722)],
}

def traced_band(name, anchors):
 points=[];kind='wake' if name.startswith('wake') else 'main'
 for y,l0,r0 in anchors:
  row=blur[y-2:y+3].mean(axis=0);r,g,b=row.T
  core=(r>g*1.3)&(b>g*1.2)&(r>110)
  outer=(r>g*1.04)&(b>g*1.12)&(r>65)
  edge_states={};conf=0.94
  def measure(edge,expected):
   nonlocal conf
   if expected==0 or expected==W-1:
    edge_states[edge]='image_clipped';conf=min(conf,0.6);return int(expected)
   lo=max(0,int(expected)-4);hi=min(W,int(expected)+5)
   if excluded[y,lo:hi].any():
    edge_states[edge]='occluded_manual_interpolation';conf=min(conf,0.6);return int(expected)
   xs=np.where(core[lo:hi])[0]+lo
   if len(xs)==0:
    edge_states[edge]='white_glint_manual_interpolation';conf=min(conf,0.7);return int(expected)
   edge_states[edge]='measured'
   return int(xs.min() if edge=='left' else xs.max())
  l,r=measure('left',l0),measure('right',r0)
  # Shoulder crossings are tightly attached to each core edge, preventing foam/wall grabs.
  sl=l;sr=r
  for x in range(l-1,max(-1,l-13),-1):
   if not outer[x] or excluded[y,x]:break
   sl=x
  for x in range(r+1,min(W,r+13)):
   if not outer[x] or excluded[y,x]:break
   sr=x
  if y<560:conf=min(conf,0.75)
  if kind=='wake':conf=min(conf,0.75)
  if name=='wake_left' and y>=1310:edge_states['left']='gold_frame_clipped';conf=min(conf,0.5)
  if name=='wake_right' and y>=1330:edge_states['right']='gold_frame_clipped';conf=min(conf,0.5)
  if name=='main_left' and 880<=y<=920:edge_states['right']='bubble_occluded_manual_interpolation';conf=min(conf,0.55)
  points.append(dict(y=y,left=sl,right=sr,coreLeft=l,coreRight=r,center=round((l+r)/2,2),confidence=conf,occlusion=[v for v in edge_states.values() if v!='measured'],edgeVisibility=edge_states))
 return dict(id=name,kind=kind,points=points)

bands=[traced_band(name,anchors) for name,anchors in EDGE_ANCHORS.items()]

# Candidate list is a measurement aid, not runtime content. All selected named spines below
# are reviewed against the approved source and restricted to clear water interiors.
bright=(rgb.min(axis=2)>198)&((rgb.max(axis=2)-rgb.min(axis=2))<78)&water
labels,n=label(bright)
candidates=[]
for i in range(1,n+1):
 yy,xx=np.where(labels==i)
 if len(xx)<6:continue
 xy=np.column_stack((xx,yy));centre=xy.mean(axis=0)
 cov=np.cov(xy.T) if len(xy)>1 else np.eye(2)
 vals,vecs=np.linalg.eigh(cov);axis=vecs[:,-1];along=(xy-centre)@axis
 length=float(along.max()-along.min());width=float(4*np.sqrt(max(vals[0],0)))
 if length<7:continue
 candidates.append(dict(component=i,center=centre.round(2).tolist(),area=len(xx),length=round(length,2),width=round(width,2)))
candidates.sort(key=lambda d:d['area'],reverse=True)

result={
 'schemaVersion':1,'source':str(SOURCE.relative_to(ROOT)),'sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
 'image':{'width':W,'height':H,'coordinateOrigin':'top-left','units':'source pixels'},
 'purpose':'Numeric water feature fitting only. QA annotation is not a game render. No source RGB image is used at runtime.',
 'definitions':{'bandEdges':'left/right: attached magenta-to-violet shoulder measured by RGB ratio; coreLeft/coreRight: saturated magenta core; white highlight holes closed up to 10px','glintWidth':'full white-core width in screen pixels, excluding soft colored shoulder','confidence':'0..1 editorial confidence, not a statistical probability'},
 'bands':bands,'glints':[],'sheens':[],
 'occludedRanges':[{'id':'main_left','y':[980,1535],'reason':'main band leaves frame; later visible left pink is a separate rider wake'}, {'id':'main_right','y':[1130,1535],'reason':'main band leaves frame; later visible right pink is a separate rider wake'}, {'id':'wake_left','y':[1180,1210],'reason':'occluded/mixed with rider and white splash'}, {'id':'wake_right','y':[1180,1210],'reason':'occluded/mixed with rider and white splash'}, {'id':'wake_both','y':[1370,1535],'reason':'gold frame and white splash obscure colored band edges; do not extend fitted traces'}, {'id':'water_all','y':[1475,1535],'reason':'near gold frame covers central water; no source water observations'}],
 'manualExclusions':{'bennyPolygon':BENNY,'coinEllipses':COINS,'bubbleCircles':BUBBLES},
 'colorSamples':[],
}

# Manually reviewed connected white regions. These correspond to actual reflections,
# not white foam/costume/coin pixels. Stable names describe their position and material.
SELECTED={
 4:'pink_right_lower_flare',7:'foreground_middle_right',9:'pink_left_near_flare',
 10:'cyan_right_low_flare',11:'foreground_middle_left',12:'cyan_left_long_flare',
 14:'pink_right_exit_flare',15:'foreground_bottom_left',16:'pink_wake_right_flare',
 17:'pink_right_bend_flare',22:'foreground_bottom_right',24:'cyan_left_low_flare',
 26:'foreground_upper_left',27:'cyan_mid_lower_flare',28:'foreground_right_edge',
 29:'pink_right_lower_tip',32:'pink_right_upper_bend',33:'cyan_mid_right_flare',
 37:'cyan_left_upper_flare',41:'pink_left_middle_flare',42:'cyan_right_lower_small',
 43:'pink_left_near_tip',44:'pink_left_mid_tip',46:'cyan_left_mid_flare',
 48:'pink_left_far_flare',50:'cyan_left_exit_flare',51:'cyan_mid_far_right',
 52:'cyan_left_near_small',54:'cyan_mid_left_small',55:'pink_right_far_flare',
 56:'pink_right_exit_tip',59:'pink_right_bend_tip',61:'pink_left_middle_tip',
 66:'cyan_mid_far_left',67:'pink_right_far_tip',74:'pink_right_mid_tip',
}

def component_spine(candidate,name):
 yy,xx=np.where(labels==candidate['component'])
 xy=np.column_stack((xx,yy)).astype(float);centre=xy.mean(axis=0)
 vals,vecs=np.linalg.eigh(np.cov(xy.T));axis=vecs[:,-1]
 if axis[1]<0 or (abs(axis[1])<0.1 and axis[0]<0):axis=-axis
 normal=np.array([-axis[1],axis[0]])
 along=(xy-centre)@axis;across=(xy-centre)@normal
 lo,hi=float(along.min()),float(along.max());span=hi-lo
 points=[]
 for fraction in [0.0,0.12,0.3,0.5,0.7,0.88,1.0]:
  t=lo+span*fraction
  sel=np.abs(along-t)<=max(1.2,span*.075)
  if not sel.any():sel[np.argmin(np.abs(along-t))]=True
  cross=float(np.median(across[sel]));p=centre+axis*t+normal*cross
  width=float(np.quantile(across[sel],.93)-np.quantile(across[sel],.07)+1)
  if fraction in (0,1):width=min(width,1.0)
  points.append([round(float(p[0]),2),round(float(p[1]),2),round(width,2)])
 return {'id':name,'points':points,'strength':1.0,'confidence':0.92,
  'extraction':'PCA-oriented seven-bin medial trace of manually selected source white component',
  'sourceComponent':candidate['component'],'sourceAreaPx':candidate['area'],
  'sourceCentroid':candidate['center'],'occlusion':[]}

result['glints']=[component_spine(candidates[i],name) for i,name in SELECTED.items()]
# Smaller side glints clipped by conservative water masks are manually traced from source.
result['glints'] += [
 {'id':'foreground_bottom_left_edge','points':[[250,1429,0.5],[237,1449,4.0],[226,1460,7.0],[215,1470,0.5]],'strength':0.8,'confidence':0.7,'extraction':'manual source trace','occlusion':[]},
 {'id':'foreground_left_diagonal','points':[[299,1280,0.5],[286,1300,4.0],[273,1312,5.0],[258,1322,0.5]],'strength':0.8,'confidence':0.75,'extraction':'manual source trace','occlusion':[]},
]
# Broad cyan shoulders between the primary white flares. These are manually observed
# curved crests, not a periodic oscillator; widths denote luminous cyan core, not bloom.
result['sheens']=[
 {'id':'foreground_high_cyan_arc','points':[[315,1296,1],[355,1276,4],[400,1268,6],[440,1265,7],[480,1270,5],[520,1283,2]],'strength':0.55,'confidence':0.8},
 {'id':'foreground_upper_glint_arc','points':[[299,1320,1],[338,1301,3],[368,1290,5],[407,1284,5],[448,1284,4],[493,1294,3],[538,1311,1]],'strength':0.55,'confidence':0.8},
 {'id':'foreground_middle_glint_arc','points':[[275,1376,1],[315,1359,4],[356,1347,7],[397,1341,5],[440,1342,4],[478,1348,5],[508,1355,8],[551,1384,1]],'strength':0.75,'confidence':0.9},
 {'id':'foreground_low_glint_arc','points':[[298,1456,1],[331,1443,3],[363,1430,6],[399,1426,5],[440,1427,4],[479,1433,4],[514,1441,6],[554,1457,1]],'strength':0.7,'confidence':0.9},
]
# A small set of independently traced silky reflection lanes. Refine each hand anchor
# onto a nearby cyan ridge; a +/-5px search cannot jump to a different channel lane.
MID_SHEENS={
 'mid_cyan_left_turn':[[365,601,3],[382,614,4],[408,625,5],[445,640,5],[465,660,3]],
 'mid_cyan_right_turn':[[602,631,3],[641,646,5],[668,670,6],[676,690,6],[654,715,6],[626,736,3]],
 'mid_cyan_left_sweep':[[401,728,3],[369,744,4],[330,763,5],[297,782,6],[263,804,5],[235,828,4],[215,848,2]],
 'mid_cyan_near_right':[[637,746,3],[600,756,4],[566,768,5],[542,784,6],[527,803,5],[524,825,3]],
 'near_cyan_left_long':[[277,891,3],[249,915,5],[216,942,7],[187,967,5],[165,993,2]],
 'near_cyan_right_long':[[650,1048,2],[683,1082,4],[719,1115,5],[753,1136,7],[775,1151,2]],
}
cyan_score=gaussian_filter(blur[:,:,1]-0.25*blur[:,:,0]+0.15*blur[:,:,2],1.1)
for name,anchors in MID_SHEENS.items():
 refined=[]
 for i,point in enumerate(anchors):
  p=np.array(point[:2],dtype=float)
  before=np.array(anchors[max(0,i-1)][:2]);after=np.array(anchors[min(len(anchors)-1,i+1)][:2])
  tangent=after-before;normal=np.array([-tangent[1],tangent[0]])/max(1,np.linalg.norm(tangent))
  options=[]
  for delta in range(-5,6):
   q=p+normal*delta;x,y=np.rint(q).astype(int)
   if 0<=x<W and 0<=y<H and water[y,x]:options.append((cyan_score[y,x]-0.18*delta*delta,q))
  if options:p=max(options,key=lambda a:a[0])[1]
  refined.append([round(float(p[0]),2),round(float(p[1]),2),point[2]])
 result['sheens'].append({'id':name,'points':refined,'strength':0.42,'confidence':0.75,
  'extraction':'Manual cyan reflection spine with +/-5px local cyan-ridge refinement; no occluded spans intentionally bridged'})

COLOR_PATCHES={
 'cyan_shadow':[(431,1238)],
 'cyan_body':[(400,1390),(230,977),(469,1402),(574,698)],
 'cyan_sheen':[(609,739),(436,1340),(403,1287)],
 'magenta_shadow':[(307,608),(685,800),(368,677)],
 'magenta_body':[(129,841),(640,1266)],
 'magenta_sheen':[(300,631),(191,1276)],
 'violet_transition':[(667,844)],
}
for role,locations in COLOR_PATCHES.items():
 for x,y in locations:
  if excluded[y-2:y+3,x-2:x+3].any():continue
  patch=rgb[y-2:y+3,x-2:x+3].reshape(-1,3)
  # Avoid making a white highlight into the palette body colour.
  valid=patch.min(axis=1)<195
  if valid.sum()<5:continue
  sample=np.median(patch[valid],axis=0)
  c=sample/255.;linear=np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
  result['colorSamples'].append({'role':role,'center':[x,y],'radiusPx':2,
   'srgb255':sample.round(2).tolist(),'linearSRGB':linear.round(6).tolist(),
   'sourceMedianAbsoluteDeviation':np.median(abs(patch[valid]-sample),axis=0).round(2).tolist(),
   'confidence':0.85,'note':'Measured display colour; fit through existing renderer post chain, do not reuse directly as linear shader RGB.'})

(OUT/'reference-features.json').write_text(json.dumps(result,indent=2)+'\n')
(OUT/'glint-candidates.json').write_text(json.dumps(candidates[:120],indent=2)+'\n')

# Bold colour means measured core; thin lime edges mean shoulder. No style is inferred from overlay colours.
over=image.copy();d=ImageDraw.Draw(over)
for band in bands:
 pts=band['points']
 for key,col in [('left','#b6ff00'),('right','#b6ff00'),('coreLeft','#ff9100'),('coreRight','#ff9100')]:
  d.line([(p[key],p['y']) for p in pts],fill=col,width=2)
 for p in pts[::3]:d.ellipse((p['center']-2,p['y']-2,p['center']+2,p['y']+2),fill='black',outline='white')
for feature in result['sheens']:
 d.line([(p[0],p[1]) for p in feature['points']],fill='#ffba00',width=2)
for i,feature in enumerate(result['glints']):
 points=feature['points'];d.line([(p[0],p[1]) for p in points],fill='#24ff81',width=2)
 x,y,_=points[len(points)//2];d.text((x+3,y-9),str(i+1),fill='#24ff81',stroke_width=1,stroke_fill='black')
d.rectangle((0,0,W,34),fill='black');d.text((12,9),'QA ANNOTATION OF APPROVED REFERENCE — NOT A GAME RENDER',fill='white')
over.save(OUT/'reference-extraction-overlay.png')
print(json.dumps({'bands':{b['id']:len(b['points']) for b in bands},'candidates':len(candidates),'out':str(OUT/'reference-features.json')}))
print(json.dumps({'glints':len(result['glints']),'sheens':len(result['sheens']),'colorSamples':len(result['colorSamples'])}))
