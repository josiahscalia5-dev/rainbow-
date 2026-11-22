/** Mobile steering for Rainbow.
 * Default mode is the original continuous hold/drag control (unchanged).
 * ?runnerLanes=1, or VITE_RAINBOW_RUNNER_LANES=1 in a TEST build, enables
 * swipe-to-change-lane with actual PointerEvents on the playable canvas.
 * Keep behind the switch until real Android touch and visual QA pass.
 */
export type SwipeDirection = 'left' | 'right';
export type SwipeRecord = { dir: SwipeDirection; source: 'pointer' | 'keyboard'; at: number };

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const query = new URLSearchParams(typeof location === 'undefined' ? '' : location.search);
export const RUNNER_LANES = query.get('runnerLanes') === '1' || env.VITE_RAINBOW_RUNNER_LANES === '1';

export interface Input {
  steer: number;
  /** test/QA override (null = live input) */
  override: number | null;
  onTap(cb: () => void): void;
  onKey(cb: (k: string) => void): void;
  /** Once per valid horizontal swipe, never reset by lifting the finger. */
  consumeSwipes(): SwipeDirection[];
  /** Diagnostics record the actual pointer/keyboard source; API-only steering is separate. */
  swipeLog(): SwipeRecord[];
  update(dt: number): void;
}

export function createInput(el: HTMLElement): Input {
  let target = 0;
  let dragX: number | null = null;
  let dragStart = 0;
  let swipeStartY = 0;
  let swipePointerId: number | null = null;
  let swipeSeen = false;
  let tapCb = () => {};
  let keyCb = (_k: string) => {};
  const keys = new Set<string>();
  const pending: SwipeDirection[] = [];
  const history: SwipeRecord[] = [];
  const record = (dir: SwipeDirection, source: SwipeRecord['source']) => {
    pending.push(dir);
    history.push({ dir, source, at: +performance.now().toFixed(1) });
    if (history.length > 100) history.shift();
  };
  if (RUNNER_LANES) el.style.touchAction = 'none';

  const state: Input = {
    steer: 0,
    override: null,
    onTap: (cb) => (tapCb = cb),
    onKey: (cb) => (keyCb = cb),
    consumeSwipes: () => pending.splice(0),
    swipeLog: () => history.slice(),
    update(dt) {
      let t = target;
      if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) t = -1;
      if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) t = 1;
      if (state.override !== null) t = state.override;
      state.steer += (t - state.steer) * Math.min(1, dt * 10);
    },
  };

  el.addEventListener('pointerdown', (e) => {
    dragX = e.clientX;
    dragStart = performance.now();
    if (RUNNER_LANES) {
      swipeStartY = e.clientY;
      swipePointerId = e.pointerId;
      swipeSeen = false;
      target = 0; // no hold-to-steer in lane mode
    } else {
      const w = el.clientWidth;
      target = e.clientX < w / 2 ? -1 : 1; // original press-and-hold halves
    }
    el.setPointerCapture?.(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    if (RUNNER_LANES) {
      if (e.pointerId !== swipePointerId || swipeSeen) return;
      const dy = e.clientY - swipeStartY;
      // 30 CSS pixels + horizontal intent; emit once per finger gesture.
      if (Math.abs(dx) >= 30 && Math.abs(dx) >= 1.25 * Math.abs(dy)) {
        record(dx < 0 ? 'left' : 'right', 'pointer');
        swipeSeen = true;
      }
      return;
    }
    if (Math.abs(dx) > 6) target = Math.max(-1, Math.min(1, dx / (el.clientWidth * 0.18)));
  });
  const end = () => {
    if (dragX !== null && performance.now() - dragStart < 180 && (!RUNNER_LANES || !swipeSeen)) tapCb();
    dragX = null;
    target = 0;
    swipePointerId = null;
    swipeSeen = false;
  };
  el.addEventListener('pointerup', (e) => {
    if (!RUNNER_LANES || e.pointerId === swipePointerId) end();
  });
  el.addEventListener('pointercancel', (e) => {
    if (!RUNNER_LANES || e.pointerId === swipePointerId) {
      dragX = null;
      target = 0;
      swipePointerId = null;
      swipeSeen = false;
    }
  });
  window.addEventListener('keydown', (e) => {
    keys.add(e.key);
    keyCb(e.key);
    if (RUNNER_LANES && !e.repeat) {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') record('left', 'keyboard');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') record('right', 'keyboard');
    }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  return state;
}
