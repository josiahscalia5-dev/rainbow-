# Screen 04 rebuilt with the screen kit (round 44, first build) — for the one connected world

Built by `bash tools/screenkit/setup_screen.sh 04 <ws>` (fit `tools/screenkit/screens/04/fit04.py`, masks `segment04.json`, Blender Geometry Nodes
`tools/screenkit/blender_kit.py` incl. the new r44 components: elliptical swirl bell-mouth `funnel_*`, wall `wall_*`, front pool `pool_front_*`,
mouth flange `ring_mouth`, game-drawn 3D arrows `arrow_*`). Screen 06's scene.glb is byte-identical after the kit changes.

| at the picture camera (compare_to_approved, unchanged 20-level threshold) | scenery within 20 levels | SSIM | colour look | sharpness |
|---|---|---|---|---|
| first build | 84.5 % | 0.768 | 0.974 | 0.70 |
| + no foam along the tube's water edges (one factor) | 86.2 % | 0.782 | 0.976 | 0.69 |
| + finer bakes (pool / funnel / wall) | **87.3 %** | 0.807 | 0.980 | 0.78 |
| + arrows tilted 55° (game-drawn, masked: does not change the score) | 87.3 % | 0.807 | 0.979 | 0.78 |
Plain-gray geometry (`?gray=1&sentinel=1`): 0 hole pixels at s = 1.2, 6, 16, 30. In motion: warm-gold ring tube code material (`tunnel_style: gold`)
where no painted pixel is sharp enough (no perforation slots — the approved 04 tunnel has none). Measured: tunnel radius 1.18 u (2.5 × Benny),
water 0.47 u below the axis, mouth 3.5 u ahead of the camera, Benny 0.47 u (same scale as Bubble Dash 0.47 u). Open: 87.3 → ≥ 90 %, deeper amber
gold in motion, the tunnel's far end becomes the connector into the Bubble Dash chamber (round-44 world).
