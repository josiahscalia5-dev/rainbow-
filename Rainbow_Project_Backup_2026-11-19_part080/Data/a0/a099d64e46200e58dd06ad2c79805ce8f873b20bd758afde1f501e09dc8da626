"""Screen 04 r11 (lead decisive test, `&m04mv=1`): prepare the user's PROVISIONAL reference views V04-1 / V04-2 as extra
projectors. Each view was generated (fal, round 10, user-approved pilot) from the live game frame at forward 10 u / 20 u
(tools/lead_r6/motion_audit.mjs f10_forward10u / f20_forward20u), so its projector = the game camera at that position
(scripts/match-probe.mjs --fwd=10 / --fwd=20 → camera.json + dyn_mask.pgm).
Writes assets/textures/match04/mv/V04-<k>.png (864x1536 RGBA: alpha 0 on the painted Benny / coins (game dynamic mask at
that camera, dilated) and on the HUD bar + title rows) and mv04.json (projector matrixWorld, fov, aspect per view).
usage: python3 -I tools/match04/mv04_prep.py <cam10 dir> <cam20 dir> <V04-1 png> <V04-2 png> <out dir>
"""
import json, sys
import numpy as np
from PIL import Image, ImageFilter

W, H, HUD_ROWS, DIL = 864, 1536, 215, 31


def read_pgm(p):
    b = open(p, 'rb').read()
    parts = b.split(maxsplit=4)
    return np.frombuffer(parts[4][:W * H], np.uint8).reshape(H, W)


def main(cam10, cam20, v1, v2, out):
    views = []
    for k, (cd, vp) in enumerate(((cam10, v1), (cam20, v2)), start=1):
        cam = json.load(open(f'{cd}/camera.json'))
        view = np.array(cam['view'], float).reshape(4, 4).T          # three.js toArray = column-major
        mw = np.linalg.inv(view)
        dyn = Image.fromarray(read_pgm(f'{cd}/dyn_mask.pgm')).filter(ImageFilter.MaxFilter(DIL))
        a = 255 - np.asarray(dyn, np.uint8)
        a[:HUD_ROWS] = 0
        rgb = Image.open(vp).convert('RGB').resize((W, H), Image.LANCZOS)
        # the PAINTED Benny is bigger and lower than the game's Benny at the same camera: generous ellipse (+ his splash)
        yy, xx = np.mgrid[0:H, 0:W]
        a[((xx - 405) / 235.0) ** 2 + ((yy - 1190) / 290.0) ** 2 <= 1.0] = 0
        # painted coins (the game draws its own real coins): saturated gold blobs of coin size below the tunnel crown
        from scipy import ndimage
        c = np.asarray(rgb).astype(int)
        gold = (c[..., 0] > 190) & (c[..., 1] > 130) & (c[..., 2] < 110) & (c[..., 0] - c[..., 2] > 120) & (yy > 650) & (xx > 90) & (xx < 560)
        lab, n = ndimage.label(gold)
        coin = np.zeros_like(gold)
        for i, sl in enumerate(ndimage.find_objects(lab), start=1):
            hh, ww = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
            area = int((lab[sl] == i).sum())
            if 150 <= area <= 14000 and 0.45 <= ww / max(hh, 1) <= 2.2 and max(hh, ww) <= 170:
                coin[sl] |= lab[sl] == i
        coin = ndimage.binary_dilation(coin, iterations=9)
        a[coin] = 0
        rgba = np.dstack([np.asarray(rgb), a])
        name = f'V04-{k}.png'
        Image.fromarray(rgba, 'RGBA').save(f'{out}/mv04_{name}', optimize=True)
        views.append({'img': 'mv04_' + name, 'matrixWorld': mw.T.flatten().tolist(), 'fov': cam['fov'], 'aspect': cam['aspect'],
                      's': cam['state']['s'], 'eye': cam['eye'], 'masked_px': int((a == 0).sum())})
        print(name, 's', cam['state']['s'], 'masked', int((a == 0).sum()))
    json.dump({'source': 'user PROVISIONAL views (qa/match/04/r10/refviews/pilot/V04-1_cand1.png, V04-2_cand2.png)',
               'views': views}, open(f'{out}/mv04.json', 'w'), indent=1)


if __name__ == '__main__':
    main(*sys.argv[1:6])
