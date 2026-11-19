/**
 * Canvas-generated textures for Benny (no external downloads).
 * All colour maps are sRGB; normal maps are derived from height drawings (linear).
 */
import * as THREE from 'three';

type Ctx = CanvasRenderingContext2D;

function canvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function colorTex(c: HTMLCanvasElement, wrap = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (wrap) t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

/** Sobel normal map from a grayscale height canvas */
function normalFromHeight(src: HTMLCanvasElement, strength: number, wrap = false): THREE.CanvasTexture {
  const w = src.width, h = src.height;
  const hd = src.getContext('2d')!.getImageData(0, 0, w, h).data;
  const [c, ctx] = canvas(w, h);
  const out = ctx.createImageData(w, h);
  const H = (x: number, y: number) => {
    x = wrap ? (x + w) % w : Math.min(w - 1, Math.max(0, x));
    y = Math.min(h - 1, Math.max(0, y));
    return hd[(y * w + x) * 4] / 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (H(x + 1, y - 1) + 2 * H(x + 1, y) + H(x + 1, y + 1)) - (H(x - 1, y - 1) + 2 * H(x - 1, y) + H(x - 1, y + 1));
      const dy = (H(x - 1, y + 1) + 2 * H(x, y + 1) + H(x + 1, y + 1)) - (H(x - 1, y - 1) + 2 * H(x, y - 1) + H(x + 1, y - 1));
      let nx = -dx * strength, ny = dy * strength, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (y * w + x) * 4;
      out.data[i] = (nx * 0.5 + 0.5) * 255;
      out.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      out.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  if (wrap) t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

export const BENNY_COLORS = {
  // knit purple of refs 04–10 (cuff #7513ED, pom #7F14EC measured in ref 05)
  purple: '#7a18f0',
  purpleDark: '#36098e',
  purpleLight: '#9d55ff',
  white: '#fffaff',
  whiteShade: '#bcadd0',
  brim: '#7513ed',
  brimDark: '#330887',
  // hot plush pink of refs 02–10 (ref 05 fur median #F64EB1; the live median read bluer at #FF4CC4)
  pinkRoot: '#e6468c',
  pinkTip: '#fd80b4',
  pinkSkin: '#e85498',
  pomRoot: '#4a08b4',
  pomTip: '#7c28e8', // wave 5: was #8f3cff (live 05 pom median #9425FF L147, ref #8215ED L129)
  // star: warm yellow #F7BB19 (ref 05), not orange
  gold: '#ffc61c',
};

/**
 * The crown texture tiles this many times around the beanie (lathe u is scaled by it in build.ts), so the
 * stitches stay small: 36 columns × 4 ≈ 144 stitch columns around, as in ref 05 (≈ 6 px stitches on a
 * 293 px wide cuff), within the 1024 px texture limit of the GLB export.
 */
export const CROWN_REPEAT = 4;

/** stockinette stitch: two slanted loops forming a "V", colour + height */
function knitStitch(ctx: Ctx, hctx: Ctx, cx: number, cy: number, cw: number, rh: number, base: string, mid: string, shade: string) {
  for (const side of [-1, 1]) {
    const ex = cx + side * cw * 0.21;
    const g = ctx.createRadialGradient(ex - side * cw * 0.04, cy - rh * 0.18, 1, ex, cy, cw * 0.36);
    g.addColorStop(0, base);
    g.addColorStop(0.55, mid);
    g.addColorStop(1, shade);
    ctx.save();
    ctx.translate(ex, cy);
    ctx.rotate(side * -0.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, cw * 0.2, rh * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    const hg = hctx.createRadialGradient(ex, cy, 0, ex, cy, cw * 0.3);
    hg.addColorStop(0, '#fff');
    hg.addColorStop(0.6, '#9a9a9a');
    hg.addColorStop(1, '#151515');
    hctx.save();
    hctx.translate(ex, cy);
    hctx.rotate(side * -0.5);
    hctx.beginPath();
    hctx.ellipse(0, 0, cw * 0.2, rh * 0.6, 0, 0, Math.PI * 2);
    hctx.fillStyle = hg;
    hctx.fill();
    hctx.restore();
  }
}

/**
 * Knit crown texture (u = around, one of CROWN_REPEAT tiles; v = height 0 bottom → 1 top).
 * Stripes bottom→top: white, purple, white, purple, white; with the purple cuff that is 3 purple bands
 * (refs 04–10 rear: cuff · W · P · W, the top purple ring shows around the pom-pom, the white top is under it).
 */
const KNIT_WHITE_HI = '#fffaf8';
const KNIT_WHITE = '#fff6f4';
const KNIT_WHITE_SHADE = '#c8b2c4';
const KNIT_PURPLE_HI = '#8a2cff';
const KNIT_PURPLE = BENNY_COLORS.purple;
const KNIT_PURPLE_SHADE = BENNY_COLORS.purpleDark;

export function knitCrownTextures(): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  const W = 1024, Hh = 512;
  const [c, ctx] = canvas(W, Hh);
  const [hc, hctx] = canvas(W, Hh);
  const stripes: [number, number, string, string, string][] = [
    // [v0, v1, highlight, base, groove]   (v measured from bottom)
    // wave 5 (ref 05 rear, centre column: white 24 / purple 33 / white 19 px, then a purple band around the pom base):
    // wider middle purple, thinner upper white, upper purple band starts lower so it shows beside the pom.
    // Yarn colours: warmer cream white (live 05 white read lavender #FFD8FF vs ref #F3CFE4) and a stitch highlight
    // with less green (live purple stripe #8658FF vs ref #740FF2). A darker yarn (#420cb6, it05) only greyed the stripe
    // (#6238B6): its green floor comes from the scene light, so the saturated #7a18f0 yarn stays
    [0.0, 0.3, KNIT_WHITE_HI, KNIT_WHITE, KNIT_WHITE_SHADE],
    [0.3, 0.58, KNIT_PURPLE_HI, KNIT_PURPLE, KNIT_PURPLE_SHADE],
    [0.58, 0.73, KNIT_WHITE_HI, KNIT_WHITE, KNIT_WHITE_SHADE],
    [0.73, 0.92, KNIT_PURPLE_HI, KNIT_PURPLE, KNIT_PURPLE_SHADE],
    [0.92, 1.0, KNIT_WHITE_HI, KNIT_WHITE, KNIT_WHITE_SHADE],
  ];
  hctx.fillStyle = '#000';
  hctx.fillRect(0, 0, W, Hh);
  const cols = 36;
  const cw = W / cols;
  const rowH = 30; // ≈ 0.025 units per stitch row on the 0.42-unit crown (stitches ≈ as tall as wide)
  for (const [v0, v1, hi, base, shade] of stripes) {
    const y0 = Hh * (1 - v1), y1 = Hh * (1 - v0);
    ctx.fillStyle = shade;
    ctx.fillRect(0, y0, W, y1 - y0);
    const rows = Math.max(1, Math.round((y1 - y0) / rowH));
    const rh = (y1 - y0) / rows;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) knitStitch(ctx, hctx, k * cw + cw / 2, y0 + r * rh + rh / 2, cw, rh, hi, base, shade);
    }
    // fuzzy yarn speckle
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
      ctx.fillRect(Math.random() * W, y0 + Math.random() * (y1 - y0), 1.5, 1.5);
    }
  }
  return { map: colorTex(c, true), normalMap: normalFromHeight(hc, 4.5, true) };
}

/** Chunky ribbed (k2p2) folded cuff texture, u around, v across the band: deep grooves + stacked stitches */
export function ribbedBrimTextures(): { map: THREE.CanvasTexture; normalMap: THREE.CanvasTexture } {
  const W = 1024, Hh = 256;
  const [c, ctx] = canvas(W, Hh);
  const [hc, hctx] = canvas(W, Hh);
  const C = BENNY_COLORS;
  const ribs = 64; // ≈ 30 ribs across the visible half, as in ref 05
  const rw = W / ribs;
  for (let k = 0; k < ribs; k++) {
    const x = k * rw;
    const g = ctx.createLinearGradient(x, 0, x + rw, 0);
    g.addColorStop(0, C.brimDark);
    g.addColorStop(0.22, C.brim);
    g.addColorStop(0.5, C.purpleLight);
    g.addColorStop(0.78, C.brim);
    g.addColorStop(1, C.brimDark);
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, rw, Hh);
    const hg = hctx.createLinearGradient(x, 0, x + rw, 0);
    hg.addColorStop(0, '#000');
    hg.addColorStop(0.5, '#fff');
    hg.addColorStop(1, '#000');
    hctx.fillStyle = hg;
    hctx.fillRect(x, 0, rw, Hh);
    // stacked knit "V" stitches along the rib
    const rows = 10;
    const rh = Hh / rows;
    for (let r = 0; r < rows; r++) {
      const cy = (r + 0.5) * rh;
      for (const side of [-1, 1]) {
        ctx.save();
        ctx.translate(x + rw / 2 + side * rw * 0.16, cy);
        ctx.rotate(side * -0.45);
        ctx.fillStyle = 'rgba(175,125,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, rw * 0.17, rh * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        hctx.save();
        hctx.translate(x + rw / 2 + side * rw * 0.16, cy);
        hctx.rotate(side * -0.45);
        hctx.fillStyle = 'rgba(255,255,255,0.4)';
        hctx.beginPath();
        hctx.ellipse(0, 0, rw * 0.17, rh * 0.42, 0, 0, Math.PI * 2);
        hctx.fill();
        hctx.restore();
      }
      // dark gap between stacked stitches
      ctx.fillStyle = 'rgba(30,0,80,0.35)';
      ctx.fillRect(x + rw * 0.2, cy + rh * 0.42, rw * 0.6, rh * 0.12);
    }
  }
  return { map: colorTex(c, true), normalMap: normalFromHeight(hc, 3.6, true) };
}

/** Planar eye texture (centre of the canvas = centre of the eye dome). */
export function eyeTexture(kind: 'happy' | 'dizzy'): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas(S, S);
  const m = S / 2;
  // sclera
  const sg = ctx.createRadialGradient(m, m * 0.8, 10, m, m, m);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.8, '#f3eefc');
  sg.addColorStop(1, '#b9a8d8');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, S, S);
  if (kind === 'happy') {
    // big violet iris
    const ir = m * 0.8;
    const ig = ctx.createLinearGradient(0, m - ir, 0, m + ir);
    ig.addColorStop(0, '#2d0f73');
    ig.addColorStop(0.45, '#6a35d6');
    ig.addColorStop(1, '#c9a4ff');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.arc(m, m + 4, ir, 0, Math.PI * 2);
    ctx.fill();
    // iris radial streaks
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    for (let a = 0; a < Math.PI * 2; a += 0.18) {
      ctx.beginPath();
      ctx.moveTo(m + Math.cos(a) * ir * 0.45, m + 4 + Math.sin(a) * ir * 0.45);
      ctx.lineTo(m + Math.cos(a) * ir * 0.95, m + 4 + Math.sin(a) * ir * 0.95);
      ctx.stroke();
    }
    ctx.strokeStyle = '#1e0848';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(m, m + 4, ir, 0, Math.PI * 2);
    ctx.stroke();
    // pupil
    ctx.fillStyle = '#10061f';
    ctx.beginPath();
    ctx.arc(m, m + 6, ir * 0.48, 0, Math.PI * 2);
    ctx.fill();
    // sparkles: big upper-right, small lower-left
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(m + ir * 0.32, m - ir * 0.3, ir * 0.24, ir * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(m - ir * 0.3, m + ir * 0.38, ir * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(m + ir * 0.05, m + ir * 0.5, ir * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // dizzy purple spiral
    ctx.strokeStyle = '#5a1fc8';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let t = 0; t < 6 * Math.PI; t += 0.05) {
      const r = (t / (6 * Math.PI)) * m * 0.82;
      const x = m + Math.cos(t) * r, y = m + Math.sin(t) * r;
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = '#8a55ff';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  // dark rim
  ctx.strokeStyle = '#3a1d66';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(m, m, m - 5, 0, Math.PI * 2);
  ctx.stroke();
  return colorTex(c);
}

/** Mouth decal (alpha). 'happy' = open smile, 'dizzy' = round open "O", 'peek' = small grin */
export function mouthTexture(kind: 'happy' | 'dizzy' | 'peek'): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas(S, S);
  ctx.clearRect(0, 0, S, S);
  const m = S / 2;
  ctx.save();
  ctx.beginPath();
  if (kind === 'dizzy') {
    ctx.ellipse(m, m, 62, 74, 0, 0, Math.PI * 2);
  } else {
    const w = kind === 'peek' ? 86 : 104;
    const d = kind === 'peek' ? 84 : 104;
    ctx.moveTo(m - w, m - 30);
    ctx.quadraticCurveTo(m, m - 16, m + w, m - 30);
    ctx.bezierCurveTo(m + w * 0.9, m + d * 0.9, m - w * 0.9, m + d * 0.9, m - w, m - 30);
  }
  ctx.closePath();
  ctx.fillStyle = '#5b0f2a';
  ctx.fill();
  ctx.clip();
  // tongue
  ctx.fillStyle = '#ff6f9c';
  ctx.beginPath();
  ctx.ellipse(m, kind === 'dizzy' ? m + 50 : m + 52, 58, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,190,210,0.6)';
  ctx.beginPath();
  ctx.ellipse(m - 10, kind === 'dizzy' ? m + 36 : m + 38, 20, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // lip line
  ctx.strokeStyle = '#7a1844';
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.stroke();
  const t = colorTex(c);
  return t;
}

/** Soft blush disc (alpha) */
export function blushTexture(): THREE.CanvasTexture {
  const S = 128;
  const [c, ctx] = canvas(S, S);
  const g = ctx.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,70,130,0.95)');
  g.addColorStop(0.55, 'rgba(255,100,150,0.45)');
  g.addColorStop(1, 'rgba(255,120,170,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return colorTex(c);
}

/** White paw sole with pink pads (planar, centre = centre of the sole) */
export function soleTexture(kind: 'foot' | 'hand'): THREE.CanvasTexture {
  const S = 256;
  const [c, ctx] = canvas(S, S);
  const m = S / 2;
  const sg = ctx.createRadialGradient(m, m, 10, m, m, m);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.85, '#f8eef6');
  sg.addColorStop(1, '#e6cfe2');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, S, S);
  const pad = (x: number, y: number, rx: number, ry: number) => {
    const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.3, 2, x, y, Math.max(rx, ry));
    g.addColorStop(0, '#ffb3cf');
    g.addColorStop(0.6, '#ff7fae');
    g.addColorStop(1, '#f2669b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  if (kind === 'foot') {
    pad(m, m + 26, 52, 44); // main pad
    pad(m - 58, m - 40, 20, 24);
    pad(m - 20, m - 66, 20, 24);
    pad(m + 20, m - 66, 20, 24);
    pad(m + 58, m - 40, 20, 24);
  } else {
    pad(m, m + 20, 44, 36);
    pad(m - 46, m - 34, 17, 20);
    pad(m, m - 56, 17, 20);
    pad(m + 46, m - 34, 17, 20);
  }
  return colorTex(c);
}
