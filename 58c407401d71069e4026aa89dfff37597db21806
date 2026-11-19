/** Touch-drag / half-screen press / keyboard steering → steer value in [-1, 1]. */
export interface Input {
  steer: number;
  /** test/QA override (null = live input) */
  override: number | null;
  onTap(cb: () => void): void;
  onKey(cb: (k: string) => void): void;
  update(dt: number): void;
}

export function createInput(el: HTMLElement): Input {
  let target = 0;
  let dragX: number | null = null;
  let dragStart = 0;
  let tapCb = () => {};
  let keyCb = (_k: string) => {};
  const keys = new Set<string>();
  const state: Input = {
    steer: 0,
    override: null,
    onTap: (cb) => (tapCb = cb),
    onKey: (cb) => (keyCb = cb),
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
    const w = el.clientWidth;
    target = e.clientX < w / 2 ? -1 : 1; // press-and-hold halves
    el.setPointerCapture?.(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    const dx = e.clientX - dragX;
    if (Math.abs(dx) > 6) target = Math.max(-1, Math.min(1, dx / (el.clientWidth * 0.18)));
  });
  const end = () => {
    if (dragX !== null && performance.now() - dragStart < 180) tapCb();
    dragX = null;
    target = 0;
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  window.addEventListener('keydown', (e) => { keys.add(e.key); keyCb(e.key); });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  return state;
}
