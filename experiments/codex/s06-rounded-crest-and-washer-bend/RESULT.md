# What changed in Screen 06

The purple opening beneath the rinse crest is now readable as Benny comes forward and steers hard left. At +3 the dry perforated metal and a gold upright show through the gap beside the coin. At +6 the opening extends left of Benny’s pom-pom, the underside curves toward the river, and the dark slot pattern that used to sit on the water has cleared. The right foreground beside Benny also loses the diagonal patch of photographed foam and metal that previously moved across his lane.

## Geometry and materials

The former perforated casing rose into view on top of the crest during turns. The replacement has a broader crowned water surface, an eight-segment rolled inner edge and a wet underside recessed beneath the top. Its downstream edge runs into the measured left bank. A fixed span of the lip above world Z −148 to −158 was raised after the independent reviewer identified a narrower aperture in an intermediate fit.

The downstream drum, its 12 existing gold collars and four paddles follow one bending 3D frame. The collars have broader rolled rims. Their lengthwise spacing and object count are preserved. The shaded purple metal and gold carry warm and cool reflections. Foam gains small, partly submerged groups along the measured outer banks. Away from the registered camera, flowing river details come from a retained water swatch mapped along the channel. The near riding surface, controls, coins, character transform and animations retain their previous implementation.

## What the game renderer measured

At +3 the reviewer picked a native rectangle from x140 to 380 and y510 to 715 around the wet opening. A separate render colored each physical scenery mesh with a unique ID after depth testing. Within the matching 270 × 480 diagnostic crop, the visible dry purple shell occupied 209 samples in the previous game, 41 in the lower trial, and 719 in the selected version. Exposed gold occupied 16 and 277 samples in the previous and selected versions. These counts describe the surfaces actually visible in that rectangle.

In the hard-left diagnostic, the former casing covered 1,838 pixels across the recorded viewport. The recessed wet underside covers 85 pixels at the same camera. In the checked patch directly on top of the stream, all 1,219 pixels in the revised version belong to the water surface.

The original and both opening captures have 864 × 1,536 pixels. Mean absolute RGB error against the original artwork, averaged over all channels and all pixels including the HUD on a 0–255 scale, was 16.183 before and 16.186 after. Pixelmatch 7.1.0, threshold 0.1 with antialiasing included, flagged 262,362 opening pixels before and 262,385 after, out of 1,327,104. Opening composition is visually stable within this test. The moving crest is where the visible gain occurred. The original provides a measured target only at its registered camera.

## Remaining visible differences

The outer arch still tapers into a thin inclined ribbon at an oblique angle, and the shaded underside is smoother and more lavender than the wet, sparkling edge in the original. Some purple bays and gold bands still look regularly repeated deeper in the washer. The large gold ends meet the river sharply. Portions of the near bank and foam remain angular and isolated. Benny retains the previous scale and existing model. His fur, knit cuff and pom-pom are visually simpler than the artwork. The separate independent review cites the exact frames and times for its largest remaining differences.

## Playable verification

Both versions passed all eight gameplay assertions. The safe full route collected 91 coins, traveled from 1,330 to 2,240, and finished at Screen 11 with five hearts and zero collisions. Fourteen native screenshot poses have matching camera, simulation state, steer, shader clock and Benny placement. The uninterrupted H.264 movies match on all 63 frames, from the Screen 06 inlet through both steering directions and into Screen 07, at 648 × 1,152 and 12 recorded frames per game-second. Both independent opening recaptures reproduce their decoded pixels exactly.

The restored source compiled into 80 production files identical to the separately captured game. The Android debug APK and Web ZIP share 84 byte-identical embedded web files. The launcher's approval-camera, inlet and complete-game starts were exercised in Chromium. At the opening, the renderer submitted 49 draws and 271,253 triangles before, and 49 draws and 290,901 triangles after. Physical Android performance remains untested. The fixed-rate movie describes simulation playback, not measured device FPS.

Blender 5.3.0 reopened the exported nine-mesh runtime scene. Vertices and UVs matched the captured game. The maximum error reprojecting geometry through the three saved Blender cameras was 0.00075 native pixels. The original image is packed and hash-verified in the editable file.

The private `codex/s06-rounded-crest-and-washer-bend` branch carries this candidate. The retained specialist, gameplay progression and the other four playable environments keep their existing versions. Owner review in motion and a sustained physical Android run remain outstanding.
