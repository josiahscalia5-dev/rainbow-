const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const w=process.cwd(), game=path.join(w,'game'), deps=process.env.RAINBOW_DEPS;
const target=path.join(w,'comparison');fs.mkdirSync(target,{recursive:true});
const binary=path.join(w,'image2blender-runs/s07_banks/s07-banks.glb');
const query=fs.readFileSync(path.join(w,'kept-query.txt'),'utf8').trim();
async function main(){
  const {createServer}=await import(pathToFileURL(path.join(deps,'node_modules/vite/dist/node/index.js')).href);
  const server=await createServer({root:game,cacheDir:path.join(w,'vite-cache'),logLevel:'error',optimizeDeps:{entries:['index.html','__s07_experiment.mjs'],include:['three','three/addons/loaders/GLTFLoader.js']},
    server:{host:'127.0.0.1',hmr:false,watch:{ignored:['**/*']},fs:{allow:[game,deps,path.join(w,'vite-cache')]}}});
  await server.listen();
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:864,height:1536},deviceScaleFactor:1});
  page.setDefaultTimeout(100000);
  const evidence={sourceCommit:'8651edf92525a9aab82b02fad9aa44621216708a',query,checks:{},poses:{},browserErrors:[],failedResources:[]};
  page.on('pageerror',e=>evidence.browserErrors.push(e.message));
  page.on('console',m=>{if(m.type()==='error') evidence.browserErrors.push(m.text().slice(0,1800));});
  page.on('response',r=>{if(r.status()>=400)evidence.failedResources.push([r.status(),new URL(r.url()).pathname]);});
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname==='/__s07_banks.glb') return route.fulfill({path:binary,contentType:'model/gltf-binary'});
    return ['','127.0.0.1','localhost'].includes(url.hostname)?route.continue():route.abort();
  });
  try {
    await page.goto(server.resolvedUrls.local[0]+'?qa=1&dpr=1&'+query,{timeout:120000});
    await page.waitForFunction(()=>window.__rainbow?.ready || window.__error,null,{timeout:120000});
    const init=await page.evaluate(()=>window.__error);if(init)throw new Error(init);
    await page.evaluate(()=>document.fonts.ready);
    evidence.import=await page.evaluate(async()=>{
      const m=await import('/__s07_experiment.mjs');
      window.bankTest=await m.prepareExperiment();
      return window.bankTest.evidence;
    });
    const rows=[
      ['opening',0,null],['forward06',6,null],['forward10',10,null],['forward18',18,null],
      ['left12',12,-1],['right12',12,1],['plunge66','0.66',null]
    ];
    for(const [name,distance,steer] of rows){
      const pose=await page.evaluate(([distance,steer])=>{
        const r=window.__rainbow;
        window.bankTest.set(false);r.run(false);r.goto('07');
        const start=r.state().s,end=r.course.stage('07').s1;
        const target=typeof distance==='string'?start+Number(distance)*(end-start):start+distance;
        r.setSteer(steer);
        let frames=0;
        while(r.state().s<target-.001 && frames<1500) { r.step(1);frames++; }
        r.setSteer(null);r.drawList();
        return {start,target,frames,state:r.state(),camera:r.camera(),benny:r.bennyScreen()};
      },[distance,steer]);
      await page.waitForTimeout(370);
      await page.screenshot({path:path.join(target,'CLAUDIA_BEFORE_'+name+'.png'),animations:'disabled',timeout:100000});
      const pair=await page.evaluate(()=>{
        const r=window.__rainbow;window.bankTest.set(true);
        const draws=r.drawList();
        return {state:r.state(),camera:r.camera(),benny:r.bennyScreen(),draws:draws.filter(([name])=>name.includes('Image2Blender'))};
      });
      if(pose.state.stage!=='07'||JSON.stringify(pose.camera)!==JSON.stringify(pair.camera)||JSON.stringify(pose.state)!==JSON.stringify(pair.state))throw new Error('Unmatched simulation state at '+name);
      await page.screenshot({path:path.join(target,'IMAGE2BLENDER_TEST_'+name+'.png'),animations:'disabled',timeout:100000});
      evidence.poses[name]={...pose,matchedCameraAndState:true,bankDraws:pair.draws};
      fs.writeFileSync(path.join(target,'runtime.json'),JSON.stringify(evidence,null,2));
      console.log(name,pose.state.s,pose.state.lat,pose.state.coins,JSON.stringify(pair.draws));
    }
    const script=fs.readFileSync(path.join(w,'inputs-gameplay-test.mjs'),'utf8');
    const begin='const result = await page.evaluate(';
    const from=script.indexOf(begin)+begin.length;
    const end=script.indexOf('\n});\n\nresult.errors = errors;',from);
    if(from<begin.length || end<0) throw new Error('Unrecognized game QA runner');
    const callback=script.slice(from,end)+'\n}';
    for(const [label,active] of [['claudiaBefore',false],['image2blenderTest',true]]) {
      await page.evaluate(active=>{window.bankTest.set(active);window.__rainbow.run(false);},active);
      const result=await page.evaluate('('+callback+')()');
      const pass=Object.values(result.checks).filter(c=>c.pass).length;
      const coin=result.checks.realCoinPickups;
      evidence.checks[label]={...result,passes:pass,tests:Object.keys(result.checks).length};
      console.log(label,pass,coin.collected,coin.endCoins);
      if(pass!==8||coin.collected!==91||coin.endCoins!==2240)throw new Error('Gameplay regression on '+label);
    }
    if(evidence.browserErrors.length||evidence.failedResources.length)throw new Error('Browser or resource error. '+JSON.stringify([evidence.browserErrors,evidence.failedResources]).slice(0,500));
  } finally {
    fs.writeFileSync(path.join(target,'runtime.json'),JSON.stringify(evidence,null,2));
    await browser.close();await server.close();
  }
}
main().catch(e=>{console.error(e.stack);process.exitCode=1});
