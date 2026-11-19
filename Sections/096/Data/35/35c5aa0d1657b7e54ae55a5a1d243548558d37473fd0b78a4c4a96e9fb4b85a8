import { build } from 'esbuild';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const target = process.argv[2];
if (!target) throw Error('Supply a path for the sampled world coordinates.');
const temp = await mkdtemp(path.join(tmpdir(), 'rainbow-course-'));
try {
  const output = path.join(temp, 'course.mjs');
  await build({entryPoints: ['src/world/course.ts'], outfile: output, bundle: true, format: 'esm', platform: 'node', define: {'import.meta.env': '{}'}, logLevel: 'silent'});
  globalThis.location = {search:'?match06=1'};
  const { Course } = await import(pathToFileURL(output));
  const course = new Course();
  const stage = course.stage('06');
  const rows = [];
  for (let i = -80; i <= Math.ceil((stage.s1 - stage.s0 + 42) * 4); ++i) {
    const s = stage.s0 + i / 4;
    const f = course.sample(s);
    rows.push({s, p:f.pos.toArray(), t:f.tan.toArray(), r:f.right.toArray(), u:f.up.toArray(), width:course.widthAt(s)});
  }
  await writeFile(target, JSON.stringify({inlet:stage.s0,exit:stage.s1,checkpoint:stage.s0+10,rows}));
  console.log(rows.length, 'cross-sections from the retained gameplay course', stage.s0, stage.s1);
} finally { await rm(temp,{recursive:true,force:true}); }
