"""Any screen: find where/how Marble placed the input image in its panorama (equirect): focal length, yaw, pitch.
Generalised copy of tools/marble05/pano_fit.py (that one is hard-wired to the Screen 05 reference).
usage: python3 -I tools/imageblaster/pano_fit.py <pano.png> <reference.png> <out.json> [preview.png]
f_px is in pixels of the reference image (use the 864x1536 frame for Rainbow screens)."""
import json, sys
import numpy as np
from PIL import Image, ImageFilter

pano_p, ref_p, outp = sys.argv[1], sys.argv[2], sys.argv[3]
pano = np.asarray(Image.open(pano_p).convert("RGB"), float) / 255
PH, PW = pano.shape[:2]
ref_im = Image.open(ref_p).convert("RGB")
W0, H0 = ref_im.size
k = 4
W, H = W0 // k, H0 // k
ref = np.asarray(ref_im.resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(1)), float) / 255

def view(f, yaw, pitch, cx=None, cy=None, W=W, H=H, scale=k):
    cx = W0 / 2 if cx is None else cx; cy = H0 / 2 if cy is None else cy
    uu, vv = np.meshgrid((np.arange(W) + 0.5) * scale, (np.arange(H) + 0.5) * scale)
    d = np.stack([(uu - cx) / f, (vv - cy) / f, np.ones_like(uu)], -1)
    d /= np.linalg.norm(d, axis=-1, keepdims=True)
    cp, sp = np.cos(pitch), np.sin(pitch)  # pitch: +ve looks up
    y2 = d[..., 1] * cp - d[..., 2] * sp; z2 = d[..., 1] * sp + d[..., 2] * cp
    d = np.stack([d[..., 0], y2, z2], -1)
    lon = np.arctan2(d[..., 0], d[..., 2]) + yaw
    lat = -np.arcsin(np.clip(d[..., 1], -1, 1))
    x = ((lon / (2 * np.pi) + 0.5) % 1) * PW
    y = (0.5 - lat / np.pi) * PH
    xi = np.clip(x.astype(int), 0, PW - 1); yi = np.clip(y.astype(int), 0, PH - 1)
    return pano[yi, xi]

def ncc(a, b):
    a = a - a.mean((0, 1)); b = b - b.mean((0, 1))
    return float((a * b).sum() / np.sqrt((a * a).sum() * (b * b).sum()))

best = (-2, None)
for f in np.arange(250, 1601, 25):
    for yaw in np.radians(np.arange(-20, 21, 4)):
        for pitch in np.radians(np.arange(-20, 21, 4)):
            s = ncc(view(f, yaw, pitch), ref)
            if s > best[0]: best = (s, (f, yaw, pitch))
s, (f, yaw, pitch) = best
for f2 in np.arange(f - 24, f + 25, 4):
    for yaw2 in np.radians(np.arange(np.degrees(yaw) - 4, np.degrees(yaw) + 4.1, 1)):
        for p2 in np.radians(np.arange(np.degrees(pitch) - 4, np.degrees(pitch) + 4.1, 1)):
            s2 = ncc(view(f2, yaw2, p2), ref)
            if s2 > best[0]: best = (s2, (f2, yaw2, p2))
s, (f, yaw, pitch) = best
res = dict(pano=pano_p, reference=ref_p, pano_size=[PW, PH], image_size=[W0, H0], f_px=float(f), hfov_deg=float(np.degrees(2 * np.arctan(W0 / 2 / f))),
           yaw_deg=float(np.degrees(yaw)), pitch_deg=float(np.degrees(pitch)), ncc_blurred_quarter_res=s)
json.dump(res, open(outp, "w"), indent=1); print(json.dumps(res))
if len(sys.argv) > 4:
    v = view(f, yaw, pitch, W=W0, H=H0, scale=1)
    full = np.asarray(ref_im, float) / 255
    Image.fromarray((np.concatenate([full, v], 0) * 255).astype(np.uint8)).save(sys.argv[4])
