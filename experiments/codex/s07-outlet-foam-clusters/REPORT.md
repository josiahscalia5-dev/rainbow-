# Screen 07 · Dive the Washer Tube

REJECTED. The bend opens up, but exposed white ledges break the river’s edge at the plunge outlet.

The downstream foam geometry was visible from the plunge before Benny entered Screen 08. Narrowing its skirt and lowering the rounded heaps reveals more of the purple perforated wall and the winding cyan channel. The 25,344 upstream foam vertices and the 2,112 beyond the following boundary have identical position hashes in the two games. Only the 1,056 vertices along the downstream chamber section change on that mesh.

At the bottom of the plunge, a foam-only visibility test identifies 34,995 pale pixels in the retained diagnostic and 18,330 in the trial. The same test for light pixels attributable to the visible water ribbon identifies 2,300 and 9,558. The counts come from two independent visibility toggles at the same 432 × 768 pose. The newly exposed ribbon edge is angular. Long straight cyan streaks also persist when the foam is hidden.

At the shared edge, the retained water ribbon has a rim 0.28 game units above the course surface and an outer edge 0.42 units below it. The foam apron extends to 0.95 units below the surface. These are different cross-sections. Shrinking the foam by itself uncovers the side of the ribbon. The layer-off renders show that exposed edge next to the polished purple wall.

Claudia’s upstream near-water correction and saved unfinished plunge work are preserved. The rejected Image2Blender bank was excluded. The next approach should model a shared curved boundary between the ribbon and the foam apron, then place separate round heaps along it. The visible side wall and painted highlights can then be corrected independently instead of shrinking the foam again.

## Opening and movement

The exact original file is APPROVED.jpg. Its source in the project is references/07_dive_the_washer_tube.png. Both files have SHA-256 75782e387240d79436808c3b1c642040eda75fd5b58dbb76192035c7c60f78c9. All gameplay stills are separate images at 864 × 1536.

Across the entire opening, 80.0458% of retained pixels and 80.0458% of experimental pixels fall within a mean absolute RGB channel error of 20 on the 0–255 scale. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only discrepancies, counts 249,370 and 249,370 differing pixels against the artwork. The opening comparison between the two game versions contains 0 pixels with any channel difference. The fresh retained capture exactly reproduces the archived opening.

CLAUDIA_BEFORE and CODEX_NEW each contain 16 playable views and a complete H.264 swim at 648 × 1152. The 147 video frames align on course position, steering, camera, clock, coins and hearts. The game advances at 60 steps per second. The films sample it at 12 frames per second. The route logs and pose logs record the exact inputs, cameras and timestamps.

The pose set covers the opening, forward movement, maximum left and right steering, the main bend or drop, the last in-stage view and the following transition. The forward poses include +3, +6, +10 and +20 game units where they keep Benny in the stage.

Watch from approximately 5.4 to 11.8 seconds. Compare two-thirds-down, plunge-bottom and last-in-stage. The outlet becomes easier to see late in the swim, but the white slashes beside the water become sharper.

Use the retained halfway-down and plunge-bottom frames to mark where the owner wants the purple wall to meet the magenta riverbank. The rejected outlet frame is diagnostic evidence.

## Game and verification

All eight gameplay assertions passed. The successful full ride began at 1,330, collected 91 coins and finished in Stage 11 at 2,240 with five hearts and zero collisions. The wall-hit assertion intentionally uses a different ride. The route and test outputs are in CODEX_NEW. TypeScript and the production Vite build passed.

The cloud uses Chromium WebGL 2 with SwiftShader. A physical Android device is needed to measure sustained frame times, touch response and heat. The Screen 06 Android package verification and modeling tool checks are recorded on the Screen 06 evidence branch.

## Reproduction and recovery

Claudia’s retained commit is 8651edf92525a9aab82b02fad9aa44621216708a on claude/rainbow-s07-match-c17. The experimental source is 57df0b2f6609b766d1cfff823b558ab63b70e944 on codex/s07-outlet-foam-clusters. The parent used for the isolated adjustment is 8651edf92525a9aab82b02fad9aa44621216708a. The provenance file records the exact visual switches. These switches enable the trial on its own branch.

Start Vite from an isolated checkout with the project lockfile and saved assets. Set RAINBOW_BASE_URL to the local server. Run these commands from the evidence directory. The default capture output is under reproduce/proof. The pinned toolchain uses Playwright 1.57.0, Chromium and FFmpeg.

```sh
node reproduce/capture.cjs stills 07:BEFORE 07:NEW
node reproduce/capture.cjs repeat 07:BEFORE
node reproduce/capture.cjs ride 07:BEFORE 07:NEW
node reproduce/capture.cjs full-safe 07:NEW
```

The original artwork supplies one approved camera per stage. The additional moving views are proposed interpretations until the owner approves specific frames. No experimental switch has been promoted. [Motion-matching skill and project rules](https://github.com/josiahscalia5-dev/rainbow-/tree/3b57658f78fd5d7dce498d2743f1a09a173a570a)
