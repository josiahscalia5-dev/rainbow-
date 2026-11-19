# Rainbow — CURRENT STATE (handoff)

_Last updated by Claude: 2026-11-15 (session 515c677b…, branch `ccr-6f431adf-7h0m8y`)._

## What Rainbow is
A brand-new, isolated, portrait **real-time 3D mobile game** (Three.js + TypeScript + Vite, Capacitor for
Android). Benny — the pink fluffy mascot in a purple/white knit star beanie — is hidden in a purple towel,
dropped into a washer by the official cartoon girl, and rides one continuous water route through the
machine before hiding back under the towel, which the girl lifts out without ever seeing him.

## Locked, approved constraints (do not change)
* **Exactly 11 screens, in order:** 01 Inside the Washing Machine · 02 Whirlpool Tumble · 03 Whirlpool
  Twirl · 04 Through the Five Arrows · 05 Flow Into the Current · 06 Crest the Rinse Arch · 07 Dive the
  Washer Tube · 08 Final Spin Chamber · 09 Ride the Final Wave · 10 Slide Into Hiding · 11 Safely Home
  (`FINAL SPIN COMPLETE`). 11 is the real ending; no stage after it.
* 01–02 = real-time opening cinematic; 03–10 = interactive ride; 11 = real-time victory cinematic.
* References in `references/` and `character_references/` are immutable (SHA-256 verified against
  `REFERENCE_ORDER.md` on 2026-11-15: all 12 OK).
* **Official cartoon girl** (`character_references/official_cartoon_girl_original.jpg`) replaces the older
  girl identity in 01, 10 and 11 — ONE model/rig. The realistic girl in the 11 screenshot is composition
  reference only.
* **Benny never changes** — one rig everywhere; rear camera on travel stages.
* **07 → 08:** after 07's visible winding stretch the tube plunges far down and its bottom flares into
  08's inlet — no teleport/cut/fade; proof frames at top / middle / bottom / 08 entrance.
* HUD reference values: 03 & 04 = $1,330 · 05 = 1,420 · 06 = 1,680 · 07 = 1,940 · 08 = 2,040 ·
  09 = 2,280 · 10 & 11 = 2,500; hearts 5/5. Live play must really count coins.
* Paid generators (Meshy, Rodin, World Labs) need explicit approval before spending credits.

## Decisions made so far
* Repo: `josiahscalia5-dev/rainbow-` (private, empty at start) is the project repo; this session cannot
  create a separately named `rainbow-washer-game` repo (its GitHub scope is limited to this repo).
* `ccr-6f431adf-7h0m8y` = the session's git branch (verified locally; created on GitHub by first push).
* Five-minute autosave: `scripts/rainbow-autosave.py` via cron `*/5` + Claude Code hooks.
* Character/environment models are built procedurally in code and exported to GLB (no desktop Blender
  available in this container).

## Work in progress / next tasks
1. (now) Finish + verify autosave system — first backup push.
2. Project scaffold (Vite/TS/three), master course spline with absolute altitudes + continuity test.
3. Benny GLB + cartoon girl GLB with turntables; water/foam/bubble shaders; washer environment.
4. Gameplay (steering, coins, hearts, pause, HUD), intro 01–02 and outro 11 cinematics.
5. Playwright captures `screenshots/01–11.png` + `qa/` side-by-sides/overlays; 07→08 proof frames.
6. Android Capacitor build; performance notes.

## Last completed test
* Reference checksum verification: 12/12 OK.

## Known issues
* (none yet in code)
