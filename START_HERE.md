# Rainbow game and visual review

Open [the phone viewer](OPEN_ON_PHONE.html) after extracting the ZIP to browse the original artwork, matched pictures and complete swims. The [37-page visual review PDF](Rainbow_Visual_Review.pdf) has one complete scene per page.

To request an independent ChatGPT review, attach this ZIP in a chat that supports file analysis and paste the text in [PROMPT_FOR_CHATGPT.txt](PROMPT_FOR_CHATGPT.txt). If your app declines ZIP files, extract this same download in Android Files. Attach the PDF for a first pass, then the desired MP4 and the separate full-size scene files for detailed motion analysis. Ask ChatGPT to identify any media it could not open or play.

## The five playable screens

- [04 — Through the Five Arrows](03_SCREENS/Screen_04/REVIEW_THIS_SCREEN.md). Follow the five arrows into the machine. Inspect the fifth bay between 1.9 and 3.2 seconds for ring thickness, amber grooves and pink-violet reflections. The deeper corridor still repeats its shape.
- [05 — Flow Into the Current](03_SCREENS/Screen_05/REVIEW_THIS_SCREEN.md). Inspect the final S-bend between 5.4 and 6.7 seconds. Watch the length of highlights in the cyan channel and the sharpness of the nearby purple wall. The rejected highlight trial leaves uneven blue streaks.
- [06 — Crest the Rinse Arch](03_SCREENS/Screen_06/REVIEW_THIS_SCREEN.md). Pause around 1.0 second as the crest releases, then compare the hard turns and the curved arch around 2.0 seconds. Check the pale area below Benny, foam over his lower body and the centering of rings in the deeper tunnel. The fitted cuff is a separate character candidate.
- [07 — Dive the Washer Tube](03_SCREENS/Screen_07/REVIEW_THIS_SCREEN.md). Watch from approximately 5.4 to 11.8 seconds. Inspect the white sides, the vertical streaks and the continuity of the magenta banks during the plunge. The foam trial exposes white ledges at the outlet. Claudia’s near-water result is the retained baseline.
- [08 — Final Spin Chamber](03_SCREENS/Screen_08/REVIEW_THIS_SCREEN.md). Inspect the first 1.7 seconds, especially the hard-right view near 1.1 seconds. Follow the foreground highlights through the platform approach. Check the bank width, four pouring spouts, towel and chamber scale.

## What the archive contains

- **01_GAME** holds Claudia’s verified lead edition directly in the original project layout. It includes Three.js and TypeScript, Vite, Capacitor, Android, shaders, water geometry, camera logic, textures, models, lockfiles, scripts and handoff documents. The lead branch is ccr-bbe2b27e-oxfh1w at d22ec46b72146d69703d4271cd54c1c852164dff. Each screen’s retained specialist checkpoint is identified in its guide.
- **02_VERSIONS** holds 31 complete project source editions by manifest. These cover the lead, all six Claudia specialists and 24 Codex runtime, modeling and skill branches. Each edition references shared files once. [Browse the branch and commit inventory](05_REVIEW_RECORDS/VERIFIED_BRANCHES.csv). The four earlier download branches are identified there separately.
- **03_SCREENS** holds 718 distinct source images and 48 distinct source recordings. The [media index](05_REVIEW_RECORDS/MEDIA_INDEX.csv) maps 1294 saved uses to their original paths, branch, disposition and packaged file. Identical opening captures have individually named before and new files for each experiment.
- **05_REVIEW_RECORDS** contains branch provenance, measured render comparisons, camera states, route and steering samples, the visual motion tests, Android build evidence, Benny’s measurements and Claudia’s unfinished work records. The [editable model index](05_REVIEW_RECORDS/MODEL_AND_SCENE_INDEX.csv) locates the 10 Blender scenes and 13 GLB models across editions. [The source and build checks](05_REVIEW_RECORDS/PACKAGE_SOURCE_AND_BUILD_CHECKS.json) show which editions built and which files opened.
- [SHA256SUMS.txt](SHA256SUMS.txt) lists the checksum of each other file in the ZIP.

## How to read the results

APPROVED identifies the owner’s original artwork. CLAUDIA BEFORE identifies retained gameplay at the listed specialist commit. CANDIDATE means Codex recommends owner review. REJECTED means the isolated experiment did not improve the result sufficiently. Earlier diagnostics and unfinished patches have their own labels. No moving viewpoint gains approval by appearing in this package.

The latest candidates concern Screen 04’s fifth gold ring, Screen 06’s crest release and Screen 06’s beanie cuff. The recent Screen 05 bend, Screen 07 outlet and Screen 08 chamber-flow tests were rejected. Use the [saved experiment reports](05_REVIEW_RECORDS/EXPERIMENTS.csv) for those and earlier tests. Compare Benny’s silhouette and apparent size at matched camera positions, then zoom in on the pink fur, purple-and-white knitting and yellow star.

Each recent motion pair uses matched camera, steering and gameplay state in the real renderer with controlled simulation and shader timing. Current route logs record the 60 Hz simulation, input sequence and selected capture positions. Video sample rate and resolution are recorded per clip in the media index. The saved gameplay passes recorded eight assertions, 91 collected coins, a score from 1,330 to 2,240 and five hearts. The Android debug build was verified. Physical-device frame rate and heat still need a hardware run.

## Source fidelity and limits

All eleven original approved screen images, the approved water detail and the separate original character reference match the project’s SHA-256 manifest. The five playable originals in the guides are direct byte copies. Their source filenames end in .png and their actual file format is JPEG. The phone copies have the accurate .jpg extension. Game code, textures and playable models are stored in their original bytes. Git LFS pointers for the included source files have been replaced with their verified binaries.

Pictures preserve their source width and height. All openings in the 13 recent comparisons and the key current issue frames are pixel-exact. Other stills use native-size AVIF with their encoding difference measured against the source. The H.264 films preserve resolution, frame count and the complete recorded journey. Some older diagnostics were originally captured below the artwork’s resolution. The PDF contains smaller viewing copies for a quick phone review. The separate scene files preserve the native resolution. A computer can also export any AVIF or WebP still as a full-size PNG with 05_REVIEW_RECORDS/export_review_png.py. For measurements use the original-frame reports. Media encoding checks measure transfer fidelity only. Original artwork supplies a measurable target at its own camera angle. Other views document proposed continuations.

Screens 01–03 and 09–11 belong to the separate Google Flow workflow. Their artwork, handoff and playback code are included. The original intro.mp4 and ending.mp4 masters were absent from all 31 packaged source trees. The repository contains a placement note for those external videos. Thirteen offline splat, point-cloud or research input entries are listed with pinned private source links in [EXTERNAL_RESEARCH_ASSETS.csv](05_REVIEW_RECORDS/EXTERNAL_RESEARCH_ASSETS.csv). The playable project and the packaged Blender and GLB models are included locally. This review export omits Git history, dependency caches and service credentials.

## Open a source edition

On a computer with Python 3.11 or later, extract the archive and use the helper from the package root. Choose a new output folder. The helper verifies each file before assembling the edition.

    python 02_VERSIONS/materialize_version.py --list
    python 02_VERSIONS/materialize_version.py Claudia_S06 ../Rainbow_S06_Claudia
    python 02_VERSIONS/materialize_version.py Codex_s06-benny-fitted-knit-cuff ../Rainbow_S06_Cuff

Inside a restored edition, install the project’s locked dependencies with npm ci and use npm run build. The original project instructions and test commands are in the restored edition. The images, PDF, screen guides and MP4s can be inspected directly on a phone.
