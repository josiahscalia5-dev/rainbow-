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


def sample(u, s):
    """E colour (display values) at river coords (u, s); u is first folded into the row's visible range"""
    lo, hi = np.interp(s, s_row, ulo), np.interp(s, s_row, uhi)
    span = np.maximum(hi - lo, 1e-3)
    t = np.mod(u - lo, 2 * span)
    uf = lo + np.where(t < span, t, 2 * span - t)                          # ping-pong reflection about the edges
    v = np.interp(s, sg, Vg); c = np.interp(s, sg, cg); w = np.interp(s, sg, wg)
    x = (0.5 + (uf - c) / (2 * w)) * WE - 0.5
    y = v * NE - 0.5
    return np.stack([map_coordinates(E[..., k], [y, x], order=1, mode="nearest") for k in range(3)], -1), (u >= lo) & (u <= hi)


# supersampled bake (SS x SS per texel, box filter): the source is denser than the tile across u everywhere and along s
# for s < 134, so averaging avoids aliasing the fine glints
acc = np.zeros((H, W, 3), np.float64); real = np.zeros((H, W), np.float64)
for oy in range(SS):
    for ox in range(SS):
        uu = -1 + (np.arange(W) + (ox + 0.5) / SS) / W * 2
        ss_ = A + (np.arange(H) + (oy + 0.5) / SS) / H * L
        U, S = np.meshgrid(uu, ss_)
        col, inside = sample(U.ravel(), S.ravel())
        acc += col.reshape(H, W, 3); real += inside.reshape(H, W)
T2 = acc / (SS * SS)
real /= SS * SS
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
    texels_per_world_unit=dict(along=round(H / L, 1), across=round(W / (2 * hw), 1), old_N_T_along=24.0,
                              old_T_across=round(512 / (2 * hw), 1)),
    source_rows_per_world_unit={f"{s:.1f}": round(float(np.interp(s, sg, dens_src)), 1) for s in (130.5, 132, 134, 136, 137.5)},
    visible_u_range={f"{s:.1f}": [round(float(np.interp(s, s_row, ulo)), 3), round(float(np.interp(s, s_row, uhi)), 3)]
                     for s in (130.5, 132, 134, 136, 137.5)},
    share_of_texels_from_visible_water=round(float(real.mean()), 3),
    flow=dict(file="proj05_WT2.png", height=out_h, mean_abs_slope_world=round(float(np.abs(m * hw)[mask > 0.5].mean()), 3),
              flow_area=round(float((mask > 0.5).mean()), 3)),
)
json.dump(rep, open(os.path.join(DIR, "proj05_near.json"), "w"), indent=1)
print(json.dumps(rep, indent=1))
