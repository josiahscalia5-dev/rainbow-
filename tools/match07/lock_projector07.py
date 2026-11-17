"""Screen 07: lock the projector to the LIVE ?match07=1 checkpoint camera (as Screen 08 did): after the river path is
bent, the checkpoint water point moves by ~0.1 u, so the projector must be the camera the game really renders from.
usage: python3 -I tools/match07/lock_projector07.py <probe_match07.json> <proj07.json>"""
import json, sys
d = json.load(open(sys.argv[1])); L = json.load(open(sys.argv[2]))
L["camera"]["solved_matrixWorld"] = L["camera"].get("solved_matrixWorld", L["camera"]["matrixWorld"])
L["camera"]["matrixWorld"] = d["cam"]["matrixWorld"]; L["camera"]["pos"] = d["cam"]["position"]
L["camera"]["live_water"] = d["water"]
json.dump(L, open(sys.argv[2], "w"), indent=1)
print("projector locked to live camera at", d["cam"]["position"], "water", d["water"])
