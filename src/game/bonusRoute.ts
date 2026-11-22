// Round 40: the reference-locked Bubble Dash -> Sock Rescue section (public/section/, built by tools/reflock/build_section_app.sh)
// as part of the Rainbow route between Screen 04 and Screen 05. OFF by default (the current game is unchanged); ON in a build made with
// VITE_RAINBOW_BONUS=1 (the Android test build) or with ?bonus=1. Benny swims from 04 into the section (coins carried over) and from the
// section's exit back into the game at the Screen 05 checkpoint (?resume=05).
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
export const BONUS_ROUTE = {
  enabled: env.VITE_RAINBOW_BONUS === '1' || q.get('bonus') === '1',
  resume: q.get('resume'),
  resumeCoins: Number(q.get('coins')),
  go(coins: number) { location.href = `section/index.html?return=1&bonus=1&coins=${Math.round(coins)}`; },
};
