// @ts-nocheck  (Node-only QA script run with vite-node; not part of the game build)
// r30 lead: route continuity WITH a query (the default `npm run test:continuity` runs without one). usage: Q='match06=1&...' npx vite-node tools/match06/r30_continuity.ts
(globalThis as unknown as { location: { search: string } }).location = { search: '?' + (process.env.Q ?? '') };
const { Course, validateContinuity } = await import('../../src/world/course');
const c = new Course();
const r = validateContinuity(c) as unknown as Record<string, unknown>;
const st = c.stages.map((s) => ({ id: s.id, s0: +s.s0.toFixed(2), len: +(s.s1 - s.s0).toFixed(2), y0: +c.sample(s.s0).pos.y.toFixed(2), y1: +c.sample(s.s1).pos.y.toFixed(2) }));
console.log(JSON.stringify({ query: process.env.Q, ok: r.ok, length: +c.length.toFixed(2), stages: st, report: JSON.stringify(r).slice(0, 900) }, null, 1));
export {};
