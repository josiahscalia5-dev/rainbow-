# Pending environment permission (free; waiting for the user to approve ON A COMPUTER)

Requested 2026-11-18 ~10:35 UTC, denied at the prompt because the user was on a phone ("the environment update permission
says it must be approved on my computer"). User: "When I tell you I'm on my computer, please submit a NEW environment
update permission request so I can approve it there." Do NOT re-request before the user says so.

## Exact request to submit again (tool `update_environment`, after `get_environment`)
* environment_name: `rainbow-` (personal; applies to all of the user's future sessions on it)
* add_allowed_hosts (exact):
  - `huggingface.co`            — Depth Anything 3 model cards / weights index
  - `cdn-lfs.huggingface.co`    — weight file downloads (older LFS storage)
  - `cdn-lfs-us-1.hf.co`        — weight file downloads (US LFS mirror)
  - `cas-bridge.xethub.hf.co`   — weight file downloads (Xet storage, used by newer repos such as DA3)
  - `download.pytorch.org`      — the small CPU-only PyTorch build (~200 MB; the PyPI build is the ~4 GB GPU build)
* reason: "Allow Hugging Face + PyTorch CPU downloads to test Depth Anything 3 for free on your approved pictures."
* No credits, no paid service. Nothing else changes.

## What runs once approved (free, CPU only, this container has no GPU)
1. `pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu`; clone
   `github.com/ByteDance-Seed/Depth-Anything-3` (GitHub is reachable); download DA3 small / base / large weights (check each
   checkpoint's licence on its model card: some are Apache-2.0, the Nested-Giant one is CC BY-NC 4.0).
2. Run on the approved pictures 04, 06, 07 (architecture problems) and 05 / 08: depth, estimated camera field of view,
   point cloud; render the point cloud from moved viewpoints (3 / 6 / 10 u forward) to see whether the recovered washer
   opening, ring spacing, tunnel bend and river channel are correct for stylized art.
3. Only if the recovered shapes are correct: use them to rebuild the wrong architecture (04 interior, 06 bent tunnel and
   S-loop, 07 tube proportions) and show APPROVED / BEFORE / NEW game frames. If not correct: reject DA3 and say so.
If the user cannot approve hosts, alternatives: the Hugging Face connector on claude.ai (runs DA3 / TRELLIS.2 demo Spaces on
Hugging Face GPUs, free daily quota) or MoGe-3 on the existing fal account (paid, a few cents per picture — needs approval).
