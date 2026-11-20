# Rainbow — saved-candidate visual review, 20 November 2026

## Result

There are visible local improvements worth preserving. The reviewed images do not establish the owner's approximately 90–95% moving-world acceptance standard. Opening views generally preserve the references more convincingly than the later and steering views. Water shape and continuity, nearby materials, foam and route visibility remain substantial issues.

This review does not promote any candidate. Screen 08 K23-3 remains unapproved. The complete owner brief is preserved verbatim in [USER_VISUAL_REQUIREMENTS.md](USER_VISUAL_REQUIREMENTS.md); all ten existing specialist roles are covered in [SPECIALIST_REQUIREMENTS.md](SPECIALIST_REQUIREMENTS.md).

## What was checked

- Verified the private repository `josiahscalia5-dev/rainbow-` and continuation branch `ccr-a9235d04-90cw28` at commit **`a2261d5b96f7ed190af74f075eacec3a3a223665`**, saved 20 November 2026 at 07:52:08 EST (12:52:08 UTC). Rechecked the branch before saving this documentation; its head was unchanged.
- Read the round-25 coordination/launch notes, relevant progress records, candidate queries, WIP snapshot identities, capture metadata, review-package provenance and saved gameplay-test results.
- Recovered 80 unaltered PNG files from exact repository versions. Selected original, BEFORE and NEW images were directly viewed by the review team, covering all five playable screens and the separate Benny work. File inventories can include supporting crops beyond the full-frame review sets.
- Reviewed Screen 06 opening/3%/7%/12% captures; Screen 04 start/middle/end/left/right; Screen 05 opening/two-thirds/hard-left/late/end; Screen 07 opening/middle/left/right/ending/connection; Screen 08 opening/forward/left/right/ending; and selected Benny knit/star comparisons.
- Did **not** play continuous current footage, run the latest combined game, modify gameplay code, build an APK, or test on a physical phone. The attempted Screen 04, 07 and 08 clip downloads contained 132-byte Git LFS pointers, not playable payloads. The attempted Screen 05 clip download failed. These are evidence-access limits, not proof that the original video files are lost.

The c26 worker snapshots are stored on the lead branch and dated 12:52:06 UTC. Those worker branch names were local in the Claude environment; the latest work is recovered from each base plus its WIP snapshot. A saved statement that workers were running is historical, not a live-process check from this ChatGPT session.

Primary provenance: [round-25 coordination](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/docs/briefs/2026-11-20-r25/COORDINATION.md), [launch instructions](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/docs/briefs/2026-11-20-r25/LAUNCH_R25.md), and [review-package README](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/docs/review_package/2026-11-20/REVIEW_README.md).

## Screen 04 — Through the Five Arrows

**Compared:** the original and accepted supplementary artwork, previously shown K23-1, and saved K23-S3.

**Visible improvement:** arrows sit farther ahead of Benny instead of straddling his hat. Lower, more contained pink sides expose more gold. Foam extends along both channel edges. The lane is clearer cyan and less covered by frosted white patches. The route remains readable in the inspected left/right views.

**Remaining differences:** the middle and ending read as a straight, comparatively flat water chute. The accepted continuation artwork has fuller flowing curls, cyan/pink swirls and richer polished gold lighting. Near-camera white marks remain long scratches. Foam appears as glossy bead rows and thins toward the end. Nearby ring surfaces are broad orange/copper/lavender areas with flatter lighting. Gray uncovered areas remain at the very top of the opening behind the HUD. The environment images contain an older, much more neon Benny than the separate character candidate.

**Five-arrow evidence issue:** the 65-frame BEFORE/NEW logs match game time, stage, course position, lateral position, coins and phase at each sample. The NEW log nevertheless contains up to six enabled, nonzero-opacity arrow objects, with five fully opaque. Four arrows cross from ahead to behind during the sampled Screen 04 portion; the fifth crosses at the first Screen 05 sample, 0.05 seconds later. Object visibility still depends on frustum/occlusion, so this is not a claim that six arrows are visibly on screen. It means the required exact-five sequence and in-stage passage have not been established by the logs.

**Next:** preserve K23-S3's local gains; verify the five intended arrows in continuous play; refine glints, bank shapes, gold materials and the moving river against the three accepted continuation views. Do not treat the old Benny shown in this scene as the final integrated character.

Sources: [progress](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/04/r23/PROGRESS.md), [K23-S3 query](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/04/r23/s3_glossy/QUERY_K23-S3.txt), [comparison images](https://github.com/josiahscalia5-dev/rainbow-/tree/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/04/r23/s3_glossy), [whole-stage capture evidence](https://github.com/josiahscalia5-dev/rainbow-/tree/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/04/r25/clip).

## Screen 05 — Flow Into the Current

**Compared:** the latest identifiable worker base `eb7233e3646640397f14e360f601aeff088d7536`, with `m05wcrisp=1&m05pink=1`. The c26 snapshot contains no newer tracked or untracked Screen 05 edits; coordination marks it queued.

**Visible improvement:** severely smeared wall perforations become clearer and more regularly shaped through the later views. The conspicuous lower-left pink triangle disappears at the hard-left kink. These changes improve the wall's readability while leaving the opening composition essentially unchanged.

**Remaining differences:** near the ending, water becomes a broad, comparatively plain cyan surface with large white streaks. Around Benny, angular cut-out boundaries and changes in streak direction remain. Foam contains faceted balls and tall clusters. The hard-left gold paddle is still a blurry, chopped-off object. The cleaner wall still has uniform radial bands and less of the reference's metallic depth. Late coin placement deserves a continuous visibility check.

**Evidence gaps:** the exact latest full-size right-steer image is absent from the committed comparison folder. Its filename/notes do not establish that it was delivered. `clip_new_half.mp4` means half image dimensions in one evidence description; playback speed is not established consistently. Do not call it a verified half-speed or normal-speed recording without checking its capture timing.

**Next:** correct the ending water, near gold paddle and foam-bank shape, then capture both strong steering directions and the transition into 06. Keep rejected `m05lidf` disabled: its saved test created doubled paddles.

Sources: [latest Screen 05 progress](https://github.com/josiahscalia5-dev/rainbow-/blob/eb7233e3646640397f14e360f601aeff088d7536/qa/match/05/r18/PROGRESS.md), [full-size comparison folder](https://github.com/josiahscalia5-dev/rainbow-/tree/eb7233e3646640397f14e360f601aeff088d7536/qa/match/05/r18/step2_wall), [lead evidence index](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/docs/review_package/2026-11-20/EVIDENCE_INDEX.md).

## Screen 06 — Crest the Rinse Arch

**Compared:** original approved image; CURRENT query `QUERY_RIP.txt`, identified in the handoff as the version shown to the owner; and the saved `m06hole` repair candidate at opening, 3%, 7% and 12% stage progress.

The original shows a clearly curled cyan/magenta crest and an off-centre tunnel, with a shallow integrated ripple around Benny. The saved diagnosis attributes the cone appearance to the cut-out left when the painted Benny was removed: brighter underlying water, a hard edge and a painted ripple that remained pinned to the old position.

**What the repair changes:** at 3% and 7%, the patch contains more surrounding blue/pink flowing texture instead of the plainer bright-cyan fill. This is a localized attempt at blending the hole, not a completed correction.

**What remains visible:** the repaired area still reads as an elongated patterned patch with pinched/fanned streaks and a conspicuous circular boundary. At 12%, a broad bounded patch and strong changes of texture direction remain below Benny. Sharp white splash streaks are not the reference's shallow rounded contact ripple. In the surrounding moving view, repeated gold rings and large stretched wall surfaces increasingly replace the reference's distinctive crest/tunnel relationship. This issue is larger than the fill alone.

**Comparable conditions verified:** CURRENT and NEW `shots.json` are identical, with matching stage, course position, lateral position and counters at every sampled capture. The opening BEFORE and NEW PNGs are byte-identical (SHA-256 `3df0f39b99439525412a1ccd4c68f4c5841319c5413f318e254266689a4f19d9`). Therefore an opening-only pair cannot demonstrate the repair; the early moving-view pairs are necessary. The original artwork is the design reference, not a camera-matched reference for every later viewpoint.

**Verdict:** NOT YET PROVEN as a complete fix. The saved repair lacks a completed continuous clip and final gameplay verdict. Preserve its experiment and improve the contact/fill continuity, then inspect the crest through the middle and ending.

Sources: [diagnosis](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/06/r24/lead_rip/NOTES.md), [round-25 progress](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/06/r25/PROGRESS.md), [actual CURRENT and NEW images](https://github.com/josiahscalia5-dev/rainbow-/tree/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/06/r25/step1_hole).

## Screen 07 — Dive the Washer Tube

**Compared:** original reference and captured S1 candidate (`m07sbend=1&m07swing=1`) combined for review with K23-3.

**Visible improvement:** the NEW ending has a more noticeable lateral curve in the channel, with cyan water, magenta edges, foam and coins moving together. The opening retains its recognizable reference composition. One strong-right view has a less bulky near-right foam bank.

**Remaining differences:** the middle and strong-steering views are dominated by nearby purple wall and gold rings; the upcoming river disappears over the foreground lip. Wall slots become stretched/blurred, with thin dotted magenta arcs crossing the rings. The water narrows into a cyan strip between angular pink panels, with repeated mirrored highlights. Foam often looks faceted; the NEW ending's near-right bank becomes very large. The speckled transverse band and abrupt switch to simpler straight water remain visible approaching 08. Ending coins crowd together.

The captured S1 NEW query does not include the subsequently saved `m07look` or `m07join` experiments. Those experiments have code and recorded typechecks, but their final visual proof/verdict is not established by the inspected saved evidence.

**Comparison limitation:** the new route is roughly 2.5 units longer. The stills use equal stage fractions, not identical physical positions; the steering clips use fraction-based scheduling. Left input begins at 2.458 seconds BEFORE versus 2.500 NEW; right input at 4.083 versus 4.167; entry into 08 at 8.125 versus 8.292. Do not call this an exact matched-time/matched-position comparison. In particular, apparent foreground size changes need the position difference considered before classifying them as regressions.

**Next:** preserve the broader coordinated curve; finish route visibility and the water/foam join, then show the complete labelled sequence into the exact K23-3 version. Geometric zero-gap continuity is useful but does not prove a visually seamless surface.

Sources: [progress](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/07/r24/PROGRESS.md), [S1 comparisons and exact queries](https://github.com/josiahscalia5-dev/rainbow-/tree/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/07/r24/s1_swing), [clip metadata](https://github.com/josiahscalia5-dev/rainbow-/tree/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/07/r24/clips).

## Screen 08 — Final Spin Chamber

**Compared:** original and the step-3 BEFORE/NEW sets that produce K23-3, at opening, forward 10 units, both strong steering directions and late stage.

**Definite visible improvement:** the large rectangular ghost patch behind/above the towel is removed. The window image continues more coherently behind it. Preserve this work. The opening BEFORE and NEW are unchanged in the saved set.

The earlier glint and coin-size changes are recorded as small improvements. A saved coin measurement reduced mean apparent-size ratio from 1.148 to 1.047 across 80 sightings. That is a specific coin-size measurement, not an overall likeness score; this review's direct pair primarily isolates the later towel correction.

**Remaining differences:** after advancing, the near water becomes a broad cyan/magenta sheet with long straight streaks and sharp repeated sparkles. The bounded S-river and foam boundaries are less convincing. A pale geometric wedge and violet edge remain by the towel. Ledge ends and nearby machinery expose flat cut edges and stretched triangular patches under steering. The nearest-to-next coin-size step remains conspicuous.

**Next:** preserve K23-3 and repair the moving river's shape and foreground material continuity, then remaining towel/ledge geometry. K23-3 remains a candidate awaiting the owner's approval.

Sources: [progress](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/08/r23/PROGRESS.md), [K23-3 query](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt), [towel comparison evidence](https://github.com/josiahscalia5-dev/rainbow-/tree/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/match/08/r23/step3_m08towelm).

## Benny across screens

The separate knit candidate has clearer stitch rows, coherent cuff ribbing and more controlled cream/violet stripes than its BEFORE. It still looks very regular; the approved hat has thicker, softer yarn, a taller crown and larger, softer pom-pom clumps. The body remains short clustered plush rather than the longer, combed fur of the reference.

The star change is mixed: Screen 04's warmer gold and stitched edge are closer, but the saved Screen 06 middle/left star still appears intensely saturated yellow, with reduced visible surface detail. The silky-fur experiment has no selected final variant. Review these under every screen's lighting before calling the character consistent.

These character captures use the character worker's own older environment bases. They do not show the latest combined environment/character state. Source: [Benny progress and candidate status](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/qa/benny/r23/PROGRESS.md).

## Gameplay, combined build and Android

Several saved candidate tests report 8/8 checks and 91 coins, including pause, traversal, pickups, wall bumps and victory. They are valuable regression evidence from the saved Chromium tests. They were not rerun here, and they do not establish visual acceptance, new Screen 07 join behavior, the unfinished Screen 06 fill's final behavior, or phone performance.

The newest environment work remains split across unmerged worker versions. The 07→08 comparison is an assembled render-only preview. The reviewed package says there is no current APK of all newest candidates, and its newest existing APKs date to 17 November. An older owner phone recording exists; no recording establishes current integrated-phone quality. The actual Google Flow opening/ending masters are absent from this repository export.

The specialist coordinator should finish and review the individual corrections, then prepare a concrete combined candidate under the existing merge/approval rules. Clearly label any demonstration and record the exact build contents. Current controls, frame stability and thermal behavior need actual Android verification before calling the combined mobile game ready.

Sources: [package build/test record](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/docs/review_package/2026-11-20/PACKAGE_VERIFICATION.md), [Android and integration status](https://github.com/josiahscalia5-dev/rainbow-/blob/a2261d5b96f7ed190af74f075eacec3a3a223665/docs/review_package/2026-11-20/REVIEW_README.md).

## Scope of this continuation

This ChatGPT work preserved the full owner brief, reviewed the saved evidence, and added an explicit allocation for the existing specialist roles. It did not change visual/gameplay code, merge candidate branches, promote K23-3, restart the external Claude workers or certify an Android build. The existing source and approved references remain on their original saved lines. The next concrete work is the unfinished proof and corrections listed above; no new likeness score is assigned.
