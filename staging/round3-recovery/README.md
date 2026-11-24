# Round 3 recovery: helper files from the interrupted Shape stage (copied 2026-11-24 ~01:20 UTC)

The third Claude account hit its 5-hour limit at 20:02 local (01:02 UTC). That stopped round-3 run `wf_9320b9e1-c74` in
the middle of its Shape stage, while the river and tunnel lanes were working. These files lived only in that session's
temporary scratchpad (`%LOCALAPPDATA%\Temp\claude\fce4210eb4ca4b51\df1b2c26-...\scratchpad`), which Windows can clear on a
restart, so they were copied here unchanged (SHA-256 verified). They are read-only helpers that only read images and
print numbers or pictures. Nothing here is part of the Unity project.

| File | What it is |
|---|---|
| `river_layout_preview.ps1` | River lane (20:01): projects the river band and foam edges per course position `s` onto the approved image with the current gameplay camera. Use `-New 0` for the old layout and `-New 1` for the planned new one. This is the start of a "solve first, render once" fitter. |
| `layout_old.jpg`, `layout_new.jpg` | Its output: old and planned river layout drawn on the approved image. |
| `dbg.ps1` | River lane's last check. Prints the band and foam edges at s = 56-68 (the S-bend). |
| `world.ps1`, `rowclass.ps1`, `classify.ps1` | Row-by-row classification of the approved image (water / foam / wall) for the target numbers. |
| `profile.ps1`, `hline.ps1`, `vline.ps1`, `radial.ps1`, `bennyprof.ps1` | Colour profiles along a row, column or ray (edges, ring bands, Benny). |
| `patch.ps1`, `crop.ps1`, `zoomcrop.ps1`, `sbs2.ps1` | Crops, zooms and side-by-side helpers. |
| `Cam.cs` | The frame lane's camera projection math (864x1536, vFOV 62). |

The lanes' code edits are not here. Autosave already committed them: river = `1601007` (RainbowFoamBank.hlsl,
RainbowRiver.hlsl) plus FoamBank.cs and RiverMeshGenerator.cs in `9e132fe`; tunnel = `9e132fe` (EnvironmentBuilder.cs,
RainbowDrumWall.hlsl/.shader, RainbowGoldMetal.hlsl, RainbowThroatGlow.hlsl). Neither lane ran a test cycle on those edits.
Their cycles waited for the shared cycle lock, which the hung CLI-vs-MCP test held. So the edits are saved but UNTESTED.
