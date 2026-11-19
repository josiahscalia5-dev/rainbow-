const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const {open, pose} = require('./capture.cjs');
(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking']});
  try {
    const errors = [];
    const page = await open(browser,'06','BEFORE',{width:864,height:1536},errors);
    await pose(page,'06',['opening','forward',0]);
    const envelope = await page.evaluate(async () => {
      const data = window.__rainbow.qa3d();
      const source = performance.getEntriesByType('resource').map(e=>e.name).find(n=>/\/three\.js(?:\?|$)/.test(n));
      const three = await import(source || '/node_modules/three/build/three.module.js');
      const floor = data.scene.getObjectByName('m06_floor');
      const material = new three.MeshBasicMaterial({color:0xffffff,side:three.DoubleSide,toneMapped:false});
      const mesh = new three.Mesh(floor.geometry,material);
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(floor.matrixWorld);
      const scene = new three.Scene();
      scene.background = new three.Color(0);
      scene.add(mesh);
      const width=864, height=1536;
      const target = new three.WebGLRenderTarget(width,height);
      const pixels = new Uint8Array(width*height*4);
      const renderer = data.renderer, previous = renderer.getRenderTarget();
      renderer.setRenderTarget(target);
      renderer.render(scene,data.camera);
      renderer.readRenderTargetPixels(target,0,0,width,height,pixels);
      renderer.setRenderTarget(previous);
      target.dispose(); material.dispose();
      return Array.from({length:width},(_,x)=>{
        for(let y=0;y<height;y++)if(pixels[4*((height-1-y)*width+x)]>200)return y;
        return null;
      });
    });
    if(errors.length)throw Error(errors.join('\n'));
    if(envelope.some(y=>y===null || y<350 || y>750))throw Error('Unexpected crest envelope');
    fs.writeFileSync(path.join(__dirname,'diagnostics/floor-envelope.json'),JSON.stringify(envelope)+'\n');
    console.log('Captured the actual 864-column river silhouette at the locked camera.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
