const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {open}=require('./capture.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try{
  const errors=[],p=await open(browser,'07','NEW',{width:216,height:384},errors);
  const result=await p.evaluate(()=>{
    const game=window.__rainbow;game.goto('07');game.drawList();
    const scene=game.qa3d().scene,course=game.course;
    const first=course.stage('08').s0,last=Math.min(first+12,course.stage('08').s1);
    const summary={contactInterval:[first,last],constantSection:[first+1.4,last-2.2],overlapLateral:0.045,overlapVertical:0.035,surfaces:{}};
    for(const name of ['water_ribbon','foam_berm']){
      const geom=scene.getObjectByName(name).geometry,attr=geom.attributes.position;
      const uv=geom.getAttribute(name==='water_ribbon'?'aUV':'aFoam');
      const skirt=geom.getAttribute('aSkirt');let count=0,maxWidthError=0,maxHeightError=0;
      for(let i=0;i<attr.count;i++){
        const s=uv.getY(i);
        if(s<first+1.4||s>last-2.2)continue;
        if(name==='water_ribbon'?skirt.getX(i)!==1:Math.abs(uv.getX(i)+.6)>1e-4)continue;
        const side=name==='water_ribbon'?Math.sign(uv.getX(i)):uv.getZ(i);
        const fr=course.sample(s),delta=fr.pos.clone().fromBufferAttribute(attr,i).sub(fr.pos);
        const width=.54+.15*Math.sin(.67*s+side*1.1)+.08*Math.sin(1.29*s-side);
        const outer=course.widthAt(s)/2+width-(name==='foam_berm'?.045:0);
        const height=.12-(name==='foam_berm'?.035:0);
        maxWidthError=Math.max(maxWidthError,Math.abs(delta.dot(fr.right)*side-outer));
        maxHeightError=Math.max(maxHeightError,Math.abs(delta.dot(fr.up)-height));
        count++;
      }
      if(count<10||maxWidthError>.001||maxHeightError>.001)throw Error(name+' contact verification failed '+JSON.stringify({count,maxWidthError,maxHeightError}));
      summary.surfaces[name]={sampledVertices:count,maximumLocalWidthError:maxWidthError,maximumLocalHeightError:maxHeightError};
    }
    return summary;
  });
  if(errors.length)throw Error(errors.join(' | '));
  fs.writeFileSync(path.join(__dirname,'shared-shore-contact.json'),JSON.stringify(result,null,2)+'\n');
  console.log('Verified both real mesh borders in course-local coordinates.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
