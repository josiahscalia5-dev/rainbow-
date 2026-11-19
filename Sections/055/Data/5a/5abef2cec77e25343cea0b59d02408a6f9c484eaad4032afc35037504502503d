const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const {open, pose} = require('./capture.cjs');
async function measure(page) {
  return page.evaluate(async () => {
    const d = window.__rainbow.qa3d(), meshes = {};
    const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',value)), n => n.toString(16).padStart(2,'0')).join('');
    d.scene.traverse(object => { if(object.isMesh && object.name.startsWith('m08_')) meshes[object.name]=object; });
    const transforms={};
    for(const [name,object] of Object.entries(meshes)) transforms[name]={matrix:object.matrixWorld.toArray(),positions:await hash(object.geometry.attributes.position.array)};
    const floor=meshes.m08_floor.geometry, points=floor.getAttribute('position'), flow=floor.getAttribute('aFlowDistance');
    let rows = [];
    if(flow) {
      const seen=new Set();
      for(let i=0;i<points.count;i++) {
        const z=points.getZ(i);
        if(seen.has(z))continue;
        seen.add(z);rows.push({z,arc:flow.getX(i)});
      }
      rows.sort((a,b)=>b.z-a.z);
      const table=meshes.m08_floor.material.uniforms.uRivZ?.value;
      if(table)rows=rows.filter(r=>r.z<=table.x&&r.z>=table.y);
    }
    return {transforms, floorVertices:points.count, rows};
  });
}
(async ()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  try {
    for (const name of ['PARENT','NEW']){
      const errors=[];process.env.RAINBOW_EXTRA=name==='PARENT'?'cx08ChamberCurrent=1&cx08BankShoulder=1':'';
      const page=await open(browser,'08',name==='PARENT'?'BEFORE':'NEW',{width:216,height:384},errors);
      await pose(page,'08',['opening','forward',0]);const state=await measure(page);
      fs.mkdirSync(path.join(__dirname,'chamber-diagnostics'),{recursive:true});fs.writeFileSync(path.join(__dirname,'chamber-diagnostics',name+'.json'),JSON.stringify(state,null,2)+'\n');
      await page.close();if(errors.length)throw Error(errors.join('\n'));
    }
    const read=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'chamber-diagnostics',name+'.json')));
    const p=read('PARENT'),n=read('NEW');if(JSON.stringify(p.transforms)!==JSON.stringify(n.transforms) || p.rows.length || n.rows.length<2)throw Error('Geometry or attribute discrepancy');
    const a=n.rows[0],b=n.rows.at(-1);
    console.log('Named meshes with identical position and transform',Object.keys(n.transforms).length,'z span',a.z-b.z,'physical flow span',b.arc-a.arc);
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
