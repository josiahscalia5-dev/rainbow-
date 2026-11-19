const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const {open,pose}=require('./capture.cjs');
(async()=>{
 const dest=path.join(__dirname,'diagnostics');fs.mkdirSync(dest,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try {
  const errors=[],page=await open(browser,'06','BEFORE',{width:864,height:1536},errors);
  const cameras=[],rayProbes=[];
  async function shade(mode){
   await page.evaluate(mode=>{
    const r=window.__rainbow,d=r.qa3d();
    const colors={floor:'1.0,0.0,0.0',tube:'0.0,0.0,1.0',rings:'0.0,1.0,0.0',end:'1.0,1.0,0.0'};
    for(const [name,color] of Object.entries(colors)){
     const mesh=d.scene.getObjectByName('m06_'+name);
     if(!mesh)continue;const m=mesh.material;
     m.userData.savedSource??=m.fragmentShader;
     let code=m.userData.savedSource;
     const output='gl_FragColor = vec4(pjInverse(t), 1.0);';
     if(!code.includes(output))throw Error('Missing referenced output shader');
     if(mode==='id'){
      code=code.replace(output,'gl_FragColor = vec4(pjInverse(vec3('+color+')),1.0);');
     }else if(mode==='weight'){
      code=code.replace('vec3 t = pc;','vec3 t = pc; float projectorWeight=0.0;')
               .replace('t = mix(pc, texture2D(uPlate, uv).rgb, w);','projectorWeight=w; t=mix(pc,texture2D(uPlate,uv).rgb,w);')
               .replace(output,'gl_FragColor = vec4(pjInverse(vec3(projectorWeight)),1.0);');
     }else if(mode==='fullWall'&&name!=='floor'){
      code=code.replace('t = mix(pc, texture2D(uPlate, uv).rgb, w);','t=texture2D(uPlate,uv).rgb;');
     }else if(mode==='noDepth'){
      code=code.replace('if (uUseDepth > 0.5)', 'if (false)');
     }
     if(m.fragmentShader!==code){m.fragmentShader=code;m.needsUpdate=true;}
    }
    r.drawList();
   },mode);
  }
  for (const [n,v] of [['opening',0],['release-0.6',.6],['release-1.1',1.1],['release-2.2',2.2],['forward-06',6]]){
    await shade('normal');cameras.push(await pose(page,'06',[n,'forward',v]));
    const modes=n==='release-1.1'?['normal','id','weight','noDepth','fullWall']:['normal','id','weight'];
    for (const m of modes){await shade(m);await page.screenshot({path:path.join(dest,n+'-'+m+'.png'),animations:'disabled'});}
    if(n==='release-1.1'){
     const values=await page.evaluate(async()=>{
      const r=window.__rainbow,d=r.qa3d();
      const source=performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/three\.js(?:\?|$)/.test(n));
      const {Raycaster,Vector2,Triangle}=await import(source||'/node_modules/three/build/three.module.js');
      const ray=new Raycaster(),meshes=['floor','rings','tube','end'].map(n=>d.scene.getObjectByName('m06_'+n));const loc=[];
      for (const [x,center] of [[40,573],[140,540],[230,533],[335,537],[430,537],[550,523],[645,520],[735,510],[820,492]]){
       for(let y=center-42;y<=center+42;y+=6){
        ray.setFromCamera(new Vector2((x+.5)/864*2-1,1-(y+.5)/1536*2),d.camera);
        const hits=ray.intersectObjects(meshes,false);
        if(!hits.length)continue;
        const h=hits[0],attrs=h.object.geometry.attributes,v0=h.point.clone(),v1=v0.clone(),v2=v0.clone();
        const bc=Triangle.getBarycoord(h.point,v0.fromBufferAttribute(attrs.position,h.face.a),v1.fromBufferAttribute(attrs.position,h.face.b),v2.fromBufferAttribute(attrs.position,h.face.c),h.point.clone());
        const pair=['getX','getY'].map(method=> bc.x*attrs.aLS?.[method](h.face.a)+bc.y*attrs.aLS?.[method](h.face.b)+bc.z*attrs.aLS?.[method](h.face.c));
        const pj=h.point.clone().applyMatrix4(h.object.material.uniforms.uProjVP.value);
        loc.push({p:[x,y],object:h.object.name,depth:h.distance,world:h.point.toArray(),ls:pair,sourcePixel:[(pj.x+1)*432,(1-pj.y)*768]});
       }
      }
      return loc;
     });rayProbes.push(...values);
    }
  }
  await shade('normal');
  fs.writeFileSync(path.join(dest,'surfaces.json'),JSON.stringify({cameras,rayProbes},null,2));await page.close();
  if(errors.length)throw Error(errors.join('\n'));console.log('Checked five physical camera positions with independent surface and projection toggles.');
 } finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
