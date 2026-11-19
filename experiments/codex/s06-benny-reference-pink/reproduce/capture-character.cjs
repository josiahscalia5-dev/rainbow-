const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const {open,pose} = require('./capture.cjs');
(async()=>{
  const dir=path.join(process.env.RAINBOW_RUN || __dirname,'authoring');
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  try {
    const errors=[];
    const page=await open(browser,'06','NEW',{width:864,height:1536},errors);
    await pose(page,'06',['opening','forward',0]);
    await page.screenshot({path:path.join(dir,'character-full.png')});
    for(const name of ['Benny','fur_body','hat','hat_brim','fur_pom','fur_armL','fur_armR']) {
      const original=await page.evaluate(name=>{
        const r=window.__rainbow,part=r.qa3d().scene.getObjectByName(name);
        if(!part)throw Error(name);
        const v=part.visible;part.visible=false;r.drawList();return v;
      },name);
      await page.screenshot({path:path.join(dir,'hide-'+name+'.png')});
      await page.evaluate(([name,v])=>{const r=window.__rainbow;r.qa3d().scene.getObjectByName(name).visible=v;r.drawList()},[name,original]);
    }
    if(errors.length)throw Error(errors.join(' | '));
    await page.close();
    console.log('Captured seven independent native actor visibility masks.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
