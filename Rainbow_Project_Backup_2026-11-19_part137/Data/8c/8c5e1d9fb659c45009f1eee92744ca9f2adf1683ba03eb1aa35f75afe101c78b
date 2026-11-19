// Entry point — the Game is assembled in src/game/Game.ts.
import { startGame } from './game/Game';

startGame(document.getElementById('scene') as HTMLCanvasElement).catch((e) => {
  console.error(e);
  (window as unknown as { __error?: string }).__error = String(e?.stack ?? e);
});
