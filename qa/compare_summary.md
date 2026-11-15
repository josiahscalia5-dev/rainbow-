# Reference vs live — reproducible metrics

Method: `scripts/compare.py` (Pillow/numpy). mad = mean |ΔRGB| at 1/4 scale (lower is closer);
hue_corr = 36-bin hue-histogram correlation of saturated pixels (−1…1, higher is closer);
edge_corr = Sobel edge-map correlation at 1/8 scale (−1…1, structure/composition indicator).
These are crude indicators, not a fidelity percentage. Girl-identity regions (01/10/11) and the
03 phone outline are masked.

| Screen | mad | hue_corr | edge_corr | masked |
|---|---|---|---|---|
| 01 | 63.0 | 0.548 | 0.054 | girl identity region |
| 02 | 70.3 | 0.731 | -0.0 | — |
| 03 | 67.0 | 0.585 | 0.011 | phone outline |
| 04 | 72.1 | 0.64 | 0.069 | — |
| 05 | 78.5 | 0.513 | 0.001 | — |
| 06 | 74.5 | 0.746 | -0.012 | — |
| 07 | 75.1 | 0.487 | -0.005 | — |
| 08 | 76.5 | 0.553 | -0.013 | — |
| 09 | 73.1 | 0.789 | -0.051 | — |
| 10 | 79.1 | 0.704 | -0.018 | girl identity region |
| 11 | 70.3 | 0.765 | 0.098 | girl identity region |
