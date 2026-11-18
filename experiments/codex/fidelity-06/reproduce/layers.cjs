const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {open,pose}=require('./capture.cjs');
const sid=process.argv[3],variant=process.argv[4]||'BEFORE';
const destination=path.join(__dirname,'layers',sid,variant);
const cases={
 '06':[['hard-left','forward',12,-1],['hard-right','forward',12,1],['crest-release','forward',1.1],['arch-exit','fraction',.82]],
 '07':[['plunge-lip','drop',0],['halfway-down','drop',.5],['two-thirds-down','drop',2/3],['plunge-bottom','drop',.97],['last-in-stage','exit',-.45]],
 '04':[['forward-20','forward',20],['hard-right','forward',12,1],['last-in-stage','exit',-.45]],
 '05':[['last-left-bend','fraction',.81,-1],['last-right-bend','fraction',.96,1],['last-in-stage','exit',-.45]]
};
const switches={
 '06':['retained','no-benny','no-clusters','no-clusters-no-benny','no-floor-bank','no-floor-projection','no-splash'],
 '07':['retained','no-lather','no-water-ribbon','no-plunge-floor','no-plunge-wall','no-plunge-floor-pattern'],
 '04':['retained','no-ring-wall','no-ring-glow'],
 '05':['retained','no-near-water','no-far-water']
};
async function setLayer(page,test){
 return page.evaluate(test=>{
   const r=window.__rainbow, d=r.qa3d();
   if(window.__restoreLayer)window.__restoreLayer();
   const off=[], mats=[], found=[];
   const h=name=>{const o=d.scene.getObjectByName(name);if(o){off.push([o,o.visible]);o.visible=false;found.push(name)}};
   const shader=(name,edit)=>{const o=d.scene.getObjectByName(name);if(o){const m=o.material;const saved=m.fragmentShader;const next=edit(saved);if(saved!==next){mats.push([m,saved]);m.fragmentShader=next;m.needsUpdate=true;found.push(name)}}};
   if(test.includes('no-benny'))h('Benny');
   if(test.includes('no-clusters')){h('m06_foamclu');h('m06_foamclu_rim')}
   if(test==='no-floor-bank')shader('m06_floor',s=>s.replace('void main() {','void main() { if(abs(vLS.x)>2.3) discard;'));
   if(test==='no-floor-projection')shader('m06_floor',s=>s.replace('float w = vis * keep;','float w = 0.0;'));
   if(test==='no-splash'){h('rider_splash');h('spray')}
   if(test==='no-lather')h('foam_banks');
   if(test==='no-water-ribbon'||test==='no-near-water')h('water_ribbon');
   if(test==='no-plunge-floor')h('m07_pl_river');
   if(test==='no-plunge-wall')h('m07_pl_tube');
   if(test==='no-plunge-floor-pattern')shader('m07_pl_river',s=>s.replace(/void main\(\)\s*\{/, 'void main() { gl_FragColor=vec4(0.01,0.47,0.76,1.0);return;'));
   if(test==='no-ring-wall')h('m04_ring_tunnel');
   if(test==='no-ring-glow')h('m04_ring_glow');
   if(test==='no-far-water')h('tube05_far_river');
   window.__restoreLayer=()=>{for(const [o,v] of off)o.visible=v;for(const[m,s]of mats){m.fragmentShader=s;m.needsUpdate=true}window.__restoreLayer=null;};
   const draws=r.drawList();return {found,draws};
 },test);
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking','--disable-background-timer-throttling']});
 try{const errors=[];const p=await open(browser,sid,variant,{width:432,height:768},errors);
   fs.mkdirSync(destination,{recursive:true});
   for(const item of cases[sid]){
     await p.evaluate(()=>window.__restoreLayer?.());const state=await pose(p,sid,item);
     const log={pose:state,tests:{}};
     for(const sw of switches[sid]){
       log.tests[sw]=await setLayer(p,sw);
       await p.screenshot({path:path.join(destination,item[0]+'--'+sw+'.png'),animations:'disabled'});
     }
     fs.writeFileSync(path.join(destination,item[0]+'.json'),JSON.stringify(log));
     console.log(sid,item[0],flush='done');
   }
   if(errors.length)throw Error(errors.join(' | ').slice(0,1400));
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
