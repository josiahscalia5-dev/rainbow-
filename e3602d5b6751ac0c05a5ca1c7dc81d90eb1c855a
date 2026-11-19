// Entry point — the Game is assembled in src/game/Game.ts.
import { startGame } from './game/Game';

// Deterministic randomness for QA captures (?qa or ?seed=N): bubbles, blinks and procedural
// textures become reproducible so screenshots can be compared run-to-run.
{
  const q = new URLSearchParams(location.search);
  if (q.has('qa') || q.has('seed')) {
    let a = Number(q.get('seed') ?? 20261115) >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
}

startGame(document.getElementById('scene') as HTMLCanvasElement).catch((e) => {
  console.error(e);
  (window as unknown as { __error?: string }).__error = String(e?.stack ?? e);
});
