"""Per-frame visual checks for the Screen 05 acceptance run (python3 -I visual_check.py <run dir> <approved.png>):
black patches (near-black pixels below the HUD), sharpness vs the first frame (variance of the Laplacian), flicker (frame-to-frame
change spikes), and a colour-look score vs the approved picture (hue/saturation histogram overlap; motion-independent).
Round 32 lead addition: 'pop' = mean |frame_i - (frame_i-1 + frame_i+1)/2| below the HUD = a change that appears for one frame and goes
away again (real flicker / popping), which smooth camera motion barely produces; spikes = pop > max(3 x median, 4 levels)."""
import sys, json, glob, numpy as np, cv2
d, ref = sys.argv[1:3]
files = sorted(glob.glob(f'{d}/f_*.jpg'))
R0 = cv2.imread(ref)
# the game keeps the approved picture's VERTICAL field of view, so a 412x915 portrait frame = the approved picture scaled to height 915
# and centre-cropped to width 412 (round 32 lead fix: it used to be squashed to 412x915, which distorts the comparison)
_w = round(R0.shape[1] * 915 / R0.shape[0]); R = cv2.resize(R0, (_w, 915), interpolation=cv2.INTER_AREA)[:, (_w - 412) // 2:(_w - 412) // 2 + 412]
def hs_hist(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)[150:]  # below the HUD
    h = cv2.calcHist([hsv], [0, 1], None, [36, 16], [0, 180, 0, 256]); return cv2.normalize(h, h, 1, 0, cv2.NORM_L1)
HR = hs_hist(R)
rows, prev, sharp0 = [], None, None
for f in files:
    im = cv2.imread(f); body = im[150:]
    g = cv2.cvtColor(body, cv2.COLOR_BGR2GRAY)
    # a dark PATCH = a connected near-black area >= 150 px at 412x915; the approved picture's own darkest spots (wall slots,
    # shadows) are <= 8 px there, so intentional dark details of the artwork are never counted
    m = (body.max(2) < 22).astype(np.uint8); nb, lab, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    areas = stats[1:, cv2.CC_STAT_AREA] if nb > 1 else np.array([0]); sc = (412 * 915) / (im.shape[0] * im.shape[1])
    big = areas[areas * sc >= 150]; black = float(big.sum() / m.size); nblob = int(len(big)); maxblob = int((areas.max() if len(areas) else 0) * sc)
    sharp = float(cv2.Laplacian(g, cv2.CV_64F).var()); sharp0 = sharp0 or sharp
    look = float(cv2.compareHist(HR, hs_hist(im), cv2.HISTCMP_INTERSECT))
    chg = float(np.abs(body.astype(np.int16) - prev).mean()) if prev is not None else 0.0
    prev = body.astype(np.int16)
    rows.append({'frame': f.split('_')[-1][:4], 'black_pct': round(100 * black, 3), 'dark_patches': nblob, 'largest_dark_px': maxblob, 'sharpness_vs_start': round(sharp / sharp0, 3), 'colour_look_vs_approved': round(look, 3), 'change': round(chg, 2)})
# frame 0 = the approved picture's camera: whole-frame likeness to the approved artwork (same crop), below the HUD (y >= 150) and all
frame0_likeness = None
if files:
    F0 = cv2.imread(files[0]).astype(np.int16); A0 = R.astype(np.int16)
    if F0.shape == A0.shape:
        dmax = np.abs(F0 - A0).max(2)
        frame0_likeness = {'within_20_levels_pct': round(100 * float((dmax <= 20).mean()), 1), 'within_20_below_hud_pct': round(100 * float((dmax[150:] <= 20).mean()), 1),
                           'within_40_below_hud_pct': round(100 * float((dmax[150:] <= 40).mean()), 1), 'mean_abs_diff_below_hud': round(float(np.abs(F0 - A0)[150:].mean()), 1)}
        # composition / colour layout at 1/8 size (52 x 114): what the eye sees at a glance, insensitive to 1-2 px texture shifts
        f8 = cv2.resize(F0.astype(np.uint8)[150:], (52, 96), interpolation=cv2.INTER_AREA).astype(np.int16)
        a8 = cv2.resize(A0.astype(np.uint8)[150:], (52, 96), interpolation=cv2.INTER_AREA).astype(np.int16)
        frame0_likeness['eighth_size_within_20_below_hud_pct'] = round(100 * float((np.abs(f8 - a8).max(2) <= 20).mean()), 1)
        frame0_likeness['eighth_size_within_40_below_hud_pct'] = round(100 * float((np.abs(f8 - a8).max(2) <= 40).mean()), 1)
chg = np.array([r['change'] for r in rows[1:]]) if len(rows) > 1 else np.array([0.0])
pops = []
if len(files) >= 3:
    A = B = None
    for k, f in enumerate(files):
        C = cv2.imread(f)[150:].astype(np.float32)
        if A is not None and B is not None:
            pv = float(np.abs(B - (A + C) / 2).mean()); pops.append(pv); rows[k - 1]['pop'] = round(pv, 2)
        A, B = B, C
pops = np.array(pops) if pops else np.array([0.0]); pop_lim = max(3 * float(np.median(pops)), 4.0)
res = {
    'frames': len(rows),
    'dark_patches': {'frames_with_patches': sum(r['dark_patches'] > 0 for r in rows), 'largest_px': max(r['largest_dark_px'] for r in rows), 'max_pct': max(r['black_pct'] for r in rows), 'rule': 'connected near-black area >= 150 px at 412x915 (approved picture: largest 8 px)'},
    'sharpness_vs_start': {'min': min(r['sharpness_vs_start'] for r in rows), 'median': float(np.median([r['sharpness_vs_start'] for r in rows]))},
    'colour_look_vs_approved': {'min': min(r['colour_look_vs_approved'] for r in rows), 'median': float(np.median([r['colour_look_vs_approved'] for r in rows]))},
    'flicker': {'median_change': float(np.median(chg)), 'max_change': float(chg.max()), 'spikes_over_3x_median': int((chg > 3 * max(1e-6, np.median(chg))).sum()),
                'spike_frames': [r['frame'] for r in rows[1:] if r['change'] > 3 * max(1e-6, np.median(chg))],
                'pop_median': float(np.median(pops)), 'pop_max': float(pops.max()), 'pop_spikes': int((pops > pop_lim).sum()),
                'pop_spike_frames': [r['frame'] for r in rows if r.get('pop', 0) > pop_lim]},
    'colour_look_frame0': rows[0]['colour_look_vs_approved'] if rows else None,
    'frame0_vs_approved': frame0_likeness,
}
json.dump({'summary': res, 'frames': rows}, open(f'{d}/visual_check.json', 'w'), indent=1); print(json.dumps(res, indent=1))
