"""benny08 bake: APPROVED Screen-08 pixels -> albedo maps in each Benny part's own UV space.
Adapted copy of line B's qa/pilot05/full_reference_match/benny/work/bake.py (read-only source, ccr-b0757dec-dj6l1o
@99ab17b): same inverse post chain, same per-pixel least-squares calibration (radiance = albedo*E + S over the
unclipped calibration renders), same strict part correspondence + colour-family clean-up, bilinear splat, push-pull.
Differences for 08:
  * reference references/08_final_spin_chamber.png, part masks from parts08.py (no hand mask), UV rect 220,820,440,440;
  * the game frame is `?match08=1` at the 08 checkpoint (locked camera, M08 offset / body scale / beanie counter-scale,
    splash card in front) - all of it is IN the calibration renders, so E and S already contain the splash card and the
    water in front of him; pixels the splash dims (< 45 % of the part's median light) are skipped;
  * texels the 08 picture does NOT show keep the benny05 maps (assets/textures/benny05/<part>.png, the approved-05 bake)
    with a feathered seam: weight = distance inside the closed seen area / FEATHER texels (smoothstep).
usage: python3 -I bake08.py <run_dir> <out_dir> [--feather 8] [--parts body,crown,...] [--base assets/textures/benny05]
       [--toned]   unseen texels = benny05 x the part's median 08/05 albedo ratio (inner seen texels, clamped 0.6-1.4):
                   the whole part takes the 08 tone, structure from benny05, no tone step at the seam
  run dir holds uv.f32 + calD/calE/calA/calC/calB.png (constant albedo 0.05/0.1/0.2/0.4/0.6) of one deterministic frame."""
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from parts08 import approved_parts
from geom08 import load_uv, game_ids
from bennyseg08 import rgb2hsv, colour_classes

CAL_K = {'calD': 0.05, 'calE': 0.1, 'calA': 0.2, 'calC': 0.4, 'calB': 0.6}
EXPO, SAT, CON, VIG = 0.86, 1.36, 1.15, 0.18  # live post chain on 08 (match08.ts uPjPost, grade.ts)
LUM = np.array([0.2126, 0.7152, 0.0722])


def inv_chain(t):
    """display sRGB (0..1, HxWx3, full 864x1536 frame) -> linear scene radiance (exact port of PROJ05_INVERSE)"""
    H, W = t.shape[:2]
    yy, xx = np.mgrid[:H, :W]
    qx = ((xx + 0.5) / W - 0.5) * 0.75; qy = (yy + 0.5) / H - 0.5
    r = np.sqrt(qx * qx + qy * qy)
    sm = np.clip((r - 0.25) / 0.5, 0, 1); sm = sm * sm * (3 - 2 * sm)
    vig = 1 - VIG * sm
    c = t / np.maximum(vig, 0.5)[..., None]
    c = (c - 0.5) / CON + 0.5
    l = (c * LUM).sum(-1, keepdims=True)
    c = l + (c - l) / SAT
    c = np.clip(c, 0, 0.975)
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    npk = c.max(-1, keepdims=True)
    hi = npk >= 0.76
    peak = 0.0576 / (1 - np.minimum(npk, 0.9999)) + 0.52
    g = 1 - 1 / (0.15 * (peak - npk) + 1)
    c2 = (c - g * npk) / (1 - g) * (peak / np.maximum(npk, 1e-6))
    c = np.where(hi, c2, c)
    x = c.min(-1, keepdims=True)
    off = np.where(x >= 0.04, 0.04, np.sqrt(np.maximum(x, 0)) / 2.5 - x)
    return (c + off) / EXPO


def img(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.float64) / 255.0
def s2l(t): return np.where(t <= 0.04045, t / 12.92, ((t + 0.055) / 1.055) ** 2.4)
def l2s(t): return np.where(t <= 0.0031308, t * 12.92, 1.055 * np.maximum(t, 0) ** (1 / 2.4) - 0.055)


PARTS = {  # id: (map name, approved part key, tex W, H)
    1: ('body', 'body', 1024, 512),
    2: ('crown', 'crown', 1024, 256),
    3: ('brim', 'cuff', 1024, 128),
    4: ('pom', 'pom', 512, 256),
    6: ('armL', 'body', 256, 128),
    7: ('armR', 'body', 256, 128),
    5: ('star', 'star', 256, 256),
}


def push_pull(num, den):
    """fill den==0 texels from coarser levels (num: HxWxC, den: HxW); u wraps"""
    if min(den.shape) <= 2:
        v = num.sum((0, 1)) / max(den.sum(), 1e-9)
        return np.broadcast_to(v, num.shape).copy()
    H, W = den.shape
    h2, w2 = (H + 1) // 2, (W + 1) // 2
    pn = np.zeros((h2 * 2, w2 * 2, num.shape[2])); pd = np.zeros((h2 * 2, w2 * 2))
    pn[:H, :W] = num; pd[:H, :W] = den
    cn = pn.reshape(h2, 2, w2, 2, -1).sum((1, 3)); cd = pd.reshape(h2, 2, w2, 2).sum((1, 3))
    fn = push_pull(cn, cd)
    up = np.repeat(np.repeat(fn, 2, 0), 2, 1)[:H, :W]
    up = ndi.uniform_filter(up, size=(3, 3, 1), mode='wrap')
    w = np.clip(den, 0, 1)[..., None]
    val = np.where(den[..., None] > 0, num / np.maximum(den, 1e-9)[..., None], 0)
    return w * val + (1 - w) * up


def fit_es(run):
    """least-squares E, S per pixel and channel over the unclipped calibration renders; returns E, S, n_used"""
    sk = sk2 = n = 0.0
    sl = skl = 0.0
    for k_name, k in CAL_K.items():
        p = f'{run}/{k_name}.png'
        if not os.path.exists(p):
            continue
        d = img(p)
        ok = ((d.max(-1) <= 246 / 255) & (d.min(-1) >= 3 / 255)).astype(np.float64)[..., None]
        L = inv_chain(d)
        sk = sk + ok * k; sk2 = sk2 + ok * k * k; n = n + ok
        sl = sl + ok * L; skl = skl + ok * k * L
    den = n * sk2 - sk * sk
    good = (n >= 2) & (den > 1e-8)
    E = np.where(good, (n * skl - sk * sl) / np.where(good, den, 1), 0)
    S = np.where(good, (sl - E * sk) / np.maximum(n, 1), 0)
    return E, S, n[..., 0]


def colour_ok(a8):
    Hh, Ss, Vv = rgb2hsv(a8); cls = colour_classes(a8)
    return {'body': ((Hh > 280) | (Hh < 20)) & (Ss > 0.2), 'crown': np.isin(cls, [2, 3]),
            'cuff': (Hh > 230) & (Hh < 300) & (Ss > 0.35), 'pom': (Hh > 230) & (Hh < 320) & (Ss > 0.2),
            'star': (Hh > 15) & (Hh < 70) & (Ss > 0.35)}


def family(key, alb):
    R_, G_, B_ = alb[..., 0], alb[..., 1], alb[..., 2]
    return {'body': (G_ < 0.62 * R_) & (R_ > 0.12), 'pom': (G_ < 0.55 * B_) & (B_ > 0.08), 'cuff': (G_ < 0.6 * B_),
            'crown': alb.max(-1) > 0.1, 'star': (R_ > 0.1) & (B_ < 0.6 * R_)}[key]


def splat(sel, uvf, num_px, den_px, TW, TH):
    u = uvf[..., 0][sel] % 1.0; v = uvf[..., 1][sel]
    num = np.zeros((TH, TW, 3)); den = np.zeros((TH, TW, 3)); cnt = np.zeros((TH, TW))
    tx = u * TW - 0.5; ty = (1 - v) * TH - 0.5
    x0 = np.floor(tx).astype(int); y0 = np.floor(ty).astype(int); fx = tx - x0; fy = ty - y0
    for dx, dy, w in [(0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)]:
        xi = (x0 + dx) % TW; yi = np.clip(y0 + dy, 0, TH - 1)
        np.add.at(num, (yi, xi), num_px * w[:, None]); np.add.at(den, (yi, xi), den_px * w[:, None]); np.add.at(cnt, (yi, xi), w)
    return num, den, cnt


def feather_weight(seen, F, wrap):
    """1 deep inside the (closed) seen area, smooth to 0 at its border over F texels; u wraps for wrapping parts"""
    TH, TW = seen.shape
    q = TW // 4 if wrap else 0
    pad = np.concatenate([seen[:, TW - q:], seen, seen[:, :q]], 1) if wrap else seen
    pad = ndi.binary_fill_holes(ndi.binary_closing(pad, np.ones((5, 5)), border_value=0))
    # holes inside the seen area (foam-rejected / unsplatted texels) take the push-pull 08 fill, not islands of benny05
    dist = ndi.distance_transform_edt(pad)[:, q:q + TW]
    sc = pad[:, q:q + TW]
    t = np.clip(dist / F, 0, 1)
    return t * t * (3 - 2 * t), sc


def main():
    run, out = sys.argv[1], sys.argv[2]
    F = float(sys.argv[sys.argv.index('--feather') + 1]) if '--feather' in sys.argv else 8.0
    FP = {'body': 3.0}  # body: 3x wider feather (the 08/05 tone step fades over ~24 texels = 2.3 % of the way round)
    only = sys.argv[sys.argv.index('--parts') + 1].split(',') if '--parts' in sys.argv else None
    base = sys.argv[sys.argv.index('--base') + 1] if '--base' in sys.argv else 'assets/textures/benny05'
    os.makedirs(out, exist_ok=True)
    P, a8, m = approved_parts()
    uvf = load_uv(f'{run}/uv.f32')
    ids = game_ids(uvf)
    Lt = inv_chain(a8 / 255.0)
    E, S, ncal = fit_es(run)
    El = (E * LUM).sum(-1)
    valid = (El > 0.03) & (ncal >= 2)
    okc = colour_ok(a8)
    report = dict(run=run, feather=F, base=base)
    body_ratio = None
    for pid, (name, key, TW, TH) in PARTS.items():
        if only and name not in only:
            continue
        lit = El > 0.45 * np.median(El[(ids == pid) & valid]) if ((ids == pid) & valid).any() else valid
        sel = (ids == pid) & ndi.binary_erosion(P[key], iterations=1) & ndi.binary_erosion(ids == pid, iterations=1) & valid & lit & okc[key]
        num, den, cnt = splat(sel, uvf, (Lt - S)[sel], E[sel], TW, TH)
        seen = cnt > 0.25
        alb = np.where(seen[..., None], num / np.maximum(den, 1e-6), 0)
        fam = family(key, alb)
        rejected = int((seen & ~fam).sum())
        seen &= fam
        cntc = np.where(seen, np.clip(cnt, 0, 1), 0)
        filled = push_pull(alb * cntc[..., None], cntc)
        wrap = name in ('body', 'crown', 'brim', 'pom')
        w, sc = feather_weight(seen, F * FP.get(name, 1.0), wrap)
        b05 = s2l(img(f'{base}/{name}.png'))
        if b05.shape[:2] != (TH, TW):
            raise SystemExit(f'{name}: benny05 map is {b05.shape[:2]}, expected {(TH, TW)}')
        inner = (w > 0.99) & seen
        ratio = (np.median(alb[inner], 0) / np.maximum(np.median(b05[inner], 0), 1e-4)) if inner.sum() > 50 else None
        if name in ('armL', 'armR') and body_ratio is not None:
            ratio = body_ratio  # the arm nubs are body fur: one fur tone (their own few seen texels are edge-biased)
        if name == 'body':
            body_ratio = ratio
        fill = b05 * np.clip(ratio, 0.6, 1.4)[None, None, :] if ('--toned' in sys.argv and ratio is not None) else b05
        comp = w[..., None] * filled + (1 - w[..., None]) * fill
        clipped = float((comp > 1).any(-1).mean())
        stored = np.clip(comp, 0, 1)
        Image.fromarray((l2s(stored) * 255 + 0.5).astype(np.uint8)).save(f'{out}/{name}.png')
        Image.fromarray((seen * 255).astype(np.uint8)).save(f'{out}/{name}_seen.png')
        Image.fromarray((w * 255 + 0.5).astype(np.uint8)).save(f'{out}/{name}_weight.png')
        report[name] = dict(px=int(sel.sum()), seen_texels=int(seen.sum()), rejected_texels=rejected,
                            weight_gt_0=int((w > 0).sum()), weight_1=int((w > 0.99).sum()), share_of_map_from_08=round(float(w.mean()), 4),
                            clipped_share=round(clipped, 5),
                            median_albedo_08=[round(float(x), 3) for x in np.median(alb[seen], 0)] if seen.any() else None,
                            median_albedo_05_same_texels=[round(float(x), 3) for x in np.median(b05[seen], 0)] if seen.any() else None,
                            ratio_08_over_05=[round(float(x), 3) for x in ratio] if ratio is not None else None,
                            unseen_fill='benny05 x ratio' if ('--toned' in sys.argv and ratio is not None) else 'benny05')
    json.dump(report, open(f'{out}/bake_report.json', 'w'), indent=1)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
