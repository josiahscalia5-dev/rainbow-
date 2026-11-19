"""benny05 bake refinement (one iterative back-projection step): the albedo the renderer actually produced in a REAL
capture of the installed maps is compared per pixel with the albedo the approved pixel needs, and the difference is
splatted back into the seen texels (ratio of sums, like bake.py) -> undoes the splat + texture filtering blur.
usage: python3 refine.py <run_dir: uv.f32 + cal*.png of the SAME geometry / normals> <capture.png> <tex_in> <tex_out>
       [--lam 0.8] [--parts body,crown,brim,pom,armL,armR] [--seen <bake out dir with *_seen.png>]
Only texels seen at the locked frame are changed; filled / tiled texels and the normal maps stay as they are."""
import sys, os, json
sys.path.insert(0, 'qa/pilot05/full_reference_match/benny'); sys.path.insert(0, 'qa/pilot05/full_reference_match/benny/work')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from parts import approved_parts
from geom import load_uv
from bake import inv_chain, img, fit_es, PARTS, LUM

def s2l(t): return np.where(t <= 0.04045, t / 12.92, ((t + 0.055) / 1.055) ** 2.4)
def l2s(t): return np.where(t <= 0.0031308, t * 12.92, 1.055 * np.maximum(t, 0) ** (1 / 2.4) - 0.055)

def main():
    run, cap, tin, tout = sys.argv[1:5]
    lam = float(sys.argv[sys.argv.index('--lam') + 1]) if '--lam' in sys.argv else 0.8
    seen_dir = sys.argv[sys.argv.index('--seen') + 1] if '--seen' in sys.argv else None
    only = sys.argv[sys.argv.index('--parts') + 1].split(',') if '--parts' in sys.argv else None
    os.makedirs(tout, exist_ok=True)
    P, a8, m = approved_parts()
    uvf = load_uv(f'{run}/uv.f32')
    ids = np.rint(uvf[..., 2]).astype(int); ids[np.abs(uvf[..., 2] - ids) > 0.01] = 0
    E, S, ncal = fit_es([run])
    Lt = inv_chain(a8 / 255.0); Lg = inv_chain(img(cap))
    El = (E * LUM).sum(-1)
    valid = (El > 0.03) & (ncal >= 2)
    from bennyseg import rgb2hsv, colour_classes
    Hh, Ss, Vv = rgb2hsv(a8); cls = colour_classes(a8)
    okc = {'body': ((Hh > 280) | (Hh < 20)) & (Ss > 0.2), 'crown': np.isin(cls, [2, 3]), 'cuff': (Hh > 230) & (Hh < 300) & (Ss > 0.35),
           'pom': (Hh > 230) & (Hh < 320) & (Ss > 0.2)}
    rep = {}
    for pid, (name, key, TW, TH, mode) in PARTS.items():
        if only and name not in only:
            continue
        lit = El > 0.45 * np.median(El[ids == pid])
        sel = (ids == pid) & ndi.binary_erosion(P[key], iterations=1) & ndi.binary_erosion(ids == pid, iterations=1) & valid & lit & okc[key]
        u = uvf[..., 0][sel] % 1.0; v = uvf[..., 1][sel]
        num_px = (Lt - Lg)[sel]; den_px = E[sel]
        num = np.zeros((TH, TW, 3)); den = np.zeros((TH, TW, 3)); cnt = np.zeros((TH, TW))
        tx = u * TW - 0.5; ty = (1 - v) * TH - 0.5
        x0 = np.floor(tx).astype(int); y0 = np.floor(ty).astype(int); fx = tx - x0; fy = ty - y0
        for dx, dy, w in [(0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)]:
            xi = (x0 + dx) % TW; yi = np.clip(y0 + dy, 0, TH - 1)
            np.add.at(num, (yi, xi), num_px * w[:, None]); np.add.at(den, (yi, xi), den_px * w[:, None]); np.add.at(cnt, (yi, xi), w)
        seen = cnt > 0.25
        if seen_dir:  # only texels the bake itself kept (its colour-family rejects stay filled)
            seen &= np.asarray(Image.open(f'{seen_dir}/{name}_seen.png')) > 0
        corr = np.where(seen[..., None], num / np.maximum(den, 1e-6), 0)
        # fade the correction out over the last texels of the seen area (no visible border against the fill)
        wgt = np.clip(ndi.uniform_filter(seen.astype(float), 5, mode='wrap') * 1.25, 0, 1)[..., None] * seen[..., None]
        t = s2l(np.asarray(Image.open(f'{tin}/{name}.png').convert('RGB')).astype(np.float64) / 255.0)
        before = t.copy()
        t = np.clip(t + lam * wgt * corr, 0, 1)
        Image.fromarray((l2s(t) * 255 + 0.5).astype(np.uint8)).save(f'{tout}/{name}.png')
        rep[name] = dict(px=int(sel.sum()), texels=int(seen.sum()), mean_abs_corr=round(float(np.abs(corr[seen]).mean()), 4),
                         mean_change=round(float(np.abs(t - before)[seen].mean()), 4),
                         pixel_err_before_lin=round(float(np.abs(num_px / np.maximum(den_px, 1e-4)).mean()), 4))
    json.dump(rep, open(f'{tout}/refine_report.json', 'w'), indent=1)
    print(json.dumps(rep, indent=1))

if __name__ == '__main__':
    main()
