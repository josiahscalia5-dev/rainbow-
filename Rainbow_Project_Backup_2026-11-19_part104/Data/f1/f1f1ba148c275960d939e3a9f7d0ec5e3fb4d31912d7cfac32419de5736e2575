"""benny08 bake refinement (one iterative back-projection step). Adapted copy of line B's
qa/pilot05/full_reference_match/benny/work/refine.py (read-only source, ccr-b0757dec-dj6l1o @99ab17b): the albedo the
renderer produced in a REAL capture of the installed maps is compared per pixel with the albedo the approved 08 pixel
needs; the difference is splatted back into the texels the bake SAW (its *_seen.png) -> undoes splat + texture-filter blur.
usage: python3 -I refine08.py <run_dir: uv.f32 + cal*.png> <capture.png> <tex_in> <tex_out> --seen <bake dir>
       [--lam 0.8] [--parts body,armL,armR]
Only seen texels change (faded out over their last texels); filled / benny05 texels and the normal maps stay."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from parts08 import approved_parts
from geom08 import load_uv, game_ids
from bake08 import inv_chain, img, fit_es, PARTS, LUM, colour_ok, s2l, l2s, splat


def main():
    run, cap, tin, tout = sys.argv[1:5]
    lam = float(sys.argv[sys.argv.index('--lam') + 1]) if '--lam' in sys.argv else 0.8
    seen_dir = sys.argv[sys.argv.index('--seen') + 1]
    only = sys.argv[sys.argv.index('--parts') + 1].split(',') if '--parts' in sys.argv else ['body', 'armL', 'armR']
    os.makedirs(tout, exist_ok=True)
    P, a8, m = approved_parts()
    uvf = load_uv(f'{run}/uv.f32')
    ids = game_ids(uvf)
    E, S, ncal = fit_es(run)
    Lt = inv_chain(a8 / 255.0); Lg = inv_chain(img(cap))
    El = (E * LUM).sum(-1)
    valid = (El > 0.03) & (ncal >= 2)
    okc = colour_ok(a8)
    rep = {}
    for pid, (name, key, TW, TH) in PARTS.items():
        if name not in only:
            continue
        lit = El > 0.45 * np.median(El[(ids == pid) & valid])
        sel = (ids == pid) & ndi.binary_erosion(P[key], iterations=1) & ndi.binary_erosion(ids == pid, iterations=1) & valid & lit & okc[key]
        num, den, cnt = splat(sel, uvf, (Lt - Lg)[sel], E[sel], TW, TH)
        seen = (cnt > 0.25) & (np.asarray(Image.open(f'{seen_dir}/{name}_seen.png')) > 0)
        corr = np.where(seen[..., None], num / np.maximum(den, 1e-6), 0)
        wgt = np.clip(ndi.uniform_filter(seen.astype(float), 5, mode='wrap') * 1.25, 0, 1)[..., None] * seen[..., None]
        t = s2l(img(f'{tin}/{name}.png'))
        before = t.copy()
        t = np.clip(t + lam * wgt * corr, 0, 1)
        Image.fromarray((l2s(t) * 255 + 0.5).astype(np.uint8)).save(f'{tout}/{name}.png')
        rep[name] = dict(px=int(sel.sum()), texels=int(seen.sum()), mean_abs_corr=round(float(np.abs(corr[seen]).mean()), 4),
                         mean_change=round(float(np.abs(t - before)[seen].mean()), 4))
    json.dump(rep, open(f'{tout}/refine_report.json', 'w'), indent=1)
    print(json.dumps(rep))


if __name__ == '__main__':
    main()
