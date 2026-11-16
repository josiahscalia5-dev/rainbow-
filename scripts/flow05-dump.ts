/**
 * Screen 05 test W11: writes the generated flow map and ripple map as PNG (read-only use of the game code).
 *   npx vite-node scripts/flow05-dump.ts [-- --out=qa/pilot05/wave11/flowmap]
 * flowmap05.png      32 × 256 RGBA, the texture exactly as the shader samples it (row 0 = upstream end of stage 05;
 *                    R lateral flow, G speed, B turbulence, A phase noise) — can be opened in a flow-map painter
 * flowmap05_view.png the same, enlarged 8× and turned so the river runs upward, alpha dropped (for people)
 * ripple05.png       128² tileable ripple map (RG normal, B height); ripple05_height.png = its height only
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// the switches are read from location.search when the game modules load: dump the map of the W11 demonstration
// (foam shelves included) unless --default is given
if (!process.argv.includes('--default')) (globalThis as unknown as { location: { search: string } }).location = { search: '?river05=1' };
const { Course } = await import('../src/world/course');
const { FLOW_H, FLOW_W, RIPPLE_N, flowField05, rippleData05 } = await import('../src/vfx/flow05');

const out = (process.argv.find((a) => a.startsWith('--out=')) ?? '--out=qa/pilot05/wave11/flowmap').slice(6);
mkdirSync(out, { recursive: true });

const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = (b: Uint8Array) => { let c = -1; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function png(w: number, h: number, rgba: Uint8Array): Buffer {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  const chunk = (t: string, d: Buffer) => {
    const b = Buffer.alloc(12 + d.length);
    b.writeUInt32BE(d.length, 0); b.write(t, 4, 'latin1'); d.copy(b, 8);
    b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length);
    return b;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const course = new Course();
const ff = flowField05(course);
writeFileSync(`${out}/flowmap05.png`, png(FLOW_W, FLOW_H, ff.data));
const K = 8;
const view = new Uint8Array(FLOW_W * K * FLOW_H * K * 4);
for (let y = 0; y < FLOW_H * K; y++) {
  const j = FLOW_H - 1 - Math.floor(y / K);                    // downstream at the top
  for (let x = 0; x < FLOW_W * K; x++) {
    const src = (j * FLOW_W + Math.floor(x / K)) * 4, dst = (y * FLOW_W * K + x) * 4;
    view[dst] = ff.data[src]; view[dst + 1] = ff.data[src + 1]; view[dst + 2] = ff.data[src + 2]; view[dst + 3] = 255;
  }
}
writeFileSync(`${out}/flowmap05_view.png`, png(FLOW_W * K, FLOW_H * K, view));
const rip = rippleData05();
const nrm = new Uint8Array(rip.length), hgt = new Uint8Array(rip.length);
for (let i = 0; i < rip.length; i += 4) {
  nrm[i] = rip[i]; nrm[i + 1] = rip[i + 1]; nrm[i + 2] = rip[i + 2]; nrm[i + 3] = 255;
  hgt[i] = hgt[i + 1] = hgt[i + 2] = rip[i + 2]; hgt[i + 3] = 255;
}
writeFileSync(`${out}/ripple05.png`, png(RIPPLE_N, RIPPLE_N, nrm));
writeFileSync(`${out}/ripple05_height.png`, png(RIPPLE_N, RIPPLE_N, hgt));
let lat = 0, spd = 0;
for (let i = 0; i < ff.data.length; i += 4) { lat = Math.max(lat, Math.abs(ff.data[i] - 127.5) / 127.5); spd += ff.data[i + 1] / 255; }
console.log(JSON.stringify({ out, flowMap: [FLOW_W, FLOW_H], s0: +ff.s0.toFixed(2), len: +ff.len.toFixed(2), maxLateral: +(lat * 0.6).toFixed(3), meanSpeed: +(spd / (ff.data.length / 4)).toFixed(3), ripple: RIPPLE_N }));
