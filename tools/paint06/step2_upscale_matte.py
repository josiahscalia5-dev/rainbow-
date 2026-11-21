"""paint06 step 2 (paid, fal): faithful 4x upscale of panels 2-4 (SeedVR2 — chosen over ESRGAN/Topaz on panel 1: crispest wall
slots, best round-trip fidelity), 2x upscale of the approved Screen 06 frame, Benny matte (BiRefNet) from the approved frame."""
import sys, json
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, '/home/user/rainbow-/tools/paint06')
from fal import run, data_uri, download
from PIL import Image
R = '/home/user/rainbow-'; W = f'{R}/qa/match/06/paint06/work'
def up(src, dst, f, nm):
    r = run('fal-ai/seedvr/upscale/image', {'image_url': data_uri(src), 'upscale_factor': f}, name=nm, est_usd=0.1)
    download(r['image']['url'], dst); return nm, 'ok'
def matte():
    im = Image.open(f'{R}/references/06_crest_the_rinse_arch.png').convert('RGB').crop((120, 680, 744, 1270))
    im.save(f'{W}/benny_crop_appr.png')
    r = run('fal-ai/birefnet/v2', {'image_url': data_uri(f'{W}/benny_crop_appr.png'), 'model': 'General Use (Heavy)', 'output_format': 'png', 'refine_foreground': False}, name='benny_matte', est_usd=0.01)
    download(r['image']['url'], f'{W}/benny_matte_raw.png'); return 'matte', 'ok'
jobs = [(up, (f'{W}/panel{k}.png', f'{W}/panel{k}_seedvr4.png', 4, f'panel{k}_seedvr4')) for k in (2, 3, 4)]
jobs.append((up, (f'{R}/references/06_crest_the_rinse_arch.png', f'{W}/appr06_seedvr2.png', 2, 'appr06_seedvr2')))
jobs.append((matte, ()))
with ThreadPoolExecutor(5) as ex:
    for f in [ex.submit(fn, *a) for fn, a in jobs]:
        try: print(f.result())
        except Exception as e: print('ERR', str(e)[:300])
