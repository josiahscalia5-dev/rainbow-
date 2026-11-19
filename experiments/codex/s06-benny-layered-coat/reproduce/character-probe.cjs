const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const {open,pose} = require('./capture.cjs');
const folder=path.join(__dirname,'authoring');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
 try {
  const errors=[];const page=await open(browser,'06','BEFORE',{width:864,height:1536},errors);
  const state=await pose(page,'06',['opening','forward',0]);
  fs.writeFileSync(path.join(folder,'photographed-state.json'),JSON.stringify(state,null,2)+'\n');
  await page.screenshot({path:path.join(folder,'full.png')});
  for(const name of ['Benny','hat','hat_brim','fur_pom','fur_body','fur_armL','fur_armR']){
   const info=await page.evaluate(name=>{
    const api=window.__rainbow,object=api.qa3d().scene.getObjectByName(name);
    if(!object)throw Error('Missing object '+name);
    const original=object.visible;object.visible=false;api.drawList();return original;
   },name);
   await page.screenshot({path:path.join(folder,'hidden-'+name+'.png')});
   await page.evaluate(([name,original])=>{const api=window.__rainbow;api.qa3d().scene.getObjectByName(name).visible=original;api.drawList()},[name,info]);
  }
  for(const value of [0.10,0.38,-1]){
   await page.evaluate(value=>{
    const api=window.__rainbow,mesh=api.qa3d().scene.getObjectByName('fur_body');
    const original=mesh.userData.priorMeasurementMaterial??mesh.material;mesh.userData.priorMeasurementMaterial=original;
    const mat=original.clone();
    mat.onBeforeCompile=(shader,renderer)=>{
      original.onBeforeCompile(shader,renderer);
      if(value>=0)shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','diffuseColor.rgb=vec3('+value.toFixed(3)+');\n#include <emissivemap_fragment>');
      else shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor=vec4(0.3,normalize(vBase).y*0.5+0.5,0.3,1.0);');
    };mat.customProgramCacheKey=()=>original.customProgramCacheKey()+'-measure-'+value;
    mesh.material=mat;api.drawList();
   },value);
   await page.screenshot({path:path.join(folder,'cal-'+value+'.png')});
  }
  if(errors.length)throw Error(errors.join(' | '));
  await page.close();console.log('Measured seven native character parts and the pink body under the retained lighting.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
