/** DOM-operated, development-only review of the existing Rainbow game. */
import type { startGame } from '../../src/game/Game';
import type { Material, Object3D, Mesh } from 'three';
type RainbowAPI = Awaited<ReturnType<typeof startGame>>;
type ReviewWindow = Window & {
  __rainbow?: RainbowAPI; __error?: string; __done?: boolean; __glbBase64?: string; __info?: unknown;
  __rainbowReviewRuntime?: { modelSources: Record<string, string>; errors: string[] };
  __rainbowReviewModels?: Map<string, Blob>;
};
type Shot = { name: string; fraction?: number; stage07Offset?: number; steer: number };
const QUERY = 'match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1&m06hole=2&m06fade=1&m06spl=1&m06fcn=3&m06fcg=1&m06deep=1&m06leg=1&m06vw=34,56&m06tswap=2&m06haze=50,115,0.85';
const SHOTS: Record<string, Shot> = {
  start: { name: 'a_start', fraction: 0, steer: 0 }, early: { name: 'b_early_12', fraction: .12, steer: 0 },
  middle: { name: 'c_middle_35', fraction: .35, steer: 0 }, late: { name: 'd_late_60', fraction: .6, steer: 0 },
  end: { name: 'e_end_85', fraction: .85, steer: 0 }, left: { name: 'f_held_left_35', fraction: .35, steer: -1 },
  right: { name: 'g_held_right_35', fraction: .35, steer: 1 }, entry07: { name: 'h_actual_entry_07', stage07Offset: 3, steer: 0 },
};
const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const game = $<HTMLIFrameElement>('game'), modelFrame = $<HTMLIFrameElement>('model-frame');
const query = $<HTMLTextAreaElement>('query'), overrides = $<HTMLTextAreaElement>('overrides');
query.value = QUERY;
const models = new Map<string, Blob>(); (window as ReviewWindow).__rainbowReviewModels = models;
const record = { schema: 1, startedUTC: new Date().toISOString(), source: 'Existing game canvas; no generated replacement frames.', models: [] as unknown[], captures: [] as unknown[], errors: [] as unknown[], currentUrl: '' };
let busy = false, cancelled = false, captureNumber = 0;
const status = (text: string) => { $('status').textContent = text; };
const yieldUI = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const assertActive = () => { if (cancelled) throw new Error('Operation cancelled.'); };
function frameWindow(): ReviewWindow { const w = game.contentWindow as ReviewWindow | null; if (!w) throw new Error('Game frame is not available.'); return w; }
function api(): RainbowAPI { const r = frameWindow().__rainbow; if (!r?.ready) throw new Error('Load Screen 06 first.'); return r; }
function displayMetadata(value: unknown = record) { $('metadata').textContent = JSON.stringify(value, null, 2); }
async function task(action: () => Promise<void>) {
  if (busy) return; busy = true; cancelled = false;
  document.querySelectorAll<HTMLButtonElement>('button[data-task]').forEach((button) => button.disabled = true);
  try { await action(); }
  catch (error) { const detail = { utc: new Date().toISOString(), message: String(error) }; record.errors.push(detail); status(detail.message); displayMetadata(); }
  finally { busy = false; document.querySelectorAll<HTMLButtonElement>('button[data-task]').forEach((button) => button.disabled = false); }
}
async function waitFor<T>(get: () => T | undefined | false, description: string, timeout = 60000): Promise<T> {
  const start = performance.now();
  while (performance.now() - start < timeout) { assertActive(); const value = get(); if (value !== undefined && value !== false) return value; await new Promise((resolve) => setTimeout(resolve, 120)); }
  throw new Error(`${description} did not finish within ${timeout / 1000} seconds.`);
}
function downloadLink(blob: Blob, name: string, text: string): HTMLAnchorElement {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.textContent = text; a.className = 'download'; return a;
}
function pause() { const r = frameWindow().__rainbow; if (r) { r.run(false); r.setSteer(0); } }
function withClock<T>(time: number, fn: () => T): T {
  const w = frameWindow(), oldNow = w.performance.now;
  try { w.performance.now = () => time * 1000; return fn(); } finally { w.performance.now = oldNow; }
}
function draw(time = 10) { const r = api(); withClock(time, () => { r.freezeAt(time); r.drawList(); }); }
function reset06() {
  const r = api(); r.run(false); withClock(10, () => r.goto('06', 10)); r.setSteer(0);
  return { checkpointS: r.state().s, stage06: r.course.stage('06'), stage07: r.course.stage('07') };
}
async function exportModel(model: 'benny' | 'girl') {
  pause(); status(`Building the existing ${model} model and exporting its rig, animations and textures…`);
  const exportUrl = new URL(`../model-lab.html?model=${model}&mode=export&review=${Date.now()}`, location.href).href;
  modelFrame.src = exportUrl;
  const w = await waitFor(() => {
    const f = modelFrame.contentWindow as ReviewWindow | null;
    if (!f || f.location.href !== exportUrl) return false; // never read the preceding model's completed export
    if (f?.__error) throw new Error(f.__error);
    return f?.__done && f.__glbBase64 ? f : false;
  }, `${model} model export`);
  const binary = atob(w.__glbBase64!), bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'model/gltf-binary' });
  const name = model === 'benny' ? 'benny.glb' : 'rainbow_girl.glb'; models.set(name, blob);
  let stored = false;
  if ('caches' in window) try { const cache = await caches.open('rainbow-development-models-v1'); await cache.put(new URL(`../../assets/models/${name}`, import.meta.url).href, new Response(blob)); stored = true; } catch (error) { record.errors.push({ kind: 'browser-cache', message: String(error) }); }
  let sha256: string | null = null;
  if (crypto.subtle) sha256 = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const info = { name, bytes: blob.size, sha256, source: 'original repository procedural builder', persistedInBrowserCache: stored, savedToRepository: false, details: w.__info };
  record.models.push(info); $('model-status').textContent = JSON.stringify(record.models, null, 2);
  $('exports').append(downloadLink(blob, name, `Download ${name}`));
  status(`${name} rebuilt (${blob.size.toLocaleString()} bytes). Download available; repository model file has not been replaced.`); displayMetadata();
}
async function loadGame() {
  pause(); status('Loading the saved Screen 06 candidate…');
  const url = new URL('./s06-game.html', location.href);
  for (const [k, v] of new URLSearchParams(query.value.trim())) url.searchParams.set(k, v);
  for (const [k, v] of new URLSearchParams(overrides.value.trim())) url.searchParams.set(k, v);
  url.searchParams.set('qa', '1'); url.searchParams.set('dpr', '1');
  url.searchParams.set('reviewModels', $<HTMLInputElement>('use-models').checked ? '1' : '0');
  url.searchParams.set('reviewLoad', String(Date.now())); record.currentUrl = url.href; game.src = url.href;
  const r = await waitFor(() => { const w = frameWindow(); if (w.location.href !== url.href) return false; if (w.__error) throw new Error(w.__error); return w.__rainbow?.ready ? w.__rainbow : false; }, 'Game loading');
  await Promise.race([frameWindow().document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 10000))]);
  assertActive(); reset06(); draw();
  const standIns = Object.entries(r.stats().modules).filter(([, value]) => String(value).includes('STAND-IN'));
  status(standIns.length ? `Loaded with fallback assets: ${standIns.map(([name]) => name).join(', ')}. Build original models before judging characters.` : 'Screen 06 ready. Original runtime modules loaded. Choose a named capture or play continuously.');
  displayMetadata({ ...record, runtime: frameWindow().__rainbowReviewRuntime, stats: r.stats() });
}
async function saveCapture(name: string, details: Record<string, unknown>) {
  const r = api(), canvas = r.qa3d().renderer.domElement;
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas PNG encoding failed.')), 'image/png'));
  const filename = `${String(++captureNumber).padStart(2, '0')}_${name}.png`;
  const evidence = { filename, utc: new Date().toISOString(), viewport: [canvas.width, canvas.height], state: r.state(), camera: r.camera(), stats: r.stats(), runtime: structuredClone(frameWindow().__rainbowReviewRuntime), ...details };
  record.captures.push(evidence);
  const figure = document.createElement('figure'), img = document.createElement('img'), caption = document.createElement('figcaption');
  img.src = URL.createObjectURL(blob); img.alt = `${name} — actual game capture`;
  const title = document.createElement('strong'); title.textContent = `${name} · stage ${r.state().stage}`;
  caption.append(title, document.createElement('br'), downloadLink(blob, filename, 'Download actual PNG'));
  figure.append(img, caption); $('gallery').append(figure); displayMetadata(evidence);
}
async function captureShot(shot: Shot) {
  const r = api(), range = reset06(); const goal = shot.stage07Offset !== undefined ? range.stage07.s0 + shot.stage07Offset : range.checkpointS + (shot.fraction ?? 0) * (range.stage06.s1 - range.checkpointS);
  let ticks = 0, lastS = r.state().s; const transitions: unknown[] = [];
  r.setSteer(shot.steer); r.freezeAt(10);
  while (r.state().s + .0005 < goal) {
    assertActive(); let batch = 0;
    while (batch < 90 && r.state().s + .0005 < goal) {
      const before = r.state(); r.step(1, 1 / 60); batch++; ticks++;
      const after = r.state(); if (after.stage !== before.stage) transitions.push({ from: before.stage, to: after.stage, simulationTick: ticks, s: after.s });
    }
    if (ticks > 12000 || r.state().s === lastS) throw new Error('Simulation stopped progressing or repeatedly respawned.');
    lastS = r.state().s; status(`Capturing ${shot.name}: ${r.state().stage}, s=${r.state().s}, ${(ticks / 60).toFixed(2)} simulated seconds…`); await yieldUI();
  }
  draw(); await saveCapture(shot.name, { kind: 'gameplay', shot, range, goalS: goal, simulationTicks: ticks, simulationTime: ticks / 60, shaderTime: 10, transitions });
  status(`Captured ${shot.name} from the real game. PNG and metadata are available below.`);
}
async function inspect(view: 'top' | 'side') {
  const r = api(); reset06(); const { scene, camera } = r.qa3d(); const st = r.course.stage('06');
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let s = st.s0; s <= st.s1; s += 1) { const p = r.course.sample(s).pos.toArray(); for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); } }
  const center = lo.map((a, k) => (a + hi[k]) / 2), span = hi.map((a, k) => a - lo[k] + 30);
  const v = Math.tan(camera.fov * Math.PI / 360), h = v * camera.aspect;
  const distance = 1.1 * (view === 'top' ? Math.max(span[2] / (2 * v), span[0] / (2 * h)) : Math.max(span[1] / (2 * v), span[2] / (2 * h)));
  if (view === 'top') { camera.position.set(center[0], center[1] + distance, center[2]); camera.up.set(0, 0, -1); }
  else { camera.position.set(center[0] + distance, center[1], center[2]); camera.up.set(0, 1, 0); }
  camera.lookAt(center[0], center[1], center[2]); camera.updateMatrixWorld();
  const hidden: [Object3D, boolean][] = [], wire: [Material & { wireframe?: boolean }, boolean | undefined][] = [];
  if ($<HTMLInputElement>('cutaway').checked) scene.traverse((object) => {
    if (['m06_tube', 'm06_end'].includes(object.name)) { hidden.push([object, object.visible]); object.visible = false; }
    if (object.name === 'm06_rings') { const material = (object as Mesh).material; for (const m of Array.isArray(material) ? material : [material]) { const w = m as Material & { wireframe?: boolean }; wire.push([w, w.wireframe]); w.wireframe = true; } }
  });
  try { draw(); await saveCapture(`inspection_${view}`, { kind: 'diagnostic free camera, not gameplay framing', cutaway: $<HTMLInputElement>('cutaway').checked, target: center, routeBounds: { min: lo, max: hi } }); }
  finally { hidden.forEach(([o, value]) => o.visible = value); wire.forEach(([m, value]) => m.wireframe = value); }
  status(`Captured ${view} inspection of actual scene geometry. Start or capture a gameplay position to restore the chase camera.`);
}

if (!import.meta.env.DEV) { document.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.disabled = true); status('This review harness is available only in the Vite development server.'); }
else {
  $('build-load').onclick = () => void task(async () => { await exportModel('benny'); await exportModel('girl'); await loadGame(); });
  $('load-game').onclick = () => void task(loadGame);
  $('export-benny').onclick = () => void task(() => exportModel('benny'));
  $('export-girl').onclick = () => void task(() => exportModel('girl'));
  document.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach((button) => button.onclick = () => void task(() => captureShot(SHOTS[button.dataset.shot!])));
  $('capture-all').onclick = () => void task(async () => { for (const shot of Object.values(SHOTS)) { assertActive(); await captureShot(shot); } status('All eight actual gameplay positions captured, including the continuous crossing into Screen 07.'); });
  $('cancel').onclick = () => { cancelled = true; pause(); modelFrame.src = 'about:blank'; status('Cancellation requested. Existing captures remain available.'); };
  $('pause').onclick = () => { pause(); status('Motion paused.'); };
  $('play-from-start').onclick = () => void task(async () => { const r = api(); reset06(); r.unfreeze(); r.setSteer(0); r.run(true); status('Playing continuously from Screen 06. Use steering controls and pause when needed.'); });
  $('resume').onclick = () => void task(async () => { const r = api(); r.unfreeze(); r.setSteer(0); r.run(true); status('Motion resumed.'); });
  for (const [id, steer] of [['steer-left', -1], ['steer-center', 0], ['steer-right', 1]] as const) $(id).onclick = () => { try { api().setSteer(steer); status(`Steering ${steer < 0 ? 'left' : steer > 0 ? 'right' : 'center'}.`); } catch (error) { status(String(error)); } };
  $('capture-current').onclick = () => void task(async () => { pause(); draw(); await saveCapture('current_game_frame', { kind: 'gameplay, current position', shaderTime: 10 }); status('Current game frame captured.'); });
  document.querySelectorAll<HTMLButtonElement>('[data-inspect]').forEach((button) => button.onclick = () => void task(() => inspect(button.dataset.inspect as 'top' | 'side')));
  $('download-metadata').onclick = () => { const link = downloadLink(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }), 'screen06-review.json', 'Download review metadata JSON'); $('metadata').before(link); link.click(); };
  setInterval(() => { try { const r = frameWindow().__rainbow; if (!r?.ready) return; const s = r.state(); $('runtime-status').textContent = `Stage ${s.stage} · s=${s.s} · lateral=${s.lat} · ${s.coins} coins · ${s.hearts}/5 hearts`; } catch { /* frame loading */ } }, 500);
}
