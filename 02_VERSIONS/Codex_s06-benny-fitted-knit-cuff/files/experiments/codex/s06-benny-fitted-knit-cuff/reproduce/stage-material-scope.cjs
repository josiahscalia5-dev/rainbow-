const fs = require('node:fs');
const { chromium } = require('playwright');
const { open, pose } = require('./capture.cjs');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try {
   const errors=[],p=await open(browser,'06','NEW',{width:864,height:1536},errors);
   const measurements=[];
   for(const screen of ['05','06','07','06','05']){
     await pose(p,screen,['opening','forward',0]);
     const value=await p.evaluate(()=>{
        const r=window.__rainbow,m=r.qa3d().scene.getObjectByName('hat_brim').material;
        return {stage:r.state().stage,map:[m.map?.image.width,m.map?.image.height],normal:m.normalMap?.image.width||null,bump:m.bumpMap?.image.width||null,material:m.uuid};
     });
     assert.equal(value.stage,screen);
     assert.equal(value.map[0],screen==='06'?192:1024);
     measurements.push(value);
   }
   assert.equal(measurements[0].material,measurements[2].material);
   assert.equal(measurements[0].material,measurements[4].material);
   assert.equal(measurements[1].material,measurements[3].material);
   assert.deepEqual(errors,[]);
   fs.writeFileSync('stage-material-scope.json',JSON.stringify({verified:true,sequence:measurements},null,2)+'\n');console.log('Cuff restores the same original material on both adjacent screens');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
