"""benny08 beanie COLOURS from the approved Screen 08 picture without moving any stripe (benny-character-artist).
Why: at the locked 08 frame the game beanie sits ~18 px lower / ~13 px further right and is narrower than the painted one
(part IoU pom 0.33, crown 0.39, cuff 0.32, star 0.06), so a per-pixel bake of the beanie paints the approved stripes
across the wrong rows (measured closer, but visibly broken stripes - test b1). Here each beanie colour CLASS takes the
approved picture's colour instead: crown white knit, crown purple stripes, ribbed cuff, pom-pom yarn, gold star.
Per class k: target albedo at every game pixel p of that class = (inverse-chained approved median colour of class k at
p's screen position - S(p)) / E(p) (the same per-pixel calibration as bake08.py), current effective albedo =
(L_current(p) - S(p)) / E(p) from a REAL capture of the benny05 maps; gain_k = median target / median current (linear
RGB, per channel). The benny05 map is multiplied by gain_k (crown: soft white/purple weight per texel from the map's own
colour), so knit stitches, ribs, yarn, stripe layout and the star map's bevel all stay exactly as they are.
usage: python3 -I classgain08.py <run_dir> <current_capture.png> <in_maps_dir> <out_dir> [--prev gains.json [--display]]
  --prev: multiply onto earlier gains (iteration: <current_capture> is then a capture WITH those gains)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from parts08 import approved_parts
from geom08 import load_uv, game_ids
from bennyseg08 import colour_classes
from bake08 import inv_chain, fit_es, img, s2l, l2s, LUM

# (map, approved part key, game id, classes: name -> colour class id (None = every pixel of the part))
SPEC = [('crown', 'crown', 2, {'white': 3, 'purple': 2}), ('brim', 'cuff', 3, {'all': None}),
        ('pom', 'pom', 4, {'all': None}), ('star', 'star', 5, {'all': None})]


def main():
    run, cur, tin, tout = sys.argv[1:5]
    prev = json.load(open(sys.argv[sys.argv.index('--prev') + 1])) if '--prev' in sys.argv else None
    os.makedirs(tout, exist_ok=True)
    P, a8, m = approved_parts()
    ids = game_ids(load_uv(f'{run}/uv.f32'))
    E, S, ncal = fit_es(run)
    El = (E * LUM).sum(-1)
    valid = (El > 0.03) & (ncal >= 2)
    g8 = np.asarray(Image.open(cur).convert('RGB')).astype(float)
    Lg = inv_chain(g8 / 255.0)
    ca, cg = colour_classes(a8), colour_classes(g8)
    H, W = ids.shape
    rep = {}
    for name, key, gid, classes in SPEC:
        gp = ndi.binary_erosion(ids == gid, iterations=1) & valid
        gp &= El > 0.45 * np.median(El[gp])
        ap = ndi.binary_erosion(P[key], iterations=1)
        gains = {}
        for cname, k in classes.items():
            a_sel = ap & (ca == k) if k is not None else ap
            g_sel = gp & (cg == k) if k is not None else gp
            med = np.median(a8[a_sel], 0)  # approved display colour of this class (0-255)
            T = inv_chain(np.broadcast_to(med / 255.0, (H, W, 3)).copy())
            tgt = (T - S)[g_sel] / np.maximum(E[g_sel], 1e-4)
            now = (Lg - S)[g_sel] / np.maximum(E[g_sel], 1e-4)
            gk = np.median(tgt, 0) / np.maximum(np.median(now, 0), 1e-4)
            if prev and '--display' in sys.argv:
                # secant step on the DISPLAY medians (the per-pixel albedo median overshoots blue near 255 / in the grade):
                # gain *= (linear approved median / linear game median) ** 0.8
                gm = np.median(g8[g_sel], 0)
                gk = np.array(prev[name]['classes'][cname]['gain']) * (s2l(med / 255.0) / np.maximum(s2l(gm / 255.0), 1e-4)) ** 0.8
            elif prev:
                gk = gk * np.array(prev[name]['classes'][cname]['gain'])
            gains[cname] = dict(gain=[round(float(v), 4) for v in gk], approved_px=int(a_sel.sum()), game_px=int(g_sel.sum()),
                                approved_median=med.astype(int).tolist(), game_median=np.median(g8[g_sel], 0).astype(int).tolist())
        t05 = s2l(img(f'{tin}/{name}.png'))
        if name == 'crown':
            c05 = colour_classes(np.asarray(Image.open(f'{tin}/{name}.png').convert('RGB')).astype(float))
            wp = ndi.gaussian_filter((c05 == 2).astype(float), 1.0, mode='wrap')[..., None]
            gmap = wp * np.array(gains['purple']['gain']) + (1 - wp) * np.array(gains['white']['gain'])
        else:
            gmap = np.array(gains['all']['gain'])[None, None, :]
        out = t05 * gmap
        clipped = float((out > 1).any(-1).mean())
        Image.fromarray((l2s(np.clip(out, 0, 1)) * 255 + 0.5).astype(np.uint8)).save(f'{tout}/{name}.png')
        rep[name] = dict(classes=gains, clipped_share=round(clipped, 5))
    json.dump(rep, open(f'{tout}/classgain_report.json', 'w'), indent=1)
    print(json.dumps(rep, indent=1))


if __name__ == '__main__':
    main()
