"""paint06 step 4: game assets -> assets/textures/paint06/ (plates JPEG q94, Benny layers PNG RGBA, smoothed depth PNG, layout JSON)"""
import json
import cv2, numpy as np
from PIL import Image
R = '/home/user/rainbow-'; W = f'{R}/qa/match/06/paint06/work'; O = f'{R}/assets/textures/paint06'
import sys; sys.path.insert(0, f'{R}/tools/paint06')
from step3_plates import FW, FH, MX, MY, PW, PH, S
lay = {'frame': [FW, FH], 'margin': [MX, MY], 'plate_frame_px': [PW, PH], 'plate_scale': S, 'keys': []}
for k in range(5):
    Image.open(f'{W}/k{k}_plate.png').convert('RGB').save(f'{O}/k{k}_plate.jpg', quality=94, subsampling=0)
    Image.open(f'{W}/k{k}_benny.png').save(f'{O}/k{k}_benny.png', optimize=True)
    d = np.asarray(Image.open(f'{W}/k{k}_depth_raw.png').convert('L')).astype(np.float32)
    d = cv2.medianBlur(d.astype(np.uint8), 7).astype(np.float32)
    d = cv2.GaussianBlur(d, (0, 0), 6)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5); d = ((d - lo) / max(hi - lo, 1)).clip(0, 1)
    d = cv2.resize(d, (PW // 6, PH // 6), interpolation=cv2.INTER_AREA)   # 192 x 320 grid
    Image.fromarray((d * 255).round().astype(np.uint8)).save(f'{O}/k{k}_depth.png')
    bj = json.load(open(f'{W}/k{k}_benny.json'))
    x0, y0, x1, y1 = bj['bbox_plate_px']
    lay['keys'].append({'k': k, 'benny_frame_px': [x0 / S - MX, y0 / S - MY, x1 / S - MX, y1 / S - MY]})
json.dump(lay, open(f'{O}/paint06.json', 'w'), indent=1)
print(json.dumps(lay)[:400])
