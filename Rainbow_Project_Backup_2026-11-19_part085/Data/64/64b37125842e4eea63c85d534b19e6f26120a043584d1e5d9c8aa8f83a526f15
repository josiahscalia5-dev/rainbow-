# Reproduce the Screen 07 test

The retained commit is `8651edf92525a9aab82b02fad9aa44621216708a`. The isolated experimental source is `31bffebe08cf123b615b3c515030f6157b7ca667`. Use the branch’s existing dependency lockfile and start the Vite game on loopback. The capture script selects the same retained settings for both variants and appends the experimental switch only for NEW.

Provide the recorded Playwright and Chromium versions from the project's motion-matching skill. Set `RAINBOW_BASE_URL` to the local Vite address. From this directory run the following commands.

```sh
node capture.cjs stills 07:BEFORE 07:NEW
node capture.cjs repeat 07:BEFORE 07:NEW
node capture.cjs ride 07:BEFORE 07:NEW
node capture.cjs full-safe 07:NEW
```

The output is under `proof/07/`. Set `RAINBOW_CHROMIUM` to the local Chromium executable if its path differs. Use the saved passing camera, state and clock values in `poses.json` and every steering sample in `route.json` to check equivalence. Each film samples one frame for every five real 1/60-second game steps. Use `validate-captures.py --help` to check both captures and the protected whole-game test. The included opening comparator requires the project's pinned Pixelmatch version.
