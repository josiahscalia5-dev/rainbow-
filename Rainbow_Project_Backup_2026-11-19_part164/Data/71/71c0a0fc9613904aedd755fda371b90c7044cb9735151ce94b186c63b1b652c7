# Google Flow opening / ending videos

## The user's story and rules (2026-11-17 — authoritative)
* **Opening (Google Flow video):** a human girl does her laundry; Benny (pink, fluffy) is secretly hidden inside a
  purple towel. She carries the laundry to the washing machine and puts the clothes and the towel with Benny inside,
  not knowing he is there, closes the washer and walks away. Benny stays inside → the magical washing-machine adventure.
* **Ending (Google Flow video):** after his adventure Benny must get back into the laundry and hide inside the towel
  before the girl notices he was missing. She comes back and grabs the towel, unaware of his adventure. The ending
  must connect naturally to the beginning (same girl, towel, laundry room, washer).
* Rules: both made with Google Flow (by the user — Claude never generates videos or spends video credits); keep the
  approved characters, colours, laundry-room scenery and style; **screens 04–08 stay real playable 3D Android
  gameplay**; never rebuild the opening/ending as playable Marble or Three.js environments; the videos must hand over
  naturally into and out of the playable game (below); do not change the approved game screens.

## The user's production split (2026-11-17, authoritative — supersedes older "playable 03–10" notes)

| Screens | What they are | Made by |
|---|---|---|
| **01–03** | Google Flow **opening video** (girl carries the laundry, Benny hidden in the purple towel, washer door closes, she walks away, Benny's adventure begins) | the user, in Google Flow |
| **04–08** | **real playable 3D Android gameplay**: 04 Five Arrows · 05 Flow Into the Current · 06 Rinse Arch · 07 Washer Tube · 08 Final Spin Chamber | the game (six specialist workstreams) |
| **09–11** | Google Flow **ending video** (Benny slips back into the towel before she notices; she picks it up, unaware) | the user, in Google Flow |

This split is implemented behind the test switch **`?flowplan=1`** (`src/game/Game.ts`, lead r3). The **default build
is unchanged**: without `flowplan=1` the game still plays its real-time fallback scenes for 01–03 and 09–11 exactly as
before, and those fallbacks stay in the game until the user has tested the Flow hand-over and approved it.
Claude never generates the videos and never spends video credits. **The real Flow files are NOT in the repository
yet** — `public/video/` holds only a placeholder note.

## How the hand-over works

| File | Default build (no `flowplan`) | With `?flowplan=1` |
|---|---|---|
| `public/video/intro.mp4` (or `.webm`) | plays at launch / Replay instead of the real-time 01; the live 3D intro is held at the "girl walks away" moment (`T.cp01`) underneath, revealed by a 0.7 s cross-fade, then continues in real time: 02 Whirlpool Tumble → 03 ride | the video covers **01–03**; underneath, the ride is held **paused on the approved Screen 04 view** (04 checkpoint, 7 u into 04 — the first metres of 04 are the drain drop, whose view is still obstructed); the cross-fade reveals 04 and the ride continues in real time. Screen 03's 9 coins are credited (1,330 → 1,420) because the video replaces that stretch. |
| `public/video/ending.mp4` (or `.webm`) — optional | plays when Benny reaches 11, before the victory frame; the real-time 11 frame (girl holds the towel, Benny hidden, **FINAL SPIN COMPLETE**) is revealed by a cross-fade | plays as soon as Benny **leaves 08** (start of 09): the video covers **09–11**; the 15 coins of 09–10 are credited, then the real-time 11 victory frame (Benny hidden, FINAL SPIN COMPLETE) follows |

Coin rule under `flowplan`: only coins that are **not yet collected** in a video-covered stretch are credited, once
(no double credit, no invented reward); a full run still ends at **91 coins / 2,240** (1,330 + 91 × 10). Verified
end-to-end 2026-11-17 18:30 UTC (account 4): intro video → coin-seeking ride 04–08 → ending video → victory =
exactly 2,240, 91/91 collected, no errors.

If a file is missing, the real-time 3D cinematic plays instead (with or without `flowplan`). Videos are always muted
and inline. Tap skips the video (after 0.6 s).

## Recommended export

* Portrait 9:16 (1080×1920 or 720×1280) is best. Any ratio works edge to edge with no black bars and no stretching
  (`chooseVideoFit` in `src/ui/cinematicVideo.ts`):
  * **cover**: the clip is cropped to the phone when at least 78% of it stays visible. A 9:16 clip keeps 80% of its
    width on a 20:9 phone, so keep the girl, the towel and the washer door inside the centre ~80% of the frame.
    `?videoFocus=50% 40%` (CSS object-position) moves the crop centre for testing.
  * **fill**: if cropping would lose more (a 16:9 landscape Flow export, or a 9:16 clip on a 21:9 phone), the whole
    clip is shown over a soft blurred fill made from the same video frames instead of black bars.
* H.264 MP4 (AAC track optional — it is muted anyway). Keep it short (≈5–10 s) and under ~15 MB:
  the file is bundled into the Android APK.
* End the intro on the girl walking away from the closed washer door, seen from inside the drum if
  possible, so the cross-fade lands on the matching 3D shot. End the ending video just before the
  "girl holds the towel" pose.
* `.mp4` files are stored with Git LFS (see `.gitattributes`); the autosave backs them up automatically.

## Status (2026-11-17 ~18:30 UTC, account 4)

No Flow video is in the repository yet: `public/video/` holds only a placeholder note, so every build plays the
real-time 3D fallback opening/ending. When the user's MP4s are ready: copy them to `public/video/intro.mp4` /
`ending.mp4`, run `npm run test:cinematic` and `node scripts/flowplan-test.mjs`, check on a real Android phone
(MP4/H.264 cannot be tested in this Chromium), rebuild the APK and push. Making `flowplan` the default needs the
user's approval.

`node scripts/flowplan-test.mjs` → `qa/flowplan/flowplan_test.json`, checks A–E (re-run on the newest code
2026-11-17 18:25 UTC: **all pass**):
* A intro + flowplan: overlay shown, ride held paused on the approved 04 view, 03's coins credited, continues after the fade.
* B ending + flowplan, entered with the QA jump `goto('08')`: hand-over at the start of 09, 09–10 credited, victory
  with Benny hidden. Its final number (2,230) is NOT a run total: `goto` shows the approved screenshot's HUD value
  2,040 (real count at that point 2,020) and the test then rides straight, missing 3 of 08's 7 coins.
* C flowplan without video files: the real-time 01 opening plays exactly as before.
* D default game (no flowplan) with an intro video: unchanged (held at 01).
* E full run with both videos + flowplan, steering to the coins like `gameplay-test.mjs`: must end at exactly
  **91 coins / 2,240**.

## Testing

* Try a clip without copying it: `?introVideo=/path/under/project/root.mp4` (same for `endingVideo`);
  `?video=0` disables videos; QA captures (`?qa`) never play them.
* `npm run test:cinematic` — headless Chromium test of both paths (with a generated VP8 test clip and
  without any video). Result: `qa/cinematic_test.json`. Last run 2026-11-15: **pass** (overlay shown,
  3D held paused underneath, resumed after the fade and advanced 01 → 02; fallback without video OK).
  The test also checks edge-to-edge fit on a 20:9 phone (portrait clip → cover, landscape clip → blurred fill,
  no flat bar rows); screenshots in `qa/aspect/flow_video_*.png`.
  Note: this Chromium build has no H.264, so the automated test uses WebM; MP4 playback must be
  checked on a real Android device.

Implementation: `src/ui/cinematicVideo.ts`, hooks in `src/game/Game.ts` (`playIntroVideo`, `startOutro`).
