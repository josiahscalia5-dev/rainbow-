// swimfx.js — round 34 (S2, Benny's swimming): the water around Benny while he swims.
//  * V-wake: two broken-foam ribbons that start at his waist and spread behind him on the river surface. Every ribbon point is
//    WORLD-anchored where he was, drifts with the current (toward the camera) and fades with age, so the wake follows the river's
//    path frame (frameAt) and his real lane changes — it is never glued to the screen.
//  * Paddle ripples: a flat ring opens on the water where each paw dips in (alternating left / right with his strokes).
//  * Kicks: Benny has no separate feet; each flutter kick of his lower back throws a small foam puff + droplets behind him.
//  * The painted splash (the approved picture's white fan around his waist) STREAMS: a two-phase flow distortion moves its white
//    spray streaks outward and back with the current. Its top centre (the painted fur at his waist) is never distorted, and the
//    distortion strength is 0 at the start frame (frame 0 stays pixel-identical to the approved start view).
// Driven only by the game clock passed in update() (deterministic tests). ?swimfx=0 turns all of it off.
// the painted splash WITHOUT the painted fur at its top centre (for the leap / dive bursts, which appear where he is not)
export function sprayOnly(THREE, tex) {
  const img = tex.image, c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), a = d.data;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const e = Math.hypot((x / c.width - 0.5) / 0.26, (y / c.height) / 0.5), k = Math.min(1, Math.max(0, (e - 0.95) / 0.3)), i = (y * c.width + x) * 4;
    const pink = a[i] > a[i + 1] + 60 && a[i + 2] > a[i + 1] + 20 ? 0.15 : 1;   // stray fur-coloured texels outside the ellipse
    a[i + 3] = Math.round(a[i + 3] * k * k * (3 - 2 * k) * pink);
  }
  g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function installSwimFx({ THREE, scene, splash, q }) {
  const OFF = q.get('swimfx') === '0';
  const MOVE = q.get('move') === '1', SIMPLE = q.get('look') === 'simple';   // r48 candidate: contact collar + kicks at his body (no detached foam puffs)   // round 36c: the user's reference-video swimming (foam collar, bubble trails, big ripple rings, stronger wake)
  const P = { WAKE_AGE: 1.1, WAKE_W0: 0.085, WAKE_SPREAD: 0.3, DRIFT: 0.55, WAKE_A: MOVE ? 0.85 : 0.55, RIPPLE_T: MOVE ? 1.0 : 0.75, PUFF_T: 0.6, SPL_FLOW: 0.035,
    RIP_SIZE: MOVE ? 0.12 : 0.07, RING_EVERY: 0.55, TRAIL_RATE: 110, TRAIL_LIFE: 0.95, COLLAR_A: 0.95, KICK_BACK: SIMPLE ? 0.04 : 0.11, PUFF_DRIFT: SIMPLE ? 0.12 : -1 };
  if (SIMPLE) { P.PUFF_T = 0.32; P.COLLAR_A = 0.8; }
  for (const k of Object.keys(P)) { const v = q.get('fx_' + k); if (v != null && v !== '' && !isNaN(+v)) P[k] = +v; }
  const canvasTex = (draw, n = 128) => { const c = document.createElement('canvas'); c.width = c.height = n; draw(c.getContext('2d'), n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  // a soft broken ring (ripple) and a clustered foam puff, drawn once (no image files)
  let seed = 4242; const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const ringTex = canvasTex((g, n) => { const c = n / 2; for (let i = 0; i < 90; i++) { const a = (i / 90) * Math.PI * 2, r = c * (0.78 + 0.06 * (rnd() - 0.5));
    const gr = g.createRadialGradient(c + Math.cos(a) * r, c + Math.sin(a) * r, 0, c + Math.cos(a) * r, c + Math.sin(a) * r, n * (MOVE ? 0.09 : 0.07));
    gr.addColorStop(0, `rgba(255,255,255,${(MOVE ? 0.7 : 0.35) + (MOVE ? 0.3 : 0.4) * rnd()})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n); } });
  const foamTex = canvasTex((g, n) => { const c = n / 2; for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * c * 0.55, x = c + Math.cos(a) * d, y = c + Math.sin(a) * d, r = n * (0.06 + 0.1 * rnd());
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(235,248,255,0.7)'); gr.addColorStop(1, 'rgba(220,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n); } });

  // ---------------- flat decals lying on the river (ripples, foam puffs) ----------------
  const plane = new THREE.PlaneGeometry(1, 1), Mb = new THREE.Matrix4();
  const pool = (tex, n) => Array.from({ length: n }, () => { const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.visible = false; m.renderOrder = 6; m.frustumCulled = false; scene.add(m); return { m, age: 0, life: 0, size: 0, grow: 0, p: new THREE.Vector3(), t: new THREE.Vector3(), a0: 1 }; });
  const ripples = pool(ringTex, MOVE ? 16 : 10), puffs = pool(foamTex, 12); let ri = 0, pi = 0;
  // ---- round 36c (?move=1): foam collar around his waist at the water line, bubble trails streaming back from his sides ----
  // a dense band of white foam bubbles in an ellipse annulus (the white collar hugging his waist in the user's reference video)
  const collarTex = canvasTex((g, n) => { const c = n / 2;
    for (let i = 0; i < 420; i++) { const a = rnd() * Math.PI * 2, r = c * (0.56 + 0.36 * Math.sqrt(rnd())), x = c + Math.cos(a) * r, y = c + Math.sin(a) * r, rr = n * (0.018 + 0.03 * rnd());
      const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.6, 'rgba(238,246,255,0.9)'); gr.addColorStop(1, 'rgba(225,238,255,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); } }, 256);
  const collar = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ map: collarTex, transparent: true, depthWrite: false, toneMapped: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  collar.renderOrder = 6; collar.frustumCulled = false; collar.visible = (MOVE || SIMPLE) && !OFF; scene.add(collar);
  const collar2 = collar.clone(); collar2.material = collar.material.clone(); collar2.material.map = ringTex; scene.add(collar2); collar2.visible = collar.visible;
  const NB = 180, bPos = new Float32Array(NB * 3), bA = new Float32Array(NB), bS = new Float32Array(NB), bAge = new Float32Array(NB).fill(9), bLife = new Float32Array(NB), bSz = new Float32Array(NB);
  const bVel = Array.from({ length: NB }, () => new THREE.Vector3()), bP = Array.from({ length: NB }, () => new THREE.Vector3()); let bNext = 0, bAcc = 0, ringAcc = 0;
  const bubTexFx = canvasTex((g, n) => { const c = n / 2, gr = g.createRadialGradient(c, c, n * 0.18, c, c, n * 0.48);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.55, 'rgba(245,250,255,0.95)'); gr.addColorStop(0.8, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, n, n); }, 64);
  const bGeo = new THREE.BufferGeometry(); bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3)); bGeo.setAttribute('aA', new THREE.BufferAttribute(bA, 1)); bGeo.setAttribute('aS', new THREE.BufferAttribute(bS, 1));
  const bMat = new THREE.ShaderMaterial({ uniforms: { map: { value: bubTexFx }, uPx: { value: 1 } }, transparent: true, depthWrite: false, toneMapped: false,
    vertexShader: `attribute float aA; attribute float aS; uniform float uPx; varying float vA; void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * uPx / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; varying float vA; void main(){ vec4 c = texture2D(map, gl_PointCoord); if (c.a * vA < 0.01) discard; gl_FragColor = vec4(c.rgb, c.a * vA); }` });
  const bubbles = new THREE.Points(bGeo, bMat); bubbles.frustumCulled = false; bubbles.renderOrder = 7; bubbles.visible = MOVE && !OFF; scene.add(bubbles);
  function emitBubble(p, F, side) {
    const k = bNext; bNext = (bNext + 1) % NB; bAge[k] = 0; bLife[k] = P.TRAIL_LIFE * (0.7 + 0.6 * rnd()); bSz[k] = 0.016 + 0.03 * rnd() * rnd();
    bP[k].copy(p).addScaledVector(F.r, side * (0.11 + 0.05 * rnd())).addScaledVector(F.t, -0.02 - 0.05 * rnd()).addScaledVector(F.n, 0.004 + 0.01 * rnd());
    bVel[k].copy(F.t).multiplyScalar(-P.DRIFT * (0.8 + 0.5 * rnd())).addScaledVector(F.r, side * (0.06 + 0.12 * rnd())).addScaledVector(F.n, 0.02 * rnd());
  }
  function updCollar(o) {
    const { F, waterPt } = o;
    // foam collar: a broken white ring + a foamy puff ring around his waist on the water, breathing with his strokes
    const sw = 1 + 0.08 * Math.sin(o.armPh * 2) + 0.15 * (o.latK || 0);
    for (const [m, sx, sy, a, rot] of [[collar, 0.44, 0.27, P.COLLAR_A, o.clock * 0.25], [collar2, 0.58, 0.34, P.COLLAR_A * 0.6, -o.clock * 0.4]]) {
      m.position.copy(waterPt).addScaledVector(F.n, 0.004).addScaledVector(F.t, -0.015);
      m.quaternion.setFromRotationMatrix(Mb.makeBasis(F.r, F.t, F.n)); m.scale.set(sx * sw, sy * sw, 1); m.material.rotation = rot;
      m.material.opacity = a * (o.inWater ? 1 : 0) * Math.min(1, o.s / 0.25); } }
  function updMove(o) {
    const { F, waterPt, dt } = o; updCollar(o);
    // bubble trails from both sides of his body, streaming back toward the camera with the current
    if (dt > 0 && o.inWater && o.s > 0.05) { bAcc += dt * P.TRAIL_RATE * (1 + 0.6 * (o.latK || 0)); while (bAcc >= 1) { bAcc -= 1; emitBubble(waterPt, F, rnd() < 0.5 ? -1 : 1); } }
    // a big ring spreading around him every ~0.55 s
    if (dt > 0 && o.inWater && o.s > 0.05) { ringAcc += dt; if (ringAcc >= P.RING_EVERY) { ringAcc = 0; v1.copy(waterPt).addScaledVector(F.t, -0.04); place(0, ripples, ri, v1, F, 0.26, 1.1, 1.8, 0.75); ri = (ri + 1) % ripples.length; } }
    for (let k = 0; k < NB; k++) {
      if (bAge[k] >= bLife[k]) { bA[k] = 0; continue; }
      bAge[k] += dt; bP[k].addScaledVector(bVel[k], dt); bVel[k].multiplyScalar(Math.exp(-1.2 * dt));
      const x = bAge[k] / bLife[k]; bA[k] = Math.min(1, x * 10) * (1 - x) * 0.9; bS[k] = bSz[k] * (0.8 + 0.5 * x);
      bPos[3 * k] = bP[k].x; bPos[3 * k + 1] = bP[k].y; bPos[3 * k + 2] = bP[k].z;
    }
    bGeo.attributes.position.needsUpdate = true; bGeo.attributes.aA.needsUpdate = true; bGeo.attributes.aS.needsUpdate = true;
  }
  const place = (d, list, k, p, F, size, life, grow, a0) => { const o = list[k]; o.p.copy(p); o.t.copy(F.t); o.size = size; o.grow = grow; o.life = life; o.age = 0; o.a0 = a0;
    o.m.quaternion.setFromRotationMatrix(Mb.makeBasis(F.r, F.t, F.n)); o.m.visible = true; return o; };
  const ripple = (p, F, size) => { if (OFF) return; place(0, ripples, ri, p, F, size, P.RIPPLE_T, 2.6, 0.55); ri = (ri + 1) % ripples.length; };
  const puff = (p, F, size) => { if (OFF) return; const o = place(0, puffs, pi, p, F, size, P.PUFF_T, 0.9, 0.85); o.m.material.rotation = rnd() * 6.28; pi = (pi + 1) % puffs.length; };
  const updDecals = (list, dt) => { for (const o of list) { if (o.life <= 0) continue; o.age += dt; const k = o.age / o.life;
    if (k >= 1) { o.life = 0; o.m.visible = false; continue; }
    o.p.addScaledVector(o.t, -(list === puffs && P.PUFF_DRIFT >= 0 ? P.PUFF_DRIFT : P.DRIFT) * dt); o.m.position.copy(o.p);   // r48: kick puffs stay at his body const z = o.size * (1 + o.grow * Math.sqrt(k)); o.m.scale.set(z, z * 1.15, 1);
    o.m.material.opacity = o.a0 * Math.min(1, k * 8) * (1 - k) * (1 - k); } };

  // ---------------- V-wake ribbons ----------------
  const HN = 34, hist = [];   // his water point every step: { p, r, t, n, s, age, k (strength) }
  const nV = 2 * HN * 2, wPos = new Float32Array(nV * 3), wA = new Float32Array(nV), wU = new Float32Array(nV * 2), idx = [];
  for (let sd = 0; sd < 2; sd++) for (let i = 0; i < HN - 1; i++) { const a = (sd * HN + i) * 2, b = a + 2; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const wGeo = new THREE.BufferGeometry(); wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); wGeo.setAttribute('aA', new THREE.BufferAttribute(wA, 1)); wGeo.setAttribute('aU', new THREE.BufferAttribute(wU, 2)); wGeo.setIndex(idx);
  const wMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: `attribute float aA; attribute vec2 aU; varying float vA; varying vec2 vU; void main(){ vA = aA; vU = aU; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying float vA; varying vec2 vU;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
      void main(){ float x = vU.y; float prof = smoothstep(0.0, 0.4, x) * (1.0 - smoothstep(0.5, 1.0, x));
        float n = vn(vec2(vU.x * 16.0, x * 3.0)) * 0.6 + vn(vec2(vU.x * 37.0, x * 6.0 + 3.1)) * 0.4;
        float a = vA * prof * smoothstep(0.32, 0.72, n); if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.93, 0.98, 1.0), a); }` });
  const wake = new THREE.Mesh(wGeo, wMat); wake.frustumCulled = false; wake.renderOrder = 6; wake.visible = !OFF; scene.add(wake);
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  function updWake(o) {
    for (const h of hist) { h.age += o.dt; h.p.addScaledVector(h.t, -P.DRIFT * o.dt); }
    while (hist.length && hist[hist.length - 1].age > P.WAKE_AGE) hist.pop();
    if (o.dt > 0) { if (hist.length >= HN) hist.pop(); hist.unshift({ p: o.waterPt.clone(), r: o.F.r.clone(), t: o.F.t.clone(), n: o.F.n.clone(), s: o.s, age: 0, k: o.wakeK }); }
    for (let sd = 0; sd < 2; sd++) {
      const side = sd ? 1 : -1;
      for (let i = 0; i < HN; i++) {
        const h = hist[Math.min(i, hist.length - 1)], base = (sd * HN + i) * 2;
        if (!h) { wA[base] = wA[base + 1] = 0; continue; }
        const a = h.age, off = P.WAKE_W0 + P.WAKE_SPREAD * a, w = 0.014 + 0.05 * a;
        v1.copy(h.p).addScaledVector(h.r, side * (off - w * 0.5)).addScaledVector(h.n, 0.004);
        v2.copy(h.p).addScaledVector(h.r, side * (off + w * 0.5)).addScaledVector(h.n, 0.004);
        wPos.set([v1.x, v1.y, v1.z], base * 3); wPos.set([v2.x, v2.y, v2.z], base * 3 + 3);
        const fade = i < hist.length ? Math.min(1, a / 0.1) * (1 - a / P.WAKE_AGE) ** 1.6 * h.k * P.WAKE_A : 0;
        wA[base] = wA[base + 1] = fade;
        const along = h.s - P.DRIFT * a; wU.set([along, sd ? 0 : 1, along, sd ? 1 : 0], base * 2);
      }
    }
    wGeo.attributes.position.needsUpdate = true; wGeo.attributes.aA.needsUpdate = true; wGeo.attributes.aU.needsUpdate = true;
  }

  // ---------------- the painted splash streams (fragment flow distortion, strength uSplFlow: 0 at the start frame) ----------------
  const SPL = { uSplFlow: { value: 0 }, uSplT: { value: 0 } };
  let calls = 0;
  function patchSplash() {
    const m = splash.material; calls++;
    if (m.userData.b31flow || OFF || !(m.userData.kit || calls > 2)) return; m.userData.b31flow = 1;   // after the page's own sprite patch
    const base = m.onBeforeCompile;   // the page's depth-curve patch (patchSprite) stays first
    m.onBeforeCompile = (sh, r) => { if (base) base.call(m, sh, r); Object.assign(sh.uniforms, SPL);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uSplFlow; uniform float uSplT;')
        .replace('#include <map_fragment>', `#ifdef USE_MAP
        if (uSplFlow > 0.0) {
          vec2 suv = vMapUv;
          // the painted fur at the top centre stays put; the spray around it streams outward from his waist and back with the current
          float e = length((suv - vec2(0.5, 1.0)) / vec2(0.25, 0.5));
          float m = smoothstep(1.0, 1.3, e) * uSplFlow;
          vec2 dir = normalize(vec2((suv.x - 0.5) * 1.6, -0.55 - 0.45 * abs(suv.x - 0.5)));
          float ph = fract(uSplT), L = ${P.SPL_FLOW.toFixed(4)};
          vec4 c1 = texture2D(map, suv - dir * (ph * L * m));
          vec4 c2 = texture2D(map, suv - dir * (fract(ph + 0.5) * L * m));
          diffuseColor *= mix(c2, c1, 1.0 - abs(1.0 - 2.0 * ph));
          // round 35: the painted splash carries a patch of the painting's WATER around its spray; over the moving river its straight
          // bottom edge showed as a line. Once he swims, that painted water fades (saturated texels) and the image edges fade out;
          // the white spray and the fur at the top centre stay (strength 0 at the start frame: frame 0 unchanged)
          float sSat = max(diffuseColor.r, max(diffuseColor.g, diffuseColor.b)) - min(diffuseColor.r, min(diffuseColor.g, diffuseColor.b));
          float sKeep = mix(1.0, 1.0 - smoothstep(0.3, 0.62, sSat), 0.75 * smoothstep(1.0, 1.3, e) * step(0.001, uSplFlow));
          float sEdge = smoothstep(0.0, 0.28, vMapUv.y) * smoothstep(0.0, 0.12, min(vMapUv.x, 1.0 - vMapUv.x));
          diffuseColor.a *= sKeep * mix(1.0, sEdge, step(0.001, uSplFlow));
        } else { diffuseColor *= texture2D(map, vMapUv); }
        #endif`); };
    const key = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
    m.customProgramCacheKey = () => 'b31-splash-flow|' + key();
    m.needsUpdate = true;
  }

  // ---------------- per step ----------------
  // o = { dt, clock, s, waterPt, F, lat, latV, h, armPh (right paw phase, rad), kickPh (rad), wakeK, inWater, drop(p, v, size, life, g) }
  let lastArm = 0, lastKick = 0;
  const wrapCount = (a, b, ph) => Math.floor((b - ph) / (2 * Math.PI)) - Math.floor((a - ph) / (2 * Math.PI));   // phase crossings of ph (mod 2pi) in (a, b]
  function update(o) {
    patchSplash();
    if (OFF) return;
    const { F, waterPt, dt } = o;
    SPL.uSplFlow.value = Math.min(1, o.s / 0.25) * (o.inWater ? 1 : 0.3); SPL.uSplT.value = o.clock * 1.6;
    updWake(o);
    if (dt > 0 && o.inWater) {
      // paw entries: the right paw dips in at phase ~0.35 of its stroke, the left half a cycle later (alternating ripples)
      for (const [side, ph0] of [[1, 0.35], [-1, 0.35 + Math.PI]]) if (wrapCount(lastArm, o.armPh, ph0) > 0) {
        v1.copy(waterPt).addScaledVector(F.r, side * o.armX).addScaledVector(F.t, 0.03); ripple(v1, F, P.RIP_SIZE);
        for (let i = 0; i < 2; i++) { v2.copy(F.n).multiplyScalar(0.5 + rnd() * 0.4).addScaledVector(F.r, side * (0.2 + rnd() * 0.3)).addScaledVector(F.t, -0.2 - rnd() * 0.3);
          o.drop(v1.clone().addScaledVector(F.n, 0.02), v2.clone(), 0.012 + rnd() * 0.012, 0.35 + rnd() * 0.15, 3.6); }
      }
      // kicks: alternating left / right foam puffs + droplets just behind his lower back (toward the camera)
      for (const [side, ph0] of [[1, Math.PI / 2], [-1, Math.PI * 1.5]]) if (wrapCount(lastKick, o.kickPh, ph0) > 0) {
        v1.copy(waterPt).addScaledVector(F.r, side * 0.06).addScaledVector(F.t, -P.KICK_BACK).addScaledVector(F.n, 0.003); puff(v1, F, 0.07 * o.kickK);
        for (let i = 0; i < 2; i++) { v2.copy(F.n).multiplyScalar(0.45 + rnd() * 0.4).addScaledVector(F.r, side * (0.05 + rnd() * 0.15)).addScaledVector(F.t, -0.35 - rnd() * 0.3);
          o.drop(v1.clone().addScaledVector(F.n, 0.015), v2.clone(), 0.01 + rnd() * 0.012, 0.32 + rnd() * 0.15, 3.6); }
      }
    }
    lastArm = o.armPh; lastKick = o.kickPh;
    if (MOVE) updMove(o); else if (SIMPLE) updCollar(o);
    updDecals(ripples, dt); updDecals(puffs, dt);
  }
  window.swimFxInfo = () => ({ wakePts: hist.length, ripples: ripples.filter((r) => r.life > 0).length, puffs: puffs.filter((r) => r.life > 0).length, splFlow: SPL.uSplFlow.value, off: OFF });
  return { update, P, setPx: (px) => { bMat.uniforms.uPx.value = px; } };
}
