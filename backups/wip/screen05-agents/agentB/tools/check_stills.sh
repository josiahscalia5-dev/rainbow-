#!/bin/bash
# tools/check_stills.sh <dir with stills> <name1.png> [name2.png ...]
# copies the named stills (in that order) into <dir>/chk/ as f_NNNN_<name>.jpg at 412x915 (JPEG q92, like the acceptance run)
# and runs the coordinator's checker /home/user/rainbow-/tools/marble05/viewer/visual_check.py on them (read-only use).
set -e
d="$1"; shift; rm -rf "$d/chk"; mkdir -p "$d/chk"
python3 -I - "$d" "$@" <<'PY'
import sys, cv2
d = sys.argv[1]
for i, n in enumerate(sys.argv[2:]):
    im = cv2.imread(f'{d}/{n}')
    if im.shape[:2] != (915, 412): im = cv2.resize(im, (412, 915), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{d}/chk/f_{i:04d}_{n[:-4]}.jpg', im, [cv2.IMWRITE_JPEG_QUALITY, 92])
PY
python3 -I /home/user/rainbow-/tools/marble05/viewer/visual_check.py "$d/chk" /home/user/rainbow-/references/05_flow_into_the_current.png > "$d/chk/summary.txt"
python3 -I - "$d/chk/visual_check.json" <<'PY'
import sys, json
j = json.load(open(sys.argv[1])); import glob, os
names = sorted(glob.glob(os.path.dirname(sys.argv[1]) + '/f_*.jpg'))
for n, r in zip(names, j['frames']):
    print(f"{os.path.basename(n):34s} patches {r['dark_patches']}  largest_dark_px {r['largest_dark_px']:5d}  black% {r['black_pct']:.3f}  look {r['colour_look_vs_approved']:.3f}  sharp {r['sharpness_vs_start']:.3f}  change {r['change']}")
PY
