# Reproduce the Screen 06 test

The retained commit is `c649fcbc35780e11cefce83eb54684f1d55752a5`. The isolated experimental source is `24b007c4029efe31c81da2ddb7a6514cc7880b0e`. Use the branch’s existing dependency lockfile and start the Vite game on loopback. The capture script selects the same retained settings for both variants and appends the experimental switch only for NEW.

Provide the recorded Playwright and Chromium versions from the project's motion-matching skill. Set `RAINBOW_BASE_URL` to the local Vite address. From this directory run the following commands.

```sh
node capture.cjs stills 06:BEFORE 06:NEW
node capture.cjs repeat 06:BEFORE 06:NEW
node capture.cjs ride 06:BEFORE 06:NEW
node capture.cjs full-safe 06:NEW
```

The output is under `proof/06/`. Set `RAINBOW_CHROMIUM` to the local Chromium executable if its path differs. Use the saved passing camera, state and clock values in `poses.json` and every steering sample in `route.json` to check equivalence. Each film samples one frame for every five real 1/60-second game steps. Use `validate-captures.py --help` to check both captures and the protected whole-game test. The included opening comparator requires the project's pinned Pixelmatch version.
