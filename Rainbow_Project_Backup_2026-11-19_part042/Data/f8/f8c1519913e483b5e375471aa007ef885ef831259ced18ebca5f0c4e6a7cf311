"""Screen 05 `?proj05=1&projnear05=1` — HIGH-RESOLUTION NEAR TILE (plan in qa/pilot05/proj/flow2/NOTES.md, part 2).

Why: while riding, the near water switches from the exact layer E (sharp only from the locked camera) to the near layer N
and the tile T, both stored at 24 texels per world unit along the river, while the screen near Benny needs 100+ -> the
approved swirls turn into a pastel smear 8-17 u into the ride. The crisp approved detail that exists is the NEAREST
water of the locked view (E: 230-280 rows per unit at s 130, 53 at s 137.5). This tool resamples exactly that water out of
E (through its LUT, no new artwork, no invented texture) into a tile that the shader repeats along the river.

  proj05_T2.png   W x H RGB, u -1..1 across (columns), s in [A, A + L] along (rows, row 0 = s A); loaded with
                  MirroredRepeatWrapping along s (seamless, period 2 L) + mipmaps; outside each row's visible u-range the
                  row is reflected (ping-pong) about its visible edges.
  proj05_WT2.png  flow map of T2 (tools/proj05/flow_bake.py flow_of: R = 0.5 + du/ds * scale, G = flow mask, B = 1);
                  the shader flips the slope on mirrored periods.
  proj05_near.json  extents + resolution report.
usage: python3 -I tools/proj05/near_bake.py <assets/textures/water05> [--w=1024] [--h=768] [--a=130.5] [--l=7]
                  [--ss=3] (supersampling per axis) [--margin=0.015] (u kept away from the visible edge)"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates, minimum_filter1d, maximum_filter1d, gaussian_filter1d

pos = [a for a in sys.argv[1:] if not a.startswith("--")]
opt = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
DIR = pos[0]
W, H = int(opt.get("w", 1024)), int(opt.get("h", 768))
A, L = float(opt.get("a", 130.5)), float(opt.get("l", 7.0))
SS = int(opt.get("ss", 3))
MARGIN = float(opt.get("margin", 0.015))

lut = json.load(open(os.path.join(DIR, "proj05_lut.json")))
Ej = lut["E"]
E = np.asarray(Image.open(os.path.join(DIR, "proj05_E.png")).convert("RGBA")).astype(np.float32) / 255.0
NE, WE = E.shape[:2]
sg = np.linspace(Ej["s0"], Ej["s1"], Ej["n"])
Vg, cg, wg = np.array(Ej["V"]), np.array(Ej["c"]), np.array(Ej["w"])

# visible (valid) u-range per E row, read from E's own alpha (not the LUT margin), smoothed along s
alpha = E[..., 3]
rows_lo = np.full(NE, np.nan); rows_hi = np.full(NE, np.nan)
for y in range(NE):
    xs = np.nonzero(alpha[y] > 0.9)[0]
    if len(xs) > 8:
        rows_lo[y], rows_hi[y] = xs[0], xs[-1]
# row y -> s (invert V), then column -> u
Vrow = (np.arange(NE) + 0.5) / NE
s_row = np.interp(Vrow, Vg, sg)
c_row, w_row = np.interp(s_row, sg, cg), np.interp(s_row, sg, wg)
col2u = lambda x, c, w: c + ((x + 0.5) / WE - 0.5) * 2 * w
ok = np.isfinite(rows_lo)
ulo = np.where(ok, col2u(np.nan_to_num(rows_lo), c_row, w_row), np.nan)
uhi = np.where(ok, col2u(np.nan_to_num(rows_hi), c_row, w_row), np.nan)
i = np.arange(NE)
ulo, uhi = np.interp(i, i[ok], ulo[ok]), np.interp(i, i[ok], uhi[ok])
ulo = gaussian_filter1d(maximum_filter1d(ulo, 9), 4) + MARGIN          # shrink: never sample a partly valid edge texel
uhi = gaussian_filter1d(minimum_filter1d(uhi, 9), 4) - MARGIN


# FILL (2026-11-16, after the first bake showed a kaleidoscope): near the start of the tile only the river centre is
# visible in the locked view (u ±0.28 at s 130.5), so instead of bouncing that strip across the river, each column u
# reads REAL visible approved water from the first s where that column becomes visible: per-column shift along s,
# smooth in u (no mirror symmetry; the crisp centre keeps shift 0). The sides then come from E at 30-75 rows / unit —
# what the riding view needs there (scripts/proj05-ride-probe.mjs: 25-50 px / unit 2-6 u ahead of Benny).
SHIFT_PAD = float(opt.get("pad", 0.4))         # extra s beyond the first visible row (stay off the visible edge)
uu_g = np.linspace(-1, 1, 401)
s_scan = np.linspace(A, Ej["s1"] - L - 0.5, 1200)
lo_scan, hi_scan = np.interp(s_scan, s_row, ulo), np.interp(s_scan, s_row, uhi)
uc = np.clip(uu_g, -0.985, 0.985)
vis = (uc[:, None] >= lo_scan[None]) & (uc[:, None] <= hi_scan[None])
first = np.where(vis.any(1), s_scan[np.argmax(vis, 1)], s_scan[-1])
need = np.maximum(first + SHIFT_PAD - A, 0.0)
need = np.where(np.abs(uu_g) < 0.15, 0.0, need)                 # Benny's lane: always the crisp nearest water
# monotone away from the centre, then smoothed (and never below what is needed)
mid = len(uu_g) // 2
need[mid:] = np.maximum.accumulate(need[mid:]); need[:mid + 1] = np.maximum.accumulate(need[:mid + 1][::-1])[::-1]
shift_g = gaussian_filter1d(need, 6)
shift_g = np.maximum(shift_g, need)
shift_g = gaussian_filter1d(shift_g, 3)


def shift_of(u):
    return np.interp(u, uu_g, shift_g)


def sample(u, s):
    """E colour (display values) at river coords (u, s): the column's s is first moved to where u is visible; anything
    still outside the row's visible range is folded back into it (rare, only at the river's very edge)"""
    s = s + shift_of(u)
    u = np.clip(u, -0.985, 0.985)
    lo, hi = np.interp(s, s_row, ulo), np.interp(s, s_row, uhi)
    span = np.maximum(hi - lo, 1e-3)
    t = np.mod(u - lo, 2 * span)
    uf = lo + np.where(t < span, t, 2 * span - t)                          # ping-pong reflection about the edges
    v = np.interp(s, sg, Vg); c = np.interp(s, sg, cg); w = np.interp(s, sg, wg)
    x = (0.5 + (uf - c) / (2 * w)) * WE - 0.5
    y = v * NE - 0.5
    # alpha-weighted (premultiplied) so E texels without data (rgb 0) never bleed in as black lines
    a = map_coordinates(E[..., 3], [y, x], order=1, mode="nearest")
    rgb = np.stack([map_coordinates(E[..., k] * E[..., 3], [y, x], order=1, mode="nearest") for k in range(3)], -1)
    return rgb / np.maximum(a, 1e-4)[:, None], (u >= lo) & (u <= hi), a


# supersampled bake (SS x SS per texel, box filter): the source is denser than the tile across u everywhere and along s
# for s < 134, so averaging avoids aliasing the fine glints
acc = np.zeros((H, W, 3), np.float64); real = np.zeros((H, W), np.float64); wsum = np.zeros((H, W), np.float64)
for oy in range(SS):
    for ox in range(SS):
        uu = -1 + (np.arange(W) + (ox + 0.5) / SS) / W * 2
        ss_ = A + (np.arange(H) + (oy + 0.5) / SS) / H * L
        U, S = np.meshgrid(uu, ss_)
        col, inside, a = sample(U.ravel(), S.ravel())
        a = a.reshape(H, W)
        acc += col.reshape(H, W, 3) * a[..., None]; wsum += a; real += inside.reshape(H, W)
T2 = acc / np.maximum(wsum, 1e-6)[..., None]
cover = wsum / (SS * SS)
real /= SS * SS

# HOLES: texels without enough valid E data, and the approved BUBBLES + Benny's splash foam (they must not repeat with
# the tile: the game's own bubbles / splash are separate 3D objects). Bubbles are listed in SOURCE river coordinates
# (u, s of the approved picture: centre u, centre s, radius u, radius s), so they stay valid if the tile is re-cut.
BUBBLES = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "near_bubbles.json")))["bubbles"]
uu_c = -1 + (np.arange(W) + 0.5) / W * 2
ss_c = A + (np.arange(H) + 0.5) / H * L
Uc, Sc = np.meshgrid(uu_c, ss_c)
Ssrc = Sc + shift_of(Uc)
hole = cover < 0.6
for b in BUBBLES:
    hole |= ((Uc - b[0]) / b[2]) ** 2 + ((Ssrc - b[1]) / b[3]) ** 2 <= 1.0
from scipy.ndimage import binary_dilation as _dil, gaussian_filter as _gf
hole = _dil(hole, iterations=2)
# fill each hole along the column (= along the flow, s), between the valid texels at both ends, like the coin holes in
# tools/proj05/bake.py; then a soft across-u blur inside the fill only (no smear outside the holes)
fill = T2.copy()
for x in range(W):
    hcol = hole[:, x]
    if not hcol.any():
        continue
    idx = np.nonzero(~hcol)[0]
    if len(idx) < 2:
        continue
    hy = np.nonzero(hcol)[0]
    for k in range(3):
        fill[hy, x, k] = np.interp(hy, idx, T2[idx, x, k])
sm = np.stack([_gf(fill[..., k], (0.8, 2.0)) for k in range(3)], -1)
T2i = np.where(hole[..., None], sm, T2)          # fallback fill (flat bars where a hole touches the tile's end)
# main fill: each hole takes REAL water texture from just further along the same columns (gradient-domain clone, so the
# patch's colours meet the surrounding water without an outline). The tile is mirror-padded along s first, exactly as
# MirroredRepeatWrapping repeats it in the game, so holes at the tile's ends clone across the mirror like the game sees.
import cv2
from scipy.ndimage import label as _label, find_objects as _find
PADY, PADX = H // 2, 24
big = np.pad(np.clip(T2i * 255, 0, 255).astype(np.uint8), ((PADY, PADY), (PADX, PADX), (0, 0)), mode="symmetric")
bmask = np.pad(hole, ((PADY, PADY), (PADX, PADX)), mode="symmetric")
bmask[:, :PADX] = False; bmask[:, -PADX:] = False
lab, nlab = _label(bmask)
cloned = 0
for k, sl in enumerate(_find(lab), 1):
    if sl is None:
        continue
    r0, r1 = sl[0].start, sl[0].stop
    if r1 <= PADY - 4 or r0 >= PADY + H + 4:          # only components that reach the real tile
        continue
    comp = lab == k
    h = r1 - r0
    done = False
    for dy in (h + 12, -(h + 12), 2 * h + 24, -(2 * h + 24)):
        if r0 + dy < 2 or r1 + dy > big.shape[0] - 2:
            continue
        if (np.roll(comp, dy, 0) & bmask).sum() > 0.02 * comp.sum():   # the source must be clean water
            continue
        src = np.roll(big, -dy, 0)                    # src at the hole = the water dy rows further along s
        m8 = (_dil(comp, iterations=3) * 255).astype(np.uint8)
        ys, xs = np.nonzero(m8)
        cx, cy = (xs.min() + xs.max() + 1) // 2, (ys.min() + ys.max() + 1) // 2
        big = cv2.seamlessClone(src, big, m8, (int(cx), int(cy)), cv2.NORMAL_CLONE)
        cloned += 1; done = True
        break
T2 = big[PADY:PADY + H, PADX:PADX + W].astype(np.float64) / 255.0
hole_share = float(hole.mean())
Image.fromarray(np.clip(T2 * 255 + 0.5, 0, 255).astype(np.uint8)).save(os.path.join(DIR, "proj05_T2.png"), optimize=True)

# flow map of the new tile with the existing flow_bake.flow_of (same structure-tensor method, same encoding)
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "flow_bake.py")).read()
ns = {"__name__": "flow_bake_lib"}
argv0 = sys.argv
sys.argv = ["flow_bake.py", DIR]
exec(compile(src.split("\nrep = {}")[0], "flow_bake.py", "exec"), ns)
sys.argv = argv0
m, mask, coh, _ = ns["flow_of"]((T2 * 255).astype(np.float32), np.ones((H, W), np.float32), L, wrap=False)
out_h = int(round(L * 8))
ns["save"]("proj05_WT2.png", m, mask, coh, out_h)

# resolution report: texels per world unit (s is in world units, u = 1 is the river half width)
hw = ns["HW"]
dens_src = np.gradient(np.interp(sg, sg, Vg), sg) * NE
rep = dict(
    note="proj05 near tile (tools/proj05/near_bake.py); shader: ?proj05=1&projnear05=1 (src/vfx/waterRibbon.ts)",
    T2=dict(a=A, L=L, width=W, height=H, wrapT="mirrored", period=2 * L),
    # Benny's s at the locked 05 checkpoint (scripts/capture.mjs 05 log: s 132.438): the shader's hand-over compares
    # each point with the locked view's density at the same distance from Benny
    locked_focus_s=float(opt.get("lock", 132.438)),
    texels_per_world_unit=dict(along=round(H / L, 1), across=round(W / (2 * hw), 1), old_N_T_along=24.0,
                              old_T_across=round(512 / (2 * hw), 1)),
    source_rows_per_world_unit={f"{s:.1f}": round(float(np.interp(s, sg, dens_src)), 1) for s in (130.5, 132, 134, 136, 137.5)},
    visible_u_range={f"{s:.1f}": [round(float(np.interp(s, s_row, ulo)), 3), round(float(np.interp(s, s_row, uhi)), 3)]
                     for s in (130.5, 132, 134, 136, 137.5)},
    share_of_texels_from_visible_water=round(float(real.mean()), 3),
    share_filled_along_flow=round(hole_share, 4), bubbles_removed=len(BUBBLES), holes_cloned=cloned,
    column_shift_s={f"{u:+.1f}": round(float(shift_of(u)), 2) for u in (-0.9, -0.7, -0.5, -0.3, 0.0, 0.3, 0.5, 0.7, 0.9)},
    flow=dict(file="proj05_WT2.png", height=out_h, mean_abs_slope_world=round(float(np.abs(m * hw)[mask > 0.5].mean()), 3),
              flow_area=round(float((mask > 0.5).mean()), 3)),
)
json.dump(rep, open(os.path.join(DIR, "proj05_near.json"), "w"), indent=1)
print(json.dumps(rep, indent=1))
