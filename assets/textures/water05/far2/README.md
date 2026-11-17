# far2 — exact layer E with mirror-filled gaps (`?projgap05=1`, on with `?match05=1`)

`proj05_E.png` = `python3 -I tools/proj05/bake.py <probe> qa/pilot05/proj/target <out> far gapfill` (2026-11-17, session
018Sg3AU; probe: `node scripts/proj05-probe.mjs --q='proj05=1' --raw=<dir>`). Same as `../far1/proj05_E.png` except the
72,607 texels the locked eye never saw (wave back slopes, gaps of <= 100 rows along s) are filled with the approved texture
mirrored from both gap edges. Not one texel that held approved data changed colour. F and the LUT are byte-identical to
far1 and are still loaded from there.
