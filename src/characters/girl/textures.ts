/**
 * Canvas textures for the official cartoon girl (identity: character_references/official_cartoon_girl_original.jpg).
 * All procedural — no external images. Exported into the GLB as embedded PNGs by GLTFExporter.
 */
import * as THREE from 'three';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return { c, ctx };
}

function tex(c: HTMLCanvasElement, opts: { repeat?: boolean; srgb?: boolean } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  if (opts.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/** Big glossy cartoon eye: white sclera, large brown iris, black pupil, two highlights (planar UV, front = centre). */
export function eyeTexture(): THREE.CanvasTexture {
  const S = 512;
  const { c, ctx } = canvas(S, S);
  const cx = S / 2, cy = S / 2;
  // sclera with soft cool shading toward the rim
  const sg = ctx.createRadialGradient(cx, cy - 20, 40, cx, cy, S * 0.52);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.7, '#fdfbfb');
  sg.addColorStop(1, '#efe4e2');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, S, S);
  // iris
  const R = S * 0.3;
  const ig = ctx.createRadialGradient(cx, cy + R * 0.25, R * 0.15, cx, cy, R);
  ig.addColorStop(0, '#c98a4a');
  ig.addColorStop(0.45, '#8a4b22');
  ig.addColorStop(0.85, '#55290f');
  ig.addColorStop(1, '#2c1206');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  // iris fibres
  ctx.strokeStyle = 'rgba(255,200,140,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * R * 0.45, cy + Math.sin(a) * R * 0.45);
    ctx.lineTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92);
    ctx.stroke();
  }
  // upper shadow from the lid
  const lg = ctx.createLinearGradient(0, cy - R, 0, cy);
  lg.addColorStop(0, 'rgba(40,10,0,0.45)');
  lg.addColorStop(1, 'rgba(40,10,0,0)');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  // soft shadow cast by the upper lid / lashes across the top of the whole eye
  const ls = ctx.createLinearGradient(0, cy - S * 0.42, 0, cy - S * 0.12);
  ls.addColorStop(0, 'rgba(60,20,30,0.55)');
  ls.addColorStop(1, 'rgba(60,20,30,0)');
  ctx.fillStyle = ls;
  ctx.fillRect(0, 0, S, cy);
  // pupil
  ctx.fillStyle = '#140703';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.45, 0, Math.PI * 2);
  ctx.fill();
  // highlights (large upper-right, small lower-left)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx + R * 0.36, cy - R * 0.38, R * 0.26, R * 0.22, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx - R * 0.38, cy + R * 0.42, R * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(cx + R * 0.05, cy + R * 0.55, R * 0.06, 0, Math.PI * 2);
  ctx.fill();
  return tex(c);
}

/**
 * Face decal (transparent): open happy smile with teeth + tongue, rosy cheeks, soft nose shadow.
 * Mapping: x ∈ [-FX, FX] → u, y ∈ [FY0, FY1] → v (head-centre local units).
 */
export const FACE_RECT = { x0: -2.5, x1: 2.5, y0: -2.75, y1: 1.35 };
export function faceTexture(): THREE.CanvasTexture {
  const W = 1024;
  const H = Math.round((W * (FACE_RECT.y1 - FACE_RECT.y0)) / (FACE_RECT.x1 - FACE_RECT.x0));
  const { c, ctx } = canvas(W, H);
  ctx.clearRect(0, 0, W, H);
  const px = (x: number) => ((x - FACE_RECT.x0) / (FACE_RECT.x1 - FACE_RECT.x0)) * W;
  const py = (y: number) => ((FACE_RECT.y1 - y) / (FACE_RECT.y1 - FACE_RECT.y0)) * H;
  const u = W / (FACE_RECT.x1 - FACE_RECT.x0); // px per unit

  // rosy cheeks
  for (const sx of [-1, 1]) {
    const g = ctx.createRadialGradient(px(sx * 1.55), py(-1.05), 0, px(sx * 1.55), py(-1.05), u * 0.72);
    g.addColorStop(0, 'rgba(255,112,118,0.55)');
    g.addColorStop(0.55, 'rgba(255,120,130,0.25)');
    g.addColorStop(1, 'rgba(255,130,140,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px(sx * 1.55), py(-1.05), u * 0.72, 0, Math.PI * 2);
    ctx.fill();
  }
  // soft shadow under the nose
  {
    const g = ctx.createRadialGradient(px(0), py(-1.0), 0, px(0), py(-1.0), u * 0.3);
    g.addColorStop(0, 'rgba(190,90,70,0.28)');
    g.addColorStop(1, 'rgba(190,90,70,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(px(0), py(-1.0), u * 0.32, u * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // big open smile
  const mx = px(0), my = py(-1.62);
  const w = u * 1.72, h = u * 1.05;
  const mouth = new Path2D();
  mouth.moveTo(mx - w / 2, my - h * 0.2);
  mouth.bezierCurveTo(mx - w * 0.22, my - h * 0.05, mx + w * 0.22, my - h * 0.05, mx + w / 2, my - h * 0.2);
  mouth.bezierCurveTo(mx + w * 0.44, my + h * 0.72, mx - w * 0.44, my + h * 0.72, mx - w / 2, my - h * 0.2);
  mouth.closePath();
  ctx.save();
  ctx.fillStyle = '#5c1420';
  ctx.fill(mouth);
  ctx.clip(mouth);
  // throat shading
  const tg = ctx.createRadialGradient(mx, my + h * 0.1, 0, mx, my + h * 0.1, w * 0.5);
  tg.addColorStop(0, '#3a0710');
  tg.addColorStop(1, '#7a2230');
  ctx.fillStyle = tg;
  ctx.fillRect(mx - w, my - h, w * 2, h * 2);
  // upper teeth band
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(mx - w * 0.5, my - h * 0.32);
  ctx.bezierCurveTo(mx - w * 0.2, my - h * 0.16, mx + w * 0.2, my - h * 0.16, mx + w * 0.5, my - h * 0.32);
  ctx.lineTo(mx + w * 0.45, my + h * 0.04);
  ctx.bezierCurveTo(mx + w * 0.2, my + h * 0.16, mx - w * 0.2, my + h * 0.16, mx - w * 0.45, my + h * 0.04);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(200,190,220,0.6)';
  ctx.fillRect(mx - w * 0.5, my + h * 0.06, w, h * 0.03);
  // tongue
  const tong = ctx.createRadialGradient(mx, my + h * 0.48, 0, mx, my + h * 0.48, w * 0.3);
  tong.addColorStop(0, '#ff8c98');
  tong.addColorStop(1, '#e05068');
  ctx.fillStyle = tong;
  ctx.beginPath();
  ctx.ellipse(mx, my + h * 0.56, w * 0.27, h * 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // outline + smile corners
  ctx.strokeStyle = '#8c3a30';
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.stroke(mouth);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(mx + (s * w) / 2, my - h * 0.2);
    ctx.quadraticCurveTo(mx + s * (w / 2 + u * 0.12), my - h * 0.32, mx + s * (w / 2 + u * 0.1), my - h * 0.05);
    ctx.stroke();
  }
  return tex(c);
}

/** Horizontal hoodie stripes: one v-unit = one lavender + one white band (repeat wrap). */
export function stripeTexture(): THREE.CanvasTexture {
  const W = 64, H = 256;
  const { c, ctx } = canvas(W, H);
  const r = rng(11);
  ctx.fillStyle = '#b98ae9';
  ctx.fillRect(0, 0, W, H / 2);
  ctx.fillStyle = '#f6f1fc';
  ctx.fillRect(0, H / 2, W, H / 2);
  // soft band edges + knit speckle
  for (let i = 0; i < 1800; i++) {
    const x = r() * W, y = r() * H;
    const lav = y < H / 2;
    ctx.fillStyle = lav ? `rgba(120,70,190,${0.08 + r() * 0.1})` : `rgba(180,160,215,${0.06 + r() * 0.08})`;
    ctx.fillRect(x, y, 2, 3);
  }
  ctx.fillStyle = 'rgba(110,60,170,0.25)';
  ctx.fillRect(0, H / 2 - 3, W, 3);
  ctx.fillRect(0, H - 3, W, 3);
  return tex(c, { repeat: true });
}

/** Vertical rib knit (cuffs, hem). */
export function ribTexture(base = '#f7f3fd', dark = 'rgba(150,130,190,0.35)'): THREE.CanvasTexture {
  const W = 128, H = 32;
  const { c, ctx } = canvas(W, H);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = dark;
  for (let x = 0; x < W; x += 8) ctx.fillRect(x, 0, 3, H);
  return tex(c, { repeat: true });
}

/** Denim twill. */
export function denimTexture(base = '#5d74b8'): THREE.CanvasTexture {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const r = rng(5);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  ctx.lineWidth = 1.2;
  for (let i = -S; i < S * 2; i += 5) {
    ctx.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + S, S);
    ctx.stroke();
  }
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)';
    ctx.fillRect(r() * S, r() * S, 2, 1);
  }
  return tex(c, { repeat: true });
}

/** Hair strands running along v (u across). */
export function hairTexture(): THREE.CanvasTexture {
  const W = 256, H = 512;
  const { c, ctx } = canvas(W, H);
  const r = rng(21);
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#6a3e22');
  g.addColorStop(0.5, '#7c4b2a');
  g.addColorStop(1, '#6a3e22');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 520; i++) {
    const x = r() * W;
    const light = r();
    ctx.strokeStyle =
      light > 0.72 ? `rgba(206,150,104,${0.35 + r() * 0.35})` : light > 0.4 ? `rgba(140,88,52,${0.3 + r() * 0.3})` : `rgba(48,20,8,${0.25 + r() * 0.3})`;
    ctx.lineWidth = 1 + r() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (r() - 0.5) * 14, H * 0.33, x + (r() - 0.5) * 14, H * 0.66, x + (r() - 0.5) * 8, H);
    ctx.stroke();
  }
  return tex(c, { repeat: true });
}

/** Curly hair (small ringlet swirls) for the ponytail volume. */
export function curlTexture(): THREE.CanvasTexture {
  const S = 256;
  const { c, ctx } = canvas(S, S);
  const r = rng(33);
  ctx.fillStyle = '#6e391c';
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 260; i++) {
    const x = r() * S, y = r() * S, rad = 5 + r() * 9;
    const light = r();
    ctx.strokeStyle = light > 0.6 ? `rgba(205,130,72,${0.5 + r() * 0.4})` : `rgba(45,18,6,${0.4 + r() * 0.3})`;
    ctx.lineWidth = 1.5 + r() * 2;
    ctx.beginPath();
    ctx.arc(x, y, rad, r() * 6, r() * 6 + 3.5 + r() * 2);
    ctx.stroke();
  }
  return tex(c, { repeat: true });
}
