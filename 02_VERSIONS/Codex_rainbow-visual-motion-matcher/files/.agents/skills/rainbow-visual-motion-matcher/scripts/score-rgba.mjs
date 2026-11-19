import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const [approvedFile, beforeFile, ...options] = process.argv.slice(2);
if (!approvedFile || !beforeFile || options.length % 2) {
  throw new Error('Usage: node score-rgba.mjs APPROVED_RGBA BEFORE_RGBA [--candidate IMAGE] [--repeat IMAGE]');
}
const optionalFiles = new Map();
for (let i = 0; i < options.length; i += 2) {
  const flag = options[i];
  if (!['--candidate', '--repeat'].includes(flag) || optionalFiles.has(flag)) throw new Error('Unexpected option ' + flag);
  optionalFiles.set(flag, options[i + 1]);
}
const require = createRequire(import.meta.url);
const { default: pixelmatch } = await import(pathToFileURL(require.resolve('pixelmatch')).href);
function readImage(file) {
  const bytes = readFileSync(file);
  return { width: bytes.readUInt32BE(0), height: bytes.readUInt32BE(4), data: bytes.subarray(8) };
}
function compare(a, b) {
  if (a.width !== b.width || a.height !== b.height) throw new Error('Inputs must have identical native dimensions');
  const pixels = a.width * a.height;
  let exactDifferences = 0;
  let within20 = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const rgbSum = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (rgbSum <= 60) within20++;
    if (rgbSum !== 0 || a.data[i + 3] !== b.data[i + 3]) exactDifferences++;
  }
  return {
    pixels,
    exactDifferences,
    within20Pixels: within20,
    within20Percent: 100 * within20 / pixels,
    pixelmatchMismatches: pixelmatch(a.data, b.data, null, a.width, a.height, {threshold: 0.1, includeAA: false})
  };
}
const approved = readImage(approvedFile);
const before = readImage(beforeFile);
const result = {width: approved.width, height: approved.height, threshold: 0.1, includeAA: false, approvedVsBefore: compare(approved, before)};
if (optionalFiles.has('--candidate')) {
  const candidate = readImage(optionalFiles.get('--candidate'));
  result.approvedVsCandidate = compare(approved, candidate);
  result.beforeVsCandidate = compare(before, candidate);
}
if (optionalFiles.has('--repeat')) result.beforeVsRepeat = compare(before, readImage(optionalFiles.get('--repeat')));
console.log(JSON.stringify(result, null, 2));
