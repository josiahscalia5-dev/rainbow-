"""Round 12 (lead): unroll the PAINTED water of the user's provisional view V04-1 into the game river's own coordinates
(across = signed arc length vS on the river cross-section, along = distance down the slide) -> a world-anchored river tile
`assets/textures/match04/tile_river_v04.png` (+ .json) for `&m04vtile=1`. One source picture only (no blending of views ->
cannot ghost). Geometry = the game's m04river trough with the sides at the measured painted waterline (m04ry, default 2.2).
Usage: python3 tools/match04/vtile04.py [RY] [near] [far]"""
import json, sys
import numpy as np, cv2

RY = float(sys.argv[1]) if len(sys.argv) > 1 else 2.2
NEAR, FAR = (float(sys.argv[2]), float(sys.argv[3])) if len(sys.argv) > 3 else (3.0, 13.0)
P = json.load(open('assets/textures/match04/proj04.json'))
X = np.array(P['X']); U = np.array(P['U']); O = np.array(P['water']); D = np.array(P['D']); Dn = -D / np.linalg.norm(D)
T = P['tube']; cx, cy, r = T['ax'] - O[0], T['h'], T['r']
XF, nX, kf = 1.9, 28, 0.45
xW = np.sqrt(max(0.0, (r + 0.08) ** 2 - (cy - RY) ** 2))
# the m04river cross-section (src/world/match04m4.ts) and its arc length
xs = []
for i in range(nX + 1):
    u = i / nX * 2 - 1; au = abs(u)
    if au <= kf: x, y = au / kf * XF, 0.02
    else: t = (au - kf) / (1 - kf); x, y = XF + (xW - XF) * t, 0.02 + RY * t * t
    xs.append((np.sign(u) * x, y))
xs = np.array(xs); mid = nX // 2
arc = np.zeros(nX + 1)
for i in range(mid + 1, nX + 1): arc[i] = arc[i - 1] + np.hypot(*(xs[i] - xs[i - 1]))
for i in range(mid - 1, -1, -1): arc[i] = arc[i + 1] - np.hypot(*(xs[i] - xs[i + 1]))
A = float(arc[-1])                                            # half arc span (lane centre -> wall)

C = json.load(open('qa/match/04/r11/mv/cam10/camera.json'))  # V04-1 = the game camera it was painted from
W, H = C['size']; VP = np.array(C['viewProjection']).reshape(4, 4).T
img = cv2.imread('assets/textures/match04/mv04_V04-1.png', cv2.IMREAD_UNCHANGED)
camz = float(Dn @ (np.array(C['eye']) - O))                  # camera position along the local z axis (forward = -z)

TW, TH = 512, 1024                                            # texels across, along
s = np.linspace(-A, A, TW)                                    # signed arc
x_of = np.interp(s, arc, xs[:, 0]); y_of = np.interp(s, arc, xs[:, 1])
d = np.linspace(NEAR, FAR, TH)                                 # distance ahead of the V04-1 camera
lx = cx + x_of[None, :] * np.ones((TH, 1)); ly = y_of[None, :] * np.ones((TH, 1)); lz = (camz - d)[:, None] * np.ones((1, TW))
wp = O[None, None, :] + lx[..., None] * X + ly[..., None] * U + lz[..., None] * Dn
clip = np.einsum('ij,hwj->hwi', VP, np.concatenate([wp, np.ones((TH, TW, 1))], -1))
ndc = clip[..., :2] / clip[..., 3:4]
mx = ((ndc[..., 0] + 1) / 2 * W - 0.5).astype(np.float32); my = ((1 - ndc[..., 1]) / 2 * H - 0.5).astype(np.float32)
tile = cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
valid = (tile[..., 3] > 200) & (clip[..., 3] > 0)
# holes (painted Benny / coins / outside the picture): fill ALONG the flow from the same lateral column (TELEA on the hole)
hole = (~valid).astype(np.uint8) * 255
rgb = cv2.inpaint(np.ascontiguousarray(tile[..., :3]), hole, 7, cv2.INPAINT_TELEA)
# seamless repeat along: cross-fade the last 18 % into the first rows
k = int(TH * 0.18)
w = np.linspace(0, 1, k)[:, None, None]
rgb = rgb.astype(np.float32)
rgb[-k:] = rgb[-k:] * (1 - w) + rgb[:k] * w
out = rgb[:-k].clip(0, 255).astype(np.uint8)                  # period = FAR - NEAR minus the faded part
period = (FAR - NEAR) * (TH - k) / TH
# texture rows run along (v), columns across (u); the shader samples (lat / 2A + 0.5, (fl - start) / period)
cv2.imwrite('assets/textures/match04/tile_river_v04.png', out)
meta = dict(source='V04-1 (user PROVISIONAL view, mv04_V04-1.png)', RY=RY, half_arc=A, near=NEAR, far=FAR, period=period,
            hole_share=float(1 - valid.mean()), size=[int(out.shape[1]), int(out.shape[0])])
json.dump(meta, open('assets/textures/match04/tile_river_v04.json', 'w'), indent=1)
print(meta)
