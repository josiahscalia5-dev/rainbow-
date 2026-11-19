"""Screen 07: the game's straight-tube axis (src/world/tube.ts straightTubePath: x/z low-passed with a 30 u triangle
window, y = course y) recomputed from the probe's course samples. usage: python3 -I tools/match07/axis07.py <probe.json>"""
import json, sys
import numpy as np
def axis(probe):
    S = np.array(probe["samples"], float); s = S[:, 0]; P = S[:, 1:4]
    k = int(round(30 / 0.5)); out = P.copy()
    for i in range(len(s)):
        lo, hi = max(0, i - k), min(len(s), i + k + 1); j = np.arange(lo, hi); w = 1 - np.abs(j - i) / (k + 1)
        out[i, 0] = (P[j, 0] * w).sum() / w.sum(); out[i, 2] = (P[j, 2] * w).sum() / w.sum()
    return s, out
if __name__ == "__main__":
    d = json.load(open(sys.argv[1])); s, A = axis(d)
    for u in (250, 260, 273, 280, 290, 300, 310, 320):
        i = np.argmin(abs(s - u)); t = A[min(i + 4, len(s) - 1)] - A[max(i - 4, 0)]; t /= np.linalg.norm(t)
        print(u, A[i].round(3), t.round(4))
    # mean direction over the visible stretch ahead of the checkpoint
    i0, i1 = np.argmin(abs(s - 275)), np.argmin(abs(s - 308)); D = A[i1] - A[i0]; print("D 275-308", (D / np.linalg.norm(D)).round(5))
