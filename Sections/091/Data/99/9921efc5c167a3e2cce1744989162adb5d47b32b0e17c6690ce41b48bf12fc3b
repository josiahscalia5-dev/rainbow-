/** Seat the fifteen approved coins on the new curve and verify the untouched gameplay route. */
import { build } from 'esbuild';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [fitFile, reportFile] = process.argv.slice(2);
const fit = JSON.parse(await readFile(fitFile,'utf8'));
const photos = JSON.parse(await readFile('assets/textures/match06/coins06.json','utf8'));
const tmp = await mkdtemp(join(tmpdir(),'rainbow-seat-pictured-coins-'));
try {
  const compiled = join(tmp,'survey.mjs');
  await build({stdin:{contents:"export {Course,validateContinuity} from './src/world/course.ts'; export {coinLayout} from './src/gameplay/coins.ts';",resolveDir:process.cwd(),loader:'ts'},outfile:compiled,bundle:true,platform:'node',format:'esm',logLevel:'silent',define:{'import.meta.env':'{}'}});
  const {Course,validateContinuity,coinLayout}=await import(pathToFileURL(compiled).href);
  globalThis.location={search:'?match06=1'};
  const previous=new Course();
  const baselineCoins=coinLayout(previous);
  globalThis.location={search:'?match06=1&cx06CrestRoute=1'};
  const course=new Course(),stage=course.stage('06');
  const samples=[];
  for(let s=stage.s0+3.5;s<=stage.s1-1;s+=.05)samples.push(course.sample(s));
  const eye=course.sample(stage.s0).pos.clone().fromArray(photos.faceTo);

  function localFrame(point){
    let closest=samples[0],distance=Infinity;
    for(const sample of samples){
      const d=point.distanceToSquared(sample.pos);
      if(d<distance){closest=sample;distance=d;}
    }
    const along=s=>{const sample=course.sample(s);return point.clone().sub(sample.pos).dot(sample.tan);};
    let lo=closest.s-.12,hi=closest.s+.12;
    for(let i=0;i<28;++i){const mid=(lo+hi)/2;if(along(mid)>0)lo=mid;else hi=mid;}
    const frame=course.sample((lo+hi)/2);
    const delta=point.clone().sub(frame.pos);
    return {s:frame.s,lat:delta.dot(frame.right),h:delta.dot(frame.up),along:delta.dot(frame.tan)};
  }

  const rows=[];
  for(const picture of photos.coins){
    const old=previous.sample(picture.s);
    const origin=previous.pointAt(picture.s,picture.lat,picture.h);
    const direction=origin.clone().sub(eye);
    const phase=baselineCoins.findIndex(x=>Math.abs(x.s-picture.s)<1e-7&&x.scale===picture.scale);
    if(phase<0)throw Error('Cannot identify a preserved coin');
    let best;
    for(let i=0;i<=130;++i){
      const fraction=.58+i*.0065;
      const depth=i===65?1:fraction;
      const point=eye.clone().addScaledVector(direction,depth);
      const seat=localFrame(point);
      // Physical support and clearance come first. Use the previous depth when it already works.
      const below=Math.max(0,.095-seat.h), high=Math.max(0,seat.h-1.0), outside=Math.max(0,Math.abs(seat.lat)-1.18);
      const cost=1000*(below*below+high*high+outside*outside)+18*(depth-1)**2+.01*(seat.h-picture.h)**2;
      if(!best||cost<best.cost)best={cost,depth,seat,point};
    }
    const {s,lat,h,along}=best.seat;
    if(Math.abs(along)>.025 || Math.abs(lat)>1.55 || h<.025 || h>1.3)throw Error('The pictured coin could not sit on this curve: '+JSON.stringify({s,lat,h,along,centre:picture.px}));
    rows.push({s,lat,h,scale:picture.scale*best.depth,origin:best.point.toArray(),animatedUp:old.up.clone().multiplyScalar(best.depth).toArray(),phase,depthRatio:best.depth});
  }
  fit.coins=rows;
  await writeFile(fitFile,JSON.stringify(fit)+'\n');
  let outsideMax=0,centreMax=0,maxDeltaSpeed=0;
  let previousBase,previousNew;
  for(let s=0;s<=course.length;s+=.1){
    const a=previous.sample(s),b=course.sample(s);
    const diff=a.pos.distanceTo(b.pos);
    if(s<stage.s0+fit.begin-.26||s>stage.s0+fit.end+.26)outsideMax=Math.max(outsideMax,diff,a.up.distanceTo(b.up),a.tan.distanceTo(b.tan));
    else centreMax=Math.max(centreMax,diff);
    if(previousBase)maxDeltaSpeed=Math.max(maxDeltaSpeed,Math.abs(b.pos.distanceTo(previousNew)-a.pos.distanceTo(previousBase))/.1);
    previousBase=a.pos;previousNew=b.pos;
  }
  const continuity=validateContinuity(course);
  const report={base:validateContinuity(previous),experiment:continuity,sameStageStations:JSON.stringify(previous.stages)===JSON.stringify(course.stages),
    unchangedMaxOutsideSection:outsideMax,maxCentreShift:centreMax,maxLocalSpeedDifferenceFraction:maxDeltaSpeed,
    fifteenCoins:rows.map((r,i)=>({sourcePixel:photos.coins[i].px,depthRatio:r.depthRatio,s:r.s,lateral:r.lat,height:r.h})),
    identicalModelAtOpening:previous.sample(stage.s0+10).pos.distanceTo(course.sample(stage.s0+10).pos)===0};
  await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({ok:continuity.ok,angle:continuity.maxStepTangentDeg,shift:centreMax,outside:outsideMax,speed:report.maxLocalSpeedDifferenceFraction,coinDepthRange:[Math.min(...rows.map(r=>r.depthRatio)),Math.max(...rows.map(r=>r.depthRatio))]}));
  if(!continuity.ok || !report.sameStageStations || outsideMax!==0 || !report.identicalModelAtOpening)throw Error('Route did not pass continuity, station or opening protections');
} finally {
  await rm(tmp,{recursive:true,force:true});
}
