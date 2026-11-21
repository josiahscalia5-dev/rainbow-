#!/usr/bin/env bash
# Copies (read-only) the Screen 05 specialists' in-progress work from their scratch folders into the repository so the five-minute
# autosave pushes it to GitHub: code, pages, notes, logs, test pictures, rebuilt track pieces. node_modules, symlinks and the source
# worlds (already in qa/worldlabs, qa/spaitial) are skipped. Never writes into the agents' folders.
#   bash tools/marble05/sync_agents_wip.sh [workspace]   (workspace = the folder setup_r32.sh built; default: $R32_WS, else the
#   round-32 account's original scratchpad). Also saves the lead's merged folder (`merged/`) and acceptance outputs (`acc*/`).
R32_WS=${1:-${R32_WS:-/tmp/claude-0/-home-user-rainbow-/e7a27dfe-01e5-5ff6-9e4c-e2d0f8167a81/scratchpad}} python3 -I - <<'PY'
import os, shutil, datetime
SCR = os.environ['R32_WS']
DST = '/home/user/rainbow-/backups/wip/screen05-agents'
KEEP = ('.html', '.js', '.mjs', '.cjs', '.py', '.md', '.json', '.png', '.jpg', '.mp4', '.ply', '.txt', '.log', '.sh')
n = 0
for a in ['agentA', 'agentB', 'merged'] + sorted(d for d in os.listdir(SCR) if d.startswith('acc') and os.path.isdir(os.path.join(SCR, d))):
    src = os.path.join(SCR, a)
    if not os.path.isdir(src): continue
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d != 'node_modules' and not d.startswith('out_run') and not os.path.islink(os.path.join(root, d))]
        for f in files:
            p = os.path.join(root, f)
            if os.path.islink(p) or not f.endswith(KEEP) or f == 'package-lock.json': continue
            if a.startswith('acc') and f.startswith('f_') and f.endswith('.jpg'): continue   # per-frame captures: the mp4 + logs are kept
            if os.path.getsize(p) > 60 * 1024 * 1024: continue
            q = os.path.join(DST, a, os.path.relpath(p, src))
            if os.path.exists(q) and os.path.getmtime(q) >= os.path.getmtime(p) and os.path.getsize(q) == os.path.getsize(p): continue
            os.makedirs(os.path.dirname(q), exist_ok=True); shutil.copy2(p, q); n += 1
os.makedirs(os.path.join(DST, 'lead'), exist_ok=True)
for f in ('final_acceptance.cjs', 'visual_check.py'):
    if os.path.exists(os.path.join(SCR, f)): shutil.copy2(os.path.join(SCR, f), os.path.join(DST, 'lead', f))
open(os.path.join(DST, 'LAST_SYNC_UTC'), 'w').write(datetime.datetime.now(datetime.timezone.utc).isoformat() + '\n')
print('synced files:', n)
PY
