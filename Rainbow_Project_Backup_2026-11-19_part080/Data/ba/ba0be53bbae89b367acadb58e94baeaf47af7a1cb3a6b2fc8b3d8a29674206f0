"""Round 12 (lead): measure where the PAINTED water meets the gold tunnel wall in the views V04-1 / V04-2, in the game's own
slide frame (exact geometry: the views' known game cameras + the known tunnel cylinder; no AI estimate).
For every wall pixel on the painted water/gold boundary the camera ray is intersected with the tunnel cylinder -> local
(lateral x, height y above Benny's water plane, along z). Prints the waterline height per side and along-distance bins."""
import json, sys
import numpy as np, cv2
P = json.load(open('assets/textures/match04/proj04.json'))
X = np.array(P['X']); U = np.array(P['U']); O = np.array(P['water']); T = P['tube']
Dn = np.cross(X, U)                                   # completes the right-handed basis (checked against D below)
D = np.array(P['D']); Dn = -D / np.linalg.norm(D)
cx, cy, r = T['ax'] - O[0], T['h'], T['r']
out = {}
for name, cam in (('V04-1', 'cam10'), ('V04-2', 'cam20')):
    C = json.load(open(f'qa/match/04/r11/mv/{cam}/camera.json'))
    W, H = C['size']
    VP = np.array(C['viewProjection']).reshape(4, 4).T     # column-major -> row-major
    iVP = np.linalg.inv(VP)
    im = cv2.imread(f'assets/textures/match04/mv04_{name}.png', cv2.IMREAD_UNCHANGED)
    hsv = cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2HSV_FULL).astype(np.float32)
    h, s, v = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    gold = (h > 15) & (h < 55) & (s > 0.45) & (v > 0.30)
    water = ~gold & (im[..., 3] > 128)
    gold = cv2.morphologyEx(gold.astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)) > 0
    water = cv2.morphologyEx(water.astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9), np.uint8)) > 0
    # boundary: water pixel with gold 6 px above it (the waterline seen against the wall)
    up = np.zeros_like(gold); up[6:] = gold[:-6]
    bnd = water & up & (im[..., 3] > 128)
    vs, us = np.nonzero(bnd)
    keep = vs > 300                                         # below the HUD band
    vs, us = vs[keep], us[keep]
    nx = (us + 0.5) / W * 2 - 1; ny = 1 - (vs + 0.5) / H * 2
    a = (iVP @ np.stack([nx, ny, -np.ones_like(nx), np.ones_like(nx)])); a = a[:3] / a[3]
    b = (iVP @ np.stack([nx, ny, np.ones_like(nx), np.ones_like(nx)])); b = b[:3] / b[3]
    d = (b - a); d /= np.linalg.norm(d, axis=0)
    e = np.array(C['eye'])[:, None]
    # to the slide frame
    loc = lambda p: np.stack([X @ (p - O[:, None]), U @ (p - O[:, None]), Dn @ (p - O[:, None])])
    le, ld = loc(e), np.stack([X @ d, U @ d, Dn @ d])
    # cylinder around the local z axis at (cx, cy): (x - cx)^2 + (y - cy)^2 = r^2
    px, py = le[0] - cx, le[1] - cy
    A = ld[0] ** 2 + ld[1] ** 2; B = 2 * (px * ld[0] + py * ld[1]); Cc = px ** 2 + py ** 2 - r ** 2
    disc = B ** 2 - 4 * A * Cc
    t = (-B + np.sqrt(np.maximum(disc, 0))) / (2 * A)
    hit = le + ld * t
    ok = (disc > 0) & (t > 0)
    x, y, z = hit[0][ok], hit[1][ok], hit[2][ok]
    zc = le[2][0]
    res = {}
    for side, m in (('left', x < cx - 0.5), ('right', x > cx + 0.5)):
        rows = []
        for z0 in np.arange(-2, 40, 4):
            sel = m & (zc - z > z0) & (zc - z <= z0 + 4)     # distance ahead of this view's camera along the slide
            if sel.sum() >= 30:
                rows.append({'ahead': f'{z0:.0f}..{z0 + 4:.0f}', 'n': int(sel.sum()), 'y_median': round(float(np.median(y[sel])), 2),
                             'y_p25': round(float(np.percentile(y[sel], 25)), 2), 'y_p75': round(float(np.percentile(y[sel], 75)), 2)})
        res[side] = rows
    out[name] = {'cam_along_z': round(float(zc), 2), 'boundary_px': int(ok.sum()), **res}
    print(name, 'camera along z', round(float(zc), 2), 'boundary px', int(ok.sum()))
    for side in ('left', 'right'):
        for rrow in res[side]: print(' ', side, rrow)
print('game now: water plane y = 0, tunnel centre y =', round(cy, 2), 'radius', round(r, 2),
      '-> water meets the wall at y = 0 (lateral', round(float(np.sqrt(r * r - cy * cy)), 2), '); river sides climb to m04ry (default 1.0, test C 2.2)')
json.dump(out, open(sys.argv[1] if len(sys.argv) > 1 else '/dev/null', 'w'), indent=1)
