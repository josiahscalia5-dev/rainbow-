// controls.js -- Screen 05 swipe controls for play3.html (installed by the "// [controls]" hook lines there).
// Lanes (swipe left / right), leap (swipe up), dive (swipe down), coins in the side lanes and in the air,
// natural swim animation (stroke roll, faster paddling while changing lanes, lean / yaw into the move, pom-pom inertia),
// splash + droplets + bubbles on leaving / entering the water, and the follow-camera offsets.
// Everything is driven by the game clock passed to window.step(t, dt, ...) so tests stay deterministic.
// Benny faces +t (away from the camera, the approved picture shows his back); his model +x is the river's right (+r).

export const TUNING = {
  LANE: 0.22,          // lateral offset of the side lanes (world units; river half-width ~0.30-0.35)
  LAT_MAX: 0.26,       // hard clamp of his lateral offset (keeps him in the water)
  LANE_OMEGA: 16,      // critically damped lane spring: ~95 % of a lane change in 0.28 s, no overshoot
  LANE_BUSY: 0.16,     // a lane change blocks the next move for this long (then the queued move starts)
  LEAN_K: 0.2,         // bank angle (rad) per unit lateral speed (peak lateral speed ~1.3 u/s -> ~0.26 rad)
  LEAN_MAX: 0.3,
  YAW_K: 0.12,         // body turns toward the move (rad per u/s)
  ROLL_STROKE: 0.045,  // body roll with each paddle stroke (rad)
  PADDLE_BOOST: 0.9,   // paddle-rate increase at full lateral speed (x1.9)
  LEAP_T: 0.62,        // leap duration (s)
  LEAP_FRAC: 0.6,      // leap peak as a fraction of his full height
  DIVE_DOWN: 0.2, DIVE_HOLD: 0.42, DIVE_UP: 0.26, // dive phases (s)
  DIVE_FRAC: 0.8,      // fraction of his height under the surface at the bottom of the dive (rest: 0.22)
  PITCH_K: 0.13,       // nose-up / nose-down per unit vertical speed (rad per u/s)
  PITCH_MAX: 0.28,
  CAM_LAT_K: 0.5, CAM_LAT_MAX: 0.12, CAM_LAT_OMEGA: 6,      // camera follows lanes by 50 %, clamped (never into the walls)
  CAM_H_K: 0.35, CAM_H_DIVE_K: 0.08, CAM_H_OMEGA: 7.5, CAM_H_MIN: -0.03, CAM_H_MAX: 0.12, // camera follows leaps by 35 %
  SWIPE_PX: 30,        // swipe threshold (CSS px)
  COIN_R: 0.13,        // coin pick-up radius around his body segment (3D)
  BODY_LO: 0.06, BODY_HI: 0.30, // body segment above his water point (world units, scales with height)
};

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (e0, e1, x) => { const k = clamp((x - e0) / (e1 - e0), 0, 1); return k * k * (3 - 2 * k); };
// exact critically damped spring step (stable for any dt, no overshoot from rest)
function cds(o, target, omega, dt) {
  const y = o.x - target, j = o.v + omega * y, e = Math.exp(-omega * dt);
  o.x = target + (y + j * dt) * e; o.v = (o.v - omega * j * dt) * e; return o.x;
}
// damped spring driven by an external acceleration (pom-pom inertia), small fixed substeps
function dspring(o, omega, zeta, accel, dt) {
  const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
  for (let i = 0; i < n; i++) { o.v += (-omega * omega * o.x - 2 * zeta * omega * o.v + accel) * h; o.x += o.v * h; }
  return o.x;
}

export function installControls(ctx) {
  const { THREE, canvas, q, at, frameAt, coins, scene, U, bmat, benny, splash, splashTex, bubTex, coinTex, coinD, bennyFullH, pxW, coinEl, getS, getCoins, render } = ctx;
  const P = { ...TUNING };
  for (const k of Object.keys(P)) { const v = q.get('c_' + k); if (v != null && v !== '' && !isNaN(+v)) P[k] = +v; } // URL tuning, e.g. ?c_LANE=0.2
  const LEAP_H = P.LEAP_FRAC * bennyFullH, DIVE_D = (P.DIVE_FRAC - 0.22) * bennyFullH;
  const DIVE_T = P.DIVE_DOWN + P.DIVE_HOLD + P.DIVE_UP;
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), Zv = new THREE.Vector3(0, 0, 1);
  const qa = new THREE.Quaternion(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

  // ---------------- state ----------------
  const S = {
    clock: 0, swimClock: 0, lane: 0,
    lat: { x: 0, v: 0 }, alat: 0,
    h: 0, vh: 0, ah: 0,
    pitch: { x: 0, v: 0 }, lean: { x: 0, v: 0 }, yaw: { x: 0, v: 0 },
    pomSide: { x: 0, v: 0 }, pomFwd: { x: 0, v: 0 },
    camLat: { x: 0, v: 0 }, camH: { x: 0, v: 0 },
    move: null, queued: null, busyUntil: 0, swim: 1, roll: 0, diveK: 0,
    hudPulse: 0, picked: 0, lastPick: null,
  };
  const c = { lat: 0, h: 0, camLat: 0, camH: 0 }; // read by play3.html each step
  let F = null, nNow = new THREE.Vector3(0, 1, 0);

  // ---------------- input: real touch swipes, mouse / pen drags, keyboard, test hook ----------------
  const log = []; const input = { log, swipe: (dir) => request(dir, 'api') };
  window.input = input;
  function request(dir, src) {
    if (!['left', 'right', 'up', 'down'].includes(dir)) return false;
    log.push({ dir, src, clock: +S.clock.toFixed(3) });
    if (S.move || S.clock < S.busyUntil) { S.queued = dir; return true; } // one move at a time, queue at most one (latest wins)
    start(dir); return true;
  }
  if (canvas) {
    canvas.style.touchAction = 'none';
    const g = { id: null, x: 0, y: 0, fired: false };
    const begin = (id, x, y) => { g.id = id; g.x = x; g.y = y; g.fired = false; };
    const moveTo = (x, y, src) => {
      if (g.id === null || g.fired) return;
      const dx = x - g.x, dy = y - g.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < P.SWIPE_PX) return;
      g.fired = true; // fire as soon as the threshold is crossed (responsive), once per gesture
      request(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'), src);
    };
    const end = (x, y, src) => { if (x != null) moveTo(x, y, src); g.id = null; };
    canvas.addEventListener('touchstart', (e) => { const t = e.changedTouches[0]; begin(t.identifier, t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { for (const t of e.changedTouches) if (t.identifier === g.id) moveTo(t.clientX, t.clientY, 'touch'); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchend', (e) => { for (const t of e.changedTouches) if (t.identifier === g.id) end(t.clientX, t.clientY, 'touch'); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchcancel', () => { g.id = null; });
    // mouse / pen drags (touch pointers are handled by the touch events above, so a finger never fires twice)
    canvas.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') begin('p' + e.pointerId, e.clientX, e.clientY); });
    canvas.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' && g.id === 'p' + e.pointerId) moveTo(e.clientX, e.clientY, e.pointerType); });
    canvas.addEventListener('pointerup', (e) => { if (e.pointerType !== 'touch' && g.id === 'p' + e.pointerId) end(e.clientX, e.clientY, e.pointerType); });
  }
  const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down' };
  window.addEventListener('keydown', (e) => { const d = KEYS[e.code]; if (!d || e.repeat) return; e.preventDefault(); request(d, 'key'); });

  function start(dir) {
    if (dir === 'left' || dir === 'right') {
      const nl = clamp(S.lane + (dir === 'left' ? -1 : 1), -1, 1);
      if (nl === S.lane) { S.pomSide.v += (dir === 'left' ? 1 : -1) * 1.2; return; } // at the river edge: only a little wobble
      S.lane = nl; S.busyUntil = S.clock + P.LANE_BUSY; return;
    }
    S.move = { kind: dir === 'up' ? 'leap' : 'dive', t0: S.clock, fx: 0 };
  }

  // ---------------- coins in the side lanes and in the air (same sprites / pop as the water line) ----------------
  const addCoin = (s, lat, hAir) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: coinTex, toneMapped: false, transparent: true, alphaTest: 0.35, depthWrite: false }));
    sp.scale.set(coinD * 1.15, coinD * 1.15, 1);
    const Fs = frameAt(s); at(s, sp.position).addScaledVector(Fs.r, lat).addScaledVector(Fs.n, coinD * 0.75 + hAir);
    sp.renderOrder = 10; scene.add(sp); coins.push({ s, lat, h: hAir, sp, got: -1, kind: hAir > 0 ? 'air' : 'lane' });
  };
  // air arcs over the centre lane: only reachable with a leap (the top coin sits ~0.5 above the water, his head ~0.36)
  const AIR0 = 0.47 - coinD * 0.75;
  for (const s0 of [3.1, 6.7, 10.3]) { addCoin(s0 - 0.15, 0, AIR0); addCoin(s0, 0, AIR0 + 0.06); addCoin(s0 + 0.15, 0, AIR0); }
  // side-lane rows
  for (const [s0, lane] of [[1.6, -1], [4.4, 1], [8.0, -1], [11.6, 1]]) for (let i = 0; i < 3; i++) addCoin(s0 + i * 0.3, lane * P.LANE, 0);

  // ---------------- water effects: leap / dive splashes, droplets, dive bubbles ----------------
  const fxSplash = [];
  for (let i = 0; i < 3; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: splashTex, toneMapped: false, transparent: true, depthWrite: false })); sp.renderOrder = 5; sp.visible = false; scene.add(sp); fxSplash.push({ sp, t0: -1, size: 1 }); }
  const drops = [];
  for (let i = 0; i < 36; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, toneMapped: false, transparent: true, depthWrite: false })); sp.renderOrder = 8; sp.visible = false; scene.add(sp); drops.push({ sp, life: 0, age: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), size: 0.03, g: 0 }); }
  let rs = 987654; const rnd = () => ((rs = (rs * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  let dropNext = 0;
  const spawnDrop = (p, v, size, life, gravity) => { const d = drops[dropNext]; dropNext = (dropNext + 1) % drops.length; d.p.copy(p); d.v.copy(v); d.size = size; d.life = life; d.age = 0; d.g = gravity; d.sp.visible = true; };
  const waterPt = new THREE.Vector3();
  function burst(size, nDrops, speed) {
    if (!F) return;
    const fs = fxSplash.find((f) => f.t0 < 0 || S.clock - f.t0 > 0.5) || fxSplash[0];
    fs.t0 = S.clock; fs.size = size; fs.sp.visible = true; fs.sp.position.copy(waterPt).addScaledVector(F.n, -0.012); fs.sp.material.rotation = (rnd() - 0.5) * 0.3;
    for (let i = 0; i < nDrops; i++) {
      const a = (i / nDrops) * Math.PI * 2 + rnd() * 0.5, out = 0.25 + rnd() * 0.35;
      v1.copy(F.n).multiplyScalar(0.7 + rnd() * 0.7).addScaledVector(F.r, Math.cos(a) * out).addScaledVector(F.t, speed * 0.75 + Math.sin(a) * out * 0.6);
      v2.copy(waterPt).addScaledVector(F.r, Math.cos(a) * 0.12).addScaledVector(F.n, 0.01);
      spawnDrop(v2, v1, 0.014 + rnd() * 0.022, 0.42 + rnd() * 0.2, 3.6);
    }
  }

  // ---------------- Benny material: underwater tint while diving (0 at rest, so the approved look is unchanged) ----------------
  U.uDive = { value: 0 }; U.uWater = { value: new THREE.Vector4(0, 1, 0, 0) };
  const prevCompile = bmat.onBeforeCompile;
  bmat.onBeforeCompile = (sh, r) => {
    prevCompile(sh, r); Object.assign(sh.uniforms, { uDive: U.uDive, uWater: U.uWater });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vB31W;').replace('#include <project_vertex>', '#include <project_vertex>\nvB31W = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vB31W; uniform float uDive; uniform vec4 uWater;')
      .replace('#include <fog_fragment>', `{ float b31d = -(dot(uWater.xyz, vB31W) + uWater.w); float b31k = uDive * smoothstep(0.0, 0.05, b31d);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.20, 0.66, 0.86) * (0.75 + 0.25 * gl_FragColor.rgb), b31k * 0.7); }
      #include <fog_fragment>`);
  };
  bmat.needsUpdate = true;

  // ---------------- per-step update (called first in window.step) ----------------
  function update(t, dt) {
    S.clock = t;
    // finished moves -> start the queued one
    if (S.move) {
      const k = S.clock - S.move.t0;
      if (S.move.kind === 'leap' && k >= P.LEAP_T) { S.move = null; S.landing = true; }
      else if (S.move.kind === 'dive' && k >= DIVE_T) S.move = null;
    }
    if (!S.move && S.queued && S.clock >= S.busyUntil) { const d = S.queued; S.queued = null; start(d); }

    // lanes: critically damped spring toward the lane centre
    const vPrev = S.lat.v;
    cds(S.lat, S.lane * P.LANE, P.LANE_OMEGA, dt); S.lat.x = clamp(S.lat.x, -P.LAT_MAX, P.LAT_MAX);
    S.alat = dt > 0 ? (S.lat.v - vPrev) / dt : 0;

    // vertical: leap arc (ballistic parabola) / dive (smooth sink, hold, resurface)
    const hPrev = S.h, vhPrev = S.vh; let h = 0, tuck = 0;
    if (S.move && S.move.kind === 'leap') {
      const tau = clamp((S.clock - S.move.t0) / P.LEAP_T, 0, 1);
      h = LEAP_H * 4 * tau * (1 - tau); tuck = Math.sin(Math.PI * tau) ** 2;
    } else if (S.move && S.move.kind === 'dive') {
      const k = S.clock - S.move.t0;
      h = -DIVE_D * (smooth(0, P.DIVE_DOWN, k) - smooth(P.DIVE_DOWN + P.DIVE_HOLD, DIVE_T, k));
    }
    S.h = h; S.vh = dt > 0 ? (h - hPrev) / dt : 0; S.ah = dt > 0 ? (S.vh - vhPrev) / dt : 0;
    S.diveK = clamp(-h / (DIVE_D * 0.5), 0, 1);

    // body attitude: bank + yaw into the lateral move, nose follows the vertical speed (up on the way up, down on the way down)
    const vl = S.lat.v;
    cds(S.lean, clamp(vl * P.LEAN_K, -P.LEAN_MAX, P.LEAN_MAX), 22, dt);
    cds(S.yaw, clamp(-vl * P.YAW_K, -0.2, 0.2), 18, dt);
    cds(S.pitch, clamp(S.vh * P.PITCH_K, -P.PITCH_MAX, P.PITCH_MAX), 14, dt);

    // paddling: faster while changing lanes or diving, arms tucked at the top of a leap
    const latK = clamp(Math.abs(vl) / 1.0, 0, 1);
    S.swimClock += dt * (1 + P.PADDLE_BOOST * latK + 0.35 * S.diveK);
    S.swim = (1 + 0.15 * latK + 0.1 * S.diveK) * (1 - 0.7 * tuck);
    S.roll = P.ROLL_STROKE * Math.sin(S.swimClock * 7.5) * (1 - tuck);

    // pom-pom inertia: lags behind lateral and vertical accelerations, settles with a little wobble
    dspring(S.pomSide, 9, 0.32, clamp(S.alat, -80, 80) * 0.6, dt); S.pomSide.x = clamp(S.pomSide.x, -0.5, 0.5);
    dspring(S.pomFwd, 8, 0.3, clamp(S.ah, -60, 60) * 0.012, dt); S.pomFwd.x = clamp(S.pomFwd.x, -0.35, 0.35);

    // camera offsets: lanes by 50 %, leaps by 35 % (dives barely), both smoothed and clamped
    cds(S.camLat, clamp(S.lat.x * P.CAM_LAT_K, -P.CAM_LAT_MAX, P.CAM_LAT_MAX), P.CAM_LAT_OMEGA, dt);
    S.camLat.x = clamp(S.camLat.x, -P.CAM_LAT_MAX, P.CAM_LAT_MAX);
    cds(S.camH, h * (h > 0 ? P.CAM_H_K : P.CAM_H_DIVE_K), P.CAM_H_OMEGA, dt);
    S.camH.x = clamp(S.camH.x, P.CAM_H_MIN, P.CAM_H_MAX);

    c.lat = S.lat.x; c.h = S.h; c.camLat = S.camLat.x; c.camH = S.camH.x;
    return c;
  }

  // extra body rotations after play3 has set his path frame + river-bend lean (local axes: x = -r, y = n, z = t)
  function orient(quat) {
    quat.multiply(qa.setFromAxisAngle(Zv, S.lean.x + S.roll)); // + = top toward +r (bank into a move to the right)
    quat.multiply(qa.setFromAxisAngle(Y, S.yaw.x));            // facing (+t) turns toward the move
    quat.multiply(qa.setFromAxisAngle(X, -S.pitch.x));         // nose-up = top tilts back toward the camera
  }

  // shader uniforms (after play3's own line, which it overrides)
  function anim(bendLean) {
    U.uT.value = S.swimClock; U.uSwim.value = S.swim;
    U.uPom.value.set(Math.sin(S.clock * 5.0) * 0.06 + S.pomFwd.x - S.pitch.x * 0.5, (bendLean + S.lean.x) * 0.4 + S.pomSide.x);
  }

  // splash stays on the water surface; leap / dive splashes, droplets and bubbles; dive tint plane
  function water(Fr, speed, dt) {
    F = Fr; nNow.copy(F.n);
    waterPt.copy(benny.position).addScaledVector(F.n, -S.h);
    splash.position.addScaledVector(F.n, -S.h);
    const air = smooth(0.03, 0.12, S.h);
    splash.material.opacity = 1 - air;
    splash.scale.multiplyScalar(1 + 0.25 * S.diveK);
    splash.material.rotation -= S.lean.x * 0.6; // play3 sets -bendLean * 0.6; add the lane bank the same way
    U.uDive.value = S.diveK; U.uWater.value.set(F.n.x, F.n.y, F.n.z, -F.n.dot(waterPt));
    const m = S.move;
    if (m && m.fx === 0) { m.fx = 1; if (m.kind === 'leap') burst(0.85, 12, speed); else burst(0.7, 8, speed); }
    if (S.landing) { S.landing = false; burst(1.0, 14, speed); }
    if (m && m.kind === 'dive') {
      const k = S.clock - m.t0;
      if (m.fx === 1 && k > P.DIVE_DOWN + P.DIVE_HOLD + P.DIVE_UP * 0.55) { m.fx = 2; burst(0.9, 12, speed); } // resurfacing splash
      // bubbles rising around him while he is under
      m.bub = (m.bub ?? 0) + dt * 40 * S.diveK;
      while (m.bub >= 1) {
        m.bub -= 1;
        v2.copy(waterPt).addScaledVector(F.r, (rnd() - 0.5) * 0.3).addScaledVector(F.t, (rnd() - 0.3) * 0.12).addScaledVector(F.n, -0.03 + rnd() * 0.05);
        v1.copy(F.n).multiplyScalar(0.18 + rnd() * 0.2).addScaledVector(F.t, speed * 0.85).addScaledVector(F.r, (rnd() - 0.5) * 0.1);
        spawnDrop(v2, v1, 0.02 + rnd() * 0.03, 0.5 + rnd() * 0.3, -0.2);
      }
    }
    for (const fs of fxSplash) {
      if (fs.t0 < 0) continue; const k = (S.clock - fs.t0) / 0.45;
      if (k >= 1 || k < 0) { fs.sp.visible = false; fs.t0 = -1; continue; }
      const z = fs.size * (0.55 + 0.6 * Math.sqrt(k));
      fs.sp.scale.set(799 * pxW * 0.8 * z, 309 * pxW * 0.8 * z * (1.25 - 0.4 * k), 1); fs.sp.material.opacity = 0.95 * (1 - k * k);
    }
    for (const d of drops) {
      if (d.life <= 0) continue; d.age += dt;
      if (d.age >= d.life) { d.life = 0; d.sp.visible = false; continue; }
      d.v.addScaledVector(F.n, -d.g * dt); d.p.addScaledVector(d.v, dt); d.sp.position.copy(d.p);
      const k = d.age / d.life, z = d.size * (0.7 + 0.5 * k); d.sp.scale.set(z, z, 1); d.sp.material.opacity = 0.9 * Math.min(1, k * 6) * (1 - k * k);
    }
    // coins he missed (other lane / under a leap) shrink + sink away behind him instead of sliding huge past the camera;
    // the added lane / air coins grow in during the first 0.4 s of travel, so frame 0 stays exactly the approved picture.
    // (scale, not opacity: the coin material uses alphaTest 0.35, an opacity fade would pop)
    const sNow = getS();
    for (const k of coins) {
      if (k.got >= 0) continue;
      const gone = smooth(0.06, 0.36, sNow - k.s), grow = k.kind ? smooth(0, 0.4, sNow) : 1, z = grow * (1 - gone);
      if (!k.p0) k.p0 = k.sp.position.clone();
      k.sp.visible = z > 0.01; k.sp.scale.set(coinD * 1.15 * z, coinD * 1.15 * z, 1);
      k.sp.position.copy(k.p0).addScaledVector(F.n, -0.09 * gone);
    }
    // HUD coin counter pulse
    if (coinEl) { S.hudPulse = Math.max(0, S.hudPulse - dt * 4); coinEl.style.display = 'inline-block'; coinEl.style.transform = `scale(${(1 + 0.25 * Math.sin(Math.PI * S.hudPulse)).toFixed(3)})`; }
  }

  // 3D pick-up: coin centre within COIN_R of his body segment (water point + n * [BODY_LO, BODY_HI] + his height)
  function hits(coin) {
    const p = coin.sp.position;
    v1.copy(benny.position).addScaledVector(nNow, P.BODY_LO); v2.copy(benny.position).addScaledVector(nNow, P.BODY_HI);
    v3.subVectors(v2, v1); const k = clamp(v3.dot(v1.clone().negate().add(p)) / v3.lengthSq(), 0, 1);
    const d = v1.addScaledVector(v3, k).distanceTo(p);
    if (d < P.COIN_R) { S.hudPulse = 1; S.picked++; S.lastPick = { kind: coin.kind || 'water', s: +coin.s.toFixed(2), lat: coin.lat, clock: +S.clock.toFixed(3) }; return true; }
    return false;
  }

  function state() {
    const nGot = (k) => coins.filter((x) => x.got >= 0 && (x.kind || 'water') === k).length;
    return {
      s: +getS().toFixed(3), lane: S.lane, lat: +S.lat.x.toFixed(4), height: +S.h.toFixed(4), coins: getCoins(),
      move: S.move ? S.move.kind : (S.clock < S.busyUntil ? 'lane' : null), queued: S.queued,
      lean: +S.lean.x.toFixed(3), pitch: +S.pitch.x.toFixed(3), yaw: +S.yaw.x.toFixed(3), pom: +S.pomSide.x.toFixed(3),
      camLat: +S.camLat.x.toFixed(4), camH: +S.camH.x.toFixed(4), swim: +S.swim.toFixed(3),
      got: { water: nGot('water'), lane: nGot('lane'), air: nGot('air') }, lastPick: S.lastPick, swipes: log.length,
    };
  }
  window.state = state;

  // optional real-time loop for phones / desktop browsers: play3.html?live=1 (tests drive window.step themselves)
  if (q.get('live') === '1') {
    const speed = +(q.get('speed') ?? 1.4); let t0 = null, last = 0;
    const loop = (ts) => {
      requestAnimationFrame(loop);
      if (!window.ready) return;
      if (t0 === null) { t0 = ts; last = ts; }
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      window.step((ts - t0) / 1000, dt, 0, speed); render();
    };
    requestAnimationFrame(loop);
  }

  return { c, update, orient, anim, water, hits, state, P };
}
