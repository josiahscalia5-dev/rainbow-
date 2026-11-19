#!/usr/bin/env bash
# RAINBOW — one-command recovery + environment bootstrap for a new Claude account or cloud session.
# Safe to run any number of times: every step checks first and only installs / merges what is missing.
#
#   bash scripts/claude-bootstrap.sh            full: fetch + REPORT newer branches (no merge), LFS, refs, agents, Marble,
#                                               tools, Blender render check, MCP, tests, five-minute autosave, report
#                                               (backups/BOOTSTRAP_REPORT.md)
#   bash scripts/claude-bootstrap.sh --resume   the same, and MERGE every newer ccr-*/claude/* branch. ONLY when the user
#                                               asks for it: since 2026-11-17 nothing is merged automatically (user's
#                                               order) - not by the SessionStart hook, not by a plain run
#   bash scripts/claude-bootstrap.sh --check    report only: no installs, no merges (fetch is still done)
#   bash scripts/claude-bootstrap.sh --full     full + browser gameplay test + Screen 05 BEFORE pixel check
#                                               + fresh download of every LFS object from GitHub (SHA-256)
#   bash scripts/claude-bootstrap.sh --status   last report + autosave verdict (instant)
#   options: --no-tools (skip Blender/Android/pip/plugin installs)  --skip-resume (default now: never merge)
#   internal: --hook (SessionStart hook)  --background (rest of the hook run)  --env-setup (cloud setup script)
#
# New account, any start branch (the GitHub default branch is an OLD version):
#   git fetch origin <newest-branch> && git show FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh
#
# Safety: never force-pushes, resets, rebases, deletes files or rewrites history. NO automatic merges: newer branches
# are only listed (what they contain, how to merge). With --resume, merges are normal merge commits;
# a merge that conflicts (outside auto-generated status files) is ABORTED and reported, never left half-done.
# Never pushes to backups/autosave.config.json -> protected_branches. Never reads, prints or stores credentials.
# Paid World Labs / Marble jobs are never started (only the free credit-balance read).
set -uo pipefail
ORIG_ARGS=("$@")
MODE=full; DO_RESUME=0; DO_TOOLS=1; FULL_TESTS=0; CONTINUE=0; NO_AUTOSAVE=0   # DO_RESUME=1 only with --resume
UNSHALLOW_TIMEOUT=300; FETCH_TIMEOUT=180   # the SessionStart hook uses shorter limits
for a in "$@"; do case "$a" in
  --check) MODE=check; DO_RESUME=0; DO_TOOLS=0 ;;
  --full) FULL_TESTS=1 ;;
  --status) MODE=status ;;
  --hook) MODE=hook ;;
  --background) MODE=background; DO_RESUME=0; CONTINUE=1 ;;
  --env-setup) MODE=env-setup; DO_RESUME=0 ;;
  --no-tools|--skip-tools) DO_TOOLS=0 ;;
  --skip-resume) DO_RESUME=0 ;;
  --resume|--merge) DO_RESUME=1 ;;  # explicit, on the user's request only
  --no-autosave) NO_AUTOSAVE=1 ;;   # tests in a throw-away clone: never install the scheduler or push
  --continue) CONTINUE=1; DO_RESUME=0 ;;
  --tools) ;;   # legacy flag of resume-newest-work.sh: tools are installed by default now
  -h|--help) sed -n '2,27p' "${BASH_SOURCE[0]}"; exit 0 ;;
  *) echo "unknown option: $a (see --help)"; exit 2 ;;
esac; done
SELF="$(readlink -f "${BASH_SOURCE[0]}")"
REPO_SLUG="josiahscalia5-dev/rainbow-"

find_root() {
  local d
  for d in "${RAINBOW_ROOT:-}" "$(cd "$(dirname "$SELF")/.." 2>/dev/null && pwd)" "${CLAUDE_PROJECT_DIR:-}" \
           "$(git rev-parse --show-toplevel 2>/dev/null)" "$PWD/rainbow-" "/home/user/rainbow-"; do
    [ -n "$d" ] && [ -d "$d/.git" ] && git -C "$d" remote get-url origin 2>/dev/null | grep -q "$REPO_SLUG" \
      && { echo "$d"; return 0; }
  done
  return 1
}
ROOT="$(find_root)" || { echo "claude-bootstrap: no checkout of $REPO_SLUG found (cd into it or set RAINBOW_ROOT)"; \
  [ "$MODE" = hook ] || [ "$MODE" = env-setup ] && exit 0; exit 1; }
cd "$ROOT" || exit 1
LIVE="$ROOT/backups/.live"; mkdir -p "$LIVE"
RES="$LIVE/bootstrap-results.jsonl"
SS_DIR="$HOME/.rainbow-bootstrap"; mkdir -p "$SS_DIR"
LFS_ACCESS_KEY="lfs.https://github.com/$REPO_SLUG.git/info/lfs.access"
FAILS=0

now() { date +%s; }
manifest() { python3 -I -c 'import json,sys
d=json.load(open(sys.argv[1]))
for k in sys.argv[2].split("."): d=d[k]
print(" ".join(d) if isinstance(d,list) else d)' "$ROOT/backups/TOOL_MANIFEST.json" "$1" 2>/dev/null; }
rec() {  # id title status(ok|warn|fail|skip) summary start_epoch
  local secs=$(( $(now) - ${5:-$(now)} ))
  python3 -I -c 'import json,sys; print(json.dumps({"id":sys.argv[1],"title":sys.argv[2],"status":sys.argv[3],"summary":sys.argv[4],"seconds":int(sys.argv[5])}))' \
    "$1" "$2" "$3" "$4" "$secs" >> "$RES"
  printf '  %-4s %-30s %s\n' "$(printf '%s' "$3" | tr '[:lower:]' '[:upper:]')" "$2" "$4"
  [ "$3" = fail ] && FAILS=$((FAILS + 1))
  return 0
}
pycheck() {  # id title verify-assets.py-args...
  local id="$1" title="$2" t out last st sm; shift 2; t=$(now)
  out="$(timeout 1200 python3 -I "$ROOT/scripts/verify-assets.py" "$@" 2>&1)"
  printf '%s\n' "$out" | grep -v '^@@ ' | sed 's/^/      /'
  last="$(printf '%s\n' "$out" | grep '^@@ ' | tail -1)"
  if [ -n "$last" ]; then st="$(cut -d' ' -f2 <<<"$last")"; sm="$(cut -d' ' -f3- <<<"$last")"
  else st=fail; sm="check crashed: $(printf '%s' "$out" | tail -1 | cut -c1-160)"; fi
  rec "$id" "$title" "$st" "$sm" "$t"
}
say() { printf '\n== %s\n' "$*"; }
session_start() {
  if [ -s "$SS_DIR/session-start" ]; then cat "$SS_DIR/session-start"
  else date -u -d "$(ps -o lstart= -p 1 2>/dev/null)" +%Y-%m-%dT%H:%M:%S+00:00 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%S+00:00; fi
}
autosave_lock() { exec 9>"$ROOT/backups/.autosave.lock"; flock -w "${1:-120}" 9; }
autosave_unlock() { flock -u 9 2>/dev/null; exec 9>&- 2>/dev/null; return 0; }

# ---------------------------------------------------------------------------------------------- steps
step_identity() {
  local t branch prot; t=$(now)
  branch="$(git symbolic-ref --short HEAD 2>/dev/null || echo '(detached)')"
  prot="$(python3 -I -c 'import json,sys; c=json.load(open(sys.argv[1])); print("yes" if sys.argv[2] in c.get("protected_branches",[]) else "no")' \
          "$ROOT/backups/autosave.config.json" "$branch" 2>/dev/null)"
  if [ "$prot" = yes ]; then
    rec identity "Repository + branch" fail "on PROTECTED branch $branch: the autosave refuses to push here. Start a new Claude session (it gets a new ccr-*/claude/* branch)" "$t"
  elif [[ "$branch" != ccr-* && "$branch" != claude/* ]]; then
    rec identity "Repository + branch" warn "branch $branch is not a ccr-*/claude/* session branch: the autosave will not push it" "$t"
  else
    rec identity "Repository + branch" ok "$REPO_SLUG on $branch @ $(git rev-parse --short HEAD) (session started from ${CLAUDE_CODE_BASE_REF:-unknown})" "$t"
  fi
}

AUTO_THEIRS=" backups/MANIFEST.json backups/BACKUP_STATUS.json backups/CONVERSATION_INDEX.md qa/capture_log.json backups/BOOTSTRAP_REPORT.md "
AUTO_UNION=" backups/BACKUP_LOG.md "
merge_one() {  # ref -> 0 merged | 1 conflict (aborted) | 2 refused
  local ref="$1" f tmpd
  if git merge --no-edit -q -m "resume: merge newer saved work from ${ref#origin/}" "$ref" >/dev/null 2>&1; then return 0; fi
  if [ ! -f .git/MERGE_HEAD ]; then   # refused before starting (e.g. signing helper): retry unsigned once
    git -c commit.gpgsign=false merge --no-edit -q -m "resume: merge newer saved work from ${ref#origin/}" "$ref" >/dev/null 2>&1 && return 0
    [ -f .git/MERGE_HEAD ] || return 2
  fi
  tmpd="$(mktemp -d)"
  for f in $(git diff --name-only --diff-filter=U); do
    if [[ "$AUTO_THEIRS" == *" $f "* ]]; then git checkout --theirs -- "$f" && git add -- "$f"
    elif [[ "$AUTO_UNION" == *" $f "* ]]; then
      git show ":2:$f" > "$tmpd/o"; git show ":1:$f" > "$tmpd/b" 2>/dev/null || : > "$tmpd/b"; git show ":3:$f" > "$tmpd/t"
      git merge-file --union "$tmpd/o" "$tmpd/b" "$tmpd/t"; cp "$tmpd/o" "$f"; git add -- "$f"
    fi
  done
  rm -rf "$tmpd"
  if [ -n "$(git diff --name-only --diff-filter=U)" ]; then
    CONFLICT_FILES="$(git diff --name-only --diff-filter=U | head -6 | tr '\n' ' ')"
    git merge --abort; return 1
  fi
  git -c commit.gpgsign=false commit -q --no-edit && return 0
  git merge --abort 2>/dev/null; return 2
}

step_resume() {
  local t merged="" conflicts="" refused="" total=0 contained=0 dirty ref; t=$(now)
  if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" = true ]; then
    timeout "$UNSHALLOW_TIMEOUT" git fetch -q --unshallow origin 2>/dev/null || true
  fi
  if ! timeout "$FETCH_TIMEOUT" git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' 2>/dev/null; then
    rec resume "Newer saved work (no auto-merge)" fail "git fetch from GitHub failed (network / GitHub connection?)" "$t"; return
  fi
  if [ "$DO_RESUME" = 1 ]; then
    for busy in MERGE_HEAD rebase-merge rebase-apply CHERRY_PICK_HEAD; do
      [ -e ".git/$busy" ] && { rec resume "Newer saved work (no auto-merge)" fail "a git $busy is in progress: finish it first, then rerun" "$t"; return; }
    done
    dirty=$(git status --porcelain --untracked-files=no | wc -l)
    if [ "$dirty" != 0 ]; then   # save the current edits first, so a merge can never touch unsaved work
      timeout 600 python3 "$ROOT/scripts/rainbow-autosave.py" --reason bootstrap:pre-merge --quiet >/dev/null 2>&1
      dirty=$(git status --porcelain --untracked-files=no | wc -l)
    fi
    if [ "$dirty" != 0 ]; then
      echo "      $dirty uncommitted tracked file(s) could not be saved first: not merging"
    elif autosave_lock 180; then
      for ref in $(git for-each-ref --sort=committerdate --format='%(refname:short)' refs/remotes/origin/ | grep -E '^origin/(ccr-|claude/)'); do
        git merge-base --is-ancestor "$ref" HEAD 2>/dev/null && continue
        echo "      merging $ref ($(git rev-parse --short "$ref"), $(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M' "$ref"))"
        CONFLICT_FILES=""
        merge_one "$ref"; case $? in
          0) merged="$merged ${ref#origin/}" ;;
          1) conflicts="$conflicts ${ref#origin/}[$CONFLICT_FILES]" ;;
          *) refused="$refused ${ref#origin/}" ;;
        esac
      done
      autosave_unlock
    else
      echo "      autosave lock busy for 3 min: not merging this time"
    fi
  fi
  # what is NOT in HEAD (never merged here unless --resume): per branch, commits and files outside backups/
  local newer="" real=0 behind="" n f me; me="$(git symbolic-ref --short HEAD 2>/dev/null)"
  for ref in $(git for-each-ref --sort=-committerdate --format='%(refname:short)' refs/remotes/origin/ | grep -E '^origin/(ccr-|claude/)'); do
    total=$((total + 1))
    if git merge-base --is-ancestor "$ref" HEAD 2>/dev/null; then contained=$((contained + 1)); continue; fi
    [ "${ref#origin/}" = "$me" ] && continue    # this session's own branch on GitHub: the autosave handles it
    n=$(git rev-list --count "HEAD..$ref" 2>/dev/null || echo '?')
    f=$(git diff --name-only "HEAD...$ref" 2>/dev/null | grep -vc '^backups/')
    [ "$f" != 0 ] && real=$((real + 1))
    if git merge-base --is-ancestor HEAD "$ref" 2>/dev/null; then behind="${ref#origin/}"; fi
    newer="$newer ${ref#origin/}@$(git rev-parse --short "$ref") ($n commit(s), $f file(s) outside backups/, $(git log -1 --format=%cd --date=format:'%m-%d %H:%M' "$ref") UTC);"
    echo "      not in HEAD: ${ref#origin/} @ $(git rev-parse --short "$ref"): $n commit(s), $f file(s) outside backups/"
  done
  local msg head; head="$(git rev-parse --short HEAD)"
  msg="$contained/$total remote ccr-*/claude/* branches contained in HEAD $head"
  [ -n "$merged" ] && msg="$msg; merged (on request, --resume):$merged"
  if [ -n "$conflicts" ]; then
    rec resume "Newer saved work (no auto-merge)" fail "$msg; CONFLICT (merge aborted, nothing changed):$conflicts - merge by hand keeping both sides: git merge origin/<branch>" "$t"
  elif [ -n "$refused" ]; then
    rec resume "Newer saved work (no auto-merge)" fail "$msg; merge refused for:$refused (see git status)" "$t"
  elif [ -n "$newer" ]; then
    msg="$msg; NOT merged (automatic merging is OFF, user's order 2026-11-17):$newer"
    if [ -n "$behind" ]; then
      rec resume "Newer saved work (no auto-merge)" warn "$msg THIS CHECKOUT IS BEHIND $behind (same line of work): the session probably started from an old branch - follow backups/HANDOFF_NEW_ACCOUNT.md, tell the user" "$t"
    elif [ "$real" != 0 ]; then
      rec resume "Newer saved work (no auto-merge)" warn "$msg tell the user what these branches hold; merge ONLY on the user's request: bash scripts/claude-bootstrap.sh --resume" "$t"
    else
      rec resume "Newer saved work (no auto-merge)" ok "$msg only autosave bookkeeping under backups/, no game work: nothing to do" "$t"
    fi
  else
    rec resume "Newer saved work (no auto-merge)" ok "$msg; nothing newer on GitHub; nothing merged" "$t"
  fi
}

lfs_pull() {  # bounded; holds the autosave lock so a backup never races the index update
  git config --unset-all "$LFS_ACCESS_KEY" 2>/dev/null
  git lfs install --local >/dev/null 2>&1
  [ "$(git lfs ls-files | awk '$2=="-"' | wc -l)" = 0 ] && return 0
  autosave_lock 120 || true
  timeout "${1:-600}" git lfs pull > "$LIVE/lfs-pull.log" 2>&1; local rc=$?
  autosave_unlock; return $rc
}

step_lfs() {
  local t stubs total; t=$(now)
  [ "$MODE" != check ] && lfs_pull 900
  total=$(git lfs ls-files | wc -l); stubs=$(git lfs ls-files | awk '$2=="-"' | wc -l)
  if [ "$stubs" != 0 ]; then
    rec lfs "Git LFS binaries (local)" fail "$stubs of $total LFS files are still pointer stubs ($( [ "$MODE" = check ] && echo 'check mode: run without --check' || echo "see backups/.live/lfs-pull.log"))" "$t"
  elif git lfs fsck >/dev/null 2>&1; then
    rec lfs "Git LFS binaries (local)" ok "$total/$total real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK" "$t"
  else
    rec lfs "Git LFS binaries (local)" fail "git lfs fsck reported problems (run: git lfs fsck)" "$t"
  fi
}

step_refs() {
  local t n okc; t=$(now)
  n=$(grep -c . scripts/reference.sha256); okc=$(sha256sum -c scripts/reference.sha256 2>/dev/null | grep -c ': OK$')
  if [ "$okc" = "$n" ]; then rec refs "Approved references" ok "$okc/$n byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference)" "$t"
  else rec refs "Approved references" fail "only $okc/$n match scripts/reference.sha256 - restore them from git, never edit" "$t"; fi
}

step_screens() {
  local t n=0 f; t=$(now)
  for f in references/0[1-9]_*.png references/1[01]_*.png; do [ -f "$f" ] && n=$((n + 1)); done
  if [ "$n" -ge 11 ] && [ -f src/main.ts ] && [ -d src ]; then
    rec screens "Game: 11 screens + code" ok "$n approved screen references 01-11, source tree src/ ($(git ls-files src | wc -l) files), Android project android/, characters assets/models/*.glb" "$t"
  else rec screens "Game: 11 screens + code" fail "expected 11 references (01-11) and src/main.ts; found $n" "$t"; fi
}

step_worldlabs() {
  local t out key plugin st=ok; t=$(now)
  # free reads only; only HTTP 401/403 means "reconnect the key via the secure form" (never ask otherwise)
  out="$(timeout 120 python3 -I scripts/verify-assets.py worldlabs 2>/dev/null | grep '^@@ ' | tail -1)"
  key="$(cut -d' ' -f3- <<<"$out")"; [ -n "$key" ] || key="Marble API check did not run"
  case "$(cut -d' ' -f2 <<<"$out")" in ok) ;; *) st=warn ;; esac
  if timeout 60 claude plugin list 2>/dev/null | grep -q 'worldlabs@'; then plugin="installed"
  elif [ "$DO_TOOLS" = 1 ] && command -v claude >/dev/null; then
    bash scripts/setup-worldlabs-plugin.sh > "$LIVE/worldlabs-plugin.log" 2>&1
    timeout 60 claude plugin list 2>/dev/null | grep -q 'worldlabs@' && plugin="installed now" || { plugin="install FAILED (backups/.live/worldlabs-plugin.log)"; st=warn; }
  else plugin="not installed (bash scripts/setup-worldlabs-plugin.sh)"; st=warn; fi
  rec worldlabs "World Labs integration" "$st" "$key; plugin worldlabs@worldlabs $plugin; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started" "$t"
}

step_node() {
  local t v; t=$(now); v="$(node -v 2>/dev/null)"
  if [[ "$v" =~ ^v([0-9]+) ]] && [ "${BASH_REMATCH[1]}" -ge 20 ]; then rec node "Node.js" ok "$v, npm $(npm -v 2>/dev/null)" "$t"
  else rec node "Node.js" fail "need Node >= 20, found ${v:-none}" "$t"; fi
}

step_npm() {
  local t h=node_modules/.rainbow-bootstrap.sha256; t=$(now)
  if sha256sum --check --status "$h" 2>/dev/null && [ -d node_modules/three ] && [ -d node_modules/vite ]; then
    rec npm "npm dependencies" ok "node_modules up to date with package-lock.json (npm ci skipped)" "$t"; return
  fi
  if [ "$MODE" = check ]; then rec npm "npm dependencies" warn "node_modules missing or stale (run without --check)" "$t"; return; fi
  rm -f "$h"
  if timeout 900 npm ci --no-audit --no-fund --prefer-offline > "$LIVE/npm-ci.log" 2>&1; then
    sha256sum package.json package-lock.json > "$h"
    rec npm "npm dependencies" ok "npm ci done ($(ls node_modules | wc -l) packages; cache ~/.npm reused)" "$t"
  else rec npm "npm dependencies" fail "npm ci failed (backups/.live/npm-ci.log)" "$t"; fi
}

py_missing() { python3 -I -c 'import importlib.util as u,sys; print(" ".join(m for m in sys.argv[1:] if u.find_spec(m) is None))' "$@"; }
step_pylibs() {
  local t req opt mreq mopt pkgs="" m st=ok msg; t=$(now)
  req="numpy PIL"; opt="cv2 scipy"
  mreq="$(py_missing $req)"; mopt="$(py_missing $opt)"
  if [ -n "$mreq$mopt" ] && [ "$DO_TOOLS" = 1 ]; then
    for m in $mreq $mopt; do case $m in PIL) pkgs="$pkgs Pillow";; cv2) pkgs="$pkgs opencv-python-headless";; *) pkgs="$pkgs $m";; esac; done
    timeout 600 python3 -m pip install --quiet --disable-pip-version-check $pkgs > "$LIVE/pip.log" 2>&1 \
      || timeout 600 python3 -m pip install --quiet --disable-pip-version-check --break-system-packages $pkgs >> "$LIVE/pip.log" 2>&1
    mreq="$(py_missing $req)"; mopt="$(py_missing $opt)"
    msg="installed:$pkgs; "
  fi
  [ -n "$mopt" ] && st=warn
  [ -n "$mreq" ] && st=fail
  rec pylibs "Python QA libraries" "$st" "${msg:-}$(python3 --version 2>&1); required numpy+Pillow $([ -z "$mreq" ] && echo OK || echo "MISSING: $mreq"); optional cv2+scipy $([ -z "$mopt" ] && echo OK || echo "missing: $mopt")" "$t"
}

step_playwright() {
  local t out; t=$(now)
  out="$(timeout 120 node scripts/lib/pw-smoke.mjs 2>&1 | tail -1)"
  if grep -q '"ok":true' <<<"$out"; then
    rec playwright "Playwright + Chromium" ok "headless Chromium $(sed -E 's/.*"chromium":"([^"]+)".*/\1/' <<<"$out") with WebGL2 (SwiftShader); preinstalled, never reinstall" "$t"
  else rec playwright "Playwright + Chromium" fail "smoke test failed: ${out:0:160}" "$t"; fi
}

blender_ok() { blender --version 2>/dev/null | head -1 | grep -q "Blender $(manifest tools.blender.version)"; }
android_ok() { local s=/opt/android-sdk; [ -d "$s/platforms/android-34" ] && [ -x "$s/build-tools/34.0.0/aapt2" ] && [ -x "$s/platform-tools/adb" ]; }
start_tool_installs() {  # Blender + Android SDK downloads run in parallel, in the background
  BL_PID=""; AN_PID=""
  [ "$DO_TOOLS" = 1 ] || return 0
  if ! blender_ok; then
    ( BLENDER_VERSION="$(manifest tools.blender.version)" bash scripts/setup-blender.sh > "$LIVE/blender-setup.log" 2>&1 ) & BL_PID=$!
  fi
  if ! android_ok; then ( bash scripts/setup-android-sdk.sh > "$LIVE/android-setup.log" 2>&1 ) & AN_PID=$!; fi
}

step_blender() {
  local t was=present v; t=$(now)
  [ -n "${BL_PID:-}" ] && { wait "$BL_PID"; was="installed now"; }
  if blender_ok; then
    v="$(blender --version 2>/dev/null | head -1)"
    if timeout 180 blender -b --factory-startup --python-expr "import bpy; print('BPY_OK', bpy.app.version_string)" 2>/dev/null | grep -q BPY_OK; then
      rec blender "Blender" ok "$v ($was) at $(command -v blender); headless bpy test OK" "$t"
    else rec blender "Blender" fail "$v installed but the headless bpy test failed" "$t"; fi
  elif [ "$DO_TOOLS" = 1 ]; then rec blender "Blender" fail "install failed - backups/.live/blender-setup.log. Usual cause on a NEW Claude account: the cloud environment's network does not allow download.blender.org. Fix: propose an environment with hosts download.blender.org + dl.google.com and setup script scripts/cloud-env-setup.sh (create_environment / update_environment; the user approves a card), then rerun bash scripts/claude-bootstrap.sh" "$t"
  else rec blender "Blender" warn "Blender $(manifest tools.blender.version) not installed (run without --check / --no-tools)" "$t"; fi
}

step_blender_verify() {  # real renders with all three engines, every .blend, the game GLBs, GLB export -> import
  local t out sm; t=$(now)
  if ! blender_ok; then rec blender_verify "Blender render + GLB check" skip "Blender is not installed (see the Blender row)" "$t"; return; fi
  out="$LIVE/blender-verify"; rm -rf "$out"; mkdir -p "$out"
  timeout 900 blender -b --factory-startup --python scripts/verify-blender.py -- "$out" > "$LIVE/blender-verify.log" 2>&1
  sm="$(python3 -I -c 'import json,sys
r=json.load(open(sys.argv[1])); bad=[]
names={"BLENDER_WORKBENCH":"Workbench","BLENDER_EEVEE":"EEVEE","CYCLES":"Cycles"}
ren=[]
for x in r["renders"]:
    ren.append(names.get(x["engine"],x["engine"])+(" %.1f s"%x["seconds"] if x.get("ok") else " FAILED"))
    if not x.get("ok"): bad.append("render "+x["engine"])
bl=r["blends"]; nb=sum(1 for b in bl if b.get("ok"))
if nb!=len(bl) or not bl: bad.append("blend files")
g=r["glbs"]; gl=[]
for k,v in g.items():
    gl.append(k.split("/")[-1]+" "+(str(v.get("meshes"))+" meshes" if v.get("ok") else "FAILED"))
    if not v.get("ok"): bad.append("import "+k)
lids=g.get("assets/models/lids05.glb",{}).get("paddles",{})
if len(lids)!=6: bad.append("lids05.glb paddles %d/6"%len(lids))
rt=r["roundtrip"]; a=rt.get("blend_vs_roundtrip_identical",{}); b=rt.get("blend_vs_game_glb_identical",{})
ok_rt=isinstance(a,dict) and a and all(a.values()); ok_game=isinstance(b,dict) and b and all(b.values())
if not ok_rt: bad.append("GLB round trip")
if not ok_game: bad.append("blend vs game lids05.glb")
print(("fail" if bad else "ok")+" Blender "+r["blender"]+" bpy OK; real renders: "+", ".join(ren)+"; .blend files "+str(nb)+"/"+str(len(bl))+" open; GLB import: "+", ".join(gl)+" (6 paddles "+("OK" if len(lids)==6 else "MISSING")+"); GLB export -> import: "+str(sum(1 for v in a.values() if v) if isinstance(a,dict) else 0)+"/6 paddles geometry-identical"+(", identical to the game lids05.glb" if ok_game else "")+("; PROBLEMS: "+", ".join(bad) if bad else ""))' "$out/results.json" 2>/dev/null)"
  if [ -z "$sm" ]; then rec blender_verify "Blender render + GLB check" fail "scripts/verify-blender.py did not finish (backups/.live/blender-verify.log): $(grep -E 'Error|Traceback' "$LIVE/blender-verify.log" | tail -1 | cut -c1-160)" "$t"
  else rec blender_verify "Blender render + GLB check" "${sm%% *}" "${sm#* }" "$t"; fi
}

step_android() {
  local t was=present jv sdk=/opt/android-sdk; t=$(now)
  [ -n "${AN_PID:-}" ] && { wait "$AN_PID"; was="installed now"; }
  jv="$(java -version 2>&1 | grep -v JAVA_TOOL | grep -oE 'version "[0-9]+' | grep -oE '[0-9]+$')"
  if android_ok; then
    if [ ! -f android/local.properties ] || ! grep -q "^sdk.dir=$sdk$" android/local.properties; then
      echo "sdk.dir=$sdk" > android/local.properties   # git-ignored
    fi
    if [ -n "${CLAUDE_ENV_FILE:-}" ] && ! grep -qs ANDROID_HOME "$CLAUDE_ENV_FILE"; then
      echo "export ANDROID_HOME=$sdk ANDROID_SDK_ROOT=$sdk" >> "$CLAUDE_ENV_FILE"
    fi
    if [ "${jv:-0}" -ge 17 ] && [ -x android/gradlew ]; then
      rec android "Android build tools" ok "Android SDK platform 34 + build-tools 34.0.0 + platform-tools ($was, $sdk), Java $jv, Gradle wrapper $(grep -oE 'gradle-[0-9.]+' android/gradle/wrapper/gradle-wrapper.properties); APK: npm run android:debug" "$t"
    else rec android "Android build tools" fail "SDK OK but Java ${jv:-?} (<17) or android/gradlew missing" "$t"; fi
  elif [ "$DO_TOOLS" = 1 ]; then rec android "Android build tools" fail "Android SDK install failed (needs dl.google.com) - backups/.live/android-setup.log" "$t"
  else rec android "Android build tools" warn "Android SDK 34 not installed (run without --check / --no-tools); Java ${jv:-?}" "$t"; fi
}

step_media_tools() {
  local t; t=$(now)
  rec media "ffmpeg / ImageMagick" "$(command -v ffmpeg >/dev/null && command -v convert >/dev/null && echo ok || echo warn)" \
    "ffmpeg $(ffmpeg -version 2>/dev/null | head -1 | awk '{print $3}' || echo missing), ImageMagick $(convert -version 2>/dev/null | head -1 | awk '{print $3}' || echo missing) (Flow video + image checks)" "$t"
}

step_claude_config() {
  local t hooks mcp plugins st=ok; t=$(now)
  hooks="$(python3 -I -c 'import json,sys,os
s=json.load(open(sys.argv[1])); root=sys.argv[2]; out=[]
for ev in ("SessionStart","PreCompact","Stop","SessionEnd"):
    cmds=[h["command"] for g in s.get("hooks",{}).get(ev,[]) for h in g.get("hooks",[])]
    ok=any("scripts/autosave-hook.sh" in c for c in cmds) and os.path.exists(os.path.join(root,"scripts/autosave-hook.sh"))
    out.append(ev+("" if ok else "(MISSING)"))
print(" ".join(out))' .claude/settings.json "$ROOT" 2>/dev/null)"
  [[ "$hooks" == *MISSING* || -z "$hooks" ]] && st=fail
  local raw servers need="" blender gh
  raw="$(timeout 90 claude mcp list 2>/dev/null)"
  # one entry per configured server: "<name> connected" / "<name> NOT connected (<reason>)"
  servers="$(python3 -I -c 'import sys,re
out=[]
for ln in sys.stdin.read().splitlines():
    if " - " not in ln or ": " not in ln: continue
    name=ln.split(": ",1)[0].strip(); status=ln.rsplit(" - ",1)[1].strip()
    ok=("Connected" in status) and ("Failed" not in status) and ("Needs" not in status)
    out.append(name+(" connected" if ok else " NOT connected ("+re.sub(r"^[^A-Za-z]+","",status)[:90]+")"))
print("; ".join(out))' <<<"$raw" 2>/dev/null)"
  if grep -qiE 'playwright.*Connected' <<<"$raw"; then mcp="Playwright MCP connected"
  else mcp="Playwright MCP NOT connected"; need="$need enable the 'playwright' plugin in claude.ai settings (required);"; [ "$st" = ok ] && st=warn; fi
  if grep -qi 'blender' <<<"$raw"; then blender="Blender MCP listed: $(grep -i blender <<<"$raw" | head -1 | sed 's/.* - //' | cut -c1-60)"
  elif [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then blender="Blender MCP not configured (a display exists: 'claude mcp add blender uvx mcp-for-blender', enable the add-on in desktop Blender - backups/MCP_SETUP.md)"
  else blender="Blender MCP NOT connected and not possible here (headless container: no display, so no desktop Blender add-on socket) - Blender command line + Python is the working integration (row 'Blender render + GLB check')"; fi
  if timeout 45 git ls-remote origin HEAD >/dev/null 2>&1; then gh="GitHub git connection OK (GitHub MCP is a session connector: test in Claude with mcp__github__list_branches)"
  else gh="GitHub NOT reachable by git"; need="$need connect GitHub + the Claude GitHub App to the repository (required);"; st=fail; fi
  grep -qiE 'worldlabs.*(Failed|Needs)' <<<"$raw" && need="$need World Labs Atlas MCP not connected (optional, not needed for Screen 05: sign in to the connector only for new World Labs work);"
  grep -qiE 'context7.*(Failed|Needs)' <<<"$raw" && need="$need context7 not signed in (optional, unused);"
  plugins="$(timeout 60 claude plugin list 2>/dev/null | grep -oE '^\s*> [a-z0-9-]+' | sed 's/.*> //' | sort -u | tr '\n' ' ')"
  rec claude "Claude hooks / plugins / MCP" "$st" "hooks: ${hooks:-settings.json unreadable}; $mcp; all servers: ${servers:-none listed}; $blender; $gh; plugins: ${plugins:-none listed}; MCP template .mcp.json.template (no secrets)" "$t"
  rec logins "Logins / authorizations for the user" "$([[ "$need" == *required* ]] && echo warn || echo ok)" "${need:- nothing required: every required connection works}" "$t"
}

step_tests() {
  local t out drop; t=$(now)
  if [ ! -d node_modules/three ]; then rec tests "Build + game tests" skip "node_modules missing - tests skipped" "$t"; return; fi
  if ! timeout 600 npx tsc --noEmit > "$LIVE/tsc.log" 2>&1; then
    rec tests "Build + game tests" fail "TypeScript check failed (backups/.live/tsc.log)" "$t"; return
  fi
  if timeout 600 npm run -s test:continuity > "$LIVE/continuity.log" 2>&1; then
    out="$(python3 -I -c 'import json; d=json.load(open("qa/continuity_report.json")); print(d["ok"], round(d["plunge"]["verticalDrop"],2))' 2>/dev/null)"
  fi
  if [ "${out%% *}" = True ]; then
    rec tests "Build + game tests" ok "tsc OK; continuity OK (all stage joins gap 0, 07->08 drop ${out##* })" "$t"
  else rec tests "Build + game tests" fail "tsc OK; continuity test failed (backups/.live/continuity.log)" "$t"; fi
  [ "$FULL_TESTS" = 1 ] || return 0
  t=$(now)
  if timeout 900 node scripts/gameplay-test.mjs > "$LIVE/gameplay.log" 2>&1; then
    drop="$(python3 -I -c 'import json; d=json.load(open("qa/gameplay_test.json")); p=d.get("plunge") or {}; print(p.get("verticalDrop", p) if isinstance(p,dict) else p)' 2>/dev/null)"
    rec gameplay "Browser gameplay test" ok "pass: all checks (coins, hearts, pause, steering, no camera cut, victory), 07->08 plunge $drop, errors []" "$t"
  else rec gameplay "Browser gameplay test" fail "node scripts/gameplay-test.mjs failed (backups/.live/gameplay.log)" "$t"; fi
  # Screen 05: the default build must equal the current accepted picture (qa/pilot05/current_default_05.png),
  # and the user's protected BEFORE must still be reproducible through its URL switches
  local cur=qa/pilot05/current_default_05.png before=qa/pilot05/wave9/baseline/05.png bq="ringa=26&nearfloor05=0" d1 d2
  t=$(now)
  rm -rf "$LIVE/capture05" "$LIVE/capture05b"
  if timeout 600 node scripts/capture.mjs 05 --out="$LIVE/capture05" > "$LIVE/capture05.log" 2>&1 && [ -f "$LIVE/capture05/05.png" ] \
     && timeout 600 node scripts/capture.mjs 05 --out="$LIVE/capture05b" "--q=$bq" >> "$LIVE/capture05.log" 2>&1 && [ -f "$LIVE/capture05b/05.png" ]; then
    git checkout -q -- qa/capture_log.json 2>/dev/null   # capture log is regenerated: keep the committed one
    d1="$(maxdiff "$LIVE/capture05/05.png" "$cur")"; d2="$(maxdiff "$LIVE/capture05b/05.png" "$before")"
    if [ "$d1" = 0 ] && [ "$d2" = 0 ]; then
      rec screen05 "Screen 05 default + BEFORE" ok "default capture pixel-identical to $cur; BEFORE (?$bq) pixel-identical to $before" "$t"
    else rec screen05 "Screen 05 default + BEFORE" warn "max diff default vs $cur = $d1, BEFORE switch vs $before = $d2 - check before any new test" "$t"; fi
  else rec screen05 "Screen 05 default + BEFORE" fail "capture failed (backups/.live/capture05.log)" "$t"; fi
}
maxdiff() { python3 -I -c 'import sys; from PIL import Image, ImageChops
a=Image.open(sys.argv[1]).convert("RGB"); b=Image.open(sys.argv[2]).convert("RGB")
print("size" if a.size!=b.size else max(c[1] for c in ImageChops.difference(a,b).getextrema()))' "$1" "$2" 2>/dev/null; }

step_autosave() {
  local t out rc; t=$(now)
  bash scripts/install-autosave-scheduler.sh > "$HOME/.rainbow-autosave-install.log" 2>&1
  timeout 900 python3 "$ROOT/scripts/rainbow-autosave.py" --reason "bootstrap:$MODE" --quiet >/dev/null 2>&1
  out="$(python3 -I scripts/autosave-status.py 2>&1)"; rc=$?
  if [ $rc = 0 ]; then rec autosave "Five-minute GitHub autosave" ok "$(head -1 <<<"$out")" "$t"
  else rec autosave "Five-minute GitHub autosave" fail "$(tr '\n' ' ' <<<"$out" | cut -c1-400)" "$t"; fi
}

finish_report() {
  python3 -I scripts/verify-assets.py report "$RES" "$MODE" >/dev/null 2>&1
  say "Report"
  python3 -I -c 'import json,sys; d=json.load(open(sys.argv[1])); print(d["verdict"], "| branch", d["branch"], "| HEAD", d["head"][:12], "| written: backups/BOOTSTRAP_REPORT.md")' \
    "$LIVE/BOOTSTRAP_REPORT.json" 2>/dev/null || echo "report could not be written"
}

# ----------------------------------------------------------------------------------------------- modes
case "$MODE" in
status)
  [ -f backups/BOOTSTRAP_REPORT.md ] && cat backups/BOOTSTRAP_REPORT.md || echo "no bootstrap report yet"
  exec 8>"$LIVE/bootstrap.lock"; flock -n 8 || echo "(a bootstrap run is still in progress: tail -f backups/.live/bootstrap.log)"
  python3 -I scripts/autosave-status.py; exit 0 ;;

hook)
  input="$(cat 2>/dev/null || true)"
  src="$(python3 -I -c 'import json,sys; print(json.loads(sys.argv[1] or "{}").get("source","startup"))' "$input" 2>/dev/null || echo startup)"
  [ -s "$SS_DIR/session-start" ] || date -u +%Y-%m-%dT%H:%M:%S+00:00 > "$SS_DIR/session-start"
  if [ -n "${CLAUDE_ENV_FILE:-}" ] && ! grep -qs ANDROID_HOME "$CLAUDE_ENV_FILE"; then
    echo "export ANDROID_HOME=/opt/android-sdk ANDROID_SDK_ROOT=/opt/android-sdk" >> "$CLAUDE_ENV_FILE"
  fi
  if [ "${CLAUDE_CODE_REMOTE:-}" != true ]; then   # local machine: no automatic merges or installs
    bash scripts/install-autosave-scheduler.sh > "$HOME/.rainbow-autosave-install.log" 2>&1
    echo "Rainbow: autosave re-armed. Local machine: run 'bash scripts/claude-bootstrap.sh' yourself to resume the newest work."
    exit 0
  fi
  if [ "$src" = startup ] || [ ! -f "$LIVE/BOOTSTRAP_REPORT.json" ]; then
    exec 8>"$LIVE/bootstrap.lock"
    if flock -n 8; then
      : > "$RES"; UNSHALLOW_TIMEOUT=150; FETCH_TIMEOUT=90
      { step_identity; step_resume; pycheck gap "Backup gap since last session" gap --session-start "$(session_start)"; } > "$LIVE/bootstrap-hook.log" 2>&1
      lfs_pull 240 >> "$LIVE/bootstrap-hook.log" 2>&1
      flock -u 8; exec 8>&-
      bash scripts/install-autosave-scheduler.sh > "$HOME/.rainbow-autosave-install.log" 2>&1
      setsid nohup bash "$ROOT/scripts/claude-bootstrap.sh" --background >> "$LIVE/bootstrap.log" 2>&1 < /dev/null &
      echo "RAINBOW SESSION START (scripts/claude-bootstrap.sh --hook, source=$src):"
      grep -E '^  (OK|WARN|FAIL|SKIP) ' "$LIVE/bootstrap-hook.log" | sed 's/^  /  /'
      grep -E '^ +(GAP|the previous session|log gap)' "$LIVE/bootstrap-hook.log" | sed -E 's/^ +/  - /' | tail -4
      echo "  LFS binaries: $(git lfs ls-files | awk '$2=="-"' | wc -l) pointer stubs left (0 = all restored)"
      echo "  NO branch was merged (automatic merging is off; 'bash scripts/claude-bootstrap.sh --resume' only on the user's request)."
      echo "  Full bootstrap (tools, Blender install + render check, Android SDK, 10 specialists, MCP, tests, autosave) is running in the background:"
      echo "  'bash scripts/claude-bootstrap.sh --status' -> backups/BOOTSTRAP_REPORT.md. Read CLAUDE.md and"
      echo "  backups/CLAUDE_ACCOUNT_TRANSFER.md, then give the user the backup report described in CLAUDE.md."
    else
      echo "Rainbow: a bootstrap run is already in progress (backups/.live/bootstrap.log)."
    fi
  else
    bash scripts/install-autosave-scheduler.sh > "$HOME/.rainbow-autosave-install.log" 2>&1
    echo "Rainbow ($src): autosave re-armed. $(python3 -I scripts/autosave-status.py 2>&1 | head -1)"
  fi
  exit 0 ;;

env-setup)   # cloud environment setup script: tools only, before Claude starts; never touches git; never fails
  : > "$RES"
  say "Rainbow env-setup: tools ($ROOT)"
  start_tool_installs
  step_node; step_npm; step_pylibs; step_playwright; step_media_tools; step_blender; step_android
  command -v claude >/dev/null && step_worldlabs
  exit 0 ;;
esac

# full / check / background
exec 8>"$LIVE/bootstrap.lock"
if ! flock -w 600 8; then echo "another bootstrap run holds the lock (backups/.live/bootstrap.log)"; exit 1; fi
[ "$MODE" = background ] && renice -n 10 $$ >/dev/null 2>&1
echo "RAINBOW BOOTSTRAP ($MODE) $(date -u '+%Y-%m-%d %H:%M UTC') - $ROOT"
if [ "$CONTINUE" = 0 ]; then
  : > "$RES"
  say "1 Repository, newest work, backup gap"
  step_identity
  step_resume
  if [ "$DO_RESUME" = 1 ] && ! cmp -s "$SELF" "$ROOT/scripts/claude-bootstrap.sh"; then
    echo "      the merge brought a newer claude-bootstrap.sh: continuing with it"
    flock -u 8; exec 8>&-
    exec bash "$ROOT/scripts/claude-bootstrap.sh" "${ORIG_ARGS[@]}" --continue
  fi
fi
# after the merge, so an old checkout already has scripts/verify-assets.py (the hook ran this itself)
[ "$MODE" = background ] || pycheck gap "Backup gap since last session" gap --session-start "$(session_start)"
start_tool_installs
say "2 Game files: LFS binaries, references, screens, agents, Marble"
step_lfs
if [ "$FULL_TESTS" = 1 ]; then pycheck lfs_remote "Git LFS on GitHub" lfs-remote --download
else pycheck lfs_remote "Git LFS on GitHub" lfs-remote; fi
step_refs
step_screens
pycheck agents "Specialist agents" agents
pycheck marble "Marble World Labs assets" marble
step_worldlabs
say "3 Tools (installed only when missing)"
step_node; step_npm; step_pylibs; step_playwright; step_media_tools; step_blender; step_blender_verify; step_android
step_claude_config
say "4 Tests"
step_tests
if [ "$NO_AUTOSAVE" = 1 ]; then rec autosave "Five-minute GitHub autosave" skip "--no-autosave: scheduler not touched, nothing pushed" "$(now)"
elif [ "$MODE" != check ]; then say "5 Five-minute autosave"; step_autosave
else
  t=$(now); out="$(python3 -I scripts/autosave-status.py 2>&1)"; rc=$?
  rec autosave "Five-minute GitHub autosave" "$([ "$rc" = 0 ] && echo ok || echo warn)" "$(head -1 <<<"$out")" "$t"
fi
finish_report
[ "$FAILS" = 0 ]
