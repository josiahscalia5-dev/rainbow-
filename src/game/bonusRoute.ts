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

// Round 43: the screen-kit rebuild of Screen 06 (public/screen06/, tools/screenkit) as a TEST route: at the end of 05 Benny swims into the
// rebuilt 06 and comes back into the game at the Screen 07 checkpoint with his coins. OFF by default (the default game is unchanged); ON in a
// build made with VITE_RAINBOW_KIT06=1 or with ?kit06=1. Like the Bubble Dash section, the hand-over is still a page load (not yet one scene).
export const KIT_ROUTE = {
  s06: env.VITE_RAINBOW_KIT06 === '1' || q.get('kit06') === '1',
  go06(coins: number) { location.href = `screen06/index.html?return=1&kit06=1${BONUS_ROUTE.enabled ? '&bonus=1' : ''}&coins=${Math.round(coins)}`; },
};

// Round 45: the ONE connected 3D world (public/world/, tools/world/build_world.py + build_world_app.sh): 04 -> Bubble Dash -> Sock Rescue -> 05 -> 06 -> 07
// in one scene. OFF by default (the default game is unchanged); ON in a build made with VITE_RAINBOW_WORLD=1 or with ?world=1: after the opening
// videos the game hands over to the world, and at the end of 07 the world hands back to the game at the Screen 08 checkpoint with the coins.
export const WORLD_ROUTE = {
  enabled: env.VITE_RAINBOW_WORLD === '1' || q.get('world') === '1',
  go(coins: number) { location.href = `world/index.html?play=1&return=1&coins=${Math.round(coins)}`; },
};
