"""Screen 05 kit (round 33): the approved picture's fitted camera (Marble world coordinates, camera at the origin) and helpers.
project(P) -> approved-picture pixel (x, y), depth. Used to fit kit geometry to the painting and to bake textures from its pixels."""
import json, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
V = os.path.join(REPO, 'tools', 'marble05', 'viewer')
SC = json.load(open(os.path.join(V, 'scene05.json'))); RG = json.load(open(os.path.join(V, 'rings.json'))); TU = json.load(open(os.path.join(V, 'tunnel_full.json')))
REF = os.path.join(REPO, 'references', '05_flow_into_the_current.png')
W, H = 864, 1536
F = np.array(SC['cam']['fwd'], float); F /= np.linalg.norm(F)
U = np.array(SC['cam']['up'], float); U -= F * (U @ F); U /= np.linalg.norm(U)
R = np.cross(F, U)                      # three.js camera +X (right) = fwd x up
FOC = (H / 2) / np.tan(np.radians(SC['cam']['fov']) / 2)   # vertical fov -> focal length in approved pixels
def project(P):
    P = np.asarray(P, float); z = P @ F
    x = W / 2 + FOC * (P @ R) / z; y = H / 2 - FOC * (P @ U) / z
    return x, y, z
XA = np.array(RG['XA']); XB = np.array(RG['XB']); D = np.array(RG['D'])
AX = np.array(TU['axis']); NUP = np.array(TU['up'])
def frame(axis, upref):
    a = axis / np.linalg.norm(axis); n = upref - a * (upref @ a); n /= np.linalg.norm(n); r = np.cross(a, n); return a, n, r
