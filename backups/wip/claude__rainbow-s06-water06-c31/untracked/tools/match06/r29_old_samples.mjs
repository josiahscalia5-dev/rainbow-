// r29 lead (QA only): the current 06 route sampled in the m06tun drum frame (for the m06deep blend), JSON to stdout.
import * as THREE from 'three';
const Q = process.argv.slice(2).filter((a) => a !== '--')[0];
globalThis.location = { search: '?' + Q, href: 'http://x/?' + Q, hostname: 'x' };
const { Course } = await import('../../src/world/course');
const c = new Course();
const out = [];
for (let s = 196; s <= 222.0001; s += 0.5) { const f = c.sample(s); out.push({ s: +s.toFixed(2), pos: f.pos.toArray(), tan: f.tan.toArray(), up: f.up.toArray(), right: f.right.toArray() }); }
process.stdout.write('@@JSON' + JSON.stringify(out) + '\n');
