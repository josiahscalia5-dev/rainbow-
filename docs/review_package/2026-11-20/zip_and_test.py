#!/usr/bin/env python3
"""Zip the staged Rainbow_App_Review into its parts, then test extraction against MANIFEST_FILES.tsv."""
import hashlib, json, os, shutil, sys, zipfile

EXP = sys.argv[1]            # .../export (contains Rainbow_App_Review/, records_with_zip.json, zipnames.json)
OUTD = sys.argv[2]           # where the ZIPs go
TEST = sys.argv[3]           # extraction test dir
R = os.path.join(EXP, "Rainbow_App_Review")
recs = json.load(open(os.path.join(EXP, "records_with_zip.json")))
names = json.load(open(os.path.join(EXP, "zipnames.json")))
part_of = {r["path"]: r["zip"] for r in recs}
STORED = (".png", ".jpg", ".jpeg", ".mp4", ".webm", ".apk", ".zip", ".glb", ".spz", ".ply", ".blend", ".webp", ".gz")
os.makedirs(OUTD, exist_ok=True)
groups = {}
for dp, _, fs in os.walk(R):
    for f in fs:
        rel = os.path.relpath(os.path.join(dp, f), R)
        groups.setdefault(part_of.get(rel, "core"), []).append(rel)   # generated docs (README, MANIFEST, ...) -> core
for part, files in sorted(groups.items()):
    zp = os.path.join(OUTD, names[part])
    if os.path.exists(zp):
        os.remove(zp)
    with zipfile.ZipFile(zp, "w", allowZip64=True) as z:
        for rel in sorted(files):
            ct = zipfile.ZIP_STORED if rel.lower().endswith(STORED) else zipfile.ZIP_DEFLATED
            z.write(os.path.join(R, rel), "Rainbow_App_Review/" + rel, compress_type=ct, compresslevel=6 if ct == zipfile.ZIP_DEFLATED else None)
    print(f"{names[part]}: {len(files)} files, {os.path.getsize(zp) / 1e6:.1f} MB")

# ---- extraction test (fresh dir, every ZIP, then check against the manifest)
shutil.rmtree(TEST, ignore_errors=True); os.makedirs(TEST)
for part in sorted(groups):
    with zipfile.ZipFile(os.path.join(OUTD, names[part])) as z:
        bad = z.testzip()
        if bad:
            print("CRC ERROR", names[part], bad)
        z.extractall(TEST)
T = os.path.join(TEST, "Rainbow_App_Review")
ok = mism = missing = pointers = 0
problems = []
for line in open(os.path.join(T, "MANIFEST_FILES.tsv")).read().splitlines()[1:]:
    path, size, sha, lfs, zname, src = line.split("\t")
    p = os.path.join(TEST, path)
    if not os.path.isfile(p):
        missing += 1; problems.append(f"MISSING {path}"); continue
    data = open(p, "rb").read()
    if hashlib.sha256(data).hexdigest() != sha or len(data) != int(size):
        mism += 1; problems.append(f"MISMATCH {path}"); continue
    if data.startswith(b"version https://git-lfs.github.com/spec/v1"):
        pointers += 1; problems.append(f"LFS POINTER (no real data) {path}")
    ok += 1
required = ["REVIEW_README.md", "MANIFEST.json", "MANIFEST_FILES.tsv", ".env.example", "PACKAGE_VERIFICATION.md",
            "1_main_project/package.json", "1_main_project/package-lock.json", "1_main_project/index.html", "1_main_project/src/main.ts",
            "1_main_project/src/game/Game.ts", "1_main_project/android/app/build.gradle", "1_main_project/assets/models/benny.glb",
            "1_main_project/assets/models/rainbow_girl.glb", "2_screen_versions/apply_version.py", "4_evidence/INDEX.md",
            "5_android_apk/rainbow-debug-match08-2026-11-17c-benny.apk"] + \
           [f"3_references/A_APPROVED_ORIGINAL_SCREENS_01-11/{n}" for n in sorted(os.listdir(os.path.join(R, "3_references/A_APPROVED_ORIGINAL_SCREENS_01-11"))) if n.endswith(".png")]
req_missing = [q for q in required if not os.path.isfile(os.path.join(T, q))]
big = sorted(((os.path.getsize(os.path.join(dp, f)), os.path.relpath(os.path.join(dp, f), T)) for dp, _, fs in os.walk(T) for f in fs), reverse=True)[:8]
# secret scan of text files
import re
pat = re.compile(rb"(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|hf_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|WLT-Api-Key:\s*[A-Za-z0-9]{16,})")
secret_hits = []
for dp, _, fs in os.walk(T):
    for f in fs:
        p = os.path.join(dp, f)
        if os.path.getsize(p) < 3_000_000 and not f.lower().endswith(STORED):
            m = pat.search(open(p, "rb").read())
            if m:
                secret_hits.append(f"{os.path.relpath(p, T)}: {m.group(0)[:12]!r}…")
forbidden = [os.path.relpath(os.path.join(dp, d), T) for dp, ds, _ in os.walk(T) for d in ds if d in ("node_modules", ".git", "claude-sessions")]
res = {"manifest_files_ok": ok, "mismatch": mism, "missing": missing, "lfs_pointers_left": pointers, "required_missing": req_missing,
       "largest_files": [f"{s / 1e6:.1f} MB {p}" for s, p in big], "secret_pattern_hits": secret_hits, "forbidden_dirs": forbidden,
       "problems": problems[:30], "zips": {names[p]: round(os.path.getsize(os.path.join(OUTD, names[p])) / 1e6, 1) for p in groups}}
json.dump(res, open(os.path.join(OUTD, "extraction_test.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
