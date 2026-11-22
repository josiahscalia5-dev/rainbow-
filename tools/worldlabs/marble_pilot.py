"""Marble World API pilot helper (Rainbow Screen 05). The API key is injected by the session proxy;
this script never reads, prints or stores it. Usage:
  marble_pilot.py credits
  marble_pilot.py upload <image.png>                 -> prints media_asset_id
  marble_pilot.py generate <model> <media_asset_id> <display_name> <prompt_file>  -> prints operation id
  marble_pilot.py poll <operation_id> <out.json> [max_seconds]
  marble_pilot.py world <world_id> <out.json>
  marble_pilot.py export_ply <world_id> <resolution> <out.json>
"""
import json, os, sys, time, urllib.request, urllib.error

API = "https://api.worldlabs.ai/marble/v1"
CAP_SPEND = 6250          # user-approved maximum: US$5
START_BALANCE = 7000.0    # balance at the first authentication test (2026-11-16)


def call(method, path, body=None, timeout=60):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except Exception:
            return e.code, {}


def credits():
    s, d = call("GET", "/credits")
    return d.get("remaining_credits") if s == 200 else None


def guard(cost):
    """Round 32 (2026-11-21): the user approves jobs paid from the EXISTING API credits only, never cash. A job is refused
    when its maximum cost could exceed the current balance (an overage would be billed to a card)."""
    bal = credits()
    if bal is None or cost > bal:
        sys.exit(f"REFUSED: balance {bal} < maximum job cost {cost} (would create a card-billed overage)")
    print(f"budget ok: balance {bal:.0f}, this job at most {cost}, balance after at least {bal - cost:.0f}")


def main():
    cmd = sys.argv[1]
    if cmd == "credits":
        print(credits())
    elif cmd == "upload":
        path = sys.argv[2]
        ext = os.path.splitext(path)[1].lstrip(".").lower()
        s, d = call("POST", "/media-assets:prepare_upload",
                    {"file_name": os.path.basename(path), "kind": "image", "extension": ext})
        if s != 200:
            sys.exit(f"prepare_upload HTTP {s}: {d}")
        info = d["upload_info"]
        req = urllib.request.Request(info["upload_url"], data=open(path, "rb").read(),
                                     method=info.get("upload_method", "PUT"))
        for k, v in (info.get("required_headers") or {}).items():
            req.add_header(k, v)
        with urllib.request.urlopen(req, timeout=120) as r:
            print("upload HTTP", r.status)
        print("media_asset_id", d["media_asset"]["media_asset_id"])
    elif cmd == "generate":
        model, asset, name, prompt_file = sys.argv[2:6]
        cost = {"marble-1.0-draft": 230, "marble-1.1": 1580, "marble-1.0": 1580, "marble-1.1-plus": 3080}[model]  # plus: 1,580-3,080 (variable)
        guard(cost)
        body = {"display_name": name, "model": model,
                "world_prompt": {"type": "image", "is_pano": False,
                                 "image_prompt": {"source": "media_asset", "media_asset_id": asset},
                                 "text_prompt": open(prompt_file).read().strip()}}
        s, d = call("POST", "/worlds:generate", body)
        print("generate HTTP", s)
        print(json.dumps({k: d.get(k) for k in ("operation_id", "done", "error", "metadata")}, indent=1))
    elif cmd == "poll":
        op, out = sys.argv[2], sys.argv[3]
        limit = float(sys.argv[4]) if len(sys.argv) > 4 else 540
        t0 = time.time()
        while True:
            s, d = call("GET", f"/operations/{op}")
            prog = (d.get("metadata") or {}).get("progress")
            if d.get("done") or s != 200 or time.time() - t0 > limit:
                break
            print(f"{time.time()-t0:5.0f}s {prog}", flush=True)
            time.sleep(15)
        json.dump(d, open(out, "w"), indent=1)
        print("HTTP", s, "done", d.get("done"), "error", d.get("error"))
    elif cmd == "world":
        s, d = call("GET", f"/worlds/{sys.argv[2]}")
        json.dump(d, open(sys.argv[3], "w"), indent=1)
        print("HTTP", s)
    elif cmd == "export_ply":
        wid, res, out = sys.argv[2:5]
        s, d = call("POST", f"/worlds/{wid}:export",
                    {"asset_type": "splats", "format": "ply", "resolution": res}, timeout=600)
        json.dump(d, open(out, "w"), indent=1)
        print("export HTTP", s, "done", d.get("done"), "error", d.get("error"))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
