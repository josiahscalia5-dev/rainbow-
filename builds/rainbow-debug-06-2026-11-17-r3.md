# rainbow-debug-06-2026-11-17-r3.apk — Screen 06 test build (not the default game)

* Built by the lead (account 4, 2026-11-17 ~19:30 UTC) from `claude/rainbow-s06-match-c4` @ `c088718b` (= Screen 06
  milestone 1, `-c3` tip) in a temporary worktree; no branch was changed. Round 3's own build attempt was blocked by
  Maven Central HTTP 429; this one: `BUILD SUCCESSFUL`.
* Command: `VITE_RAINBOW_Q05="match06=1" npm run android:debug` — Screen 06 shows the approved-picture reconstruction
  (`?match06=1`); every other screen is the default game. The bundle carries `match06=1` and the match06 plate, masks,
  camera and coin files (checked inside the APK).
* Debug-signed (Android Debug key), 26 MB, sha256 273e73c104ff8caa…. **NOT phone-tested.** Sent to the user 19:31 UTC.
