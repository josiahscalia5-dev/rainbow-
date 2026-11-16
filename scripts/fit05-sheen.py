#!/usr/bin/env python3
"""Author one scalar optical field from approved water illumination on real geometry.

The output stores neither RGB nor image coordinates. It is a non-colour material
parameter indexed by the river's longitudinal/lateral coordinates; renderers can
advect it and use its gradient for surface normals. Reference occluders are masked
before mapping, and unsupported regions are smoothly inpainted.
"""
from __future__ import annotations

import argparse
import ast
import gzip
import hashlib
import importlib.util
import json
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import binary_dilation, distance_transform_edt, gaussian_filter, map_coordinates


ROOT = Path(__file__).resolve().parents[1]
S_RANGE = (128.5, 190.0)
LAT_RANGE = (-6.6, 6.6)
WARP_SCALE = 3.0


def literal_constant(path, name):
    for node in ast.parse(path.read_text()).body:
        if isinstance(node, ast.Assign) and any(isinstance(x, ast.Name) and x.id == name for x in node.targets):
            return ast.literal_eval(node.value)
    raise KeyError(name)


def project_palette(rgb, palette, knots):
    """Nearest point on the measured shadow/body/sheen colour path, scalar only."""
    best_distance = np.full(rgb.shape[:2], np.inf)
    scalar = np.zeros(rgb.shape[:2])
    # Green carries the principal lighting change for both saturated materials.
    weights = np.array([0.55, 1.0, 0.45])
    for i, (a, b) in enumerate(zip(palette[:-1], palette[1:])):
        direction = b-a
        phase = np.clip(np.sum((rgb-a)*direction*weights, axis=2) / np.sum(direction*direction*weights), 0, 1)
        distance = np.sum((rgb-a-phase[..., None]*direction)**2*weights, axis=2)
        closer = distance < best_distance
        best_distance[closer] = distance[closer]
        scalar[closer] = (knots[i]+phase*(knots[i+1]-knots[i]))[closer]
    return scalar, best_distance


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--width', type=int, default=512)
    parser.add_argument('--height', type=int, default=1024)
    parser.add_argument('--output', type=Path, default=ROOT/'assets/textures/fit05-sheen.png')
    parser.add_argument('--qa', type=Path, default=ROOT/'qa/reference-fit/sheen')
    args = parser.parse_args()
    features_path = ROOT/'qa/reference-fit/reference-features.json'
    features = json.loads(features_path.read_text())
    source_path = ROOT/features['source']
    coord_path = ROOT/'qa/reference-fit/coordinates/water-coordinates.f32.gz'
    image = np.asarray(Image.open(source_path).convert('RGB'), dtype=float)
    h, w = image.shape[:2]
    coords = np.frombuffer(gzip.decompress(coord_path.read_bytes()), '<f4').reshape(h,w,4)

    # Read literals without executing the extraction script's top-level writes.
    interior = literal_constant(ROOT/'scripts/fit05-reference.py', 'INTERIOR')
    yy, xx = np.mgrid[:h,:w]
    ay, al, ar = np.array(interior).T
    water = ((yy >= ay[0]) & (yy <= ay[-1])
             & (xx >= np.interp(yy, ay, al)) & (xx <= np.interp(yy, ay, ar)))
    objects = Image.new('1', (w,h)); draw = ImageDraw.Draw(objects)
    exclusions = features['manualExclusions']
    draw.polygon([tuple(p) for p in exclusions['bennyPolygon']], fill=1)
    for x,y,rx,ry in exclusions['coinEllipses']:
        draw.ellipse((x-rx,y-ry,x+rx,y+ry),fill=1)
    for x,y,r in exclusions['bubbleCircles']:
        draw.ellipse((x-r,y-r,x+r,y+r),fill=1)
    excluded = binary_dilation(np.asarray(objects), iterations=8)
    glints = Image.new('1', (w,h)); draw = ImageDraw.Draw(glints)
    for stroke in features['glints']:
        for a,b in zip(stroke['points'][:-1],stroke['points'][1:]):
            draw.line((a[0],a[1],b[0],b[1]),fill=1,width=max(3,int(max(a[2],b[2])+4)))
    white = (image.min(axis=2)>177) & (np.ptp(image,axis=2)<87)
    white |= np.asarray(glints)
    excluded |= binary_dilation(white,iterations=2)
    # Reject remaining gold/foam-colour contaminants near conservative mask boundaries.
    chromatic_water = ((image[:,:,2] > 110) & (image[:,:,2] > image[:,:,0]*0.85)
                       & ((image.max(axis=2)-image.min(axis=2)) > 58))
    geometric = (coords[:,:,3]>.5) & (coords[:,:,2]==1)
    s, lat = coords[:,:,0], coords[:,:,1]
    geometric &= (s>=S_RANGE[0]) & (s<=S_RANGE[1]) & (lat>=LAT_RANGE[0]) & (lat<=LAT_RANGE[1])
    valid = water & ~excluded & chromatic_water & geometric

    palettes = {}
    for colour in ('cyan','magenta'):
        palettes[colour] = np.array([np.median([p['srgb255'] for p in features['colorSamples']
                                               if p['role']==f'{colour}_{role}'],axis=0)
                                     for role in ('shadow','body','sheen')])
    # Retain the measured luminous cyan shoulder instead of clamping all values
    # brighter than the median cyan sheen to the same optical value.
    cyan_bright = max((p['srgb255'] for p in features['colorSamples'] if p['role']=='cyan_sheen'),key=lambda c:c[1])
    palettes['cyan'] = np.vstack((palettes['cyan'],cyan_bright))
    palette_knots = {'cyan':[0.0,0.45,0.8,1.0],'magenta':[0.0,0.5,1.0]}
    smooth_image = gaussian_filter(image,(0.85,0.85,0))
    cyan, cyan_error = project_palette(smooth_image,palettes['cyan'],palette_knots['cyan'])
    magenta, magenta_error = project_palette(smooth_image,palettes['magenta'],palette_knots['magenta'])
    # Hue decides which material path supplies illumination, not runtime hue itself.
    pink = image[:,:,0] > image[:,:,1]*1.10
    scalar = np.where(pink,magenta,cyan)
    confidence = np.exp(-np.minimum(cyan_error,magenta_error)/11000)
    confidence = np.maximum(confidence,0.15)

    warp_top = 1-1/(1+(S_RANGE[1]-S_RANGE[0])/WARP_SCALE)
    u = (lat-LAT_RANGE[0])/(LAT_RANGE[1]-LAT_RANGE[0])*(args.width-1)
    v = (1-1/(1+(s-S_RANGE[0])/WARP_SCALE))/warp_top*(args.height-1)
    x,y = u[valid],v[valid]
    x0,y0 = np.floor(x).astype(int),np.floor(y).astype(int)
    fx,fy = x-x0,y-y0
    weights = np.zeros((args.height,args.width),float)
    sums = np.zeros_like(weights)
    for dx,dy,weight in ((0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)):
        ix,iy = np.minimum(x0+dx,args.width-1),np.minimum(y0+dy,args.height-1)
        weight *= confidence[valid]
        np.add.at(weights,(iy,ix),weight)
        np.add.at(sums,(iy,ix),weight*scalar[valid])
    # Small normalized smoothing suppresses pixel grain without introducing mask rims.
    soft_weights = gaussian_filter(weights,(0.6,0.55))
    measured = gaussian_filter(sums,(0.6,0.55))/np.maximum(soft_weights,1e-9)
    known = soft_weights>0.06
    if not known.any():
        raise RuntimeError('No valid material samples mapped onto the field')
    _,nearest = distance_transform_edt(~known,return_indices=True)
    field = measured[tuple(nearest)]
    # Unknown regions diffuse preferentially along flow (the row/s axis). No object
    # silhouette or mask is shipped to the runtime; all holes become a continuous field.
    for _ in range(100):
        smoothed = gaussian_filter(field,(2.4,0.85),mode='nearest')
        field = np.where(known,measured,smoothed)
    field = np.clip(gaussian_filter(field,(0.55,0.45)),0,1)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.qa.mkdir(parents=True,exist_ok=True)
    Image.fromarray(np.rint(field*255).astype(np.uint8),'L').save(args.output,optimize=True)

    reprojected = map_coordinates(field,[np.clip(v,0,args.height-1),np.clip(u,0,args.width-1)],order=1,mode='nearest')
    error = np.abs(reprojected[valid]-scalar[valid])
    spec = importlib.util.spec_from_file_location('fit05_palette_calibration',ROOT/'scripts/fit05-palette.py')
    calibration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(calibration)
    calibrated = {colour:[{'scalar':level,**calibration.invert(rgb)} for level,rgb in zip(palette_knots[colour],values)]
                  for colour,values in palettes.items()}
    meta = {
        'schemaVersion':1,'asset':str(args.output.relative_to(ROOT)),
        'kind':'single-channel optical/sheen material parameter; not colour or emissive imagery',
        'dimensions':[args.width,args.height],'pngMode':'L','channel':'r','colourSpace':'NoColorSpace',
        'sRange':list(S_RANGE),'lateralRange':list(LAT_RANGE),'rationalScale':WARP_SCALE,
        'mapping':{'u':'(lateral+6.6)/13.2','v':'(1-1/(1+(s-128.5)/3))/(1-1/(1+(190-128.5)/3))',
                   'orientation':'PNG row0 is sMin, column0 is lateralMin. Set THREE.Texture.flipY=false.'},
        'scalarMeaning':{'cyan':{'0':'shadow','0.45':'body','0.8':'median sheen','1':'strong measured sheen'},
                         'magenta':{'0':'shadow','0.5':'body','1':'measured sheen'}},
        'referencePalettesDisplayRGB':{k:v.tolist() for k,v in palettes.items()},
        'calibratedPaletteKnots':calibrated,
        'intendedUse':'Advected optical field and/or finite-difference normal influence on actual 3D water; never a screen-space overlay.',
        'counts':{'referenceWaterInterior':int(water.sum()),'excludedObjectOrWhitePixels':int((water&excluded).sum()),
                  'mappedSamples':int(valid.sum()),'knownFieldTexels':int(known.sum()),'inpaintedFieldTexels':int((~known).sum())},
        'reprojectionScalarError':{'mean':float(error.mean()),'median':float(np.median(error)),'p95':float(np.quantile(error,.95))},
        'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),
        'featureSha256':hashlib.sha256(features_path.read_bytes()).hexdigest(),
        'coordinatesSha256':hashlib.sha256(coord_path.read_bytes()).hexdigest(),
        'assetSha256':hashlib.sha256(args.output.read_bytes()).hexdigest(),
        'limitations':['Single approved camera provides no observations behind actors or outside the image; these are smoothly inferred.',
                      'Bright white glints are excluded and remain separate live geometric reflections.',
                      'Far mesh uses a different coordinate frame and is intentionally excluded.']}
    (args.qa/'metadata.json').write_text(json.dumps(meta,indent=2)+'\n')
    # Diagnostic scalar plots only; these are not game captures.
    os.environ.setdefault('MPLCONFIGDIR','/tmp/fit05-matplotlib')
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig,axes = plt.subplots(1,3,figsize=(12,8),layout='constrained')
    axes[0].imshow(field,origin='lower',aspect='auto',cmap='viridis',vmin=0,vmax=1)
    axes[0].set_title('World optical field (rational s rows)')
    axes[0].set_xlabel('lateral texel');axes[0].set_ylabel('s texel; low s at bottom')
    axes[1].imshow(known,origin='lower',aspect='auto',cmap='gray')
    axes[1].set_title('Observed support; black is inpainted')
    masked = np.ma.array(reprojected,mask=~(water&geometric))
    axes[2].imshow(masked,cmap='viridis',vmin=0,vmax=1)
    axes[2].set_title('Reprojected scalar QA (no RGB)')
    axes[2].axis('off')
    fig.savefig(args.qa/'field-diagnostic.png',dpi=140)
    plt.close(fig)
    print(json.dumps({'asset':meta['asset'],'bytes':args.output.stat().st_size,'mappedSamples':int(valid.sum()),
                      'knownFraction':float(known.mean()),'reprojectionMeanError':float(error.mean())}))


if __name__=='__main__':
    main()
