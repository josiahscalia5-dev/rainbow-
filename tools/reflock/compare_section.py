"""Round 40: measure the section's frames at the two reference views against the user's two approved pictures with the skill's
compare_to_approved.py (same formulas as every earlier round). Scenery mask = the picture minus what the game draws itself (HUD / mission
bar / badge, Benny + splash, coins, socks, loose bubbles, buttons; = the bake masks), mapped into the 412x915 phone frame exactly like the
approved picture (scaled to the frame height, centre-cropped).
  python3 -I tools/reflock/compare_section.py <bubble frame.png> <sock frame.png> <outdir> [--before-bubble F] [--before-sock F]
"""
import sys, os, subprocess, json
from PIL import Image, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
fb, fs, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
opt = dict(zip(sys.argv[4::2], sys.argv[5::2]))
MASKS = {'bubble': os.environ.get('MASK_BUBBLE'), 'sock': os.environ.get('MASK_SOCK', os.path.join(REPO, 'qa/bonus/r39/generated/sock_plate_mask.png'))}
REFS = {'bubble': 'references/candidates/bonus_bubble_dash_chamber.webp', 'sock': 'references/candidates/bonus_sock_rescue_laundry_tunnel.webp'}
res = {}
for name, frame in (('bubble', fb), ('sock', fs)):
    m = Image.open(MASKS[name]).convert('L'); s = 915 / m.height; m = m.resize((round(m.width * s), 915), Image.NEAREST); x = (m.width - 412) // 2
    m = ImageOps.invert(m.crop((x, 0, x + 412, 915))); mp = os.path.join(out, f'scenery_mask_{name}.png'); m.save(mp)
    cmd = ['python3', '-I', os.path.join(REPO, '.claude/skills/rainbow-screen-builder/scripts/compare_to_approved.py'), os.path.join(REPO, REFS[name]), frame, '--mask', mp, '--out', out, '--tag', name]
    if opt.get('--before-' + name): cmd += ['--before', opt['--before-' + name]]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL)
    d = json.load(open(os.path.join(out, f'{name}_compare.json')))['frames']['0']
    res[name] = {k: {x: d[k].get(x) for x in ('share_within_20_levels', 'ssim_scenery', 'mean_abs_diff_levels', 'colour_look_corr', 'sharpness_vs_approved', 'whole_frame_within_20_levels')} for k in d if k in ('new', 'before')}
    res[name]['route_first'] = d['new'].get('route_first', [])[:3]; res[name]['zones'] = d['new'].get('zones_share_of_all_mismatch')
json.dump(res, open(os.path.join(out, 'section_compare.json'), 'w'), indent=1); print(json.dumps(res, indent=1))
