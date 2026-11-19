const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {open,pose}=require('./capture.cjs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try{
  const dest=path.join(__dirname,'lace-probe');fs.mkdirSync(dest,{recursive:true});const errors=[];
  const page=await open(b,'07','NEW',{width:432,height:768},errors);await pose(page,'07',['plunge-bottom','drop',.97]);
  for(const mode of ['normal','water-id','lace-relocated','painted-shoulder']){
   await page.evaluate(mode=>{
    const r=window.__rainbow,m=r.qa3d().scene.getObjectByName('water_ribbon').material;
    m.userData.origSource??=m.fragmentShader;let s=m.userData.origSource;
    if(mode==='water-id')s=s.replace('gl_FragColor = vec4(col, 1.0);','gl_FragColor=vec4(0.0,0.9,0.0,1.0);');
    if(mode==='lace-relocated'||mode==='painted-shoulder'){
     const a='  if (edge > 0.0) {';
     s=s.replace(a,'  float shoreWeight=smoothstep(uOutletLimits.x,uOutletLimits.x+1.4,s)*(1.-smoothstep(uOutletLimits.y-2.2,uOutletLimits.y,s)); edge*=1.0-shoreWeight;\n'+a);
    }
    if(mode==='painted-shoulder'){
     s=s.replace('smoothstep(-0.36, -0.04, abs(lat) - vHalfW)','smoothstep(-0.89, -0.48, abs(lat) - vHalfW)')
        .replace('float bankU = mix(0.31, 0.018, clamp(vSkirt, 0.0, 1.0));','float bankU = mix(mix(0.34,0.18,smoothstep(-0.68,0.0,abs(lat)-vHalfW)),0.018,clamp(vSkirt,0.0,1.0));');
    }
    m.fragmentShader=s;m.needsUpdate=true;r.drawList();
   },mode);
   await page.screenshot({path:path.join(dest,mode+'.png')});
  }
  if(errors.length)throw Error(errors.join(' | '));await page.close();
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
