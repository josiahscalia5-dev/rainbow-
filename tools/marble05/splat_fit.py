"""Fit Marble's origin camera to the input image using the SPLATS (not the pano): focal, yaw, pitch.
Point render at quarter resolution + blur, NCC against the input image.
usage: python3 -I tools/marble05/splat_fit.py <world_dir> <out.json> [preview.png]"""
import json, sys, os
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from splatlib import load_ply

wd, outp = sys.argv[1], sys.argv[2]
S = load_ply(os.path.join(wd, "splats_500k.ply"), min_alpha=0.3)
xyz0, rgb = S["xyz"], S["rgb"]
ref_im = Image.open("qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png").convert("RGB")
W0, H0 = ref_im.size

def rot(yaw, pitch):
    cy_, sy_ = np.cos(yaw), np.sin(yaw); cp, sp = np.cos(pitch), np.sin(pitch)
    Ry = np.array([[cy_, 0, sy_], [0, 1, 0], [-sy_, 0, cy_]])
    Rx = np.array([[1, 0, 0], [0, cp, -sp], [0, sp, cp]])  # camera->world: +pitch looks up (y down)
    return Ry @ Rx

def render(f, yaw, pitch, k, blur=1.0):
    W, H = W0 // k, H0 // k
    R = rot(yaw, pitch)
    c = xyz0 @ R  # world->camera (R orthonormal: x_cam = R^T x_w  -> row form x_w @ R)
    z = c[:, 2]; m = z > 0.05
    u = (701 if f is None else f) / k * c[m, 0] / z[m] + W / 2
    v = (701 if f is None else f) / k * c[m, 1] / z[m] + H / 2
    ok = (u >= 0) & (u < W) & (v >= 0) & (v < H)
    ui, vi, zz, col = u[ok].astype(int), v[ok].astype(int), z[m][ok], rgb[m][ok]
    idx = vi * W + ui
    o = np.lexsort((zz, idx)); idx_s = idx[o]
    first = np.ones(len(o), bool); first[1:] = idx_s[1:] != idx_s[:-1]
    img = np.zeros((H * W, 3)); cov = np.zeros(H * W)
    img[idx_s[first]] = col[o][first]; cov[idx_s[first]] = 1
    img = img.reshape(H, W, 3); cov = cov.reshape(H, W)
    # fill holes with a normalised blur
    from scipy.ndimage import gaussian_filter
    num = np.stack([gaussian_filter(img[..., i] * cov, blur) for i in range(3)], -1)
    den = gaussian_filter(cov, blur)[..., None]
    return num / np.maximum(den, 1e-6), cov.mean()

k = 4
ref = np.asarray(ref_im.resize((W0 // k, H0 // k), Image.BILINEAR).filter(ImageFilter.GaussianBlur(1)), float) / 255
def ncc(a, b):
    a = a - a.mean((0, 1)); b = b - b.mean((0, 1))
    return float((a * b).sum() / np.sqrt((a * a).sum() * (b * b).sum()))
best = (-2, None)
for f in np.arange(300, 1201, 50):
    for yaw in np.radians(np.arange(-12, 13, 4)):
        for pitch in np.radians(np.arange(-12, 17, 4)):
            img, cv = render(f, yaw, pitch, k)
            s = ncc(img, ref)
            if s > best[0]: best = (s, (f, yaw, pitch))
s, (f, yaw, pitch) = best
for f2 in np.arange(f - 40, f + 41, 10):
    for yaw2 in np.radians(np.arange(np.degrees(yaw) - 3, np.degrees(yaw) + 3.1, 1)):
        for p2 in np.radians(np.arange(np.degrees(pitch) - 3, np.degrees(pitch) + 3.1, 1)):
            img, cv = render(f2, yaw2, p2, k)
            s2 = ncc(img, ref)
            if s2 > best[0]: best = (s2, (f2, yaw2, p2))
s, (f, yaw, pitch) = best
res = dict(world_dir=wd, f_px=float(f), hfov_deg=float(np.degrees(2 * np.arctan(W0 / 2 / f))), yaw_deg=float(np.degrees(yaw)),
           pitch_deg=float(np.degrees(pitch)), ncc_blurred_quarter_res=s,
           convention="camera at the PLY origin; camera->world rotation = Ry(yaw) @ Rx(pitch), +pitch looks up, PLY y down, z forward")
json.dump(res, open(outp, "w"), indent=1); print(json.dumps(res))
if len(sys.argv) > 3:
    img, cv = render(f, yaw, pitch, 1, blur=1.2)
    Image.fromarray((np.concatenate([np.asarray(ref_im, float) / 255, img], 0) * 255).clip(0, 255).astype(np.uint8)).save(sys.argv[3])
