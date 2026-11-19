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

The game can play the user's Google Flow videos as silent cinematics and hand over to the real-time 3D
game without a cut. Gameplay (03–10) is always real-time 3D; the videos only cover the cinematics.

## Where to put the files

| File | Plays | Hand-off |
|---|---|---|
| `public/video/intro.mp4` (or `.webm`) | at launch and on Replay, instead of the real-time 01 | the live 3D intro is held at the "girl walks away" moment (`T.cp01`) under the video, then revealed by a 0.7 s cross-fade and continued in real time: 02 Whirlpool Tumble → 03 ride |
| `public/video/ending.mp4` (or `.webm`) — optional | when Benny reaches 11, before the victory frame | the real-time 11 frame (the official cartoon girl holds the towel, Benny hidden, **FINAL SPIN COMPLETE**) is revealed by a cross-fade |

If a file is missing, the real-time 3D cinematic plays instead. Videos are always muted and inline.
Tap skips the video (after 0.6 s).

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

## Status (2026-11-15, account 3)

No Flow video is in the repository yet: `public/video/` holds only a placeholder note, so the game plays the
real-time 3D 01 opening. When the MP4 is ready, upload it and Claude will copy it to `public/video/intro.mp4`,
run `npm run test:cinematic`, rebuild the APK and push. No code change is needed.

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
