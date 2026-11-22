// serve.cjs -- static server for THIS folder on a free port in 9000-9399 (8900-8989 is the lead's acceptance range).
// Before a test loads a page it proves that the port really serves THIS folder: it writes a fresh random token file here,
// fetches it back over HTTP and also checks a marker string in controls.js. A port that is busy (or served by another
// folder's server) fails the check and the next random port is tried, so the browser can never silently load someone
// else's play3.html.
// usage: const { serveHere } = require('./serve.cjs'); const srv = await serveHere(); ... srv.url ... srv.close();
const { spawn } = require('child_process'); const http = require('http'); const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const DIR = __dirname, MARK_FILE = 'controls.js', MARK = 'export function installControls';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) => new Promise((res) => {
  const rq = http.get(url, { timeout: 3000 }, (r) => { let b = ''; r.setEncoding('utf8'); r.on('data', (d) => { b += d; }); r.on('end', () => res({ status: r.statusCode, body: b })); });
  rq.on('error', () => res({ status: 0, body: '' })); rq.on('timeout', () => { rq.destroy(); res({ status: 0, body: '' }); });
});

async function serveHere({ lo = 9000, hi = 9399, tries = 12 } = {}) {
  const token = crypto.randomBytes(12).toString('hex'), tokFile = `.serve_token_${process.pid}.txt`;
  fs.writeFileSync(path.join(DIR, tokFile), token);
  for (let i = 0; i < tries; i++) {
    const port = lo + Math.floor(Math.random() * (hi - lo + 1));
    const proc = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: DIR, stdio: 'ignore' });
    let exited = false; proc.on('exit', () => { exited = true; });
    let ok = false;
    for (let k = 0; k < 20 && !exited && !ok; k++) {
      await sleep(150);
      const a = await get(`http://127.0.0.1:${port}/${tokFile}`);
      if (a.status === 200 && a.body.trim() === token) { const b = await get(`http://127.0.0.1:${port}/${MARK_FILE}`); ok = b.status === 200 && b.body.includes(MARK); }
    }
    if (ok && !exited) {
      const url = `http://127.0.0.1:${port}`;
      console.log(`serve.cjs: port ${port} verified to serve ${DIR} (token + "${MARK}" in ${MARK_FILE})`);
      return { port, url, dir: DIR, close: () => { try { proc.kill(); } catch (e) { /* gone */ } try { fs.unlinkSync(path.join(DIR, tokFile)); } catch (e) { /* gone */ } } };
    }
    try { proc.kill(); } catch (e) { /* gone */ }
    console.log(`serve.cjs: port ${port} rejected (${exited ? 'server exited: port busy' : 'did not serve this folder'}), trying another`);
  }
  try { fs.unlinkSync(path.join(DIR, tokFile)); } catch (e) { /* gone */ }
  throw new Error('serve.cjs: no verified port in ' + lo + '-' + hi);
}
module.exports = { serveHere };
