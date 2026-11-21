"""endlight.py <img> [...]: the end light = the brightest near-white-gold blob below the HUD (V >= 245, S <= 90, y >= 150) whose
area is the largest connected one: centre (x, y), area px and equivalent diameter, plus the warm-light disc (H 5-40 deg, V >= 200).
The approved picture is scaled to height 915 and centre-cropped to 412 like the lead's checker."""
import sys, cv2, numpy as np
for f in sys.argv[1:]:
    im = cv2.imread(f)
    if f.endswith('05_flow_into_the_current.png'):
        w = round(im.shape[1] * 915 / im.shape[0]); im = cv2.resize(im, (w, 915), interpolation=cv2.INTER_AREA)[:, (w - 412) // 2:(w - 412) // 2 + 412]
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV); m = ((hsv[..., 2] >= 245) & (hsv[..., 1] <= 90)).astype(np.uint8); m[:150] = 0
    m[420:] = 0; m[(hsv[..., 0] > 45) & (hsv[..., 1] > 25)] = 0  # upper part only (foam / Benny below are white too), no bluish white
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        i = 1 + int(np.argmax(st[1:, 4])); print(f'{f.split("/")[-2]}/{f.split("/")[-1]}: white-gold core at ({cen[i][0]:.0f}, {cen[i][1]:.0f}), area {st[i,4]} px, diameter ~{2*np.sqrt(st[i,4]/np.pi):.0f} px')
    else: print(f, 'no core')
