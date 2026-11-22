"""Rainbow screen kit - measure a game frame of a screen against its approved picture with the skill's compare_to_approved.py (the same
formulas as every earlier round, incl. the Bubble Dash 90.7 %): scenery = the picture minus what the game draws itself (= the bake mask
from segment.py: HUD, title, Benny + his splash ring, coins, loose bubbles), mapped into the 412x915 phone frame exactly like the picture.
  python3 -I tools/screenkit/compare_screen.py <NN> <NEW frame> <mask.png> <out dir> [--before <frame>] [--tag NAME]
Prints and writes <out>/<tag>_summary.json. Thresholds are the skill's own (20 levels); never changed to report higher numbers."""
import sys, os, json, subprocess, argparse
from PIL import Image, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
ap = argparse.ArgumentParser(); ap.add_argument('nn'); ap.add_argument('frame'); ap.add_argument('mask'); ap.add_argument('out'); ap.add_argument('--before'); ap.add_argument('--tag', default='new')
a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
ref = json.load(open(os.path.join(REPO, '.claude/skills/rainbow-screen-builder/screens.json')))['screens'][a.nn]['reference']
m = Image.open(a.mask).convert('L'); s = 915 / m.height; m = m.resize((round(m.width * s), 915), Image.NEAREST); x = (m.width - 412) // 2
m = ImageOps.invert(m.crop((x, 0, x + 412, 915))); mp = os.path.join(a.out, f'scenery_mask_{a.nn}.png'); m.save(mp)
cmd = ['python3', '-I', os.path.join(REPO, '.claude/skills/rainbow-screen-builder/scripts/compare_to_approved.py'), os.path.join(REPO, ref), a.frame, '--mask', mp, '--out', a.out, '--tag', a.tag]
if a.before: cmd += ['--before', a.before]
subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
d = json.load(open(os.path.join(a.out, f'{a.tag}_compare.json')))['frames']['0']
res = {k: {x: d[k].get(x) for x in ('share_within_20_levels', 'ssim_scenery', 'mean_abs_diff_levels', 'colour_look_corr', 'sharpness_vs_approved', 'whole_frame_within_20_levels')} for k in d if k in ('new', 'before')}
res['scenery_share_of_frame'] = round(sum(1 for p in m.getdata() if p > 127) / (412 * 915), 3)
res['route_first'] = d['new'].get('route_first', [])[:3]; res['zones'] = d['new'].get('zones_share_of_all_mismatch')
json.dump(res, open(os.path.join(a.out, f'{a.tag}_summary.json'), 'w'), indent=1); print(json.dumps(res, indent=1))
