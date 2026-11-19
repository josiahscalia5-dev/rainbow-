#!/usr/bin/env bash
# Rainbow — adopt the NEWEST saved work on a new Claude account / new cloud session, then verify it.
#
#   bash scripts/resume-newest-work.sh            # adopt + restore LFS + verify (no installs)
#   bash scripts/resume-newest-work.sh --tools    # also install Blender 5.3, Android SDK 34, World Labs plugin
#
# Why: more than one Claude session may have been autosaving at the same time (e.g. account 8 kept saving to
# ccr-4f6c3e0e-5kxgr0 while session 94cf04e3 saved to ccr-937c7fbb-htsrgt). A new session can also start
# from the repo's DEFAULT branch, which is the OLD original (81e639e). This script merges every remote
# ccr-*/claude/* branch that HEAD does not already contain, so nothing newer is ever left behind.
#
# Safety: never force-pushes, never resets, never deletes. It only fetches, merges (normal merge commits) and
# reads. Auto-regenerated status files are resolved automatically; any other conflict stops the script with
# the merge left open for a human/Claude to resolve (the autosave pauses while a merge is open).
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$ROOT"
TOOLS=0; [ "${1:-}" = "--tools" ] && TOOLS=1
say() { printf '\n== %s\n' "$*"; }
fail=0

say "1/6 Fetch full history and every branch"
git fetch --unshallow origin >/dev/null 2>&1 || true
git fetch -q origin '+refs/heads/*:refs/remotes/origin/*' || { echo "fetch failed"; exit 1; }
echo "current branch: $(git branch --show-current)   HEAD: $(git rev-parse --short HEAD)"

say "2/6 Merge any remote ccr-*/claude/* branch not yet contained in HEAD (oldest first)"
# Auto-regenerated files: the autosave rewrites them on its next run, so either side is safe.
AUTO_THEIRS="backups/MANIFEST.json backups/BACKUP_STATUS.json backups/CONVERSATION_INDEX.md qa/capture_log.json"
AUTO_UNION="backups/BACKUP_LOG.md"
for ref in $(git for-each-ref --sort=committerdate --format='%(refname:short)' refs/remotes/origin/ \
             | grep -E '^origin/(ccr-|claude/)'); do
  if git merge-base --is-ancestor "$ref" HEAD 2>/dev/null; then
    echo "contained  $ref ($(git rev-parse --short "$ref"))"; continue
  fi
  echo "MERGING    $ref ($(git rev-parse --short "$ref"), $(git log -1 --format=%cd --date=iso "$ref"))"
  if ! git merge --no-edit -m "resume: merge newer saved work from $ref" "$ref" >/dev/null 2>&1; then
    for f in $(git diff --name-only --diff-filter=U); do
      if [[ " $AUTO_THEIRS " == *" $f "* ]]; then git checkout --theirs -- "$f" && git add "$f"
      elif [[ " $AUTO_UNION " == *" $f "* ]]; then
        git show ":2:$f" > /tmp/rb_ours.$$; git show ":1:$f" > /tmp/rb_base.$$ 2>/dev/null || : > /tmp/rb_base.$$
        git show ":3:$f" > /tmp/rb_theirs.$$; git merge-file --union /tmp/rb_ours.$$ /tmp/rb_base.$$ /tmp/rb_theirs.$$
        cp /tmp/rb_ours.$$ "$f"; rm -f /tmp/rb_*.$$; git add "$f"
      fi
    done
    if [ -n "$(git diff --name-only --diff-filter=U)" ]; then
      echo "CONFLICT merging $ref in: $(git diff --name-only --diff-filter=U | tr '\n' ' ')"
      echo "Resolve these by hand keeping BOTH sides' work, then: git commit --no-edit. Never reset or force-push."
      exit 2
    fi
    git commit -q --no-edit || true
  fi
done
echo "HEAD now $(git rev-parse --short HEAD); every ccr-*/claude/* branch is contained:"
for ref in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -E '^origin/(ccr-|claude/)'); do
  git merge-base --is-ancestor "$ref" HEAD && echo "  ok  $ref" || { echo "  MISSING $ref"; fail=1; }
done

say "3/6 Restore Git LFS files (models, APK, .blend, Marble splats/PLY/colliders)"
git config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access" 2>/dev/null
git lfs install --local >/dev/null 2>&1
git lfs pull || { echo "git lfs pull failed"; fail=1; }
git lfs fsck || fail=1
stubs=$(git lfs ls-files | awk '$2=="-"' | wc -l)
echo "LFS files: $(git lfs ls-files | wc -l) tracked, $stubs still pointer stubs (expect 0)"
[ "$stubs" = 0 ] || fail=1

say "4/6 Approved references unchanged (12 files)"
sha256sum -c scripts/reference.sha256 | tail -12 || fail=1

say "5/6 Specialist agents (.claude/agents)"
n=$(ls .claude/agents/*.md 2>/dev/null | wc -l); echo "$n agent definitions (expect 10)"; ls .claude/agents/
[ "$n" = 10 ] || fail=1

say "6/6 Build + game checks"
npm ci --no-audit --no-fund >/dev/null 2>&1 || { echo "npm ci failed"; fail=1; }
npx tsc --noEmit && echo "tsc OK" || fail=1
npm run -s test:continuity >/dev/null 2>&1 && python3 -I -c 'import json;d=json.load(open("qa/continuity_report.json"));print("continuity ok=",d["ok"],"07->08 verticalDrop=",d["plunge"]["verticalDrop"])' || fail=1
echo "(browser gameplay test: node scripts/gameplay-test.mjs  → expect \"pass\": true)"

if [ "$TOOLS" = 1 ]; then
  say "Tools"
  bash scripts/setup-blender.sh || echo "blender setup failed (needs download.blender.org)"
  bash scripts/setup-android-sdk.sh || echo "android sdk setup failed (needs dl.google.com)"
  bash scripts/setup-worldlabs-plugin.sh || echo "worldlabs plugin setup failed"
fi

say "Autosave"
python3 -I scripts/autosave-status.py || true
echo
[ "$fail" = 0 ] && echo "RESUME CHECK: OK" || echo "RESUME CHECK: PROBLEMS ABOVE — report them to the user"
exit $fail
