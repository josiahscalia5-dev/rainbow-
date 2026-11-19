# Reference vs live — reproducible metrics

Method: `scripts/compare.py` (Pillow/numpy). mad = mean |ΔRGB| at 1/4 scale (lower is closer);
hue_corr = 36-bin hue-histogram correlation of saturated pixels (−1…1, higher is closer);
edge_corr = Sobel edge-map correlation at 1/8 scale (−1…1, structure/composition indicator).
These are crude indicators, not a fidelity percentage. Girl-identity regions (01/10/11) and the
03 phone outline are masked.

| Screen | mad | hue_corr | edge_corr | masked |
|---|---|---|---|---|
| 01 | 61.3 | 0.524 | 0.04 | girl identity region |
| 02 | 68.6 | 0.689 | -0.004 | — |
| 03 | 66.1 | 0.419 | 0.008 | phone outline |
| 04 | 68.7 | 0.61 | 0.094 | — |
| 05 | 71.8 | 0.567 | -0.018 | — |
| 06 | 76.9 | 0.598 | -0.002 | — |
| 07 | 68.3 | 0.496 | -0.041 | — |
| 08 | 72.9 | 0.622 | -0.036 | — |
| 09 | 72.2 | 0.805 | -0.025 | — |
| 10 | 78.2 | 0.706 | -0.027 | girl identity region |
| 11 | 69.7 | 0.779 | 0.111 | girl identity region |
