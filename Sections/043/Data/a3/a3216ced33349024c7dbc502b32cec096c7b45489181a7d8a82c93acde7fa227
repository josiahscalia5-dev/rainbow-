const { chromium } = require('playwright');
const { open, pose } = require('./capture.cjs');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  const result = {};
  const poses = [['opening','forward',0],['hard-left','forward',12,-1],['hard-right','forward',12,1]];
  try {
    for (const variant of ['BEFORE','NEW']) {
      const errors = [];
      const p = await open(browser,'06',variant,{width:864,height:1536},errors);
      result[variant] = {};
      for (const row of poses) {
        const state = await pose(p,'06',row);
        const meshes = await p.evaluate(async () => {
          const r = window.__rainbow;
          const root = r.qa3d().scene.getObjectByName('Benny');
          if (!root) throw Error('Benny missing');
          const hash = async array => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',array.buffer.slice(array.byteOffset,array.byteOffset+array.byteLength)))).map(x=>x.toString(16).padStart(2,'0')).join('');
          const nodes=[]; root.traverse(x=>nodes.push(x));
          const report=[];
          for (const node of nodes) {
            const attrs={};
            if (node.isMesh) {
              for (const key of ['position','normal','uv','skinIndex','skinWeight']) {
                const attr=node.geometry.getAttribute(key);
                if (attr) attrs[key]=await hash(attr.isInterleavedBufferAttribute?attr.data.array:attr.array);
              }
              if (node.geometry.index) attrs.index=await hash(node.geometry.index.array);
              if (node.instanceMatrix) attrs.instances=await hash(node.instanceMatrix.array);
            }
            const entry={name:node.name,type:node.type,visible:node.visible,matrixWorld:node.matrixWorld.elements.map(x=>Number(x.toFixed(7))),attributes:attrs};
            if (node.name==='hat_star') entry.starMaterial={color:node.material.color.toArray(),roughness:node.material.roughness,metalness:node.material.metalness};
            report.push(entry);
          }
          return report;
        });
        result[variant][row[0]] = {camera:state.camera,actor:state.benny,game:state.state,shaderTime:state.shaderTime,meshes};
      }
      await p.close(); assert.deepEqual(errors,[]);
    }
    const garment=new Set(['hat','hat_brim','hat_crown','hat_star','pom','fur_pom']);
    const verified={};
    for (const key of Object.keys(result.BEFORE)) {
      const old=result.BEFORE[key], next=result.NEW[key];
      for(const field of ['camera','actor','game','shaderTime'])assert.deepEqual(old[field],next[field],field);
      assert.equal(old.meshes.length,next.meshes.length);
      for(let i=0;i<old.meshes.length;i++) {
        const aa=old.meshes[i], bb=next.meshes[i];
        for(const field of ['name','type','visible','attributes'])assert.deepEqual(aa[field],bb[field],aa.name+' '+field);
        if(!garment.has(aa.name))assert.deepEqual(aa.matrixWorld,bb.matrixWorld,aa.name+' world transform');
      }
      verified[key]={nodes:old.meshes.length,identicalWorldTransformsOutsideGarment:old.meshes.filter(m=>!garment.has(m.name)).length,allPositionNormalUVAndSkinBuffersMatch:true,cameraAndGameStateMatch:true};
    }
    fs.writeFileSync('authoring/character-rig.json',JSON.stringify({verified,intentionalGarmentTransformNodes:[...garment]},null,2)+'\n');
    console.log('Checked the existing actor buffers, root and animation at opening and both turns.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
