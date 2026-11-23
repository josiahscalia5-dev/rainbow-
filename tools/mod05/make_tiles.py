"""Round 47 (2026-11-23) - MODULAR Screen 05: the repeating surface textures, drawn (not cut) in the approved picture's own measured colours.
  python3 -I tools/mod05/make_tiles.py <out dir>
Writes (sRGB PNG, every tile seamless in both directions so it can repeat around and along the tunnel):
  wall_tile.png  1024 x 2048   one tile = 1/16 of the drum circumference (u) x half a ring spacing (v, along the tunnel)
                               stadium slots in staggered rows running AROUND the tunnel, brushed sheen + bright streaks running ALONG it
  ring_tile.png  1024 x 256    one tile = 1/12 of a gold ring (u) x the ring's profile (v): gold bands, two dark grooves, bright lamp spots
  palette.json                 the measured colours (references/05_flow_into_the_current.png, wall zone between the rings, read-only)
Colours measured this round (wall zone y 200-640 minus the core, hue 255-335, saturation > 0.25; 175,614 px):
  violet (152,51,209) 17 % | purple (172,48,192) 25 % | magenta (214,50,191) 35 % | pink-magenta (196,39,141) 24 %
  bright 90th percentiles (188,81,250) (243,106,252) (255,122,249) (248,65,186); streak white-pink (255,238,250) = 7.5 % of the wall zone
  slots (dark wall px): (35,0,34) .. (120,18,110); gold (hue 15-55): 3 % (193,63,5), 25 % (239,111,50), 50 % (251,136,91), 90 % (240,214,75), 97 % (255,228,137)
No paid tools; numpy + Pillow only.
"""
import sys, os, json
import numpy as np
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(4747)

PAL = {
    'violet': (152, 51, 209), 'purple': (172, 48, 192), 'magenta': (214, 50, 191), 'pinkmag': (196, 39, 141),
    'violet_hi': (188, 81, 250), 'purple_hi': (243, 106, 252), 'magenta_hi': (255, 122, 249), 'pinkmag_hi': (248, 65, 186),
    'streak': (255, 238, 250), 'slot_deep': (35, 0, 34), 'slot_mid': (90, 8, 82), 'slot_rim': (255, 150, 248),
    'gold_dark': (193, 63, 5), 'gold_25': (239, 111, 50), 'gold_50': (251, 136, 91), 'gold_90': (240, 214, 75), 'gold_97': (255, 228, 137),
}
lin = lambda c: (np.asarray(c, np.float32) / 255.0) ** 2.2          # mix in linear light, store sRGB
srgb = lambda x: (np.clip(x, 0, 1) ** (1 / 2.2) * 255 + 0.5).astype(np.uint8)


def pnoise(u, v, nu, nv, seed, octaves=3):
    """Smooth noise periodic in u (period 1, nu cells) and v (period 1, nv cells); u, v in [0, 1)."""
    out = np.zeros_like(u); amp = 1.0; tot = 0.0; r = np.random.default_rng(seed)
    for o in range(octaves):
        cu, cv = nu * 2 ** o, nv * 2 ** o
        G = r.random((cv, cu)).astype(np.float32)
        x, y = u * cu, v * cv
        i0, j0 = np.floor(x).astype(int), np.floor(y).astype(int); fx, fy = x - i0, y - j0
        fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
        i1, j1 = (i0 + 1) % cu, (j0 + 1) % cv; i0 %= cu; j0 %= cv
        a = G[j0, i0] * (1 - fx) + G[j0, i1] * fx; b = G[j1, i0] * (1 - fx) + G[j1, i1] * fx
        out += amp * (a * (1 - fy) + b * fy); tot += amp; amp *= 0.5
    return out / tot


def wall_tile(WT=1024, HT=2048, SS=2):
    # tile geometry in world units (R = 1.364, ring spacing 2.6): arc 2 pi R / 16 = 0.5356 u wide, 1.3 u long
    ARC, LEN = 2 * np.pi * 1.364 / 16, 1.3
    w, h = WT * SS, HT * SS
    v, u = np.mgrid[0:h, 0:w].astype(np.float32)
    u = (u + 0.5) / w; v = (v + 0.5) / h
    X, Y = u * ARC, v * LEN                                            # world units: X around the tunnel, Y along it
    # base metal: the four measured hues, mixed by smooth periodic noise (broad colour areas like the painting)
    n1 = pnoise(u, v, 3, 2, 11); n2 = pnoise(u, v, 2, 3, 12)
    base = lin(PAL['purple'])[None, None] * np.ones((h, w, 1), np.float32)
    base = base * (1 - n1[..., None]) + lin(PAL['magenta'])[None, None] * n1[..., None]
    k = np.clip((n2 - 0.55) * 3, 0, 1)[..., None]; base = base * (1 - k) + lin(PAL['violet'])[None, None] * k
    k = np.clip((0.42 - n2) * 3, 0, 1)[..., None]; base = base * (1 - k) + lin(PAL['pinkmag'])[None, None] * k
    # brushed sheen ALONG the tunnel: fine periodic stripes in X (each frequency divides the tile so it stays seamless)
    br = np.zeros_like(u)
    for f, a in [(23, 0.35), (37, 0.25), (61, 0.22), (97, 0.18), (151, 0.12)]:
        br += a * np.sin(2 * np.pi * (f * u + rng.random())) * (0.6 + 0.4 * pnoise(u, v, 4, 1, int(f)))
    sheen = 1.0 + 0.28 * br
    col = base * sheen[..., None]
    # lit side of each row: the painting's walls brighten toward the hot pink / violet highlight between slot rows
    ROWS, PER = 6, 4                                                    # slot rows along the tunnel / slots around per tile (12 rows per ring section)
    rowY = LEN / ROWS; slotX = ARC / PER
    yr = (Y / rowY) % 1.0                                               # 0..1 inside a row (slot centre at 0.5)
    lift = np.exp(-((yr - 0.0) / 0.12) ** 2) + np.exp(-((yr - 1.0) / 0.12) ** 2)
    hi = lin(PAL['magenta_hi']) * (1 - n1[..., None]) + lin(PAL['violet_hi']) * n1[..., None]
    col = col * (1 - 0.25 * lift[..., None]) + hi * (0.25 * lift[..., None])
    # bright streaks ALONG the tunnel (vertical in the tile): 5 per tile, varied width, brightness wandering along the tunnel
    for i in range(5):
        x0 = (i + 0.2 + 0.6 * rng.random()) / 5; wd = 0.004 + 0.014 * rng.random(); amp = 0.55 + 0.45 * rng.random()
        dx = np.abs(((u - x0 + 0.5) % 1.0) - 0.5)
        core = np.exp(-(dx / wd) ** 2); glow = np.exp(-(dx / (wd * 4)) ** 2)
        along = (0.35 + 0.65 * np.clip(np.sin(2 * np.pi * (v * (2 + i % 3) + rng.random())), 0, 1) ** 2) * (0.6 + 0.4 * pnoise(u, v, 2, 6, 40 + i))
        k = (amp * along)[..., None]
        col = col + k * (0.55 * glow[..., None] * lin(PAL['purple_hi']) + 0.9 * core[..., None] * lin(PAL['streak']))
    # slots: stadium holes, long axis AROUND the tunnel; alternate rows staggered by half a pitch
    ri = np.floor(Y / rowY); xo = (ri % 2) * 0.5 * slotX
    cx = ((X + xo) % slotX) - slotX / 2; cy = (Y % rowY) - rowY / 2
    L2, R2 = 0.030, 0.024                                               # half length (minus the round end) / radius: 0.108 x 0.048 u pill hole
    qx = np.maximum(np.abs(cx) - L2, 0)
    sd = np.sqrt(qx ** 2 + cy ** 2) - R2                                 # signed distance to the slot edge (u)
    px = LEN / h                                                        # world size of one (supersampled) pixel along v
    inside = np.clip(0.5 - sd / (1.2 * px * SS), 0, 1)
    rim = np.exp(-((sd + 0.003) / 0.005) ** 2) * (cy > -0.006)        # lit lower lip (toward the light along the tunnel)
    dark_out = np.exp(-((sd - 0.004) / 0.004) ** 2)                      # thin shadow ring around each slot
    depth = np.clip(-sd / R2, 0, 1)
    slot = lin(PAL['slot_mid']) * (1 - depth[..., None]) + lin(PAL['slot_deep']) * depth[..., None]
    col = col * (1 - 0.35 * dark_out[..., None])
    col = col * (1 - inside[..., None]) + slot * inside[..., None]
    col = col + 0.8 * rim[..., None] * lin(PAL['slot_rim']) * (1 - inside[..., None] * 0.5)
    img = srgb(col)
    im = Image.fromarray(img).resize((WT, HT), Image.LANCZOS)
    return im


def ring_tile(WT=1024, HT=256, SS=2):
    """u = around the ring (one tile = 1/12 of it), v = across the gold band's profile (0 = front edge, 1 = back edge)."""
    w, h = WT * SS, HT * SS
    v, u = np.mgrid[0:h, 0:w].astype(np.float32); u = (u + 0.5) / w; v = (v + 0.5) / h
    # profile: three raised bands separated by two dark grooves, each band shaded like a polished half-round
    stops = [(0.00, 'gold_dark'), (0.05, 'gold_25'), (0.13, 'gold_97'), (0.22, 'gold_50'), (0.29, 'gold_dark'),
             (0.33, 'gold_25'), (0.42, 'gold_90'), (0.50, 'gold_97'), (0.58, 'gold_90'), (0.67, 'gold_25'), (0.71, 'gold_dark'),
             (0.75, 'gold_50'), (0.84, 'gold_97'), (0.92, 'gold_25'), (1.00, 'gold_dark')]
    vs = np.array([s for s, _ in stops]); cs = np.array([lin(PAL[c]) for _, c in stops])
    col = np.stack([np.interp(v, vs, cs[:, k]) for k in range(3)], -1)
    # fine circumferential polish lines + gentle brightness wave around the ring
    col *= (1 + 0.06 * np.sin(2 * np.pi * 40 * v + 2 * np.sin(2 * np.pi * u)) + 0.08 * np.sin(2 * np.pi * (u + 0.2)))[..., None]
    # two bright lamp spots per tile on the middle band (the painting's yellow-white hot spots around every ring)
    for x0 in (0.25, 0.75):
        dx = np.abs(((u - x0 + 0.5) % 1.0) - 0.5) * 6.0; dv = (v - 0.5) / 0.12
        s = np.exp(-(dx ** 2 + dv ** 2) * 2.5)
        col = col + (s ** 1.5)[..., None] * np.array([1.0, 0.95, 0.75]) * 1.4
    return Image.fromarray(srgb(col)).resize((WT, HT), Image.LANCZOS)


wall_tile().save(os.path.join(OUT, 'wall_tile.png'), optimize=True)
ring_tile().save(os.path.join(OUT, 'ring_tile.png'), optimize=True)
json.dump({'source': 'references/05_flow_into_the_current.png (measured, read-only)', 'colours': PAL,
           'wall_tile': {'px': [1024, 2048], 'covers_u': '1/16 circumference (0.5356 u at R 1.364)', 'covers_v_u': 1.3,
                         'slots': '4 rows x 4 per tile, 0.116 x 0.032 u stadium, staggered'},
           'ring_tile': {'px': [1024, 256], 'covers_u': '1/12 of a ring', 'covers_v': 'ring profile'}},
          open(os.path.join(OUT, 'palette.json'), 'w'), indent=1)
print('tiles written to', OUT)
