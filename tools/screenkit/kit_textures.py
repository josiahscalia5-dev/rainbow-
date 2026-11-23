"""Rainbow round 49 - the KIT's repeating surface textures (user 2026-11-23: "use repeating surface textures for fine wall detail").
One seamless tile of the washer drum wall in the approved Screen 05 colours (sampled from references/05_flow_into_the_current.png: magenta
metal 214,72,214 / violet 128,46,196 / bright pink-white 255,190,250 / slot interior 70,14,98): staggered rows of rounded slots that run ALONG
the drum (they point to the vanishing point, as painted), a soft bevel around every slot, fine brushed streaks along the drum. Writes
  wall_albedo.png (RGB) and wall_normal.png (tangent-space normal from the bevel height; x = around the drum, y = along it).
Tile = 4 slot columns (around) x 3 slot rows (along); the game repeats it with the mesh UVs (world.html kitMat).
  python3 -I tools/screenkit/kit_textures.py <out dir>"""
import os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
N = 512; COLS, ROWS = 4, 3
y, x = np.mgrid[0:N, 0:N].astype(np.float32) / N            # x around the drum, y along it (both 0..1, periodic)
gx, gy = x * COLS, y * ROWS
col = np.floor(gx); gy_s = gy + 0.5 * (col % 2)              # stagger every other column along the drum
fx, fy = gx - col - 0.5, (gy_s % 1.0) - 0.5
# rounded slot (capsule) along y: half length 0.26, radius 0.12 (cell units, cell = 1/COLS x 1/ROWS of the tile)
qy = np.maximum(np.abs(fy) - 0.24, 0.0); sd = np.sqrt((fx * COLS / ROWS * 0.75) ** 2 + qy ** 2) - 0.11   # aspect-corrected distance
hole = 1.0 / (1.0 + np.exp(sd / 0.006))                     # 1 inside the slot
bevel = np.clip(sd / 0.05, 0, 1)                             # 0 at the slot edge -> 1 on the plate
height = np.where(sd < 0, -0.6, 0.5 - 0.5 * np.cos(np.pi * bevel))
height = gaussian_filter(height, 1.2, mode='wrap')
# brushed streaks along the drum (fine, low contrast), periodic
rng = np.random.default_rng(49); stre = rng.standard_normal(N).astype(np.float32); stre = gaussian_filter(stre, 1.5, mode='wrap'); stre = (stre - stre.mean()) / (stre.std() + 1e-6)
brushed = stre[None, :].repeat(N, 0) * 0.035
c_mag, c_vio, c_hi, c_in = np.array([214, 72, 214]) / 255, np.array([128, 46, 196]) / 255, np.array([255, 190, 250]) / 255, np.array([70, 14, 98]) / 255
# plate colour: magenta with violet in the gaps between slot rows, a pink-white glint along each slot's upper bevel (light from above)
plate = c_mag[None, None] * (1 + brushed[..., None]) * 0.92 + c_vio[None, None] * 0.08
plate = plate * (0.9 + 0.1 * np.clip(height, 0, 1)[..., None])
glint = np.clip(1 - np.abs(sd - 0.022) / 0.012, 0, 1) * (fx < 0.02)            # rim highlight on one side of each slot
plate = plate * (1 - 0.6 * glint[..., None]) + c_hi[None, None] * 0.6 * glint[..., None]
alb = plate * (1 - hole[..., None]) + c_in[None, None] * hole[..., None]
inner_glow = np.clip(1 - np.abs(sd + 0.025) / 0.02, 0, 1) * hole                # a faint pink glow just inside the slot
alb = alb + np.array([0.35, 0.08, 0.3])[None, None] * inner_glow[..., None] * 0.5
Image.fromarray((np.clip(alb, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(OUT, 'wall_albedo.png'))
# tangent-space normal from the height (periodic differences)
s = 6.0; dx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) * s; dy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) * s
nrm = np.stack([-dx, -dy, np.ones_like(dx)], -1); nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
Image.fromarray(((nrm * 0.5 + 0.5) * 255).round().astype(np.uint8)).save(os.path.join(OUT, 'wall_normal.png'))
print('kit textures:', OUT, 'wall_albedo.png + wall_normal.png', N, 'px, tile', COLS, 'x', ROWS, 'slots')
