const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { open, pose } = require('./capture.cjs');
const dir = path.join(process.env.RAINBOW_DIAGNOSTICS || __dirname, 'floor-isolation');
(async() => {
  fs.mkdirSync(dir, {recursive:true});
  const browser = await chromium.launch({executablePath:process.env.RAINBOW_CHROMIUM || '/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  try {
    const errors=[];
    const page=await open(browser,'06','BEFORE',{width:864,height:1536},errors);
    const report={opening:await pose(page,'06',['opening','forward',0])};
    await page.evaluate(()=>{
      const scene=window.__rainbow.qa3d().scene;
      const floor=scene.getObjectByName('m06_floor');
      window.__floorSource=floor.material.fragmentShader;
      window.__actorVisible=scene.getObjectByName('Benny').visible;
    });
    for(const visible of [true,false]){
      for(const value of [0.02,0.8]){
        await page.evaluate(([visible,value])=>{
          const r=window.__rainbow,s=r.qa3d().scene;
          const m=s.getObjectByName('m06_floor').material;
          m.fragmentShader=window.__floorSource.replace('gl_FragColor = vec4(pjInverse(t), 1.0);','gl_FragColor = vec4(vec3('+value.toFixed(3)+'), 1.0);');
          if(m.fragmentShader===window.__floorSource)throw Error('Floor shader marker missing');
          m.needsUpdate=true;s.getObjectByName('Benny').visible=visible;r.drawList();
        },[visible,value]);
        await page.screenshot({path:path.join(dir,(visible?'with-Benny':'without-Benny')+(value===0.02?'-dark.png':'-bright.png')),animations:'disabled'});
      }
    }
    await page.evaluate(()=>{
      const r=window.__rainbow,scene=r.qa3d().scene,m=scene.getObjectByName('m06_floor').material;
      m.fragmentShader=window.__floorSource;m.needsUpdate=true;scene.getObjectByName('Benny').visible=window.__actorVisible;r.drawList();
    });
    report.release=await pose(page,'06',['crest-release','forward',1.1]);
    report.projectedSamples=await page.evaluate(async()=>{
      const r=window.__rainbow,d=r.qa3d(),floor=d.scene.getObjectByName('m06_floor'),m=floor.material;
      const source=performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/three\.js(?:\?|$)/.test(n));
      const {Raycaster,Vector2}=await import(source || '/node_modules/three/build/three.module.js');
      const ray=new Raycaster(),pts=[];
      for(const y of [1080,1120,1160,1200,1240])for(const x of [290,350,410,470,530,570]){
        ray.setFromCamera(new Vector2(2*(x+.5)/864-1,1-2*(y+.5)/1536),d.camera);
        const hit=ray.intersectObject(floor,false)[0];if(!hit)continue;
        const pj=hit.point.clone().applyMatrix4(m.uniforms.uProjVP.value);
        pts.push({pixel:[x,y],platePixel:[(pj.x+1)*432,(1-pj.y)*768].map(v=>Number(v.toFixed(3)))});
      }
      return {points:pts,material:'m06_floor',openingProjector:m.uniforms.uProjPos.value.toArray(),releaseCamera:d.camera.position.toArray()};
    });
    fs.writeFileSync(path.join(dir,'probes.json'),JSON.stringify(report,null,2)+'\n');
    await page.close();if(errors.length)throw Error(errors.join('\n'));
    console.log('Captured native actor occlusion and release samples.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
