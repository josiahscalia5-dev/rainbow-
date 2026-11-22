"""Round 21 lead: one fal `nano-banana-2/edit` job — repaint a clean frame of the REAL game (image 1: the game's own camera +
geometry) in the art of the user's approved original (images 2..: style / material references). Every job is logged with its
inputs (sha256), prompt, request id, estimated cost and outputs in <out>/<name>.job.json and appended to the ledger.
Proposals only: nothing generated here is an accepted reference until the user approves it; the originals are never written.
usage: python3 -I tools/lead21/fal_view.py <out_dir> <name> <prompt.txt> <structure.png> <ref.png> [ref2.png ...]
env: FAL_RES (2K), FAL_N (1), FAL_AR (9:16)"""
import base64, hashlib, io, json, os, subprocess, sys, time
from pathlib import Path
from PIL import Image

PRICE = {"0.5K": 0.06, "1K": 0.08, "2K": 0.12, "4K": 0.16}   # USD per output image (fal model page, 2026-11-20)
LEDGER = Path("/home/user/rainbow-/qa/review_r21/artwork/LEDGER.md")
out, name, prompt_f = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
imgs = sys.argv[4:]
res, n, ar = os.environ.get("FAL_RES", "2K"), int(os.environ.get("FAL_N", "1")), os.environ.get("FAL_AR", "9:16")
out.mkdir(parents=True, exist_ok=True)
prompt = Path(prompt_f).read_text().strip()

def data_uri(p):
    im = Image.open(p).convert("RGB")
    b = io.BytesIO(); im.save(b, "JPEG", quality=94)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

def curl(args, data=None):
    cmd = ["curl", "-sS", "--max-time", "180", "-H", "Authorization: Key proxy-injected"] + args
    r = subprocess.run(cmd, input=data, capture_output=True, text=True)
    if r.returncode: raise SystemExit(f"curl failed: {r.stderr[:300]}")
    return r.stdout

body = {"prompt": prompt, "image_urls": [data_uri(p) for p in imgs], "num_images": n, "aspect_ratio": ar,
        "resolution": res, "output_format": "png"}
t0 = time.time()
sub = json.loads(curl(["-H", "Content-Type: application/json", "--data-binary", "@-",
                       "https://queue.fal.run/fal-ai/nano-banana-2/edit"], json.dumps(body)))
rid = sub.get("request_id")
if not rid: raise SystemExit(f"submit failed: {json.dumps(sub)[:400]}")
status_url = sub.get("status_url") or f"https://queue.fal.run/fal-ai/nano-banana-2/requests/{rid}/status"
resp_url = sub.get("response_url") or f"https://queue.fal.run/fal-ai/nano-banana-2/requests/{rid}"
print("submitted", rid, flush=True)
st = {}
for _ in range(120):
    st = json.loads(curl([status_url]))
    if st.get("status") in ("COMPLETED", "FAILED", "ERROR", "CANCELLED"): break
    time.sleep(4)
res_j = json.loads(curl([resp_url]))
files = []
for i, im in enumerate(res_j.get("images", [])):
    dst = out / f"{name}_v{i + 1}.png"
    subprocess.run(["curl", "-sS", "--max-time", "180", "-o", str(dst), im["url"]], check=True)
    files.append(str(dst))
cost = PRICE.get(res, 0.12) * len(files)
job = {"name": name, "endpoint": "fal-ai/nano-banana-2/edit", "request_id": rid, "status": st.get("status"),
       "resolution": res, "aspect_ratio": ar, "num_images": n, "estimated_cost_usd": round(cost, 3),
       "inputs": [{"path": p, "sha256": hashlib.sha256(Path(p).read_bytes()).hexdigest()} for p in imgs],
       "prompt": prompt, "outputs": files, "seconds": round(time.time() - t0, 1),
       "error": None if files else json.dumps(res_j)[:600],
       "note": "PROPOSAL — generated view, NOT an approved reference until the user approves it"}
(out / f"{name}.job.json").write_text(json.dumps(job, indent=1))
LEDGER.parent.mkdir(parents=True, exist_ok=True)
if not LEDGER.exists():
    LEDGER.write_text("# Round 21 generated-artwork ledger (paid jobs, user-authorised 2026-11-20 ~02:20 UTC)\n\n"
                      "| UTC | job | endpoint | request id | images | est. cost (USD) | result |\n|---|---|---|---|---|---|---|\n")
with LEDGER.open("a") as f:
    f.write(f"| {time.strftime('%Y-%m-%d %H:%M', time.gmtime())} | {name} | nano-banana-2/edit {res} | `{rid}` | {len(files)} | "
            f"{cost:.2f} | {', '.join(Path(x).name for x in files) or 'FAILED: ' + (job['error'] or '')[:80]} |\n")
print(json.dumps({k: job[k] for k in ("name", "request_id", "status", "estimated_cost_usd", "outputs", "seconds", "error")}, indent=1))
