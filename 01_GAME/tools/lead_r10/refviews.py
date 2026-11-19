"""Round 10 — proposed reference views for course parts the approved picture does not show (PAID: fal nano-banana-2/edit).
Only run with the user's approval for the exact screen and image cap (docs/briefs/2026-11-18-r10/REFERENCE_VIEWS_PLAN.md).
Image 1 = the APPROVED picture (sole design authority, never modified). Image 2 = a blurred grey layout sketch made from the
current game frame at that course position (only the tunnel / water direction and Benny's place survive the blur).
usage: python3 -I tools/lead_r10/refviews.py <plan.json> <out_dir>
plan.json: {"approved": path, "num_images": 2, "max_images": 8, "views": [{"id", "guide", "s", "units_ahead", "scene"}],
            "prompt": "... {scene} ... {units} ..."}
The fal key is injected by the environment proxy for queue.fal.run (never in code or files)."""
import base64, io, json, os, sys, time, urllib.request
from PIL import Image, ImageFilter, ImageOps

EP = 'https://queue.fal.run/fal-ai/nano-banana-2/edit'
BASE = 'https://queue.fal.run/fal-ai/nano-banana-2'


def data_uri(im, q=95):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


def sketch(path):
    # sigma 16: the current game's wrong details (foam-ball rows, corridor ring texture) must NOT survive, only the massing
    g = ImageOps.grayscale(Image.open(path)).filter(ImageFilter.GaussianBlur(16))
    g = ImageOps.autocontrast(g, cutoff=2).point(lambda v: 70 + v * 0.55)  # soft, low-contrast grey layout
    return g


def call(method, url, body=None):
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Content-Type': 'application/json', 'Authorization': 'Key proxy-injected'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode())


def main():
    plan = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    approved = Image.open(plan['approved']); n_img = int(plan.get('num_images', 2)); cap = int(plan['max_images'])
    spent = 0; log = []
    for v in plan['views']:
        if spent + n_img > cap:
            print('CAP reached, skipping', v['id']); break
        g = sketch(v['guide']); g.save(f"{out}/{v['id']}_0_layout_sketch.png")
        prompt = plan['prompt'].format(scene=v['scene'], units=v['units_ahead'])
        body = {'prompt': prompt, 'image_urls': [data_uri(approved), data_uri(g, 90)], 'num_images': n_img,
                'aspect_ratio': '9:16', 'resolution': '2K', 'output_format': 'png', 'sync_mode': True}
        sub = call('POST', EP, body); rid = sub['request_id']; spent += n_img
        print(v['id'], 'submitted', rid, flush=True)
        t0 = time.time(); st = {}
        while time.time() - t0 < 600:
            st = call('GET', f'{BASE}/requests/{rid}/status')
            if st.get('status') in ('COMPLETED', 'FAILED', 'ERROR'): break
            time.sleep(5)
        res = call('GET', f'{BASE}/requests/{rid}') if st.get('status') == 'COMPLETED' else {'error': st}
        rec = {'view': v, 'request_id': rid, 'status': st.get('status'), 'prompt': prompt, 'endpoint': EP,
               'params': {k: body[k] for k in body if k not in ('image_urls', 'prompt')}, 'files': [], 'urls': []}
        for i, im in enumerate(res.get('images', []) or []):
            u = im.get('url', '')
            if u.startswith('data:'):
                p = f"{out}/{v['id']}_cand{i + 1}.png"
                open(p, 'wb').write(base64.b64decode(u.split(',', 1)[1])); rec['files'].append(p)
            else:
                rec['urls'].append(u)
        json.dump(rec, open(f"{out}/{v['id']}_request.json", 'w'), indent=1)
        log.append(rec); print(v['id'], rec['status'], 'files', rec['files'], 'urls', rec['urls'], flush=True)
    json.dump({'images_requested': spent, 'cap': cap, 'requests': [r['request_id'] for r in log]},
              open(f'{out}/SPEND.json', 'w'), indent=1)
    print('images requested', spent, 'of cap', cap)


if __name__ == '__main__':
    main()
