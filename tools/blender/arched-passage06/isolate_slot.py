"""Remove the repeated lighting from a rectified photograph of the approved drum slots.

The slot's actual outline, recess and lower rim are separated from the large vertical reflection.
The game applies that reflection across a complete washer bay in world space.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter


def bake(photo, output):
    rgb = np.asarray(Image.open(photo).convert("RGB"), dtype=float) / 255.
    x0, x1, y0, y1 = 90, 223, 36, 119
    luminance = rgb @ np.asarray([.27, .52, .21])
    sampled = luminance[y0:y1, x0:x1]
    # Read the nearby uncut metal above and below the same hole. The bright stripe is
    # part of the shared illumination and drops out of the relative depth measurement.
    top = gaussian_filter(luminance[30:42, x0:x1].mean(axis=0), 4.)
    bottom = gaussian_filter(luminance[112:128, x0:x1].mean(axis=0), 4.)
    height = np.linspace(0., 1., y1 - y0)[:, None]
    field = top * (1. - height) + bottom * height
    delta = (field - sampled) / np.maximum(.17, field)
    edge = np.sin(np.pi * np.linspace(0., 1., x1 - x0))[None, :] ** .65
    window = edge * np.sin(np.pi * height) ** .9
    recess = np.clip((delta - .08) * 2.40, 0., 1.) * window
    rim = np.clip((-delta - .045) * 2.40, 0., 1.) * window
    result = np.stack([recess, rim, np.zeros_like(rim)], axis=-1)
    Image.fromarray(np.rint(result * 255).astype(np.uint8)).save(output)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("rectified_original", type=Path)
    parser.add_argument("slot_output", type=Path)
    args = parser.parse_args()
    bake(args.rectified_original, args.slot_output)
