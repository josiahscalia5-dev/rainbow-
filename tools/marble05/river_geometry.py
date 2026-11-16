"""Screen 05 Marble feasibility — does Marble's 3D reconstruction hold the approved river's S-curve geometry and
perspective?  Read-only on the Marble assets; no API calls, no credits.
usage: python3 -I tools/marble05/river_geometry.py <world: full|draft> <out_dir>
Camera = the origin camera fitted in qa/pilot05/marble_feas/splat_fit_<world>.json, extended to the FULL approved
frame 864x1536 (Marble only saw rows 197-767, so the principal point sits at row 285.5+197 = 482.5)."""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import median_filter, gaussian_filter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from splatlib import load_ply, cam_rot, sample_gaussians, composite

world, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
fit = json.load(open(f"qa/pilot05/marble_feas/splat_fit_{world}.json"))
F, CX, CY, WF, HF, ROW0, ROW1 = fit["f_px"], 432.0, 285.5 + 197, 864, 1536, 197, 767
k = 4; W, H = WF // k, HF // k
S = load_ply(f"qa/worldlabs/05/pilot/{world}/splats_500k.ply", min_alpha=0.02)
R = cam_rot(fit["yaw_deg"], fit["pitch_deg"])
K_S = 6
pts, ii = sample_gaussians(S, K_S)
cam = pts @ R
a_s = 1 - (1 - S["alpha"][ii]) ** (1 / K_S)
C = composite(cam, a_s, S["rgb"][ii], F / k, CX / k, CY / k, W, H)
dep = C["depth"]
dep_f = np.where(np.isnan(dep), np.nanmedian(dep), dep)
dep_s = median_filter(dep_f, 5)
dep = np.where(np.isnan(dep), dep_s, median_filter(dep_f, 3))

# 3D point (camera frame) per cell
uu, vv = np.meshgrid((np.arange(W) + 0.5) * k, (np.arange(H) + 0.5) * k)
ray = np.stack([(uu - CX) / F, (vv - CY) / F, np.ones_like(uu)], -1)
P = ray * dep[..., None]

# approved image + its VP (brightest blurred spot at the tunnel end) = the TRUE perspective of the approved design
appr = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB"), float) / 255
lum = gaussian_filter(appr.mean(-1), 6)
win = lum[380:560, 380:620]; yy, xx = np.unravel_index(np.argmax(win), win.shape)
vp_img = (xx + 380.0, yy + 380.0)
# tunnel axis direction = the ray through the approved VP; Marble's own PCA axis is reported for comparison
ax = np.array([(vp_img[0] - CX) / F, (vp_img[1] - CY) / F, 1.0]); ax /= np.linalg.norm(ax)
X = (S["xyz"][S["alpha"] > 0.3]) @ R
pc = np.linalg.svd(X - np.median(X, 0), full_matrices=False)[2][0]; pc = pc if pc[2] > 0 else -pc
vp = (F * pc[0] / pc[2] + CX, F * pc[1] / pc[2] + CY)
# axis frame: t along the axis, e_r right, e_d down (perpendicular to the axis); origin = camera for now
e_d = np.array([0, 1.0, 0]) - ax * ax[1]; e_d /= np.linalg.norm(e_d)
e_r = np.cross(e_d, ax)
T0, L0, D0 = P @ ax, P @ e_r, P @ e_d
# tunnel centre line: least-squares circle through the wall cells 1-5 units ahead, upper 70 % of the section
selw = (T0 > 1) & (T0 < 5) & np.isfinite(T0)
Lw, Dw = L0[selw], D0[selw]
for _ in range(3):
    Am = np.stack([Lw, Dw, np.ones_like(Lw)], 1); bm = Lw ** 2 + Dw ** 2
    cl, cd, cc = np.linalg.lstsq(Am, bm, rcond=None)[0]; cl /= 2; cd /= 2
    rad = float(np.sqrt(cc + cl ** 2 + cd ** 2))
    keep = (np.abs(np.hypot(Lw - cl, Dw - cd) - rad) < 0.25 * rad) & (Dw - cd < 0.3 * rad)
    Lw, Dw = Lw[keep], Dw[keep]
c0 = cl * e_r + cd * e_d
T, LAT, DN = T0, L0 - cl, D0 - cd
cam_t, cam_lat, cam_dn = 0.0, float(-cl), float(-cd)
# water footprint of the approved design (isolated artwork registered to the approved frame)
art = Image.open("qa/pilot05/proj/align/artwork_aligned_864x1536.png").convert("RGBA")
A = np.asarray(art.resize((W, H), Image.BOX), float)[..., 3] / 255 > 0.5
in_crop = (vv >= ROW0) & (vv < ROW1)

# floor level from the near river inside the crop (rows 560-767: well covered by the input image)
near = A & (vv > 560) & (vv < ROW1)
floor_dn = float(np.median(DN[near]))
# Marble's own river = cells whose reconstructed point lies at river level (within 12 % of the radius)
river_m = np.abs(DN - floor_dn) < 0.12 * rad
def iou(a, b, m):
    a, b = a & m, b & m
    return float((a & b).sum() / max((a | b).sum(), 1))

# (1) perspective consistency along the river: for a flat floor parallel to the axis, depth * (row - VP row) is constant
rows = []
for r0 in range(int(vp[1]) + 8, HF, 16):
    m = A & (np.abs(vv - r0) < 8)
    if m.sum() < 3:
        continue
    t_m = float(np.median(T[m] - cam_t))
    # flat-floor prediction from the same pixel rays: intersect each ray with the plane DN = floor_dn
    d_ray = ray[m] @ e_d
    lam = (floor_dn - cam_dn) / np.maximum(d_ray, 1e-4)
    lam = np.where(d_ray > 1e-4, lam, np.inf)
    t_flat = float(np.median(lam * (ray[m] @ ax)))
    rows.append(dict(row=r0, in_input=bool(ROW0 <= r0 < ROW1), n=int(m.sum()), t_marble=t_m, t_flat_floor=t_flat,
                     ratio=t_m / t_flat if t_flat > 0 else None, dn_marble_over_radius=float(np.median(DN[m] - floor_dn) / rad)))

# (2) ring test: gold bands straight above the VP in the approved image; depth * offset should be constant
col = appr[:, int(vp_img[0]) - 3:int(vp_img[0]) + 4].mean(1)
gold = (col[:, 0] > 0.72) & (col[:, 1] > 0.42) & (col[:, 2] < 0.5) & (col[:, 0] - col[:, 2] > 0.3)
runs, r_ = [], None
for y in range(int(vp_img[1]) - 12, -1, -1):
    if gold[y] and r_ is None: r_ = y
    if (not gold[y]) and r_ is not None:
        if r_ - y >= 2: runs.append((y + r_) / 2)
        r_ = None
rings = []
for y in runs:
    cy_, cx_ = int(y // k), int(vp_img[0] // k)
    t_r = float(np.median(T[max(cy_ - 1, 0):cy_ + 2, cx_ - 1:cx_ + 2] - cam_t))
    off = vp_img[1] - y
    rings.append(dict(row=float(y), offset_px=float(off), in_input=bool(ROW0 <= y < ROW1), t_marble=t_r, t_times_offset=t_r * off))
if rings:
    ref_c = np.median([r["t_times_offset"] for r in rings if r["offset_px"] > 150] or [rings[0]["t_times_offset"]])
    for r in rings:
        r["t_cylinder_model"] = float(ref_c / r["offset_px"]); r["ratio"] = r["t_marble"] / r["t_cylinder_model"]

res = dict(world=world, camera=dict(f_px=F, cx=CX, cy=CY, size=[WF, HF], pitch_deg=fit["pitch_deg"], yaw_deg=fit["yaw_deg"],
                                    input_rows=[ROW0, ROW1]),
           vp_marble_pca_axis=[float(vp[0]), float(vp[1])], vp_approved_image=list(vp_img),
           tunnel_radius=rad, floor_below_axis=floor_dn, camera_offset_from_axis=dict(right=float(cam_lat), down=float(cam_dn)),
           footprint=dict(iou_inside_input_rows=iou(river_m, A, in_crop), iou_below_input_rows=iou(river_m, A, vv >= ROW1),
                          iou_full_frame=iou(river_m, A, np.ones_like(A))),
           max_river_depth_marble=float(np.nanmax((T - cam_t)[A & in_crop])),
           max_river_depth_flat_floor=float(max(r["t_flat_floor"] for r in rows if np.isfinite(r["t_flat_floor"]))),
           river_rows=rows, rings=rings)
json.dump(res, open(os.path.join(out, f"geometry_{world}.json"), "w"), indent=1)
np.savez_compressed(os.path.join(out, f"geometry_{world}.npz"), depth=dep, T=T - cam_t, LAT=LAT - cam_lat, DN=DN, A=A,
                    river_m=river_m, rgb=C["rgb"], acc=C["acc"])

tmax = float(min(np.nanmax((T - cam_t)[A]), 14 * rad))
# depth image
dv = np.clip((T - cam_t) / tmax, 0, 1)
dimg = (np.stack([dv, 0.4 + 0 * dv, 1 - dv], -1) * 255).astype(np.uint8)
Image.fromarray(dimg).resize((WF, HF), Image.NEAREST).save(os.path.join(out, f"depth_{world}.png"))
print(json.dumps({k_: v for k_, v in res.items() if k_ not in ("river_rows", "rings")}, indent=1))
print("rows:", [(r["row"], round(r["t_marble"], 2), round(r["t_flat_floor"], 2), r["in_input"]) for r in rows])
print("rings:", [(r["row"], round(r["t_marble"], 2), round(r.get("t_cylinder_model", 0), 2), r["in_input"]) for r in rings])
