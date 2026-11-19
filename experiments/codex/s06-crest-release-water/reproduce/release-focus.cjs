const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {open,pose}=require('./capture.cjs');
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.RAINBOW_CHROMIUM||'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  try{
    const roles=[['CLAUDIA','BEFORE',''],['PREVIOUS_FOAM','BEFORE','cx06CrestFoam=1'],['NEW','NEW','']];
    for (const [role,variant,extra] of roles){
      process.env.RAINBOW_EXTRA=extra;
      const errors=[],page=await open(browser,'06',variant,{width:864,height:1536},errors);
      const dir=path.join(__dirname,'release-poses',role);fs.mkdirSync(dir,{recursive:true});const states=[];
      for(const [nm,u] of [['opening',0],['before-release',.6],['crest-release',1.1],['after-release',1.5],['water-exposed',2.2]]){
        states.push(await pose(page,'06',[nm,'forward',u]));
        await page.screenshot({path:path.join(dir,nm+'.png'),animations:'disabled'});
      }
      fs.writeFileSync(path.join(dir,'poses.json'),JSON.stringify(states,null,2)+'\n');
      await page.close();if(errors.length)throw Error(errors.join('\n'));
      console.log('Captured native release sequence',role);
    }
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
