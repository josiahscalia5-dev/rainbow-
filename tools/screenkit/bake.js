// ======================================================================================================================================
// Rainbow screen kit - BAKE + ARTWORK-SAMPLED MATERIALS (round 45; the bake itself = round 43 screen.html, moved here unchanged so the build
// cache can key the bake on THIS file only: a change to a page's materials / water shader no longer re-bakes).
// 1. bake(): the approved picture(s) baked ONCE onto every mesh from the camera(s) fitted to them (depth-tested, masked where the game draws
//    Benny / coins / HUD itself, clean plate inside the masks, density map for the sharpness guard) - exactly the r43 method.
// 2. templates(): REUSABLE MATERIALS SAMPLED FROM THE ARTWORK that look right from any camera position, also where the picture never saw a
//    surface (far down the tube, behind the camera, after turns):
//      ring    every gold ring has the same UV layout (asset RB_GoldRing) -> all rings the picture shows are FUSED texel by texel, keeping the
//              sharpest unmasked picture sample (quality = picture px per world unit, written as depth: the GPU keeps the best) -> one template
//      copper  the same for the wall trays (RB_WallTray / RB_MachineryRow)
//      tunnel  the drum wall is periodic (one ring spacing): every visible period of the painted wall is fused into ONE period template
//              (u around the drum, v = position within the period) -> applied to the whole tube, phase-locked to the rings
//      water / pool / flume  a FLOW SWATCH: the sharpest window of the painted river / pool along the flow (u across, v along), made
//              seamless along the flow (cross-faded overlap) -> scrolls with the current on every water surface of the level
// The page uses a template as the base colour wherever no baked picture pixel is sharp enough (the r43 sharpness guard decides), so the
// scenery keeps the painting's look (colours, light dots, streaks, sparkle) instead of drawn code materials.
// ======================================================================================================================================
export const famOf = (n) => /^tunnel(far)?_/.test(n) ? 'tunnel' : /^ring_/.test(n) ? 'ring' : /^water_/.test(n) ? 'water' : /^pool_front/.test(n) ? 'pool' : /^pool_/.test(n) ? 'pool'
  : /^flume_/.test(n) ? 'flume' : /^foam_/.test(n) ? 'foam' : /^paddle(rep)?_/.test(n) ? 'copper' : /^funnel_/.test(n) ? 'funnel' : /^wall_/.test(n) ? 'wall' : /^arrow_/.test(n) ? 'arrow' : 'tunnel';
// meshes whose own UVs are shared by several copies (realised instances): template only, never their own bake
export const tplOnly = (n) => /^paddlerep_/.test(n);

const LOOK_GLSL = (decl) => `${decl} uniform vec2 uNF, uDens; uniform float uMode; uniform float uNoDepth; varying vec3 vW;
  float lin(float d){ float z = d * 2.0 - 1.0; return 2.0 * uNF.x * uNF.y / (uNF.y + uNF.x - z * (uNF.y - uNF.x)); }
  vec4 look(mat4 VP, sampler2D P, sampler2D M, sampler2D D, vec2 img, out float qd){ qd = 0.0;
    vec4 cl = VP * vec4(vW, 1.0); vec3 nd = cl.xyz / max(cl.w, 1e-5); vec2 su = nd.xy * 0.5 + 0.5, px = su * img;
    if (cl.w <= 0.05 || abs(nd.x) > 0.997 || abs(nd.y) > 0.997) return vec4(0.0);
    if (uNoDepth < 0.5 && cl.w > lin(texture2D(D, su).r) * 1.015 + 0.03) return vec4(0.0);
    float pxu = min(length(dFdx(px)) / max(length(dFdx(vW)), 1e-7), length(dFdy(px)) / max(length(dFdy(vW)), 1e-7));
    qd = pxu;
    float w = mix(1.0, 0.6, step(0.5, texture2D(M, su).r)) * mix(0.8, 1.0, smoothstep(uDens.x, uDens.y, pxu));
    if (uMode > 0.5) { float pw = pxu / 4000.0; return vec4(floor(pw * 255.0) / 255.0, fract(pw * 255.0), 0.0, w); }
    return vec4(texture2D(P, su).rgb, w); }`;

export async function bake({ THREE, renderer, scene, world, MESH, CAMS, LAY, q, loadRaw, bbox }) {
  const BAKE_STATS = {}, BAKE_DATA = {};
  const tex = await Promise.all(CAMS.flatMap((c) => [loadRaw(c.userData.plate), loadRaw(c.userData.mask)]));
  const depthOf = (cam) => { const rt = new THREE.WebGLRenderTarget(cam.userData.img[0], cam.userData.img[1]); rt.depthTexture = new THREE.DepthTexture(cam.userData.img[0], cam.userData.img[1]);
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); return rt; };
  const DEP = CAMS.map(depthOf);
  const vp = (c) => new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
  const uni = { uNoDepth: { value: q.get('bakedbg') === 'nodepth' ? 1 : q.get('bakedbg') === 'raw' ? 2 : 0 }, uNF: { value: new THREE.Vector2(0.05, 300) }, uDens: { value: new THREE.Vector2(...(q.get('dens') ?? (LAY.bake_dens ?? [15, 60]).join(',')).split(',').map(Number)) }, uMode: { value: 0 } };
  let decl = '', body = '', bodyQ = '';
  CAMS.forEach((c, i) => { Object.assign(uni, { [`uP${i}`]: { value: tex[2 * i] }, [`uM${i}`]: { value: tex[2 * i + 1] }, [`uD${i}`]: { value: DEP[i].depthTexture }, [`uVP${i}`]: { value: vp(c) }, [`uImg${i}`]: { value: new THREE.Vector2(...c.userData.img) } });
    decl += `uniform sampler2D uP${i}, uM${i}, uD${i}; uniform mat4 uVP${i}; uniform vec2 uImg${i};\n`;
    body += `{ float qd; vec4 a = look(uVP${i}, uP${i}, uM${i}, uD${i}, uImg${i}, qd); if (qd > bq) { bq = qd; best = a; } }\n`;
    // fusion quality: picture px per world unit, x 0.25 inside the game-drawn mask (Benny / coins: the clean plate there is filled in)
    bodyQ += `{ float qd; vec4 a = look(uVP${i}, uP${i}, uM${i}, uD${i}, uImg${i}, qd); float qq = a.a > 0.0 ? qd * (a.a < 0.7 ? 0.25 : 1.0) : 0.0; if (qq > bq) { bq = qq; best = a; } }\n`; });
  const bakeMat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, depthTest: false, depthWrite: false, uniforms: uni,
    vertexShader: 'varying vec3 vW; void main(){ vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0); }',
    fragmentShader: `${LOOK_GLSL(decl)}
      void main(){ float bq = -1.0; vec4 best = vec4(0.0);
        if (uNoDepth > 1.5) { vec4 cl = uVP0 * vec4(vW, 1.0); vec3 nd = cl.xyz / max(cl.w, 1e-5); gl_FragColor = vec4(clamp(cl.w / 40.0, 0.0, 1.0), nd.x * 0.25 + 0.5, nd.y * 0.25 + 0.5, 1.0); return; }
${body}        gl_FragColor = best; }` });
  const bakeScene = new THREE.Scene(), oc = new THREE.OrthographicCamera();
  // pull-push hole filling of an RGBA float image (alpha = coverage), in place -> every texel gets a colour from its nearest covered texels
  const pullPush = (bw, bh, src) => { const lv = [{ w: bw, h: bh, c: src }];
    while (lv[lv.length - 1].w > 1 || lv[lv.length - 1].h > 1) { const L = lv[lv.length - 1], w2 = Math.max(1, L.w >> 1), h2 = Math.max(1, L.h >> 1), c2 = new Float32Array(w2 * h2 * 4);
      for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const sx = Math.min(L.w - 1, x * 2 + dx), sy = Math.min(L.h - 1, y * 2 + dy), si = (sy * L.w + sx) * 4, di = (y * w2 + x) * 4; for (let c = 0; c < 4; c++) c2[di + c] += L.c[si + c] * 0.25; }
      lv.push({ w: w2, h: h2, c: c2 }); }
    for (let l = lv.length - 2; l >= 0; l--) { const L = lv[l], U2 = lv[l + 1];
      for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) { const i = (y * L.w + x) * 4, a = L.c[i + 3]; if (a >= 0.999) continue;
        const ui = (Math.min(U2.h - 1, y >> 1) * U2.w + Math.min(U2.w - 1, x >> 1)) * 4, ua = Math.max(U2.c[ui + 3], 1e-6);
        for (let c = 0; c < 3; c++) L.c[i + c] += (1 - a) * U2.c[ui + c] / ua; L.c[i + 3] = 1; } }
    return src; };
  const bakeOne = (o, bw, bh) => {
    const rt = new THREE.WebGLRenderTarget(bw, bh); const tmp = new THREE.Mesh(o.geometry, bakeMat); tmp.matrixAutoUpdate = false; o.updateWorldMatrix(true, false); tmp.matrix.copy(o.matrixWorld); tmp.frustumCulled = false;
    bakeScene.add(tmp); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(bakeScene, oc); renderer.setRenderTarget(null); bakeScene.remove(tmp);
    const px = new Uint8Array(bw * bh * 4); renderer.readRenderTargetPixels(rt, 0, 0, bw, bh, px); rt.dispose();
    let cov = 0; for (let i = 3; i < px.length; i += 4) cov += px[i]; cov /= 255 * bw * bh;
    if (cov < 0.002) return { cov, tex: null };
    const A = new Float32Array(bw * bh); for (let i = 0; i < bw * bh; i++) A[i] = px[i * 4 + 3] / 255;
    const blur = (src, r) => { const o2 = new Float32Array(src.length), t2 = new Float32Array(src.length);
      for (let y = 0; y < bh; y++) { let s = 0; for (let x = -r; x <= r; x++) s += src[y * bw + Math.min(bw - 1, Math.max(0, x))]; for (let x = 0; x < bw; x++) { t2[y * bw + x] = s / (2 * r + 1); s += src[y * bw + Math.min(bw - 1, x + r + 1)] - src[y * bw + Math.max(0, x - r)]; } }
      for (let x = 0; x < bw; x++) { let s = 0; for (let y = -r; y <= r; y++) s += t2[Math.min(bh - 1, Math.max(0, y)) * bw + x]; for (let y = 0; y < bh; y++) { o2[y * bw + x] = s / (2 * r + 1); s += t2[Math.min(bh - 1, y + r + 1) * bw + x] - t2[Math.max(0, y - r) * bw + x]; } }
      return o2; };
    const rb = Math.max(3, Math.round(Math.max(bw, bh) / 160)); const Ab = blur(blur(A, rb), rb);
    const c0 = new Float32Array(bw * bh * 4); for (let i = 0; i < bw * bh; i++) { const a = A[i] > 0.05 ? 1 : 0; for (let c = 0; c < 3; c++) c0[i * 4 + c] = px[i * 4 + c] * a; c0[i * 4 + 3] = a; }
    pullPush(bw, bh, c0);
    const out = new Uint8Array(bw * bh * 4); for (let i = 0; i < bw * bh; i++) { for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(Math.min(255, c0[i * 4 + c])); out[i * 4 + 3] = Math.round(255 * Math.min(1, Ab[i] * 1.15)); }
    const t = new THREE.DataTexture(out, bw, bh); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
    const dw = Math.max(4, bw >> 2), dh = Math.max(4, bh >> 2), rd = new THREE.WebGLRenderTarget(dw, dh); bakeMat.uniforms.uMode.value = 1; bakeScene.add(tmp);
    renderer.setRenderTarget(rd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(bakeScene, oc); renderer.setRenderTarget(null); bakeScene.remove(tmp); bakeMat.uniforms.uMode.value = 0;
    const dp = new Uint8Array(dw * dh * 4); renderer.readRenderTargetPixels(rd, 0, 0, dw, dh, dp); rd.dispose();
    for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) { let a = 0, n = 0; for (let yy = Math.floor(y * bh / dh); yy < Math.floor((y + 1) * bh / dh); yy++) for (let xx = Math.floor(x * bw / dw); xx < Math.floor((x + 1) * bw / dw); xx++) { a += Ab[yy * bw + xx]; n++; }
      const i = (y * dw + x) * 4; dp[i + 2] = Math.round(255 * Math.min(1, 1.15 * a / Math.max(1, n))); dp[i + 3] = 255; }
    const den = new THREE.DataTexture(dp, dw, dh); den.minFilter = den.magFilter = THREE.LinearFilter; den.needsUpdate = true;
    BAKE_DATA[o.name] = { w: bw, h: bh, px: out, dw, dh, dp, cov };
    return { cov, tex: t, den }; };
  // bake resolution per family: ~picture density where the picture can supply it, capped for memory
  const RES = (o) => { const f = o.userData.fam, sz = bbox(o).getSize(new THREE.Vector3()); const ov = LAY.bake_res?.[o.name.replace(/_\d+$/, '')] ?? LAY.bake_res?.[f]; if (ov) return ov;   // r44: per-screen overrides
    if (f === 'tunnel') return /far/.test(o.name) ? [1024, 512] : [+(q.get('tunres') ?? 4096), 1024]; if (f === 'water') return [512, 1024]; if (f === 'pool') return sz.z > 6 ? [512, 1024] : [1024, 1024]; if (f === 'ring') return [2048, 128]; if (f === 'flume') return [256, 512];
    if (f === 'copper') return [256, 256]; if (f === 'funnel') return [2048, 512]; if (f === 'wall') return [2048, 512]; return [128, 128]; };
  const all = []; world.traverse((o) => { if (o.isMesh && o.name !== 'drum_end' && o.userData.fam !== 'foam' && o.userData.fam !== 'arrow' && !tplOnly(o.name)) all.push(o); });
  const tStart = performance.now();
  for (const o of all) { const [bw, bh] = RES(o); const r = bakeOne(o, bw, bh); BAKE_STATS[o.name] = +r.cov.toFixed(3);
    if (r.tex) { o.material.uniforms.uBake.value = r.tex; o.material.uniforms.uDen.value = r.den; o.material.uniforms.uBakeOn.value = 1; o.userData.bakeCov = r.cov; } }
  // r43: repeated furniture without a template step (?tpl=0): the best-seen instance is the template for the instances no picture showed well
  if (q.get('tpl') === '0') for (const fam of ['ring', 'tunnel']) {
    const L = all.filter((o) => o.userData.fam === fam && !/far/.test(o.name)); const best = L.reduce((b, o) => ((o.userData.bakeCov ?? 0) > (b?.userData.bakeCov ?? 0) ? o : b), null);
    if (!best || !best.material.uniforms.uBake.value) continue;
    for (const o of L) if ((o.userData.bakeCov ?? 0) < 0.05) { for (const k of ['uBake', 'uDen']) o.material.uniforms[k].value = best.material.uniforms[k].value; o.material.uniforms.uBakeOn.value = 1; o.userData.template = best.name; BAKE_DATA[o.name] = { template: best.name }; }
  }
  BAKE_STATS._ms = Math.round(performance.now() - tStart);

  // ------------------------------------------------------------------------------------------------ 2. artwork-sampled templates
  const TPL = {};
  const t1 = performance.now();
  if (q.get('tpl') !== '0') {
    // fusion material: same picture lookup; the best picture sample per template texel wins through the depth test (depth = 1 - quality)
    const fuseUni = { ...uni, uMap: { value: 0 }, uTube: { value: new THREE.Vector4(0, 1, 0, 0) }, uStrip: { value: new THREE.Vector4(0, 1, 0, 1) }, uK: { value: 0 } };
    const fuseMat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, depthTest: true, depthWrite: true, depthFunc: THREE.LessDepth, uniforms: fuseUni,
      // uMap 0: the mesh's own UVs; 1: tube period (u = mesh u, v = (zr0 - local z) / period - k); 2: flow strip (u = mesh u, v = (d - d0) / len)
      vertexShader: `uniform float uMap; uniform vec4 uTube; uniform vec4 uStrip; uniform float uK; varying vec3 vW;
        void main(){ vW = (modelMatrix * vec4(position, 1.0)).xyz; vec2 t = uv;
          if (uMap > 1.5) { float d = uStrip.z + (1.0 - uv.y) * uStrip.w; t = vec2(uv.x, (d - uStrip.x) / uStrip.y); }
          else if (uMap > 0.5) { t = vec2(uv.x, (uTube.x - position.z) / uTube.y - uK); }
          gl_Position = vec4(t * 2.0 - 1.0, 0.5, 1.0); }`,
      fragmentShader: `${LOOK_GLSL(decl)}
        void main(){ float bq = 0.0; vec4 best = vec4(0.0);
${bodyQ}          if (bq <= 0.0) discard;
          gl_FragColor = vec4(best.rgb, 1.0); gl_FragDepth = 1.0 - bq / (bq + 60.0); }` });
    const fuse = (meshes, bw, bh, draws) => {   // draws(o) -> [{map, tube, strip, k}] per mesh
      const rt = new THREE.WebGLRenderTarget(bw, bh, { depthBuffer: true }); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true);
      for (const o of meshes) { const tmp = new THREE.Mesh(o.geometry, fuseMat); tmp.matrixAutoUpdate = false; o.updateWorldMatrix(true, false); tmp.matrix.copy(o.matrixWorld); tmp.frustumCulled = false; bakeScene.add(tmp);
        for (const d of draws(o)) { fuseUni.uMap.value = d.map; if (d.tube) fuseUni.uTube.value.set(...d.tube); if (d.strip) fuseUni.uStrip.value.set(...d.strip); fuseUni.uK.value = d.k ?? 0; renderer.render(bakeScene, oc); }
        bakeScene.remove(tmp); }
      renderer.setRenderTarget(null); const px = new Uint8Array(bw * bh * 4); renderer.readRenderTargetPixels(rt, 0, 0, bw, bh, px); rt.dispose(); return px; };
    const finish = (fam, bw, bh, px, extra) => {
      let cov = 0; for (let i = 3; i < px.length; i += 4) cov += px[i] > 127 ? 1 : 0; cov /= bw * bh; if (cov < 0.01) return null;
      const c0 = new Float32Array(bw * bh * 4); for (let i = 0; i < bw * bh; i++) { const a = px[i * 4 + 3] > 127 ? 1 : 0; for (let c = 0; c < 3; c++) c0[i * 4 + c] = px[i * 4 + c] * a; c0[i * 4 + 3] = a; }
      pullPush(bw, bh, c0); const out = new Uint8Array(bw * bh * 4); for (let i = 0; i < bw * bh; i++) { for (let c = 0; c < 3; c++) out[i * 4 + c] = Math.round(Math.min(255, c0[i * 4 + c])); out[i * 4 + 3] = 255; }
      TPL[fam] = { w: bw, h: bh, px: out, cov: +cov.toFixed(3), ...extra }; return TPL[fam]; };
    const fams = (f) => { const L = []; world.traverse((o) => { if (o.isMesh && o.userData.fam === f) L.push(o); }); return L; };
    // ring + copper: fused in their shared UV layout
    const rings = fams('ring').filter((o) => o.name !== 'ring_mouth'); if (rings.length) finish('ring', 2048, 128, fuse(rings, 2048, 128, () => [{ map: 0 }]), { map: 'uv' });
    const trays = fams('copper').filter((o) => !tplOnly(o.name)); if (trays.length) finish('copper', 256, 256, fuse(trays, 256, 256, () => [{ map: 0 }]), { map: 'uv' });
    // tunnel: one ring period, phase-locked to the uniformly spaced rings (the last painted ring); u = the mesh's own u around the drum
    const D = LAY.drum, RG = LAY.rings;
    if (D && RG && LAY.tunnel_style !== 'gold') {
      const per = RG.spacing, zr = [...RG.z].filter((z) => z < D.z0 && z > D.z1); const zr0 = zr.length ? Math.min(...zr) : D.z0;
      const tubes = fams('tunnel').filter((o) => /^tunnel_/.test(o.name)); const TW = +(q.get('tplw') ?? 2048), TH = Math.max(256, Math.min(1024, Math.round(TW * per / (2 * Math.PI * D.r))));
      const px = fuse(tubes, TW, TH, (o) => { const bb = bbox(o); const kA = Math.floor((zr0 - bb.max.z) / per) - 1, kB = Math.ceil((zr0 - bb.min.z) / per) + 1; const L = []; for (let k = kA; k <= kB; k++) L.push({ map: 1, tube: [zr0, per, 0, 0], k }); return L; });
      finish('tunnel', TW, TH, px, { map: 'tube', zr0, period: per });
    }
    // flow swatches: the sharpest window of each water family along the flow, made seamless (cross-faded overlap of 25 %)
    const strip = (fam, segInfo, d0, len, bw, bh) => {
      const ov = 0.25, H2 = Math.round(bh * (1 + ov)); const meshes = fams(fam).filter((o) => segInfo(o));
      if (!meshes.length) return;
      const px = fuse(meshes, bw, H2, (o) => { const s = segInfo(o); return [{ map: 2, strip: [d0, len * (1 + ov), s[0], s[1]] }]; });
      const T = finish(fam + '_tmp', bw, H2, px, {}); if (!T) return; delete TPL[fam + '_tmp'];
      const out = new Uint8Array(bw * bh * 4), Ho = H2 - bh;   // rows [0, Ho) blend with rows [bh, H2): seamless when v wraps at len
      for (let y = 0; y < bh; y++) { const k = y < Ho ? y / Ho : 1; for (let x = 0; x < bw; x++) { const i = (y * bw + x) * 4, j = ((y + bh) * bw + x) * 4;
        for (let c = 0; c < 3; c++) out[i + c] = y < Ho ? Math.round(T.px[i + c] * k + T.px[j + c] * (1 - k)) : T.px[i + c]; out[i + 3] = 255; } }
      TPL[fam] = { w: bw, h: bh, px: out, cov: T.cov, map: 'strip', d0, len };
    };
    const RT_ = LAY.route, RLEN = (RT_.points.length - 1) * RT_.ds, nW = fams('water').length || 1, segW = RLEN / nW;
    const sRef = LAY.cams[0].s_ref ?? 0, ahead = LAY.benny?.ahead ?? 0;
    const sw = LAY.templates?.water ?? {}; const wd0 = sRef + ahead + (sw.from ?? 0.35), wlen = sw.len ?? Math.max(1.2, Math.min(3.0, RT_.width * 1.6));
    strip('water', (o) => { const k = +o.name.split('_').pop(); return isFinite(k) ? [k * segW, segW] : null; }, wd0, wlen, 512, Math.round(512 * wlen / Math.max(0.3, RT_.width)));
    const fl = LAY.templates?.flume ?? {}; const nF = fams('flume').length || 1, segF = RLEN / nF;
    strip('flume', (o) => { const k = +o.name.split('_').pop(); return isFinite(k) ? [k * segF, segF] : null; }, sRef + ahead + (fl.from ?? 0.2), fl.len ?? wlen, 256, 512);
    if (D) { const pl = LAY.templates?.pool ?? {}; const pz0 = -(LAY.cams[0].pos[2]) + (pl.from ?? 1.0), plen = pl.len ?? 3.0;   // pool: d = -z
      strip('pool', (o) => { if (!/^pool_\d/.test(o.name)) return null; const bb = bbox(o); return [-bb.max.z, bb.max.z - bb.min.z]; }, pz0, plen, 1024, 1024); }
  }
  BAKE_STATS._tpl_ms = Math.round(performance.now() - t1);
  DEP.forEach((d) => d.dispose());
  for (const [k, T] of Object.entries(TPL)) { BAKE_STATS['tpl_' + k] = T.cov; T.tex = dataTex(THREE, T.px, T.w, T.h); }
  return { BAKE_STATS, BAKE_DATA, TPL };
}

export const dataTex = (THREE, px, w, h) => { const t = new THREE.DataTexture(px, w, h); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true; return t; };

// pixels (bottom-up rows, as read from the GPU) -> data URL
export const toDataURL = (w, h, px, type = 'image/png', qual = 0.9) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), im = g.createImageData(w, h);
  for (let y = 0; y < h; y++) im.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4); g.putImageData(im, 0, 0); return c.toDataURL(type, qual); };

export const exportBake = (BAKE_DATA, name, q) => { const d = BAKE_DATA[name]; if (!d) return null; if (d.template) return { template: d.template };
  return { bake: toDataURL(d.w, d.h, d.px, 'image/jpeg', +(q.get('jpegq') ?? 0.96)), den: toDataURL(d.dw, d.dh, d.dp), cov: +d.cov.toFixed(3) }; };   // app bake quality (0.9 cost 2.4 points)

export const exportTemplates = (TPL, q) => Object.fromEntries(Object.entries(TPL).map(([k, T]) => [k, { img: toDataURL(T.w, T.h, T.px, 'image/jpeg', +(q.get('jpegq') ?? 0.96)),
  meta: Object.fromEntries(Object.entries(T).filter(([kk]) => !['px', 'tex'].includes(kk))) }]));

// templates from a pre-baked folder (manifest.templates) -> { fam: { tex, ...meta } }
export async function loadTemplates(THREE, tl, MANI, base = 'baked/') {
  const out = {};
  await Promise.all(Object.entries(MANI?.templates ?? {}).map(async ([k, m]) => { const t = await tl.loadAsync(base + m.file); t.colorSpace = THREE.NoColorSpace;   // default flipY: same orientation as the in-page DataTexture
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true; out[k] = { ...m, tex: t }; }));
  return out;
}

// give every scenery / water material its template (the page's materials expose uTpl / uTplOn / uTplMap / uTube or uSw / uSwOn / uSwGeo)
export function applyTemplates(THREE, meshes, TPL) {
  let n = 0;
  for (const o of meshes) { const u = o.material?.uniforms; if (!u) continue; const f = o.userData.fam; const T = TPL[f]; if (!T) continue;
    if (u.uTpl && (f === 'ring' || f === 'copper' || f === 'tunnel')) { if (f === 'tunnel' && /^tunnelfar_/.test(o.name) && !T.zr0) continue;
      u.uTpl.value = T.tex; u.uTplOn.value = 1; u.uTplMap.value = T.map === 'tube' ? 1 : 0; if (T.map === 'tube') u.uTube.value.set(T.zr0, T.period, 0, 0); n++; }
    else if (u.uSw && (f === 'water' || f === 'pool' || f === 'flume')) { u.uSw.value = T.tex; u.uSwOn.value = 1; u.uSwGeo.value.set(T.d0, T.len, 0, 0); n++; } }
  return n;
}

// painted foam: bright, low-saturation picture cells outside the game-drawn mask -> a ray from the fitted camera -> the first real water
// surface it hits -> a lumpy 3D dome in the painted colour (moved here from screen.html: it is part of the bake product)
export async function foamFromPicture({ THREE, LAY, CAMS, MESH }) {
  const FOAM = [];
  const loadImg = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
  const [img, mimg] = await Promise.all([loadImg('ref_0.png'), loadImg(LAY.cams[0].mask)]);
  if (!img || !mimg) return FOAM;
  const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const g = cv.getContext('2d'); g.drawImage(img, 0, 0); const D = g.getImageData(0, 0, img.width, img.height).data;
  const mc = document.createElement('canvas'); mc.width = img.width; mc.height = img.height; const mg = mc.getContext('2d'); mg.drawImage(mimg, 0, 0, img.width, img.height); const MD = mg.getImageData(0, 0, img.width, img.height).data;
  const cam = CAMS[0], rc = new THREE.Raycaster(), surf = MESH.filter((o) => ['water', 'pool', 'flume'].includes(o.userData.fam)), all = MESH.filter((o) => o.userData.fam !== 'foam'), C = 10;
  for (let y = (LAY.hud_rows ?? 210); y < img.height - C; y += C) for (let x = 0; x < img.width - C; x += C) { let n = 0, r = 0, gg = 0, b = 0;
    for (let yy = y; yy < y + C; yy += 2) for (let xx = x; xx < x + C; xx += 2) { const i = (yy * img.width + xx) * 4, mx = Math.max(D[i], D[i + 1], D[i + 2]), mn = Math.min(D[i], D[i + 1], D[i + 2]);
      if (MD[i] < 128 && mx > 224 && mx - mn < 52) { n++; r += D[i]; gg += D[i + 1]; b += D[i + 2]; } }
    if (n < 18) continue;   // >= 72 % of the cell is painted foam
    rc.setFromCamera(new THREE.Vector2(((x + C / 2) / img.width) * 2 - 1, -((y + C / 2) / img.height) * 2 + 1), cam); const h = rc.intersectObjects(all, false)[0];
    if (!h || !surf.includes(h.object) || h.distance > 14) continue;
    const wsz = C * h.distance / (cam.userData.focal_px ?? LAY.focal_px);
    FOAM.push([h.point.x, h.point.y, h.point.z, Math.max(0.035, wsz * 0.9), +(r / n / 255).toFixed(3), +(gg / n / 255).toFixed(3), +(b / n / 255).toFixed(3)]); }
  return FOAM;
}
