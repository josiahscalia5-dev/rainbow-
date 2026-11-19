"""check tools/env05/ringproj.py against the probe id buffer (same camera, same ring instances)"""
import json, math, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from ringproj import *
tj = json.load(open(sys.argv[1])); a = np.fromfile(sys.argv[2], np.float32).reshape(H, W, 4)
tag = np.where(a[..., 3] >= 10, np.round(a[..., 3]).astype(int), 0)
cls = np.where(tag > 0, np.round(a[..., 2]).astype(int), 0)
cam = Cam(tj)
bn = tj["tunnel"]["band05near"]; bf = tj["tunnel"]["band05"]
NT = 720
for i, inst in enumerate(tj["ringInstances"]):
    M = mat4(inst)
    px, dep = cam.project(ring_points(M, band_profile(**bn)))
    if (dep < 0.5).any(): print("real", i, "behind camera"); continue
    pin, pout = polar_edges(px, NT)
    gin, gout = mask_edges((cls == 3) & (tag == 20 + i), NT)
    k = np.isfinite(gin) & np.isfinite(pin)
    print("real", i, "rays", k.sum(), "d_in", np.round(np.nanmedian(gin[k] - pin[k]), 2), "d_out", np.round(np.nanmedian(gout[k] - pout[k]), 2), "centre", np.round(M[:3, 3], 3))
for i, inst in enumerate(tj["farRingInstances"]):
    M = mat4(inst)
    px, dep = cam.project(ring_points(M, band_profile(**bf)))
    pin, pout = polar_edges(px, NT)
    gin, gout = mask_edges((cls == 4) & (tag == 20 + i), NT)
    k = np.isfinite(gin) & np.isfinite(pin)
    print("far", i, "rays", k.sum(), "d_in", np.round(np.nanmedian(gin[k] - pin[k]), 2), "d_out", np.round(np.nanmedian(gout[k] - pout[k]), 2))
