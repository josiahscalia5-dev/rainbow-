"""Run Depth Anything 3 (Apache-2.0 checkpoints only) on the approved Rainbow pictures 04-08.
Usage: run_da3.py MODEL[,MODEL...] OUTDIR
Writes OUTDIR/<model>/<NN>.npz with depth (H,W), conf, sky (if any), intrinsics (3,3), proc_size, seconds."""
import sys, time, os, json
import numpy as np, torch
from PIL import Image
from depth_anything_3.api import DepthAnything3

torch.set_num_threads(2)
REPO = '/home/user/rainbow-'
REFS = {
    '04': 'references/04_through_the_five_arrows.png',
    '05': 'references/05_flow_into_the_current.png',
    '06': 'references/06_crest_the_rinse_arch.png',
    '07': 'references/07_dive_the_washer_tube.png',
    '08': 'references/08_final_spin_chamber.png',
}
models, out = sys.argv[1].split(','), sys.argv[2]
for m in models:
    t0 = time.time()
    model = DepthAnything3.from_pretrained(f'depth-anything/{m}').eval()
    print(f'{m}: loaded in {time.time() - t0:.0f}s', flush=True)
    os.makedirs(f'{out}/{m}', exist_ok=True)
    for nn, rel in REFS.items():
        img = Image.open(f'{REPO}/{rel}').convert('RGB')
        t = time.time()
        with torch.inference_mode():
            p = model.inference([img], process_res=504)
        d = dict(depth=np.asarray(p.depth[0], np.float32), seconds=time.time() - t)
        for k in ('conf', 'sky'):
            v = getattr(p, k, None)
            if v is not None: d[k] = np.asarray(v[0], np.float32)
        if getattr(p, 'intrinsics', None) is not None: d['intrinsics'] = np.asarray(p.intrinsics[0], np.float32)
        np.savez_compressed(f'{out}/{m}/{nn}.npz', **d)
        print(f'{m} {nn}: depth {d["depth"].shape} {d["seconds"]:.1f}s intr={"intrinsics" in d} sky={"sky" in d}', flush=True)
    del model
