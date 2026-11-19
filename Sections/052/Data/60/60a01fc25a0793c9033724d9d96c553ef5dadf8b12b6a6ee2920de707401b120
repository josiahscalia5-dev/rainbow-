"""Build permission to reuse known wall paint where the 3D crest hid that wall at the opening."""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

def ease(lo, hi, a):
    t = np.clip((a - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('floor_outline', type=Path)
    parser.add_argument('retained_mask', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    outline = np.array(json.loads(args.floor_outline.read_text()), dtype=float)
    with Image.open(args.retained_mask) as image:
        if image.size != (864, 1536) or outline.shape != (864,):
            raise ValueError('Expected the locked Screen 06 portrait camera')
        wall = np.array(image.convert('RGB'))[448:704,:,1] / 255.0
    distance_below_crest = np.arange(448,704)[:,None] - outline[None,:]
    # The measured newly visible strip is up to 27 native pixels at release.
    # Feather farther under the crest so opposite-side views retain their own wall material.
    near_crest = ease(-3,2,distance_below_crest) * (1-ease(32,78,distance_below_crest))
    # Claudia's traced green channel identifies wall already present in the approved image.
    # Water, foam and mixed shoreline pixels cannot supply a color for the tunnel behind them.
    known_wall = ease(.78,.98,wall)
    confidence = np.rint(255 * near_crest * known_wall).astype(np.uint8)
    Image.fromarray(confidence).save(args.destination, optimize=True)
    print(f'{np.count_nonzero(confidence)} pixels carry wall confidence; {args.destination.stat().st_size} bytes')

if __name__=='__main__':
    main()
