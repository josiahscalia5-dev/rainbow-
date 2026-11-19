"""benny05 bake: approved Screen-05 pixels -> albedo maps in each Benny part's own UV space.
usage: python3 bake.py <run_dir>[,<run_dir2>...] <out_dir> [--normals]
  run dirs hold uv.f32 (first dir that has it) and calibration renders cal{D,E,A,C,B}.png (constant albedo k =
  0.05, 0.1, 0.2, 0.4, 0.6 on every baked part), all from the same deterministic locked frame.
Per pixel: L = inverse post chain (display -> linear scene radiance; exact port of PROJ05_INVERSE, bloom is off on 05),
radiance = albedo*E + S fitted per pixel and channel by least squares over the calibration renders in which the pixel
is NOT clipped (display 3..246 in every channel: one clipped channel corrupts the joint inverse of the others),
target albedo = (L_approved - S)/E.
Strict part correspondence: a texel of part P only takes approved pixels that the approved part masks call P (eroded 1 px)
and where the game shows P (UV pass id). Ratio of sums per texel, bilinear splat, push-pull hole fill, unseen texels by
mirror tiling of the well-seen central strip (knit / fur keeps its structure all around)."""
import sys, json, os
sys.path.insert(0, 'qa/pilot05/full_reference_match/benny'); sys.path.insert(0, 'qa/pilot05/full_reference_match/benny/work')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from parts import approved_parts
from geom import load_uv

KA, KB = 0.2, 0.6
CAL_K = {'calD': 0.05, 'calE': 0.1, 'calA': 0.2, 'calC': 0.4, 'calB': 0.6}
EXPO, SAT, CON, VIG = 0.86, 1.36, 1.15, 0.18
LUM = np.array([0.2126, 0.7152, 0.0722])

def inv_chain(t):
    """display sRGB (0..1, HxWx3, full 864x1536 frame) -> linear scene radiance"""
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

PARTS = {  # id: (name, approved part key, tex W, H, fill mode for texels the 05 camera never sees)
    1: ('body', 'body', 1024, 512, 'mirror'),
    2: ('crown', 'crown', 1024, 256, 'rings'),
    3: ('brim', 'cuff', 1024, 128, 'mirror'),
    4: ('pom', 'pom', 512, 256, 'mirror'),
    6: ('armL', 'body', 256, 128, None),
    7: ('armR', 'body', 256, 128, None),
}

def seen_strip(seen):
    """largest contiguous u run whose column coverage is >= 50 % of the best column (no wrap needed on Benny's back)"""
    c = ndi.uniform_filter1d(seen.mean(0), 9, mode='wrap')
    ok = c >= 0.5 * c.max()
    lab, k = ndi.label(ok)
    sz = ndi.sum(ok, lab, range(1, k + 1))
    cols = np.nonzero(lab == 1 + int(np.argmax(sz)))[0]
    return int(cols.min()), int(cols.max()) + 1

def mirror_idx(TW, u0, u1):
    Ls = u1 - u0
    k = (np.arange(TW) - u0) % (2 * Ls)
    return u0 + np.where(k < Ls, k, 2 * Ls - 1 - k)

def seen_weight(seen):
    cover = ndi.uniform_filter(seen.astype(float), size=(1, 9), mode='wrap')
    return ndi.uniform_filter(np.clip(cover * 1.6, 0, 1), size=(1, 25), mode='wrap')

def ring_shift(filled, seen, u0, u1):
    """per column u: row shift h(u) of the stripe pattern relative to the centre columns (purple-ness profile,
    normalised cross-correlation), robust quadratic fit; returns h over all TW columns (constant edge value
    continued linearly round the unseen arc) and the raw per-column estimates"""
    TH, TW = seen.shape
    p = (filled[..., 2] - filled[..., 1]) / (filled[..., 2] + filled[..., 1] + 1e-3)
    uc = (u0 + u1) // 2
    ref = p[:, uc - 6:uc + 7].mean(1); refm = seen[:, uc - 6:uc + 7].mean(1) > 0.5
    est = []
    for u in range(u0, u1, 4):
        col = p[:, max(u0, u - 2):u + 3].mean(1); cm = seen[:, max(u0, u - 2):u + 3].mean(1) > 0.5
        best, bs = -2, 0
        for s in range(-40, 41):
            a = np.roll(col, -s); am = np.roll(cm, -s) & refm
            if am.sum() < 40:
                continue
            x, y = a[am] - a[am].mean(), ref[am] - ref[am].mean()
            r = (x * y).sum() / (np.sqrt((x * x).sum() * (y * y).sum()) + 1e-9)
            if r > best:
                best, bs = r, s
        if best > 0.6:
            est.append((u, bs, best))
    est = np.array(est, float)
    x = (est[:, 0] - uc) / TW
    w = np.ones(len(x))
    for _ in range(4):  # iteratively re-weighted quadratic
        A = np.stack([np.ones_like(x), x, x * x], 1) * w[:, None]
        cf = np.linalg.lstsq(A, est[:, 1] * w, rcond=None)[0]
        res = est[:, 1] - (cf[0] + cf[1] * x + cf[2] * x * x)
        w = 1 / np.maximum(1, np.abs(res) / 3)
    uu = np.arange(TW)
    xx = (uu - uc) / TW
    h = np.clip(cf[0] + cf[1] * xx + cf[2] * xx * xx, -60, 60)
    # the fit holds over every column the camera sees at all (>5 % coverage), then runs on linearly round the unseen arc
    cov = ndi.uniform_filter1d(seen.mean(0), 9, mode='wrap') > 0.05
    e0, e1 = min(u0, int(np.nonzero(cov)[0].min())), max(u1, int(np.nonzero(cov)[0].max()) + 1)
    a0, a1 = h[e0], h[e1 - 1]
    span = (e0 + TW) - (e1 - 1)
    for u in list(range(e1, TW)) + list(range(0, e0)):
        t = ((u - (e1 - 1)) % TW) / span
        h[u] = a1 + (a0 - a1) * t
    return h, est, cf

def shift_rows(img3, h):
    """out[r, u] = img3[r + h[u], u] (bilinear in r, clamped)"""
    TH = img3.shape[0]
    rr = np.arange(TH)[:, None] + h[None, :]
    r0 = np.clip(np.floor(rr).astype(int), 0, TH - 1); r1 = np.clip(r0 + 1, 0, TH - 1); f = (rr - np.floor(rr))[..., None]
    cols = np.arange(img3.shape[1])[None, :]
    return img3[r0, cols] * (1 - f) + img3[r1, cols] * f

def push_pull(num, den):
    """fill den==0 texels from coarser levels (num: HxWxC, den: HxW); u wraps"""
    if min(den.shape) <= 2:
        tot = den.sum()
        v = num.sum((0, 1)) / max(tot, 1e-9)
        return np.broadcast_to(v, num.shape).copy(), np.ones_like(den)
    H, W = den.shape
    h2, w2 = (H + 1) // 2, (W + 1) // 2
    pn = np.zeros((h2 * 2, w2 * 2, num.shape[2])); pd = np.zeros((h2 * 2, w2 * 2))
    pn[:H, :W] = num; pd[:H, :W] = den
    cn = pn.reshape(h2, 2, w2, 2, -1).sum((1, 3)); cd = pd.reshape(h2, 2, w2, 2).sum((1, 3))
    fn, fd = push_pull(cn, cd)
    up_n = np.repeat(np.repeat(fn / np.maximum(fd, 1e-9)[..., None], 2, 0), 2, 1)[:H, :W]
    up_n = ndi.uniform_filter(up_n, size=(3, 3, 1), mode='wrap')
    w = np.clip(den / 1.0, 0, 1)[..., None]
    val = np.where(den[..., None] > 0, num / np.maximum(den, 1e-9)[..., None], 0)
    out = w * val + (1 - w) * up_n
    return out, np.ones_like(den)

def fit_es(runs):
    """least-squares E, S per pixel and channel over the unclipped calibration renders; returns E, S, n_used"""
    sk = sk2 = n = 0.0
    sl = skl = 0.0
    for k_name, k in CAL_K.items():
        p = next((f'{r}/{k_name}.png' for r in runs if os.path.exists(f'{r}/{k_name}.png')), None)
        if p is None:
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

def main():
    runs, out = sys.argv[1].split(','), sys.argv[2]
    os.makedirs(out, exist_ok=True)
    P, a8, m = approved_parts()
    ap = a8 / 255.0
    uvf = load_uv(next(f'{r}/uv.f32' for r in runs if os.path.exists(f'{r}/uv.f32')))
    ids = np.rint(uvf[..., 2]).astype(int); ids[np.abs(uvf[..., 2] - ids) > 0.01] = 0
    Lt = inv_chain(ap)
    E, S, ncal = fit_es(runs)
    valid = ((E * LUM).sum(-1) > 0.03) & (ncal >= 2)
    target = (Lt - S) / np.maximum(E, 1e-4)
    report = {}
    from bennyseg import rgb2hsv, colour_classes
    Hh, Ss, Vv = rgb2hsv(a8); cls = colour_classes(a8)
    okc = {'body': ((Hh > 280) | (Hh < 20)) & (Ss > 0.2), 'crown': np.isin(cls, [2, 3]), 'cuff': (Hh > 230) & (Hh < 300) & (Ss > 0.35),
           'pom': (Hh > 230) & (Hh < 320) & (Ss > 0.2)}
    star = (ids == 5) & ndi.binary_erosion(P['star'], iterations=1) & valid
    if star.sum():
        sa = np.median(target[star], 0)
        report['star_albedo_linear'] = [round(float(v), 3) for v in sa]
        report['star_px'] = int(star.sum())
    El = (E * LUM).sum(-1)
    for pid, (name, key, TW, TH, mode) in PARTS.items():
        # pixels where the part is lit < 45 % of its median are behind translucent water / spray in the game: skip
        lit = El > 0.45 * np.median(El[ids == pid]) if (ids == pid).any() else valid
        sel = (ids == pid) & ndi.binary_erosion(P[key], iterations=1) & ndi.binary_erosion(ids == pid, iterations=1) & valid & lit & okc[key]
        u = uvf[..., 0][sel] % 1.0; v = uvf[..., 1][sel]
        num_px = (Lt - S)[sel]; den_px = E[sel]
        num = np.zeros((TH, TW, 3)); den = np.zeros((TH, TW, 3)); cnt = np.zeros((TH, TW))
        tx = u * TW - 0.5; ty = (1 - v) * TH - 0.5
        x0 = np.floor(tx).astype(int); y0 = np.floor(ty).astype(int); fx = tx - x0; fy = ty - y0
        for dx, dy, w in [(0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)]:
            xi = (x0 + dx) % TW; yi = np.clip(y0 + dy, 0, TH - 1)
            np.add.at(num, (yi, xi), num_px * w[:, None]); np.add.at(den, (yi, xi), den_px * w[:, None]); np.add.at(cnt, (yi, xi), w)
        seen = cnt > 0.25
        alb = np.where(seen[..., None], num / np.maximum(den, 1e-6), 0)
        # colour family check per texel (approved foam / spray over the fur, mixed edge pixels): such texels are
        # treated as unseen and filled from their neighbours, so the fur never carries grey-green blotches in motion
        R_, G_, B_ = alb[..., 0], alb[..., 1], alb[..., 2]
        fam = {'body': (G_ < 0.62 * R_) & (R_ > 0.12), 'pom': (G_ < 0.55 * B_) & (B_ > 0.08),
               'cuff': (G_ < 0.6 * B_), 'crown': alb.max(-1) > 0.1}[key]
        rejected = int((seen & ~fam).sum())
        seen &= fam
        alb = np.where(seen[..., None], alb, 0)
        cnt = np.where(seen, cnt, 0)
        # push-pull fill (per-texel albedo, weight = coverage)
        filled, _ = push_pull(alb * np.clip(cnt, 0, 1)[..., None], np.clip(cnt, 0, 1))
        extra = {}
        if mode is not None:
            u0, u1 = seen_strip(seen)
            wseen = seen_weight(seen)[..., None]
            if mode == 'mirror':
                # unseen texels: mirror-tile the well-seen strip around (knit ribs / fur tufts continue)
                tiled = filled[:, mirror_idx(TW, u0, u1)]
            else:
                # 'rings': the approved stripes sag at his back (illustration bulge, measured per column); straighten
                # them (rectify by h(u)), mirror-tile the straight bands, then re-apply h, which runs on as level
                # rings round the unseen arc -> no zig-zag stripes when the beanie turns away from the 05 camera
                h, est, cf = ring_shift(filled, seen, u0, u1)
                rect = shift_rows(filled, np.where((np.arange(TW) >= u0) & (np.arange(TW) < u1), h, 0.0))
                rect_t = rect[:, mirror_idx(TW, u0, u1)]
                tiled = shift_rows(rect_t, -h)
                extra = dict(ring_fit_rows=[round(float(c), 2) for c in cf], ring_h_rows=dict(
                    u0=round(float(h[u0]), 1), centre=round(float(h[(u0 + u1) // 2]), 1), u1=round(float(h[u1 - 1]), 1)),
                    ring_est_cols=len(est))
            filled = wseen * filled + (1 - wseen) * tiled
            extra['strip_u'] = [round(u0 / TW, 3), round(u1 / TW, 3)]
        scale = float(max(1.0, np.percentile(filled, 99.7)))
        stored = np.clip(filled / scale, 0, 1)
        srgb = np.where(stored <= 0.0031308, stored * 12.92, 1.055 * stored ** (1 / 2.4) - 0.055)
        Image.fromarray((srgb * 255 + 0.5).astype(np.uint8)).save(f'{out}/{name}.png')
        Image.fromarray((seen * 255).astype(np.uint8)).save(f'{out}/{name}_seen.png')
        report[name] = dict(px=int(sel.sum()), seen_texels=int(seen.sum()), rejected_texels=rejected, scale=round(scale, 3),
                            median_albedo=[round(float(x), 3) for x in np.median(alb[seen], 0)], **extra)
        if name in ('crown', 'brim') and '--normals' in sys.argv:
            # stitch relief from RELATIVE luminance (lum / local mean): the stripe colour steps do not become ridges
            lum = (srgb * LUM).sum(-1)
            rel = lum / np.maximum(ndi.gaussian_filter(lum, (2.5, 2.5), mode='wrap'), 1e-3) - 1
            hp = np.clip(rel, -0.35, 0.35)
            hh = ndi.gaussian_filter(hp, 0.6, mode='wrap')
            # u wraps; d/du, d/dv in texels
            dx = (np.roll(hh, -1, 1) - np.roll(hh, 1, 1)) * 0.5
            dy = (np.vstack([hh[1:], hh[-1:]]) - np.vstack([hh[:1], hh[:-1]])) * 0.5
            st = 6.0
            n = np.stack([-dx * st, dy * st, np.ones_like(hh)], -1)
            n /= np.linalg.norm(n, axis=-1, keepdims=True)
            Image.fromarray(((n * 0.5 + 0.5) * 255 + 0.5).astype(np.uint8)).save(f'{out}/{name}_n.png')
    # feet: tiny map with the body's mean albedo
    json.dump(report, open(f'{out}/bake_report.json', 'w'), indent=1)
    print(json.dumps(report, indent=1))

if __name__ == '__main__':
    main()
