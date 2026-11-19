"""Recover yarn relief from the owner's photographed white knit and purple pom in Screen 06."""
from pathlib import Path
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter


def linear(srgb):
    v = srgb / 255.
    return np.where(v < .04045, v / 12.92, ((v + .055) / 1.055) ** 2.4)


def reflect_tile(pixels):
    return np.concatenate((np.concatenate((pixels,pixels[:,::-1]),1),
                           np.concatenate((pixels[::-1],pixels[::-1,::-1]),1)),0)


if __name__ == "__main__":
    original, output = map(Path,sys.argv[1:])
    source=np.asarray(Image.open(original).convert("RGB"),dtype=float)
    # Actual white stitches clear of the star and violet border.
    white=source[949:968,374:446]
    luma=white @ np.array([.2126,.7152,.0722])
    relief=np.clip(.54 + (luma-gaussian_filter(luma,5.))/73.,0.,1.)
    Image.fromarray(np.uint8(np.rint(255*reflect_tile(relief)))).save(output/"benny-reference-stitches.png")
    # The photographed pom has visibly clumped purple yarn, distinct from the dyed body.
    yarn=source[768:835,378:443]
    light=yarn @ np.array([.2126,.7152,.0722])
    local=light-gaussian_filter(light,5.)
    height=np.clip(.49+local/140.,.02,.99)
    dry=np.clip(linear(yarn)*np.array([.64,.74,.73]),0.,1.)
    tile=np.dstack((dry,height))
    Image.fromarray(np.rint(255*reflect_tile(tile)).astype(np.uint8)).save(output/"benny-reference-pom.png")
