#!/usr/bin/env python3
"""Screen 08 scenery r8 (`&m08towelm=1`): the painted towel's outline as a mask in plate coordinates.

The towel proxy is a rectangle (front face of the m08towel frustum) but the painted towel is rounded, so the rectangle's
top band / corners carried window pixels at towel depth -> a rectangular patch sliding over the window when moving.
Inside the towel proxy's footprint (from the frozen m08dbg capture, towel = #008040) the towel is told from window /
clouds / door by colour (towel violet & lavender: R clearly above G; clouds / door: G >= R - small).
  python3 -I tools/match08/towelmask08.py <dbg_capture.png> <plate.png> <out_mask.png>
"""
import sys
import cv2
import numpy as np

dbg_p, plate_p, out_p = sys.argv[1:4]
dbg = cv2.cvtColor(cv2.imread(dbg_p), cv2.COLOR_BGR2RGB).astype(np.int32)
plate = cv2.cvtColor(cv2.imread(plate_p), cv2.COLOR_BGR2RGB).astype(np.int32)
H, W = plate.shape[:2]
foot = (np.abs(dbg - np.array((0, 128, 64))).max(2) < 40).astype(np.uint8) * 255
foot = cv2.resize(foot, (W, H), interpolation=cv2.INTER_NEAREST)
foot = cv2.dilate(foot, np.ones((9, 9), np.uint8))
r, g, b = plate[..., 0], plate[..., 1], plate[..., 2]
towel = ((r - g) > 28) & (b > g + 20)
m = (towel & (foot > 0)).astype(np.uint8) * 255
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31)))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
# drop the thin purple door-ring strips at the footprint's left / right edges (narrower than ~45 px)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (45, 45)))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
if n > 1:
    k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); m = (lab == k).astype(np.uint8) * 255
# fill holes (white fringe stitches inside the towel)
ff = m.copy(); cv2.floodFill(ff, None, (0, 0), 255); m = m | (255 - ff)
m = cv2.GaussianBlur(m, (0, 0), 1.2)
cv2.imwrite(out_p, m)
print('towel px', int((m > 127).sum()), 'footprint px', int((foot > 0).sum()), '->', out_p)
