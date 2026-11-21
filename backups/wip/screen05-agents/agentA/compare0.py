# Frame-0 identity check: out_controls/a_start_frame0.png (controls on) vs a_start_frame0_controls_off.png (?controls=0)
# usage: python3 -I compare0.py <agentA dir>
import sys, json
from PIL import Image
import numpy as np
d = sys.argv[1]
a = np.asarray(Image.open(f'{d}/out_controls/a_start_frame0.png').convert('RGB')).astype(int)
b = np.asarray(Image.open(f'{d}/out_controls/a_start_frame0_controls_off.png').convert('RGB')).astype(int)
diff = np.abs(a - b).max(axis=2)
res = {'size': list(a.shape[:2][::-1]), 'identical_pixels_pct': round(100 * float((diff == 0).mean()), 3),
       'within_2_levels_pct': round(100 * float((diff <= 2).mean()), 3), 'within_20_levels_pct': round(100 * float((diff <= 20).mean()), 3),
       'max_diff': int(diff.max()), 'mean_abs_diff': round(float(np.abs(a - b).mean()), 4)}
# where do differences sit (rows), to tell HUD vs scene
rows = np.where(diff.max(axis=1) > 2)[0]
res['rows_with_diff_gt2'] = [int(rows.min()), int(rows.max()), int(len(rows))] if len(rows) else []
print(json.dumps(res))
