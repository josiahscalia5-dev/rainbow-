"""Rainbow round 46 - one ZIP for another AI assistant (ChatGPT) to SEE and READ everything built for Screens 05 + 06:
summary + how Benny swims, the approved pictures, the app's screens now, before / after pairs, swim sequences, the recordings, the numbers, the code
(full files + the round-46 diff) and the notes. Nothing secret, no paid assets, no APK (247 MB - on GitHub, path in the summary).
  python3 -I tools/world/r46_chatgpt_package.py <final textured run dir> <out.zip>"""
import os, sys, json, shutil, subprocess, zipfile, glob
from PIL import Image, ImageDraw, ImageFont

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RUN, OUT = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
STAGE = OUT[:-4] + '_stage'; P = os.path.join(STAGE, 'RAINBOW_r46_for_ChatGPT')
shutil.rmtree(STAGE, ignore_errors=True); os.makedirs(P)
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)


def cp(src, dst):
    d = os.path.join(P, dst); os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copyfile(os.path.join(REPO, src) if not os.path.isabs(src) else src, d)


def jpg(src, dst, q=90):
    d = os.path.join(P, dst); os.makedirs(os.path.dirname(d), exist_ok=True); Image.open(src).convert('RGB').save(d, quality=q)


def strip(frames, labels, dst, title):
    W = Image.new('RGB', (len(frames) * 416, 915 + 76), (30, 15, 50)); d = ImageDraw.Draw(W); d.text((10, 8), title, fill='white', font=FONT)
    for k, (f, lab) in enumerate(zip(frames, labels)):
        W.paste(Image.open(os.path.join(RUN, f'f_{f:05d}.png')).convert('RGB'), (k * 416, 76)); d.text((k * 416 + 8, 44), lab, fill=(255, 230, 120), font=FONT)
    d_ = os.path.join(P, dst); os.makedirs(os.path.dirname(d_), exist_ok=True); W.save(d_, quality=86)


def clip(f0, f1, dst):
    lst = os.path.join(STAGE, 'list.txt')
    with open(lst, 'w') as fh:
        for i in range(f0, f1 + 1): fh.write(f"file '{os.path.join(RUN, f'f_{i:05d}.png')}'\nduration {1 / 30:.6f}\n")
    d = os.path.join(P, dst); os.makedirs(os.path.dirname(d), exist_ok=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2,fps=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', d], check=True)


log = json.load(open(os.path.join(RUN, 'run_log.json')))
fr_at = lambda s: min(log, key=lambda f: abs(f['s'] - s))['i']

# ---- the pictures --------------------------------------------------------------------------------------------------------------------------
for f, n in (('references/05_flow_into_the_current.png', '05_approved.png'), ('references/06_crest_the_rinse_arch.png', '06_approved.png'),
             ('references/07_dive_the_washer_tube.png', '07_approved_next_screen.png'), ('references/hires/05_flow_into_the_current_1080.jpg', '05_approved_1080.jpg')):
    cp(f, 'images/1_approved/' + n)
for f in sorted(glob.glob(os.path.join(REPO, 'qa/kit46/preview_now/*.jpg'))): cp(f, 'images/2_app_screens_now/' + os.path.basename(f))
# single phone frames of the final run (412 x 915) at the places a player sees
places = [('05_start', 88.0), ('05_picture_position', 97.8), ('05_quarter', 101.0), ('05_middle', 114.6), ('05_strongest_bend', 118.0), ('05_three_quarter', 128.2),
          ('05_end', 140.5), ('05_to_06_join', 143.0), ('06_picture_position', 149.1), ('06_crest_bank', 153.3), ('06_descent', 158.0), ('06_middle', 164.8),
          ('06_rainbow_pool', 172.0), ('06_end', 184.0), ('06_to_07_connector', 189.0), ('07_entry', 193.4)]
for k, (nm, s) in enumerate(places):
    i = fr_at(s); jpg(os.path.join(RUN, f'f_{i:05d}.png'), f'images/3_phone_frames_final_run/{k + 1:02d}_{nm}_frame{i:04d}.jpg')
for d in ('screen05', 'screen06', 'evidence'):
    for f in sorted(glob.glob(os.path.join(REPO, 'qa/kit46', d, '*.jpg'))): cp(f, f'images/4_before_vs_new/{d}/' + os.path.basename(f))
# how Benny swims: consecutive frames of the final run
def seq(t0, n, step, title, dst):
    i0 = round(t0 * 30); fr = [i0 + k * step for k in range(n)]; strip(fr, [f"t {f / 30:.2f}s  s {log[f]['s']:.1f}  lat {log[f]['lat']:+.2f}" for f in fr], dst, title)
seq(1.2, 8, 2, 'Lane change LEFT (real touch swipe at 1.20 s): Benny leans and turns into the move, paws paddle faster, the camera follows smoothly', 'images/5_benny_swimming/01_lane_change_left.jpg')
seq(3.0, 8, 3, 'Double swipe RIGHT (3.00 s + 3.27 s): two lanes in one smooth move, no jump', 'images/5_benny_swimming/02_double_lane_change_right.jpg')
seq(9.95, 8, 3, 'JUMP (swipe up at 10.0 s): ballistic leap out of the water, splash, buoyant landing', 'images/5_benny_swimming/03_jump.jpg')
seq(13.3, 8, 3, 'Strongest right bend of 05 (frames 400-421: was cut off in round 45b) - whole body in frame', 'images/5_benny_swimming/04_right_bend_05.jpg')
seq(28.6, 8, 4, 'Screen 06 crest: the water banks up to 72 deg; Benny leans with it (max 42 deg), partly under water, camera nearly level', 'images/5_benny_swimming/05_06_crest_bank.jpg')
seq(44.0, 8, 4, '06 -> 07 connector: the water now follows his route (he sank to his hat here before the fix)', 'images/5_benny_swimming/06_06_to_07_connector.jpg')

# ---- the videos ------------------------------------------------------------------------------------------------------------------------------
for f in ('GAMEPLAY_05_06_07_TEXTURED_real_touch.mp4', 'GAMEPLAY_05_06_07_GRAY_geometry_real_touch.mp4'): cp('qa/kit46/run/' + f, 'video/' + f)
clip(30, 120, 'video/clip_01_05_start_lane_changes.mp4'); clip(290, 360, 'video/clip_02_jump.mp4'); clip(390, 440, 'video/clip_03_05_right_bend_was_cut_off.mp4')
clip(fr_at(140.0), fr_at(150.0), 'video/clip_04_05_to_06_join.mp4'); clip(fr_at(150.0), fr_at(158.0), 'video/clip_05_06_crest_bank.mp4'); clip(1340, 1439, 'video/clip_06_06_to_07.mp4')

# ---- numbers ---------------------------------------------------------------------------------------------------------------------------------
for f in ('qa/kit46/screen05/05_numbers.json', 'qa/kit46/screen06/06_numbers.json', 'qa/kit46/run/GAMEPLAY_05_06_07_TEXTURED_real_touch_checks.json',
          'qa/kit46/run/GAMEPLAY_05_06_07_GRAY_geometry_real_touch_checks.json', 'qa/kit46/run/coins_check.json', 'qa/kit45/run/swipe_plan_05_06.json',
          'qa/kit45/run/GAMEPLAY_05_to_06_TEXTURED_real_touch_r45b_checks.json'):
    cp(f, 'measurements/' + os.path.basename(f))

# ---- code (full files) + the round-46 diff -----------------------------------------------------------------------------------------------------
CODE = ['tools/world/world.html', 'tools/world/build_world.py', 'tools/world/world_layout.py', 'tools/world/blender_connectors.py', 'tools/world/build_world_app.sh',
        'tools/world/probe_frames.cjs', 'tools/world/coins_check.cjs', 'tools/world/r46_pairs.py', 'tools/world/r46_chatgpt_package.py',
        'tools/screenkit/water_ribbon.js', 'tools/screenkit/water_detail.py', 'tools/screenkit/bake.js', 'tools/screenkit/qa.js', 'tools/screenkit/blender_kit.py',
        'tools/screenkit/gn_assets.py', 'tools/screenkit/build.py', 'tools/screenkit/preview.cjs', 'tools/screenkit/preview_sheet.py', 'tools/screenkit/screen.html',
        'tools/screenkit/fitlib.py', 'tools/screenkit/screens/05/fit05.py', 'tools/screenkit/screens/06/fit06.py', 'tools/kit05/controls.js', 'tools/kit05/swimfx.js',
        'tools/reflock/section_run.cjs', 'tools/reflock/encode_run.py', 'src/game/bonusRoute.ts', 'src/game/Game.ts']
for f in CODE:
    if os.path.exists(os.path.join(REPO, f)): cp(f, 'code/' + f)
diff = subprocess.run(['git', '-C', REPO, 'diff', '94d5fc7', 'HEAD', '--', 'tools/world', 'tools/screenkit', 'tools/reflock/section_run.cjs'], capture_output=True, text=True).stdout
open(os.path.join(P, 'code', 'ROUND46_changes_vs_round45b.diff'), 'w').write(diff)

# ---- notes ----------------------------------------------------------------------------------------------------------------------------------
for f, n in (('qa/kit46/README.md', 'RESULTS_README.md'), ('docs/briefs/2026-11-22-r46/RESUME_R46.md', 'RESUME_R46.md'),
             ('.claude/skills/rainbow-screen-builder/LESSONS.md', 'LESSONS.md'), ('CLAUDE.md', 'PROJECT_RULES_CLAUDE.md')):
    cp(f, 'docs/' + n)
cp(os.path.join(REPO, 'qa/kit46/chatgpt/00_START_HERE.md'), '00_START_HERE.md')

# ---- zip ------------------------------------------------------------------------------------------------------------------------------------
if os.path.exists(OUT): os.remove(OUT)
with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(STAGE):
        for f in sorted(files):
            if f == 'list.txt': continue
            full = os.path.join(root, f); z.write(full, os.path.relpath(full, STAGE))
n = sum(len(fs) for _, _, fs in os.walk(P)); print(f'{OUT}: {os.path.getsize(OUT) / 1e6:.1f} MB, {n} files')
