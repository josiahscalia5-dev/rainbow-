"""Likeness of EVERY gameplay frame to the approved picture for that moment (not just the matched moments).
Screen 05 frames vs the approved Screen 05 picture (below the HUD strip); Screen 06 frames vs the picture shown at that moment
(approved 06 until panel 1 is revealed, then each storyboard panel inside its own window). Two numbers per frame:
  px20   = pixels within 20 colour levels (strict, pixel-exact),
  look20 = the same after a 2-px blur of both (tolerates sub-pixel shifts / flowing sparkles: 'looks the same')
usage: python3 -I frames_metric.py <clip json> [out json]"""
import json, sys
import cv2, numpy as np
from PIL import Image
R = '/home/user/rainbow-'
clip = json.load(open(sys.argv[1])); fdir = sys.argv[1].replace('clip_', 'frames_').replace('.json', '')
W_, H_ = clip['size']; sc = W_ / 864
reg = json.load(open(f'{R}/qa/match/06/paint06/work/register.json'))
def ref_full(p): return cv2.resize(np.asarray(Image.open(p).convert('RGB')), (W_, H_), interpolation=cv2.INTER_AREA).astype(np.float32)
T05 = ref_full(f'{R}/references/05_flow_into_the_current.png'); T06 = ref_full(f'{R}/references/06_crest_the_rinse_arch.png')
hud = int(195 * sc)
panels = {}
for k in range(1, 5):
    p = np.asarray(Image.open(f'{R}/qa/match/06/paint06/work/panel{k}.png').convert('RGB')).astype(np.float32)
    M = np.array(reg[str(k)]['M'], np.float32) * sc; M[:, 2] = np.array(reg[str(k)]['M'])[:, 2] * sc
    t = cv2.warpAffine(p, M, (W_, H_), flags=cv2.INTER_AREA if sc < 1.6 else cv2.INTER_CUBIC)
    cov = cv2.erode((cv2.warpAffine(np.ones(p.shape[:2], np.float32), M, (W_, H_)) > 0.999).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    panels[k] = (t, cov)
# when each Screen 06 picture is on screen (reveal centres, as in assets/textures/paint/paint.json): rest 06 = s0 + 10, 21, 32, 43, 53
s0_06 = 188.92; rest = [s0_06 + r for r in (10, 21, 32, 43, 53)]
cut = [rest[k - 1] + 0.62 * (rest[k] - rest[k - 1]) for k in range(1, 5)]
def target(s):
    if 117.2 <= s < 188.9: return '05', T05, None
    if 190.5 <= s < 247.0:
        k = sum(1 for c in cut if s >= c)
        if k == 0: return '06k0', T06, None
        return f'06k{k}', panels[k][0], panels[k][1]
    return None, None, None
rows = []
for f in clip['frames']:
    name, T, cov = target(f['s'])
    if name is None: continue
    img = np.asarray(Image.open(f"{fdir}/{f['i']:04d}.jpg").convert('RGB')).astype(np.float32)
    m = np.ones((H_, W_), bool); m[:hud] = False
    if cov is not None: m &= cov
    e = np.abs(img - T).max(axis=2)[m]
    eb = np.abs(cv2.GaussianBlur(img, (0, 0), 2) - cv2.GaussianBlur(T, (0, 0), 2)).max(axis=2)[m]
    rows.append({'i': f['i'], 's': f['s'], 'pic': name, 'px20': round(100 * float((e <= 20).mean()), 1), 'look20': round(100 * float((eb <= 20).mean()), 1)})
summ = {}
for name in sorted({r['pic'] for r in rows}):
    rr = [r for r in rows if r['pic'] == name]
    a = np.array([r['px20'] for r in rr]); b = np.array([r['look20'] for r in rr])
    summ[name] = {'frames': len(rr), 'px20_median': round(float(np.median(a)), 1), 'px20_min': round(float(a.min()), 1), 'look20_median': round(float(np.median(b)), 1), 'look20_min': round(float(b.min()), 1)}
out = sys.argv[2] if len(sys.argv) > 2 else sys.argv[1].replace('.json', '_metric.json')
json.dump({'summary': summ, 'frames': rows}, open(out, 'w'), indent=1)
print(json.dumps(summ, indent=1))
