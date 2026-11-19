"""Screen 05 near gold frame bake (`?projframe05=1`, src/vfx/proj05Tunnel.ts): the approved picture's two bottom-corner
gold bands and the bottom gold lip, unwrapped into the frame mesh's OWN band coordinates (src/world/tube.ts
nearFrameGeometry: uv.x along the arc, uv.y across the band 0 = edge toward the stream; reference-pixel geometry), so the
existing 3D frame wears the approved gold instead of the hand-picked palette that renders pale cream.
Hidden texels (bubbles, foam, water, splash in front of the gold) are filled along the band; the result is then
smoothed ALONG the arc (sigma_u) so it is the band's material profile + broad lighting, not a pixel copy.
Atlas frame05.png, rows top-down: left corner (NV) | gutter | right corner (NV) | gutter | bottom lip (NV); NU columns.
usage: python3 -I tools/proj05/frame_bake.py <out_dir> [sigma_u_texels] [--capture=05.png [--gain=0.8] [--reset=1]]"""
import json, math, os, sys
import numpy as np, cv2
from PIL import Image
from scipy.ndimage import gaussian_filter1d, binary_dilation

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tunnel_common import load_approved  # noqa: E402

pos = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
out = pos[0]
sig_u = float(pos[1]) if len(pos) > 1 else 3.0
# --capture=<05.png with ?projframe05=1>: colour feedback (bloom spill the shader cannot undo). The capture is sampled at
# the same band coordinates (the frame projects onto its designed outline), e = capture - current texture, smoothed hard
# along the arc, and gain * e is accumulated into CORR (qa/pilot05/proj/tunnel/model/frame_correction.npy).
CORR = "qa/pilot05/proj/tunnel/model/frame_correction.npy"
cap8 = np.asarray(Image.open(opt["capture"]).convert("RGB")) if "capture" in opt else None
gain = float(opt.get("gain", 0.8))
corr_prev = np.load(CORR) if os.path.exists(CORR) and opt.get("reset") != "1" else None
corr_new = []
NU, NV, G = 256, 48, 8
ap8 = load_approved()
# not gold: bubbles, foam, water, splash are bluish (B >= R - 15); gold, its warm white highlights and the rose lip
# shading all have R well above B. (The registered water footprint and the 'light' mask both cover the frame itself.)
def _not_gold(img8):
    a = img8.astype(int); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    magenta = (B > 0.62 * R) & (G < 0.6 * R)                  # the pink / magenta water stripes next to the cut
    return binary_dilation((B > R - 15) | magenta, iterations=2)


hide = _not_gold(ap8)

# the geometry of nearFrameGeometry (tube.ts): (cx, cy, a0 = b0, w, dir, th0, th1)
PIECES = {
    "left": (432, 1060, 457, 190, 1, -163, -122),
    "right": (432, 1060, 457, 190, 1, -17, -58),
    "lip": (432, 2121, 655, 130, -1, 122, 58),
}


def sample_piece(cx, cy, a0, w, d, th0, th1, src=None):
    u = (np.arange(NU) + 0.5) / NU
    v = (np.arange(NV) + 0.5) / NV
    U, V = np.meshgrid(u, v)
    th = np.radians(th0 + (th1 - th0) * U)
    rad = a0 + d * V * w
    mx = (cx + rad * np.cos(th)).astype(np.float32)
    my = (cy - rad * np.sin(th)).astype(np.float32)
    inside = (mx >= 0) & (mx <= 863) & (my >= 0) & (my <= 1535)
    s8 = ap8 if src is None else src
    img = cv2.remap(s8, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    hmask = hide if src is None else _not_gold(src)
    bad = cv2.remap(hmask.astype(np.uint8), mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REPLICATE) > 0
    ok = inside & ~bad
    return img, ok


def fill_along_u(img, ok):
    """per band row: hidden / off-screen texels take the nearest visible texel along the arc (linear between two)"""
    out = img.copy()
    for j in range(img.shape[0]):
        k = np.flatnonzero(ok[j])
        if k.size == 0:
            continue
        for c in range(3):
            out[j, :, c] = np.interp(np.arange(img.shape[1]), k, img[j, k, c])
    rows_ok = ok.any(1)
    if not rows_ok.all():                       # whole band rows never visible: nearest visible row
        k = np.flatnonzero(rows_ok)
        for j in np.flatnonzero(~rows_ok):
            out[j] = out[k[np.argmin(np.abs(k - j))]]
    return out


atlas = np.zeros((3 * NV + 2 * G, NU, 3), np.float32)
rep = {}
for i, (name, geo) in enumerate(PIECES.items()):
    img, ok = sample_piece(*geo)
    f = fill_along_u(img, ok)
    f = gaussian_filter1d(f, sig_u, axis=1, mode="nearest")
    c = corr_prev[i] if corr_prev is not None else np.zeros_like(f)
    if cap8 is not None:
        cimg, cok = sample_piece(*geo, src=cap8)
        tex_now = np.clip(f + c, 0, 255)
        e = np.where(cok[..., None], cimg - tex_now, 0.0)
        num = gaussian_filter1d(gaussian_filter1d(e, 24, axis=1, mode="nearest"), 1.5, axis=0, mode="nearest")
        den = gaussian_filter1d(gaussian_filter1d(cok.astype(np.float32), 24, axis=1, mode="nearest"), 1.5, axis=0, mode="nearest")
        step = np.where(den[..., None] > 0.05, num / np.maximum(den, 1e-4)[..., None], 0.0)
        print(name, "capture - texture: mean", e[cok].mean(0).round(1), "mean abs", round(float(np.abs(e[cok]).mean()), 1))
        c = c - gain * step
    corr_new.append(c)
    f = np.clip(f + c, 0, 255)
    y0 = i * (NV + G)
    atlas[y0:y0 + NV] = f
    if i < 2:                                    # gutters repeat the edge row (linear filtering never bleeds)
        atlas[y0 + NV:y0 + NV + G] = f[-1:]
    rep[name] = dict(y0=y0, h=NV, visible=round(float(ok.mean()), 3), mean_rgb=[round(float(x), 1) for x in f.reshape(-1, 3).mean(0)])
if cap8 is not None:
    np.save(CORR, np.stack(corr_new).astype(np.float32))
os.makedirs(out, exist_ok=True)
Image.fromarray(np.clip(atlas + 0.5, 0, 255).astype(np.uint8)).save(os.path.join(out, "frame05.png"))
meta = dict(w=NU, h=atlas.shape[0], rows=rep, sigma_u=sig_u, note="u = uv.x along the arc, v = uv.y across the band (0 = edge toward the stream)")
with open(os.path.join(out, "frame05.json"), "w") as fjs:
    json.dump(meta, fjs, indent=1)
print(json.dumps(meta))
