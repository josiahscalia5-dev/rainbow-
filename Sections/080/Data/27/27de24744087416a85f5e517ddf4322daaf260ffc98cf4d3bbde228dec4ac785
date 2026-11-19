#!/usr/bin/env python3
"""Invert the current Three.js Neutral + sRGB + display grade for measured water colours.

No image is used by the renderer. This is an offline palette calibration tool.
The forward constants match three r170 tonemapping_pars_fragment.glsl.js,
src/render/env.ts and src/render/grade.ts. Bloom and vignette are excluded so
these are intrinsic palette values, independent of their placement on screen.
"""
from pathlib import Path
import json
import numpy as np
from scipy.optimize import least_squares

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'qa/reference-fit/reference-features.json'
LUMA = np.array([0.2126, 0.7152, 0.0722])


def forward(linear):
    c = np.asarray(linear, dtype=float) * 0.86
    x = float(np.min(c))
    offset = x - 6.25 * x * x if x < 0.08 else 0.04
    c = c - offset
    peak = float(np.max(c))
    if peak >= 0.76:
        new_peak = 1 - 0.24 ** 2 / (peak + 0.24 - 0.76)
        c *= new_peak / peak
        g = 1 - 1 / (0.15 * (peak - new_peak) + 1)
        c = c * (1 - g) + new_peak * g
    c = np.where(c <= 0.0031308, c * 12.92, 1.055 * np.maximum(c, 0) ** (1 / 2.4) - 0.055)
    luma = float(c @ LUMA)
    c = luma + (c - luma) * 1.36
    return ((c - 0.5) * 1.15 + 0.5) * 255


def invert(rgb):
    target = np.asarray(rgb, dtype=float)
    best = None
    for start in ([0.08, 0.4, 0.8], [0.8, 0.08, 0.7], [0.6, 0.6, 0.6]):
        fit = least_squares(lambda x: forward(x) - target, start, bounds=(0, 8),
                            xtol=1e-13, ftol=1e-13, gtol=1e-13, max_nfev=4000)
        error = float(np.max(np.abs(forward(fit.x) - target)))
        if best is None or error < best[0]:
            best = (error, fit.x)
    error, linear = best
    if error > 1e-5:
        raise RuntimeError(f'Palette fit failed for {rgb}: max error {error}')
    return {'targetSrgb255': target.tolist(), 'shaderLinear': np.round(linear, 8).tolist(),
            'forwardSrgb255': np.round(forward(linear), 6).tolist(), 'maxError255': error}


if __name__ == '__main__':
    source = json.loads(SOURCE.read_text())
    samples = [{**x, 'calibration': invert(x['srgb255'])} for x in source['colorSamples']]
    roles = {}
    for role in dict.fromkeys(x['role'] for x in samples):
        group = [x['srgb255'] for x in samples if x['role'] == role]
        roles[role] = {'count': len(group), **invert(np.median(group, axis=0))}
    result = {
        'source': str(SOURCE.relative_to(ROOT)),
        'pipeline': 'Neutral exposure 0.86 -> sRGB -> saturation 1.36 Rec709 -> contrast 1.15',
        'exclusions': 'Bloom and spatial vignette are excluded. Fit uses unclipped output to avoid ambiguous saturated solutions.',
        'roles': roles, 'samples': samples,
    }
    out = ROOT / 'qa/reference-fit/palette-calibration.json'
    out.write_text(json.dumps(result, indent=2) + '\n')
    print('| Role | Measured median sRGB /255 | Shader linear RGB |')
    print('|---|---|---|')
    for role, fit in roles.items():
        print(f"| {role} | {', '.join(f'{v:g}' for v in fit['targetSrgb255'])} | {', '.join(f'{v:.6f}' for v in fit['shaderLinear'])} |")
    print(f"Verified {len(samples)} samples; max channel error {max(x['calibration']['maxError255'] for x in samples):.3g}/255.")
