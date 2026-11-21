"""round 31: approved Screen 06 Benny (rear view cut-out) -> several image-to-3D generators on fal (paid; user-authorised).
Each output GLB lands in qa/benny/r31/gen/<name>.glb with its result JSON."""
import json, sys, re
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '/home/user/rainbow-/tools/paint06')
from fal import run, data_uri, download
R = '/home/user/rainbow-'; O = f'{R}/qa/benny/r31/gen'
img = data_uri(f'{R}/qa/benny/r31/input/benny_input_white.png')
JOBS = {
  'hunyuan21': ('fal-ai/hunyuan3d-v21', {'input_image_url': img, 'textured_mesh': True}),
  'trellis': ('fal-ai/trellis', {'image_url': img, 'texture_size': 2048, 'mesh_simplify': 0.9}),
  'rodin': ('fal-ai/hyper3d/rodin', {'input_image_urls': [img], 'geometry_file_format': 'glb', 'material': 'PBR', 'quality': 'high', 'tier': 'Regular'}),
  'tripo25': ('tripo3d/tripo/v2.5/image-to-3d', {'image_url': img, 'texture': 'HD', 'pbr': True, 'texture_alignment': 'original_image'}),
}
only = sys.argv[1:] or list(JOBS)
def go(name):
    ep, body = JOBS[name]
    r = run(ep, body, name=f'benny31_{name}', est_usd=0.4, max_wait=1500)
    json.dump(r, open(f'{O}/{name}.json', 'w'), indent=1)
    urls = re.findall(r'https://[^"]+?\.glb', json.dumps(r))
    if not urls: return name, 'no glb in result: ' + json.dumps(r)[:300]
    download(urls[0], f'{O}/{name}.glb'); return name, urls[0]
with ThreadPoolExecutor(4) as ex:
    for f in [ex.submit(go, n) for n in only]:
        try: print(f.result())
        except Exception as e: print('ERR', str(e)[:500])
