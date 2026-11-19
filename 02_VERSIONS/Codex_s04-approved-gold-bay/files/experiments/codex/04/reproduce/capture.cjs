const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const [mode, ...jobs] = process.argv.slice(2);
const root = process.env.RAINBOW_RUN || __dirname;
const queries = require(path.join(root, 'queries.json'));
const flags = require(path.join(root, 'flags.json'));
const size = {width:864,height:1536};
const features = {
 '04':[['passing-arrows','fraction',.32]],
 '05':[['last-left-bend','fraction',.81,-1],['last-right-bend','fraction',.96,1]],
 '06':[['crest-release','forward',1.1],['arch-exit','fraction',.82]],
 '07':[['plunge-lip','drop',0],['halfway-down','drop',.5],['two-thirds-down','drop',2/3],['plunge-bottom','drop',.97]],
 '08':[['platform-and-spouts','forward',7.5],['river-bend','fraction',.67]]
};
function views(id) {
 if(mode==='repeat')return [['opening','forward',0]];
 if(mode==='quick')return [['opening','forward',0],['forward-10','forward',10],['hard-left','forward',12,-1],['hard-right','forward',12,1],['deep','fraction',.76]];
 return [
 ['opening','forward',0],['forward-03','forward',3],['forward-06','forward',6],['forward-10','forward',10],['forward-20','forward',20],
 ['hard-left','forward',12,-1],['hard-right','forward',12,1],['inlet','fraction',.006],['middle','fraction',.50],['deep','fraction',.76],
 ...features[id],['last-in-stage','exit',-.45],['across-transition','exit',.65]];
}
async function open(browser,id,variant,view,problems) {
 const page=await browser.newPage({viewport:view,deviceScaleFactor:1});
 page.setDefaultTimeout(125000);
 page.on('pageerror',e=>problems.push(e.message));
 page.on('console',m=>{if(m.type()==='error')problems.push(m.text().slice(0,2500))});
 page.on('response',r=>{if(r.status()>=400)problems.push(r.status()+' '+new URL(r.url()).pathname)});
 await page.route('**/*',r=>['','127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());
 await page.addInitScript(()=>{
   const nativeNow=performance.now.bind(performance);
   const nativeTimeout=window.setTimeout.bind(window);
   let now=null, nextId=-1, queue=[];
   performance.now=()=>now===null?nativeNow():now;
   window.setTimeout=(callback,delay,...args)=>{
     if(now!==null && typeof callback==='function' && [180,2600,3500].includes(delay)){
       queue.push({when:now+delay,callback,args});return nextId--;
     }
     return nativeTimeout(callback,delay,...args);
   };
   window.__captureTime=(ms,reset=false)=>{
     if(reset)queue=[];
     now=ms;
     const due=queue.filter(item=>item.when<=now);queue=queue.filter(item=>item.when>now);
     due.forEach(item=>item.callback(...item.args));
   };
 });
 const host=process.env.RAINBOW_BASE_URL || ('http://127.0.0.1:'+(5800+Number(id)));
 const q=queries[id]+(variant==='NEW'?'&'+flags[id]:'');
 await page.goto(host+'/?qa=1&dpr=1&'+q,{timeout:150000});
 await page.waitForFunction(()=>window.__rainbow?.ready || window.__error,null,{timeout:180000});
 const error=await page.evaluate(()=>window.__error);if(error)throw Error(error);
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
async function pose(page,id,row){
 return page.evaluate(([id,[name,kind,value,steer=0]])=>{
   const r=window.__rainbow;const range=r.course.stage(id);const prev=String(Number(id)-1).padStart(2,'0');
   const base=12000;window.__captureTime(base,true);r.run(false);
   let target,n=0;
   if(kind==='forward'){
     r.goto(id);target=r.state().s+value;
     if(target>=range.s1)return {name,skip:'Outside the stage',target,exit:range.s1};
   }else{
     r.startRideAt(prev);r.unfreeze();r.setSteer(0);r.step(1);
     target=kind==='exit'?range.s1+value:kind==='drop'?r.course.marks['07_plunge_top']+value*(r.course.marks['07_plunge_bottom']-r.course.marks['07_plunge_top']):range.s0+value*(range.s1-range.s0);
   }
   while(r.state().s<target-.001&&n<6000){
     n++;window.__captureTime(base+n*1000/60);
     r.setSteer(steer && r.state().s>=target-12?steer:0);r.step(1);
   }
   r.setSteer(null);if(kind!=='forward'||value)r.freezeAt(12+n/60);
   const state=r.state(),d=r.qa3d();
   // Give the game's own damage feedback time to clear at the same held pose.
   if(state.hearts<5){window.__captureTime(base+n*1000/60+500);r.freezeAt(12+n/60)}
   const draws=r.drawList();
   const render=d.renderer.info.render, gl={calls:render.calls,triangles:render.triangles,textures:d.renderer.info.memory.textures,contextLost:d.renderer.getContext().isContextLost()};
   const landmarks={};
   if(id==='07'){
     const obj=d.scene.getObjectByName('m07_paddle2');if(obj){const c=obj.getWorldPosition(obj.position.clone()).project(d.camera);landmarks.paddleCenter=[(1+c.x)*r.camera().width/2,(1-c.y)*r.camera().height/2,c.z];}
   }
   return {name,kind,value,steer,simFrames:n,target,stageBounds:[range.s0,range.s1],clock:12+n/60,shaderTime:performance.now()/1000,state,camera:r.camera(),gl,draws,landmarks,benny:r.bennyScreen()};
 },[id,row]);
}
async function gameplay(page,id){
 let f=path.join(root,'games',id,'scripts/gameplay-test.mjs');
 if(!fs.existsSync(f))f=path.join(process.cwd(),'scripts/gameplay-test.mjs');
 const text=fs.readFileSync(f,'utf8'),m='const result = await page.evaluate(',i=text.indexOf(m)+m.length,j=text.indexOf('\n});\n\nresult.errors = errors;',i);
 if(i<m.length || j<0)throw Error('Unrecognized gameplay suite');
 const v=await page.evaluate('('+text.slice(i,j)+'\n})()');
 const picks=v.checks.realCoinPickups;
 if(Object.values(v.checks).filter(x=>x.pass).length!==8||picks.collected!==91||picks.startCoins!==1330||picks.endCoins!==2240)throw Error('Gameplay regression in '+id);
 return v;
}
async function route(page,id,dir){
 const area=await page.evaluate(id=>{
   const r=window.__rainbow;r.run(false);window.__captureTime(12000,true);
   r.startRideAt(String(Number(id)-1).padStart(2,'0'));r.unfreeze();r.setSteer(0);
   let n=0;const range=r.course.stage(id);
   while(r.state().s<range.s0+.04 && n<4500){n++;window.__captureTime(12000+n*1000/60);r.step(1)}
   return {s0:range.s0,s1:range.s1,clock:12000+n*1000/60};
 },id);
 const proc=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-vcodec','mjpeg','-r','12','-i','pipe:0','-c:v','libx264','-threads','2','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',path.join(dir,'ride.mp4')],{stdio:['pipe','ignore','pipe']});
 let log='';proc.stderr.on('data',b=>log+=b.toString());
 const done=new Promise((yes,no)=>proc.on('exit',code=>code?no(Error(log)):yes()));
 const frames=[];let exitFrames=0;
 try{
 for(let i=0;i<400;i++){
  const f=await page.evaluate(([id,i,area])=>{
   const r=window.__rainbow,st=r.state();const t=(st.s-area.s0)/(area.s1-area.s0);
   const dir=t<.12?0:t<.33?-1:t<.47?1:t<.64?0:t<.78?.9:t<.91?-.85:0;
   const half=Math.min(2,Math.max(.55,r.course.stage(st.stage).width/2-1.45));
   const feedback=Math.max(-.92,Math.min(.92,(half*dir-st.lat)*.65));
   const entry=t<.12?0:t<.33?-.84:t<.47?.80:t<.64?.03:t<.78?.70:t<.91?-.72:0;
   const steer=id==='04'?entry:feedback;
   r.setSteer(steer);
   if(i)for(let j=1;j<=5;j++){window.__captureTime(area.clock+((i-1)*5+j)*1000/60);r.step(1)}
   r.drawList();const s=r.state(),cam=r.camera();const stats=r.qa3d().renderer.info.render;
   return {i,time:i/12,shaderTime:performance.now()/1000,s:s.s,stage:s.stage,lat:s.lat,steer,hearts:s.hearts,coins:s.coins,camera:cam.position,calls:stats.calls,triangles:stats.triangles};
  },[id,i,area]);
  if(f.hearts!==5|| (frames.length&&f.s<frames[frames.length-1].s))throw Error('Ride did not maintain five hearts or monotonic travel');
  frames.push(f);
  const img=await page.screenshot({type:'jpeg',quality:89,timeout:100000});
  if(!proc.stdin.write(img))await new Promise(ok=>proc.stdin.once('drain',ok));
  if(f.s>area.s1+.4 && ++exitFrames>=3)break;
 }
 }finally{proc.stdin.end();await done}
 if(frames.at(-1).stage===id)throw Error('Ride did not reach exit');
 return {id,area,fps:12,width:324,height:576,gameStep:1/60,frames};
}
async function verifyFullRide(page,margin) {
 return await page.evaluate(margin=>{
  const api=window.__rainbow; api.run(false); api.startRideAt('03'); api.unfreeze(); api.setSteer(0);
  window.__captureTime(12000,true);api.step(1);
  const start=api.state();
  const collisions=[];const samples=[];let count=0;
  while(api.state().mode==='ride' && count<7200){
    const st=api.state();
    const next=api.coinDefs().find(c=>!c.taken && c.s>st.s+.5 && c.s<st.s+12);
    let target=next?next.lat:0;
    if(margin!==null){
      const half=Math.min(api.course.widthAt(st.s),api.course.widthAt(st.s+.7))/2;
      const safe=Math.max(0,half-margin);
      target=Math.max(-safe,Math.min(safe,target));
    }
    api.setSteer(Math.max(-1,Math.min(1,(target-st.lat)*.9)));
    count++;window.__captureTime(12000+count*1000/60);
    const cur=api.step(1);
    if(cur.hearts<st.hearts)collisions.push({s:cur.s,stage:cur.stage,hearts:cur.hearts});
    if(count%60===0)samples.push({s:cur.s,stage:cur.stage,lat:cur.lat,coins:cur.coins,hearts:cur.hearts});
  }
  api.setSteer(null);const end=api.state();
  return {margin,steps:count,start:start.coins,score:end.coins,coins:(end.coins-start.coins)/10,hearts:end.hearts,stage:end.stage,collisions,samples};
 },margin);
}
async function run(browser,job){
 const [id,variant]=job.split(':');const dir=path.join(root,mode==='quick'?'quick':'proof',id,variant);
 fs.mkdirSync(dir,{recursive:true});const problems=[];
 const view=mode==='full-safe'?{width:216,height:384}:(mode==='quick'||mode==='ride')?{width:324,height:576}:size;
 const page=await open(browser,id,variant,view,problems);
 try{
 if(mode==='full-safe'){
  const canonical=await verifyFullRide(page,null);
  let success;
  for(const margin of [.85,.95,1.05,1.15,1.25,1.35]){
   const record=await verifyFullRide(page,margin);
   if(record.coins===91 && record.score===2240 && record.hearts===5 && record.stage==='11' && record.collisions.length===0){success=record;break}
  }
  fs.writeFileSync(path.join(dir,'full-safe-ride.json'),JSON.stringify({canonical,success},null,2));
  if(!success)throw Error('No five-heart, 91-coin full route in the steering trials');
 }else if(mode==='ride'){
  const log=await route(page,id,dir);fs.writeFileSync(path.join(dir,'route.json'),JSON.stringify(log));
 }else{
  const samples=[];
  for(const row of views(id)){
   const entry=await pose(page,id,row);samples.push(entry);if(entry.skip)continue;
   if(row[0]==='across-transition'?entry.state.stage===id:entry.state.stage!==id)throw Error('Unexpected stage at '+entry.name);
   if(entry.state.hearts<5)await page.waitForTimeout(400);
   await page.screenshot({path:path.join(dir,mode==='repeat'?'opening-repeat.png':entry.name+'.png'),timeout:100000,animations:'disabled'});
   if(mode!=='repeat')fs.writeFileSync(path.join(dir,'poses.json'),JSON.stringify(samples));
  }
  if(mode==='stills')fs.writeFileSync(path.join(dir,'gameplay.json'),JSON.stringify(await gameplay(page,id),null,2));
 }
 if(problems.length)throw Error(problems.join(' | ').slice(0,1600));
 console.log(mode,id,variant,'passed');
 }finally{await page.close()}
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.RAINBOW_CHROMIUM||'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking','--disable-background-timer-throttling']});
 try{for(const job of jobs)await run(browser,job)}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
