/**
 * `?match06=1` — Screen 06 approved-picture test (2026-11-17, qa/match/06/NOTES.md), the Screen 08 method.
 * REAL 3D proxy geometry of "Crest the Rinse Arch", built around the game's own 06 river (which under the switch follows
 * the painted river: course.ts + assets/textures/match06/path06.json) and seen from the locked approved-view camera
 * (tools/match06/fit_river06.py → cam06_locked.json; layout tools/match06/make_tiles06.py → proj06.json):
 *   * the perforated tunnel = a tube of radius R around the river (centre hA above the water) from behind the camera
 *     into 07, continued straight along the river's heading so the painted far rings stay concentric
 *   * the river floor = the water surface: the game river's width + 1 u of foam bank each side (<= Lfloor)
 *   * a dark end cap far down the tunnel
 * Every surface is textured by camera projection of the user's ORIGINAL approved pixels (HUD, title, Benny and coins
 * provisionally filled locally: plate06_hybrid.png) from the locked camera, so the locked view shows the approved scenery
 * and a moving camera sees it on geometry (parallax). Surfaces the picture never showed (or showed edge-on / far smaller)
 * get RING-STRUCTURED tiles unwrapped from the artwork in the surface's own coordinates (tube: wall angle x s, the
 * painted gold rings + slotted metal; floor: lateral x s, the painted water) — stretch x magnification guard + projector
 * depth test. The shader undoes the game's post chain (PROJ05_INVERSE) and takes no fog.
 * Without the switch nothing in this file runs and the game is unchanged.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';
import type { Course } from './course';
import route06deep from '../../assets/textures/match06/route06deep.json';

interface Layout06 {
  camera: { matrixWorld: number[]; fov: number; size: [number, number]; pos: number[] };
  R: number;
  hA: number;
  ext: number;
  s0: number;
  s1: number;
  Lfloor: number;
  tiles: {
    tube: { wallAngle: [number, number]; period: number; anglePeriod: number };
    floor: { lateralPeriod: number; period: number };
    floor2?: { lateralPeriod: number; period: number };
    r6?: { Wc: number; Wb: number; hb: number; river: { period: number }; foamPeriod: number };
  };
}

export interface Match06 {
  group: THREE.Group;
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  sync(renderer: THREE.WebGLRenderer, w: number, h: number): void;
  /** r7 `&m06bub=1`: 0 at the approved viewpoint .. 1 once the camera has left it (the painting only covers that view) */
  away(cam: THREE.Vector3): number;
  /** r7 `&m06foam=1`: show the 3D foam clouds once the camera has left the approved view (a = away()) */
  setAway(a: number): void;
  /** r23 `&m06rip=1`: Benny's place on the river (course s, lateral) for the painted ripple rings carried with him */
  setBenny(s: number, lat: number): void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
attribute vec2 aTile;
attribute vec2 aLS;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vTile;
varying vec2 vLS;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vTile = aTile;
  vLS = aLS;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform sampler2D uTile;
uniform vec3 uProjPos;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform vec3 uDbg;
uniform sampler2D uMask;
uniform float uFloor;
uniform float uUseMask;
// r6 (qa/match/06/NOTES.md): uGeo = narrow fitted river (lateral |l| <= Wc water, Wc..Wb foam bank); uR6 = river material
// built from the approved painted water, world-anchored and flowing downstream (uR6p = Wc, Wb, river period, foam period)
uniform float uGeo;
uniform float uR6;
uniform vec4 uR6p;
uniform float uTime;
uniform sampler2D uRiver;
uniform sampler2D uFoam;
// r7 m06ring: modeled gold rings (uRing = 1) around the straight tunnel axis (origin, direction, right, up)
uniform float uRing;
uniform vec3 uAxO;
uniform vec3 uAxD;
uniform vec3 uAxR;
uniform vec3 uAxU;
uniform float uRingH;
uniform float uBendAng; // r11 m06bend: ring bulb angle per vertex (vTile.x) instead of around the straight axis
uniform float uPanel;
// r29 lead (qa/match/06/r29/): uTSwap = the painted wall tile mapped the way tools/match06/make_tiles06.py built it (tile x = depth along
// the tube, tile y = angle round it; it was applied transposed -> the painted gold rings ran LENGTHWISE as spokes) and only its purple
// panel columns (x 0.18..0.88, mirrored) so the walls carry purple metal and the 3D bands carry the gold; uHaze = (near, far, strength, on):
// walls + rings fade into the painted deep-tunnel purple uHazeCol with camera distance (the painting shows ~6 rings, then dark purple);
// uDbgFlat (QA) = flat purple walls
uniform float uTSwap;
uniform vec4 uHaze;
uniform vec3 uHazeCol;
uniform float uDbgFlat;
uniform vec2 uProjW;
// r15 m06gold: the user's painted ring band (tools/match06/make_ring06.py) along each modeled ring's profile
uniform float uGold;
uniform sampler2D uRingTex;
// r18 m06st (qa/match/06/r18/PROGRESS.md): the start view keeps the approved look a little longer and cleanly. uSt = on;
// uStW = camera distance from the approved viewpoint (u) over which the approved pixels hand over to the 3D materials;
// uStM = 1 on the tunnel / rings / end cap (the crest-top layer: see below);
// uStK = march step down the projector's depth map (uv, 4 px of the approved picture); uStB = crest warp band (px);
// uStO = depth ratio below which a surface counts as a nearer occluder (the river in front of the tunnel)
uniform float uSt;
uniform vec2 uStW;
uniform float uStM;
uniform float uStK;
uniform vec2 uStB;
uniform float uStO;
uniform float uStDbg;
uniform vec3 uProjF;
uniform mat4 uProjVP;
// r23 '&m06rip=1' (qa/match/06/r23/PROGRESS.md): the approved picture's ripple rings round Benny, carried with him on the
// river floor. uRip = the painted water round the approved Benny in the river's own coordinates (lateral x course s, premult.
// alpha = 0 where his body was filled), uRipR = its extent (l0, l1, ds0, ds1), uBen = Benny (lateral, s), uRipA = (outward
// drift share, drift rate /s, strength, -)
uniform sampler2D uRip;
uniform float uRipOn;
uniform vec4 uRipR;
uniform vec2 uBen;
uniform vec4 uRipA;
// r24 lead '&m06ripz=1' (qa/match/06/r24/lead_rip/NOTES.md; needs m06rip): the painted ripple zone round the approved Benny stays
// pinned to the checkpoint in the projected plate — once Benny swims on, its rings, splash collar and streaks are left behind and
// stretch into a raised-looking blue cone under him. uRipZ = on; uRip0 = the approved Benny (lateral, s). The zone hands over to
// the river's own painted water exactly as the carried decal fades in, so only the shallow rings travelling with Benny remain.
uniform float uRipZ;
uniform float uWDbg;
float gWDbg = 0.0;
float gHDbg = 0.0;
uniform vec2 uRip0;
// r25 '&m06hole=1' (qa/match/06/r25/PROGRESS.md; tools/match06/make_hole06.py): the cut-out where the painted Benny was removed
// from the plate (and the painted ring zone round his contact) shows the approved picture's own painted water continued from
// the water around it (floor-space fill, world-pinned like the rest of the painted water) instead of the river's brighter
// flowing material with a hard Benny-shaped edge. uHole = fill (rgb), uHoleW = cut-out weight, over uHoleR = (l0, l1, s0, s1);
// uHoleZ = ring zone ellipse (centre s, half lateral, half along s); off exactly at the approved view.
uniform sampler2D uHole;
uniform sampler2D uHoleW;
uniform float uHoleOn;
uniform vec4 uHoleR;
uniform vec4 uHoleZ;
// r26 m06hole=2: the ring zone and the carried rings (m06rip) hand over together within the first steps (dAp edges)
uniform vec2 uHoleT;
// r26 m06fade=a,b: the painted floor (pinned at the checkpoint) dissolves as a whole into the river's own flowing water between
// camera distances a..b from the approved viewpoint (no bounded patches / direction breaks below Benny once he swims on)
uniform vec2 uFade;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vTile;
varying vec2 vLS;
${PROJ05_INVERSE}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
void main() {
  // ring-structured tile in the surface's own coordinates (mirrored repeat: no seams)
  vec3 pc = texture2D(uTile, vTile).rgb;
  if (uTSwap > 0.5 && uFloor < 0.5 && uRing < 0.5) {
    vec2 tc = vTile; float mr = abs(fract(tc.x * 0.5) * 2.0 - 1.0); tc.x = 0.18 + 0.70 * mr;
    pc = texture2D(uTile, tc).rgb;
  }
  if (uDbgFlat > 0.5 && uFloor < 0.5 && uRing < 0.5) pc = vec3(0.45, 0.22, 0.55);
  vec3 nn = normalize(vN);
  float al = abs(vLS.x);
  // r18 m06st: off exactly at the approved viewpoint (the approved start view keeps its pixels), on as soon as the camera
  // has left it; hold = 1 while the approved pixels are kept, 0 once the 3D materials have taken over
  float dAp = distance(cameraPosition, uProjPos);
  float stOn = uSt > 0.5 ? step(0.01, dAp) : 0.0;
  float hold = 1.0 - smoothstep(uStW.x, uStW.y, dAp);
  if (uR6 > 0.5 && uFloor > 0.5) {
    float sF = vLS.y - uTime * 1.2;
    float ax = clamp(vLS.x / (2.0 * uR6p.x) + 0.5, 0.0, 1.0);
    vec3 r1 = texture2D(uRiver, vec2(ax, sF / uR6p.z)).rgb;
    vec3 r2 = texture2D(uRiver, vec2(ax, sF / (uR6p.z * 1.37) + 0.43)).rgb;
    float bw = 0.5 + 0.5 * sin(vLS.y * 0.37 + vLS.x * 0.6) * sin(vLS.y * 0.13 + 1.7);
    vec3 riv = mix(r1, r2, smoothstep(0.25, 0.75, bw));
    float fr = pow(1.0 - abs(dot(nn, normalize(cameraPosition - vW))), 4.0);
    riv += fr * 0.22 * vec3(0.9, 0.85, 1.0);
    vec3 fo = texture2D(uFoam, vec2((al - uR6p.x) / (uR6p.y - uR6p.x), vLS.y / uR6p.w)).rgb;
    pc = mix(riv, fo, smoothstep(uR6p.x - 0.3, uR6p.x + 0.15, al));
  }
  if (uRing > 0.5) {
    // polished gold band: reflects the warm glow down the tunnel and the purple walls; a row of warm bulbs in the groove
    vec3 V = normalize(cameraPosition - vW);
    vec3 n2 = dot(nn, V) < 0.0 ? -nn : nn;
    vec3 Rf = reflect(-V, n2);
    float fw = dot(Rf, uAxD);
    vec3 env = mix(vec3(0.46, 0.20, 0.55), vec3(1.0, 0.80, 0.50), smoothstep(-0.35, 0.9, fw));
    env = mix(env, vec3(1.0, 0.96, 0.86), pow(max(fw, 0.0), 10.0));
    float fres = pow(1.0 - max(dot(n2, V), 0.0), 3.0);
    vec3 g = vec3(1.0, 0.60, 0.20) * (0.24 + 0.95 * env) + fres * vec3(1.0, 0.82, 0.55) * 0.45;
    g += vec3(1.0, 0.9, 0.7) * 0.5 * pow(max(dot(Rf, normalize(uAxD + uAxU * 0.35)), 0.0), 40.0);
    // r7b: the painted bands' bright yellow-white lines on the lips and band edges
    float lipL = smoothstep(0.07, 0.0, abs(abs(vLS.x) - 0.22)) + smoothstep(0.09, 0.0, abs(abs(vLS.x) - (uRingH - 0.12)));
    g = mix(g, vec3(1.0, 0.90, 0.60), clamp(lipL, 0.0, 1.0) * 0.55);
    vec3 q = vW - uAxO;
    float ang = uBendAng > 0.5 ? vTile.x : atan(dot(q, uAxU), dot(q, uAxR));
    // r7b: fewer, bigger warm bulbs with a soft halo (the painted rings' amber light dots)
    float cell = fract(ang / 6.2831853 * 56.0) - 0.5;
    float bd = length(vec2(cell * 2.6, vLS.x / 0.16));
    g += vec3(1.0, 0.62, 0.28) * 0.35 * smoothstep(0.3, 0.0, abs(vLS.x)) + vec3(1.0, 0.7, 0.35) * 0.5 * smoothstep(1.1, 0.0, bd);
    pc = mix(g, vec3(1.0, 0.96, 0.84), smoothstep(0.5, 0.15, bd));
    if (uGold > 0.5) {
      // r15 m06gold: vTile = (angle around the ring, position across the painted band: 0 = outer face edge .. 1 = far lip);
      // a light view-dependent sheen keeps the polish alive while moving (painted highlights stay world-anchored).
      // r16 v2: faded in by the camera's distance from the approved viewpoint, exactly as the game's away factor
      // (0 up to 0.6 u: the approved start view keeps its previous pixels exactly; full gold from 2 u on)
      float gw = smoothstep(0.6, 2.0, distance(cameraPosition, uProjPos));
      // r18 m06st: the rings hand over from the approved pixels straight to the painted band (never the procedural shading)
      if (stOn > 0.5) gw = 1.0;
      float gfr = pow(1.0 - abs(dot(nn, V)), 3.0);
      vec3 gc = texture2D(uRingTex, vTile).rgb;
      gc = mix(gc, vec3(1.0, 0.93, 0.80), gfr * 0.18);
      pc = mix(pc, gc, gw);
    }
  }
  if (uPanel > 0.5 && uFloor < 0.5 && uRing < 0.5) {
    // r7b m06ring: crisp perforated lilac washer metal between the rings (the painted panels: rows of short dark rounded
    // slots running around the tunnel, pink-white sheen toward the glow), instead of the magnified blurry far-ring crop
    vec3 q = vW - uAxO;
    float al = dot(q, uAxD);
    vec3 qr = q - uAxD * al;
    float arc = atan(dot(qr, uAxU), dot(qr, uAxR)) * length(qr);
    vec3 V = normalize(cameraPosition - vW);
    vec3 n2 = dot(nn, V) < 0.0 ? -nn : nn;
    float fw = dot(reflect(-V, n2), uAxD);
    // colours measured from the approved picture's walls (display values): shadow / median / lit magenta-purple,
    // lilac-blue toward the glow, near-black magenta slots (3-8 % of the wall)
    float lit = smoothstep(-0.7, 0.8, fw);
    vec3 base = mix(vec3(0.42, 0.19, 0.50), vec3(0.67, 0.34, 0.74), lit);
    base = mix(base, vec3(0.56, 0.38, 0.88), 0.45 * smoothstep(0.2, 0.95, fw));
    base += vec3(0.9, 0.6, 0.95) * 0.16 * pow(max(fw, 0.0), 8.0);
    float row = floor(al / 0.55);
    vec2 p = vec2((fract(arc / 0.62 + 0.5 * mod(row, 2.0)) - 0.5) * 0.62, (fract(al / 0.55) - 0.5) * 0.55);
    float d = length(max(abs(p) - vec2(0.13, 0.03), 0.0)) - 0.03;
    float aa = max(fwidth(d), 1e-4);
    float slot = (1.0 - smoothstep(-aa, aa, d)) * (1.0 - smoothstep(20.0, 60.0, distance(cameraPosition, vW)));
    float lip = (1.0 - smoothstep(-aa, aa, abs(d - 0.03) - 0.012)) * step(0.0, -p.y);
    vec3 pan = mix(base, vec3(0.24, 0.02, 0.22), slot) + vec3(0.85, 0.55, 0.95) * 0.18 * lip * (1.0 - slot);
    pc = mix(pc, pan, 0.85);
  }
  if (uHaze.w > 0.5 && uFloor < 0.5) pc = mix(pc, uHazeCol, uHaze.z * smoothstep(uHaze.x, uHaze.y, distance(cameraPosition, vW)));
  vec3 t = pc;
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  // stretch + magnification guard: the projection is used where the current view sees the surface no more face-on and
  // no more magnified than the approved view did (incidence-cosine ratio x distance ratio = 1 in the approved view)
  float mag = (cc / max(cp, 1e-3)) * (distance(uProjPos, vW) / max(distance(cameraPosition, vW), 1e-3));
  // r6 m06flow: on the river the flowing painted-water material takes over sooner from the stretched projection
  float keep = uR6 > 0.5 && uFloor > 0.5 ? 1.0 - smoothstep(1.4, 3.0, mag) : 1.0 - smoothstep(2.5, 6.0, mag);
  // r18 m06st: this close to the approved viewpoint the only surfaces this guard catches are slivers the approved view
  // saw edge-on (a bright 1-2 px line of the river material along the river's far edge): keep the approved pixels
  if (stOn > 0.5) keep = max(keep, hold);
  if (vProj.w > 0.0) {
    vec3 ndc = vProj.xyz / vProj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    // r18 m06st: just outside the projector's frame (a few px at the screen edge once the camera has moved) the frame's
    // edge pixels continue instead of a hard cut to the tile
    float edge = 1.0;
    bool inside = uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0;
    if (stOn > 0.5 && !inside) {
      vec2 o = max(max(-uv, uv - 1.0), 0.0);
      edge = (1.0 - smoothstep(0.0, 0.03, max(o.x, o.y))) * hold;
      uv = clamp(uv, 0.0005, 0.9995);
    }
    if (inside || (stOn > 0.5 && edge > 0.0)) {
      float vis = 1.0;
      vec2 uvF = uv; // r18 m06st: where the plate is read (the crest-top layer below)
      float filled = 0.0, dbgB = 0.0, dbgZ = 0.0, rSh = 0.0;
      if (uUseDepth > 0.5) {
        float zs = linZ(texture2D(uDepth, uv).r), zf = linZ(ndc.z * 0.5 + 0.5);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
        // r18 m06st: the crest-top layer. In the approved view the painted crest top (its water, the foam heaps on its bank)
        // lands partly on the far tunnel wall just above the river's real edge, and the tunnel right behind the crest is
        // hidden. Once the camera rises over the crest, the tunnel / ring fragments near the crest read the approved picture
        // as if they lay at the crest's own depth: (i) fragments the crest hid in the approved view fully, (ii) fragments
        // whose approved-view pixel lies up to uStB.x px above the river's edge fully, fading to their own depth by uStB.y
        // px (a smooth warp, no seam). The painted crest top moves down with the river instead of tearing away from it,
        // and the gap behind it shows the painted wall (no gold stripes, no smeared streaks).
        // On the river itself: parts the crest hid are read the same way (i); its grazing edges (depth within 20 %) keep the
        // approved pixels instead of a bright line of the river material.
        if (stOn > 0.5 && hold > 0.0) {
          float zc = -1.0, bw = 1.0;
          if (zs < uStO * zf) {
            dbgZ = 1.0;
            // (i) hidden behind a nearer surface: up the projector image to that surface's edge (its silhouette depth)
            zc = zs;
            for (int k = 1; k <= 48; k++) {
              vec2 u2 = uv + vec2(0.0, float(k) * uStK);
              if (u2.y > 0.999) break;
              float z2 = linZ(textureLod(uDepth, u2, 0.0).r);
              if (z2 >= uStO * zf) {
                for (int j = 1; j <= 4; j++) {
                  float z3 = linZ(textureLod(uDepth, u2 - vec2(0.0, float(j) * uStK * 0.25), 0.0).r);
                  if (z3 < uStO * zf) { zc = z3; break; }
                }
                break;
              }
              zc = z2;
            }
          } else if (uStM < 0.5) vis = 1.0;
          else {
            // (ii) down the projector image to the edge of a nearer surface (the river) just below
            for (int k = 1; k <= 48; k++) {
              vec2 u2 = uv - vec2(0.0, float(k) * uStK);
              if (u2.y < 0.001) break;
              float z2 = linZ(textureLod(uDepth, u2, 0.0).r);
              if (z2 < uStO * zf) {
                // back up in 1 px steps to its exact edge (seen edge-on its depth changes fast per pixel)
                zc = z2;
                for (int j = 1; j <= 4; j++) {
                  float z3 = linZ(textureLod(uDepth, u2 + vec2(0.0, float(j) * uStK * 0.25), 0.0).r);
                  if (z3 >= uStO * zf) break;
                  zc = z3;
                }
                bw = 1.0 - smoothstep(uStB.x, uStB.y, float(k) * uStK * 1536.0);
                break;
              }
            }
          }
          if (zc > 0.0 && bw > 0.0) {
            vec3 rd = normalize(vW - cameraPosition);
            float den = dot(rd, uProjF);
            if (den > 1e-3) {
              float ze = mix(zf, zc, bw);
              vec4 q = uProjVP * vec4(cameraPosition + rd * ((ze - dot(cameraPosition - uProjPos, uProjF)) / den), 1.0);
              if (q.w > 0.0) { uvF = clamp(q.xy / q.w * 0.5 + 0.5, 0.0005, 0.9995); filled = 1.0; dbgB = bw; }
            }
          }
        }
      }
      float w = (stOn > 0.5 ? (filled > 0.5 ? hold : vis) * edge : vis) * keep;
      // r3 masks (tools/match06/make_masks06.py): where the river floor carries painted pixels that are not water (G: the
      // tunnel wall seen through the crest loop / beside the river) or Benny's blurry provisional fill (R), the floor
      // shows the painted-water tile as soon as the camera leaves the approved view (the approved view is unchanged)
      if (uFloor > 0.5 && uUseMask > 0.5) {
        vec4 mk = texture2D(uMask, uv);
        float away = smoothstep(0.2, 1.2, distance(cameraPosition, uProjPos));
        float inWater = uGeo > 0.5 ? 1.0 - smoothstep(uR6p.x - 0.2, uR6p.x + 0.1, al) : 1.0;
        if (stOn > 0.5) {
          // r18 m06st: the pale ghost of the painted Benny (his provisional fill) gives way at once to the river's own
          // painted-water material (soft edge: the fill mask averaged over a 12 px ring, so both waters meet softly); the
          // painted wall seen through the crest loop stays until the hand-over
          float rS = mk.r;
          if (dAp > 0.01) {
            rS = 0.0;
            for (int i = 0; i < 12; i++) {
              float an = float(i) * 0.5235988;
              rS += textureLod(uMask, uv + vec2(cos(an), sin(an)) * vec2(12.0 / 864.0, 12.0 / 1536.0), 0.0).r;
            }
            rS = (rS / 12.0) * 0.5 + mk.r * 0.5;
          }
          // r25 m06hole: the cut-out keeps the plate weight; its pixels come from the painted-water fill below instead
          rSh = rS * inWater;
          w *= (1.0 - rS * smoothstep(0.01, 0.06, dAp) * inWater * (1.0 - uHoleOn)) * (1.0 - mk.g * (1.0 - hold) * inWater);
        } else w *= 1.0 - max(mk.r, mk.g) * away * inWater;
      }
      // r6 m06geo: painted WATER that lands on the tunnel wall (the crest-top water / far stream beside the narrow river)
      // shows the ring-structured wall tile once the camera leaves the approved view (the real river geometry carries
      // the water there)
      if (uFloor < 0.5 && uGeo > 0.5 && uUseMask > 0.5 && filled < 0.5) {
        float awayT = stOn > 0.5 ? 1.0 - hold : smoothstep(0.2, 1.2, distance(cameraPosition, uProjPos));
        w *= 1.0 - (1.0 - texture2D(uMask, uvF).g) * awayT;
      }
      // m06ring: the modeled rings show the approved pixels only AT the approved view, their own 3D gold once away
      if (uRing > 0.5) w *= stOn > 0.5 ? (filled > 0.5 ? 1.0 : hold) : 1.0 - smoothstep(0.2, 1.2, distance(cameraPosition, uProjPos));
      vec3 pl = texture2D(uPlate, uv).rgb;
      if (filled > 0.5) pl = textureLod(uPlate, uvF, 0.0).rgb;
      if (uHoleOn > 0.5 && uFloor > 0.5 && filled < 0.5) {
        vec2 hu = vec2((vLS.x - uHoleR.x) / (uHoleR.y - uHoleR.x), (vLS.y - uHoleR.z) / (uHoleR.w - uHoleR.z));
        if (hu.x > 0.0 && hu.x < 1.0 && hu.y > 0.0 && hu.y < 1.0) {
          vec4 hv = vec4(texture2D(uHole, hu).rgb, texture2D(uHoleW, hu).r);
          float eH = length(vec2(vLS.x / uHoleZ.y, (vLS.y - uHoleZ.x) / uHoleZ.z));
          // the cut-out at once (as the provisional fill went before), the ring zone as the carried rings fade in
          float hW = max(clamp(max(hv.a, rSh), 0.0, 1.0) * smoothstep(0.01, 0.06, dAp), (1.0 - smoothstep(0.9, 1.1, eH)) * smoothstep(uHoleT.x, uHoleT.y, dAp));
          pl = mix(pl, hv.rgb, hW);
          gHDbg = hW;
        }
      }
      if (uRipZ > 0.5 && uFloor > 0.5) {
        vec2 dZ = vLS - uRip0;
        float eZ = length(vec2(dZ.x / uRipR.y, dZ.y < 0.0 ? dZ.y / uRipR.z : dZ.y / uRipR.w));
        float inWZ = 1.0 - smoothstep(uR6p.x - 0.2, uR6p.x + 0.1, al);
        w *= 1.0 - (1.0 - smoothstep(0.85, 1.2, eZ)) * inWZ * smoothstep(0.15, 0.9, dAp);
      }
      if (uFloor > 0.5) w *= 1.0 - smoothstep(uFade.x, uFade.y, dAp);
      // r29 lead &m06projw=a,b: on the TUNNEL (walls, rings, paddles; not the river) the approved picture's projected pixels fade out as the
      // camera leaves the approved viewpoint (camera distance a..b); before, far walls kept them while moving (re-projected painted rings
      // = the dense 'target' down the tunnel). QA &m06tdbg=noproj = off at once.
      if (uFloor < 0.5) w *= 1.0 - smoothstep(uProjW.x, uProjW.y, dAp);
      t = mix(pc, pl, w);
      gWDbg = w;
      if (uStDbg > 0.5) t = vec3(dbgZ * filled, (1.0 - dbgZ) * dbgB * filled, uFloor * 0.5 + 0.5 * (1.0 - vis));
    }
  }
  if (uRipOn > 0.5 && uFloor > 0.5) {
    // r23 m06rip: two copies drifting slowly outward from Benny, cross-faded (no jump), so the rings read as spreading
    vec2 dR = vec2(vLS.x - uBen.x, vLS.y - uBen.y);
    float ph = fract(uTime * uRipA.y);
    vec4 acc = vec4(0.0);
    for (int k = 0; k < 2; k++) {
      float a = fract(ph + 0.5 * float(k));
      vec2 q = dR / (1.0 + uRipA.x * a);
      vec2 ru = vec2((q.x - uRipR.x) / (uRipR.y - uRipR.x), (q.y - uRipR.z) / (uRipR.w - uRipR.z));
      if (ru.x > 0.0 && ru.x < 1.0 && ru.y > 0.0 && ru.y < 1.0) acc += texture2D(uRip, ru) * (1.0 - abs(1.0 - 2.0 * a));
    }
    float inW = 1.0 - smoothstep(uR6p.x - 0.2, uR6p.x + 0.1, abs(vLS.x));
    float wr = acc.a * inW * uRipA.z * smoothstep(uHoleT.x, uHoleT.y, dAp);
    if (acc.a > 1e-3) t = mix(t, acc.rgb / acc.a, clamp(wr, 0.0, 1.0));
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
  if (uWDbg > 0.5 && uFloor > 0.5) gl_FragColor.rgb = vec3(gWDbg * (1.0 - gHDbg), gWDbg * gHDbg, 1.0 - gWDbg); // r25: green = m06hole fill
  if (uDbg.x + uDbg.y + uDbg.z > 0.0) gl_FragColor.rgb = mix(gl_FragColor.rgb, uDbg, 0.45);
}`;

// r16 `&m06fclu=1`: one foam lobe / small bubble of the painted 06 foam heaps (camera-facing sprite; aB = centre + radius,
// aS >= 1 = a foam lobe with bubble pores, < 1 = a small shiny bubble). Shrinks away inside uNear (u) of the camera.
const FOAMC_VERT = /* glsl */ `
attribute vec4 aB;
attribute float aS;
#ifdef GROUP
attribute vec3 aC;
#endif
uniform vec2 uNear;
varying vec2 vUv;
varying float vS;
varying float vF;
varying float vPx;
void main() {
  vUv = uv * 2.0 - 1.0;
  vS = aS;
#ifdef GROUP
  // r27 m06fcg: the whole heap shrinks as one unit into its foot on the water, timed by the heap's own distance
  // (no trail of tiny full-spacing beads from per-lobe shrinking)
  vF = smoothstep(uNear.x, uNear.y, -(viewMatrix * vec4(aC, 1.0)).z);
  vec4 mv = viewMatrix * vec4(aC + (aB.xyz - aC) * vF, 1.0);
#else
  vec4 mv = viewMatrix * vec4(aB.xyz, 1.0);
  vF = smoothstep(uNear.x, uNear.y, -mv.z);
#endif
  mv.xy += position.xy * aB.w * 2.0 * vF;
  vPx = aB.w * vF * projectionMatrix[1][1] / max(-mv.z, 0.1); // on-screen radius (fraction of the half-height)
  gl_Position = projectionMatrix * mv;
}`;
// colours = the approved picture's foam heaps (display values, lower corners + crest): white tops (253,252,253), pale
// lilac (238,230,252), lilac-blue (191,192,250), cool shadow (159,172,247); pores = darker lilac-blue dots with a glint
const FOAMC_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
varying vec2 vUv;
varying float vS;
varying float vF;
varying float vPx;
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  float r = length(vUv);
  if (r > 1.0 || vF < 0.02) discard;
#ifdef RIM
  if (r < 0.80) discard;
#else
  if (r > 0.86) discard;
#endif
  bool lobe = vS >= 1.0;
  float s = fract(vS);
  vec3 nrm = vec3(vUv, sqrt(max(0.0, 1.0 - r * r)));
  float lt = dot(nrm, normalize(vec3(-0.35, 0.78, 0.52)));
  vec3 cSh = vec3(0.62, 0.67, 0.97), cMid = vec3(0.75, 0.75, 0.98), cLi = vec3(0.93, 0.90, 0.99), cW = vec3(0.99, 0.99, 0.995);
  vec3 col = mix(cSh, cMid, smoothstep(-0.25, 0.30, lt));
  col = mix(col, cLi, smoothstep(0.30, 0.66, lt));
  col = mix(col, cW, smoothstep(0.62, 0.92, lt));
  if (lobe) {
    // bubble pores on the shaded lower part of a foam lobe (the painted froth texture)
    // pores keep the painted bubble size: more, finer pores on lobes that are big on screen (near the camera)
    float cells = clamp(vPx * 60.0, 4.5, 16.0);
    vec2 q = vUv * cells + s * 17.0;
    vec2 id = floor(q), f = fract(q) - 0.5;
    vec2 jt = vec2(h21(id), h21(id + 7.3)) - 0.5;
    float pr = 0.10 + 0.12 * h21(id + 3.1);
    float pd = length(f - jt * 0.5);
    float pore = (1.0 - smoothstep(pr * 0.7, pr, pd)) * step(0.35, h21(id + 11.0)) * smoothstep(0.55, 0.15, lt) * smoothstep(0.95, 0.6, r);
    col = mix(col, cSh * 0.80, pore * 0.85);
    col = mix(col, cW, (1.0 - smoothstep(0.0, pr * 0.35, length(f - jt * 0.5 - vec2(-0.3, 0.3) * pr))) * pore * 0.8);
  } else {
    // a small shiny soap bubble: crisp window highlight + tiny second glint
    float hl = smoothstep(0.22, 0.08, length((vUv - vec2(-0.36, 0.40)) * vec2(1.0, 1.3)));
    float hl2 = smoothstep(0.10, 0.03, length(vUv - vec2(0.36, -0.42)));
    col = mix(col, vec3(1.0), clamp(hl + 0.6 * hl2, 0.0, 1.0));
  }
  // light rim on the shadow side (the foam film seen edge-on), faintly pink <-> cyan
  float ang = atan(vUv.y, vUv.x) + s * 6.2832;
  vec3 iri = mix(vec3(0.98, 0.84, 0.99), vec3(0.82, 0.95, 1.0), 0.5 + 0.5 * sin(ang * 2.0 + r * 5.0));
  float fr = smoothstep(0.66, 0.97, r) * (0.35 + 0.65 * (1.0 - clamp(lt, 0.0, 1.0)));
  col = mix(col, iri, fr * (lobe ? 0.45 : 0.7));
  float a = 1.0;
#ifdef RIM
  a = 1.0 - 0.6 * smoothstep(0.86, 1.0, r);
#endif
  gl_FragColor = vec4(pjInverse(clamp(col, 0.0, 1.0)), a);
}`;

const tex = (f: string) => new URL(`../../assets/textures/match06/${f}`, import.meta.url).href;

export async function buildMatch06(course: Course): Promise<Match06> {
  const L: Layout06 = await fetch(tex('proj06.json')).then((r) => r.json());
  // r29 `&m06deep=1` (lead; src/world/course.ts m06deepShift, assets/textures/match06/route06deep.json): the course river follows the
  // painted coin trail rebuilt in 3D down the painted ring tunnel into the moved 07 entrance. The floor, frames and foam run to the NEW
  // 07 entrance; the tunnel stays exactly where the approved picture has it (axis origin, wall-tile phase and far end pinned).
  const DEEP = typeof location !== 'undefined' && new URLSearchParams(location.search).get('m06deep') === '1';
  if (DEEP) L.s1 = course.stage('07').s0 + ((L as unknown as { sAhead07?: number }).sAhead07 ?? 34);
  // r29 lead: `&m06tswap=1` wall tile mapped as built (fixes the transposed painted rings), `&m06haze=near,far[,strength]` far-tunnel
  // fade into the painted deep purple, `&m06tdbg=norings|flatwall` QA views (qa/match/06/r29/rings/)
  const QS0 = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
  const TSWAP = QS0?.get('m06tswap') === '1', TCROP = TSWAP || QS0?.get('m06tswap') === '2', TDBG = QS0?.get('m06tdbg') ?? ''; // '2' = keep the mapping, drop the painted gold stripes
  const hz = (QS0?.get('m06haze') ?? '').split(',').map(Number);
  const pw = (QS0?.get('m06projw') ?? '').split(',').map(Number);
  const PROJW = TDBG === 'noproj' ? new THREE.Vector2(0.01, 0.02) : pw.length === 2 && pw.every(Number.isFinite) && pw[1] > pw[0] ? new THREE.Vector2(pw[0], pw[1]) : new THREE.Vector2(1e4, 2e4);
  const HAZE = hz.length >= 2 && hz.every(Number.isFinite) ? new THREE.Vector4(hz[0], hz[1], hz[2] ?? 1, 1) : new THREE.Vector4(0, 1, 0, 0);
  const loader = new THREE.TextureLoader();
  const plate = await loader.loadAsync(tex('plate06_hybrid.png'));
  plate.colorSpace = THREE.NoColorSpace; // raw display values: the shader inverts the post chain itself
  plate.minFilter = THREE.LinearMipmapLinearFilter;
  plate.anisotropy = 8;

  // the projector = the locked game camera the picture was matched to (far enough for the deep painted tunnel)
  const [W, H] = L.camera.size;
  const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.3, L.ext + 160);
  proj.matrixWorld.fromArray(L.camera.matrixWorld);
  proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
  proj.matrixWorldInverse.copy(proj.matrixWorld).invert();
  proj.updateProjectionMatrix();
  const projVP = new THREE.Matrix4().multiplyMatrices(proj.projectionMatrix, proj.matrixWorldInverse);

  const depthRT = new THREE.WebGLRenderTarget(1024, Math.round((1024 * H) / W), { depthBuffer: true });
  depthRT.depthTexture = new THREE.DepthTexture(depthRT.width, depthRT.height, THREE.UnsignedIntType);
  const shared = {
    uPlate: { value: plate },
    uDepth: { value: depthRT.depthTexture as THREE.Texture },
    uUseDepth: { value: 0 },
    uNearFar: { value: new THREE.Vector2(proj.near, proj.far) },
    uProjVP: { value: projVP },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) },
    uPjRes: { value: new THREE.Vector2(W, H) },
    uProjPos: { value: proj.position.clone() },
    uTime: { value: 0 },
    uSt: { value: 0 },
    uStW: { value: new THREE.Vector2(0.75, 0.85) }, // r22: short hand-over (no double-exposed tunnel, qa/match/06/r22/PROGRESS.md)
    uStK: { value: 4 / 1536 },
    uStB: { value: new THREE.Vector2(80, 160) },
    uStO: { value: 0.94 },
    uStDbg: { value: 0 },
    uProjF: { value: new THREE.Vector3(0, 0, -1).applyQuaternion(proj.quaternion) },
  };
  const loadTile = async (name: string) => {
    const t = await loader.loadAsync(tex(`tile_${name}.png`));
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 8;
    t.minFilter = THREE.LinearMipmapLinearFilter; return t;
  };
  // r3 (2026-11-17, qa/match/06/NOTES.md): masks + rectified repeating floor tile; `&m06v=2` = the round-2 result
  const v2 = typeof location !== 'undefined' && new URLSearchParams(location.search).get('m06v') === '2';
  const TF2 = !v2 ? L.tiles.floor2 : undefined;
  const [tTube, tFloor] = await Promise.all([loadTile('tube'), loadTile(TF2 ? 'floor2' : 'floor')]);
  if (TF2) tFloor.wrapT = THREE.RepeatWrapping; // seamless along the river (mirrored only across it)
  // r6 switches (each its own factor): `&m06geo=1` narrow river + foam banks + tunnel walls down to the banks;
  // `&m06flow=1` river / foam material from the approved painted water, flowing (needs m06geo)
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
  const R6 = !v2 ? L.tiles.r6 : undefined;
  const GEO = !!R6 && qs?.get('m06geo') === '1';
  const FLOW = GEO && qs?.get('m06flow') === '1';
  const mask = v2 ? null : await loader.loadAsync(tex('mask06.png'));
  if (mask) { mask.colorSpace = THREE.NoColorSpace; mask.generateMipmaps = false; mask.minFilter = THREE.LinearFilter; }
  let tRiver: THREE.Texture | null = null, tFoam: THREE.Texture | null = null;
  if (FLOW) {
    [tRiver, tFoam] = await Promise.all([loader.loadAsync(tex('tile_river6.png')), loader.loadAsync(tex('tile_foam6.png'))]);
    for (const t of [tRiver, tFoam]) {
      t.colorSpace = THREE.NoColorSpace; t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter;
    }
  }
  const r6p = new THREE.Vector4(R6?.Wc ?? 0, R6?.Wb ?? 1, (R6?.river.period ?? 1), R6?.foamPeriod ?? 1);
  // r18 `&m06st=1` (qa/match/06/r18/PROGRESS.md): the start view without the flash — between the approved viewpoint and
  // `&m06stw=a,b` u from it (default 0.75,0.85 since r22; r18 had 0.6,1.2 = double-exposed tunnel at +1.5 u) the approved pixels stay (no see-through ring arcs, no tile ghosts), the painted
  // crest top moves with the river (no torn crest, no striped ring strip behind it), Benny's provisional fill gives way to the
  // river's painted water at once, then the rings hand over straight to the painted band. AT the approved viewpoint nothing
  // changes.
  const ST = qs?.get('m06st') === '1';
  const stw = (qs?.get('m06stw') ?? '').split(',').map(Number);
  shared.uSt.value = ST && !!mask ? 1 : 0;
  if (stw.length === 2 && stw.every(Number.isFinite)) shared.uStW.value.set(stw[0], stw[1]);
  const stb = (qs?.get('m06stb') ?? '').split(',').map(Number);
  if (stb.length === 2 && stb.every(Number.isFinite)) shared.uStB.value.set(stb[0], stb[1]);
  if (Number.isFinite(Number(qs?.get('m06sto'))) && qs?.get('m06sto')) shared.uStO.value = Number(qs?.get('m06sto'));
  shared.uStDbg.value = qs?.get('m06stdbg') === '1' ? 1 : 0; // QA only: red = crest layer, green = its weight, blue = floor
  const mat = (tile: THREE.Texture, floor = false) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    uniforms: { ...shared, uTile: { value: tile }, uDbg: { value: new THREE.Vector3() }, uMask: { value: mask },
      uFloor: { value: floor ? 1 : 0 }, uUseMask: { value: mask ? 1 : 0 }, uStM: { value: floor ? 0 : 1 },
      uGeo: { value: GEO ? 1 : 0 }, uR6: { value: FLOW ? 1 : 0 }, uR6p: { value: r6p },
      uRiver: { value: tRiver ?? tile }, uFoam: { value: tFoam ?? tile },
      uTSwap: { value: TCROP ? 1 : 0 }, uHaze: { value: HAZE.clone() }, uHazeCol: { value: new THREE.Vector3(0.52, 0.22, 0.44) }, uDbgFlat: { value: TDBG === 'flatwall' ? 1 : 0 }, uProjW: { value: PROJW.clone() },
      uRing: { value: 0 }, uGold: { value: 0 }, uRingTex: { value: tile }, uRingH: { value: 1 }, uBendAng: { value: 0 }, uPanel: { value: 0 }, uAxO: { value: new THREE.Vector3() }, uAxD: { value: new THREE.Vector3(0, 0, -1) },
      uAxR: { value: new THREE.Vector3(1, 0, 0) }, uAxU: { value: new THREE.Vector3(0, 1, 0) },
      uRip: { value: tile }, uRipOn: { value: 0 }, uRipR: { value: new THREE.Vector4(-1, 1, -1, 1) }, uBen: { value: new THREE.Vector2() }, uRipZ: { value: 0 }, uHoleT: { value: new THREE.Vector2(0.15, 0.9) }, uFade: { value: new THREE.Vector2(1e4, 2e4) }, uWDbg: { value: qs?.get('m06wdbg') === '1' ? 1 : 0 }, uRip0: { value: new THREE.Vector2() },
      uRipA: { value: new THREE.Vector4(0.06, 0.5, 1, 0) },
      uHole: { value: tile }, uHoleW: { value: tile }, uHoleOn: { value: 0 }, uHoleR: { value: new THREE.Vector4(0, 1, 0, 1) }, uHoleZ: { value: new THREE.Vector4(0, 1, 1, 0) } },
  });

  // river frames from the course (beyond s1: straight along the heading at s1, as tools/match06/geo06.py)
  const f1 = course.sample(L.s1);
  const T1 = f1.tan.clone().normalize(), P1 = f1.pos.clone(), U1 = f1.up.clone(), R1 = f1.right.clone();
  const frame = (s: number) => {
    if (s <= L.s1) { const f = course.sample(s); return { pos: f.pos.clone(), up: f.up.clone(), right: f.right.clone() }; }
    return { pos: P1.clone().addScaledVector(T1, s - L.s1), up: U1.clone(), right: R1.clone() };
  };
  const sList: number[] = [];
  for (let s = L.s0; s < L.s1; s += 0.5) sList.push(s);
  for (let s = L.s1; s <= L.s1 + L.ext + 1e-6; s += 2) sList.push(s);

  // grid helper: rows along s, columns across (closed ring for the tube)
  const grid = (cols: number, vert: (s: number, j: number, fr: ReturnType<typeof frame>) => [THREE.Vector3, number, number?], sK: number) => {
    const pos: number[] = [], tile: number[] = [], idx: number[] = [], ls: number[] = [];
    for (const s of sList) {
      const fr = frame(s);
      for (let j = 0; j <= cols; j++) { const [p, a, l] = vert(s, j, fr); pos.push(p.x, p.y, p.z); tile.push(a, s / sK); ls.push(l ?? 0, s); }
    }
    const n = cols + 1;
    for (let i = 0; i < sList.length - 1; i++) for (let j = 0; j < cols; j++) {
      const a = i * n + j, b = a + 1, c = a + n, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aTile', new THREE.Float32BufferAttribute(tile, 2));
    g.setAttribute('aLS', new THREE.Float32BufferAttribute(ls, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  const group = new THREE.Group();
  group.name = 'match06_projection';
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm06_' + name; o.frustumCulled = false; group.add(o); return o; };
  const TT = L.tiles.tube, TF = TF2 ?? L.tiles.floor;
  const RAD = 128;
  // tunnel tube around the river: angle 0 = right, pi/2 = up; tile angle coordinate starts at the right bank
  // r6 `m06geo`: the tube's lower walls are drawn in so they rise straight from the foam banks (|l| = Wb at the water
  // line) instead of meeting the water 3.3 u further out under a 2x too wide water slab; above yTop the tube is unchanged
  const Lw = Math.sqrt(L.R * L.R - L.hA * L.hA), yTop = L.hA + L.R * Math.sin((20 * Math.PI) / 180);
  // r7 `&m06tun=1` (qa/match/06/r7/NOTES.md): the painted tunnel is a STRAIGHT cylinder of concentric rings with the river
  // winding inside it; the proxy tube below follows the river's crest (+36° / -33°) and 40° turn, so while moving the
  // rings turned into twisted diagonal bands. Here: a straight cylinder (radius `&m06tunr=`, default 14) whose axis is
  // parallel to the projector's ray through the painted vanishing point (`&m06tunax=chord`: along the 06 stage chord
  // instead), placed through the river's centroid so the whole 06 river stays inside. Same projection, same tile.
  const TUN = qs?.get('m06tun') === '1';
  let tunCap: { pos: THREE.Vector3; dir: THREE.Vector3; r: number } | null = null;
  if (TUN) {
    const Rt = Number(qs?.get("m06tunr")) || 14;
    const vp = (TT as { vp?: [number, number] }).vp ?? [W / 2, H / 2];
    let ax = new THREE.Vector3((vp[0] / W) * 2 - 1, 1 - (vp[1] / H) * 2, 0.5).unproject(proj).sub(proj.position).normalize();
    const sA = L.s0 + 12, sE = DEEP ? course.stage('07').s0 : L.s0 + 12 + 44; // approved checkpoint .. end of the 06 stage (r29 m06deep: the new 07 entrance)
    if (qs?.get('m06tunax') === 'chord') ax = course.sample(sE).pos.sub(course.sample(sA).pos).normalize();
    const C = proj.position.clone();
    // axis through the centroid of the 06 river (perpendicular to ax), lifted `&m06tunh=` (default 3) above it
    const cen = new THREE.Vector3(); let n = 0;
    for (let s = L.s0; s <= sE; s += 1) { const q = course.sample(s).pos.sub(C); cen.add(q.addScaledVector(ax, -q.dot(ax))); n++; }
    cen.multiplyScalar(1 / n);
    const Ux = new THREE.Vector3(0, 1, 0).addScaledVector(ax, -ax.y).normalize(), Rx = new THREE.Vector3().crossVectors(ax, Ux).normalize();
    const hq = Number(qs?.get('m06tunh'));
    const O = DEEP ? new THREE.Vector3().fromArray(route06deep.O) : C.clone().add(cen).addScaledVector(Ux, Number.isFinite(hq) && qs?.get('m06tunh') ? hq : 3);
    const a0 = course.sample(L.s0).pos.sub(O).dot(ax) - 6, a1 = (DEEP ? route06deep.tunnel_pin.P1a : P1.clone().sub(O).dot(ax)) + L.ext;
    const kS = DEEP ? route06deep.tunnel_pin.kS : L.s1 - P1.clone().sub(O).dot(ax); // tile phase: same ring positions as the old tube's straight part
    // r11 `&m06bend=1` (lead, qa/match/06/r11/NOTES.md): the painted tunnel BENDS down-right with the river (BLUEPRINT_06:
    // the inner ring centres drift toward the glow; Depth Anything 3: the glow is the far end of a deep tube that turns away).
    // The straight cylinder ignored the river's right turn after the crest, so while swimming it showed a long centred
    // bullseye of 15+ rings. Here the axis stays straight up to the crest top, then turns horizontally (about world Y, the
    // pitch of ax kept, the frame rotated with it = no twist) by the river's own heading change at the same axial distance
    // (smoothed over 8 u); after the river ends it keeps the last heading. Radius, ring profile / spacing, tile, projection
    // and the approved view are unchanged (the projector repaints any geometry with the approved pixels there).
    const BEND = qs?.get('m06bend') === '1';
    const DA = 0.5, nA = Math.ceil((a1 + 400 - a0) / DA) + 1;
    const fP: THREE.Vector3[] = [], fT: THREE.Vector3[] = [], fR: THREE.Vector3[] = [], fU: THREE.Vector3[] = [];
    if (BEND) {
      const ah = new THREE.Vector3(ax.x, 0, ax.z).normalize();
      const yawOf = (v: THREE.Vector3) => { const hv = new THREE.Vector3(v.x, 0, v.z).normalize(); return Math.atan2(new THREE.Vector3().crossVectors(ah, hv).y, ah.dot(hv)); };
      let sTop = L.s0, yTopC = -Infinity;
      for (let s = L.s0; s <= sE; s += 0.5) { const y = course.sample(s).pos.y; if (y > yTopC) { yTopC = y; sTop = s; } }
      const smp: [number, number][] = [];
      for (let s = sTop; s <= sE + 20; s += 0.5) { const q = course.sample(s); smp.push([q.pos.clone().sub(O).dot(ax), yawOf(q.tan)]); }
      const aTop = smp[0][0], yaw0 = smp[0][1];
      const raw = new Float32Array(nA);
      let k = 0;
      for (let i = 0; i < nA; i++) {
        const a = a0 + i * DA;
        if (a <= aTop) continue;
        while (k < smp.length - 2 && smp[k + 1][0] < a) k++;
        const [aa, ya] = smp[k], [ab, yb] = smp[Math.min(k + 1, smp.length - 1)];
        const t = ab > aa ? THREE.MathUtils.clamp((a - aa) / (ab - aa), 0, 1) : 1;
        raw[i] = ya + (yb - ya) * t - yaw0;
      }
      // `&m06bendw=` half-width of the smoothing box (u, default 4), `&m06bendk=` share of the river's turn (default 1)
      const bw = Number(qs?.get('m06bendw')) || 4, bk = qs?.get('m06bendk') ? Number(qs?.get('m06bendk')) : 1;
      const W8 = Math.round(bw / DA), yaw = new Float32Array(nA);
      for (let i = 0; i < nA; i++) { let sum = 0, c = 0; for (let j = Math.max(0, i - W8); j <= Math.min(nA - 1, i + W8); j++) { sum += raw[j]; c++; } yaw[i] = bk * sum / c; }
      const Yw = new THREE.Vector3(0, 1, 0);
      let p = O.clone().addScaledVector(ax, a0);
      for (let i = 0; i < nA; i++) {
        const qy = new THREE.Quaternion().setFromAxisAngle(Yw, yaw[i]);
        const t = ax.clone().applyQuaternion(qy);
        fP.push(p.clone()); fT.push(t); fR.push(Rx.clone().applyQuaternion(qy)); fU.push(Ux.clone().applyQuaternion(qy));
        p = p.clone().addScaledVector(t, DA);
      }
      console.info('[match06] m06bend', { sTop, aTop: +aTop.toFixed(1), yawEndDeg: +THREE.MathUtils.radToDeg(yaw[nA - 1]).toFixed(1) });
    }
    // r28 `&m06route=1` (qa/match/06/r25/PROGRESS.md r28, user-authorized route test): the painted tunnel FOLLOWS the river
    // into 07. The game river crosses the ring interior near the axis up to ~s 219, then runs down-right to the 07 start
    // 12 u off the axis (lower right) - with the straight cylinder it swam into the tunnel's lower-right wall ("up the right
    // wall"). Here the far tunnel axis is SHIFTED sideways (Rx / Ux, never turned: every ring keeps its facing along ax, so the
    // rings stay round and face the route - not the rejected m06bend) between the axial distances `&m06rsh=a,b` (default
    // 12,46: the first ring past the camera and the approved view are untouched) by the amount that puts the 07 start at
    // `&m06rtg=x,y` from the axis (default 3,-6.5: lower middle); beyond b the shifted tunnel runs straight on (same
    // vanishing direction as the painting).
    const ROUTE = qs?.get('m06route') === '1';
    const rnum = (k: string, d: number[]) => { const v = (qs?.get(k) ?? '').split(',').map(Number); return v.length === d.length && v.every(Number.isFinite) ? v : d; };
    const [shA, shB] = rnum('m06rsh', [12, 46]), shT = rnum('m06rtg', [3, -6.5]);
    let shE = new THREE.Vector2();
    if (ROUTE) {
      const q = course.sample(course.stage('07').s0).pos.sub(O), aq = q.dot(ax); q.addScaledVector(ax, -aq);
      shE = new THREE.Vector2(q.dot(Rx) - shT[0], q.dot(Ux) - shT[1]);
      console.info('[match06] m06route shear', { a: [shA, shB], target: shT, shift: [+shE.x.toFixed(2), +shE.y.toFixed(2)], a07: +aq.toFixed(1) });
    }
    const shearAt = (a: number) => { const t = THREE.MathUtils.clamp((a - shA) / (shB - shA), 0, 1), k = t * t * (3 - 2 * t); return [shE.x * k, shE.y * k]; };
    const axisAt = (a: number) => {
      if (ROUTE) { const [e, f] = shearAt(a); return { p: O.clone().addScaledVector(ax, a).addScaledVector(Rx, e).addScaledVector(Ux, f), t: ax, r: Rx, u: Ux }; }
      if (!BEND) return { p: O.clone().addScaledVector(ax, a), t: ax, r: Rx, u: Ux };
      const i = THREE.MathUtils.clamp(Math.round((a - a0) / DA), 0, nA - 1);
      return { p: fP[i].clone().addScaledVector(fT[i], a - (a0 + i * DA)), t: fT[i], r: fR[i], u: fU[i] };
    };
    const pos: number[] = [], tl: number[] = [], ls: number[] = [], idx: number[] = [];
    const rows: number[] = [];
    for (let a = a0; a < a0 + 90; a += 0.5) rows.push(a);
    for (let a = a0 + 90; a <= a1; a += 2) rows.push(a);
    // r7 `&m06ring=1`: the far tunnel narrows so the rings converge into a SMALL glow (the full-radius end cap was a big
    // flat pale disc of the painted vanishing-point glow once the camera moved)
    const RING = qs?.get('m06ring') === '1';
    const radAt = (a: number) => (RING ? Rt * (1 - 0.82 * THREE.MathUtils.smoothstep(a, a1 - 200, a1)) : Rt);
    for (const a of rows) for (let j = 0, f = axisAt(a); j <= RAD; j++) {
      const th = (j / RAD) * Math.PI * 2, Ra = radAt(a);
      const p = f.p.clone().addScaledVector(f.r, Ra * Math.cos(th)).addScaledVector(f.u, Ra * Math.sin(th));
      pos.push(p.x, p.y, p.z);
      let aa = th; if (aa > TT.wallAngle[1]) aa -= Math.PI * 2;
      if (TSWAP) tl.push((a + kS) / TT.period, (aa - TT.wallAngle[0]) / TT.anglePeriod); else tl.push((aa - TT.wallAngle[0]) / TT.anglePeriod, (a + kS) / TT.period); ls.push(0, a + kS);
    }
    const nC = RAD + 1;
    for (let i = 0; i < rows.length - 1; i++) for (let j = 0; j < RAD; j++) { const a = i * nC + j, b = a + 1, c = a + nC, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aTile', new THREE.Float32BufferAttribute(tl, 2));
    g.setAttribute('aLS', new THREE.Float32BufferAttribute(ls, 2));
    g.setIndex(idx); g.computeVertexNormals();
    const tubeMat = mat(tTube);
    add(g, tubeMat, 'tube');
    { const fe = axisAt(a1); tunCap = { pos: fe.p.clone(), dir: fe.t.clone(), r: radAt(a1) }; }
    if (RING) {
      // r7b: procedural perforated panels between the rings, OPT-IN `&m06panel=1` (looked flat/plastic vs the painted tile: not kept)
      if (qs?.get('m06panel') === '1') Object.assign(tubeMat.uniforms, { uPanel: { value: 1 }, uAxO: { value: O.clone() },
        uAxD: { value: ax.clone() }, uAxR: { value: Rx.clone() }, uAxU: { value: Ux.clone() } });
      // r7 `&m06ring=1` (qa/match/06/r7/NOTES.md): REAL modeled gold rings instead of the flat painted ring stripes of the
      // magnified wall tile. Profile = the painted ring: a thick polished band with two raised lips and a groove carrying
      // a row of warm bulbs. Spacing from the approved picture: the two nearest painted ring groups (≈ 485 and 355 px
      // above the vanishing point) are solved to axial positions through the locked camera; rings repeat at that
      // spacing along the tunnel. Shading: polished gold reflecting the tunnel's warm glow ahead + purple walls (shader
      // uRing). At the approved view the rings show the approved pixels (projection), fading to 3D gold as the camera
      // leaves it, so the approved view is unchanged.
      const Wr = Number(qs?.get("m06ringw")) || 2.2, Dr = Number(qs?.get('m06ringd')) || 0.55;
      const yPx = (a: number) => {
        const p = O.clone().addScaledVector(ax, a).addScaledVector(Ux, radAt(a)).project(proj);
        return ((1 - p.y) / 2) * H;
      };
      const solve = (rPx: number) => { // painted ring top at vp.y - rPx -> axial position (a nearer ring's top is HIGHER: smaller y)
        let lo = Math.max(a0, C.clone().sub(O).dot(ax) + 1), hi = a1 - 10;
        for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (yPx(m) > vp[1] - rPx) hi = m; else lo = m; }
        return (lo + hi) / 2;
      };
      const aN = solve(485), aF = solve(355), dA = Math.max(2.5, aF - aN);
      // r15 `&m06gold=1` (qa/match/06/r15/PROGRESS.md): the rings carry the user's PAINTED ring band (straightened from the
      // approved picture's nearest ring) instead of the procedural shading whose camera-facing faces read as dull
      // rust-brown hoops. Rows of the band run along the ring profile: the outer painted tier on the camera-facing face,
      // the wide bright tier with the highlight dashes on the inner cylinder, the yellow lip line at its far end
      // (`&m06goldf=` share of the band on the face, default 0.37); 4 mirrored repeats around the ring (no seam).
      const GOLD = qs?.get('m06gold') === '1';
      let tRing: THREE.Texture | null = null;
      if (GOLD) {
        tRing = await loader.loadAsync(tex('tile_ring6.png'));
        tRing.colorSpace = THREE.NoColorSpace; tRing.wrapS = THREE.MirroredRepeatWrapping; tRing.wrapT = THREE.ClampToEdgeWrapping;
        tRing.anisotropy = 8; tRing.minFilter = THREE.LinearMipmapLinearFilter;
      }
      const VF = Number(qs?.get('m06goldf')) || 0.37;
      const prof: THREE.Vector2[] = [];
      const pr = (r: number, y: number) => prof.push(new THREE.Vector2(r, y));
      const h = Wr / 2;
      pr(0.25, -h); pr(-Dr, -h); pr(-Dr - 0.08, -h + 0.12); pr(-Dr - 0.08, -0.22); pr(-Dr + 0.12, -0.16);
      pr(-Dr + 0.12, 0.16); pr(-Dr - 0.08, 0.22); pr(-Dr - 0.08, h - 0.12); pr(-Dr, h); pr(0.25, h);
      // m06gold: position across the painted band for each profile point (face 0 -> 2: 0..VF, inner cylinder 2 -> 8: VF..1)
      const vProf: number[] = [0];
      { const seg = (i: number) => prof[i].distanceTo(prof[i - 1]);
        const face = seg(1) + seg(2); let cyl = 0; for (let i = 3; i <= 8; i++) cyl += seg(i);
        let acc = 0; for (let i = 1; i <= 2; i++) { acc += seg(i); vProf.push((VF * acc) / face); }
        acc = 0; for (let i = 3; i <= 8; i++) { acc += seg(i); vProf.push(VF + ((1 - VF) * acc) / cyl); }
        vProf.push(1); }
      const parts: THREE.BufferGeometry[] = [];
      const qRot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ax);
      // the lathe's local x/z must line up with Rx/Ux for the bulb angle; build each ring directly in world space
      // r7b: only the nearer rings are modeled (up to `&m06ringn=`, default 10 spacings past the nearest painted ring); the
      // far ones bunched into a busy moiré — beyond them the painted rings + the tapering tunnel carry the depth
      const nMax = Number(qs?.get('m06ringn')) || 99; // r7b: limiting to 10 left an empty hole at the centre (not kept)
      for (let k = Math.ceil((a0 + 2 - aN) / dA); k <= nMax && aN + k * dA < a1 - 20 && parts.length < 70; k++) {
        const a = aN + k * dA, Ra = radAt(a), sc = Ra / Rt;
        const lp = prof.map((v) => new THREE.Vector2(Ra + v.x * sc, v.y * sc));
        const lg = new THREE.LatheGeometry(lp, 128);
        const fr = axisAt(a);
        lg.applyQuaternion(BEND ? new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), fr.t) : qRot);
        lg.translate(fr.p.x, fr.p.y, fr.p.z);
        const n = lg.attributes.position.count, lsA = new Float32Array(n * 2), tA = new Float32Array(n * 2);
        for (let i = 0; i < n; i++) lsA[i * 2] = lp[i % lp.length].y / sc; // local axial offset inside the band
        // r11 m06bend: the bulb angle = the lathe's own angle (continuous, the seam column is duplicated) for bent rings
        if (BEND) for (let i = 0; i < n; i++) tA[i * 2] = (Math.floor(i / lp.length) / 128) * Math.PI * 2 - Math.PI;
        else if (GOLD) for (let i = 0; i < n; i++) { tA[i * 2] = (Math.floor(i / lp.length) / 128) * 4; tA[i * 2 + 1] = vProf[i % lp.length]; }
        lg.setAttribute('aLS', new THREE.Float32BufferAttribute(lsA, 2));
        lg.setAttribute('aTile', new THREE.Float32BufferAttribute(tA, 2));
        lg.deleteAttribute('uv');
        parts.push(lg);
      }
      const rg = mergeGeometries(parts);
      rg.computeVertexNormals();
      const rm = mat(tTube);
      Object.assign(rm.uniforms, { uRing: { value: 1 }, uGold: { value: GOLD ? 1 : 0 }, uRingTex: { value: tRing ?? tTube }, uRingH: { value: h }, uBendAng: { value: BEND ? 1 : 0 }, uUseMask: { value: 0 }, uAxO: { value: O.clone() }, uAxD: { value: ax.clone() },
        uAxR: { value: Rx.clone() }, uAxU: { value: Ux.clone() } });
      add(rg, rm, 'rings').visible = TDBG !== 'norings';
      console.info('[match06] m06ring', { rings: parts.length, spacing: +dA.toFixed(2), aN: +aN.toFixed(1), aF: +aF.toFixed(1) });
      if (qs?.get('m06pad') === '1') {
        // r7c `&m06pad=1`: the two painted gold paddle blades (drum lifters) on the upper-left wall, as real beveled gold
        // half-moon blades where the locked camera's rays through the painted paddles (≈ 287,242 and 155,397 px) meet
        // the tunnel wall, repeated at the ring spacing so they stay while Benny swims; shading = the rings' gold
        // (no bulbs); approved view = the approved pixels (same fade as the rings)
        const hitWall = (px: number, py: number) => {
          const d = new THREE.Vector3((px / W) * 2 - 1, 1 - (py / H) * 2, 0.5).unproject(proj).sub(proj.position).normalize();
          const q0 = C.clone().sub(O), qp = q0.clone().addScaledVector(ax, -q0.dot(ax)), dp = d.clone().addScaledVector(ax, -d.dot(ax));
          const A = dp.dot(dp), Bq = 2 * qp.dot(dp), Cq = qp.dot(qp) - Rt * Rt;
          const t = (-Bq + Math.sqrt(Math.max(0, Bq * Bq - 4 * A * Cq))) / (2 * A);
          const p = C.clone().addScaledVector(d, t).sub(O), a = p.dot(ax), rr = p.addScaledVector(ax, -a);
          return { a, th: Math.atan2(rr.dot(Ux), rr.dot(Rx)) };
        };
        const Rp = Number(qs?.get('m06padr')) || 1.6;
        const sh = new THREE.Shape(); sh.moveTo(-Rp, 0); sh.lineTo(Rp, 0); sh.absarc(0, 0, Rp, 0, Math.PI, false);
        const blade = new THREE.ExtrudeGeometry(sh, { depth: 0.24, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 28 });
        blade.translate(0, 0, -0.12); blade.deleteAttribute('uv');
        const pads: THREE.BufferGeometry[] = [];
        for (const pd of [hitWall(287, 242), hitWall(155, 397)]) {
          for (let k = -1; k <= 12; k++) {
            const a = pd.a + k * dA; if (a < a0 + 2 || a > a1 - 220) continue;
            const Ra = radAt(a), rh = Rx.clone().multiplyScalar(Math.cos(pd.th)).addScaledVector(Ux, Math.sin(pd.th));
            const X = ax.clone(), Y = rh.clone().negate(), Z = new THREE.Vector3().crossVectors(X, Y);
            const m4 = new THREE.Matrix4().makeBasis(X, Y, Z).setPosition(O.clone().addScaledVector(ax, a).addScaledVector(rh, Ra + 0.05));
            const bg = blade.clone().applyMatrix4(m4), n = bg.attributes.position.count;
            bg.setAttribute('aLS', new THREE.Float32BufferAttribute(new Float32Array(n * 2).fill(5), 2));
            bg.setAttribute('aTile', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
            pads.push(bg);
          }
        }
        const pm = mat(tTube);
        Object.assign(pm.uniforms, { uRing: { value: 1 }, uRingH: { value: h }, uUseMask: { value: 0 }, uAxO: { value: O.clone() },
          uAxD: { value: ax.clone() }, uAxR: { value: Rx.clone() }, uAxU: { value: Ux.clone() } });
        add(mergeGeometries(pads), pm, 'paddles');
      }
    }
    // the river floor's straight 260 u extension ran into the painted vanishing point (it hid the glowing end from the
    // projector -> flat disc); in the straight tunnel the river ends 20 u after the 06 stage
    while (sList.length && sList[sList.length - 1] > sE + 20) sList.pop();
  } else add(grid(RAD, (_s, j, fr) => {
    const th = (j / RAD) * Math.PI * 2;
    let lx = L.R * Math.cos(th);
    const ly = L.hA + L.R * Math.sin(th);
    if (GEO && R6) {
      const t = Math.min(1, Math.max(0, (yTop - ly) / yTop)), k = t * t * (3 - 2 * t);
      lx -= Math.sign(lx) * k * (Lw - R6.Wb);
    }
    const p = GEO ? fr.pos.clone().addScaledVector(fr.right, lx).addScaledVector(fr.up, ly)
      : fr.pos.clone().addScaledVector(fr.up, L.hA).addScaledVector(fr.right, L.R * Math.cos(th)).addScaledVector(fr.up, L.R * Math.sin(th));
    let a = th; if (a > TT.wallAngle[1]) a -= Math.PI * 2; // continuous over the wall (the part under the water is never seen)
    return [p, (a - TT.wallAngle[0]) / TT.anglePeriod];
  }, TT.period), mat(tTube), 'tube');
  // river floor: the game river's own width + 1 u of foam bank each side (the painted gap between the river loops then
  // lands on the tunnel beyond, not on a wide water slab), never wider than the tube
  const FC = 32;
  // r6 `m06geo`: the painted river is only ~4.5 u wide at Benny (tools/match06/make_river06.py): water |l| <= Wc, then a
  // slightly raised foam bank to Wb where the tunnel wall starts (the game river and steering are unchanged)
  add(grid(FC, (s, j, fr) => {
    const half = GEO && R6 ? R6.Wb : Math.min(L.Lfloor, course.widthAt(Math.min(s, L.s1)) / 2 + 1.0);
    const l = -half + (2 * half * j) / FC;
    const p = fr.pos.clone().addScaledVector(fr.right, l);
    if (GEO && R6) { const t = Math.min(1, Math.max(0, (Math.abs(l) - R6.Wc + 0.1) / 0.5)); p.addScaledVector(fr.up, R6.hb * t * t * (3 - 2 * t)); }
    return [p, l / TF.lateralPeriod, l];
  }, TF.period), mat(tFloor, true), 'floor');
  const floorMat = (group.getObjectByName('m06_floor') as THREE.Mesh).material as THREE.ShaderMaterial;
  // r29 `&m06leg=1` (lead; with m06deep; tools/match06/r29_design_leg.py -> leg06deep.json): the FALLING RIGHT BAND of the painted rinse
  // arch (the broad rainbow band from the crest top down past Benny's right side) as a decorative water ribbon with the river's own
  // material (painted pixels at the approved view, flowing cyan / pink water + foam edges once moving), so the crest keeps its curl and
  // its window onto the purple wall while Benny climbs it. Where it meets the playable river it tucks 0.3 u UNDER it (river on top).
  if (DEEP && qs?.get('m06leg') === '1' && GEO && R6) {
    const LEG = (await fetch(tex('leg06deep.json')).then((r) => r.json())) as { points: number[][] };
    const lp = LEG.points.map((q) => new THREE.Vector3(q[0], q[1], q[2]));
    const hwL = Number(qs?.get('m06legw')) || 2.6, NL = 16;
    const lpos: number[] = [], ltl: number[] = [], lls: number[] = [], lidx: number[] = [];
    let acc = 0;
    for (let i = 0; i < lp.length; i++) {
      const tn = lp[Math.min(lp.length - 1, i + 1)].clone().sub(lp[Math.max(0, i - 1)]).normalize();
      if (i > 0) acc += lp[i].distanceTo(lp[i - 1]);
      const upv = new THREE.Vector3(0, 1, 0).addScaledVector(tn, -tn.y).normalize();
      const rt = new THREE.Vector3().crossVectors(tn, upv).normalize();
      for (let j = 0; j <= NL; j++) {
        const l = -hwL + (2 * hwL * j) / NL, p = lp[i].clone().addScaledVector(rt, l);
        let best = Infinity, bs = L.s0;
        for (let s = L.s0; s <= L.s0 + 60; s += 0.5) { const d2 = course.sample(s).pos.distanceToSquared(p); if (d2 < best) { best = d2; bs = s; } }
        const fr = course.sample(bs), dv = p.clone().sub(fr.pos), lat = dv.dot(fr.right), h = dv.dot(fr.up);
        if (Math.abs(lat) < R6.Wb + 0.4 && h > -0.3) p.addScaledVector(fr.up, -0.3 - h);
        const lr = l * (R6.Wb / hwL);
        lpos.push(p.x, p.y, p.z); ltl.push(lr / TF.lateralPeriod, (2000 + acc) / TF.period); lls.push(lr, 2000 + acc);
      }
    }
    for (let i = 0; i < lp.length - 1; i++) for (let j = 0; j < NL; j++) { const a = i * (NL + 1) + j, b = a + 1, c = a + NL + 1, d = c + 1; lidx.push(a, c, b, b, c, d); }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lpos, 3));
    lg.setAttribute('aTile', new THREE.Float32BufferAttribute(ltl, 2));
    lg.setAttribute('aLS', new THREE.Float32BufferAttribute(lls, 2));
    lg.setIndex(lidx); lg.computeVertexNormals();
    add(lg, floorMat, 'leg');
    console.info('[match06] m06leg', { points: lp.length, length: +acc.toFixed(1), halfWidth: hwL });
  }
  // r23 `&m06rip=1` (qa/match/06/r23/PROGRESS.md): the painted ripple rings round Benny (concentric white-cyan rings, the
  // splash collar at his base, the bright streaks under him) vanished as soon as he swam: the projection pins them to the
  // checkpoint and the flowing river material has none. Here the approved plate's water round the approved Benny is
  // re-sampled in the river's own coordinates (lateral l x distance ds from Benny, exactly the floor surface the projector
  // painted at the checkpoint) and carried with Benny on the floor, where his body was filled transparent; faded in only
  // once the camera has left the approved viewpoint (start view unchanged), fading out toward its rim, water only.
  // `&m06ripl=` half width (u, default 1.45: the painted foam heaps begin ~1.3-1.5 u out), `&m06ripd=a,b` behind / ahead
  // of Benny (u, default 2.4,1.3),
  // `&m06ripk=` strength (default 1), `&m06ripx=` outward drift share (default 0.06; 0 = still).
  if (qs?.get('m06rip') === '1') {
    const rn = (k: string, d: number) => { const v = Number(qs?.get(k)); return qs?.get(k) != null && qs?.get(k) !== '' && Number.isFinite(v) ? v : d; };
    const rd = (qs?.get('m06ripd') ?? '').split(',').map(Number);
    // the painted soap bubbles next to the ripples (approved-picture px: x, y, radius) stay out: carried with Benny they
    // would look glued to him (the game's own bubbles float there while swimming)
    const BUB06: [number, number, number][] = [[722, 1115, 14], [692, 1220, 25], [58, 1190, 15], [697, 1352, 40], [708, 1048, 7]];
    const LW = rn('m06ripl', 1.45), D0 = -(rd.length === 2 && rd.every(Number.isFinite) ? rd[0] : 2.4), D1 = rd.length === 2 && rd.every(Number.isFinite) ? rd[1] : 1.3;
    const sB = (L as unknown as { sB?: number }).sB ?? L.s0 + 12;
    const fillImg = (await loader.loadAsync(tex('plate06_fillmask.png'))).image as CanvasImageSource;
    const px = (img: CanvasImageSource) => {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d', { willReadFrequently: true })!; cx.drawImage(img, 0, 0, W, H);
      return cx.getImageData(0, 0, W, H).data;
    };
    const P = px(plate.image as CanvasImageSource), F = px(fillImg);
    const NX = 384, NY = Math.round((NX * (D1 - D0)) / (2 * LW));
    const data = new Uint8Array(NX * NY * 4), v = new THREE.Vector3();
    const fillAt = (x: number, y: number) => { // body fill, dilated 7 px (the fill edge is soft)
      let m = 0;
      for (let dy = -7; dy <= 7; dy += 3.5) for (let dx = -7; dx <= 7; dx += 3.5) {
        const xi = Math.min(W - 1, Math.max(0, Math.round(x + dx))), yi = Math.min(H - 1, Math.max(0, Math.round(y + dy)));
        m = Math.max(m, F[(yi * W + xi) * 4] / 255);
      }
      return m;
    };
    let ext = [Infinity, -Infinity, Infinity, -Infinity];
    for (let j = 0; j < NY; j++) {
      const ds = D0 + ((j + 0.5) / NY) * (D1 - D0), fr = frame(sB + ds);
      for (let i = 0; i < NX; i++) {
        const l = -LW + ((i + 0.5) / NX) * 2 * LW;
        v.copy(fr.pos).addScaledVector(fr.right, l).project(proj);
        const x = ((v.x + 1) / 2) * W - 0.5, y = ((1 - v.y) / 2) * H - 0.5, o = (j * NX + i) * 4;
        if (v.z > 1 || x < 0 || y < 0 || x > W - 1 || y > H - 1) continue;
        ext = [Math.min(ext[0], x), Math.max(ext[1], x), Math.min(ext[2], y), Math.max(ext[3], y)];
        const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1);
        // radial fade (elliptic in l / ds) x not where the painted Benny was filled
        const e = Math.hypot(l / LW, ds < 0 ? ds / D0 : ds / D1);
        let a = (1 - THREE.MathUtils.smoothstep(e, 0.6, 1.0)) * (1 - THREE.MathUtils.smoothstep(fillAt(x, y), 0.1, 0.6));
        for (const [bx, by, br] of BUB06) a *= THREE.MathUtils.smoothstep(Math.hypot(x - bx, y - by), br + 2, br + 9);
        // soft toward the approved picture's frame edges (the water behind Benny leaves the picture at its bottom edge:
        // without this the decal ended in a straight seam there)
        a *= THREE.MathUtils.smoothstep(Math.min(x, W - 1 - x, H - 1 - y), 0, 260);
        for (let c = 0; c < 3; c++) {
          const s00 = P[(y0 * W + x0) * 4 + c], s10 = P[(y0 * W + x1) * 4 + c], s01 = P[(y1 * W + x0) * 4 + c], s11 = P[(y1 * W + x1) * 4 + c];
          const sv = (s00 * (1 - fx) + s10 * fx) * (1 - fy) + (s01 * (1 - fx) + s11 * fx) * fy;
          data[o + c] = Math.round(sv * a); // premultiplied
        }
        data[o + 3] = Math.round(255 * a);
      }
    }
    const rt = new THREE.DataTexture(data, NX, NY, THREE.RGBAFormat);
    rt.colorSpace = THREE.NoColorSpace; rt.magFilter = THREE.LinearFilter; rt.minFilter = THREE.LinearMipmapLinearFilter;
    rt.generateMipmaps = true; rt.wrapS = rt.wrapT = THREE.ClampToEdgeWrapping; rt.anisotropy = 8; rt.needsUpdate = true;
    Object.assign(floorMat.uniforms, { uRip: { value: rt }, uRipOn: { value: 1 }, uRipR: { value: new THREE.Vector4(-LW, LW, D0, D1) },
      uRipA: { value: new THREE.Vector4(rn('m06ripx', 0.06), 0.5, rn('m06ripk', 1), 0) } });
    floorMat.uniforms.uBen.value.set(0, sB);
    if (qs?.get('m06ripz') === '1') { floorMat.uniforms.uRipZ.value = 1; floorMat.uniforms.uRip0.value.set(0, sB); }
    console.info('[match06] m06rip', { NX, NY, LW, D0, D1, px: ext.map((q) => Math.round(q)) });
    if (qs?.get('m06ripdbg') === '1') (window as unknown as { __m06rip?: unknown }).__m06rip = { data, NX, NY };
  }
  // r25 `&m06hole=1` (qa/match/06/r25/PROGRESS.md, tools/match06/make_hole06.py; needs m06geo + m06st): the user's "raised blue
  // cone" under Benny at the opening = the cut-out where the painted Benny was removed from the projected plate, shown as the
  // river's own brighter material with a hard Benny-shaped edge, plus the painted ripple ring left pinned below it. Here the
  // cut-out and the painted ring zone show the approved picture's own painted water, continued from the water around them
  // (patch fill in the floor's own coordinates, world-pinned like the rest of the painted water); the approved start view is
  // unchanged (off exactly at the approved viewpoint), the ring zone hands over as the carried rings (`m06rip`) fade in.
  // r26 `&m06hole=2` (qa/match/06/r25/PROGRESS.md r26 block): the same fill + the painted water's own fine sparkle carried into it
  // (tile_hole06b.png, make_hole06.py HOLE_DSIG=0.03), and the painted ring zone hands over to the carried rings within the first
  // steps (dAp 0.02..0.3 instead of 0.15..0.9: no half-faded ring left at the checkpoint). '1' = the r25 version, unchanged.
  const HOLE = qs?.get('m06hole') ?? '';
  if ((HOLE === '1' || HOLE === '2') && GEO && R6) {
    const [hm, ht, hw] = await Promise.all([fetch(tex('hole06.json')).then((r) => r.json()), loader.loadAsync(tex(HOLE === '2' ? 'tile_hole06b.png' : 'tile_hole06.png')),
      loader.loadAsync(tex('tile_hole06w.png'))]);
    for (const t of [ht, hw]) {
      t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
      t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
    }
    const z = hm.zone as { dc: number; hl: number; hs: number };
    Object.assign(floorMat.uniforms, { uHole: { value: ht }, uHoleW: { value: hw }, uHoleOn: { value: 1 },
      uHoleR: { value: new THREE.Vector4(hm.l0, hm.l1, hm.s0, hm.s1) }, uHoleZ: { value: new THREE.Vector4(hm.sB + z.dc, z.hl, z.hs, 0) } });
    if (HOLE === '2') floorMat.uniforms.uHoleT.value.set(0.02, 0.3);
    console.info('[match06] m06hole', { rect: [hm.l0, hm.l1, hm.s0, hm.s1], zone: z });
  }
  const fade = (qs?.get('m06fade') ?? '').split(',').map(Number);
  if (fade.length === 2 && fade[1] > fade[0] && fade[0] >= 0) floorMat.uniforms.uFade.value.set(fade[0], fade[1]);
  else if (qs?.get('m06fade') === '1') floorMat.uniforms.uFade.value.set(0.85, 2.2);
  // r25 QA only `&m06holedump=1` (tools/match06/r25_holedump.mjs): the projected plate, mask06 and the body fill mask unwrapped
  // into the river floor's own coordinates (lateral l x course s, exactly the floor surface incl. the raised banks) with the
  // projector's own visibility (floor self-occlusion z-buffer), for tools/match06/make_hole06.py. Nothing changes on screen.
  if (qs?.get('m06holedump') === '1' && GEO && R6 && mask) {
    const sB = (L as unknown as { sB?: number }).sB ?? L.s0 + 12;
    const KX = Number(qs.get('m06holek')) || 64;
    const l0 = -R6.Wb, l1 = R6.Wb, sa = sB - 5, sb = sB + 25;
    const NX = Math.round((l1 - l0) * KX), NY = Math.round((sb - sa) * KX);
    const fillImg = (await loader.loadAsync(tex('plate06_fillmask.png'))).image as CanvasImageSource;
    const pxs = (img: CanvasImageSource) => {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d', { willReadFrequently: true })!; cx.drawImage(img, 0, 0, W, H);
      return cx.getImageData(0, 0, W, H).data;
    };
    const P = pxs(plate.image as CanvasImageSource), M = pxs(mask.image as CanvasImageSource), F = pxs(fillImg);
    const X = new Float32Array(NX * NY), Y = new Float32Array(NX * NY), D = new Float32Array(NX * NY).fill(-1);
    const v = new THREE.Vector3(), p = new THREE.Vector3();
    for (let j = 0; j < NY; j++) {
      const s = sa + ((j + 0.5) / NY) * (sb - sa), fr = frame(s);
      for (let i = 0; i < NX; i++) {
        const l = l0 + ((i + 0.5) / NX) * (l1 - l0);
        const t = Math.min(1, Math.max(0, (Math.abs(l) - R6.Wc + 0.1) / 0.5));
        p.copy(fr.pos).addScaledVector(fr.right, l).addScaledVector(fr.up, R6.hb * t * t * (3 - 2 * t));
        v.copy(p).project(proj);
        const o = j * NX + i;
        X[o] = ((v.x + 1) / 2) * W - 0.5; Y[o] = ((1 - v.y) / 2) * H - 0.5;
        if (v.z < 1 && v.z > -1 && X[o] >= 0 && Y[o] >= 0 && X[o] <= W - 1 && Y[o] <= H - 1) D[o] = p.distanceTo(proj.position);
      }
    }
    // floor self-occlusion in the projector image: each texel splatted over its own pixel footprint
    const zb = new Float32Array(W * H).fill(Infinity);
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NX - 1; i++) {
      const o = j * NX + i; if (D[o] < 0) continue;
      const r = Math.min(12, Math.ceil(Math.max(Math.abs(X[o + 1] - X[o]), Math.abs(Y[o + 1] - Y[o]), Math.abs(X[o + NX] - X[o]), Math.abs(Y[o + NX] - Y[o])) / 2) + 1);
      const xc = Math.round(X[o]), yc = Math.round(Y[o]);
      for (let yy = Math.max(0, yc - r); yy <= Math.min(H - 1, yc + r); yy++) for (let xx = Math.max(0, xc - r); xx <= Math.min(W - 1, xc + r); xx++) {
        const q = yy * W + xx; if (D[o] < zb[q]) zb[q] = D[o];
      }
    }
    const out = new Uint8Array(NX * NY * 8);
    for (let o = 0; o < NX * NY; o++) {
      if (D[o] < 0) continue;
      const x = X[o], y = Y[o], x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, x1 = Math.min(W - 1, x0 + 1), y1 = Math.min(H - 1, y0 + 1);
      const bil = (A: Uint8ClampedArray, c: number) => (A[(y0 * W + x0) * 4 + c] * (1 - fx) + A[(y0 * W + x1) * 4 + c] * fx) * (1 - fy) + (A[(y1 * W + x0) * 4 + c] * (1 - fx) + A[(y1 * W + x1) * 4 + c] * fx) * fy;
      const zq = zb[Math.round(y) * W + Math.round(x)];
      const vis = D[o] <= zq * 1.02 + 0.05 ? 255 : 0;
      out[o * 8] = bil(P, 0); out[o * 8 + 1] = bil(P, 1); out[o * 8 + 2] = bil(P, 2); out[o * 8 + 3] = vis;
      out[o * 8 + 4] = bil(M, 0); out[o * 8 + 5] = bil(M, 1); out[o * 8 + 6] = bil(F, 0); out[o * 8 + 7] = 255;
    }
    const xy = new Uint16Array(NX * NY * 2);
    for (let o = 0; o < NX * NY; o++) { xy[o * 2] = Math.max(0, Math.round(X[o] * 8 + 8)); xy[o * 2 + 1] = Math.max(0, Math.round(Y[o] * 8 + 8)); }
    const b64 = (u: Uint8Array) => { let s = ''; for (let k = 0; k < u.length; k += 0x8000) s += String.fromCharCode(...u.subarray(k, k + 0x8000)); return btoa(s); };
    (window as unknown as { __m06hole?: unknown }).__m06hole = { NX, NY, l0, l1, sa, sb, sB, Wc: R6.Wc, Wb: R6.Wb, data: b64(out), xy: b64(new Uint8Array(xy.buffer)) };
    console.info('[match06] m06holedump', { NX, NY, l0, l1, sa, sb });
  }
  // r7 `&m06foam=1` (needs m06geo): puffy 3D foam clouds along both banks — the painted white-lilac foam clusters that
  // vanished as flat strips once Benny moved. Hidden at the approved view (the painting carries them there), shown once
  // the camera has left it (setAway). Not part of the projector depth bake (invisible while baking).
  let foamClouds: THREE.InstancedMesh | null = null;
  const foamSprites: THREE.Mesh[] = [];
  if (GEO && R6 && qs?.get('m06foam') === '1') {
    let seed = 12345; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const items: { p: THREE.Vector3; r: number; up: THREE.Vector3 }[] = [];
    // r22 `&m06fcl=1` (qa/match/06/r22/PROGRESS.md): the painted foam is separate LOW puffy heaps (lower corners, along the
    // banks) with gaps between them, not an unbroken strip that stacks into tall white walls seen from Benny's low camera.
    // Same random stream (identical draws), but blobs only where a heap is (period `&m06fclp=` u, heaps alternate sides,
    // kept fraction `&m06fclk=`), hugging the water edge (lateral band `&m06fclw=` u instead of 1.3) and sitting lower.
    const FCL = qs?.get('m06fcl') === '1';
    const fnum = (k: string, d: number) => { const v = Number(qs?.get(k)); return qs?.get(k) != null && qs?.get(k) !== '' && Number.isFinite(v) ? v : d; };
    const fclP = fnum('m06fclp', 3.5), fclK = fnum('m06fclk', 0.65), fclW = fnum('m06fclw', 0.7);
    const heap = (s: number, side: number) => {
      const ph = ((s - L.s0) / fclP + (side > 0 ? 0.5 : 0)) % 1; // 0..1 within one heap period, the sides half a period apart
      return 1 - Math.abs(ph * 2 - 1); // 1 at a heap centre, 0 in the gap
    };
    for (let s = L.s0 + 3; s < (DEEP ? course.stage('07').s0 + 12 : L.s0 + 12 + 44 + 12); s += 0.6) for (const side of [-1, 1]) {
      const n = 4 + Math.floor(rnd() * 4); // r7c: more, smaller blobs = bubbly clusters (big ones read as plastic balls up close)
      for (let i = 0; i < n; i++) {
        const fr = frame(s + rnd() * 0.6), r = 0.1 + rnd() * 0.22;
        const rl = rnd(), rh = rnd();
        if (FCL) {
          const h = heap(s, side);
          if (h < 1 - fclK) continue; // the gap between two heaps
          const w = (h - (1 - fclK)) / fclK; // 0 at a heap's edge, 1 at its centre: the heap tapers off lower and narrower
          const l = side * (R6.Wc + 0.15 + rl * fclW * (0.4 + 0.6 * w));
          items.push({ p: fr.pos.clone().addScaledVector(fr.right, l).addScaledVector(fr.up, R6.hb + r * 0.15 + rh * 0.05), r: r * (0.6 + 0.4 * w), up: fr.up });
          continue;
        }
        const l = side * (R6.Wc + 0.25 + rl * 1.3);
        items.push({ p: fr.pos.clone().addScaledVector(fr.right, l).addScaledVector(fr.up, R6.hb + r * 0.35 + rh * 0.12), r, up: fr.up });
      }
    }
    // r16 `&m06fclu=1` (qa/match/06/r16/PROGRESS.md): the painted 06 foam is soft lilac-white cumulus heaps made of many
    // round foam lobes and small bubbles (white tops, cool lilac-blue undersides, tiny bubble pores along the lower edges),
    // not smooth pink-white plastic balls. Same layout as m06foam; every blob becomes a low heap of lobes + small bubbles
    // (camera-facing sprites, two passes: opaque cores + see-through rims; the Screen 04 `m04fclu` method with 06's own
    // painted colours), world-anchored, shrinking away right in front of the camera. `&m06fcs=` heap size, `&m06fck=`
    // bubble count scale, `&m06fcn=` distance (u) below which they shrink away. A separate random stream: every other
    // layout is unchanged.
    if (qs?.get('m06fclu') === '1') {
      const num = (k: string, d: number) => { const v = Number(qs?.get(k)); return qs?.get(k) != null && Number.isFinite(v) ? v : d; };
      const fcs = num('m06fcs', 1.25), fck = num('m06fck', 1), fcn = num('m06fcn', 1.4);
      let seed2 = 9871; const rnd2 = () => ((seed2 = (seed2 * 16807) % 2147483647) / 2147483647);
      const aB: number[] = [], aS: number[] = [], aC: number[] = [];
      const fcg = qs?.get('m06fcg') === '1'; // r27: shrink each heap as a unit (see FOAMC_VERT GROUP)
      for (const it of items) {
        const R = it.r * fcs, n = Math.min(24, Math.max(3, Math.round((2 + 30 * R) * fck)));
        const t1 = new THREE.Vector3().crossVectors(it.up, new THREE.Vector3(1, 0, 0));
        if (t1.lengthSq() < 1e-4) t1.set(0, 0, 1);
        t1.normalize(); const t2 = new THREE.Vector3().crossVectors(it.up, t1).normalize();
        const base = it.p.clone().addScaledVector(it.up, -it.r * 0.35);
        for (let i = 0; i < n; i++) {
          // a flattened dome of lobes round the blob centre: bigger lobes on top, small bubbles round the foot
          const th = rnd2() * Math.PI * 2, d = R * Math.sqrt(rnd2()) * 1.1;
          const lobe = i === 0 || rnd2() < 0.22;
          const rho = lobe ? R * (0.45 + rnd2() * 0.25) : Math.max(0.025, R * (0.12 + Math.pow(rnd2(), 1.5) * 0.30));
          const hgt = (lobe ? R * (0.15 + 0.35 * rnd2()) * (1 - d / (1.2 * R)) : rho * 0.5) * (FCL ? 0.55 : 1); // r22 m06fcl: flatter heaps
          const p = base.clone().addScaledVector(t1, Math.cos(th) * d).addScaledVector(t2, Math.sin(th) * d).addScaledVector(it.up, rho * 0.55 + Math.max(0, hgt));
          aB.push(p.x, p.y, p.z, rho); aS.push(rnd2() + (lobe ? 1 : 0)); // aS >= 1: a foam lobe (pores), < 1: a small bubble
          aC.push(base.x, base.y, base.z);
        }
      }
      const quad = new THREE.PlaneGeometry(1, 1);
      const g = new THREE.InstancedBufferGeometry();
      g.setIndex(quad.index); g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
      g.setAttribute('aB', new THREE.InstancedBufferAttribute(new Float32Array(aB), 4));
      g.setAttribute('aS', new THREE.InstancedBufferAttribute(new Float32Array(aS), 1));
      if (fcg) g.setAttribute('aC', new THREE.InstancedBufferAttribute(new Float32Array(aC), 3));
      g.instanceCount = aS.length;
      for (const rim of [false, true]) {
        const m = new THREE.ShaderMaterial({ vertexShader: (fcg ? '#define GROUP\n' : '') + FOAMC_VERT, fragmentShader: (rim ? '#define RIM\n' : '') + FOAMC_FRAG,
          transparent: rim, depthWrite: !rim, fog: false,
          uniforms: { uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uNear: { value: new THREE.Vector2(fcn * 0.5, fcn) } } });
        const o = new THREE.Mesh(g, m);
        o.name = rim ? 'm06_foamclu_rim' : 'm06_foamclu'; o.frustumCulled = false; o.visible = false; o.renderOrder = rim ? 4 : 3;
        group.add(o); foamSprites.push(o);
      }
      console.info('[match06] m06fclu', { blobs: items.length, sprites: aS.length });
    } else {
      const fm = new THREE.MeshStandardMaterial({ color: 0xf7f0ff, roughness: 0.55, metalness: 0, emissive: new THREE.Color(0x9a7ac0), emissiveIntensity: 0.4 });
      foamClouds = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), fm, items.length);
      const m4 = new THREE.Matrix4();
      items.forEach((it, i) => { m4.makeScale(it.r, it.r * 0.8, it.r).setPosition(it.p); foamClouds!.setMatrixAt(i, m4); });
      foamClouds.name = 'm06_foamclouds'; foamClouds.visible = false; foamClouds.frustumCulled = false;
      group.add(foamClouds);
    }
  }
  // far end cap of the tunnel (the glowing vanishing point)
  const fe = frame(L.s1 + L.ext);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(tunCap ? tunCap.r : L.R, 64), mat(tTube));
  cap.geometry.setAttribute('aTile', new THREE.Float32BufferAttribute(new Float32Array(cap.geometry.attributes.position.count * 2), 2));
  // m06tun: the cap shows the painted glowing vanishing point (the wall/water mask would swap it for a flat tile colour)
  if (tunCap) { cap.position.copy(tunCap.pos); cap.lookAt(cap.position.clone().sub(tunCap.dir)); (cap.material as THREE.ShaderMaterial).uniforms.uUseMask.value = 0; }
  else { cap.position.copy(fe.pos).addScaledVector(fe.up, L.hA); cap.lookAt(cap.position.clone().sub(T1)); }
  cap.name = 'm06_end'; cap.frustumCulled = false;
  group.add(cap);

  // QA only: `&m06dbg=1` tints the tube green and the river floor red (which proxy surface a pixel comes from)
  if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('m06dbg') === '1') {
    group.traverse((o) => {
      const u = ((o as THREE.Mesh).material as THREE.ShaderMaterial)?.uniforms?.uDbg;
      if (u) u.value.set(o.name === 'm06_floor' ? 1 : 0, o.name === 'm06_floor' ? 0 : 1, 0);
    });
  }
  return {
    group,
    bakeDepth(renderer) {
      const prevRT = renderer.getRenderTarget();
      const scene = new THREE.Scene();
      const clone = group.clone(true);
      clone.visible = true;
      clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); });
      scene.add(clone);
      clone.updateMatrixWorld(true);
      renderer.setRenderTarget(depthRT);
      renderer.clear();
      renderer.render(scene, proj);
      renderer.setRenderTarget(prevRT);
      shared.uUseDepth.value = 1;
    },
    setAway(a) { if (foamClouds) foamClouds.visible = a > 0.5; for (const o of foamSprites) o.visible = a > 0.5; },
    setBenny(s, lat) { if (floorMat.uniforms.uRipOn.value > 0.5) floorMat.uniforms.uBen.value.set(lat, s); },
    away(cam) { return THREE.MathUtils.smoothstep(cam.distanceTo(shared.uProjPos.value), 0.6, 2.0); },
    sync(renderer, w, h) {
      shared.uPjPost.value.x = renderer.toneMappingExposure;
      if (FLOW) shared.uTime.value = performance.now() / 1000;
      shared.uPjRes.value.set(w, h);
    },
  };
}

