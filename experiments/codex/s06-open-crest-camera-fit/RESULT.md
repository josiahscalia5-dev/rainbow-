# Screen 06 two-view fit

**Keep Claudia’s retained game.** This branch is a partial reconstruction for visual review. The experiment fits the far water shoulder and its metal underside to the saved opening camera and a second camera three game units forward. The opening artwork provides an exact target. The moving viewpoints are proposals for the owner.

At +3 the new view reveals a small purple slit immediately left of Benny’s pom-pom. At +6 it becomes a clearer wedge with rounded foam and finer metal slots. The early arch is easier to recognize in motion. At +20 the near side looks like a broad, tall washer baffle. During hard turns the bank hides some rounded foam. On hard left a new fine, dark diagonal seam crosses the near pink water. These differences block promotion.

The original, Claudia’s retained game, the previous crest experiment and this two-camera experiment are separately labeled. The previous branch and this successor use the same character, gameplay and camera route. The solver and its inputs are under [fit/](fit/README.md). The two-view experiment does not establish an approved moving reference.

At the opening, Pixelmatch flags 262,573 pixels in Claudia’s retained game, 262,361 in the preceding crest experiment and 262,386 in this fit out of 1,327,104 pixels. The comparison uses threshold 0.1 and includes the HUD and antialiased pixels. In a fixed +3 patch, decoded casing geometry occupies 131 of 306 sampled pixels, up from 36. The count classified as purple by color stayed almost unchanged. More real casing is exposed, but the visible opening is still small. [Opening measurement](checks/opening-pixelmatch.json) · [Moving-view geometry](checks/two-camera-gap.json) · [Matched swim results](checks/matched-results.json)

All 8 gameplay assertions passed, and the successful route collected 91 coins, advanced from 1,330 to 2,240 and retained five hearts. Both 5.25-second H.264 films were decoded through all 63 frames. The saved cameras, simulation state, clocks and steering matched between the retained game and this experiment.

The APK and portable web build are compiled from the isolated reconstruction. Sustained performance on a physical Android device remains unverified. Owner approval is required before any visual replacement.
