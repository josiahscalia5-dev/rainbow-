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
| 04 | 70.0 | 0.489 | 0.084 | — |
| 05 | 78.5 | 0.513 | 0.001 | — |
| 06 | 74.0 | 0.738 | -0.044 | — |
| 07 | 73.7 | 0.441 | -0.03 | — |
| 08 | 73.7 | 0.58 | -0.009 | — |
| 09 | 72.5 | 0.803 | -0.036 | — |
| 10 | 78.5 | 0.705 | -0.025 | girl identity region |
| 11 | 70.3 | 0.765 | 0.098 | girl identity region |
