"""CURRENT vs NEW Benny on Screen 08 against the APPROVED picture (benny-character-artist, 2026-11-17).
Per approved part (parts08.py masks: body fur + arm nubs, crown stripes, ribbed cuff, pom-pom, gold star):
  mean |dRGB|, share within 20 levels, luminance SSIM (mean of the 7x7 SSIM map over the part), approved vs game median
  colour, fine-detail correlation (high-pass luminance, sigma 2, inside the part eroded 3 px: Pearson r and the game's
  amplitude as a share of the approved's) - like line B's section-0 table.
  'overlap' rows: only pixels where the game shows the SAME part (UV pass ids) -> colour match without the placement error.
Regions: Benny + splash box (x 220-650, y 840-1245), Benny silhouette (approved parts), scenery (y >= 190 outside the
Benny box), whole frame (regions08.py).
usage: python3 -I compare08.py <uv.f32> LABEL=<capture.png> [LABEL2=<capture2.png> ...] [--json=OUT]"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.ndimage import gaussian_filter
from parts08 import approved_parts
from geom08 import load_uv, game_ids
from regions08 import regions, ssim_map

LUMW = np.array([0.2126, 0.7152, 0.0722])
GAME_ID = dict(body=[1, 6, 7, 8, 9], crown=[2], cuff=[3], pom=[4], star=[5])


def hp(a):
    l = (a * LUMW).sum(-1)
    return l - gaussian_filter(l, 2.0)


def table(A, C, P, ids):
    d = np.abs(A - C).mean(-1); sm = ssim_map(A, C); ha, hc = hp(A), hp(C)
    out = {}
    for name, m in list(P.items()) + [('benny', np.any(np.stack(list(P.values())), 0))]:
        inner = ndi.binary_erosion(m, iterations=3)
        r = float(np.corrcoef(ha[inner], hc[inner])[0, 1]) if inner.sum() > 50 else None
        amp = float(hc[inner].std() / max(ha[inner].std(), 1e-6)) if inner.sum() > 50 else None
        row = dict(px=int(m.sum()), mean_abs=round(float(d[m].mean()), 2), within_20=round(float((d[m] <= 20).mean()), 4),
                   ssim=round(float(sm[m].mean()), 4), approved_median=np.median(A[m], 0).astype(int).tolist(),
                   game_median=np.median(C[m], 0).astype(int).tolist(),
                   detail_r=round(r, 3) if r is not None else None, detail_amp=round(amp, 3) if amp is not None else None)
        if name in GAME_ID:
            o = m & np.isin(ids, GAME_ID[name])
            row['overlap'] = dict(px=int(o.sum()), mean_abs=round(float(d[o].mean()), 2), within_20=round(float((d[o] <= 20).mean()), 4),
                                  approved_median=np.median(A[o], 0).astype(int).tolist(), game_median=np.median(C[o], 0).astype(int).tolist())
        out[name] = row
    return out


CLASSES = [('crown white', 'crown', 2, 3), ('crown purple', 'crown', 2, 2), ('cuff', 'cuff', 3, None), ('pom', 'pom', 4, None),
           ('star', 'star', 5, None), ('body fur', 'body', 1, 1)]


def class_colours(A, C, P, ids):
    """colour of each beanie / fur colour CLASS, placement-free: approved = that class inside the approved part, game =
    that class inside the game's own part (UV-pass ids) -> median colour and the mean |difference| of the 10/25/50/75/90 %
    percentiles (0-255, mean over RGB)"""
    from bennyseg08 import colour_classes
    ca, cg = colour_classes(A), colour_classes(C)
    out = {}
    for name, key, gid, k in CLASSES:
        a = ndi.binary_erosion(P[key], iterations=1); g = ndi.binary_erosion(ids == gid, iterations=1)
        if k is not None:
            a &= ca == k; g &= cg == k
        pa, pg = np.percentile(A[a], [10, 25, 50, 75, 90], axis=0), np.percentile(C[g], [10, 25, 50, 75, 90], axis=0)
        out[name] = dict(approved_median=pa[2].astype(int).tolist(), game_median=pg[2].astype(int).tolist(),
                         median_diff=round(float(np.abs(pa[2] - pg[2]).mean()), 2), percentile_diff=round(float(np.abs(pa - pg).mean()), 2),
                         approved_px=int(a.sum()), game_px=int(g.sum()))
    return out


if __name__ == '__main__':
    uv = [a for a in sys.argv[1:] if not a.startswith('--') and '=' not in a][0]
    caps = [a.split('=', 1) for a in sys.argv[1:] if '=' in a and not a.startswith('--')]
    opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
    P, a8, m = approved_parts()
    ids = game_ids(load_uv(uv))
    A = a8.astype(float)
    res = {}
    for lab, p in caps:
        C = np.asarray(Image.open(p).convert('RGB'), float)
        res[lab] = dict(capture=p, parts=table(A, C, P, ids), classes=class_colours(A, C, P, ids), regions=regions(p))
    hdr = f"{'part':7s} " + ' | '.join(f'{lab:^44s}' for lab, _ in caps)
    print(hdr)
    for part in list(P) + ['benny']:
        cells = []
        for lab, _ in caps:
            r = res[lab]['parts'][part]
            cells.append(f"{r['mean_abs']:5.1f} {100 * r['within_20']:5.1f}% ssim {r['ssim']:.3f} r {r['detail_r']} a {r['detail_amp']}")
        print(f'{part:7s} ' + ' | '.join(f'{c:44s}' for c in cells))
        for lab, _ in caps:
            r = res[lab]['parts'][part]
            ov = r.get('overlap')
            print(f"        {lab}: approved {r['approved_median']} game {r['game_median']}" +
                  (f" | overlap {ov['px']} px: {ov['mean_abs']} / {100 * ov['within_20']:.1f}% approved {ov['approved_median']} game {ov['game_median']}" if ov else ''))
    for cl, *_ in CLASSES:
        print(f'{cl:13s} ' + ' | '.join(f"{lab}: {res[lab]['classes'][cl]['game_median']} vs {res[lab]['classes'][cl]['approved_median']} "
                                         f"med {res[lab]['classes'][cl]['median_diff']:.1f} pct {res[lab]['classes'][cl]['percentile_diff']:.1f}" for lab, _ in caps))
    for reg in ['benny+splash', 'scenery', 'upper', 'middle', 'lower', 'whole']:
        print(f'{reg:13s} ' + ' | '.join(f"{100 * res[lab]['regions'][reg]['within_20']:5.1f}% ssim {res[lab]['regions'][reg]['ssim']:.3f} mean {res[lab]['regions'][reg]['mean_abs']:.2f}" for lab, _ in caps))
    if 'json' in opt:
        json.dump(res, open(opt['json'], 'w'), indent=1)
