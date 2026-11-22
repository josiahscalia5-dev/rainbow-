/**
 * Mobile steering (round 41): SWIPE LANES, the same model as the Bubble Dash / Sock Rescue section (tools/kit05/controls.js).
 * A horizontal swipe asks for one lane to the left / right; releasing the screen keeps that lane; a new swipe the other way reverses at
 * once (also in the middle of a lane change, and a second swipe in the same gesture is detected when the finger turns back). Keyboard:
 * each Arrow / A / D key press = one lane. Taps (short touches without a swipe) still go to onTap. The game moves Benny smoothly toward
 * the requested lane (Game.ts rideUpdate). `override` (QA) keeps the old continuous steering value for the existing capture scripts.
 * Every detected swipe is logged (time, direction, finger distance) for the touch tests.
 */
export interface SwipeEvent { t: number; dir: -1 | 1; dx: number; source: 'touch' | 'key' }
export interface Input {
  /** visual steering amount [-1, 1] for lean / paddling, set by the game from Benny's sideways speed */
  steer: number;
  /** test/QA override (null = live input): continuous steering as before round 41 */
  override: number | null;
  /** lanes requested since the last call (negative = left), then cleared */
  consumeSwipes(): number;
  log: SwipeEvent[];
  onTap(cb: () => void): void;
  onKey(cb: (k: string) => void): void;
  update(dt: number): void;
}

export function createInput(el: HTMLElement): Input {
  let pending = 0;
  let tapCb = () => {};
  let keyCb = (_k: string) => {};
  // gesture state: start point, the x where the last swipe of this gesture fired, its direction
  let g: { id: number; x0: number; y0: number; t0: number; xa: number; dir: number; swiped: boolean } | null = null;
  const log: SwipeEvent[] = [];
  const thresh = () => Math.max(24, el.clientWidth * 0.06);   // ~25 px on a phone: a deliberate flick, not a tap wobble
  const fire = (dir: -1 | 1, dx: number, source: 'touch' | 'key') => { pending += dir; log.push({ t: +performance.now().toFixed(1), dir, dx: Math.round(dx), source }); if (log.length > 200) log.shift(); };
  const state: Input = {
    steer: 0,
    override: null,
    log,
    consumeSwipes() { const p = pending; pending = 0; return p; },
    onTap: (cb) => (tapCb = cb),
    onKey: (cb) => (keyCb = cb),
    update() {},
  };
  el.addEventListener('pointerdown', (e) => {
    g = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), xa: e.clientX, dir: 0, swiped: false };
    el.setPointerCapture?.(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.xa, dy = e.clientY - g.y0;
    // fire as soon as the finger has clearly moved sideways (more sideways than vertical); a later turn back fires the other way
    if (Math.abs(dx) >= thresh() && Math.abs(dx) > Math.abs(dy) * 0.8 && Math.sign(dx) !== g.dir) {
      const dir = (dx < 0 ? -1 : 1) as -1 | 1; fire(dir, e.clientX - g.x0, 'touch'); g.dir = dir; g.xa = e.clientX; g.swiped = true;
    } else if (g.dir !== 0 && Math.sign(e.clientX - g.xa) === g.dir) g.xa = e.clientX;   // keep the turn-back reference at the furthest point
  });
  const end = (e: PointerEvent) => {
    if (!g || e.pointerId !== g.id) return;
    if (!g.swiped && performance.now() - g.t0 < 250 && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) < 12) tapCb();
    g = null;   // releasing the screen never undoes a lane change
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  window.addEventListener('keydown', (e) => {
    if (!e.repeat) { if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') fire(-1, 0, 'key'); if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') fire(1, 0, 'key'); }
    keyCb(e.key);
  });
  return state;
}
