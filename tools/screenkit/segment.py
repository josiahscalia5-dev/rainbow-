"""Rainbow screen kit - MASK + CLEAN PLATE step (round 43). For one approved picture: the areas the GAME draws itself (HUD, title,
Benny, his splash ring, coins, loose bubbles) are masked, so the bake never paints them onto the scenery; inside the mask the picture is
filled from its own surroundings (tools/reflock/plate.py, OpenCV Telea, no AI, no credits).
Benny and the coins are traced with SAM 2.1 tiny (adopted in round 43: same-box silhouette IoU 0.968 vs 0.623 for the hand-style
ellipses, coins 0.892 vs 0.710 - qa/reflock/r43/EXTRACTION_EVAL.md); its prompts come from the screen's own measurements (Benny box from
the fur blob up to the pompom top, coin circles), so nothing is clicked by hand. Without the model files it falls back to the ellipses.
  python3 -I tools/screenkit/segment.py <picture> <spec.json> <out dir> [--models DIR]
spec.json: {"hud_rows": 205, "title_box": [x0,y0,x1,y1], "benny_box": [x0,y0,x1,y1], "benny_points": [[x,y],...],
            "splash_ellipse": [cx,cy,rx,ry], "coins": [[x,y,r],...], "bubbles": [[x,y,r],...], "dilate_px": 6}
Writes mask.png (white = the game draws it), plate.png, mask_overlay.jpg, segment.json."""
import sys, os, json, argparse, subprocess
import numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(HERE, 'eval'))

ap = argparse.ArgumentParser(); ap.add_argument('picture'); ap.add_argument('spec'); ap.add_argument('out')
ap.add_argument('--models', default=os.environ.get('RAINBOW_MODELS', os.path.expanduser('~/.cache/rainbow-models'))); a = ap.parse_args()
os.makedirs(a.out, exist_ok=True); sp = json.load(open(a.spec))
rgb = np.asarray(Image.open(a.picture).convert('RGB')); H, W = rgb.shape[:2]; m = np.zeros((H, W), np.uint8); info = {'method': {}}
m[:sp.get('hud_rows', 0)] = 1
if sp.get('title_box'): x0, y0, x1, y1 = sp['title_box']; m[y0:y1, x0:x1] = 1
sam = None
if os.path.exists(os.path.join(a.models, 'sam2', 'vision_encoder.onnx_data')):
    from eval_extract import Sam2   # noqa: E402  (same wrapper that was scored in the evaluation)
    sam = Sam2(os.path.join(a.models, 'sam2')); sam.embed(rgb)
if sp.get('benny_box'):
    bx = sp['benny_box']
    if sam:
        bm, iou = sam.mask(bx, [tuple(p) for p in sp.get('benny_points', [])] or None); info['method']['benny'] = f'SAM 2.1 (pred IoU {iou:.3f})'; m |= bm.astype(np.uint8)
    else:
        e = np.zeros_like(m); cv2.ellipse(e, ((bx[0] + bx[2]) // 2, (bx[1] + bx[3]) // 2), (int(0.55 * (bx[2] - bx[0])), int(0.56 * (bx[3] - bx[1]))), 0, 0, 360, 1, -1); m |= e
        info['method']['benny'] = 'ellipse (SAM 2 model files missing: bash tools/screenkit/get_models.sh)'
if sp.get('splash_ellipse'):
    cx, cy, rx, ry = sp['splash_ellipse']; e = np.zeros_like(m); cv2.ellipse(e, (int(cx), int(cy)), (int(rx), int(ry)), 0, 0, 360, 1, -1); m |= e
for x, y, r in sp.get('coins', []):
    box = [int(x - r * 1.1), int(y - r * 1.15), int(x + r * 1.1), int(y + r * 1.2)]
    if sam and r >= 6:
        cm, _ = sam.mask(box); win = np.zeros_like(m); win[max(0, box[1] - int(r)):box[3] + int(r), max(0, box[0] - int(r)):box[2] + int(r)] = 1; m |= (cm.astype(np.uint8) & win)
    else:
        cv2.circle(m, (int(x), int(y)), int(r * 1.15) + 2, 1, -1)
info['method']['coins'] = 'SAM 2.1 per coin (circle below 6 px radius)' if sam else 'circles'
for x, y, r in sp.get('bubbles', []): cv2.circle(m, (int(x), int(y)), int(r) + 4, 1, -1)
for poly in sp.get('polygons', []): cv2.fillPoly(m, [np.array(poly, np.int32)], 1)   # r44: other game-drawn objects (04: the five arrows)
d = int(sp.get('dilate_px', 6)); m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * d + 1, 2 * d + 1)))
Image.fromarray(m * 255).save(os.path.join(a.out, 'mask.png'))
subprocess.run([sys.executable, '-I', os.path.join(REPO, 'tools', 'reflock', 'plate.py'), a.picture, os.path.join(a.out, 'mask.png'), os.path.join(a.out, 'plate.png')], check=True, stdout=subprocess.DEVNULL)
# r45: the small holes (painted coins, loose bubbles) are re-filled by clone + Poisson blend from the same painting (no ghost discs)
subprocess.run([sys.executable, '-I', os.path.join(HERE, 'plate_clone.py'), a.picture, os.path.join(a.out, 'mask.png'), os.path.join(a.out, 'plate.png'), '--top', str(sp.get('hud_rows', 190))], check=True, stdout=subprocess.DEVNULL)
ov = rgb.copy(); ov[m > 0] = (ov[m > 0] * 0.45 + np.array([255, 0, 255]) * 0.55).astype(np.uint8); Image.fromarray(ov).save(os.path.join(a.out, 'mask_overlay.jpg'), quality=85)
info['masked_share'] = round(float(m.mean()), 4); json.dump(info, open(os.path.join(a.out, 'segment.json'), 'w'), indent=1); print(json.dumps(info))
