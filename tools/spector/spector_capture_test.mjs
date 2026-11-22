// Real end-to-end test of the standalone Spector.js MCP server over stdio (the same protocol Claude Code uses).
// Usage: node tools/spector/spector_capture_test.mjs <out_dir> <url>   (serve a game folder first, e.g. python3 -m http.server 3000 in /tmp/ws06/game,
//        then url = "http://127.0.0.1:3000/play3.html?sentinel=1&play=1": play=1 keeps the render loop running so a frame can be captured)
import { Client } from '/root/.local/share/rainbow-tools/Spector.js/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '/root/.local/share/rainbow-tools/Spector.js/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const [out, url] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const transport = new StdioClientTransport({ command: 'node', args: ['/root/.local/share/rainbow-tools/Spector.js/mcp/dist/index.js'], env: { PATH: process.env.PATH, HOME: process.env.HOME, PLAYWRIGHT_BROWSERS_PATH: '/opt/pw-browsers' } });
const client = new Client({ name: 'rainbow-spector-test', version: '1.0.0' });
await client.connect(transport);
const tools = (await client.listTools()).tools.map((t) => t.name);
console.log('TOOLS', tools.length, tools.join(', '));

const call = async (name, args = {}, opts = {}) => {
  const r = await client.callTool({ name, arguments: args }, undefined, { timeout: 180000, ...opts });
  const text = r.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
  r.content.filter((c) => c.type === 'image').forEach((c, i) => writeFileSync(`${out}/${name}_${i}.png`, Buffer.from(c.data, 'base64')));
  writeFileSync(`${out}/${name}.txt`, text);
  return { text, isError: r.isError };
};

let r = await call('load_url', { url });
console.log('--- load_url\n' + r.text.slice(0, 600));
await new Promise((f) => setTimeout(f, 60000));   // Screen 06 bakes the approved pixels onto the geometry (~40 s) before its render loop starts
r = await call('get_context_info');
console.log('--- get_context_info\n' + r.text.slice(0, 700));
r = await call('capture_frame', { quickCapture: false });
console.log('--- capture_frame\n' + r.text.slice(0, 1500));
r = await call('get_draw_calls');
console.log('--- get_draw_calls (first lines)\n' + r.text.split('\n').slice(0, 14).join('\n'));
r = await call('get_shaders');
console.log('--- get_shaders (first lines)\n' + r.text.split('\n').slice(0, 6).join('\n'));
r = await call('get_textures');
console.log('--- get_textures (first lines)\n' + r.text.split('\n').slice(0, 8).join('\n'));
r = await call('take_screenshot');
console.log('--- take_screenshot', r.isError ? 'ERROR ' + r.text : 'saved');
r = await call('get_console_logs');
console.log('--- console (first lines)\n' + r.text.split('\n').slice(0, 8).join('\n'));
await client.close();
