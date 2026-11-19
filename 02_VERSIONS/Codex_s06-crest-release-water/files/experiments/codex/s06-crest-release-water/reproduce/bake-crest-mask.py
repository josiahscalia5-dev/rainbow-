"""Fit a world-anchored projection validity mask to the occluded opening floor."""
from argparse import ArgumentParser
from pathlib import Path
import hashlib
import json

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

def rgb(path):
    return np.asarray(Image.open(path).convert("RGB"))

parser = ArgumentParser()
parser.add_argument("source_mask", type=Path)
parser.add_argument("isolation_images", type=Path)
parser.add_argument("output_mask", type=Path)
args = parser.parse_args()
m = rgb(args.source_mask).copy()
if m.shape != (1536, 864, 3) or m[:, :, 2].any():
    raise ValueError("Expected the retained 864 × 1536 red/green projection mask")
def response(name):
    dark = rgb(args.isolation_images / (name + "-dark.png")).astype(np.int16)
    bright = rgb(args.isolation_images / (name + "-bright.png")).astype(np.int16)
    return np.max(np.abs(bright - dark), axis=2)

visible_response = response("with-Benny")
hidden_response = response("without-Benny")
# The floor must be opaque behind the captured mascot and completely hidden at the
# approved pose. Limit the correction to Claudia's existing provisional actor fill.
occluded_floor = (visible_response == 0) & (hidden_response > 100) & (m[:, :, 0] >= 140)
# Inset before feathering, so bilinear sampling never changes the exposed opening.
dist = distance_transform_edt(occluded_floor)
u = np.clip((dist - 5.0) / 13.0, 0.0, 1.0)
m[:, :, 2] = np.rint(255 * u * u * (3.0 - 2.0 * u)).astype(np.uint8)
args.output_mask.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(m).save(args.output_mask, optimize=True)
ys, xs = np.where(m[:, :, 2] > 0)
if not len(xs):
    raise ValueError("No visible actor occlusion identified")
summary = {"size": [864, 1536], "opaqueOcclusionPixels": int(occluded_floor.sum()),
           "blueMaskPixels": len(xs), "fullWeightPixels": int((m[:, :, 2] == 255).sum()),
           "boundsInPlate": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
           "sourceMaskSHA256": hashlib.sha256(args.source_mask.read_bytes()).hexdigest(),
           "experimentalMaskSHA256": hashlib.sha256(args.output_mask.read_bytes()).hexdigest()}
probe = args.isolation_images / "probes.json"
if probe.exists():
    sample_weights = []
    for pt in json.loads(probe.read_text())["projectedSamples"]["points"]:
        x, y = (round(v) for v in pt["platePixel"])
        if 0 <= x < 864 and 0 <= y < 1536:
            sample_weights.append({**pt, "actorMask": int(m[y, x, 2]), "priorFillMask": int(m[y, x, 0])})
    summary["releaseSamples"] = sample_weights
(args.isolation_images / "mask-summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print("Static mask", summary["boundsInPlate"], summary["blueMaskPixels"], "texels")
