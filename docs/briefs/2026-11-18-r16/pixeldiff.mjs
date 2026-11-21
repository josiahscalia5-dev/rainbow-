// QA only (not a game dependency). Usage: node pixeldiff.mjs A.png B.png [diff.png] [threshold=0.1] [yFrom yTo]
// Compares two same-size PNGs with Pixelmatch (anti-aliasing aware), optionally only rows yFrom..yTo-1.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const [a, b, diffPath, thr = '0.1', y0s, y1s] = process.argv.slice(2);
if (!a || !b) { console.error('usage: node pixeldiff.mjs A.png B.png [diff.png] [threshold] [yFrom yTo]'); process.exit(2); }
const A = PNG.sync.read(fs.readFileSync(a)), B = PNG.sync.read(fs.readFileSync(b));
if (A.width !== B.width || A.height !== B.height) { console.error(`size mismatch ${A.width}x${A.height} vs ${B.width}x${B.height}`); process.exit(3); }
const W = A.width, y0 = y0s ? Math.max(0, +y0s) : 0, y1 = y1s ? Math.min(A.height, +y1s) : A.height, H = y1 - y0;
const crop = (img) => img.data.subarray(y0 * W * 4, y1 * W * 4);
const D = new PNG({ width: W, height: H });
const n = pixelmatch(crop(A), crop(B), D.data, W, H, { threshold: +thr });
if (diffPath && diffPath !== '-') fs.writeFileSync(diffPath, PNG.sync.write(D));
console.log(JSON.stringify({ a, b, rows: [y0, y1], threshold: +thr, diff_pixels: n, total: W * H, diff_pct: +(100 * n / (W * H)).toFixed(4) }));
