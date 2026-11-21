# Depth Anything 3 — free CPU test on the approved pictures 04–08 (account 11 lead, 2026-11-18 ~11:45–12:05 UTC)

User order (2026-11-18, on a computer): request the DA3 network permissions, then test whether DA3 genuinely helps reproduce
the approved scenery. No paid jobs; never replace existing successful reconstruction work.

## Network / environment
No permission request was needed: this account's cloud environment ("Default") has UNRESTRICTED network, so
`huggingface.co`, `cdn-lfs-us-1.hf.co`, `cas-bridge.xethub.hf.co` and `download.pytorch.org` are reachable (the two CDN
hosts answer 403 to a bare URL without a signed key — normal; signed downloads worked). `cdn-lfs.huggingface.co` no longer
exists (no DNS; retired by Hugging Face). The DA3 code is read through the session's git proxy
(`git clone https://github.com/ByteDance-Seed/Depth-Anything-3`). The Hugging Face connector is not available in this
session and was not needed (direct downloads work; stills run fine on CPU). If a future account's environment is
LIMITED, use `docs/briefs/2026-11-18-r10/PENDING_ENVIRONMENT_REQUEST.md`.

## Setup (reinstall on a new container, ~5 min, 1.3 GB venv + 3 GB weights, outside the repo)
```
mkdir -p /home/user/da3 && cd /home/user/da3 && git clone --depth 1 https://github.com/ByteDance-Seed/Depth-Anything-3 src
python3 -m venv venv && . venv/bin/activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install einops addict omegaconf huggingface_hub safetensors pillow opencv-python-headless imageio plyfile scipy \
  matplotlib tqdm trimesh "moviepy==1.0.3" pycolmap evo
pip install --no-deps --ignore-requires-python -e src      # package caps Python at "<=3.13"; 3.13.18 works
HF_HOME=/home/user/da3/hf OMP_NUM_THREADS=2 nice -n 15 python tools/da3/run_da3.py DA3-BASE,DA3MONO-LARGE,DA3METRIC-LARGE <out>
```
Licences: DA3-SMALL, DA3-BASE, DA3MONO-LARGE, DA3METRIC-LARGE = **Apache-2.0** (used). DA3-LARGE, DA3-GIANT = CC BY-NC 4.0
(non-commercial — NOT used). Resources: 4 CPUs, 15 GB RAM, no GPU; 2–5 s per picture per model at 504 px on 2 threads.

## Method (validation against known geometry, not "does the depth look nice")
`scripts/match-probe.mjs` exported the game's TRUE per-pixel view depth + camera at each screen's approved viewpoint
(lead checkout, `match08=1&coins08px=1`, `match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1`, `match04/06/07=1`). Screen 08's
geometry is hand-fitted to the approved picture (projection method, scenery 95 % at the painted view) = the reference.
`tools/da3/compare.py` aligns each DA3 depth to the game depth (scale, or affine in inverse depth), masks HUD / Benny /
coins / particles, and scores agreement. Evidence: `qa/da3/2026-11-18/` (`NN_2_GAME_depth_at_approved_view.png`,
`NN_5_DA3MONO_own_scale_depth.png`, `NN_3_…_depth.png` / `NN_4_…_disagreement.png` on the game's scale, `metrics.json`,
raw depth `depth_npz/`). Colours: red = near, blue = far.

## Results (DA3MONO-LARGE, the best of the three; near/far rank agreement = Spearman ρ)
| Screen | ρ | within 1.25× after alignment | What DA3 sees in the painting vs the game |
|---|---|---|---|
| 08 | 0.94 | 66 % | SAME layout as our hand-fitted geometry: round arch opening, chamber, towel platform, spout cups, river course → DA3 reads this painted style correctly at architecture level |
| 07 | 0.97 | 81 % | agrees: centred deep tube |
| 05 | 0.995 | 83 % | agrees on layout; DA3 compresses the far tunnel (depth ratios off far away) |
| 06 | 0.48 | 49 % | **DISAGREES**: DA3 sees the tunnel's far end OFF-CENTRE at the upper right and the river's S-loop; the game has a straight centred tunnel — exactly the class-A architecture defect named in the round-10 audit |
| 04 | 0.51 | 60 % | DA3 sees the washer opening as a soft funnel deepening toward the centre, laundry room as a flat band above; the game's depth at the approved view (this checkout) is mostly one flat surface |
Field of view: DA3-BASE estimates 45–61° vertical vs the game's fitted 62–66° → NOT reliable enough to set the camera.
Resolution ≈ 280 × 504: large shapes only — individual rings, slots, foam and arrows are NOT resolved.

## Verdict: NOT YET PROVEN (as a game improvement) — useful as a MEASUREMENT tool for 06 and 04
* Trustworthy for the large-scale architecture of this art (validated on 08, consistent on 05/07).
* It cannot see what the paintings never show (04 interior, 07 plunge, rest of 06) — unseen areas still need faithful
  continuation / user-approved reference views.
* Concrete use when 06 enters the rotation: DA3 depth → point cloud → fit the bent tunnel's centre line, ring positions
  and the river S-loop → rebuild that geometry (class A), then keep the 08-style camera projection of the user's pixels.
  For 04: the opening funnel's depth profile as a guide for the interior shape. 05/07/08: confirms current geometry, no change.
* Only a better-looking game frame (APPROVED / BEFORE / NEW) can turn this into GOOD IMPROVEMENT. Existing work untouched.
