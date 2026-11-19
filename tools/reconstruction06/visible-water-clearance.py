"""Bound visible-water clearance from the approved image, independent of assigned depth.

For each world probe, find the closest ray through a source pixel labelled as water.
Only photographed water is considered. Hidden surfaces require a separate model.
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("course", "camera", "mask", "output"):
        parser.add_argument(name, type=Path)
    args = parser.parse_args()
    course = json.loads(args.course.read_text())
    camera = json.loads(args.camera.read_text())
    mat = np.array(camera["mw"]).reshape(4, 4).T
    w, h = camera["size"]
    focal = h / (2 * np.tan(np.deg2rad(camera["fov"] / 2)))
    water_mask = np.array(Image.open(args.mask).convert("RGB"))[:, :, 1] < 128
    y, x = np.nonzero(water_mask)
    directions = np.column_stack(((x - w / 2) / focal, (h / 2 - y) / focal, -np.ones(len(x))))
    directions /= np.linalg.norm(directions, axis=1)[:, None]
    tree = cKDTree(directions)
    rows = [r for r in course["rows"] if 12.5 <= r["s"]-course["inlet"] <= 30]
    centre = np.array([r["p"] for r in rows]); right = np.array([r["r"] for r in rows])
    report = {}
    for title, lateral in (("centre", 0.), ("hardLeft", -2.95), ("hardRight", 2.95)):
        world = centre + right * lateral
        view = (world - mat[:3, 3]) @ mat[:3,:3]
        distance = np.linalg.norm(view, axis=1)
        direction = view / distance[:, None]
        _, near = tree.query(direction)
        nearest_ray = directions[near]
        dot = np.einsum("ij,ij->i", direction, nearest_ray).clip(-1, 1)
        lower_bound = distance * np.sqrt(np.maximum(0., 1 - dot * dot))
        pixels = np.c_[w/2-focal*view[:,0]/view[:,2], h/2+focal*view[:,1]/view[:,2]]
        in_frame = ((pixels[:,0]>=0)&(pixels[:,0]<w)&(pixels[:,1]>=0)&(pixels[:,1]<h))
        ids = np.flatnonzero(in_frame)
        i = int(ids[np.argmax(lower_bound[ids])])
        report[title] = {
            "lateralOffset": lateral, "insideFrame": int(len(ids)),
            "farthestWorldOffsetFromAnyVisibleWaterRay": round(float(lower_bound[i]), 5),
            "stationFromInlet": round(rows[i]["s"]-course["inlet"], 5),
            "projectedLocation": pixels[i].round(3).tolist(),
            "nearestPaintedWaterPixel": [int(x[near[i]]), int(y[near[i]])],
            "numberWithMinimumOffsetOverQuarterUnit": int((lower_bound[ids]>.25).sum()),
        }
    result = {
        "method": "Closest ray on the unit sphere through any native water-labelled pixel. The distance to that ray is a world-space lower bound for the distance to any directly visible water point, even if its depth varies freely. Pixels are tested at their centres, giving subpixel uncertainty. The source mask includes the lower foreground and is not restricted to the partial new ribbon.",
        "appliesTo": "Visible water inside the original picture. Occluded or outside-frame water is unconstrained; the three reported extrema need not share a station.",
        "retainedStations":[12.5,30],"spacing":.25,"results":report,
    }
    args.output.write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(report))


if __name__ == "__main__":
    main()
