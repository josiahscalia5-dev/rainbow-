"""Screen kit — extraction evaluation, step 2: SAM 2.1 (tiny, ONNX) and Depth Anything V2 (small, ONNX) vs the existing OpenCV workflow,
scored against EXACT ground truth rendered by the game (gt_frames.cjs). Free Apache-2.0 models run with the already-installed onnxruntime
(no torch, no services, no credits). Decision rule: a tool is adopted only where it beats the existing method on these numbers.
  python3 -I tools/screenkit/eval/eval_extract.py <gt dir> <models dir> <out dir> [--approved references/06_crest_the_rinse_arch.png ...]
Masks (Benny = the largest thing the bake must exclude; coins): IoU / precision / recall vs the game's own silhouettes.
  OpenCV  = analyze_reference.benny() blob (fur texture + colour) and its exclusion box (today's compare / bake masks), coin circles.
  SAM 2   = prompted AUTOMATICALLY with the OpenCV box (no hand clicks), best of its 3 masks by predicted IoU.
Depth: Spearman rank correlation and scale/shift-aligned AbsRel of inverse depth vs the ray-cast depth grid; baseline = a 'river plane'
prior (inverse depth linear in screen row below the horizon), i.e. what the perspective fit already gives without a network."""
import sys, os, json, argparse, time
import numpy as np, cv2
from PIL import Image
import onnxruntime as ort
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(REPO, '.claude', 'skills', 'rainbow-screen-builder', 'scripts'))
from analyze_reference import detect_hud as find_hud   # noqa: E402

MEAN, STD = np.array([0.485, 0.456, 0.406], np.float32), np.array([0.229, 0.224, 0.225], np.float32)


def opencv_benny(rgb, hud_bottom):
    """analyze_reference.benny(), returning the blob itself as well as its boxes"""
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV); H, W = rgb.shape[:2]; h, s, v = [hsv[..., i].astype(np.int32) for i in range(3)]
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32); mu = cv2.blur(g, (9, 9)); sd = np.sqrt(np.maximum(cv2.blur(g * g, (9, 9)) - mu * mu, 0))
    m = ((h >= 120) & (h <= 175) & (s > 60) & (v > 120) & (sd > 15)).astype(np.float32); m[:max(hud_bottom, int(H * 0.3))] = 0
    fr = (cv2.blur(m, (31, 31)) > 0.5).astype(np.uint8); fr = cv2.morphologyEx(fr, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fr, 8); best, bs = None, -1
    for i in range(1, n):
        x, y, w, hh, a = [int(t) for t in st[i]]
        if a < 0.01 * H * W: continue
        cnt, _ = cv2.findContours((lab == i).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        sol = a / max(1.0, cv2.contourArea(cv2.convexHull(max(cnt, key=cv2.contourArea)))); sc = sol ** 2 * (1 - abs(x + w / 2 - W / 2) / (W / 2)) * np.sqrt(a)
        if sc > bs: bs, best = sc, (i, x, y, w, hh)
    if best is None: return None
    i, x, y, w, hh = best; pad = [int(0.12 * w), int(0.08 * hh)]
    gen = [max(0, x - pad[0]), max(0, y - pad[1]), min(W, x + w + pad[0]), min(H, y + hh + 3 * pad[1])]
    return {'blob': lab == i, 'box': [x, y, x + w, y + hh], 'exclusion_box': gen}


class Sam2:
    def __init__(self, d):
        so = ort.SessionOptions(); so.intra_op_num_threads = 4
        self.enc = ort.InferenceSession(os.path.join(d, 'vision_encoder.onnx'), so, providers=['CPUExecutionProvider'])
        self.dec = ort.InferenceSession(os.path.join(d, 'prompt_encoder_mask_decoder.onnx'), so, providers=['CPUExecutionProvider'])
    def embed(self, rgb):
        self.H, self.W = rgb.shape[:2]; x = cv2.resize(rgb, (1024, 1024), interpolation=cv2.INTER_LINEAR).astype(np.float32) / 255.0
        x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]; o = self.enc.run(None, {'pixel_values': x}); self.emb = {f'image_embeddings.{i}': o[i] for i in range(3)}
    def mask(self, box, points=None):
        sx, sy = 1024 / self.W, 1024 / self.H; b = np.array([[[box[0] * sx, box[1] * sy, box[2] * sx, box[3] * sy]]], np.float32)
        pts = points or [((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)]
        p = np.array([[[[px * sx, py * sy] for px, py in pts]]], np.float32); l = np.ones((1, 1, len(pts)), np.int64)
        iou, pm, _ = self.dec.run(None, {'input_points': p, 'input_labels': l, 'input_boxes': b, **self.emb})
        k = int(np.argmax(iou[0, 0])); lo = pm[0, 0, k].astype(np.float32)
        return cv2.resize(lo, (self.W, self.H), interpolation=cv2.INTER_LINEAR) > 0.0, float(iou[0, 0, k])


class Depth:
    def __init__(self, d):
        so = ort.SessionOptions(); so.intra_op_num_threads = 4; self.s = ort.InferenceSession(os.path.join(d, 'model.onnx'), so, providers=['CPUExecutionProvider'])
    def __call__(self, rgb):
        H, W = rgb.shape[:2]; w = 518; h = int(round(H * w / W / 14)) * 14
        x = cv2.resize(rgb, (w, h), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255.0; x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
        return cv2.resize(self.s.run(None, {'pixel_values': x})[0][0], (W, H), interpolation=cv2.INTER_LINEAR)   # relative inverse depth


def scores(pred, gt):
    tp = float((pred & gt).sum()); fp = float((pred & ~gt).sum()); fn = float((~pred & gt).sum())
    return {'iou': round(tp / max(1, tp + fp + fn), 3), 'precision': round(tp / max(1, tp + fp), 3), 'recall': round(tp / max(1, tp + fn), 3)}


def spearman(a, b):
    ra = np.argsort(np.argsort(a)).astype(np.float64); rb = np.argsort(np.argsort(b)).astype(np.float64)
    return float(np.corrcoef(ra, rb)[0, 1])


def aligned_absrel(inv_pred, depth_gt):
    """fit inverse depth = s * pred + t (least squares), then AbsRel of the implied depth"""
    A = np.stack([inv_pred, np.ones_like(inv_pred)], 1); s, t = np.linalg.lstsq(A, 1.0 / depth_gt, rcond=None)[0]
    inv = np.maximum(s * inv_pred + t, 1e-4); return float(np.mean(np.abs(1.0 / inv - depth_gt) / depth_gt))


def med_relerr(inv_pred, depth_gt):
    """robust: fit inverse depth = s * pred + t with a Huber-like reweighting, report the MEDIAN relative depth error"""
    A = np.stack([inv_pred, np.ones_like(inv_pred)], 1); y = 1.0 / depth_gt; w = np.ones_like(y)
    for _ in range(5):
        st_ = np.linalg.lstsq(A * w[:, None], y * w, rcond=None)[0]; res = np.abs(A @ st_ - y); w = 1.0 / np.maximum(res, np.median(res) + 1e-6)
    inv = np.maximum(A @ st_, 1e-4); return float(np.median(np.abs(1.0 / inv - depth_gt) / depth_gt))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('gt'); ap.add_argument('models'); ap.add_argument('out'); ap.add_argument('--approved', nargs='*', default=[])
    a = ap.parse_args(); os.makedirs(a.out, exist_ok=True)
    G = json.load(open(os.path.join(a.gt, 'gt.json')))['frames']; sam = Sam2(os.path.join(a.models, 'sam2')); dep = Depth(os.path.join(a.models, 'depth'))
    rows, t_sam, t_dep = {}, [], []
    for cp, g in G.items():
        full = np.asarray(Image.open(os.path.join(a.gt, f'{cp}_full.png')).convert('RGB'))
        nob = np.asarray(Image.open(os.path.join(a.gt, f'{cp}_nobenny.png')).convert('RGB')); noc = np.asarray(Image.open(os.path.join(a.gt, f'{cp}_nocoins.png')).convert('RGB'))
        diff = lambda b: cv2.morphologyEx((np.abs(full.astype(np.int16) - b.astype(np.int16)).sum(2) > 36).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
        gtB, gtC = diff(nob), diff(noc)
        hb = find_hud(full).get('bottom_px', 120) if isinstance(find_hud(full), dict) else 120
        r = {'gt_benny_px': int(gtB.sum()), 'gt_coin_px': int(gtC.sum())}
        cvb = opencv_benny(full, hb)
        t0 = time.time(); sam.embed(full); t_sam.append(time.time() - t0)
        if cvb is not None and gtB.sum() > 500:
            ex = np.zeros_like(gtB); x0, y0, x1, y1 = cvb['exclusion_box']; ex[y0:y1, x0:x1] = True
            sm, siou = sam.mask(cvb['box'])
            r['benny'] = {'opencv_blob': scores(cvb['blob'], gtB), 'opencv_exclusion_box': scores(ex, gtB), 'sam2_from_opencv_box': scores(sm, gtB), 'sam2_pred_iou': round(siou, 3)}
            # SEGMENTATION ONLY (same correct box for every method, like the hand-measured Benny boxes of the fits): the box of the true
            # silhouette -> (a) today's padded exclusion rectangle, (b) the hand-style ellipses of fit_section.py, (c) SAM 2 box prompt
            ys_, xs_ = np.nonzero(gtB); bx = [int(xs_.min()), int(ys_.min()), int(xs_.max()) + 1, int(ys_.max()) + 1]; bw_, bh_ = bx[2] - bx[0], bx[3] - bx[1]
            rect = np.zeros_like(gtB); rect[max(0, bx[1] - int(0.08 * bh_)):bx[3] + int(0.24 * bh_), max(0, bx[0] - int(0.12 * bw_)):bx[2] + int(0.12 * bw_)] = True
            ell = np.zeros(gtB.shape, np.uint8); cx_, cy_ = (bx[0] + bx[2]) // 2, (bx[1] + bx[3]) // 2
            cv2.ellipse(ell, (cx_, cy_), (int(0.55 * bw_), int(0.56 * bh_)), 0, 0, 360, 1, -1); ell = ell > 0
            sg, sgi = sam.mask(bx)
            r['benny_seg_same_box'] = {'rect_padded': scores(rect, gtB), 'ellipse': scores(ell, gtB), 'sam2_box': scores(sg, gtB), 'sam2_pred_iou': round(sgi, 3)}
            vis = full.copy(); vis[sg & ~gtB] = (255, 0, 0); vis[~sg & gtB] = (0, 0, 255); vis[sg & gtB] = (vis[sg & gtB] * 0.4 + np.array([0, 255, 0]) * 0.6).astype(np.uint8)
            Image.fromarray(vis).save(os.path.join(a.out, f'{cp}_benny_sam2_samebox_vs_gt.jpg'), quality=88)
            vis = full.copy(); vis[sm & ~gtB] = (255, 0, 0); vis[~sm & gtB] = (0, 0, 255); vis[sm & gtB] = (vis[sm & gtB] * 0.4 + np.array([0, 255, 0]) * 0.6).astype(np.uint8)
            Image.fromarray(vis).save(os.path.join(a.out, f'{cp}_benny_sam2_vs_gt.jpg'), quality=88)
            vis = full.copy(); b = cvb['blob']; vis[b & ~gtB] = (255, 0, 0); vis[~b & gtB] = (0, 0, 255); vis[b & gtB] = (vis[b & gtB] * 0.4 + np.array([0, 255, 0]) * 0.6).astype(np.uint8)
            Image.fromarray(vis).save(os.path.join(a.out, f'{cp}_benny_opencv_vs_gt.jpg'), quality=88)
        # coins: GT coin blobs -> per coin, OpenCV circle (gold blob fit) vs SAM 2 prompted with that circle's box
        n, lab, st, cen = cv2.connectedComponentsWithStats(gtC.astype(np.uint8), 8); cvC = np.zeros_like(gtC); smC = np.zeros_like(gtC); used = np.zeros_like(gtC)
        hsv = cv2.cvtColor(full, cv2.COLOR_RGB2HSV); goldm = (hsv[..., 0] >= 8) & (hsv[..., 0] <= 30) & (hsv[..., 1] > 90) & (hsv[..., 2] > 140)
        for i in range(1, n):
            x, y, w, hh, ar = [int(t) for t in st[i]]
            if ar < 40: continue
            used |= lab == i
            # OpenCV: gold pixels in a padded window around the coin -> filled hull (the analyser's gold-blob rule)
            pad = max(4, w // 3); X0, Y0, X1, Y1 = max(0, x - pad), max(0, y - pad), min(full.shape[1], x + w + pad), min(full.shape[0], y + hh + pad)
            gm = goldm[Y0:Y1, X0:X1].astype(np.uint8); gm = cv2.morphologyEx(gm, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
            cs, _ = cv2.findContours(gm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if cs:
                hull = cv2.convexHull(max(cs, key=cv2.contourArea)); tmp = np.zeros_like(gm); cv2.fillPoly(tmp, [hull], 1); cvC[Y0:Y1, X0:X1] |= tmp > 0
                bx, by, bw, bh = cv2.boundingRect(hull); box = [X0 + bx, Y0 + by, X0 + bx + bw, Y0 + by + bh]
            else:
                box = [x, y, x + w, y + hh]
            m, _ = sam.mask(box); smC |= m & (np.abs(np.arange(full.shape[0])[:, None] - (box[1] + box[3]) / 2) < 1.6 * (box[3] - box[1]) + 4) & (np.abs(np.arange(full.shape[1])[None] - (box[0] + box[2]) / 2) < 1.6 * (box[2] - box[0]) + 4)
        if used.sum() > 0:
            win = cv2.dilate(used.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0   # score inside the neighbourhood of the GT coins only
            r['coins'] = {'n': int(sum(1 for i in range(1, n) if st[i][4] >= 40)), 'opencv_gold_hull': scores(cvC & win, gtC & win), 'sam2_from_opencv_box': scores(smC & win, gtC & win)}
        # depth
        dg = np.array(g['depth'], np.float64); GY, GX = dg.shape; ys = ((np.arange(GY) + 0.5) / GY * full.shape[0]).astype(int); xs = ((np.arange(GX) + 0.5) / GX * full.shape[1]).astype(int)
        t0 = time.time(); D = dep(full); t_dep.append(time.time() - t0)
        P = D[ys][:, xs]; ok = (dg > 0) & (dg < 400); ok[: int(np.ceil(hb / full.shape[0] * GY))] = False
        rowprior = np.tile(np.arange(GY, dtype=np.float64)[:, None], (1, GX))           # baseline: nearer toward the bottom of the frame
        if ok.sum() > 30:
            near = ok & (dg < 60)   # the scenery a fit has to place (the far glow / tunnel end is not modelled from depth)
            r['depth'] = {'cells': int(ok.sum()), 'da2_spearman_invdepth': round(spearman(P[ok], 1 / dg[ok]), 3), 'baseline_row_spearman': round(spearman(rowprior[ok], 1 / dg[ok]), 3),
                          'near_cells': int(near.sum()), 'da2_median_relerr_near': round(med_relerr(P[near], dg[near]), 3), 'baseline_median_relerr_near': round(med_relerr(rowprior[near], dg[near]), 3)}
            dv = (255 * (D - D.min()) / max(1e-6, np.ptp(D))).astype(np.uint8); Image.fromarray(cv2.applyColorMap(dv, cv2.COLORMAP_TURBO)[..., ::-1]).save(os.path.join(a.out, f'{cp}_da2_depth.jpg'), quality=85)
        rows[cp] = r; print(cp, json.dumps(r))
    def mean(k1, k2, k3):
        v = [rows[c][k1][k2][k3] if isinstance(rows[c].get(k1, {}).get(k2), dict) else rows[c].get(k1, {}).get(k2) for c in rows if k1 in rows[c]]
        v = [x for x in v if x is not None]; return round(float(np.mean(v)), 3) if v else None
    summary = {'benny_iou': {m: mean('benny', m, 'iou') for m in ('opencv_blob', 'opencv_exclusion_box', 'sam2_from_opencv_box')},
               'benny_recall': {m: mean('benny', m, 'recall') for m in ('opencv_blob', 'opencv_exclusion_box', 'sam2_from_opencv_box')},
               'coin_iou': {m: mean('coins', m, 'iou') for m in ('opencv_gold_hull', 'sam2_from_opencv_box')},
               'depth_spearman': {'da2': mean('depth', 'da2_spearman_invdepth', None), 'row_prior': mean('depth', 'baseline_row_spearman', None)},
               'benny_seg_same_box_iou': {m: mean('benny_seg_same_box', m, 'iou') for m in ('rect_padded', 'ellipse', 'sam2_box')},
               'benny_seg_same_box_recall': {m: mean('benny_seg_same_box', m, 'recall') for m in ('rect_padded', 'ellipse', 'sam2_box')},
               'depth_median_relerr_near': {'da2': mean('depth', 'da2_median_relerr_near', None), 'row_prior': mean('depth', 'baseline_median_relerr_near', None)},
               'cpu_seconds_per_frame': {'sam2_encoder': round(float(np.mean(t_sam)), 2), 'da2': round(float(np.mean(t_dep)), 2)}}
    # the approved pictures (no ground truth): SAM 2 Benny mask + DA2 depth as visual guides only
    for ref in a.approved:
        rgb = np.asarray(Image.open(os.path.join(REPO, ref)).convert('RGB')); tag = os.path.basename(ref)[:2]
        hb = find_hud(rgb).get('bottom_px', 200); cvb = opencv_benny(rgb, hb)
        if cvb:
            sam.embed(rgb); sm, siou = sam.mask(cvb['box']); vis = rgb.copy(); vis[sm] = (vis[sm] * 0.45 + np.array([0, 255, 0]) * 0.55).astype(np.uint8)
            cv2.rectangle(vis, tuple(cvb['box'][:2]), tuple(cvb['box'][2:]), (255, 255, 0), 3); Image.fromarray(vis).save(os.path.join(a.out, f'APPROVED_{tag}_benny_sam2.jpg'), quality=85)
            Image.fromarray((sm * 255).astype(np.uint8)).save(os.path.join(a.out, f'APPROVED_{tag}_benny_sam2_mask.png'))
        D = dep(rgb); dv = (255 * (D - D.min()) / max(1e-6, np.ptp(D))).astype(np.uint8)
        Image.fromarray(cv2.applyColorMap(dv, cv2.COLORMAP_TURBO)[..., ::-1]).save(os.path.join(a.out, f'APPROVED_{tag}_da2_depth.jpg'), quality=85); np.save(os.path.join(a.out, f'APPROVED_{tag}_da2_invdepth.npy'), D.astype(np.float16))
    json.dump({'per_frame': rows, 'summary': summary}, open(os.path.join(a.out, 'eval_extract.json'), 'w'), indent=1); print(json.dumps(summary, indent=1))


if __name__ == '__main__':
    main()
