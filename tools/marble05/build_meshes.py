"""Build the two river meshes for the projection test (no credits, read-only on Marble assets):
  marble_river.obj  = the approved water footprint lifted onto MARBLE's reconstructed surface (median splat depth,
                      coins/bubbles removed with a robust image-space median), i.e. Marble used for 3D reconstruction only
  flat_river.obj    = the same pixels on the ideal flat river floor implied by the approved image (axis through its
                      vanishing point, floor height measured from Marble's near river) - the reference geometry
Both are in the Three.js frame of the Marble world (SplatMesh rotated 180 deg about X: x, -y, -z), camera at the origin.
Also writes cameras.json (locked camera = full approved frame; moved camera = 1 tunnel radius further along the axis).
usage: python3 -I tools/marble05/build_meshes.py <world> <out_dir>"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import generic_filter, gaussian_filter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from splatlib import load_ply, cam_rot, sample_gaussians, composite

world, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
fit = json.load(open(f"qa/pilot05/marble_feas/splat_fit_{world}.json"))
geo = json.load(open(f"qa/pilot05/marble_feas/geometry/geometry_{world}.json"))
F, CX, CY, WF, HF = fit["f_px"], 432.0, 285.5 + 197, 864, 1536
k = 2; W, H = WF // k, HF // k
S = load_ply(f"qa/worldlabs/05/pilot/{world}/splats_500k.ply", min_alpha=0.02)
R = cam_rot(fit["yaw_deg"], fit["pitch_deg"])
KS = 8
pts, ii = sample_gaussians(S, KS, seed=1)
C = composite(pts @ R, 1 - (1 - S["alpha"][ii]) ** (1 / KS), S["rgb"][ii], F / k, CX / k, CY / k, W, H)
dep = C["depth"].copy()

appr = np.asarray(Image.open("references/05_flow_into_the_current.png").convert("RGB").resize((W, H), Image.BOX), float) / 255
art = np.asarray(Image.open("qa/pilot05/proj/align/artwork_aligned_864x1536.png").convert("RGBA").resize((W, H), Image.BOX), float) / 255
A = art[..., 3] > 0.02
coin = (appr[..., 0] > 0.7) & (appr[..., 1] > 0.5) & (appr[..., 2] < 0.4)
mr = C["rgb"]; coin |= (mr[..., 0] > 0.7) & (mr[..., 1] > 0.5) & (mr[..., 2] < 0.4)  # Marble's own coins
d = np.where(A & ~coin, dep, np.nan)
dsm = generic_filter(d, np.nanmedian, size=9, mode="nearest")
dsm = np.where(np.isnan(dsm), generic_filter(dsm, np.nanmedian, size=21, mode="nearest"), dsm)

uu, vv = np.meshgrid((np.arange(W) + 0.5) * k, (np.arange(H) + 0.5) * k)
ray = np.stack([(uu - CX) / F, (vv - CY) / F, np.ones_like(uu)], -1)
vp = geo["vp_approved_image"]
ax = np.array([(vp[0] - CX) / F, (vp[1] - CY) / F, 1.0]); ax /= np.linalg.norm(ax)
e_d = np.array([0, 1.0, 0]) - ax * ax[1]; e_d /= np.linalg.norm(e_d)
cam_dn = geo["camera_offset_from_axis"]["down"]; floor_dn = geo["floor_below_axis"]
h = floor_dn - cam_dn  # camera height above the floor, along e_d
rd = ray @ e_d
lam_flat = np.where(rd > 1e-3, h / np.maximum(rd, 1e-3), np.nan)
lam_flat = np.where(lam_flat * (ray @ ax) < 80, lam_flat, np.nan)  # cut the last pixels at the horizon

def mesh(lam, path, lift=0.985):
    valid = A & np.isfinite(lam)
    P = ray * (lam * lift)[..., None]          # CV camera frame
    Pw = P @ R.T                                 # CV world (Marble PLY frame)
    G = Pw * np.array([1, -1, -1])               # Three.js frame of the rotated SplatMesh
    idx = -np.ones((H, W), int); idx[valid] = np.arange(valid.sum())
    v = G[valid]; uv = np.stack([uu[valid] / WF, 1 - vv[valid] / HF], 1)
    faces = []
    a, b, c, dd = idx[:-1, :-1], idx[:-1, 1:], idx[1:, :-1], idx[1:, 1:]
    L = lam
    ok = (a >= 0) & (b >= 0) & (c >= 0) & (dd >= 0)
    q = np.stack([L[:-1, :-1], L[:-1, 1:], L[1:, :-1], L[1:, 1:]], -1)
    ok &= np.nanmax(q, -1) / np.nanmin(q, -1) < 1.12
    for A_, B_, C_, D_ in zip(a[ok], b[ok], c[ok], dd[ok]):
        faces.append((A_, C_, D_, B_))
    with open(path, "w") as fo:
        fo.write("# Screen 05 Marble feasibility river mesh, Three.js frame of the Marble world; UV = locked-camera projection\n")
        fo.write("".join(f"v {x:.5f} {y:.5f} {z:.5f}\n" for x, y, z in v))
        fo.write("".join(f"vt {s:.6f} {t:.6f}\n" for s, t in uv))
        fo.write("".join(f"f {p+1}/{p+1} {q_+1}/{q_+1} {r+1}/{r+1} {s_+1}/{s_+1}\n" for p, q_, r, s_ in faces))
    return dict(vertices=int(len(v)), quads=len(faces), depth_range=[float(np.nanmin(lam[valid] * (ray[valid] @ ax))), float(np.nanmax(lam[valid] * (ray[valid] @ ax)))])

info = dict(marble=mesh(dsm, os.path.join(out, "marble_river.obj")), flat=mesh(lam_flat, os.path.join(out, "flat_river.obj")))
axw = (R @ ax) * np.array([1, -1, -1])
rad = geo["tunnel_radius"]
cams = dict(note="Three.js frame of the Marble world (SplatMesh quaternion (1,0,0,0)); fov/viewOffset reproduce the full 864x1536 approved frame",
            width=WF, height=HF, f_px=F, cx=CX, cy=CY, pitch_deg=fit["pitch_deg"], yaw_deg=fit["yaw_deg"],
            locked=dict(position=[0, 0, 0]), moved=dict(position=list(map(float, axw * rad)), note="1 tunnel radius forward along the approved axis"),
            axis=list(map(float, axw)), tunnel_radius=rad)
json.dump(dict(meshes=info, cameras=cams), open(os.path.join(out, "scene.json"), "w"), indent=1)
np.savez_compressed(os.path.join(out, "marble_depth_k2.npz"), depth=dep, depth_smoothed=dsm, A=A, coin=coin)
print(json.dumps(info, indent=1))
