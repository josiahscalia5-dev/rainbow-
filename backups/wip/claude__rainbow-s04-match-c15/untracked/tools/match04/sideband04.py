#!/usr/bin/env python3
"""r15 `&m04sband`: the painted pink / magenta / cyan swirl bands of references/04 as a side-bank tile.

The painted bands left of Benny sweep round him as a slowly tightening spiral (centre ~ (345, 1290) px). Unwrapping that
spiral (radius corrected by K px per degree) straightens them into stripes running down the columns' length:
columns = across the bands (inner = Benny side -> outer), rows = along the bands. A clean window (no Benny, foam, coin)
is cut and made seamless along its length by a cross-fade. Output colours = the approved display pixels (unchanged).
  python3 -I tools/match04/sideband04.py [out.png] [--preview DIR]
"""
import sys
import numpy as np
from PIL import Image

REF = 'references/04_through_the_five_arrows.png'
CX, CY, K = 345.0, 1290.0, -1.1          # spiral centre (px) and radius drift (px per degree)
R0, R1 = 170.0, 315.0                    # across the bands: inner (Benny side) .. outer radius (px)
T0, T1 = 175.0, 132.5                    # along the bands: angle (deg, y up) window
NX, NY, OV = 256, 300, 70                # tile size (across, along) before the seam cross-fade; overlap rows


def main():
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'assets/textures/match04/tile_side04.png'
    im = np.asarray(Image.open(REF).convert('RGB')).astype(np.float32)
    H, W, _ = im.shape
    rho = np.linspace(R0, R1, NX)
    th = np.linspace(T0, T1, NY)
    R, T = np.meshgrid(rho, th)
    Rr = R + K * (T - 150.0)
    A = np.radians(T)
    x = np.clip(CX + Rr * np.cos(A), 0, W - 1.001)
    y = np.clip(CY - Rr * np.sin(A), 0, H - 1.001)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = (x - x0)[..., None], (y - y0)[..., None]
    src = (im[y0, x0] * (1 - fx) * (1 - fy) + im[y0, x0 + 1] * fx * (1 - fy)
           + im[y0 + 1, x0] * (1 - fx) * fy + im[y0 + 1, x0 + 1] * fx * fy)
    L = NY - OV                                   # seamless length: row L wraps to row 0
    tile = src[:L].copy()
    w = (np.arange(OV) / OV)[:, None, None]
    tile[:OV] = src[L:L + OV] * (1 - w) + src[:OV] * w
    Image.fromarray(tile.clip(0, 255).astype(np.uint8)).save(out)
    print('wrote', out, tile.shape[1], 'x', tile.shape[0])
    if '--preview' in sys.argv:
        d = sys.argv[sys.argv.index('--preview') + 1]
        t = Image.open(out)
        rep = Image.new('RGB', (t.width * 2, t.height * 3))
        for j in range(3):
            rep.paste(t, (0, j * t.height)); rep.paste(t.transpose(Image.FLIP_LEFT_RIGHT), (t.width, j * t.height))
        rep.save(f'{d}/tile_side04_repeat.png')


if __name__ == '__main__':
    main()
