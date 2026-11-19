'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(process.argv[2]);
const output = process.argv[3];
const mime = {'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.glb':'model/gltf-binary','.css':'text/css'};
const server = http.createServer((req,res)=>{
  const url = new URL(req.url, 'http://127.0.0.1');
  const name = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(root, name);
  if ((!file.startsWith(root + path.sep)) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end(); return;
  }
  res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const origin = 'http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.env.RAINBOW_CHROMIUM||'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking']});
  try {
    const results={};
    for(const kind of ['opening','inlet','full']){
      console.log('Opening',kind);
      const page=await browser.newPage({viewport:{width:288,height:512},deviceScaleFactor:1});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
      await page.goto(origin);
      await page.locator('a[href*="reviewStart='+kind+'"]').click();
      await page.waitForFunction(k=>window.__error || (window.__rainbow?.ready && (k==='full' || window.__rainbow.state().stage==='06')),kind,{timeout:120000});
      console.log('Game ready',kind);
      const state= await page.evaluate(()=>{
        if(window.__error)throw new Error(window.__error);
        const game=window.__rainbow;
        game.run(false);
        const q=game.qa3d();
        const families=[];
        q.scene.traverse(obj=>{if(obj.name.startsWith('m06_crest_')) families.push(obj.name);});
        return {stage:game.state().stage,s:game.state().s,hearts:game.state().hearts,coins:game.state().coins,contextLost:q.renderer.getContext().isContextLost(),candidateMeshes:families,drawCalls:q.renderer.info.render.calls};
      });
      if(state.contextLost || state.drawCalls<1 || errors.length) throw new Error(kind+' failed '+JSON.stringify({state,errors}));
      if(kind!=='full' && !['m06_crest_upper_water','m06_crest_outer_soffit'].every(name=>state.candidateMeshes.includes(name)))throw new Error('Candidate crest missing '+JSON.stringify(state));
      if(kind!=='full'){
        const movement = await page.evaluate(()=>{
          const r=window.__rainbow;
          const initial=r.state();
          r.unfreeze();
          window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft'}));
          r.step(12);
          window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowLeft'}));
          const left=r.state();
          window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight'}));
          r.step(36);
          window.dispatchEvent(new KeyboardEvent('keyup',{key:'ArrowRight'}));
          const right=r.state();
          return {start:initial.lat,left:left.lat,right:right.lat,forward:right.s-initial.s};
        });
        if(!(movement.left<movement.start && movement.right>movement.left && movement.forward>0)) throw new Error(JSON.stringify(movement));
        state.liveSteering=movement;
      }
      results[kind]=state;
      console.log('Verified',kind,state.stage,state.drawCalls);
      await page.close();
    }
    fs.writeFileSync(output,JSON.stringify(results,null,2)+'\n');
    console.log(JSON.stringify(results));
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e); server.close();process.exitCode=1});
