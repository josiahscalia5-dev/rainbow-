import {readFileSync,writeFileSync} from 'node:fs';
import pixelmatch from '/tmp/rainbow-motion-tools.ef8YVWIN/toolchain/node_modules/pixelmatch/index.js';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{PNG}=require('/tmp/rainbow-motion-tools.ef8YVWIN/toolchain/node_modules/pngjs');
const dir='/tmp/rainbow06-fit/qa';
const original=PNG.sync.read(readFileSync('/tmp/rainbow06-repair/qa/analysis/decoded-reference-for-pixelmatch.png'));
const frames={claudia:dir+'/proof/06/BEFORE/opening.png',previous:'/tmp/rainbow-s06-arched-passage-AEyFAwIZ/proof/06/NEW/opening.png',priorFit:'/tmp/rainbow06-repair/qa/final-run/proof/06/NEW/opening.png',candidate:dir+'/final-run/proof/06/NEW/opening.png'};
const options={threshold:0.1,includeAA:true};const result={method:'Pixelmatch 7.1.0 YIQ color difference, full encoded sRGB frame, includes HUD and anti-aliased pixels',width:original.width,height:original.height,options,frames:{}};
for(const [name,file] of Object.entries(frames)){const target=PNG.sync.read(readFileSync(file));const count=pixelmatch(original.data,target.data,null,original.width,original.height,options);result.frames[name]={mismatchedPixels:count,total:original.width*original.height};}
writeFileSync(dir+'/analysis/opening-pixelmatch.json',JSON.stringify(result,null,2)+'\n');console.log(result.frames);
