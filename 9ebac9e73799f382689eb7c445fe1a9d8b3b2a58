/**
 * DOM HUD overlay (never painted into the 3D world). Sizes use a 9:16 frame unit `--u`
 * (1u = 1% of the portrait frame height) so the layout matches the 864×1536 references.
 */
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import type { StageId } from '../world/course';
import { STAGE_TITLES } from '../world/course';

const CSS = `
:root { --u: min(1vh, calc(100vw / 56.25)); }
#hud { position: fixed; inset: 0; pointer-events: none; font-family: 'Baloo 2', system-ui, sans-serif; z-index: 10;
  display: flex; justify-content: center; }
#hud .frame { position: relative; width: calc(var(--u) * 56.25); height: 100%; }
#hud .bar { position: absolute; top: calc(var(--u) * 1.15 + env(safe-area-inset-top)); left: calc(var(--u) * 2.3); right: calc(var(--u) * 2.3);
  height: calc(var(--u) * 5.5); border-radius: calc(var(--u) * 2.8);
  background: linear-gradient(180deg, rgba(150,60,200,0.72), rgba(92,22,150,0.78));
  border: calc(var(--u) * 0.22) solid rgba(255,220,255,0.55);
  box-shadow: inset 0 calc(var(--u)*0.35) calc(var(--u)*0.6) rgba(255,255,255,0.35), 0 calc(var(--u)*0.3) calc(var(--u)*1.2) rgba(60,0,90,0.45);
  display: flex; align-items: center; color: #fff; pointer-events: auto; }
#hud .seg { display: flex; align-items: center; height: 100%; }
#hud .hearts { width: 37%; padding-left: calc(var(--u) * 2.2); gap: calc(var(--u) * 1.2); }
#hud .coins { flex: 1; justify-content: center; gap: calc(var(--u) * 2.4); border-left: calc(var(--u)*0.12) solid rgba(255,255,255,0.25); border-right: calc(var(--u)*0.12) solid rgba(255,255,255,0.25); }
#hud .pause { width: 14%; justify-content: center; }
#hud .num { font-weight: 700; font-size: calc(var(--u) * 2.75); letter-spacing: calc(var(--u)*0.05); text-shadow: 0 calc(var(--u)*0.15) 0 rgba(60,0,100,0.5); }
#hud .plus { font-weight: 800; font-size: calc(var(--u) * 3.4); line-height: 1; margin-left: calc(var(--u)*0.6); }
#hud .icon { width: calc(var(--u) * 4.0); height: calc(var(--u) * 4.0); display: block; }
#hud .pbtn { width: calc(var(--u) * 4.6); height: calc(var(--u) * 4.6); border-radius: 50%; border: calc(var(--u)*0.3) solid rgba(255,255,255,0.9);
  background: radial-gradient(circle at 40% 30%, rgba(190,110,240,0.9), rgba(100,30,160,0.95)); display: flex; align-items: center; justify-content: center; gap: calc(var(--u)*0.6); cursor: pointer; }
#hud .pbtn i { display: block; width: calc(var(--u)*0.75); height: calc(var(--u)*2.0); border-radius: calc(var(--u)*0.4); background: #fff; }
#hud .banner { position: absolute; top: calc(var(--u) * 7.55 + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
  height: calc(var(--u) * 4.1); padding: 0 calc(var(--u) * 3.0); border-radius: calc(var(--u) * 2.1); white-space: nowrap;
  background: linear-gradient(180deg, #7a2bb0, #4f1489); border: calc(var(--u)*0.22) solid #ffd36b;
  box-shadow: inset 0 calc(var(--u)*0.3) calc(var(--u)*0.5) rgba(255,255,255,0.25), 0 0 calc(var(--u)*1.2) rgba(255,190,90,0.45);
  display: flex; align-items: center; }
#hud .banner span { font-weight: 800; font-style: italic; font-size: calc(var(--u) * 2.45); letter-spacing: calc(var(--u)*0.06);
  background: linear-gradient(180deg, #fffbe8 0%, #ffe9a8 55%, #ffd36b 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 calc(var(--u)*0.12) 0 rgba(80,0,90,0.6)); display: inline-block; transform: skewX(-8deg); }
#hud .hidden { display: none !important; }
#hud .victory { position: absolute; left: 50%; bottom: calc(var(--u) * 3.4); transform: translateX(-50%); width: calc(var(--u) * 49); height: calc(var(--u) * 13.5); }
#hud .victory .pill { position: absolute; left: calc(var(--u)*8.5); right: calc(var(--u)*8.5); top: calc(var(--u) * 3.1); bottom: calc(var(--u)*0.6);
  border-radius: calc(var(--u) * 5); background: linear-gradient(180deg, #8b34c4, #4d128a); border: calc(var(--u)*0.45) solid #ffcd5a;
  box-shadow: 0 0 calc(var(--u)*2) rgba(255,200,90,0.7), inset 0 calc(var(--u)*0.5) calc(var(--u)*0.6) rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center; text-align: center; }
#hud .victory .pill span { font-weight: 800; font-size: calc(var(--u) * 3.35); line-height: 1.02; color: #ffe9a6; letter-spacing: calc(var(--u)*0.05);
  background: linear-gradient(180deg, #fffaf0, #ffe08a 60%, #ffc548); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 calc(var(--u)*0.18) 0 rgba(70,0,80,0.7)); }
#hud .victory .medal { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: calc(var(--u)*6.2); height: calc(var(--u)*6.2); }
#hud .victory .laurel { position: absolute; top: calc(var(--u)*3.6); width: calc(var(--u)*9.5); height: calc(var(--u)*9.8); }
#hud .victory .laurel.l { left: calc(var(--u)*1.0); }
#hud .victory .laurel.r { right: calc(var(--u)*1.0); transform: scaleX(-1); }
#hud .victory.pop { animation: rbPop 0.7s cubic-bezier(.2,1.6,.4,1) both; }
@keyframes rbPop { from { transform: translateX(-50%) scale(0.2); opacity: 0; } to { transform: translateX(-50%) scale(1); opacity: 1; } }
#hud .replay { position: absolute; left: 50%; bottom: calc(var(--u) * 18.5); transform: translateX(-50%); pointer-events: auto; cursor: pointer;
  font-weight: 800; font-size: calc(var(--u)*2.2); color: #fff; padding: calc(var(--u)*0.6) calc(var(--u)*2.4); border-radius: calc(var(--u)*2);
  background: rgba(110,30,170,0.75); border: calc(var(--u)*0.2) solid #ffd36b; }
#hud .pausedOverlay { position: absolute; inset: 0; background: rgba(40,0,70,0.45); display: flex; align-items: center; justify-content: center; pointer-events: auto; }
#hud .pausedOverlay div { font-weight: 800; font-size: calc(var(--u)*4); color: #fff; text-shadow: 0 0 calc(var(--u)*1) #b04ad8; }
#hud .hint { position: absolute; bottom: calc(var(--u)*4); left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.85); font-weight: 700; font-size: calc(var(--u)*1.8);
  text-shadow: 0 0 calc(var(--u)*0.6) rgba(120,0,160,0.9); }
#hud .flash { position: absolute; inset: 0; background: rgba(255,80,140,0.0); transition: background 0.25s; }
`;

const HEART = `<svg class="icon" viewBox="0 0 64 64"><defs><radialGradient id="hg" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffd0e4"/><stop offset="0.45" stop-color="#ff5f9e"/><stop offset="1" stop-color="#e01e6a"/></radialGradient></defs><path d="M32 57 C10 41 4 30 4 20 C4 11 11 5 19 5 C25 5 29 8 32 13 C35 8 39 5 45 5 C53 5 60 11 60 20 C60 30 54 41 32 57Z" fill="url(#hg)" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><ellipse cx="20" cy="17" rx="7" ry="4.5" fill="#fff" opacity=".75" transform="rotate(-25 20 17)"/></svg>`;
const COIN = `<svg class="icon" viewBox="0 0 64 64"><defs><radialGradient id="cg" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff3b0"/><stop offset="0.5" stop-color="#ffc21f"/><stop offset="1" stop-color="#d98200"/></radialGradient></defs><circle cx="32" cy="32" r="29" fill="url(#cg)" stroke="#b86a00" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#ffe27a" stroke-width="2.5"/><text x="32" y="44" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="34" fill="#c46f00">$</text></svg>`;
const MEDAL = `<svg viewBox="0 0 64 64" width="100%" height="100%"><defs><radialGradient id="mg" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff2b8"/><stop offset=".55" stop-color="#ffc23a"/><stop offset="1" stop-color="#c47500"/></radialGradient></defs><circle cx="32" cy="32" r="29" fill="url(#mg)" stroke="#8a4a00" stroke-width="2"/><circle cx="32" cy="32" r="21" fill="#7a3b10"/><path d="M21 33 L29 41 L44 24" fill="none" stroke="#ffe48a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LAUREL = `<svg viewBox="0 0 60 64" width="100%" height="100%"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset="1" stop-color="#e09a12"/></linearGradient></defs><path d="M46 62 C22 54 10 36 14 6" fill="none" stroke="url(#lg)" stroke-width="3.5" stroke-linecap="round"/>${[0, 1, 2, 3, 4, 5]
  .map((i) => {
    const y = 10 + i * 8.5, x = 15 + i * 2.4 + (i > 3 ? (i - 3) * 3 : 0);
    return `<ellipse cx="${x - 6}" cy="${y}" rx="7" ry="3.2" fill="url(#lg)" transform="rotate(${-35 + i * 4} ${x - 6} ${y})"/><ellipse cx="${x + 6}" cy="${y + 3}" rx="7" ry="3.2" fill="url(#lg)" transform="rotate(${35 - i * 6} ${x + 6} ${y + 3})"/>`;
  })
  .join('')}</svg>`;

export interface Hud {
  setVisible(v: boolean): void;
  setStage(id: StageId): void;
  setCoins(n: number): void;
  setHearts(n: number, max?: number): void;
  showVictory(v: boolean, animate?: boolean): void;
  showPaused(v: boolean): void;
  showHint(text: string | null): void;
  flashHurt(): void;
  onPause(cb: () => void): void;
  onReplay(cb: () => void): void;
  root: HTMLElement;
}

export function createHud(): Hud {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  const root = document.createElement('div');
  root.id = 'hud';
  root.innerHTML = `<div class="frame">
    <div class="flash"></div>
    <div class="bar">
      <div class="seg hearts">${HEART}<span class="num" data-k="hearts">5/5</span><span class="plus">+</span></div>
      <div class="seg coins">${COIN}<span class="num" data-k="coins">1,330</span></div>
      <div class="seg pause"><div class="pbtn" data-k="pause"><i></i><i></i></div></div>
    </div>
    <div class="banner"><span data-k="title">03 · WHIRLPOOL TWIRL</span></div>
    <div class="victory hidden"><div class="laurel l">${LAUREL}</div><div class="laurel r">${LAUREL}</div><div class="pill"><span>FINAL SPIN<br>COMPLETE</span></div><div class="medal">${MEDAL}</div></div>
    <div class="replay hidden" data-k="replay">↻ Replay</div>
    <div class="hint hidden"></div>
    <div class="pausedOverlay hidden"><div>PAUSED</div></div>
  </div>`;
  document.body.appendChild(root);
  const $ = (k: string) => root.querySelector(`[data-k="${k}"]`) as HTMLElement;
  const bar = root.querySelector('.bar') as HTMLElement;
  const banner = root.querySelector('.banner') as HTMLElement;
  const victory = root.querySelector('.victory') as HTMLElement;
  const paused = root.querySelector('.pausedOverlay') as HTMLElement;
  const hint = root.querySelector('.hint') as HTMLElement;
  const flash = root.querySelector('.flash') as HTMLElement;
  let pauseCb = () => {};
  let replayCb = () => {};
  $('pause').addEventListener('pointerdown', (e) => { e.stopPropagation(); pauseCb(); });
  paused.addEventListener('pointerdown', (e) => { e.stopPropagation(); pauseCb(); });
  $('replay').addEventListener('pointerdown', (e) => { e.stopPropagation(); replayCb(); });
  return {
    root,
    setVisible(v) { bar.classList.toggle('hidden', !v); banner.classList.toggle('hidden', !v); },
    setStage(id) { $('title').textContent = `${id} · ${STAGE_TITLES[id]}`; },
    setCoins(n) { $('coins').textContent = n.toLocaleString('en-US'); },
    setHearts(n, max = 5) { $('hearts').textContent = `${n}/${max}`; },
    showVictory(v, animate = true) {
      victory.classList.toggle('hidden', !v);
      victory.classList.toggle('pop', v && animate);
      $('replay').classList.add('hidden');
      if (v) setTimeout(() => { if (!victory.classList.contains('hidden')) $('replay').classList.remove('hidden'); }, 2600);
    },
    showPaused(v) { paused.classList.toggle('hidden', !v); },
    showHint(t) { hint.classList.toggle('hidden', !t); hint.textContent = t ?? ''; },
    flashHurt() { flash.style.background = 'rgba(255,80,140,0.35)'; setTimeout(() => (flash.style.background = 'rgba(255,80,140,0)'), 180); },
    onPause(cb) { pauseCb = cb; },
    onReplay(cb) { replayCb = cb; },
  };
}
