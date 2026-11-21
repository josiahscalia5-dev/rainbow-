"""S4 (round 34) — reusable visual likeness + defect checker for a frame-stepped run (any screen: reference + mask are parameters).
python3 -I qa_visual.py --frames <dir with f_NNNN.jpg> --ref <approved.png> --out <dir> [--log run_log.json] [--mask mask.png] [--hud 125]
                         [--frames-list 0,15,...] [--evidence <dir for selected full-size frames>]
Improved from tools/marble05/viewer/visual_check.py + tools/kit05/compare_r33.py (stricter, never looser).
* The approved picture is scaled to the frame height and centre-cropped (the game keeps the approved VERTICAL field of view).
* SCENERY MASK = below the HUD (--hud rows), inside the optional --mask (white = scenery), minus Benny's on-screen box per frame
  (from the run log: qa_play 'box' = his projected mesh, else a box around his anchor scaled by camera distance) and his splash band.
* LIKENESS per frame vs the approved picture: share of scenery pixels within 20 / 40 levels (max over RGB), mean abs diff, SSIM
  (grey, Gaussian 1.5), colour-look correlation (hue/saturation histogram), sharpness ratio (mean |Laplacian|, whole + 3 bands),
  composition (1/8 size within 20). Frame 0 = the approved camera (pixel-exact counterpart); later frames = the same painted view
  re-rendered while swimming (the kit keeps the painting's perspective from every camera position), so the same measures apply.
* DEFECTS, with the "intentional dark" mask derived from the APPROVED picture itself (its own dark pixels, max RGB < 60, dilated
  6 px): a dark area counts only if it is NOT dark in the approved picture there (the user's rule: "make sure the visual checker
  doesn't mistake intentional dark areas in my approved artwork for errors"):
    dark patch   connected max-RGB < 32 area >= 60 px (approved: largest 8 px), < 60 % inside the intentional-dark mask
    gap          clear-colour (scene background 0x120418 +-10) area >= 40 px = geometry hole (approved: largest 4 px)
    tear         thin elongated dark / clear-colour line (>= 25 px, aspect >= 6, width <= 3 px) outside the intentional mask
    blur         sharpness < 0.6 x approved, or < 0.5 x frame 0 (the old rule), or a band < 0.45 x approved
    stretch      share of 24 px tiles whose gradient coherence is >= 0.75 and >= 0.35 above the approved tile (a smeared texture) > 4 %
    flicker      global one-frame pop > max(3 x median, 4) (old rule) OR >= 2 local 16 px blocks where >= 50 % of pixels go up-down
                 (or down-up) by > 30 levels within one frame and the block pop >= 20
    freeze       scenery change between consecutive gameplay frames < 0.4 levels
    jump         frame-to-frame change > 3 x median and > 25 levels (old rule V5)
    look drop    within-20 share > 12 points below its +-15-frame running median
* SELF-TEST (written into the output): the detectors run on the approved picture (must find nothing) and on synthetic defects
  (black square, clear-colour crack, 4x stretch, blur, one-frame flash) which they must find.
Writes <out>/visual.json (summary + per frame) and, with --evidence, selected full-size frames (APPROVED + frames, separate files)."""
import sys, os, json, glob, argparse, shutil, numpy as np, cv2
ap = argparse.ArgumentParser()
ap.add_argument('--frames', required=True); ap.add_argument('--ref', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--log'); ap.add_argument('--mask'); ap.add_argument('--hud', type=int, default=125); ap.add_argument('--frames-list')
ap.add_argument('--evidence'); ap.add_argument('--period', type=float, default=0, help='frames per repeat of the scenery (ring period); 0 = none') ap.add_argument('--bg', default='18,4,24', help='scene clear colour R,G,B')
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
files = sorted(glob.glob(os.path.join(a.frames, 'f_*.jpg')))
if a.frames_list: keep = {int(x) for x in a.frames_list.split(',')}; files = [f for f in files if int(os.path.basename(f)[2:6]) in keep]
idx = [int(os.path.basename(f)[2:6]) for f in files]
F0 = cv2.imread(files[0]); H, W = F0.shape[:2]
R0 = cv2.imread(a.ref); rw = round(R0.shape[1] * H / R0.shape[0]); REF = cv2.resize(R0, (rw, H), interpolation=cv2.INTER_AREA)[:, (rw - W) // 2:(rw - W) // 2 + W]
BASE = np.zeros((H, W), bool); BASE[a.hud:] = True
if a.mask: BASE &= cv2.resize(cv2.imread(a.mask, 0), (W, H), interpolation=cv2.INTER_NEAREST) > 127
BG = np.array([int(x) for x in a.bg.split(',')][::-1])   # BGR
INT_DARK = cv2.dilate((REF.max(2) < 60).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13))) > 0
LOG = {}; SWIPES = []
if a.log and os.path.exists(a.log):
    for x in json.load(open(a.log)):
        if 'i' in x: LOG[x['i']] = x
        elif 'swipe' in x: SWIPES.append(x)
D0 = None
for x in LOG.values():
    if x.get('benny'): D0 = D0 or x['benny']['dist']
def benny_box(i):
    """Benny's screen box + splash band (excluded from the scenery): projected mesh box if logged, else anchor model (calibrated r34:
    relative to his anchor at the start distance: x -158..+101, y -269..+39 px; scaled by start distance / distance)."""
    x = LOG.get(i)
    if not x: return None
    b = x.get('box'); bi = x.get('benny')
    if b: x0, y0, x1, y1 = b
    elif bi: k = (D0 or bi['dist']) / bi['dist']; x0, y0, x1, y1 = bi['x'] - 170 * k, bi['y'] - 285 * k, bi['x'] + 115 * k, bi['y'] + 45 * k
    else: return None
    return [int(max(0, x0 - 20)), int(max(0, y0 - 20)), int(min(W, x1 + 20)), int(min(H, y1 + 60))]
def mask_for(i, extra_boxes=()):
    m = BASE.copy()
    for bx in [benny_box(i), *extra_boxes]:
        if bx: m[bx[1]:bx[3], bx[0]:bx[2]] = False
    return m
gray = lambda im: cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
def ssim_map(x, y):
    k = lambda z: cv2.GaussianBlur(z, (0, 0), 1.5); a1, b1 = gray(x), gray(y); ma, mb = k(a1), k(b1)
    va, vb, cab = k(a1 * a1) - ma ** 2, k(b1 * b1) - mb ** 2, k(a1 * b1) - ma * mb; C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    return ((2 * ma * mb + C1) * (2 * cab + C2)) / ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))
def hs_corr(x, y, m):
    def h(z): hsv = cv2.cvtColor(z, cv2.COLOR_BGR2HSV); hh = cv2.calcHist([hsv], [0, 1], m.astype(np.uint8), [36, 16], [0, 180, 0, 256]); return cv2.normalize(hh, hh).flatten()
    return float(cv2.compareHist(h(x), h(y), cv2.HISTCMP_CORREL))
LAPR = np.abs(cv2.Laplacian(gray(REF), cv2.CV_32F))
def sharp(im, m): return float(np.abs(cv2.Laplacian(gray(im), cv2.CV_32F))[m].mean())
BANDS = [(a.hud, a.hud + (H - a.hud) // 3), (a.hud + (H - a.hud) // 3, a.hud + 2 * (H - a.hud) // 3), (a.hud + 2 * (H - a.hud) // 3, H)]
TS = 24
def coherence(im):
    g = cv2.GaussianBlur(gray(im), (0, 0), 0.8); gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    ny, nx = H // TS, W // TS
    Jxx = (gx * gx)[:ny * TS, :nx * TS].reshape(ny, TS, nx, TS).mean((1, 3))
    Jyy = (gy * gy)[:ny * TS, :nx * TS].reshape(ny, TS, nx, TS).mean((1, 3)); Jxy = (gx * gy)[:ny * TS, :nx * TS].reshape(ny, TS, nx, TS).mean((1, 3))
    tr = Jxx + Jyy; det = np.sqrt((Jxx - Jyy) ** 2 + 4 * Jxy ** 2); c = det / np.maximum(tr, 1e-6); e = np.sqrt(tr)
    return c, e
COH_R, _ = coherence(REF)
def tile_ok(m): ny, nx = H // TS, W // TS; return m[:ny * TS, :nx * TS].reshape(ny, TS, nx, TS).mean((1, 3)) >= 0.8
def comps(mask, min_area):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8); out = []
    for k in range(1, n):
        if st[k, 4] >= min_area: out.append((k, st[k], lab))
    return out
def defects(im, m):
    """dark patches / gaps / tears / stretch on one frame (scenery mask m)"""
    mx = im.max(2); res = {}
    dk = []
    for k, s, lab in comps((mx < 32) & m, 60):
        inside = float(INT_DARK[lab == k].mean());
        if inside < 0.6: dk.append({'area': int(s[4]), 'box': [int(s[0]), int(s[1]), int(s[0] + s[2]), int(s[1] + s[3])], 'in_intentional': round(inside, 2)})
    res['dark'] = dk
    bgm = (np.abs(im.astype(int) - BG).max(2) <= 10) & m
    res['gap'] = [{'area': int(s[4]), 'box': [int(s[0]), int(s[1]), int(s[0] + s[2]), int(s[1] + s[3])]} for k, s, lab in comps(bgm, 40)]
    tears = []
    for k, s, lab in comps(((mx < 40) | bgm) & m & ~INT_DARK, 25):
        pts = np.column_stack(np.where(lab == k)).astype(np.float32); (cx, cy), (w1, h1), ang = cv2.minAreaRect(pts)
        lo, hi = min(w1, h1), max(w1, h1)
        if hi >= 6 * max(lo, 1) and lo <= 3: tears.append({'area': int(s[4]), 'len': round(hi, 1), 'box': [int(s[0]), int(s[1]), int(s[0] + s[2]), int(s[1] + s[3])]})
    res['tear'] = tears
    c, e = coherence(im); ok = tile_ok(m); fl = ok & (c >= 0.75) & (c - COH_R >= 0.35) & (e >= 3)
    res['stretch_share'] = round(float(fl.sum() / max(1, ok.sum())), 4); res['stretch_tiles'] = int(fl.sum())
    return res
def flicker_blocks(A, B, C, m):
    s1 = B.astype(np.int16) - A.astype(np.int16); s2 = C.astype(np.int16) - B.astype(np.int16)
    alt = ((s1 * s2) < 0) & (np.minimum(np.abs(s1), np.abs(s2)) > 30); alt = alt.any(2)
    pop = np.abs(B.astype(np.float32) - (A.astype(np.float32) + C.astype(np.float32)) / 2).mean(2)
    bs = 16; ny, nx = H // bs, W // bs
    sh = lambda z: z[:ny * bs, :nx * bs].reshape(ny, bs, nx, bs).mean((1, 3))
    okb = sh(m.astype(np.float32)) >= 0.95
    blk = okb & (sh(alt.astype(np.float32)) >= 0.5) & (sh(pop) >= 20)
    return int(blk.sum()), [[int(x * bs), int(y * bs)] for y, x in zip(*np.where(blk))][:6], float(pop[m].mean())
# ---------------- self-test of the detectors (they must find nothing on the approved picture and find every synthetic defect) ----------------
def selftest():
    m = BASE.copy(); T = {}
    d = defects(REF, m); T['approved_clean'] = {'pass': not d['dark'] and not d['gap'] and not d['tear'] and d['stretch_share'] <= 0.04, 'value': {k: (len(v) if isinstance(v, list) else v) for k, v in d.items()}}
    x = REF.copy(); x[700:722, 180:202] = 0; d = defects(x, m); T['finds_black_square_22px'] = {'pass': len(d['dark']) >= 1, 'value': len(d['dark'])}
    x = REF.copy(); x[300:302, 60:110] = BG; d = defects(x, m); T['finds_clear_colour_crack'] = {'pass': len(d['tear']) + len(d['gap']) >= 1, 'value': [len(d['tear']), len(d['gap'])]}
    x = REF.copy(); y0, x0 = 560, 300; x[y0:y0 + 144, x0:x0 + 96] = cv2.resize(REF[y0:y0 + 144, x0:x0 + 24], (96, 144), interpolation=cv2.INTER_LINEAR)
    d = defects(x, m); T['finds_4x_stretch'] = {'pass': d['stretch_tiles'] >= 4, 'value': d['stretch_tiles']}
    x = cv2.GaussianBlur(REF, (0, 0), 2.0); T['finds_blur_sigma2'] = {'pass': sharp(x, m) / sharp(REF, m) < 0.6, 'value': round(sharp(x, m) / sharp(REF, m), 3)}
    x = REF.copy(); x[600:664, 300:364] = np.clip(x[600:664, 300:364].astype(int) + 70, 0, 255).astype(np.uint8)
    nb, _, _ = flicker_blocks(REF, x, REF, m); T['finds_one_frame_flash_64px'] = {'pass': nb >= 2, 'value': nb}
    d = defects(REF, m); T['intentional_dark_not_counted'] = {'pass': not d['dark'], 'value': {'approved_dark_px_under_60': int((REF.max(2) < 60).sum()), 'counted': len(d['dark'])}}
    return T
ST = selftest()
# ---------------- per frame ----------------
rows = []; prev = None; m_prev = None; imgs = {}
sharp_ref_full = sharp(REF, BASE)
for n, f in enumerate(files):
    i = idx[n]; im = cv2.imread(f); m = mask_for(i); x = LOG.get(i, {}); endK = x.get('endK') or 0
    dmax = np.abs(im.astype(np.int16) - REF.astype(np.int16)).max(2)
    r = {'i': i, 'endK': round(endK, 3), 'mask_px': int(m.sum()),
         'within20': round(float((dmax[m] <= 20).mean()), 4), 'within40': round(float((dmax[m] <= 40).mean()), 4),
         'mad': round(float(np.abs(im.astype(np.int16) - REF.astype(np.int16)).mean(2)[m].mean()), 2),
         'ssim': round(float(ssim_map(im, REF)[m].mean()), 4), 'colour': round(hs_corr(im, REF, m), 4),
         'sharp': round(sharp(im, m) / float(LAPR[m].mean()), 4)}
    r['sharp_bands'] = [round(sharp(im, m & (np.arange(H)[:, None] >= y0) & (np.arange(H)[:, None] < y1)) / max(1e-6, float(LAPR[m & (np.arange(H)[:, None] >= y0) & (np.arange(H)[:, None] < y1)].mean())), 3) for y0, y1 in BANDS]
    r['within20_bands'] = [round(float((dmax[m & (np.arange(H)[:, None] >= y0) & (np.arange(H)[:, None] < y1)] <= 20).mean()), 3) for y0, y1 in BANDS]
    # coarse layout: mean colour of 6 x 12 cells (scenery pixels only) within 25 levels of the approved cell (what reads at a glance)
    cy = np.linspace(a.hud, H, 13).astype(int); cx = np.linspace(0, W, 7).astype(int); okc = tot = 0
    for yy in range(12):
        for xx in range(6):
            mm = m[cy[yy]:cy[yy + 1], cx[xx]:cx[xx + 1]]
            if mm.mean() < 0.5: continue
            tot += 1; okc += int(np.abs(im[cy[yy]:cy[yy + 1], cx[xx]:cx[xx + 1]][mm].mean(0) - REF[cy[yy]:cy[yy + 1], cx[xx]:cx[xx + 1]][mm].mean(0)).max() <= 25)
    r['layout_cells_within25'] = round(okc / max(1, tot), 3)
    f8 = cv2.resize(im[a.hud:], (52, 96), interpolation=cv2.INTER_AREA).astype(np.int16); a8 = cv2.resize(REF[a.hud:], (52, 96), interpolation=cv2.INTER_AREA).astype(np.int16)
    r['comp8_within20'] = round(float((np.abs(f8 - a8).max(2) <= 20).mean()), 4)
    d = defects(im, m); r.update({'dark': d['dark'], 'gap': d['gap'], 'tear': d['tear'], 'stretch_share': d['stretch_share']})
    if prev is not None and idx[n - 1] == i - 1:
        mm = m & m_prev; r['change'] = round(float(np.abs(im.astype(np.int16) - prev.astype(np.int16)).mean(2)[mm].mean()), 3)
    rows.append(r); imgs[i] = f; prev = im; m_prev = m
    if n % 50 == 0: print('visual', n, '/', len(files), r['within20'], r['ssim'], r['colour'], flush=True)
# flicker (needs consecutive triples)
byi = {r['i']: r for r in rows}
for n in range(1, len(files) - 1):
    i = idx[n]
    if idx[n - 1] != i - 1 or idx[n + 1] != i + 1: continue
    A, B, C = (cv2.imread(files[k]) for k in (n - 1, n, n + 1)); m = mask_for(i - 1) & mask_for(i) & mask_for(i + 1)
    nb, where, pop = flicker_blocks(A, B, C, m); byi[i]['flicker_blocks'] = nb; byi[i]['pop'] = round(pop, 3)
    if nb: byi[i]['flicker_at'] = where
# ---------------- summary ----------------
play = [r for r in rows if r['endK'] <= 0.05]; trans = [r for r in rows if r['endK'] > 0.05]
def stat(key, rs=play):
    v = np.array([r[key] for r in rs if key in r]);
    if not len(v): return None
    worst = rs[int(np.argmin([r.get(key, 9e9) for r in rs]))]['i']
    return {'min': round(float(v.min()), 4), 'p10': round(float(np.percentile(v, 10)), 4), 'median': round(float(np.median(v)), 4), 'max': round(float(v.max()), 4), 'worst_frame': worst}
pops = np.array([r['pop'] for r in rows if 'pop' in r]) if any('pop' in r for r in rows) else np.array([0.0]); pop_lim = max(3 * float(np.median(pops)), 4.0)
chg = np.array([r['change'] for r in play if 'change' in r]) if any('change' in r for r in play) else np.array([1.0])
w20 = np.array([r['within20'] for r in rows]); drops = []
for k, r in enumerate(rows):
    lo, hi = max(0, k - 15), min(len(rows), k + 16); med = float(np.median(w20[lo:hi]))
    if r['endK'] <= 0.05 and med - r['within20'] > 0.12: drops.append(r['i'])
f0 = rows[0] if idx[0] == 0 else None
sharp0 = f0['sharp'] if f0 else None
blur = [r['i'] for r in play if r['sharp'] < 0.6 or (sharp0 and r['sharp'] < 0.5 * sharp0) or min(r['sharp_bands']) < 0.45]
summary = {
    'frames': len(rows), 'gameplay_frames': len(play), 'transition_frames': len(trans), 'consecutive': idx == list(range(idx[0], idx[0] + len(idx))),
    'reference': os.path.abspath(a.ref), 'frame_size': [W, H], 'hud_rows': a.hud,
    'selftest': ST, 'selftest_pass': all(t['pass'] for t in ST.values()),
    'frame0': {k: f0[k] for k in ('within20', 'within20_bands', 'within40', 'mad', 'ssim', 'colour', 'sharp', 'sharp_bands', 'comp8_within20', 'layout_cells_within25')} if f0 else None,
    'bands': [list(b) for b in BANDS],
    'likeness': {k: stat(k) for k in ('within20', 'within40', 'ssim', 'colour', 'sharp', 'comp8_within20', 'layout_cells_within25')} | {'mad': {'median': round(float(np.median([r['mad'] for r in play])), 2), 'max': round(float(max(r['mad'] for r in play)), 2)}},
    'defects': {
        'dark_frames': [r['i'] for r in rows if r['dark']], 'dark_largest_px': max([d['area'] for r in rows for d in r['dark']] or [0]),
        'gap_frames': [r['i'] for r in rows if r['gap']], 'tear_frames': [r['i'] for r in rows if r['tear']],
        'stretch_frames': [r['i'] for r in play if r['stretch_share'] > 0.04], 'stretch_share_max': max([r['stretch_share'] for r in play] or [0]),
        'blur_frames': blur, 'local_flicker_frames': [r['i'] for r in rows if r.get('flicker_blocks', 0) >= 2],
        'pop_spike_frames': [r['i'] for r in rows if r.get('pop', 0) > pop_lim], 'pop_median': round(float(np.median(pops)), 3), 'pop_max': round(float(pops.max()), 3),
        'freeze_frames': [r['i'] for r in play if 'change' in r and r['change'] < 0.4], 'change_median': round(float(np.median(chg)), 3), 'change_max': round(float(chg.max()), 3),
        'jump_frames': [r['i'] for r in play if 'change' in r and r['change'] > 3 * float(np.median(chg)) and r['change'] > 25], 'look_drop_frames': drops,
    },
}
# splash evidence: white water (min RGB >= 215) around Benny's anchor after each leap / dive vs just before (rendered frames only)
sp = []
for s in SWIPES:
    if s['swipe'] not in ('up', 'down'): continue
    i0 = int(round(s['t'] * 30)); b = (LOG.get(i0) or {}).get('benny')
    if not b: continue
    def white(k):
        if k not in imgs: return None
        im = cv2.imread(imgs[k]); x0, x1 = int(max(0, b['x'] - 130)), int(min(W, b['x'] + 130)); y0, y1 = int(max(0, b['y'] - 70)), int(min(H, b['y'] + 70))
        return int((im[y0:y1, x0:x1].min(2) >= 215).sum())
    pre = [white(k) for k in range(i0 - 4, i0)]; post = [white(k) for k in range(i0 + 2, i0 + 13)]
    pre = [v for v in pre if v is not None]; post = [v for v in post if v is not None]
    if pre and post: sp.append({'swipe': s['swipe'], 't': s['t'], 'white_before': int(np.mean(pre)), 'white_after_max': int(max(post)), 'ratio': round(max(post) / max(1, np.mean(pre)), 2)})
summary['splash_evidence'] = sp
# phase-aligned likeness: frames a whole number of scenery periods after the start (there the painted view should repeat exactly)
if a.period > 0:
    ph = []
    for k in range(1, 200):
        i = int(round(k * a.period)); r = byi.get(i)
        if r is None:
            if i > max(idx): break
            continue
        if r['endK'] > 0.05: break
        ph.append({'i': i, 'within20': r['within20'], 'within20_bands': r['within20_bands'], 'ssim': r['ssim'], 'colour': r['colour'], 'layout': r['layout_cells_within25']})
    summary['phase_aligned'] = {'period_frames': a.period, 'frames': ph, 'within20_median': round(float(np.median([p['within20'] for p in ph])), 4) if ph else None,
        'within20_min': min([p['within20'] for p in ph]) if ph else None, 'layout_median': round(float(np.median([p['layout'] for p in ph])), 3) if ph else None}
json.dump({'summary': summary, 'frames': rows}, open(os.path.join(a.out, 'visual.json'), 'w'), indent=0)
# ---------------- evidence: separate full-size images (approved + selected frames) ----------------
if a.evidence:
    os.makedirs(a.evidence, exist_ok=True); cv2.imwrite(os.path.join(a.evidence, 'APPROVED_412x915.png'), REF)
    sel = {0: 'start'} if 0 in imgs else {}
    for q in (0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88):
        k = play[min(len(play) - 1, int(q * len(play)))]['i'] if play else None
        if k is not None: sel.setdefault(k, f'level_{int(q * 100)}pct')
    if play:
        sel.setdefault(min(play, key=lambda r: r['within20'])['i'], 'worst_likeness')
        for key in ('dark_frames', 'gap_frames', 'tear_frames', 'local_flicker_frames', 'stretch_frames', 'blur_frames'):
            if summary['defects'][key]: sel.setdefault(summary['defects'][key][0], 'first_' + key[:-7])
    if trans: sel.setdefault(trans[-1]['i'], 'ending')
    for k, name in sorted(sel.items()):
        shutil.copy(imgs[k], os.path.join(a.evidence, f'f_{k:04d}_{name}.jpg'))
    summary['evidence_frames'] = {f'f_{k:04d}': name for k, name in sorted(sel.items())}
    json.dump({'summary': summary, 'frames': rows}, open(os.path.join(a.out, 'visual.json'), 'w'), indent=0)
print(json.dumps({k: summary.get(k) for k in ('frames', 'selftest_pass', 'frame0', 'likeness', 'phase_aligned', 'defects')}, indent=1)[:8000])
