#!/usr/bin/env bash
# Rainbow screen kit: fetch the two FREE open models used by tools/screenkit (round 43 evaluation, qa/reflock/r43/EXTRACTION_EVAL.md):
#   SAM 2.1 hiera-tiny (Apache-2.0, ONNX export onnx-community/sam2.1-hiera-tiny-ONNX)   -> masks of Benny / coins in the approved pictures
#   Depth Anything V2 Small (Apache-2.0, onnx-community/depth-anything-v2-small)        -> optional depth cross-check (guide only)
# Runs with the already installed onnxruntime (no torch, no service, no credits). ~255 MB into $RAINBOW_MODELS (default ~/.cache/rainbow-models).
# Never committed to the repository (public repo, size).
set -e
M=${RAINBOW_MODELS:-$HOME/.cache/rainbow-models}; mkdir -p "$M/sam2" "$M/depth"
dl(){ [ -s "$2" ] && return 0; for i in 1 2 3 4; do curl -sSL --fail -o "$2.part" "$1" && mv "$2.part" "$2" && return 0; sleep $((i * 3)); done; echo "download failed: $1"; return 1; }
H=https://huggingface.co
for f in vision_encoder.onnx vision_encoder.onnx_data prompt_encoder_mask_decoder.onnx prompt_encoder_mask_decoder.onnx_data; do dl "$H/onnx-community/sam2.1-hiera-tiny-ONNX/resolve/main/onnx/$f" "$M/sam2/$f"; done
dl "$H/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx" "$M/depth/model.onnx"
python3 -c "import onnxruntime" 2>/dev/null || { echo "onnxruntime missing (pip install onnxruntime) - ask the user first"; exit 1; }
echo "models ready in $M"
