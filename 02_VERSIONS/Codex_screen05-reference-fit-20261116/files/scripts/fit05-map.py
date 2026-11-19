#!/usr/bin/env python3
"""Map approved Screen 05 feature traces to numeric spline-surface controls.

The float coordinate capture is geometry data, never source-image colour. By default this
writes a QA preview; pass --output src/vfx/fit05-data.json only between renderer captures.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
from pathlib import Path

import numpy as np
from scipy.interpolate import PchipInterpolator
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks


EDGE_KEYS = (("outerLeft", "left"), ("coreLeft", "coreLeft"),
             ("coreRight", "coreRight"), ("outerRight", "right"))
DOMAIN = {1: "near", 2: "far"}


def rounded(value):
    if isinstance(value, (float, np.floating)):
        return round(float(value), 5)
    if isinstance(value, np.ndarray):
        return rounded(value.tolist())
    if isinstance(value, list):
        return [rounded(x) for x in value]
    if isinstance(value, dict):
        return {k: rounded(v) for k, v in value.items()}
    return value


class Coordinates:
    def __init__(self, path, width, height):
        raw = gzip.decompress(path.read_bytes()) if path.suffix == ".gz" else path.read_bytes()
        self.data = np.frombuffer(raw, dtype="<f4").reshape(height, width, 4)
        self.width, self.height = width, height
        self.stats = {"exact": 0, "nearestPixel": 0, "unsupported": 0}

    def sample(self, x, y, expected=None, count=False):
        if not (0 <= x <= self.width - 1 and 0 <= y <= self.height - 1):
            if count:
                self.stats["unsupported"] += 1
            return None
        ix, iy = int(x), int(y)
        ix1, iy1 = min(ix + 1, self.width - 1), min(iy + 1, self.height - 1)
        pixels = self.data[[iy, iy, iy1, iy1], [ix, ix1, ix, ix1]]
        types = np.rint(pixels[:, 2]).astype(int)
        valid = (pixels[:, 3] > 0.5) & np.isfinite(pixels).all(axis=1)
        if valid.all() and len(set(types)) == 1 and types[0] in DOMAIN and (expected is None or types[0] == expected):
            fx, fy = x - ix, y - iy
            weights = np.array([(1-fx)*(1-fy), fx*(1-fy), (1-fx)*fy, fx*fy])
            if count:
                self.stats["exact"] += 1
            return int(types[0]), weights @ pixels[:, :2]
        # One raster pixel of fallback is enough for a traced edge; do not cross a gap or
        # move unsupported reference features onto a different part of the visible river.
        choices = []
        for yy in range(max(0, round(y)-1), min(self.height, round(y)+2)):
            for xx in range(max(0, round(x)-1), min(self.width, round(x)+2)):
                p = self.data[yy, xx]
                kind = int(round(float(p[2])))
                dist = float(np.hypot(xx-x, yy-y))
                if dist <= 1.0 and p[3] > 0.5 and kind in DOMAIN and np.isfinite(p).all() and (expected is None or kind == expected):
                    choices.append((dist, kind, p[:2]))
        if choices:
            _, kind, result = min(choices, key=lambda c: c[0])
            if count:
                self.stats["nearestPixel"] += 1
            return kind, result.astype(float)
        if count:
            self.stats["unsupported"] += 1
        return None


def simplify_graph(s, values, tolerance=0.016):
    """Keep common knots whose linear interpolation bounds every band-edge error."""
    keep = {0, len(s)-1}
    stack = [(0, len(s)-1)]
    while stack:
        a, b = stack.pop()
        if b-a <= 1:
            continue
        t = (s[a+1:b] - s[a]) / (s[b] - s[a])
        interp = values[a] + t[:, None] * (values[b] - values[a])
        errors = np.max(np.abs(values[a+1:b] - interp), axis=1)
        j = int(np.argmax(errors)) + a + 1
        if errors[j-a-1] > tolerance:
            keep.add(j)
            stack.extend(((a, j), (j, b)))
    return sorted(keep)


def fit_edge(points, grid):
    p = np.asarray(points, dtype=float)
    p = p[np.argsort(p[:, 0])]
    # Inverse raster coordinates can repeat within one row. Median bins avoid a singular
    # interpolant while retaining the densely sampled projected shape.
    bins = np.round(p[:, 0] / 0.015).astype(np.int64)
    knots = np.array([[np.median(p[bins == b, 0]), np.median(p[bins == b, 1])] for b in np.unique(bins)])
    if len(knots) < 2:
        return None
    interp = PchipInterpolator(knots[:, 0], knots[:, 1], extrapolate=False)
    clamped = np.clip(grid, knots[0, 0], knots[-1, 0])
    result = interp(clamped)
    # A very small longitudinal smooth removes raster jitter, not the approved S bends.
    return gaussian_filter1d(result, 0.65, mode="nearest")


def measured_edge(point, key):
    """Frame/image intersections are visibility limits, not liquid-band edges."""
    side = "left" if key in ("left", "coreLeft") else "right"
    state = point.get("edgeVisibility", {}).get(side, "measured")
    clipped = "image_clipped" in state or "gold_frame_clipped" in state
    if not clipped:
        return True
    if key == side:
        return False
    # A core boundary remains useful when it lies inside the visible band.
    return abs(point[key] - point[side]) > 1.0


def monotone_strokes(curve, kind):
    """Preserve curve order but split genuine longitudinal turns for one-valued LUTs."""
    p = np.array(curve)
    if len(p) < 3:
        return []
    s = gaussian_filter1d(p[:, 0], 0.55, mode="nearest")
    prominence = 0.0008 if kind == 1 else 0.003
    peaks = find_peaks(s, prominence=prominence)[0]
    troughs = find_peaks(-s, prominence=prominence)[0]
    cuts = sorted(set([0, len(p)-1, *peaks, *troughs]))
    out = []
    for a, b in zip(cuts[:-1], cuts[1:]):
        chunk = p[a:b+1].copy()
        if len(chunk) < 3 or abs(chunk[-1, 0]-chunk[0, 0]) < prominence:
            continue
        increasing = chunk[-1, 0] > chunk[0, 0]
        chunk[:, 0] = np.maximum.accumulate(chunk[:, 0]) if increasing else np.minimum.accumulate(chunk[:, 0])
        # Remove longitudinal plateaus from negligible raster reversals. Width and
        # silhouette samples otherwise remain the measured parametric curve.
        select = np.r_[True, np.abs(np.diff(chunk[:, 0])) > 0.000015]
        chunk = chunk[select]
        if len(chunk) >= 2:
            out.append(chunk)
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--features", type=Path, default=Path("qa/reference-fit/reference-features.json"))
    parser.add_argument("--coordinates", type=Path, default=Path("qa/reference-fit/coordinates/water-coordinates.f32.gz"))
    parser.add_argument("--output", type=Path, default=Path("qa/reference-fit/fit05-data.preview.json"))
    parser.add_argument("--stats", type=Path, default=Path("qa/reference-fit/fit05-map-report.json"))
    parser.add_argument("--pixel-step", type=float, default=1.0)
    args = parser.parse_args()
    source = json.loads(args.features.read_text())
    width, height = source["image"]["width"], source["image"]["height"]
    coords = Coordinates(args.coordinates, width, height)
    result = {"schemaVersion": 1,
              "sourceSha256": source.get("sourceSha256"),
              "near": {"sRange": [], "bands": [], "glints": [], "sheens": []},
              "far": {"sRange": [], "bands": [], "glints": [], "sheens": []}}
    report = {"featureSha256": hashlib.sha256(args.features.read_bytes()).hexdigest(),
              "coordinateSha256": hashlib.sha256(args.coordinates.read_bytes()).hexdigest(),
              "imageSize": [width, height], "bands": [], "glints": [], "sheens": [], "unsupportedSamples": [],
              "method": "PCHIP screen traces sampled at 1px; same-domain coordinate interpolation; shared edge knots; numeric data only."}

    for band in source["bands"]:
        points = sorted(band["points"], key=lambda p: p["y"])
        yy = np.array([p["y"] for p in points], dtype=float)
        if len(points) < 2:
            continue
        dense_y = np.arange(yy[0], yy[-1] + args.pixel_step * 0.5, args.pixel_step)
        mapped = {kind: {key: [] for key, _ in EDGE_KEYS} for kind in DOMAIN}
        support = {key: 0 for key, _ in EDGE_KEYS}
        clipped = {}
        for key, source_key in EDGE_KEYS:
            observed = [p for p in points if measured_edge(p, source_key)]
            clipped[key] = len(points) - len(observed)
            if len(observed) < 2:
                continue
            observed_y = np.array([p["y"] for p in observed])
            ys = dense_y[(dense_y >= observed_y[0]) & (dense_y <= observed_y[-1])]
            xs = PchipInterpolator(observed_y, [p[source_key] for p in observed])(ys)
            for x, y in zip(xs, ys):
                found = coords.sample(float(x), float(y), count=True)
                if found is None:
                    report["unsupportedSamples"].append({"id": band["id"], "edge": key, "xy": [float(x), float(y)]})
                    continue
                kind, p = found
                mapped[kind][key].append(p)
                support[key] += 1
        band_report = {"id": band["id"], "denseScreenRows": len(dense_y), "mappedByEdge": support,
                       "excludedClippedControls": clipped, "domains": []}
        for kind, edges in mapped.items():
            if any(len(edges[key]) < 3 for key, _ in EDGE_KEYS):
                continue
            observed_ranges = np.array([[min(p[0] for p in edges[key]), max(p[0] for p in edges[key])]
                                        for key, _ in EDGE_KEYS])
            lo, hi = float(np.min(observed_ranges[:, 0])), float(np.max(observed_ranges[:, 1]))
            if hi <= lo + 0.03:
                continue
            count = min(1800, max(24, int((hi-lo) / (0.075 if kind == 1 else 0.25)) + 1))
            grid = np.linspace(lo, hi, count)
            values = np.column_stack([fit_edge(edges[key], grid) for key, _ in EDGE_KEYS])
            measured_values = values.copy()
            inferred = {}
            for j, (key, _) in enumerate(EDGE_KEYS):
                outside = (grid < observed_ranges[j, 0]) | (grid > observed_ranges[j, 1])
                inferred[key] = int(np.count_nonzero(outside))
                for i in np.flatnonzero(outside):
                    candidates = [a for a in range(4) if observed_ranges[a, 0] <= grid[i] <= observed_ranges[a, 1]]
                    if not candidates:
                        continue
                    anchor = min(candidates, key=lambda a: abs(a-j))
                    endpoint = float(np.clip(grid[i], *observed_ranges[j]))
                    values[i, j] = (float(np.interp(endpoint, grid, measured_values[:, j]))
                                    + measured_values[i, anchor]
                                    - float(np.interp(endpoint, grid, measured_values[:, anchor])))
            # Lateral orientation is shared by both map domains (+screen right). Preserve
            # non-zero positive core widths, including image-clipped left/right shoulders.
            crossings = int(np.sum(np.diff(values, axis=1) < 0))
            values.sort(axis=1)
            for j in range(1, 4):
                values[:, j] = np.maximum(values[:, j], values[:, j-1] + 0.008)
            keep = simplify_graph(grid, values, 0.018 if kind == 1 else 0.028)
            out_band = {"id": band["id"], "kind": band.get("kind", "main"), "sRange": [float(lo), float(hi)]}
            for j, (key, _) in enumerate(EDGE_KEYS):
                out_band[key] = np.column_stack((grid[keep], values[keep, j])).tolist()
            result[DOMAIN[kind]]["bands"].append(out_band)
            band_report["domains"].append({"domain": DOMAIN[kind], "range": [float(lo), float(hi)],
                                           "controlsPerEdge": len(keep), "reorderedSamples": crossings,
                                           "observedEdgeRanges": {key: observed_ranges[j].tolist() for j, (key, _) in enumerate(EDGE_KEYS)},
                                           "inferredGridSamples": inferred, "totalGridSamples": len(grid)})
        report["bands"].append(band_report)

    for category, glint in [(key, stroke) for key in ("glints", "sheens") for stroke in source.get(key, [])]:
        p = np.array(glint["points"], dtype=float)
        if len(p) < 2:
            continue
        lengths = np.r_[0, np.cumsum(np.linalg.norm(np.diff(p[:, :2], axis=0), axis=1))]
        if lengths[-1] < 0.01:
            continue
        steps = np.arange(0, lengths[-1] + args.pixel_step * 0.5, args.pixel_step)
        dense = np.column_stack([np.interp(steps, lengths, p[:, j]) for j in range(3)])
        segments = []
        current_kind, current = None, []
        valid_count = 0
        for i, (x, y, screen_width) in enumerate(dense):
            found = coords.sample(float(x), float(y), count=True)
            if found is None:
                if current:
                    segments.append((current_kind, current))
                current_kind, current = None, []
                report["unsupportedSamples"].append({"id": glint["id"], "xy": [float(x), float(y)]})
                continue
            kind, centre = found
            tangent = dense[min(i+1, len(dense)-1), :2] - dense[max(i-1, 0), :2]
            tangent /= max(float(np.linalg.norm(tangent)), 1e-8)
            normal = np.array([-tangent[1], tangent[0]])
            tx = coords.sample(float(x+tangent[0]), float(y+tangent[1]), kind)
            nx = coords.sample(float(x+normal[0]), float(y+normal[1]), kind)
            if tx is None or nx is None:
                if current:
                    segments.append((current_kind, current))
                current_kind, current = None, []
                continue
            a, b = tx[1]-centre, nx[1]-centre
            # Width perpendicular to the mapped centreline, in its own (s,lateral) plane.
            world_per_pixel = abs(float(a[0]*b[1]-a[1]*b[0])) / max(float(np.linalg.norm(a)), 1e-8)
            half_width = max(0.002, float(screen_width) * 0.5 * world_per_pixel)
            if kind != current_kind and current:
                segments.append((current_kind, current))
                current = []
            current_kind = kind
            current.append([float(centre[0]), float(centre[1]), half_width])
            valid_count += 1
        if current:
            segments.append((current_kind, current))
        kept = 0
        monotone_segments = [(kind, part) for kind, curve in segments for part in monotone_strokes(curve, kind)]
        for n, (kind, curve) in enumerate(monotone_segments):
            if len(curve) < 3:
                continue
            indices = sorted(set(np.rint(np.linspace(0, len(curve)-1, min(18, len(curve)))).astype(int)))
            result[DOMAIN[kind]][category].append({"id": glint["id"] + (f"_{n}" if len(monotone_segments)>1 else ""),
                "points": [curve[j] for j in indices], "strength": glint.get("strength", 1.0)})
            kept += 1
        report[category].append({"id": glint["id"], "denseSamples": len(dense), "mappedSamples": valid_count, "segments": kept})

    for name in DOMAIN.values():
        domain = result[name]
        all_s = [p[0] for b in domain["bands"] for p in b["outerLeft"]]
        all_s += [p[0] for key in ("glints", "sheens") for g in domain[key] for p in g["points"]]
        domain["sRange"] = [min(all_s), max(all_s)] if all_s else [0.0, 0.0]
        events = []
        for stroke in domain["glints"] + domain["sheens"]:
            ss = [p[0] for p in stroke["points"]]
            events.extend([(min(ss), 1), (max(ss), -1)])
        active = peak = 0
        for _, change in sorted(events, key=lambda event: (event[0], -event[1])):
            active += change
            peak = max(peak, active)
        report.setdefault("simultaneousStrokes", {})[name] = peak
    report["lookupCounts"] = coords.stats
    total = sum(coords.stats.values())
    report["supportFraction"] = (coords.stats["exact"] + coords.stats["nearestPixel"]) / max(total, 1)
    report["output"] = str(args.output)
    report["notes"] = ["Unobserved offscreen geometry is not presented as measured reference data.",
                       "No RGB image data or 2D reference projection is stored in the runtime controls.",
                       "Band domains cover the union of measured edges. Missing endpoint edges follow the closest observed edge with endpoint width preserved; inferred sample counts are explicit above.",
                       "Image-clipped and gold-frame-clipped outer boundaries are excluded from the fit; they are visibility limits, not actual ribbon edges."]
    report["notes"].extend(["Glints and sheens split at longitudinal turns, preserving endpoint width at each split. Do not re-taper split endpoints.",
                             "Stroke halfwidth is perpendicular world distance in (s,lateral). A lateral-only lookup must project width using local ds/dl slope."])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.stats.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(rounded(result), separators=(",", ":")) + "\n")
    args.stats.write_text(json.dumps(rounded(report), indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "supportFraction": round(report["supportFraction"], 4),
                      "nearBands": len(result["near"]["bands"]), "farBands": len(result["far"]["bands"]),
                      "glints": sum(len(result[k]["glints"]) for k in DOMAIN.values())}))


if __name__ == "__main__":
    main()
