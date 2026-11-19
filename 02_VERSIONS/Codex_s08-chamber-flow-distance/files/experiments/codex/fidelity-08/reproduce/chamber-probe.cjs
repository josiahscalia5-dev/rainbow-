const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {open,pose}=require('./capture.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try{
  const dir=path.join(__dirname,'chamber-geometry');fs.mkdirSync(dir,{recursive:true});
  for(const variant of ['BEFORE','NEW']){
   const errors=[],page=await open(browser,'08',variant,{width:432,height:768},errors);
   await pose(page,'08',['opening','forward',0]);
   const data=await page.evaluate(async()=>{
    const r=window.__rainbow,d=r.qa3d();let objects=[];d.scene.traverse(o=>{if(o.name.startsWith('m08_')&&o.isMesh)objects.push(o)});
    const hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a)),b=>b.toString(16).padStart(2,'0')).join('');
    const out={};for(const o of objects){
     const a=o.geometry.attributes.position;const mm=o.matrixWorld.toArray();
     const yy=[];if(o.name.endsWith('_floor'))for(let i=0;i<a.count;i++)yy.push(a.getY(i));
     out[o.name]={vertices:a.count,positionSHA256:await hash(a.array),worldMatrix:mm,...(yy.length?{minY:Math.min(...yy),maxY:Math.max(...yy),raised:yy.filter(v=>v>Math.min(...yy)+.002).length}:{})};
    }if(!out.m08_floor)throw Error('Floor missing: '+objects.map(x=>x.name).join(','));
    return out;
   });fs.writeFileSync(path.join(dir,variant+'.json'),JSON.stringify(data,null,2));
   await page.close();if(errors.length)throw Error(errors.join(' ').slice(0,500));
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
