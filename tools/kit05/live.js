// live.js — Round 34 (2026-11-21): REAL-TIME play of the Screen 05 kit game (play3.html?live=1), for a phone / browser.
// The acceptance harness steps the game frame by frame (window.step + window.renderNow); this module instead runs it on the
// display's own clock (requestAnimationFrame), so the player swipes with a real finger and the game answers in real time.
// It also MEASURES what the player feels: frames per second, slow frames, and the time from the end of a swipe to the first frame
// in which Benny's move has started (window.liveStats(), on-screen meter with ?meter=1). Nothing here changes the scenery or controls.
export function startLive({ THREE, renderer, scene, camera, W, H, q, CT }) {
  const speed = +(q.get('speed') ?? 1.4);
  const canvas = renderer.domElement;
  // fit the fixed portrait frame (W x H, the approved picture's framing) to the screen without cropping; sharp on high-dpi phones
  const fit = () => {
    const s = Math.min(innerWidth / W, innerHeight / H);
    renderer.setPixelRatio(Math.min((devicePixelRatio || 1) * s, +(q.get('pr') ?? 2.5)));
    renderer.setSize(W, H, false);
    Object.assign(canvas.style, { width: (W * s).toFixed(1) + 'px', height: (H * s).toFixed(1) + 'px', position: 'fixed',
      left: ((innerWidth - W * s) / 2).toFixed(1) + 'px', top: ((innerHeight - H * s) / 2).toFixed(1) + 'px', touchAction: 'none' });
    const hud = document.getElementById('hud'); if (hud) { hud.style.transformOrigin = 'top center'; hud.style.transform = `scale(${s.toFixed(3)})`; hud.style.top = ((innerHeight - H * s) / 2 + 10 * s).toFixed(1) + 'px'; }
  };
  fit(); addEventListener('resize', fit);
  document.body.style.touchAction = 'none'; document.documentElement.style.overscrollBehavior = 'none';

  const ui = document.createElement('div');
  ui.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;' +
    'background:rgba(30,6,50,.45);color:#fff;font:800 26px system-ui,sans-serif;text-align:center;z-index:10;text-shadow:0 2px 6px #000';
  const say = (html) => { ui.innerHTML = html; ui.style.display = 'flex'; };
  say('<div>Tap to swim</div><div style="font:600 16px system-ui">Swipe left / right to change lanes<br>swipe up to leap, down to dive</div>');
  ui.setAttribute('data-noswipe', '1');   // the controls leave touches on [data-noswipe] alone, so the tap reaches this overlay
  document.body.appendChild(ui);

  const meter = document.createElement('div');
  meter.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:11;font:600 12px ui-monospace,monospace;color:#fff;background:#0008;padding:4px 6px;border-radius:6px;pointer-events:none;white-space:pre';
  if (q.get('meter') !== '0') document.body.appendChild(meter);

  const stats = { frames: 0, seconds: 0, slow: 0, worstMs: 0, ft: [], swipes: [], fps: 0, done: false };
  window.liveStats = () => {
    const ft = stats.ft.slice().sort((a, b) => a - b), pct = (p) => ft.length ? +ft[Math.min(ft.length - 1, Math.floor(p * ft.length))].toFixed(1) : null;
    const lat = stats.swipes.filter((s) => s.ms != null).map((s) => s.ms).sort((a, b) => a - b);
    return { frames: stats.frames, seconds: +stats.seconds.toFixed(2), avgFps: stats.seconds ? +(stats.frames / stats.seconds).toFixed(1) : 0,
      frameMs: { p50: pct(0.5), p95: pct(0.95), p99: pct(0.99), worst: +stats.worstMs.toFixed(1) }, slowFramesOver33ms: stats.slow,
      swipes: stats.swipes.length, swipeToMoveMs: lat.length ? { median: lat[Math.floor(lat.length / 2)], worst: lat[lat.length - 1] } : null,
      renderer: { w: canvas.width, h: canvas.height, pr: +renderer.getPixelRatio().toFixed(2) }, done: stats.done };
  };
  // swipe -> response: the controls recognise a swipe inside the touchmove that crosses the 30 px threshold; remember the time of the
  // newest input event, and the first animation frame whose controls state shows the new swipe closes the measurement
  let pendingUp = null;
  addEventListener('touchmove', (e) => { pendingUp = e.timeStamp; }, { passive: true });
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') pendingUp = e.timeStamp; });
  addEventListener('keydown', (e) => { pendingUp = e.timeStamp; });

  let running = false, t = 0, last = 0, lastSw = 0, acc = 0, accN = 0;
  const frame = (now) => {
    if (!running) return;
    const dtMs = last ? now - last : 16.7; last = now;
    const dt = Math.min(0.05, dtMs / 1000);   // a stalled tab never makes Benny jump forward more than 1/20 s
    t += dt;
    const r = window.step(t, dt, 0, speed);
    renderer.render(scene, camera);
    const sw = (CT.state().swipes) | 0;
    if (sw > lastSw) { stats.swipes.push({ t: +t.toFixed(2), ms: pendingUp != null ? +(performance.now() - pendingUp).toFixed(1) : null }); pendingUp = null; lastSw = sw; }
    if (stats.frames > 0) { stats.ft.push(dtMs); if (stats.ft.length > 4000) stats.ft.shift(); stats.seconds += dtMs / 1000; if (dtMs > 33.4) stats.slow++; stats.worstMs = Math.max(stats.worstMs, dtMs); }
    stats.frames++; acc += dtMs; accN++;
    if (acc > 500) { stats.fps = 1000 * accN / acc; acc = 0; accN = 0; const L = window.liveStats();
      meter.textContent = `${stats.fps.toFixed(0)} fps  p95 ${L.frameMs.p95 ?? '-'} ms\nswipes ${L.swipes}` + (L.swipeToMoveMs ? `  resp ${L.swipeToMoveMs.median} ms` : '') + `\nsection ${r.tile ?? '-'}  coins ${r.coins}`; }
    if (r.done && !stats.done) { stats.done = true; setTimeout(() => { running = false;
      const L = window.liveStats(); say(`<div>Screen 05 complete!</div><div style="font:600 16px system-ui">${L.avgFps} fps average · ${L.swipes} swipes` +
        (L.swipeToMoveMs ? ` · response ${L.swipeToMoveMs.median} ms` : '') + `</div><div style="font:700 18px system-ui">Tap to swim again</div>`);
      ui.onclick = () => location.reload(); }, 1800); }
    requestAnimationFrame(frame);
  };
  ui.onclick = () => { if (running || stats.done) return; ui.style.display = 'none'; running = true; last = 0; requestAnimationFrame(frame); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) last = 0; });   // no giant step after the phone wakes
  window.liveStart = () => ui.onclick();   // for the automated real-time test
}
