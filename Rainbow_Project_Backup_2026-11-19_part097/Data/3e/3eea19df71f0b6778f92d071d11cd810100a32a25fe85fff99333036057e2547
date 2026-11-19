"""Measure the saved camera, visible coin arc and clearance through the painted crest opening.

This produces guide curves and diagnostic data only. No gameplay state is edited.
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import distance_transform_edt, map_coordinates
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation


def load_json(path):
    return json.loads(path.read_text())


def vec(values):
    return np.asarray(values, dtype=float)


def rounded(values):
    return np.round(values, 5).tolist()


def pixel_difference(reference, result, box):
    x0, y0, x1, y1 = box
    error = np.abs(reference[y0:y1, x0:x1] - result[y0:y1, x0:x1]).mean(axis=2)
    return {
        "nativeBox": box,
        "meanAbsoluteRgb": round(float(error.mean()), 4),
        "within20Percent": round(float(100 * (error <= 20).mean()), 4),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("course", "assets", "approved", "before", "new", "depth", "result", "overlay"):
        parser.add_argument(name, type=Path)
    args = parser.parse_args()
    course = load_json(args.course)
    camera = load_json(args.assets / "cam06_locked.json")
    coins = load_json(args.assets / "coins06.json")["coins"]
    width, height = camera["size"]
    matrix = vec(camera["mw"]).reshape(4, 4).T
    rotation, eye = matrix[:3, :3], matrix[:3, 3]
    centres = vec([coin["px"][:2] for coin in coins])
    diameters = vec([coin["px"][2] for coin in coins])
    coin_world = vec([coin["pos"] for coin in coins])
    origin = np.zeros(7)
    original = Image.open(args.approved).convert("RGB")
    surface_mask = np.asarray(Image.open(args.assets / "mask06.png").convert("RGB"))[:, :, 1] > 128
    signed_distance = distance_transform_edt(surface_mask) - distance_transform_edt(~surface_mask)
    rows = [r for r in course["rows"] if 10 - 1e-6 <= r["s"] - course["inlet"] <= 30 + 1e-6]
    stations = vec([r["s"] - course["inlet"] for r in rows])
    route = vec([r["p"] for r in rows])
    sweep_rows = [r for r in course["rows"] if -4 <= r["s"] - course["inlet"] <= 54]
    sweep_centre = vec([r["p"] for r in sweep_rows])
    sweep_right = vec([r["r"] for r in sweep_rows])
    sweep_up = vec([r["u"] for r in sweep_rows])
    sweep_tangent = vec([r["t"] for r in sweep_rows])

    def project(points, change):
        pose = rotation @ Rotation.from_rotvec(change[3:6]).as_matrix()
        view = (points - eye - change[:3]) @ pose
        depth = -view[:, 2]
        focal = height / (2 * np.tan(np.deg2rad(camera["fov"] + change[6]) / 2))
        pixels = np.column_stack((width / 2 + focal * view[:, 0] / depth,
                                  height / 2 - focal * view[:, 1] / depth))
        return pixels, depth

    def backproject(pixels, depths):
        focal = height / (2 * np.tan(np.deg2rad(camera["fov"]) / 2))
        local = np.column_stack(((pixels[:, 0] - width / 2) * depths / focal,
                                 (height / 2 - pixels[:, 1]) * depths / focal,
                                 -depths))
        return eye + local @ rotation.T

    def wall_distance(pixels):
        coordinates = [pixels[:, 1], pixels[:, 0]]
        return map_coordinates(signed_distance, coordinates, order=1, mode="nearest")

    def camera_result(change):
        p, _ = project(coin_world, change)
        radii = np.linalg.norm(p - centres, axis=1)
        locations, _ = project(route, change)
        distance = wall_distance(locations)
        return {
            "translationWorld": rounded(change[:3]),
            "rotationLocalRadians": rounded(change[3:6]),
            "lensChangeDegrees": round(float(change[6]), 6),
            "coinPixelRms": round(float(np.sqrt(np.mean(radii ** 2))), 5),
            "worstCoinPixelError": round(float(radii.max()), 5),
            "projectedRouteSamplesInWall": int((distance > 0).sum()),
            "maximumWallOverlapPx": round(float(distance.max()), 3),
        }

    def residual(change, wall_weight=0):
        coin_errors = (project(coin_world, change)[0] - centres).ravel()
        if not wall_weight:
            return coin_errors
        route_errors = np.maximum(0, wall_distance(project(route, change)[0]))
        return np.r_[coin_errors, wall_weight * route_errors]

    limits = vec([1.5, 1.5, 1.5, .16, .16, .16, 6])
    refit = least_squares(residual, origin, bounds=(-limits, limits))
    trade_off = least_squares(lambda p: residual(p, 1), origin, bounds=(-limits, limits),
                              max_nfev=400)
    projected_route, route_depths = project(route, origin)
    rounded_route = np.rint(projected_route).astype(int)
    native_distances = signed_distance[rounded_route[:, 1], rounded_route[:, 0]]
    worst = int(np.argmax(native_distances))
    tracked_pixel = rounded_route[worst]
    # Each guide point sits just inside the pictured lower edge of the photographed coin.
    # A single image cannot measure water depth here. Reuse the existing coin's optical
    # depth and retain the original world coordinate beside it for comparison.
    guide_pixels = centres.copy()
    guide_pixels[:, 1] += .37 * diameters
    coin_depths = project(coin_world, origin)[1]
    guide = backproject(guide_pixels, coin_depths)
    landmark_guides = [{
        "sourceCentrePx": rounded(centres[i]),
        "diameterPx": float(diameters[i]),
        "proposedSurfacePx": rounded(guide_pixels[i]),
        "assumedCameraDepth": round(float(coin_depths[i]), 5),
        "worldAtThatDepth": rounded(point),
        "retainedCoinWorld": rounded(coin_world[i]),
        "retainedStationFromInlet": round(coins[i]["s"] - course["inlet"], 5),
    } for i, point in enumerate(guide)]
    # Test whether a *nearer* solid object could legitimately hide the conflicting
    # centerline. These assumed bounds are deliberately stated and are not colliders.
    # Each test point is compared with finite, oriented lane slices, not a single ray.
    def clearance_to_swim_envelope(point):
        delta = point - sweep_centre
        lateral = np.sum(delta * sweep_right, axis=1)
        vertical = np.sum(delta * sweep_up, axis=1)
        longitudinal = np.sum(delta * sweep_tangent, axis=1)
        offsets = np.column_stack((np.maximum(0, np.abs(lateral) - 3.4),
                                   np.maximum.reduce([np.zeros_like(vertical), -.45 - vertical, vertical - 2.25]),
                                   np.maximum(0, np.abs(longitudinal) - .135)))
        return float(np.linalg.norm(offsets, axis=1).min())

    samples = []
    for z in np.arange(1., route_depths[worst] - .02, .25):
        point = backproject(tracked_pixel[None, :], np.array([z]))[0]
        samples.append({"depth": round(float(z), 3),
                        "clearanceToAssumedFullSwimEnvelope": round(clearance_to_swim_envelope(point), 3)})
    depthmap = np.load(args.depth)["depth"]
    def relative_depth(x, y):
        lookup = [[(y + .5) * depthmap.shape[0] / height - .5],
                  [(x + .5) * depthmap.shape[1] / width - .5]]
        return round(float(map_coordinates(depthmap, lookup, order=1, mode="nearest")[0]), 4)

    array = np.asarray(original, dtype=np.int16)
    boxes = {"wholeFrame": [0, 0, width, height], "crestAperture": [295, 575, 560, 710],
             "goldAndSlottedWall": [335, 242, 858, 557]}
    comparisons = {}
    for label, path in (("Claudia", args.before), ("structural", args.new)):
        actual = np.asarray(Image.open(path).convert("RGB"), dtype=np.int16)
        if actual.shape != array.shape:
            raise ValueError("Unexpected opening capture dimensions")
        comparisons[label] = {name: pixel_difference(array, actual, box) for name, box in boxes.items()}

    result = {
        "nativeSize": [width, height], "coinCount": len(coins),
        "distanceFromInletTested": [10, 30], "courseSampleInterval": .25,
        "routeSampleCount": len(route), "lockedCamera": camera_result(origin),
        "coinOnlyCameraRefit": camera_result(refit.x), "equalPixelWeightRouteAndCoinRefit": camera_result(trade_off.x),
        "refitBounds": {"translationPerAxis": 1.5, "rotationPerAxisRad": .16, "fovChangeDegrees": 6},
        "worstFixedViewCentreline": {
            "stationFromInlet": round(float(stations[worst]), 5), "world": rounded(route[worst]),
            "imagePixel": tracked_pixel.tolist(), "opticalDepth": round(float(route_depths[worst]), 5),
            "distanceInsidePurpleMaskNearestNativePixel": round(float(native_distances[worst]), 3),
        },
        "nearerOccluderSamples": samples,
        "occluderLimit": "Single worst ray only. Sampled lane spans +/-3.4 laterally and -.45 to 2.25 vertically. Clearance is a diagnostic estimate, not engine collision or proof that a plate could attach to a wall or clear the moving camera.",
        "relativeDA3Samples": {"purpleAt461_649": relative_depth(461, 649),
                               "cyanAt148_649": relative_depth(148, 649)},
        "depthLimit": "The DA3 output has relative monocular depth. It is not a surveyed distance in game units.",
        "inferredGuide": landmark_guides,
        "guideLimit": "The image fixes the coin centres. Surface points and depths are modeling guides. They do not replace the ride centreline. Coin world placements were fitted from the same saved camera, so reprojection is a calibration check and not an independent photograph.",
        "openingComparisons": comparisons,
    }
    args.result.write_text(json.dumps(result, indent=2) + "\n")
    chart = Image.new("RGB", (width, height + 164), "#170e25")
    chart.paste(original, (0, 0))
    draw = ImageDraw.Draw(chart)
    pick = (stations >= 11.75) & (stations <= 30)
    draw.line([tuple(p) for p in projected_route[pick]], fill="#0c0920", width=8)
    draw.line([tuple(p) for p in projected_route[pick]], fill="#ff6538", width=4)
    draw.line([tuple(p) for p in guide_pixels], fill="#084144", width=6)
    draw.line([tuple(p) for p in guide_pixels], fill="#5bfff5", width=3)
    for x, y in centres:
        draw.ellipse((x-4, y-4, x+4, y+4), fill="#fff4a6", outline="#422500", width=1)
    x, y = tracked_pixel
    draw.ellipse((x-11, y-11, x+11, y+11), outline="#ff6538", width=4)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 23)
    draw.text((19, height + 11), "Screen 06 camera study  •  Annotated copy", font=font, fill="white")
    draw.text((19, height + 48), "Orange   Retained swim centreline; circle marks the purple opening.", font=font, fill="#ff9874")
    draw.text((19, height + 84), "Gold   Fifteen coin centres measured on the original.", font=font, fill="#ffeaa0")
    draw.text((19, height + 120), "Cyan   Proposed surface guide, inferred directly below the coins.", font=font, fill="#84fff4")
    chart.save(args.overlay, optimize=True)
    print(json.dumps({key: result[key] for key in ["lockedCamera","coinOnlyCameraRefit","equalPixelWeightRouteAndCoinRefit","worstFixedViewCentreline","openingComparisons"]}, indent=2))


if __name__ == "__main__":
    main()
