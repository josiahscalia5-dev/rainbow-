"""endlight.py <img> <x> <y> [win=45]: the end light near (x, y) of a 412x915 frame: centre of the brightest spot, the core size
(pixels with luma >= 235 connected to it) and the warm-light size (luma >= 190 connected to it). The approved picture is scaled to
height 915 and centre-cropped to 412 like the lead's checker."""
import sys, cv2, numpy as np
f, x0, y0 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); win = int(sys.argv[4]) if len(sys.argv) > 4 else 45
im = cv2.imread(f)
if f.endswith('05_flow_into_the_current.png'):
    w = round(im.shape[1] * 915 / im.shape[0]); im = cv2.resize(im, (w, 915), interpolation=cv2.INTER_AREA)[:, (w - 412) // 2:(w - 412) // 2 + 412]
L = cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), (5, 5), 0)
sub = L[y0 - win:y0 + win, x0 - win:x0 + win]; yy, xx = np.unravel_index(np.argmax(sub), sub.shape); cx, cy = x0 - win + xx, y0 - win + yy
out = [f'{f.split("/")[-2]}/{f.split("/")[-1]}: brightest at ({cx}, {cy}) luma {L[cy, cx]}']
for th in (235, 190):
    m = np.zeros_like(L); m[y0 - win:y0 + win, x0 - win:x0 + win] = (sub >= th); n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    a = st[lab[cy, cx], 4] if lab[cy, cx] else 0; out.append(f'luma>={th}: {a} px (diameter ~{2 * np.sqrt(a / np.pi):.0f} px)')
print(', '.join(out))
