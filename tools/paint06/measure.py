"""paint06: game capture vs the user's pictures. k0 vs references/06 (below the HUD strip = the live HUD covers the painted one);
k1..k4 vs the storyboard panel: (a) at the panel's own size (the game frame area-downscaled onto the panel), (b) in the game frame
(panel cubic-upscaled into its registered window). Pixels within 20 colour levels (max over RGB), the project's usual measure."""
import json, sys
import cv2, numpy as np
from PIL import Image
R = '/home/user/rainbow-'; W = f'{R}/qa/match/06/paint06/work'
shots = sys.argv[1]; fw_, fh_ = 864, 1536
reg = json.load(open(f'{W}/register.json'))
def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
out = {}
for k in range(5):
    try: g = load(f'{shots}/06p{k}.png')
    except FileNotFoundError: continue
    if g.shape[1] != fw_: g = cv2.resize(g, (fw_, fh_), interpolation=cv2.INTER_AREA)
    if k == 0:
        a = load(f'{R}/references/06_crest_the_rinse_arch.png'); e = np.abs(g - a).max(axis=2)
        out['k0'] = {'below_hud_pct': round(100 * float((e[195:] <= 20).mean()), 1), 'whole_frame_pct': round(100 * float((e <= 20).mean()), 1)}
        continue
    p = load(f'{W}/panel{k}.png'); h, w = p.shape[:2]
    M = np.array(reg[str(k)]['M'], np.float64); sc = np.hypot(M[0, 0], M[1, 0])
    small = cv2.resize(g, (int(round(fw_ / sc)), int(round(fh_ / sc))), interpolation=cv2.INTER_AREA)
    b = cv2.warpAffine(small, cv2.invertAffineTransform((M / sc).astype(np.float32)), (w, h), flags=cv2.INTER_CUBIC)
    e = np.abs(b - p).max(axis=2)[4:-4, 4:-4]
    up = cv2.warpAffine(p, M.astype(np.float32), (fw_, fh_), flags=cv2.INTER_CUBIC)
    cov = cv2.erode((cv2.warpAffine(np.ones((h, w), np.float32), M.astype(np.float32), (fw_, fh_)) > 0.999).astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
    e2 = np.abs(g - up).max(axis=2)[cov]
    out[f'k{k}'] = {'panel_size_pct': round(100 * float((e <= 20).mean()), 1), 'game_frame_window_pct': round(100 * float((e2 <= 20).mean()), 1),
                    'window_share_of_screen_pct': round(100 * float(cov.mean()))}
    em = (np.abs(b - p).max(axis=2) > 20).astype(np.uint8) * 255
    Image.fromarray(em).save(f'{shots}/err_k{k}.png')
print(json.dumps(out, indent=1)); json.dump(out, open(f'{shots}/metrics.json', 'w'), indent=1)
