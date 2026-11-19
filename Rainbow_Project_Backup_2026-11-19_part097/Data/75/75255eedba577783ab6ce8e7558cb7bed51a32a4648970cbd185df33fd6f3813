"""Recover an editable visible crest ribbon from the native mask and photographed coin arc.

The resulting surface is a calibration study. Its unseen depths do not change the game.
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.interpolate import PchipInterpolator
from scipy.ndimage import gaussian_filter, map_coordinates


def read(path):
    return json.loads(path.read_text())


def dump(value):
    return np.round(value, 5).tolist()


def distances_to_triangles(points, triangles):
    a, b, c = triangles.transpose(1, 0, 2)
    ab, ac = b - a, c - a
    ap = points[:, None, :] - a
    normal = np.cross(ab, ac)
    normal_squared = (normal * normal).sum(axis=1)
    ab2 = np.einsum("ij,ij->i", ab, ab)
    ac2 = np.einsum("ij,ij->i", ac, ac)
    ab_ac = np.einsum("ij,ij->i", ab, ac)
    ap_ab = np.einsum("pij,ij->pi", ap, ab)
    ap_ac = np.einsum("pij,ij->pi", ap, ac)
    divisor = np.maximum(normal_squared, 1e-18)
    first = (ac2 * ap_ab - ab_ac * ap_ac) / divisor
    second = (ab2 * ap_ac - ab_ac * ap_ab) / divisor
    inside = (first >= 0) & (second >= 0) & (first + second <= 1) & (normal_squared > 1e-16)
    squared = np.where(inside, np.einsum("pij,ij->pi", ap, normal) ** 2 / divisor, np.inf)
    for start, end in ((a, b), (b, c), (c, a)):
        edge = end - start
        offset = points[:, None, :] - start
        fraction = np.einsum("pij,ij->pi", offset, edge) / np.maximum((edge * edge).sum(axis=1), 1e-18)
        residual = offset - edge * np.clip(fraction, 0, 1)[:, :, None]
        squared = np.minimum(squared, (residual * residual).sum(axis=2))
    return np.sqrt(squared.min(axis=1))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for name in ("camera", "landmarks", "mask", "course", "output"):
        p.add_argument(name, type=Path)
    args = p.parse_args()
    cam = read(args.camera)
    study = read(args.landmarks)
    course = read(args.course)
    w, h = cam["size"]
    camera = np.array(cam["mw"]).reshape(4, 4).T
    eye, rotation = camera[:3, 3], camera[:3, :3]
    focal = h / (2 * np.tan(np.deg2rad(cam["fov"] / 2)))
    painted_wall = np.asarray(Image.open(args.mask).convert("RGB"))[:, :, 1].astype(float)
    labels = gaussian_filter(painted_wall, sigma=1.25)
    guides = study["inferredGuide"]
    pixels = np.array([r["proposedSurfacePx"] for r in guides])
    measured_depth = np.array([r["assumedCameraDepth"] for r in guides])
    arc = np.r_[0., np.cumsum(np.linalg.norm(np.diff(pixels, axis=0), axis=1))]
    sample_arc = np.unique(np.r_[np.arange(0, arc[-1], 6.), arc])
    smooth_pixel = PchipInterpolator(arc, pixels, axis=0)
    # The saved coins were positioned independently from one photograph, including
    # two almost overlapping depth measurements. Preserve each one in the report.
    depths = PchipInterpolator(arc, measured_depth)(sample_arc)
    center = smooth_pixel(sample_arc)
    # Numerical central differences remain defined where an interpolant has a flat tangent.
    tangent = np.gradient(center, sample_arc, axis=0)
    normal = np.c_[-tangent[:, 1], tangent[:, 0]]
    normal /= np.maximum(np.linalg.norm(normal, axis=1)[:, None], 1e-9)

    def lift(pixels_at_depth, d):
        view = np.c_[(pixels_at_depth[:, 0] - w / 2) * d / focal,
                     (h / 2 - pixels_at_depth[:, 1]) * d / focal, -d]
        return eye + view @ rotation.T

    section_pixels = []
    reasons = []
    for point, across, at in zip(center, normal, sample_arc):
        # Native silhouettes are used until the reference ends. At a frame edge,
        # record a clipped limit rather than inventing a pictured bank.
        edges, flags = [], []
        diameter = float(np.interp(at, arc, [g["diameterPx"] for g in guides]))
        max_distance = max(18., min(410., 5 * diameter))
        for sign in (-1, 1):
            distance = np.arange(0, max_distance + .5, .5)
            rays = point + sign * distance[:, None] * across
            in_frame = ((rays[:, 0] >= 0) & (rays[:, 0] < w - 1) &
                        (rays[:, 1] >= 0) & (rays[:, 1] < h - 1))
            sample = map_coordinates(labels, (rays[:, 1], rays[:, 0]), order=1, mode="nearest")
            escaped = np.flatnonzero((sample >= 128) | ~in_frame)
            if len(escaped):
                i = int(escaped[0])
                if i == 0:
                    # The inferred contact can sit on a one-pixel matte or at a coin
                    # rim. Label it; never broaden an unobserved surface as evidence.
                    edges.append(point.copy())
                    flags.append("guide-on-wall")
                    continue
                edges.append(rays[i-1])
                flags.append("visible-mask-boundary" if in_frame[i] else "frame-clipped")
            else:
                edges.append(rays[-1])
                flags.append("search-limit")
        section_pixels.append([edges[0], point, edges[1]])
        reasons.append(flags)
    section_pixels = np.array(section_pixels)
    world = np.stack([lift(section_pixels[:, i], depths) for i in range(3)], axis=1)
    faces = []
    for row in range(len(world) - 1):
        first = 3 * row
        for side in range(2):
            i = first + side
            faces.extend([[i, i+1, i+4], [i, i+4, i+3]])
    triangles = world.reshape(-1, 3)[np.asarray(faces)]
    # Compare the entire *pictured segment* with the unchanged game. This visible
    # ribbon excludes all unknown parts of the river beyond the frame and coin arc.
    stations = [(r["s"] - course["inlet"], r) for r in course["rows"]]
    selected = [(s, r) for s, r in stations if 12.5 <= s <= 30]
    axes = np.array([r["r"] for _, r in selected])
    positions = np.array([r["p"] for _, r in selected])
    measures = {}
    for label, steer in [("centre", 0.), ("left", -2.95), ("right", 2.95)]:
        probe = positions + axes * steer
        distances = distances_to_triangles(probe, triangles)
        measures[label] = {
            "lateralOffset": steer, "medianDistanceToVisibleSurface": round(float(np.median(distances)), 4),
            "maxDistanceToVisibleSurface": round(float(distances.max()), 4),
            "stationAtMax": float(selected[int(distances.argmax())][0]),
            "samplesFartherThanHalfAUnit": int((distances > .5).sum()),
        }
    pure_mask = np.array(Image.open(args.mask).convert("RGB"))[:, :, 1] < 128
    raster = Image.new("1", (w, h)); draw = ImageDraw.Draw(raster)
    for i in range(len(world)-1):
        for a, b in [(0,1),(1,2)]:
            quad = [section_pixels[i,a], section_pixels[i,b], section_pixels[i+1,b], section_pixels[i+1,a]]
            draw.polygon([tuple(v) for v in quad], fill=1)
    ribbon_pixels = np.asarray(raster)
    visible_crop = np.s_[575:710, 295:560]
    area = ribbon_pixels[visible_crop]
    original_wall = ~pure_mask[visible_crop]
    result = {
        "meaning": "Partial, unintegrated fitting study of the pictured arc. Each section is traced to the saved approved water mask, then lifted to the optical depth of the pictured coin chain. Hidden depths and widths at the image edge remain interpretations.",
        "camera": cam["mw"], "fov": cam["fov"], "size": [w,h], "worldSections": dump(world),
        "sourceSectionsPx": dump(section_pixels), "sourceBoundaryStatus": reasons, "faces": faces,
        "guideDepths": dump(measured_depth), "fullTurnProbe": measures, "sampleCount":len(selected),
        "centrelineAndLimits": [{"s": round(s, 4), "centre": dump(r["p"]),
                                "left": dump(np.array(r["p"])-2.95*np.array(r["r"])),
                                "right": dump(np.array(r["p"])+2.95*np.array(r["r"]))} for s, r in selected],
        "crestOpeningSilhouetteDiagnostic": {
            "crop":[295,575,560,710], "nativeWallPixelsInCrop":int(original_wall.sum()),
            "purplePixelsCoveredByStudyRibbon":int(np.count_nonzero(area & original_wall)),
            "purplePixelsStillOpen":int(np.count_nonzero(~area & original_wall)),
        },
        "limits": "Coverage uses only this partial visible ribbon, not the full game or a complete rendering. A low overlap is evidence about one opening silhouette only. The .5-unit clearance threshold is a study readout, not the game's collision tolerance.",
    }
    args.output.write_text(json.dumps(result, separators=(",", ":")) + "\n")
    print(len(world), "surveyed cross sections.", json.dumps(measures))
    print(result["crestOpeningSilhouetteDiagnostic"])


if __name__ == "__main__":
    main()
