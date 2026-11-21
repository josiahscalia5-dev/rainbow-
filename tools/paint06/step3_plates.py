"""paint06 step 3: full-screen plates for the five Screen 06 keyframes (k0 = the approved Screen 06 picture, k1..k4 = the
user's four storyboard panels). Each panel keeps its OWN pixels inside its registered window; only what lies outside the
panel (the phone frame is taller than a panel) + the HUD boxes (k0) + Benny's spot are painted by fal flux-pro fill, so a
Benny layer (the panel's own Benny pixels) can move when the player steers.
usage: python3 -I step3_plates.py prep|fill|up|comp <k...>"""
import json, sys
from concurrent.futures import ThreadPoolExecutor
import cv2, numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/rainbow-/tools/paint06')
R = '/home/user/rainbow-'; W = f'{R}/qa/match/06/paint06/work'
FW, FH = 864, 1536            # game frame
MX, MY = 144, 192             # plate margin (frame px) for pull-back + steering pan
PW, PH = FW + 2 * MX, FH + 2 * MY   # 1152 x 1920 (frame px), aspect 0.6 = flux fill's own output size at F
F = 0.75                      # fill scale -> 864 x 1440 (flux-pro fill returns this size; no aspect change)
S = 1.25                      # final plate scale -> 1440 x 2400 (phone frame = 1080 x 1920 inside it)
REG = json.load(open(f'{W}/register.json'))
HUD_BOXES = [(26, 8, 840, 110), (124, 108, 742, 190)]   # painted HUD bar + stage banner on the approved picture (frame px)
RING = ((418, 1162), (300, 94))                           # waterline splash ring around Benny (frame px): centre, radii

def benny_alpha(scale=1.0, ring=True, dil=0):
    """Benny (BiRefNet matte of the approved picture) + splash-ring ellipse, frame coords * scale, float 0..1"""
    h, w = int(round(FH * scale)), int(round(FW * scale))
    m = np.asarray(Image.open(f'{W}/benny_matte_raw.png'))[..., 3].astype(np.float32) / 255
    full = np.zeros((FH, FW), np.float32); full[680:680 + m.shape[0], 120:120 + m.shape[1]] = m
    if dil: full = cv2.dilate(full, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * dil + 1, 2 * dil + 1)))
    if ring:
        e = np.zeros((FH, FW), np.float32)
        cv2.ellipse(e, RING[0], RING[1], 0, 0, 360, 1.0, -1)
        e = cv2.GaussianBlur(e, (0, 0), 14)
        full = np.maximum(full, e)
    return cv2.resize(full, (w, h), interpolation=cv2.INTER_LINEAR)

def window(k, scale, src_scale=1.0, src=None):
    """warp keyframe k's own picture into plate coords at `scale`: returns rgb (float), coverage alpha"""
    pw, ph = int(round(PW * scale)), int(round(PH * scale))
    if k == 0:
        img = np.asarray(Image.open(src or f'{R}/references/06_crest_the_rinse_arch.png').convert('RGB')).astype(np.float32)
        A = np.array([[scale / src_scale, 0, MX * scale], [0, scale / src_scale, MY * scale]], np.float32)
    else:
        img = np.asarray(Image.open(src or f'{W}/panel{k}.png').convert('RGB')).astype(np.float32)
        if src:  # upscaled panel: resample to exactly 4x the panel size first
            w0, h0 = REG[str(k)]['size']; img = cv2.resize(img, (w0 * 4, h0 * 4), interpolation=cv2.INTER_AREA)
        M = np.array(REG[str(k)]['M'], np.float32)
        A = M.copy(); A[:, :2] /= src_scale; A *= scale; A[0, 2] += MX * scale; A[1, 2] += MY * scale
    rgb = cv2.warpAffine(img, A, (pw, ph), flags=cv2.INTER_CUBIC if scale / src_scale < 1.01 else cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)
    cov = cv2.warpAffine(np.ones(img.shape[:2], np.float32), A, (pw, ph), flags=cv2.INTER_LINEAR, borderValue=0)
    return rgb, cov

def prep(k):
    rgb, cov = window(k, F)
    ph, pw = rgb.shape[:2]
    inside = cov > 0.999
    inside = cv2.erode(inside.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    mask = ~inside
    if k == 0:
        for x0, y0, x1, y1 in HUD_BOXES: mask[int((MY + y0) * F):int((MY + y1) * F), int((MX + x0) * F):int((MX + x1) * F)] = True
    b = np.zeros((ph, pw), np.float32); ba = benny_alpha(F, ring=True, dil=12)
    b[int(MY * F):int(MY * F) + ba.shape[0], int(MX * F):int(MX * F) + ba.shape[1]] = ba
    benny_mask = b > 0.12
    # context for the masked area: the surrounding picture smeared in (OpenCV inpaint at 1/4 size) — water stays water,
    # no pink/violet Benny blob left for the model to turn into a character
    q = 4
    small = cv2.resize(rgb, (pw // q, ph // q), interpolation=cv2.INTER_AREA).clip(0, 255).astype(np.uint8)
    msmall = cv2.dilate(cv2.resize(mask.astype(np.uint8), (pw // q, ph // q), interpolation=cv2.INTER_NEAREST), np.ones((3, 3), np.uint8))
    ip = cv2.inpaint(small, msmall, 9, cv2.INPAINT_TELEA)
    ip = cv2.GaussianBlur(cv2.resize(ip, (pw, ph), interpolation=cv2.INTER_CUBIC).astype(np.float32), (0, 0), 6)
    ctx = rgb.copy(); ctx[mask] = ip[mask]
    Image.fromarray(ctx.clip(0, 255).astype(np.uint8)).save(f'{W}/k{k}_ctx.png')
    Image.fromarray((mask * 255).astype(np.uint8)).save(f'{W}/k{k}_mask.png')
    Image.fromarray((benny_mask * 255).astype(np.uint8)).save(f'{W}/k{k}_bmask.png')
    print(k, 'mask frac', round(mask.mean(), 3), (pw, ph))

PROMPT = ("Seamless continuation of the same picture. Inside a giant glossy purple perforated washing-machine drum tunnel: "
          "rows of small rounded slots in shiny violet-magenta metal, broad polished copper-gold ring bands arching overhead with "
          "bright white highlight bars. A glowing turquoise, magenta and rainbow water slide with white sparkling light veins and "
          "soft white-lavender foam bubble clusters along its edges, a few iridescent soap bubbles. Vivid neon glossy cartoon 3D "
          "render, same lighting and colours. The slide water is empty: only flowing water, ripples, sparkles, foam and bubbles. "
          "No people, no characters, no animals, no objects floating on the water, no text, no UI, no logos.")

def fill(k):
    from fal import run, data_uri, download
    r = run('fal-ai/flux-pro/v1/fill', {'image_url': data_uri(f'{W}/k{k}_ctx.png'), 'mask_url': data_uri(f'{W}/k{k}_mask.png'),
            'prompt': PROMPT, 'output_format': 'png', 'safety_tolerance': '5', 'seed': 606 + k}, name=f'k{k}_fill', est_usd=0.05)
    download(r['images'][0]['url'], f'{W}/k{k}_fill.png'); print(k, 'fill', Image.open(f'{W}/k{k}_fill.png').size)

def erase(k):
    from fal import run, data_uri, download
    r = run('fal-ai/bria/eraser', {'image_url': data_uri(f'{W}/k{k}_fill.png'), 'mask_url': data_uri(f'{W}/k{k}_bmask.png'), 'mask_type': 'manual'},
            name=f'k{k}_erase', est_usd=0.04)
    download(r['image']['url'], f'{W}/k{k}_clean.png'); print(k, 'erase', Image.open(f'{W}/k{k}_clean.png').size)

def up(k):
    from fal import run, data_uri, download
    r = run('fal-ai/seedvr/upscale/image', {'image_url': data_uri(f'{W}/k{k}_clean.png'), 'upscale_factor': 2}, name=f'k{k}_clean_up2', est_usd=0.1)
    download(r['image']['url'], f'{W}/k{k}_fill_up2.png'); print(k, 'up', Image.open(f'{W}/k{k}_fill_up2.png').size)

def comp(k):
    pw, ph = int(PW * S), int(PH * S)
    base = np.asarray(Image.open(f'{W}/k{k}_fill_up2.png').convert('RGB').resize((pw, ph), Image.LANCZOS)).astype(np.float32)
    if k == 0: rgb, cov = window(0, S, src_scale=2.0, src=f'{W}/appr06_seedvr2.png')
    else: rgb, cov = window(k, S, src_scale=4.0, src=f'{W}/panel{k}_seedvr4.png')
    a = (cov > 0.999).astype(np.float32)
    a = cv2.erode(a, np.ones((7, 7), np.uint8)); a = cv2.GaussianBlur(a, (0, 0), 3) * a
    if k == 0:
        for x0, y0, x1, y1 in HUD_BOXES:
            hb = np.zeros_like(a); hb[int((MY + y0) * S):int((MY + y1) * S), int((MX + x0) * S):int((MX + x1) * S)] = 1
            a = np.minimum(a, 1 - cv2.GaussianBlur(hb, (0, 0), 4))
    plate_a = a.copy()
    b = np.zeros_like(a); fy, fx = int(MY * S), int(MX * S)
    ba = benny_alpha(S, ring=True, dil=0); b[fy:fy + ba.shape[0], fx:fx + ba.shape[1]] = ba
    plate_a = np.minimum(plate_a, 1 - b)
    plate = base * (1 - plate_a[..., None]) + rgb * plate_a[..., None]
    Image.fromarray(plate.clip(0, 255).astype(np.uint8)).save(f'{W}/k{k}_plate.png')
    # Benny layer = this keyframe's OWN pixels where Benny + his splash ring are (moves with steering)
    lay = np.dstack([rgb, (b * a * 255)]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(b > 0.004); x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(lay[y0:y1, x0:x1], 'RGBA').save(f'{W}/k{k}_benny.png')
    json.dump({'bbox_plate_px': [int(x0), int(y0), int(x1), int(y1)], 'plate_size': [pw, ph], 'scale': S, 'margin_frame_px': [MX, MY]},
              open(f'{W}/k{k}_benny.json', 'w'))
    # check: the rest frame (plate + Benny layer) cropped to the phone frame
    full = plate * (1 - b[..., None] * a[..., None]) + rgb * (b[..., None] * a[..., None])
    Image.fromarray(full[fy:fy + int(FH * S), fx:fx + int(FW * S)].clip(0, 255).astype(np.uint8)).save(f'{W}/k{k}_rest_frame.png')
    print(k, 'comp ok')

if __name__ == '__main__':
    step, ks = sys.argv[1], [int(x) for x in sys.argv[2:]]
    fn = {'prep': prep, 'fill': fill, 'erase': erase, 'up': up, 'comp': comp}[step]
    with ThreadPoolExecutor(5) as ex:
        for f in [ex.submit(fn, k) for k in ks]:
            try: f.result()
            except Exception as e: print('ERR', str(e)[:400])
