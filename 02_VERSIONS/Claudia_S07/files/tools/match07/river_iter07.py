"""Screen 07: one correction round for the painted river path. The course smooths the bent 07 polyline, which pulls the
live path off the painted centre points; compare the live path (probe with ?match07=1) at each target's z with the
target and pre-compensate the stored points (iterate 2-4 rounds until the error is < 0.01 u). Targets are kept in
river07.json "target_x"; "x" holds the compensated points course.ts reads.
usage: python3 -I tools/match07/river_iter07.py <probe_match07.json> <river07.json>"""
import json, sys
import numpy as np
d = json.load(open(sys.argv[1])); R = json.load(open(sys.argv[2]))
S = np.array(d["samples"], float); z, x = S[:, 3], S[:, 1]
o = np.argsort(z); z, x = z[o], x[o]
tx = R.get("target_x", R["x"]); R["target_x"] = tx
live = np.interp(R["z"], z, x)
err = np.array(tx) - live
R["x"] = (np.array(R["x"]) + err).tolist()
json.dump(R, open(sys.argv[2], "w"), indent=1)
print("max |err|", float(np.abs(err).max()), np.round(err, 3))
