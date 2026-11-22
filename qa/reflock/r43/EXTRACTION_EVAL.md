# SAM 2 and Depth Anything V2 — controlled evaluation (round 43, 2026-11-22)

**Decision: SAM 2.1 ADOPTED for the bake masks (Benny, coins). Depth Anything V2 NOT used for geometry — optional cross-check only.**

## Resources and cost (checked before use)
* Container: 4 CPUs, 15 GB RAM, ~38 GB free disk, no GPU. Already installed: onnxruntime 1.29, OpenCV 5.1. No torch.
* Models: the official ONNX exports `onnx-community/sam2.1-hiera-tiny-ONNX` (≈150 MB) and `onnx-community/depth-anything-v2-small`
  (≈100 MB), both **Apache-2.0**, downloaded free from Hugging Face into `~/.cache/rainbow-models` (`tools/screenkit/get_models.sh`).
  Nothing new installed (runs on the existing onnxruntime), no service, no account, **no credits**. Not committed (public repo, size).
* Speed: ≈1.5 s per picture for the SAM 2 encoder, ≈1.4 s for Depth Anything (CPU).

## Method: exact ground truth from the game itself
A segmentation / depth tool cannot be scored on the paintings (no ground truth). The game's own frames share their style, so
`tools/screenkit/eval/gt_frames.cjs` rendered the checkpoint frames of Screens 04–10 three times — normal, Benny hidden, coins hidden — so the
pixel difference is the EXACT Benny / coin silhouette, plus a ray-cast depth grid (24 × 52 rays per frame).
`tools/screenkit/eval/eval_extract.py` then scored, on the same frames:
* **Benny silhouette, same box for every method** (what the bake needs: the masks of what the game draws itself; our fits always measure
  Benny's box by hand / from the fur blob up to the pompom): today's padded rectangle, the hand-style ellipses of `fit_section.py`, SAM 2
  prompted with that box.
* **Coins**: our OpenCV gold-blob hull vs SAM 2 prompted with the same coin box.
* **Depth**: Depth Anything V2 vs a "river plane" prior (nearer toward the bottom of the frame), Spearman rank correlation and the median
  relative depth error after scale / shift alignment, scenery within 60 u.

## Results (mean over the frames, `extraction_eval/eval_extract.json`)
| measure | existing OpenCV workflow | SAM 2.1 tiny | |
|---|---|---|---|
| Benny silhouette IoU (same box) | rectangle 0.389 · ellipse 0.623 | **0.968** (recall 0.993) | adopted |
| coin silhouette IoU | 0.710 | **0.892** | adopted |
| automatic Benny detection (no box) | OpenCV fur blob fails on 06 / 07 / 08 (IoU ≈ 0) | SAM 2 then segments the wrong object | detection stays a measured box per screen |

| depth | river-plane prior | Depth Anything V2 small | |
|---|---|---|---|
| Spearman (inverse depth) | 0.860 | **0.925** | better ordering |
| median relative depth error (≤ 60 u) | 18.3 % | **13.9 %** | still too coarse to build geometry from |

On the approved Screen 06 picture, Depth Anything placed the first coins at 2.5–7 u where the coins' own painted sizes (equal coins, depth = k /
radius) give 3.7–12 u; it agrees on the ORDER (and confirmed that the crest arch stands in front of the drum wall), so `fit06.py` prints it
as a cross-check (`da2_check` in layout.json) and never uses it for geometry.

## In use
`tools/screenkit/segment.py` traces Benny and the coins with SAM 2 from the prompts in `screens/NN/segmentNN.json` (Screen 06: predicted IoU
0.951, `APPROVED_06_kit_mask_overlay.jpg`), falls back to the ellipses if the model files are missing, and writes the clean plate with the
existing OpenCV inpainting (`tools/reflock/plate.py`). Pictures: `extraction_eval/` (green = SAM 2 ∩ truth, red = extra, blue = missed).
