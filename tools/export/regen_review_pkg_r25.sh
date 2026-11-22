#!/usr/bin/env bash
# Regenerate the round-24 ChatGPT review package (7 ZIPs) from the SAME commit bf01adf and verify every file against the
# saved manifest docs/review_package/2026-11-20/MANIFEST_FILES.tsv (2,161 files, SHA-256).
set -euo pipefail
SP=${1:?usage: regen_review_pkg_r25.sh <scratch dir for export + ZIPs>}
R=/home/user/rainbow-; D=$R/docs/review_package/2026-11-20
E=$SP/export; Z=$SP/Rainbow_App_Review_ZIPS; T=$SP/extract_test
rm -rf "$E" "$Z" "$T"; mkdir -p "$E"
cd "$R"
echo "== stage from bf01adf $(date -u +%H:%M:%S)"
nice -n 15 python3 -I tools/export/make_review_package.py bf01adf096f4f888eb73bc982b4ed55012ec12c2 "$E" | tail -5
P=$E/Rainbow_App_Review
echo "== generated docs (saved copies) $(date -u +%H:%M:%S)"
cp "$D/REVIEW_README.md" "$D/MANIFEST.json" "$D/MANIFEST_FILES.tsv" "$D/PACKAGE_VERIFICATION.md" "$P/"
cp "$D/apply_version.py" "$P/2_screen_versions/apply_version.py"
cp "$D/EVIDENCE_INDEX.md" "$P/4_evidence/INDEX.md"
cat > "$P/.env.example" <<'ENV'
# Rainbow — example configuration (PLACEHOLDERS ONLY; the game itself needs none of these)

# Build time: bake URL switches into a packaged build (APKs have no URL bar). Example = Screen 08 with the preferred coins.
VITE_RAINBOW_Q05="match08=1&coins08px=1"

# Asset / QA tooling only. The repository's scripts do not read these variables: in the original cloud environment a
# network proxy added the keys to requests. To use the tools elsewhere, send them as shown.
WORLDLABS_API_KEY=your-worldlabs-api-key       # sent as header  WLT-Api-Key: <key>   to https://api.worldlabs.ai
FAL_KEY=your-fal-api-key                       # sent as header  Authorization: Key <key>   to https://queue.fal.run
HF_TOKEN=your-hugging-face-token               # optional, Hugging Face Hub downloads
ENV
echo "== partition from the saved manifest"
python3 -I - "$D/MANIFEST_FILES.tsv" "$D/MANIFEST.json" "$E" <<'PY'
import csv, json, os, sys
tsv, man, E = sys.argv[1:4]
zp = json.load(open(man))["zip_parts"]
name2part = {n: v["part"] for n, v in zp.items()}
recs = []
with open(tsv) as f:
    for r in csv.DictReader(f, delimiter="\t"):
        recs.append({"path": r["path"].split("/", 1)[1], "zip": name2part[r["zip"]], "bytes": int(r["bytes"]), "sha256": r["sha256"]})
json.dump(recs, open(os.path.join(E, "records_with_zip.json"), "w"))
json.dump({v: n for n, v in name2part.items()}, open(os.path.join(E, "zipnames.json"), "w"))
staged = sum(len(fs) for _, _, fs in os.walk(os.path.join(E, "Rainbow_App_Review")))
print("manifest files", len(recs), "staged files", staged)
PY
echo "== zip + extraction test $(date -u +%H:%M:%S)"
nice -n 15 python3 -I "$D/zip_and_test.py" "$E" "$Z" "$T" 2>&1 | grep -vE '^\s+"[0-9.]+ MB'
ls -la "$Z"
rm -rf "$T"
echo "== DONE $(date -u +%H:%M:%S)"
