#!/usr/bin/env bash
# Copies (read-only) the Screen 05 specialists' in-progress work from their scratch folders into the repository so the five-minute
# autosave pushes it to GitHub: code, pages, notes, logs, test pictures, rebuilt track pieces. node_modules, symlinks and the source
# worlds (already in qa/worldlabs, qa/spaitial) are skipped. Never writes into the agents' folders.
python3 -I - <<'PY'
import os, shutil, datetime
SCR = '/tmp/claude-0/-home-user-rainbow-/e7a27dfe-01e5-5ff6-9e4c-e2d0f8167a81/scratchpad'
DST = '/home/user/rainbow-/backups/wip/screen05-agents'
KEEP = ('.html', '.js', '.mjs', '.cjs', '.py', '.md', '.json', '.png', '.jpg', '.mp4', '.ply', '.txt', '.log')
n = 0
for a in ('agentA', 'agentB'):
    src = os.path.join(SCR, a)
    if not os.path.isdir(src): continue
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d != 'node_modules' and not d.startswith('out_run') and not os.path.islink(os.path.join(root, d))]
        for f in files:
            p = os.path.join(root, f)
            if os.path.islink(p) or not f.endswith(KEEP) or f == 'package-lock.json': continue
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
