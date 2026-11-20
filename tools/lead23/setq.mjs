// usage: node setq.mjs "<base query>" "<overrides a=1&b=2>"  -> base with each key replaced in place (or appended)
const [b, o] = process.argv.slice(2); const p = new URLSearchParams(b);
for (const [k, v] of new URLSearchParams(o)) p.set(k, v);
process.stdout.write(p.toString());
