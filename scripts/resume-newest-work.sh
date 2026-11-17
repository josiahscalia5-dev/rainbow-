#!/usr/bin/env bash
# Rainbow — legacy entry point (older prompts and docs call it). All the work now lives in
# scripts/claude-bootstrap.sh: resume the newest saved work, restore Git LFS, check references / agents / Marble,
# install missing tools, run the tests, restart the five-minute autosave and write backups/BOOTSTRAP_REPORT.md.
#
#   bash scripts/resume-newest-work.sh [--tools] [--check] [--full]     (--tools is accepted and ignored)
#
# Works from any start point, including the OLD default branch that has no bootstrap yet: it then runs the
# bootstrap from the newest remote ccr-*/claude/* branch. Never resets, deletes or force-pushes.
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "run this inside the rainbow- checkout"; exit 1; }
if [ -f "$ROOT/scripts/claude-bootstrap.sh" ]; then
  exec bash "$ROOT/scripts/claude-bootstrap.sh" "$@"
fi
git -C "$ROOT" fetch -q origin '+refs/heads/*:refs/remotes/origin/*' || { echo "git fetch failed"; exit 1; }
for ref in $(git -C "$ROOT" for-each-ref --sort=-committerdate --format='%(refname:short)' refs/remotes/origin/ \
             | grep -E '^origin/(ccr-|claude/)'); do
  if git -C "$ROOT" cat-file -e "$ref:scripts/claude-bootstrap.sh" 2>/dev/null; then
    tmp="$(mktemp --suffix=-claude-bootstrap.sh)"
    git -C "$ROOT" show "$ref:scripts/claude-bootstrap.sh" > "$tmp"
    echo "running claude-bootstrap.sh from $ref"
    RAINBOW_ROOT="$ROOT" exec bash "$tmp" "$@"
  fi
done
echo "no branch with scripts/claude-bootstrap.sh found"; exit 1
