# Package verification — run on the EXPORTED files (not the original checkout), 2026-11-20 11:09–11:11 UTC

Environment: Linux, Node v22.23.5, npm 10.9.9. Commit of the export: bf01adf096f4f888eb73bc982b4ed55012ec12c2.

## 1_main_project (default game)
| Check | Result |
|---|---|
| `npm ci` | exit 0 — 124 packages installed from `package-lock.json` |
| `npx tsc --noEmit` | exit 0 — no errors |
| `npm run test:continuity` | exit 0 — `"ok": true`, every stage join gap 0, 07→08 vertical drop 61.19 u |
| `npx vite build` | exit 0 — production bundle built (main JS 905.58 kB, gzip 262.77 kB) |
| approved references | 12 / 12 screen + water pictures and the cartoon-girl reference byte-identical to `reference.sha256` (13 / 13) |

## 2_screen_versions (each made with `apply_version.py`, same node_modules)
| Version | `tsc --noEmit` | `test:continuity` |
|---|---|---|
| `benny_all_screens` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen04_s04` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen05_s05` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen06_lead_cone_test` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen06_s06` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen07_candidate_r23` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen07_s07` | exit 0 (0 error lines) | exit 0, "ok": true |
| `screen08_s08` | exit 0 (0 error lines) | exit 0, "ok": true |

Not re-run for this package (results from the specialists' notes, see README section 8): the browser gameplay test
(`scripts/gameplay-test.mjs`, needs Playwright + Chromium) and the screenshot / clip renders. No test was run on a phone.
The ZIP extraction test (every file's SHA-256 against `MANIFEST_FILES.tsv`, LFS files hold real data, required files present,
secret-pattern scan) is reported with the delivery.
