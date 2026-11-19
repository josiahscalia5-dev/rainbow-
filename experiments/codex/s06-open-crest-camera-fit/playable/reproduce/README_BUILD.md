# Rebuild the isolated Screen 06 review app

Use a private checkout of this candidate revision with the normal Rainbow Node dependencies installed from its lockfile. The two packaging helpers build a separate review launcher and Android debug identity while using the game’s actual retained scene, cameras and controls.

1. In the project root, run `npm ci` and `npm run build`.
2. Run `python /path/to/package-web.py "$PWD/dist" /path/to/new-review-web`. Choose a new output directory on the same filesystem, or copy the dist files onto that filesystem first. The launcher points at the real game with the flags recorded in `review-settings.json`.
3. To test the browser build, run `python -m http.server --bind 127.0.0.1 --directory /path/to/new-review-web 8080` and open `http://127.0.0.1:8080` in Chromium. For the launcher regression, install the project’s pinned Playwright on the execution host, then run `node /path/to/test-launcher.cjs /path/to/new-review-web /path/to/browser-checks.json`. Set `RAINBOW_CHROMIUM` if your Chromium executable is in a different location.
4. Run `python /path/to/prepare-android.py "$PWD" /path/to/new-native /path/to/new-review-web`. Use a fresh native directory so the existing Android app and its identity stay intact.
5. With Android SDK platform 34, build-tools 34.0.0 and Gradle 8.2.1 available, change to `/path/to/new-native/android` and run `bash gradlew assembleDebug`. The debug APK appears under `app/build/outputs/apk/debug`. The sample package name is `com.rainbow.washergame.review.s06.twoviewcrest`; the retained game uses `com.rainbow.washergame`.
6. On an Android phone, open the separate review APK and select the artwork viewpoint or stage entrance. Steering uses the original game’s touch input. Inspect the crest through both turns and the exit. The matched evidence uses a 9∶16 portrait viewport. Phones with a different aspect ratio can show a different crop. Device frame rate, sustained heat and touch responsiveness still require an actual device run.

The launcher uses the project’s saved reference checkpoint for “artwork viewpoint.” The inlet choice runs the preceding stage forward to the Screen 06 boundary before returning control to the player. “Play from the start of the game” uses the ordinary game start with the Screen 06 candidate enabled. Additional scene interpretations and promotion need owner review.
