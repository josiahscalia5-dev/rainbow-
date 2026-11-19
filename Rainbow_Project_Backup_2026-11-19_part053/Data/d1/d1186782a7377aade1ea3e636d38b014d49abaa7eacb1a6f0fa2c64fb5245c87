const { chromium } = require('playwright');
const { open, pose } = require('./capture.cjs');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  try {
    const errors = [];
    const p = await open(browser,'06','BEFORE',{width:864,height:1536},errors);
    await pose(p,'06',['opening','forward',0]);
    const report = await p.evaluate(()=>{
      const {renderer,scene,composer}=window.__rainbow.qa3d(), mesh=scene.getObjectByName('hat_brim');
      const pos=mesh.geometry.getAttribute('position'),uv=mesh.geometry.getAttribute('uv');
      const heights = Array.from({length:pos.count},(_,i)=>[pos.getY(i),uv.getY(i)]).sort((a,b)=>a[0]-b[0]);
      const uniforms={};for(const pass of composer.passes){for(const [k,v] of Object.entries(pass.uniforms||{})){if(typeof v.value==='number'&&/sat|contr|vig/i.test(k)) uniforms[k]=v.value;}}
      const m=mesh.material;const item={heightUv:[heights[0],heights.at(-1)],uniforms,exposure:renderer.toneMappingExposure,originalColor:m.color.toArray(),mapSize:m.map?.image.width,normalSize:m.normalMap?.image.width};
      mesh.material=m.clone();return item;
    });
    for(const albedo of [0.08,0.28]){
      await p.evaluate(k=>{const r=window.__rainbow;const m=r.qa3d().scene.getObjectByName('hat_brim').material;m.map=null;m.normalMap=null;m.color.setScalar(k);m.needsUpdate=true;r.drawList()},albedo);
      await p.screenshot({path:'calibration-'+albedo+'.png',animations:'disabled'});
    }
    if(errors.length)throw Error(errors.join('\n'));
    fs.writeFileSync('cuff-calibration.json',JSON.stringify(report,null,2)+'\n');
    console.log('Retained physical cuff and lighting calibrated',JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
