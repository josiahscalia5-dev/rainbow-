"""Fit a Benny model's rear view to the approved Screen 06 Benny: for each render, scale/translate so its top (pom-pom)
and its width above the approved waterline match the approved Benny, then silhouette IoU above the waterline.
usage: python3 -I fit.py <render_dir>  -> prints the best poses, writes <render_dir>/fit.json"""
import json, sys, glob, os, re
import numpy as np, cv2
from PIL import Image
R = '/home/user/rainbow-'
FW, FH, WL = 864, 1536, 1190            # frame, approved waterline (frame px)
m = np.asarray(Image.open(f'{R}/qa/match/06/paint06/work/benny_matte_raw.png'))[..., 3].astype(np.float32) / 255
A = np.zeros((FH, FW), np.float32); A[680:680 + m.shape[0], 120:120 + m.shape[1]] = m
A[WL:] = 0
Ab = A > 0.5
ys, xs = np.where(Ab); AT, AL, AR = ys.min(), xs.min(), xs.max()

def align(alpha):
    """returns (scale, dx, dy) mapping render px -> frame px"""
    M = alpha > 0.5
    ys, xs = np.where(M)
    if len(ys) < 50: return None
    top = ys.min(); s = 1.0
    for _ in range(4):
        wl = top + (WL - AT) / s
        rows = M[:int(max(top + 1, min(M.shape[0], wl)))]
        cx = np.where(rows.any(axis=0))[0]
        s = (AR - AL) / max(1, cx.max() - cx.min())
    dx = AL - cx.min() * s; dy = AT - top * s
    return s, dx, dy

def warp(img, s, dx, dy, interp=cv2.INTER_AREA):
    Mx = np.float32([[s, 0, dx], [0, s, dy]])
    return cv2.warpAffine(img, Mx, (FW, FH), flags=interp if s < 1 else cv2.INTER_CUBIC, borderValue=0)

def score(path):
    im = np.asarray(Image.open(path).convert('RGBA')).astype(np.float32)
    al = im[..., 3] / 255
    a = align(al)
    if a is None: return None
    W = warp(al, *a); W[WL:] = 0
    B = W > 0.5
    iou = (B & Ab).sum() / max(1, (B | Ab).sum())
    return float(iou), a

if __name__ == '__main__':
    d = sys.argv[1]; res = []
    for p in glob.glob(f'{d}/y*_p*.png'):
        y, pt = map(float, re.findall(r'y(-?[\d.]+)_p(-?[\d.]+)', os.path.basename(p))[0])
        r = score(p)
        if r: res.append({'yaw': y, 'pitch': pt, 'iou': r[0], 'align': r[1], 'file': p})
    res.sort(key=lambda r: -r['iou'])
    for r in res[:5]: print(f"yaw {r['yaw']:g} pitch {r['pitch']:g} IoU {r['iou']:.3f}")
    json.dump(res, open(f'{d}/fit.json', 'w'), indent=1)
