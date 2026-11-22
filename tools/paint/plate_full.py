"""Approved-artwork plate for a full-frame approved screen (05, 07, 04, 08, 09, 10): the approved picture IS the 864x1536
phone frame. Produces (work dir qa/match/<id>/paint<id>/work):
  plate: the approved pixels (SeedVR x2 detail, back-projected so its downscale equals the approved picture) with the painted
         HUD, Benny (+ his splash) and the painted coins taken out (fal flux-pro fill for the margins/HUD, bria eraser for the rest),
         margins continued around the frame for the gentle push / steering pan; depth map (Depth Anything v2).
  benny layer: the approved Benny's own pixels (+ splash) with alpha; coin sprite: the biggest painted coin with alpha;
  coins.json: every painted coin's centre and diameter (frame px).
usage: python3 -I plate_full.py <id> <step> where step = masks|fill|erase|up|depth|comp|all"""
import json, os, sys
from concurrent.futures import ThreadPoolExecutor
import cv2, numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/rainbow-/tools/paint06')
R = '/home/user/rainbow-'
FW, FH, MX, MY = 864, 1536, 144, 192
PW, PH = FW + 2 * MX, FH + 2 * MY          # 1152 x 1920 frame px
F, S = 0.75, 1.25                          # fill scale (864x1440), final plate scale (1440x2400)
HUD = [(20, 6, 846, 112), (96, 104, 770, 194)]
CFG = {
    '05': {'ref': 'references/05_flow_into_the_current.png', 'benny_crop': (130, 680, 730, 1262), 'splash': ((421, 1175), (285, 120)),
           'coin_zone': (300, 440, 700, 800)},
}
sid = sys.argv[1]; C = CFG[sid]
W = f'{R}/qa/match/{sid}/paint{sid}/work'; os.makedirs(W, exist_ok=True)
REF = f'{R}/{C["ref"]}'

def load(p): return np.asarray(Image.open(p).convert('RGB')).astype(np.float32)

def masks():
    from fal import run, data_uri, download
    a = np.asarray(Image.open(REF).convert('RGB'))
    x0, y0, x1, y1 = C['benny_crop']
    Image.fromarray(a[y0:y1, x0:x1]).save(f'{W}/benny_crop.png')
    r = run('fal-ai/birefnet/v2', {'image_url': data_uri(f'{W}/benny_crop.png'), 'model': 'General Use (Heavy)', 'output_format': 'png'}, name=f'p{sid}_benny_matte', est_usd=0.01)
    download(r['image']['url'], f'{W}/benny_matte_crop.png')
    m = np.asarray(Image.open(f'{W}/benny_matte_crop.png').convert('RGBA'))[..., 3].astype(np.float32) / 255
    A = np.zeros((FH, FW), np.float32); A[y0:y1, x0:x1] = m
    sp = np.zeros((FH, FW), np.float32); cv2.ellipse(sp, C['splash'][0], C['splash'][1], 0, 0, 360, 1.0, -1); sp = cv2.GaussianBlur(sp, (0, 0), 12)
    sp[:C['splash'][0][1] - C['splash'][1][1] // 2] = 0
    sp = cv2.GaussianBlur(sp, (0, 0), 6)
    B = np.maximum(A, sp)
    np.save(f'{W}/benny_alpha.npy', B)
    # painted coins: compact saturated-yellow blobs on the river (the hat star excluded by its own matte)
    hsv = cv2.cvtColor(a, cv2.COLOR_RGB2HSV)
    yel = ((hsv[..., 0] >= 15) & (hsv[..., 0] <= 32) & (hsv[..., 1] > 110) & (hsv[..., 2] > 150)).astype(np.uint8)
    zx0, zy0, zx1, zy1 = C['coin_zone']; z = np.zeros_like(yel); z[zy0:zy1, zx0:zx1] = 1; yel &= z; yel[A > 0.3] = 0
    yel = cv2.morphologyEx(yel, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(yel, 8)
    coins = []; cm = np.zeros((FH, FW), np.uint8)
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        if ar < 12 or ar / (w * h) < 0.45: continue
        coins.append({'c': [float(x + w / 2), float(y + h / 2)], 'd': float(max(w, h * 1.05)), 'box': [int(x), int(y), int(w), int(h)]})
        cm[lab == i] = 1
    coins.sort(key=lambda c: -c['d'])
    cmask = cv2.dilate(cm, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    np.save(f'{W}/coin_mask.npy', cmask)
    json.dump(coins, open(f'{W}/coins.json', 'w'), indent=1)
    print(sid, 'coins', [(round(c['c'][0]), round(c['c'][1]), round(c['d'])) for c in coins])

def fill():
    from fal import run, data_uri, download
    a = load(REF); pw, ph = int(PW * F), int(PH * F)
    canvas = np.zeros((ph, pw, 3), np.float32); fx, fy = int(MX * F), int(MY * F)
    small = cv2.resize(a, (int(FW * F), int(FH * F)), interpolation=cv2.INTER_AREA); canvas[fy:fy + small.shape[0], fx:fx + small.shape[1]] = small
    mask = np.ones((ph, pw), bool); mask[fy + 2:fy + small.shape[0] - 2, fx + 2:fx + small.shape[1] - 2] = False
    for x0, y0, x1, y1 in HUD: mask[int((MY + y0) * F):int((MY + y1) * F), int((MX + x0) * F):int((MX + x1) * F)] = True
    q = 4; sm = cv2.resize(canvas, (pw // q, ph // q), interpolation=cv2.INTER_AREA).clip(0, 255).astype(np.uint8)
    ms = cv2.dilate(cv2.resize(mask.astype(np.uint8), (pw // q, ph // q), interpolation=cv2.INTER_NEAREST), np.ones((3, 3), np.uint8))
    ip = cv2.GaussianBlur(cv2.resize(cv2.inpaint(sm, ms, 9, cv2.INPAINT_TELEA), (pw, ph), interpolation=cv2.INTER_CUBIC).astype(np.float32), (0, 0), 6)
    ctx = canvas.copy(); ctx[mask] = ip[mask]
    Image.fromarray(ctx.clip(0, 255).astype(np.uint8)).save(f'{W}/ctx.png'); Image.fromarray((mask * 255).astype(np.uint8)).save(f'{W}/mask.png')
    prompt = ("Seamless continuation of the same picture. Inside a giant glossy purple perforated washing-machine drum tunnel with rows of small "
              "rounded slots in shiny violet-magenta metal and broad polished copper-gold ring bands with bright highlights. A glowing turquoise, "
              "magenta and rainbow water river with white sparkle streaks, soft white-lavender foam bubble clusters along its banks, a few "
              "iridescent soap bubbles. Vivid neon glossy cartoon 3D render, same lighting and colours. No people, no characters, no animals, "
              "no coins, no text, no UI, no logos.")
    r = run('fal-ai/flux-pro/v1/fill', {'image_url': data_uri(f'{W}/ctx.png'), 'mask_url': data_uri(f'{W}/mask.png'), 'prompt': prompt,
            'output_format': 'png', 'safety_tolerance': '5', 'seed': 505}, name=f'p{sid}_fill', est_usd=0.05)
    download(r['images'][0]['url'], f'{W}/fill.png'); print(sid, 'fill', Image.open(f'{W}/fill.png').size)

def erase():
    from fal import run, data_uri, download
    pw, ph = int(PW * F), int(PH * F); fx, fy = int(MX * F), int(MY * F)
    B = np.load(f'{W}/benny_alpha.npy'); cm = np.load(f'{W}/coin_mask.npy').astype(np.float32)
    em = np.zeros((ph, pw), np.float32)
    full = np.maximum(cv2.dilate((B > 0.1).astype(np.float32), np.ones((15, 15), np.uint8)), cm)
    em[fy:fy + int(FH * F), fx:fx + int(FW * F)] = cv2.resize(full, (int(FW * F), int(FH * F)), interpolation=cv2.INTER_LINEAR)
    # invented coins in the continued margins too (compact yellow blobs outside the frame)
    im = cv2.imread(f'{W}/fill.png'); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    yel = ((hsv[..., 0] >= 17) & (hsv[..., 0] <= 34) & (hsv[..., 1] > 110) & (hsv[..., 2] > 150)).astype(np.uint8)
    outside = np.asarray(Image.open(f'{W}/mask.png')) > 127
    n, lab, st, _ = cv2.connectedComponentsWithStats(yel, 8)
    for i in range(1, n):
        x, y, w, h, ar = st[i]
        if ar >= 120 and outside[lab == i].mean() > 0.6 and ar / (w * h) > 0.45 and 0.25 < w / h < 4: em[lab == i] = 1
    em = (cv2.dilate((em > 0.3).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) * 255).astype(np.uint8)
    Image.fromarray(em).save(f'{W}/emask.png')
    r = run('fal-ai/bria/eraser', {'image_url': data_uri(f'{W}/fill.png'), 'mask_url': data_uri(f'{W}/emask.png'), 'mask_type': 'manual'}, name=f'p{sid}_erase', est_usd=0.04)
    download(r['image']['url'], f'{W}/clean.png'); print(sid, 'erase ok')

def up():
    from fal import run, data_uri, download
    jobs = [('fal-ai/seedvr/upscale/image', {'image_url': data_uri(f'{W}/clean.png'), 'upscale_factor': 2}, 'clean_up2.png', f'p{sid}_clean_up2'),
            ('fal-ai/seedvr/upscale/image', {'image_url': data_uri(REF), 'upscale_factor': 2}, 'appr_up2.png', f'p{sid}_appr_up2'),
            ('fal-ai/image-preprocessors/depth-anything/v2', {'image_url': data_uri(f'{W}/clean.png')}, 'depth_raw.png', f'p{sid}_depth')]
    def go(j):
        ep, body, out, nm = j; r = run(ep, body, name=nm, est_usd=0.1)
        img = r.get('image') or r.get('images', [{}])[0]; download(img['url'], f'{W}/{out}'); return out
    with ThreadPoolExecutor(3) as ex:
        for f in [ex.submit(go, j) for j in jobs]: print(sid, 'got', f.result())

def comp():
    pw, ph = int(PW * S), int(PH * S); fx, fy = int(MX * S), int(MY * S); fw, fh = int(FW * S), int(FH * S)
    base = np.asarray(Image.open(f'{W}/clean_up2.png').convert('RGB').resize((pw, ph), Image.LANCZOS)).astype(np.float32)
    orig = load(REF)
    U = cv2.resize(load(f'{W}/appr_up2.png'), (fw, fh), interpolation=cv2.INTER_AREA); X = U.copy()
    for _ in range(4):
        d = cv2.resize(X, (FW, FH), interpolation=cv2.INTER_AREA); X = X + cv2.resize(orig - d, (fw, fh), interpolation=cv2.INTER_CUBIC)
    X = X.clip(0, 255)
    rgb = base.copy(); rgb[fy:fy + fh, fx:fx + fw] = X
    win = np.zeros((ph, pw), np.float32); win[fy + 3:fy + fh - 3, fx + 3:fx + fw - 3] = 1; win = cv2.GaussianBlur(win, (0, 0), 2) * (win > 0)
    hole = np.zeros((FH, FW), np.float32)
    for x0, y0, x1, y1 in HUD: hole[y0:y1, x0:x1] = 1
    B = np.load(f'{W}/benny_alpha.npy'); cm = np.load(f'{W}/coin_mask.npy').astype(np.float32)
    hole = np.maximum(hole, np.maximum(cv2.dilate((B > 0.05).astype(np.float32), np.ones((9, 9), np.uint8)), cm))
    hole = cv2.GaussianBlur(cv2.resize(hole, (fw, fh), interpolation=cv2.INTER_LINEAR), (0, 0), 3)
    keep = win.copy(); keep[fy:fy + fh, fx:fx + fw] *= (1 - hole).clip(0, 1)
    plate = base * (1 - keep[..., None]) + rgb * keep[..., None]
    Image.fromarray(plate.clip(0, 255).astype(np.uint8)).save(f'{W}/plate.png')
    # Benny layer = the approved Benny's own pixels (+ splash), alpha
    Bs = cv2.resize(B, (fw, fh), interpolation=cv2.INTER_LINEAR)
    ys, xs = np.where(Bs > 0.004); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    lay = np.dstack([X[y0:y1, x0:x1], Bs[y0:y1, x0:x1] * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(lay, 'RGBA').save(f'{W}/benny.png')
    # coin sprite = the biggest painted coin with a soft alpha from its yellow mask
    coins = json.load(open(f'{W}/coins.json')); c = coins[0]; bx, by, bw, bh = c['box']
    pad = 6; cx0, cy0, cx1, cy1 = bx - pad, by - pad, bx + bw + pad, by + bh + pad
    crop = X[int(cy0 * S):int(cy1 * S), int(cx0 * S):int(cx1 * S)]
    cmk = cv2.resize(cv2.dilate(np.load(f'{W}/coin_mask.npy'), np.ones((3, 3), np.uint8)).astype(np.float32)[cy0:cy1, cx0:cx1], (crop.shape[1], crop.shape[0]))
    cmk = cv2.GaussianBlur(cmk, (0, 0), 1.2)
    Image.fromarray(np.dstack([crop, cmk * 255]).clip(0, 255).astype(np.uint8), 'RGBA').save(f'{W}/coin.png')
    # rest frame check (plate + Benny) cropped to the phone frame
    full = plate.copy(); bl = np.zeros((ph, pw), np.float32); bl[fy:fy + fh, fx:fx + fw] = Bs
    full = full * (1 - bl[..., None]) + rgb * bl[..., None]
    Image.fromarray(full[fy:fy + fh, fx:fx + fw].clip(0, 255).astype(np.uint8)).save(f'{W}/rest_frame_nocoins.png')
    json.dump({'benny_frame_px': [x0 / S, y0 / S, x1 / S, y1 / S], 'coin_sprite_frame_px': [cx0, cy0, cx1, cy1]}, open(f'{W}/layers.json', 'w'))
    print(sid, 'comp ok')

if __name__ == '__main__':
    steps = sys.argv[2:] if sys.argv[2] != 'all' else ['masks', 'fill', 'erase', 'up', 'comp']
    for s_ in steps: {'masks': masks, 'fill': fill, 'erase': erase, 'up': up, 'comp': comp}[s_]()
