"""direction of the MOVING part of the water: (flowing frame - flow-off frame of the same instant), tracked between
consecutive frames with phase correlation in three river windows; +y = down the screen = toward the camera"""
import sys, numpy as np, cv2
from PIL import Image
ref, d = sys.argv[1], sys.argv[2]
n = 12
L = lambda p: cv2.cvtColor(np.asarray(Image.open(p).convert('RGB')), cv2.COLOR_RGB2GRAY).astype(np.float32)
R = [L(f'{d}/still/{i:04d}.png') - L(f'{ref}/still/{i:04d}.png') for i in range(n)]
wins = {'far core': (560, 660, 380, 520), 'mid left ribbon': (700, 860, 120, 330), 'near right': (1150, 1330, 520, 760)}
for name, (y0, y1, x0, x1) in wins.items():
    sh = []
    for i in range(n - 1):
        a, b = R[i][y0:y1, x0:x1], R[i + 1][y0:y1, x0:x1]
        if np.abs(a).mean() < 0.4 or np.abs(b).mean() < 0.4: continue      # zero-offset instants: nothing moving to track
        (dx, dy), resp = cv2.phaseCorrelate(a, b, cv2.createHanningWindow((x1 - x0, y1 - y0), cv2.CV_32F))
        if resp > 0.05: sh.append((dx, dy))
    sh = np.array(sh) if sh else np.zeros((0, 2))
    amp = np.mean([np.abs(r[y0:y1, x0:x1]).mean() for r in R])
    print(f'  {name:16s} moving-part amplitude {amp:5.1f} levels | tracked pairs {len(sh):2d} | toward camera in {int((sh[:,1] > 0.3).sum())}/{len(sh)} | median shift px (x, y) {np.round(np.median(sh, 0), 1) if len(sh) else "-"}')
