#!/usr/bin/env python3
"""Make a runnable copy of one screen version (cross-platform, Python 3.8+, no dependencies).

    python3 apply_version.py --list
    python3 apply_version.py screen07_candidate_r23            # -> ../run_screen07_candidate_r23/
    python3 apply_version.py screen04_s04 /path/to/target_dir

What it does: copies ../1_main_project to the target, deletes the files listed in <version>/DELETED_FILES.txt, then copies
<version>/overlay/ on top. The result is that version's exact app source (its base commit + its unfinished-work snapshot,
see <version>/VERSION.json). Then: cd <target> && npm ci && npm run dev, and open the URL with the version's
recommended_query (README section 3).
"""
import json, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MAIN = os.path.join(os.path.dirname(HERE), "1_main_project")


def versions():
    return sorted(d for d in os.listdir(HERE) if os.path.isfile(os.path.join(HERE, d, "VERSION.json")))


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help", "--list"):
        for v in versions():
            m = json.load(open(os.path.join(HERE, v, "VERSION.json")))
            print(f"{v:28s} screen {m['screen']:14s} {m['status'][:90]}")
        return
    name = sys.argv[1]
    src = os.path.join(HERE, name)
    if not os.path.isfile(os.path.join(src, "VERSION.json")):
        sys.exit(f"unknown version {name!r}; use --list")
    dest = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(os.path.dirname(HERE), f"run_{name}")
    if os.path.exists(dest):
        sys.exit(f"{dest} already exists — remove it or pass another target")
    shutil.copytree(MAIN, dest, ignore=shutil.ignore_patterns("node_modules", "dist"))
    n_del = 0
    for rel in open(os.path.join(src, "DELETED_FILES.txt")).read().split("\n"):
        p = os.path.join(dest, rel) if rel.strip() else None
        if p and os.path.isfile(p):
            os.remove(p); n_del += 1
    n_cp = 0
    ov = os.path.join(src, "overlay")
    for dp, _, fs in os.walk(ov):
        for f in fs:
            s = os.path.join(dp, f); d = os.path.join(dest, os.path.relpath(s, ov))
            os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy2(s, d); n_cp += 1
    m = json.load(open(os.path.join(src, "VERSION.json")))
    print(f"{name}: {dest}  (overlay {n_cp} files, removed {n_del})")
    print(f"next: cd \"{dest}\" && npm ci && npm run dev")
    print(f"then open: http://localhost:5173/?{m['recommended_query'].lstrip('&?')}")


if __name__ == "__main__":
    main()
