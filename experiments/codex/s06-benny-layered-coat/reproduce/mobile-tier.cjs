/** Capture the project's mobile fur tier in the real desktop WebGL renderer. */
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{open,pose}=require('./capture.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 const dir=path.join(__dirname,'mobile-tier');fs.mkdirSync(dir,{recursive:true});const proof={};
 const errors=[];
 try{
  for(const variant of ['BEFORE','NEW']){
   const page=await open(browser,'06',variant,{width:864,height:1536},errors);
   for(const row of [['opening','forward',0],['hard-right','forward',12,1]]){
    const tested=await pose(page,'06',row);
    const result=await page.evaluate(()=>{
     const engine=window.__rainbow.qa3d();
     const body=engine.scene.getObjectByName('fur_body');
     return {shells:body.count,geometry:body.geometry.getAttribute('position').count,draws:engine.renderer.info.render.calls,contextLost:engine.renderer.getContext().isContextLost()};
    });
    if(result.shells!==12||result.contextLost)throw Error('Unexpected real low-quality shell count or context loss');
    await page.screenshot({path:path.join(dir,variant+'-'+row[0]+'.png'),timeout:100000});
    proof[variant+'-'+row[0]]={...result,state:tested.state,camera:tested.camera,shaderTime:tested.shaderTime};
   }
   await page.close();
  }
  if(errors.length)throw Error(errors.join(' | '));
  for(const name of ['opening','hard-right']){
   const a=proof['BEFORE-'+name],b=proof['NEW-'+name];
   if(JSON.stringify(a)!==JSON.stringify(b))throw Error('Mobile-tier comparison state differs '+name);
  }
  fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify({renderer:'Chromium WebGL 2 via SwiftShader, forced quality=low. Hardware performance was not measured.',captures:proof},null,2)+'\n');
  console.log('Retained and trial drew the same 12 real mobile-tier shells at both viewpoints.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
