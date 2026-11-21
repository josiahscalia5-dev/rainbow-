#!/usr/bin/env python3
"""Build the Rainbow review package from ONE commit (consistent export; round 24, 2026-11-20).

usage: python3 -I tools/export/make_review_package.py <commit> <out_dir>

Every file comes from git objects of <commit> (or of a specialist's base commit + the unfinished-work snapshot stored IN
<commit> under backups/wip/), never from the live working tree, so files that change while the export runs cannot leak in.
Git LFS pointers are replaced by the real objects from .git/lfs/objects (SHA-256 + size verified). Nothing secret, no chat
transcripts, no node_modules, no .git. Writes <out_dir>/Rainbow_App_Review/... and <out_dir>/export_records.json.
"""
import hashlib, json, os, re, shutil, subprocess, sys

REPO = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, check=True).stdout.strip()
X, OUT = sys.argv[1], os.path.abspath(sys.argv[2])
X = subprocess.run(["git", "-C", REPO, "rev-parse", X], capture_output=True, text=True, check=True).stdout.strip()
ROOT = os.path.join(OUT, "Rainbow_App_Review")
LFS_DIR = os.path.join(REPO, ".git", "lfs", "objects")
SECRETISH = re.compile(r"(^|/)(\.env(\..*)?|.*\.(jks|keystore|p12|pem|key)|.*secret.*|.*credential.*|settings\.local\.json)$", re.I)
SKIP_PARTS = ("node_modules/", "/.git/", "claude-sessions/", "CONVERSATION_INDEX")
RECORDS, PROBLEMS = [], []


class Cat:
    def __init__(self):
        self.p = subprocess.Popen(["git", "-C", REPO, "cat-file", "--batch"], stdin=subprocess.PIPE, stdout=subprocess.PIPE)

    def blob(self, sha):
        self.p.stdin.write((sha + "\n").encode()); self.p.stdin.flush()
        hdr = self.p.stdout.readline().decode().split()
        if len(hdr) < 3 or hdr[1] == "missing":
            raise KeyError(sha)
        data = self.p.stdout.read(int(hdr[2])); self.p.stdout.read(1)
        return data


CAT = Cat()


def ls_tree(commit, specs):
    out = subprocess.run(["git", "-C", REPO, "ls-tree", "-r", "-z", "--full-tree", commit, "--", *specs],
                         capture_output=True, check=True).stdout.decode()
    rows = []
    for ent in out.split("\0"):
        if not ent:
            continue
        meta, path = ent.split("\t", 1)
        mode, typ, sha = meta.split()
        if typ == "blob":
            rows.append((mode, sha, path))
    return rows


def lfs_real(data):
    """data = blob bytes; returns (bytes, lfs_oid or None). Raises if the real object is missing / corrupt."""
    if not data.startswith(b"version https://git-lfs.github.com/spec/v1") or len(data) > 400:
        return data, None
    t = data.decode()
    oid = re.search(r"oid sha256:([0-9a-f]{64})", t).group(1)
    size = int(re.search(r"size (\d+)", t).group(1))
    p = os.path.join(LFS_DIR, oid[:2], oid[2:4], oid)
    if not os.path.isfile(p):
        raise FileNotFoundError(f"LFS object {oid[:12]} not in .git/lfs/objects")
    real = open(p, "rb").read()
    if len(real) != size or hashlib.sha256(real).hexdigest() != oid:
        raise ValueError(f"LFS object {oid[:12]} sha/size mismatch")
    return real, oid


def skip(path):
    return SECRETISH.search(path) or any(s in path for s in SKIP_PARTS)


def put(dest_rel, data, src_desc, lfs=None, section=""):
    dest = os.path.join(ROOT, dest_rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "wb") as fh:
        fh.write(data)
    RECORDS.append({"path": dest_rel, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest(),
                    "lfs": bool(lfs), "source": src_desc, "section": section})


def export(commit, specs, dest_prefix, section, strip="", filt=None, max_bytes=None):
    n = 0
    for mode, sha, path in ls_tree(commit, specs):
        if skip(path) or (filt and not filt(path)):
            continue
        if mode == "120000":
            PROBLEMS.append(f"symlink skipped: {path}"); continue
        try:
            data, oid = lfs_real(CAT.blob(sha))
        except Exception as e:  # noqa: BLE001
            PROBLEMS.append(f"{commit[:8]}:{path}: {e}"); continue
        if max_bytes and len(data) > max_bytes:
            PROBLEMS.append(f"left out (>{max_bytes >> 20} MB): {commit[:8]}:{path} ({len(data) >> 20} MB)"); continue
        rel = path[len(strip):] if strip and path.startswith(strip) else path
        put(os.path.join(dest_prefix, rel), data, f"{commit[:12]}:{path}", oid, section); n += 1
    return n


def show(commit, path):
    try:
        return subprocess.run(["git", "-C", REPO, "show", f"{commit}:{path}"], capture_output=True, check=True).stdout
    except subprocess.CalledProcessError:
        return None


# ---------------------------------------------------------------- 1 main project (the lead branch at X = default game)
MAIN_SPECS = ["src", "assets", "public", "index.html", "package.json", "package-lock.json", "tsconfig.json", "vite.config.ts",
              "capacitor.config.ts", "android", "scripts", "tools", "docs", ".gitignore", ".gitattributes", ".mcp.json.template",
              "README_FIRST.md", "REFERENCE_ORDER.md", "Rainbow_Claude_Code_Master_Prompt_11_Screens.md", "VISUAL_QA_CHECKLIST.md",
              "TOOL_SETUP_AND_VERIFICATION.md", "START_HERE_PASTE_TO_CLAUDE.md", "CLAUDE.md", "references", "character_references",
              ".claude/agents"]
APP_SPECS = ["src", "assets", "public", "index.html", "package.json", "package-lock.json", "tsconfig.json", "vite.config.ts",
             "capacitor.config.ts", "android", "scripts", "tools"]
n_main = export(X, MAIN_SPECS, "1_main_project", "main")
# the lead's own QA summaries the main project's docs point to (small)
for p in ["backups/AGENTS_STATUS.json", "backups/TOOL_MANIFEST.json"]:
    d = show(X, p)
    if d:
        put(os.path.join("1_main_project", p), d, f"{X[:12]}:{p}", None, "main")

# ---------------------------------------------------------------- 2 screen versions (unmerged specialist lines + their WIP)
VERSIONS = [
    dict(name="screen04_s04", screen="04", wip="claude__rainbow-s04-match-c25", base="34cb494137e1030c4410d871125e6e9eef6aa4ea",
         from_branch="claude/rainbow-s04-match-c21", query_from=(X, "qa/match/04/r23/QUERY_K23-1.txt"),
         progress=[(X, "qa/match/04/r23/PROGRESS.md")],
         status="Screen 04 specialist (washer-environment-modeler) — RUNNING at export time (round 24), steps 2–3 unfinished. "
                "Candidate K23-1 (pink walls off, clear blue water, gold visible) was shown to the user, NOT approved."),
    dict(name="screen05_s05", screen="05", wip="claude__rainbow-s05-match-c25", base="eb7233e3646640397f14e360f601aeff088d7536",
         from_branch="claude/rainbow-s05-match-c19", query_from=(X, "qa/review_r21/audit/QUERY_05.txt"),
         progress=[("eb7233e3646640397f14e360f601aeff088d7536", "qa/match/05/r18/PROGRESS.md")],
         status="Screen 05 specialist — QUEUED (not running). Last finished step r19 step 2 (committed). NOT approved."),
    dict(name="screen06_s06", screen="06", wip="claude__rainbow-s06-match-c25", base="e162aec2bfdc631913c41daa435f9d449439af4f",
         from_branch="claude/rainbow-s06-match-c23", query_from=(X, "qa/match/06/r24/lead_rip/QUERY_RIP.txt"),
         progress=[(X, "qa/match/06/r23/PROGRESS.md")],
         status="Screen 06 specialist — finished 3 steps in round 23 (uncommitted, snapshotted). Candidates NOT approved; the user "
                "asked to keep the camera experiment as an unapproved candidate; opening 'blue cone' still open."),
    dict(name="screen06_lead_cone_test", screen="06", wip="detached-e162aec2bf", base="e162aec2bfdc631913c41daa435f9d449439af4f",
         from_branch="claude/rainbow-s06-match-c23", query_from=(X, "qa/match/06/r24/lead_rip/QUERY_RIPZ.txt"),
         progress=[(X, "qa/match/06/r24/lead_rip/NOTES.md")],
         status="Lead test, IN PROGRESS, not proven: &m06ripz=1 + QA debug &m06wdbg=1 (diagnosis of the opening 'blue cone')."),
    dict(name="screen07_candidate_r23", screen="07", wip="detached-8accdad0a0", base="8accdad0a07ec4e3c4189701aea9df101932c7f5",
         from_branch="claude/rainbow-s07-match-c18", query_from=(X, "qa/match/07/r23/lead_clip/QUERY.txt"),
         progress=[(X, "qa/match/07/r23/PROGRESS.md")],
         status="The exact build of the labelled Screen 07 clip the user reviewed (~10:35 UTC): rounder fuller foam (user-liked "
                "candidate) + satin bands. NOT approved (S-bends, steering view, 07→08 join requested)."),
    dict(name="screen07_s07", screen="07", wip="claude__rainbow-s07-match-c25", base="8accdad0a07ec4e3c4189701aea9df101932c7f5",
         from_branch="claude/rainbow-s07-match-c18", query_from=(X, "qa/match/07/r23/s2_sriver/query_NEW.txt"),
         progress=[(X, "qa/match/07/r23/PROGRESS.md")],
         status="Screen 07 specialist (water-fx-specialist) — RUNNING at export time on the user's 3 priorities; code mid-change "
                "(unfinished S-bend step &m07sbend=1). NOT approved."),
    dict(name="screen08_s08", screen="08", wip="claude__rainbow-s08-scenery-c25", base="3c0fa97090afb2c0fca41898774db7247e23e522",
         from_branch="claude/rainbow-s08-scenery-c17", query_from=(X, "qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt"),
         progress=[(X, "qa/match/08/r23/PROGRESS.md")],
         status="Screen 08 polish specialist — FINISHED 3 steps (~11:05 UTC, uncommitted, snapshotted): softer near-water glints, "
                "coin sizes tapering like the painting, towel double exposure removed. Candidate K23-3, NOT user-approved "
                "(coins08px=1 = the user's preferred coin version)."),
    dict(name="benny_all_screens", screen="04-08 (Benny)", wip="claude__rainbow-benny-c25", base="734efb6bc407c691c3d7d99e29b710544c82a9c5",
         from_branch="claude/rainbow-benny-c23", query_text="&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1",
         progress=[(X, "qa/benny/r23/PROGRESS.md")],
         status="Benny specialist — RUNNING at export time (felt star, knit, fur). Best query not approved."),
]


def build_version(v):
    import tempfile
    tmp = tempfile.mkdtemp(prefix=f"ver_{v['name']}_", dir=OUT)
    n = 0
    for mode, sha, path in ls_tree(v["base"], APP_SPECS):
        if skip(path) or mode == "120000":
            continue
        try:
            data, _ = lfs_real(CAT.blob(sha))
        except Exception as e:  # noqa: BLE001
            PROBLEMS.append(f"version {v['name']}: {v['base'][:8]}:{path}: {e}"); continue
        d = os.path.join(tmp, path); os.makedirs(os.path.dirname(d), exist_ok=True); open(d, "wb").write(data); n += 1
    patch = show(X, f"backups/wip/{v['wip']}/tracked.patch")
    applied = "none"
    if patch:
        pf = os.path.join(OUT, f"{v['name']}.patch"); open(pf, "wb").write(patch)
        inc = sum([["--include", f"{s}/*", "--include", s] for s in APP_SPECS], [])
        r = subprocess.run(["git", "apply", "--binary", *inc, pf], cwd=tmp, capture_output=True, text=True)
        applied = "ok" if r.returncode == 0 else f"FAILED: {r.stderr[:300]}"
        if r.returncode:
            PROBLEMS.append(f"version {v['name']}: snapshot patch did not apply: {r.stderr[:200]}")
    unt = 0
    for mode, sha, path in ls_tree(X, [f"backups/wip/{v['wip']}/untracked"]):
        rel = path.split("/untracked/", 1)[1]
        if skip(rel) or not any(rel == s or rel.startswith(s + "/") for s in APP_SPECS):
            continue
        data, _ = lfs_real(CAT.blob(sha))
        d = os.path.join(tmp, rel); os.makedirs(os.path.dirname(d), exist_ok=True); open(d, "wb").write(data); unt += 1
    # overlay vs the main project
    main_root = os.path.join(ROOT, "1_main_project")
    vroot = os.path.join("2_screen_versions", v["name"])
    changed, added, deleted = [], [], []
    for dp, _, fs in os.walk(tmp):
        for f in fs:
            full = os.path.join(dp, f); rel = os.path.relpath(full, tmp)
            m = os.path.join(main_root, rel)
            data = open(full, "rb").read()
            if os.path.isfile(m) and open(m, "rb").read() == data:
                continue
            (changed if os.path.isfile(m) else added).append(rel)
            put(os.path.join(vroot, "overlay", rel), data, f"{v['base'][:12]}+wip:{rel}", None, f"version:{v['name']}")
    for dp, _, fs in os.walk(main_root):
        for f in fs:
            rel = os.path.relpath(os.path.join(dp, f), main_root)
            if any(rel == s or rel.startswith(s + "/") for s in APP_SPECS) and not os.path.isfile(os.path.join(tmp, rel)):
                deleted.append(rel)
    put(os.path.join(vroot, "DELETED_FILES.txt"), ("\n".join(sorted(deleted)) + "\n").encode(), "computed", None, f"version:{v['name']}")
    info = json.loads(show(X, f"backups/wip/{v['wip']}/INFO.json") or b"{}")
    q = v.get("query_text") or (show(*v["query_from"]) or b"").decode().strip()
    meta = {"name": v["name"], "screen": v["screen"], "status": v["status"], "base_commit": v["base"], "base_branch": v["from_branch"],
            "unfinished_work_snapshot": f"backups/wip/{v['wip']}/ in commit {X} (snapshot time {info.get('time')})",
            "snapshot_dirty_tracked": info.get("dirty_tracked"), "snapshot_untracked": info.get("untracked_copied"),
            "snapshot_patch_applied": applied, "files_in_version": n + unt, "overlay_changed": len(changed),
            "overlay_added": len(added), "deleted_vs_main": len(deleted), "recommended_query": q}
    put(os.path.join(vroot, "VERSION.json"), json.dumps(meta, indent=2).encode(), "computed", None, f"version:{v['name']}")
    if patch:
        put(os.path.join(vroot, "unfinished_work.patch"), patch, f"{X[:12]}:backups/wip/{v['wip']}/tracked.patch", None, f"version:{v['name']}")
    for c, p in v["progress"]:
        d = show(c, p)
        if d:
            put(os.path.join(vroot, "notes", os.path.basename(os.path.dirname(p)) + "_" + os.path.basename(p)), d, f"{c[:12]}:{p}", None, f"version:{v['name']}")
    shutil.rmtree(tmp)
    return meta


VERSION_META = [build_version(v) for v in VERSIONS]

# ---------------------------------------------------------------- 3 references (approved originals vs artwork vs proposals)
export(X, ["references"], "3_references/A_APPROVED_ORIGINAL_SCREENS_01-11", "ref", strip="references/")
export(X, ["character_references"], "3_references/B_APPROVED_CHARACTER_REFERENCE", "ref", strip="character_references/")
put("3_references/A_APPROVED_ORIGINAL_SCREENS_01-11/reference.sha256", show(X, "scripts/reference.sha256"), f"{X[:12]}:scripts/reference.sha256", None, "ref")
A4 = "qa/review_r21/artwork/04/"
export(X, [A4 + "accepted", A4 + "USER_VERDICT.md"] + [A4 + f"FOR_APPROVAL_04_{k}.png" for k in ("c_middle", "d_late", "e_end")],
       "3_references/C_APPROVED_ADDITIONAL_ARTWORK_screen04_generated_views", "ref", strip=A4)
for s in ("05", "07"):
    A = f"qa/review_r21/artwork/{s}/"
    export(X, [A], f"3_references/D_UNAPPROVED_PROPOSALS_screen{s}", "ref", strip=A,
           filt=lambda p: "/proposals/" not in p and "/swatches/" not in p)
export(X, ["qa/review_r21/artwork/LEDGER.md"], "3_references/D_UNAPPROVED_PROPOSALS_screen05", "ref", strip="qa/review_r21/artwork/")
export(X, ["qa/gameplay_video/source"], "3_references/E_USER_PHONE_RECORDING_2026-11-17_match08_APK", "ref", strip="qa/gameplay_video/source/")

# ---------------------------------------------------------------- 4 evidence (labelled in the README / INDEX)
EVID = {"04": ["qa/match/04/r23", "qa/match/04/r22"], "06": ["qa/match/06/r23", "qa/match/06/r24"],
        "07": ["qa/match/07/r23", "qa/match/07/r24"], "08": ["qa/match/08/r23"], "benny": ["qa/benny/r23"]}
core_kind = lambda p: p.lower().endswith((".mp4", ".webm", ".md", ".txt", ".json"))  # noqa: E731
for scr, dirs in EVID.items():
    for d in dirs:
        export(X, [d], f"4_evidence/screen{scr}/{d.replace('qa/', '')}", "evid_core", strip=d + "/", filt=core_kind, max_bytes=40 << 20)
        export(X, [d], f"4_evidence/screen{scr}/{d.replace('qa/', '')}", "evid_stills", strip=d + "/",
               filt=lambda p: not core_kind(p) and "/tools/" not in p, max_bytes=40 << 20)
export("eb7233e3646640397f14e360f601aeff088d7536", ["qa/match/05/r18"], "4_evidence/screen05/match/05/r18", "evid_core",
       strip="qa/match/05/r18/", filt=core_kind)
export("eb7233e3646640397f14e360f601aeff088d7536", ["qa/match/05/r18"], "4_evidence/screen05/match/05/r18", "evid_stills",
       strip="qa/match/05/r18/", filt=lambda p: not core_kind(p) and "/tools/" not in p)
export(X, ["qa/review_r21/audit"], "4_evidence/all_screens_audit_r21", "evid_core", strip="qa/review_r21/audit/",
       filt=lambda p: core_kind(p) or "/OVERVIEW_" in p or p.split("/")[-1].startswith("OVERVIEW_"))
export(X, ["qa/review_r21/audit"], "4_evidence/all_screens_audit_r21", "evid_stills", strip="qa/review_r21/audit/",
       filt=lambda p: not (core_kind(p) or p.split("/")[-1].startswith("OVERVIEW_")))
export(X, ["screenshots"], "4_evidence/default_build_per_scene_screenshots", "evid_stills", strip="screenshots/")

# ---------------------------------------------------------------- 5 android
for apk in ["builds/rainbow-debug-match08-2026-11-17c-benny.apk", "builds/rainbow-debug-06-2026-11-17-r3.apk",
            "builds/rainbow-debug-06-2026-11-17-r3.md"]:
    export(X, [apk], "5_android_apk", "apk_core", strip="builds/")
export(X, ["builds"], "5_android_apk/older_apks", "apk_more", strip="builds/",
       filt=lambda p: p.endswith(".apk") and "17c-benny" not in p and "17-r3" not in p)

# ---------------------------------------------------------------- 6 Marble / World Labs world files (optional assets)
export(X, ["qa/worldlabs"], "6_marble_worldlabs_assets", "marble", strip="qa/worldlabs/")

json.dump({"commit": X, "records": RECORDS, "problems": PROBLEMS, "versions": VERSION_META, "main_files": n_main},
          open(os.path.join(OUT, "export_records.json"), "w"), indent=1)
tot = sum(r["bytes"] for r in RECORDS)
print(f"files {len(RECORDS)}  bytes {tot / 1e6:.1f} MB  problems {len(PROBLEMS)}")
for s in sorted({r['section'] for r in RECORDS}):
    print(f"  {s:32s} {sum(r['bytes'] for r in RECORDS if r['section'] == s) / 1e6:8.1f} MB  {sum(1 for r in RECORDS if r['section'] == s)} files")
for p in PROBLEMS[:40]:
    print("  PROBLEM", p)
