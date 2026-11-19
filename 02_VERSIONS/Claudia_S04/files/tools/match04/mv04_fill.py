"""Round 12 (lead): fill the masked holes (painted Benny / coins / bubbles / HUD, alpha < 128) of the multi-view textures
assets/textures/match04/mv04_V04-*.png from the surrounding painted scenery (OpenCV Telea inpainting, local only, free)
-> mv04_V04-*_fill.png (small holes filled; the big painted-Benny area / HUD band stay soft-edged holes). The originals are not changed. Used by `&m04mv2=1`."""
import sys
from pathlib import Path
import numpy as np, cv2
D = Path('assets/textures/match04')
for n in ('mv04_V04-1', 'mv04_V04-2'):
    im = cv2.imread(str(D / f'{n}.png'), cv2.IMREAD_UNCHANGED)
    hole = (im[..., 3] < 128).astype(np.uint8) * 255
    hole = cv2.dilate(hole, np.ones((5, 5), np.uint8))          # also replace the soft mask fringe
    # only SMALL holes (coins, bubbles, the coin-trail column) are filled; the big painted-Benny area and the HUD band stay
    # holes (the game's own 3D water / tunnel shows there), with a soft edge
    band = 0                                                     # the HUD band: top rows that are (almost) all hole
    while band < hole.shape[0] and (hole[band] > 0).mean() > 0.95: band += 1
    body = hole.copy(); body[:band] = 0
    n_lab, lab, stats, _ = cv2.connectedComponentsWithStats(body, 8)
    big = np.zeros_like(hole); big[:band] = hole[:band]
    for k in range(1, n_lab):
        if stats[k, cv2.CC_STAT_AREA] > 150000: big[lab == k] = 255
    small = cv2.bitwise_and(hole, cv2.bitwise_not(big))
    rgb = cv2.inpaint(np.ascontiguousarray(im[..., :3]), small, 9, cv2.INPAINT_TELEA)
    a = 255 - cv2.GaussianBlur(cv2.dilate(big, np.ones((9, 9), np.uint8)), (0, 0), 6)
    out = np.dstack([rgb, a.astype(np.uint8)])
    cv2.imwrite(str(D / f'{n}_fill.png'), out)
    print(n, 'HUD band rows', band, 'filled small px', int((small > 0).sum()), 'kept as hole px', int((big > 0).sum()), 'of', hole.size)
