/** Replay the preserved control stream and film the new river from Claudia's exact cameras. */
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {chromium} = require('playwright');
process.argv[2] = 'ride';
const {open} = require('./capture.cjs');
const root = process.env.RAINBOW_RUN || __dirname;
const film = JSON.parse(fs.readFileSync(path.join(root,'proof','06','BEFORE','route.json'),'utf8'));
const destination = path.join(root,'proof','06','NEW_AT_CLAUDIA_CAMERA');
fs.mkdirSync(destination,{recursive:true});
const scratch=path.join(root,'authoring');
fs.mkdirSync(scratch,{recursive:true});
const errors=[];
async function initialize(page){
  return page.evaluate(()=>{
    const api=window.__rainbow;
    api.run(false);window.__captureTime(12000,true);
    api.startRideAt('05');api.unfreeze();api.setSteer(0);
    let n=0;
    const s0=api.course.stage('06').s0;
    while(api.state().s<s0+.04&&n<4500){++n;window.__captureTime(12000+n*1000/60);api.step(1);}
    return 12000+n*1000/60;
  });
}
async function step(page,frame,clock){
  return page.evaluate(([i,steer,clock])=>{
    const api=window.__rainbow;api.setSteer(steer);
    if(i)for(let j=1;j<=5;++j){window.__captureTime(clock+((i-1)*5+j)*1000/60);api.step(1);}
    return {state:api.state(),camera:api.camera()};
  },[frame.i,frame.steer,clock]);
}
async function camera(page,frame){
  return page.evaluate(frame=>{
    const api=window.__rainbow,cam=api.qa3d().camera;
    cam.matrix.fromArray(frame.matrixWorld);
    cam.matrix.decompose(cam.position,cam.quaternion,cam.scale);
    cam.fov=frame.fov;cam.updateProjectionMatrix();cam.updateMatrixWorld(true);api.drawList();
    return api.camera().matrixWorld;
  },frame);
}
async function geometry(page,label){
  const surface=await page.evaluate(()=>{
    const api=window.__rainbow;api.run(false);api.goto('06');api.drawList();
    const mesh=api.qa3d().scene.getObjectByName('m06_floor');
    if(!mesh)throw Error('No retained real-river mesh in this scene');
    const pos=mesh.geometry.getAttribute('position'),uv=mesh.geometry.getAttribute('aTile');
    const stage=api.course.stage('06'), frames=[];
    for(let s=stage.s0;s<stage.s1;s+=.25){const f=api.course.sample(s);frames.push({s,centre:f.pos.toArray(),right:f.right.toArray(),up:f.up.toArray()});}
    return {matrix:mesh.matrixWorld.toArray(),positions:Array.from(pos.array),indices:Array.from(mesh.geometry.index.array),uv:Array.from(uv.array),frames};
  });
  fs.writeFileSync(path.join(scratch,label+'-river.json'),JSON.stringify(surface));
}
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.RAINBOW_CHROMIUM||'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking','--disable-background-timer-throttling']});
  try{
    const before=await open(browser,'06','BEFORE',{width:324,height:576},errors);
    await geometry(before,'retained');
    const start=await initialize(before), cameras=[];
    if(start!==film.area.clock)throw Error('Film start differs');
    for(const frame of film.frames){
      const a=await step(before,frame,start);
      if(a.state.s!==frame.s||a.state.lat!==frame.lat||a.state.coins!==frame.coins||a.camera.position.some((v,i)=>Math.abs(v-frame.camera[i])>1e-7))throw Error('Retained replay diverges at '+frame.i);
      cameras.push(a.camera);
    }
    await before.close();
    const after=await open(browser,'06','NEW',{width:324,height:576},errors);
    await geometry(after,'experiment');
    if(await initialize(after)!==start)throw Error('Experimental inlet differs');
    const proc=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-vcodec','mjpeg','-r','12','-i','pipe:0','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',path.join(destination,'ride.mp4')],{stdio:['pipe','ignore','pipe']});
    let log='';proc.stderr.on('data',b=>log+=b);const done=new Promise((ok,no)=>proc.on('exit',status=>status?no(Error(log)):ok()));
    let largest=0;const states=[];
    try{
      for(const frame of film.frames){
        const live=await step(after,frame,start);
        if(live.state.s!==frame.s||live.state.lat!==frame.lat||live.state.stage!==frame.stage||live.state.hearts!==frame.hearts)throw Error('Experiment motion state diverges at '+frame.i);
        const rendered=await camera(after,cameras[frame.i]);
        largest=Math.max(largest,...rendered.map((v,i)=>Math.abs(v-cameras[frame.i].matrixWorld[i])));
        const image=await after.screenshot({type:'jpeg',quality:97,timeout:100000});
        if(!proc.stdin.write(image))await new Promise(ok=>proc.stdin.once('drain',ok));
        await camera(after,live.camera);
        states.push({i:frame.i,s:frame.s,lat:frame.lat,shaderTime:frame.shaderTime,commonCamera:cameras[frame.i].matrixWorld,newCamera:live.camera.matrixWorld});
      }
    }finally{proc.stdin.end();await done;}
    if(largest>1e-8||errors.length)throw Error('Paired camera filming failed '+largest+' '+errors.join(' | '));
    fs.writeFileSync(path.join(destination,'film-cameras.json'),JSON.stringify({frames:states.length,maxMatrixError:largest,states},null,2)+'\n');
    console.log('Recorded',states.length,'matched-camera game frames; maximum matrix error',largest);
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
