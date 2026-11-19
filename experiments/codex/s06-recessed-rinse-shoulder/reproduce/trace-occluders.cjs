/* Trace named real scenery surfaces at the artwork and at two forward camera positions. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { open, pose } = require('./capture.cjs');
const destination = process.argv[2] || 'camera-rays.json';
const pixels = [[365,620],[390,650],[450,650],[302,599],[250,589]];
const poses = [['opening','forward',0],['forward-03','forward',3],['forward-06','forward',6]];
(async () => {
  const browser = await chromium.launch({ executablePath:process.env.RAINBOW_CHROMIUM || '/usr/bin/chromium',
    args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-networking'] });
  try {
    const report = {nativeSize:[864,1536], method:'Nearest intersections with visible named scenery meshes. Distances are in game units. Materials with transparent rendering are recorded separately.', versions:{}};
    for (const version of ['BEFORE','NEW']) {
      const page = await open(browser,'06',version,{width:270,height:480},[]);
      await page.route('**/__rayengine__/*.js', route => {
        const name = path.basename(new URL(route.request().url()).pathname);
        return route.fulfill({path:path.join(path.dirname(require.resolve('three')),name),contentType:'text/javascript'});
      });
      await page.evaluate(async () => {window.__rayThree = await import('/__rayengine__/three.module.js');});
      report.versions[version] = {};
      for (const row of poses) {
        await pose(page,'06',row);
        const result = await page.evaluate(points => {
          const T=window.__rayThree;
          const {camera,scene}=window.__rainbow.qa3d();
          const meshes=[];scene.traverseVisible(o=>{if(o.isMesh&&o.name.startsWith('m06_'))meshes.push(o);});
          const rc=new T.Raycaster();
          const rays=points.map(([x,y])=>{
            rc.setFromCamera(new T.Vector2(2*x/864-1,1-2*y/1536),camera);
            const nearest = new Map();
            for (const hit of rc.intersectObjects(meshes,false)) {
              const o=hit.object;
              if (!nearest.has(o.name)) nearest.set(o.name,{object:o.name,depth:Number(hit.distance.toFixed(3)),
                    point:hit.point.toArray().map(n=>Number(n.toFixed(3))), transparent:o.material.transparent});
            }
            return {pixel:[x,y], hits:[...nearest.values()].slice(0,6)};
          });
          return {visibleScenery:meshes.map(m=>m.name),rays};
        },pixels);
        report.versions[version][row[0]] = result;
      }
      await page.close();
    }
    fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
  } finally {await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
