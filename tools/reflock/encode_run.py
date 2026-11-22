"""Round 40: after section_run.cjs `run`: count hole pixels (pure-green sentinel background) in EVERY saved frame, write the summary,
encode the continuous gameplay video (30 fps, 412x914 h264) and a second clip of one stretch of the run (by Benny's progress s).
  python3 -I tools/reflock/encode_run.py <run dir> <out dir> <name> [clip_s0 clip_s1 clip_name]"""
import sys, os, json, glob, subprocess
import numpy as np
from PIL import Image
run, out, name = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
log = json.load(open(os.path.join(run, 'run_log.json'))); chk = json.load(open(os.path.join(run, 'checks.json')))
holes = []
for f in log:
    if not f.get('file'): continue
    a = np.asarray(Image.open(os.path.join(run, f['file'])).convert('RGB'))
    holes.append(int(((a[..., 1] > 235) & (a[..., 0] < 40) & (a[..., 2] < 40)).sum()))
chk.update({'hole_frames_checked': len(holes), 'hole_frames': int(sum(h > 0 for h in holes)), 'hole_pixels_max': int(max(holes) if holes else -1)})
json.dump(chk, open(os.path.join(out, f'{name}_checks.json'), 'w'), indent=1); print(json.dumps(chk))
def encode(frames, path):
    lst = os.path.join(run, '_list.txt')
    with open(lst, 'w') as fh:
        for f in frames: fh.write(f"file '{os.path.abspath(os.path.join(run, f['file']))}'\nduration {1 / 30:.6f}\n")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2,fps=30', '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', path], check=True)
    print('wrote', path, round(os.path.getsize(path) / 1e6, 1), 'MB', len(frames), 'frames')
fr = [f for f in log if f.get('file')]
encode(fr, os.path.join(out, f'{name}.mp4'))
if len(sys.argv) > 6:
    s0, s1, cn = float(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
    encode([f for f in fr if s0 <= f['s'] <= s1], os.path.join(out, f'{cn}.mp4'))
