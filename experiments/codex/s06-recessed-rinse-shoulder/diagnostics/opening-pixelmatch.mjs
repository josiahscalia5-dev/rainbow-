import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { default: pixelmatch } = await import(pathToFileURL(require.resolve('pixelmatch')).href);
const { PNG } = require('pngjs');
const [reference, report, ...frames] = process.argv.slice(2);
const src = PNG.sync.read(readFileSync(reference));
const result = { method:'Pixelmatch 7.1.0 full encoded sRGB frame including HUD. All pixels including antialiasing are eligible.', width:src.width, height:src.height, options:{threshold:0.1,includeAA:true}, frames:{} };
for (const entry of frames) {
  const [name,file] = entry.split('=');
  const im = PNG.sync.read(readFileSync(file));
  if (im.width !== src.width || im.height !== src.height) throw Error('Framing mismatch in '+name);
  result.frames[name] = {mismatchedPixels:pixelmatch(src.data,im.data,null,src.width,src.height,result.options),total:src.width*src.height};
}
writeFileSync(report,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.frames));
