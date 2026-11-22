# Screen 05 — work-in-progress preview (round 34, 2026-11-21 ~18:21 UTC), NOT the finished result

The CURRENT version (round-33 tunnel kit + round-32 Benny/controls, foundation commit 9a46d34), BEFORE the five round-34 specialists' fixes.
One uninterrupted whole-level run, 687 frames at 30 fps = 22.9 s, played with REAL touch swipes (CDP Input.dispatchTouchEvent) on a
412x915 Android-portrait emulation (Chromium, software WebGL), frame-stepped so the video plays at true game speed.

Harness result (`test_results.json`): 0 errors; all 16 ring sections entered; 24 swipes (8 left, 8 right, 4 up, 4 down) — every one answered;
lanes -1 / 0 / +1 reached; no teleports (max sideways step 0.041 u per frame); no freezes; 24 coins collected by real contact (8 on the water,
10 in side lanes, 6 in the air during leaps); max body roll 7.8 deg; ending light transition plays (21 frames).

Known problems (being fixed by the specialists): past the opening stretch the river's S-bends do not come closer (Benny does not swim into the
bends yet); blocky pink patches / a seam in the far water; simple paddling, no foot kicks.
