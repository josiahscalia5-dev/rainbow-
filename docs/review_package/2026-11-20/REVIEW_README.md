# RAINBOW — complete app review package

**Owner's goal:** the player should feel they have *entered the approved pictures*. The real mobile game (portrait, real 3D,
Three.js + Capacitor/Android) must keep each approved picture's scenery, layout, water, colours, lighting and character look
**while Benny swims, steers and moves between screens**, not only in the start view. Target: ≥ 9/10 likeness per playable
screen, judged in motion. **Nothing below is approved by the owner unless it says so.** No likeness scores are claimed here.

Export: 2026-11-20 ~11:10 UTC, from ONE commit (see `MANIFEST.json`): repository `josiahscalia5-dev/rainbow-`, branch
`ccr-5be1062a-0ffyej`, commit `bf01adf096f4f888eb73bc982b4ed55012ec12c2` (saved 11:07:52 UTC). Every file was taken from git objects of that commit
(or from a specialist's base commit + the unfinished-work snapshot stored inside that commit), never from a live folder.
Git LFS files contain their real data (SHA-256 checked against the LFS pointers): every LFS file the app and the included
evidence need (models, Marble / World Labs files, APKs, clips — 66 files). The repository's other 67 LFS files are older
evidence clips (rounds 5–22 reviews, pilot-05 tests, old Image-Blaster tests); they are not needed and stay on the GitHub branch.

---

## 0. What is in the package (and which ZIP holds it)

| Folder | What | ZIP |
|---|---|---|
| `REVIEW_README.md`, `MANIFEST.json`, `MANIFEST_FILES.tsv`, `.env.example` | this guide, export identity, every file with size + SHA-256 | core |
| `1_main_project/` | the integrated **default game** (all 11 screens, opening → ending): source, shaders (GLSL inside the `.ts` files), assets, Android project, scripts, tests, QA tools, docs, approved references | core |
| `2_screen_versions/` | the **newest work per screen** — 8 unmerged versions as overlays + `apply_version.py` (section 3) | core |
| `3_references/` | approved originals (A, B), owner-approved extra artwork (C), **unapproved** proposals (D), owner's phone recording (E) | core |
| `4_evidence/` | gameplay clips + notes + overview sheets (core); the full-size comparison stills (asset ZIPs 1–4) | core + assets 1–4 |
| `5_android_apk/` | newest existing APKs (asset ZIP 6); older APKs (asset ZIP 5) | assets 6 + 5 |
| `6_marble_worldlabs_assets/` | the two Marble / World Labs worlds (splats, PLY, colliders, `.blend`) used for early Screen 05 work — not needed to run the game | assets 5 |

**Reassembly:** every ZIP contains the same top folder `Rainbow_App_Review/`. Extract all of them into ONE folder (allow
merging folders; no file exists in two ZIPs). Only the core ZIP is needed to run and review the code. Asset ZIPs 1–5 are named
`…_of_5`; asset ZIP 6 (`…_assets_6_newest_apks.zip`) was added afterwards so every file stays under 400 MB.

---

## 1. Requirements (versions actually used)

* Node.js **22.23.5** with npm **10.9.9** (Node ≥ 18 should work). Dependencies (`package.json` / `package-lock.json`):
  three 0.170.x, vite 5.4.x, typescript 5.6.x, vite-node 2.1.x, @capacitor/core + android + cli 6.2.x, @fontsource/baloo-2.
* Browser with **WebGL2** (desktop Chrome / Edge / Firefox, or a phone). Portrait aspect (e.g. 432×768 or a phone in portrait).
* Android APK build only: JDK **21**, Android SDK platform **34** + build-tools **34.0.0**, Gradle wrapper **8.2.1** (in `android/`).
* QA scripts only (optional): Playwright + Chromium (the scripts load `playwright` from a global install — it is NOT in
  `package.json`), Python 3.10+ with numpy + Pillow (opencv / scipy optional), ffmpeg. Blender **5.3.0** only for the asset tools
  under `tools/` (never needed to run the game).

## 2. Setup, run, build — the default game (`1_main_project/`)

```bash
cd Rainbow_App_Review/1_main_project
npm ci                       # install exact locked dependencies
npm run dev                  # http://localhost:5173/  (Vite dev server, also on your LAN IP)
npm run typecheck            # tsc --noEmit
npm run test:continuity      # path continuity: every stage join, the 07→08 drop
npm run build                # tsc + vite build → dist/
npm run android:debug        # dist → Capacitor → android/app/build/outputs/apk/debug/app-debug.apk (needs Android SDK)
VITE_RAINBOW_Q05="match08=1&coins08px=1" npm run android:debug   # bake URL switches into an APK (APKs have no URL bar)
```

What the default game contains (implemented): real-time 3D opening 01–02 (cartoon girl loads the washer, Benny hidden in the
towel) → playable ride 03–10 → **11 · SAFELY HOME** victory (`FINAL SPIN COMPLETE`, girl holds the towel, Benny hidden).
Controls: touch-drag or press the left / right half of the screen, keyboard ← → / A D; tap skips the opening; pause button,
`P` or `Esc`; replay button after the ending. HUD: hearts (steering into a foam wall costs one), coin counter (91 coins on the
route, 1,330 → 2,240). Google Flow video hand-over (`?flowplan=1`, `docs/FLOW_VIDEO.md`): `public/video/intro.mp4` covers
01–03, `public/video/ending.mp4` covers 09–11 — **the owner's real Flow videos are NOT included** (not in the repository);
without them the real-time cinematics play. **Not implemented:** audio / music, a settings or main menu, saving progress.

Useful URL switches (append to the URL, e.g. `http://localhost:5173/?qa=1&dpr=1`): `qa=1` deterministic QA mode (keeps the
drawing buffer for captures), `dpr=<n>` pixel ratio, `seed=<n>`, `flowplan=1` video plan, `hide=...`, `bloom=...`.
Jump to a screen: open the browser console and run `__rainbow.goto('06')` (stage ids `'01'`…`'11'`) or
`__rainbow.startRideAt('04')`; `__rainbow.state()` shows stage / position / coins. **TRAP:** the game reads only the FIRST
occurrence of a switch — replace values instead of appending a second copy.

## 3. The newest work per screen — `2_screen_versions/` (READ THIS)

There is **no single merged build** of the newest work. Each playable screen's newest look lives on its own unmerged line
(the owner must approve any merge). Every version = its base commit + the specialist's **unfinished, uncommitted edits**
(snapshot 11:07:52 UTC). Make a runnable copy, install, run, then open the recommended URL:

```bash
cd Rainbow_App_Review/2_screen_versions
python3 apply_version.py --list
python3 apply_version.py screen07_candidate_r23        # → ../run_screen07_candidate_r23/
cd ../run_screen07_candidate_r23 && npm ci && npm run dev
# open http://localhost:5173/?<recommended_query from VERSION.json>, then in the console: __rainbow.goto('07')
```

| Screen | Recommended version | Status (owner verdict) | Recommended query (in `VERSION.json`) |
|---|---|---|---|
| 04 Through the Five Arrows | `screen04_s04` | candidate K23-1 (cleaner, lower pink edges, clear blue water, gold visible) — owner: "continue with the cleaner, lower pink edges"; **not approved**; specialist mid-step | `match04=1&…` (K23-1, very long) |
| 05 Flow Into the Current | `screen05_s05` | r19 candidates (crisp slotted far wall, pink corner smear gone) — **not approved** | `match05=1&…&m05wcrisp=1&m05pink=1` |
| 06 Crest the Rinse Arch | `screen06_s06` | low foam heaps, ripple rings round Benny, camera experiment `m06view=1&m06vs=0` — **not approved** (owner: keep the camera experiment as an unapproved candidate) | `match06=1&…&m06fcl=1&m06view=1&m06vs=0&m06rip=1` |
| 06 (diagnosis) | `screen06_lead_cone_test` | lead test of the opening "blue cone", **in progress, not proven** (`&m06ripz=1`; QA colours `&m06wdbg=1`) | see `notes/` |
| 07 Dive the Washer Tube | `screen07_candidate_r23` | the exact build of the labelled clip the owner reviewed: fuller rounder foam (owner-liked candidate) + satin bands — **not approved** | `match07=1&…&m07cloud=1&m07satin=1` |
| 07 (in progress) | `screen07_s07` | specialist working on the owner's 3 priorities; unfinished S-bend step `&m07sbend=1`, code mid-change | `…&m07sbend=1` |
| 08 Final Spin Chamber | `screen08_s08` | candidate K23-3: softer near-water glints, coin sizes tapering like the painting, towel double exposure removed (3 small improvements, finished ~11:05) — **not approved**; `coins08px=1` = the owner's preferred coin version | `match08=1&coins08px=1&…&m08gl=1&m08coinsz=1&m08towelm=1&m08towelv=1` |
| Benny (04–08) | `benny_all_screens` | brighter plush + pompom + felt-star work — **not approved** | append `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1` to a screen query |

Each version folder: `VERSION.json` (status, base commit, snapshot, query), `overlay/` (changed + added files vs the main
project), `DELETED_FILES.txt`, `unfinished_work.patch` (the raw uncommitted diff against its base commit), `notes/` (the
specialist's progress log with every step, verdict and proof folder).

Screens 01–03 and 09–11 are cinematics / short rides in the default game (planned to be the owner's Flow videos); the
owner asked to work only on the VISUAL match of the playable screens 04–08.

## 4. Approved references — `3_references/`

* **A_APPROVED_ORIGINAL_SCREENS_01-11/** — the owner's 11 approved screen pictures at original quality (`01_…png` … `11_…png`,
  864×1536) + `water/05_water_isolated_original.png` (owner's isolated Screen 05 water) + `reference.sha256` (byte-identity).
* **B_APPROVED_CHARACTER_REFERENCE/** — the official cartoon girl.
* **C_APPROVED_ADDITIONAL_ARTWORK_screen04_generated_views/** — three generated continuation views of Screen 04 that the
  OWNER APPROVED on 2026-11-20 (`USER_VERDICT.md`); the original 04 picture stays the master.
* **D_UNAPPROVED_PROPOSALS_screen05 / screen07/** — generated proposals that are **NOT approved** (awaiting the owner).
* **E_USER_PHONE_RECORDING_2026-11-17_match08_APK/** — the owner's phone recording of an older APK (49 s, 720×1602, 30 fps).
* Google Flow opening / ending videos: **not available** (not in the repository).

## 5. Evidence — `4_evidence/` (labelled)

All captures are from the real game in headless Chromium (WebGL2, SwiftShader), deterministic (fixed simulation steps, pinned
water clock). Stills are separate full-size frames (864×1536): `1_APPROVED` / `BEFORE` / `NEW` per step. Clips are listed in
`4_evidence/INDEX.md` with screen, version (step / query file next to it), duration, frame rate and playback speed.
`all_screens_audit_r21/OVERVIEW_0N.png` = one sheet per screen (approved + game at start / early / middle / late / end / hard
left / right, round 21 sets). `default_build_per_scene_screenshots/` = the default game, one capture per scene.

**Not recorded / missing:** the opening 01–03 and ending 09–11 with the owner's Flow videos (videos absent); a continuous
04→08 playthrough with all newest candidates (no merged build exists); the 03→04, 04→05, 05→06 transitions with the newest
candidates; the 07→08 transition with the newest Screen 08 (the reviewed 07 clip's query had no Screen 08 switches, so its
last 0.6 s show the OLD default Screen 08 — a corrected clip is being made); a whole-screen clip of 04 (only 2.4–2.9 s segments; Screen 08 is short — its clips cover all of 08, 1.08 s at real speed,
+ 0.6 s of 09); Screen 05 in motion after round 19 (one half-speed clip from r18/r19); any recording on a real phone of a current
build.

## 6. Android — `5_android_apk/`

**There is no APK of the current work.** The newest existing APKs are from **2026-11-17** (debug-signed, not phone-tested by
Claude): `rainbow-debug-match08-2026-11-17c-benny.apk` (default game + Screen 08 reconstruction + the Benny of that day) and
`rainbow-debug-06-2026-11-17-r3.apk` (Screen 06 test build, notes in the `.md`). These two are in asset ZIP 6; five older APKs are in asset ZIP 5. To build a
current APK: run a version (section 3) and bake its query with `VITE_RAINBOW_Q05="<query>" npm run android:debug` — check the
version's `src/game/match.ts` / `flag05` for which switches are read from the build variable.

## 7. Known problems (owner's notes, most important first)

* **Whole game:** the newest work is split over unmerged lines (section 3); no ≥ 9/10 result is claimed for any screen in motion.
* **07:** the river reads as a mostly straight slide with a wavy coloured strip — needs broad S-bends (water, pink edges, foam
  banks, coin trail curving together, collisions aligned); while steering (≈ 2.5–3.5 s of the clip) the purple wall fills the view
  and hides the river ahead; at the exit (≈ 7.25–8 s) the detailed swirling water switches abruptly to smoother striped water with
  a speckled band across the join.
* **06:** at the opening a "raised blue cone" under Benny — diagnosed as the hole where the painted Benny was cut out of the
  projected painting (filled with plain water, hard edge) + the painted ring left behind; after the opening the curling crest,
  winding river and curved coin trail are not yet recognisable (rings drift back to a centred target).
* **04:** Benny should travel naturally through all five arrows; hard straight water / gold edge where the painting has low
  bubbly foam; frosted ripple instead of long glossy streaks.
* **05:** end of 05 and hard left; close gold rings at the end.
* **08:** once Benny swims forward the near river becomes a broad bright cyan-and-pink sheet with spiky white sparkles where the
  painting shows a narrow S-river with white foam banks and purple perforated floor; a small pale wedge at the towel's top-left
  while steering.
* **Benny:** cream knit stripes / ribbed cuff, stitched felt star, longer silky combed fur still in progress.
* **Missing features / media:** Flow videos, audio, menus / settings, saving; no current APK.
* Some QA scripts compare against large evidence folders that are not in the core ZIP (e.g. the protected Screen 05 BEFORE
  baseline `qa/pilot05/...`); they report missing files instead of results.

## 8. Tests already run (actual results)

* Default game (`1_main_project`): `tsc` clean; `npm run test:continuity` OK — every stage join gap 0, 07→08 drop 61.19 u
  (session bootstrap 2026-11-20 10:32 UTC). Approved references 13 / 13 byte-identical.
* Specialist steps (from their notes, real game, headless): gameplay test (`scripts/gameplay-test.mjs`, drives 03 → 11 ending)
  **8 / 8 checks pass, 91 coins, 1,330 → 2,240** for 04 K23-1 / K23-S1 / K23-S2, 06 steps 1–3, 07 satin, 08 steps 1–3 (K23-3); continuity
  OK for each; start views unchanged where intended (0 px).
* This package (re-run on the exported files, 2026-11-20): see `PACKAGE_VERIFICATION.md`.

## 9. External services (placeholders only — see `.env.example`)

The game itself calls no external service. Asset / QA tooling used: World Labs Marble API (`api.worldlabs.ai`, header
`WLT-Api-Key`), fal (`queue.fal.run`, artwork generation), Hugging Face (models), GitHub. In the original cloud environment the
keys were injected by a network proxy, never stored in files; no key, password, token or signing key is in this package.
