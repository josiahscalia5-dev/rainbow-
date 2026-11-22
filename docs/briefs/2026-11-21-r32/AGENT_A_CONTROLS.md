# Specialist brief — animation-and-gameplay-engineer: Screen 05 swipe controls (round 32)
Relaunch with subagent_type `animation-and-gameplay-engineer`, workdir = `<workspace>/agentA` from `setup_r32.sh` (it already contains the
specialist's newest saved work: `controls.js`, hooks `// [controls]` in `play3.html`, `swipe_test.cjs`, `CONTROLS_NOTES.md`, `out_controls/`).
Tell it to READ `CONTROLS_NOTES.md` first and continue from there.

Task (unchanged): in a NEW ES module `controls.js` + minimal hooks in `play3.html`:
1. real touch swipes (pointer/touch, ~30 px threshold, dominant axis) + keyboard arrows/WASD; `window.input.swipe(dir)` for tests (but tests use real
   CDP touch events);
2. three lanes (lateral ≈ −0.22 / 0 / +0.22, river half-width ~0.3–0.35), smooth critically-damped lane change ~0.25–0.3 s with lean + pom-pom swing;
3. swipe up = leap (peak ~0.55–0.65 × his height, ~0.6 s, splash out/in, slight pitch); swipe down = dive (~80 % under for ~0.6 s, bubbles, resurface
   splash); one move at a time (queue ≤ 1);
4. coins on the water + a few in the air (leap height) and side lanes; collect by 3D distance; +10 each; pop animation;
5. camera follows lanes ~50 % and leaps ~35 % with smoothing, clamped so it never clips; frame 0 = the approved picture's camera;
6. natural swim: paddling shader kept, subtle body roll per stroke, faster paddling during lane changes;
7. keep `window.step(t, dt, steer, speed)`; add `window.state()` → {s, lane, lat, height, coins}.
Test: `swipe_test.cjs` (Pixel-7-like 412×915, isMobile, hasTouch, CDP `Input.dispatchTouchEvent`), ≤ 6 stills (software rendering is slow), log.
