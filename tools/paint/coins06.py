"""Screen 06 pictures for the `?paint=1` chain with live coins: in each of the five pictures (approved 06 + four panels) the three
nearest painted coins are erased from the background (bria eraser, then SeedVR + the panel's own pixels composited back exactly as in
paint06) and become the game's coins; the farther tiny coins stay painted. Writes assets/textures/paint/06k<k>_plate.jpg,
06k<k>_coin.png and work/coins06_sel.json (paint06's own assets are NOT touched).
usage: python3 -I coins06.py select|erase|up|comp"""
import json, sys
import cv2, numpy as np
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '/home/user/rainbow-/tools/paint06'); sys.path.insert(0, '/home/user/rainbow-/tools/paint06')
import step3_plates as P3
R = '/home/user/rainbow-'; W = f'{R}/qa/match/06/paint06/work'; O = f'{R}/assets/textures/paint'
S, MX, MY, FW, FH, F = P3.S, P3.MX, P3.MY, P3.FW, P3.FH, P3.F

def select():
    B = P3.benny_alpha(1.0, ring=True, dil=8) > 0.05
    out = {}
    for k in range(5):
        a = cv2.resize(np.asarray(Image.open(f'{W}/k{k}_rest_frame.png').convert('RGB')), (FW, FH), interpolation=cv2.INTER_AREA)
        hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV)
        yel = ((hsv[..., 0] >= 15) & (hsv[..., 0] <= 32) & (hsv[..., 1] > 110) & (hsv[..., 2] > 150)).astype(np.uint8)
        yel[:260] = 0; yel[B] = 0
        yel = cv2.morphologyEx(yel, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(yel, 8); cs = []
        for i in range(1, n):
            x, y, w, h, ar = st[i]
            if ar < 40 or ar / (w * h) < 0.5 or not (0.6 < w / h < 2.2): continue
            cs.append({'c': [float(x + w / 2), float(y + h / 2)], 'd': float(max(w, h * 1.05)), 'box': [int(x), int(y), int(w), int(h)]})
        cs.sort(key=lambda c: -c['d']); out[k] = cs[:3]
        print(k, [(round(c['c'][0]), round(c['c'][1]), round(c['d'])) for c in cs[:3]])
    json.dump(out, open(f'{W}/coins06_sel.json', 'w'), indent=1)

def cmask(k, scale):
    sel = json.load(open(f'{W}/coins06_sel.json'))[str(k)]
    m = np.zeros((int(round(FH * scale)), int(round(FW * scale))), np.float32)
    for c in sel:
        cv2.ellipse(m, (int(c['c'][0] * scale), int(c['c'][1] * scale)), (int((c['d'] * 0.56 + 4) * scale), int((c['d'] * 0.52 + 4) * scale)), 0, 0, 360, 1.0, -1)
    return m

def erase_one(k):
    from fal import run, data_uri, download
    em = np.asarray(Image.open(f'{W}/k{k}_emask.png')).astype(np.float32) / 255
    pw, ph = em.shape[1], em.shape[0]; fx, fy = int(MX * F), int(MY * F)
    cm = cmask(k, F); full = np.zeros_like(em); full[fy:fy + cm.shape[0], fx:fx + cm.shape[1]] = cm
    m2 = (np.maximum(em, full) > 0.3).astype(np.uint8) * 255
    Image.fromarray(m2).save(f'{W}/k{k}_emask_c.png')
    r = run('fal-ai/bria/eraser', {'image_url': data_uri(f'{W}/k{k}_fill.png'), 'mask_url': data_uri(f'{W}/k{k}_emask_c.png'), 'mask_type': 'manual'}, name=f'p06k{k}_erase_coins', est_usd=0.04)
    download(r['image']['url'], f'{W}/k{k}_clean_c.png')
    r = run('fal-ai/seedvr/upscale/image', {'image_url': data_uri(f'{W}/k{k}_clean_c.png'), 'upscale_factor': 2}, name=f'p06k{k}_clean_c_up2', est_usd=0.1)
    download(r['image']['url'], f'{W}/k{k}_clean_c_up2.png'); return k

def comp_one(k):
    pw, ph = int(P3.PW * S), int(P3.PH * S)
    base = np.asarray(Image.open(f'{W}/k{k}_clean_c_up2.png').convert('RGB').resize((pw, ph), Image.LANCZOS)).astype(np.float32)
    if k == 0: rgb, cov = P3.window(0, S, src_scale=2.0, src=f'{W}/appr06_seedvr2.png')
    else: rgb, cov = P3.window(k, S, src_scale=4.0, src=f'{W}/panel{k}_seedvr4.png')
    old = np.asarray(Image.open(f'{W}/k{k}_plate.png').convert('RGB')).astype(np.float32)   # paint06 plate (window + seam work done)
    fy, fx = int(MY * S), int(MX * S)
    cm = np.zeros((ph, pw), np.float32); c_ = cmask(k, S); cm[fy:fy + c_.shape[0], fx:fx + c_.shape[1]] = c_
    cm = cv2.GaussianBlur(cv2.dilate(cm, np.ones((5, 5), np.uint8)), (0, 0), 2.5)
    # the paint06 plate everywhere, except the collectible coins' spots -> the coin-free erased background there
    plate = old * (1 - cm[..., None]) + base * cm[..., None]
    Image.fromarray(plate.clip(0, 255).astype(np.uint8)).save(f'{O}/06k{k}_plate.jpg', quality=94, subsampling=0)
    # coin sprite = this picture's own biggest painted coin (its pixels, alpha from its yellow-and-rim mask)
    sel = json.load(open(f'{W}/coins06_sel.json'))[str(k)]; c = sel[0]; bx, by, bw, bh = c['box']; pad = 6
    x0, y0, x1, y1 = bx - pad, by - pad, bx + bw + pad, by + bh + pad
    crop = rgb[int((MY + y0) * S):int((MY + y1) * S), int((MX + x0) * S):int((MX + x1) * S)]
    a = cv2.resize(np.asarray(Image.open(f'{W}/k{k}_rest_frame.png').convert('RGB')), (FW, FH), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV)
    yel = ((hsv[..., 0] >= 12) & (hsv[..., 0] <= 34) & (hsv[..., 1] > 90) & (hsv[..., 2] > 120)).astype(np.uint8)
    yel = cv2.morphologyEx(yel, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))[y0:y1, x0:x1]
    n, lab, st, _ = cv2.connectedComponentsWithStats(yel, 8); big = 1 + np.argmax(st[1:, 4]); m = (lab == big).astype(np.float32)
    m = cv2.GaussianBlur(cv2.dilate(m, np.ones((3, 3), np.uint8)), (0, 0), 1.0)
    m = cv2.resize(m, (crop.shape[1], crop.shape[0]))
    Image.fromarray(np.dstack([crop, m * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(f'{O}/06k{k}_coin.png')
    json.dump({'sprite_box': [x0, y0, x1, y1], 'sprite_coin_d': c['d']}, open(f'{W}/k{k}_coin_sprite.json', 'w'))
    return k

if __name__ == '__main__':
    step = sys.argv[1]
    if step == 'select': select()
    else:
        fn = {'erase': erase_one, 'comp': comp_one}[step]
        with ThreadPoolExecutor(5) as ex:
            for f in [ex.submit(fn, k) for k in range(5)]:
                try: print(step, f.result(), 'ok')
                except Exception as e: print('ERR', str(e)[:300])
