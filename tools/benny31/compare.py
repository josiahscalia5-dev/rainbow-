"""APPROVED | CURRENT 3D | IMPROVED 3D at the same rear angle and size, in the same Screen 06 scene.
Each 3D render (RGBA from render.mjs) is aligned to the approved Benny (fit.align), composited onto the approved picture with
Benny erased (paint06 k0 plate), cut at the approved waterline with a soft edge; the approved splash ring is laid over all
three alike. Metrics inside the approved Benny's box (above the waterline): silhouette IoU, pixels within 20 levels, SSIM.
usage: python3 -I compare.py <out_prefix> <label>=<render.png> [...]"""
import json, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/home/user/rainbow-/tools/benny31')
from fit import align, warp, A, Ab, FW, FH, WL
R = '/home/user/rainbow-'
appr = np.asarray(Image.open(f'{R}/references/06_crest_the_rinse_arch.png').convert('RGB')).astype(np.float32)
plate = np.asarray(Image.open(f'{R}/qa/match/06/paint06/work/k0_plate.png').convert('RGB')).astype(np.float32)
S, MX, MY = 1.25, 144, 192
bg = cv2.resize(plate[int(MY * S):int((MY + FH) * S), int(MX * S):int((MX + FW) * S)], (FW, FH), interpolation=cv2.INTER_AREA)
# approved splash ring (ellipse minus Benny), laid over every version alike
ring = np.zeros((FH, FW), np.float32); cv2.ellipse(ring, (418, 1162), (300, 94), 0, 0, 360, 1.0, -1)
ring = cv2.GaussianBlur(ring, (0, 0), 10) * (1 - cv2.dilate(A, np.ones((5, 5), np.uint8)))
ring[:1150] *= np.linspace(0, 1, 1150)[:, None] ** 8
ys, xs = np.where(Ab); BOX = (xs.min() - 12, ys.min() - 12, xs.max() + 12, WL)
def ssim(a, b):
    a = a.astype(np.float32); b = b.astype(np.float32); C1, C2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    mu_a = cv2.GaussianBlur(a, (0, 0), 1.5); mu_b = cv2.GaussianBlur(b, (0, 0), 1.5)
    saa = cv2.GaussianBlur(a * a, (0, 0), 1.5) - mu_a ** 2; sbb = cv2.GaussianBlur(b * b, (0, 0), 1.5) - mu_b ** 2
    sab = cv2.GaussianBlur(a * b, (0, 0), 1.5) - mu_a * mu_b
    m = ((2 * mu_a * mu_b + C1) * (2 * sab + C2)) / ((mu_a ** 2 + mu_b ** 2 + C1) * (saa + sbb + C2))
    return float(m.mean())

def composite(path):
    im = np.asarray(Image.open(path).convert('RGBA')).astype(np.float32)
    al = im[..., 3] / 255; s, dx, dy = align(al)
    import os
    pb = path.replace('.png', '_black.png')
    pre = np.asarray(Image.open(pb).convert('RGB')).astype(np.float32) if os.path.exists(pb) else im[..., :3] * al[..., None]
    rgb = warp(pre, s, dx, dy); a = warp(al, s, dx, dy)
    cut = np.clip((WL + 4 - np.arange(FH)) / 8.0, 0, 1)[:, None]      # water covers him below the waterline
    a = a * cut; rgb = rgb * cut[..., None]
    out = bg * (1 - a[..., None]) + rgb
    out = out * (1 - ring[..., None]) + appr * ring[..., None]
    return out, a

def metrics(img, a):
    x0, y0, x1, y1 = BOX
    e = np.abs(img - appr).max(axis=2)[y0:y1, x0:x1]
    B = (a > 0.5)[:WL]; iou = (B & Ab[:WL]).sum() / max(1, (B | Ab[:WL]).sum())
    g1 = cv2.cvtColor(img[y0:y1, x0:x1].astype(np.uint8), cv2.COLOR_RGB2GRAY); g2 = cv2.cvtColor(appr[y0:y1, x0:x1].astype(np.uint8), cv2.COLOR_RGB2GRAY)
    return {'silhouette_iou': round(float(iou), 3), 'box_within20_pct': round(100 * float((e <= 20).mean()), 1), 'box_ssim': round(float(ssim(g1, g2)), 3)}

if __name__ == '__main__':
    out = sys.argv[1]; items = [a.split('=', 1) for a in sys.argv[2:]]
    try: F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20)
    except Exception: F = f2 = ImageFont.load_default()
    x0, y0, x1, y1 = BOX; pad = 70
    cx0, cy0, cx1, cy1 = max(0, x0 - pad), max(0, y0 - pad), min(FW, x1 + pad), min(FH, y1 + 110)
    panels = [('APPROVED (your Screen 06 Benny)', appr, {'silhouette_iou': 1.0, 'box_within20_pct': 100.0, 'box_ssim': 1.0})]
    allm = {}
    for label, p in items:
        img, a = composite(p); m = metrics(img, a); allm[label] = m; panels.append((label, img, m))
    pw = cx1 - cx0; ph = cy1 - cy0
    sheet = Image.new('RGB', (len(panels) * (pw + 16), ph + 110), 'white'); d = ImageDraw.Draw(sheet)
    for i, (label, img, m) in enumerate(panels):
        sheet.paste(Image.fromarray(img[cy0:cy1, cx0:cx1].clip(0, 255).astype(np.uint8)), (i * (pw + 16), 110))
        d.text((i * (pw + 16) + 6, 8), label, fill=(40, 0, 70), font=F)
        d.text((i * (pw + 16) + 6, 46), f"outline {m['silhouette_iou']:.3f}  ·  structure {m['box_ssim']:.3f}", fill=(80, 50, 100), font=f2)
        d.text((i * (pw + 16) + 6, 74), f"pixels within 20 levels {m['box_within20_pct']}%", fill=(80, 50, 100), font=f2)
        Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(f'{out}_{i}_full.png')
    sheet.save(f'{out}.jpg', quality=93)
    json.dump(allm, open(f'{out}.json', 'w'), indent=1); print(json.dumps(allm, indent=1))
