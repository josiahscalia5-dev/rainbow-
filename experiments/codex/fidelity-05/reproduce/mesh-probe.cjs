const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {open,pose}=require('./capture.cjs');
const id=process.argv[2];
async function geometry06(page) {
 return page.evaluate(async()=>{
  const r=window.__rainbow,d=r.qa3d(), scene=d.scene;
  const hash=async a=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',a)),b=>b.toString(16).padStart(2,'0')).join('');
  const round=v=>v.toArray().map(x=>+x.toFixed(4));
  const meshes={};for(const name of ['m06_tube','m06_rings','m06_floor']){
   const o=scene.getObjectByName(name),g=o.geometry,a=g.attributes.position;meshes[name]={vertices:a.count,positionSHA256:await hash(a.array),indicesSHA256:await hash(g.index.array),worldMatrix:round(o.matrixWorld)};
  }
  const o=scene.getObjectByName('m06_rings'),p=o.geometry.attributes.position,ringCenters=[];
  for(let start=0;start<p.count;start+=1290){
   const center=o.position.clone().set(0,0,0),point=center.clone();
   for(let k=0;k<128;k++)for(const j of [0,9])center.add(point.fromBufferAttribute(p,start+k*10+j));
   ringCenters.push(round(center.multiplyScalar(1/256).applyMatrix4(o.matrixWorld)));
  }
  const floor=scene.getObjectByName('m06_floor'),a=floor.geometry.attributes.position,ls=floor.geometry.attributes.aLS,centerLine=[];
  for(let i=16;i<a.count;i+=33){
   const s=ls.getY(i),v=floor.position.clone().fromBufferAttribute(a,i).applyMatrix4(floor.matrixWorld),c=r.course.sample(s);
   centerLine.push({s:+s.toFixed(4),floor:round(v),course:round(c.pos),offset:+v.distanceTo(c.pos).toFixed(4)});
  }
  return {meshes,ringCenters,centerLine,stage:r.course.stage('06')};
 });
}
async function screen6(browser){
 const dir=path.join(__dirname,'compat06');fs.mkdirSync(dir,{recursive:true});
 const rows=[['opening','forward',0],['hard-right','forward',12,1],['arch-exit','fraction',.82]];
 for(const [variant,extra,name,url] of [['BEFORE','','retained',7966],['BEFORE','cx06RinseElbow=1','ring-only',7976],['NEW','cx06RinseElbow=1','ring-and-foam',7976]]){
  process.env.RAINBOW_EXTRA=extra;process.env.RAINBOW_BASE_URL='http://127.0.0.1:'+url;
  const errors=[];const page=await open(browser,'06',variant,{width:864,height:1536},errors);
  const out=path.join(dir,name);fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'meshes.json'),JSON.stringify(await geometry06(page)));
  for(const row of name==='retained'?[]:rows){
   await pose(page,'06',row);
   await page.screenshot({path:path.join(out,row[0]+'.png'),animations:'disabled'});
  }
  await page.close();if(errors.length)throw Error(errors.join(' ').slice(0,500));
 }
}
async function screen7(browser){
 const dir=path.join(__dirname,'downstream07');fs.mkdirSync(dir,{recursive:true});
 const errors=[],page=await open(browser,'07','BEFORE',{width:432,height:768},errors);
 for(const row of [['halfway-down','drop',.5],['two-thirds-down','drop',2/3],['plunge-bottom','drop',.97],['last-in-stage','exit',-.45]]){
  await page.evaluate(()=>window.__resetProbe?.());const state=await pose(page,'07',row);
  const log=await page.evaluate(async()=>{
   const r=window.__rainbow,d=r.qa3d(),berm=d.scene.getObjectByName('foam_berm'),stage=r.course.stage('07');
   const module=performance.getEntriesByType('resource').map(x=>x.name).find(x=>/\/three\.js(\?|$)/.test(x));
   const {Raycaster,Vector2}=await import(module || '/node_modules/three/build/three.module.js');
   const caster=new Raycaster(),g=berm.geometry,coords=g.attributes.aFoam, hits=[];
   for(let y=.16;y<=.91;y+=.06)for(let x=.05;x<=.96;x+=.025){
    caster.setFromCamera(new Vector2(x*2-1,1-y*2),d.camera);
    for(const h of caster.intersectObject(berm,false)){
     const s=(coords.getY(h.face.a)+coords.getY(h.face.b)+coords.getY(h.face.c))/3;
     if(s>r.course.marks['07_plunge_top']+12 && s<r.course.marks['07_plunge_bottom']-15)continue;
     hits.push({x:+x.toFixed(3),y:+y.toFixed(3),s:+s.toFixed(2),distance:+h.distance.toFixed(2)});break;
    }
   }
   const mat=berm.material,frag=mat.fragmentShader;
   const token='gl_FragColor = vec4(col, 1.0);';
   if(!frag.includes(token))throw Error('Expected foam surface shader');
   // Classify only the pixels finally drawn by the berm. Existing object depth and discards are retained.
   mat.fragmentShader=frag.replace(token,'gl_FragColor = s < '+stage.s1.toFixed(4)+' ? vec4(0.,1.,0.,1.) : vec4(1.,0.,0.,1.);');
   mat.needsUpdate=true;
   const removed=[];const group=d.scene.getObjectByName('foam_banks');
   group.traverse(o=>{if(o!==berm&&o.isMesh) {removed.push([o,o.visible]);o.visible=false}});
   window.__resetProbe=()=>{mat.fragmentShader=frag;mat.needsUpdate=true;removed.forEach(([o,v])=>{o.visible=v});window.__resetProbe=null};
   r.drawList();return {stageBounds:[stage.s0,stage.s1],top:r.course.marks['07_plunge_top'],bottom:r.course.marks['07_plunge_bottom'],hits};
  });
  await page.screenshot({path:path.join(dir,row[0]+'-stage-ownership.png')});fs.writeFileSync(path.join(dir,row[0]+'.json'),JSON.stringify({state:state.state,...log}));
 }
 await page.close();if(errors.length)throw Error(errors.join(' ').slice(0,500));
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try{if(id==='06')await screen6(browser);else await screen7(browser)}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
