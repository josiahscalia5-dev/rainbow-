"""paint06: minimal fal queue client (credentials are injected by the environment proxy — no key in code).
usage as module: from fal import run; res = run('fal-ai/esrgan', {...}, name='job', est_usd=0.01)
Every job is appended to qa/match/06/paint06/LEDGER.md (user authorised paid jobs 2026-11-21: "I don't care how much it costs")."""
import base64, io, json, subprocess, time
from pathlib import Path
from PIL import Image

LEDGER = Path('/home/user/rainbow-/qa/match/06/paint06/LEDGER.md')

def data_uri(p, fmt='PNG'):
    im = Image.open(p) if not isinstance(p, Image.Image) else p
    b = io.BytesIO()
    if fmt == 'JPEG': im.convert('RGB').save(b, 'JPEG', quality=95); mime = 'image/jpeg'
    else: im.save(b, 'PNG'); mime = 'image/png'
    return f'data:{mime};base64,' + base64.b64encode(b.getvalue()).decode()

def _curl(args, data=None, tmo=300):
    cmd = ['curl', '-sS', '--max-time', str(tmo), '-H', 'Authorization: Key proxy-injected'] + args
    r = subprocess.run(cmd, input=data, capture_output=True, text=True)
    if r.returncode: raise RuntimeError(f'curl failed: {r.stderr[:300]}')
    return r.stdout

def run(endpoint, body, name='job', est_usd=0.0, poll=3, max_wait=900):
    t0 = time.time()
    sub = json.loads(_curl(['-H', 'Content-Type: application/json', '--data-binary', '@-', f'https://queue.fal.run/{endpoint}'], json.dumps(body)))
    rid = sub.get('request_id')
    if not rid: raise RuntimeError(f'submit failed: {json.dumps(sub)[:500]}')
    su, ru = sub['status_url'], sub['response_url']
    st = {}
    while time.time() - t0 < max_wait:
        st = json.loads(_curl([su]))
        if st.get('status') in ('COMPLETED', 'FAILED', 'ERROR', 'CANCELLED'): break
        time.sleep(poll)
    res = json.loads(_curl([ru]))
    ok = st.get('status') == 'COMPLETED' and 'detail' not in res
    LEDGER.parent.mkdir(parents=True, exist_ok=True)
    if not LEDGER.exists():
        LEDGER.write_text('# paint06 paid-job ledger (fal; user authorised 2026-11-21 ~00:30 UTC: "I don\'t care how much it costs")\n\n'
                          '| UTC | job | endpoint | request id | est. USD | ok | seconds |\n|---|---|---|---|---|---|---|\n')
    with LEDGER.open('a') as f:
        f.write(f"| {time.strftime('%Y-%m-%d %H:%M', time.gmtime())} | {name} | {endpoint} | `{rid}` | {est_usd:.3f} | {ok} | {time.time()-t0:.0f} |\n")
    if not ok: raise RuntimeError(f'{endpoint} {name}: {st.get("status")} {json.dumps(res)[:600]}')
    return res

def download(url, dst):
    subprocess.run(['curl', '-sS', '--max-time', '300', '-o', str(dst), url], check=True)
    return dst
