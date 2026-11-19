#!/usr/bin/env python3
"""One-screen reference report: approved reference vs one or more labelled live captures.

    python3 -I scripts/screen_report.py 05 OUT_DIR PREV=qa/.../05.png NOW=qa/.../05.png

Writes into OUT_DIR (nothing else is touched; qa/report_metrics.json stays as it is):
  NN_side_by_side.png       REFERENCE | each capture (same height, labelled)
  NN_overlay_<LABEL>.png    50 % blend of the reference and that capture
  NN_highlight_<LABEL>.png  the capture with a transparent red tint where it differs most from the
                            reference (|ΔRGB| smoothed; tint alpha ∝ difference above a threshold)
  metrics.json / metrics.md raw numbers per capture: whole-frame mad / hue_corr / edge_corr (same
                            method as scripts/compare.py) and mad per horizontal band of the frame
These are crude, reproducible indicators, NOT a fidelity percentage.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
import compare as C  # noqa: E402  (reuses REFS, mask_for, hue_hist, corr, edges, label)

# horizontal bands in reference pixels (864x1536 portrait); names describe what the ref shows there
BANDS = {
    "05": [("hud", 0, 230), ("tunnel+VP", 230, 560), ("river mid", 560, 1000), ("Benny+near water", 1000, 1536)],
}
THRESH = 40.0  # |ΔRGB| mean below this is not highlighted


def metrics(ref: Image.Image, live: Image.Image, nn: str) -> dict:
    W, H = ref.size
    w4, h4 = W // 4, H // 4
    a = np.asarray(ref.resize((w4, h4), Image.BILINEAR)).astype(np.float32)
    b = np.asarray(live.resize((w4, h4), Image.BILINEAR)).astype(np.float32)
    m = C.mask_for(nn, w4, h4)
    diff = np.abs(a - b).mean(axis=2)
    w8, h8 = W // 8, H // 8
    ea = C.edges(ref.resize((w8, h8), Image.BILINEAR)); eb = C.edges(live.resize((w8, h8), Image.BILINEAR))
    m8 = C.mask_for(nn, w8, h8)
    out = {"mad": round(float(diff[m].mean()), 1),
           "hue_corr": round(C.corr(C.hue_hist(a.astype(np.uint8), m), C.hue_hist(b.astype(np.uint8), m)), 3),
           "edge_corr": round(C.corr(ea[m8], eb[m8]), 3), "bands": {}}
    for name, y0, y1 in BANDS.get(nn, []):
        r0, r1 = y0 * h4 // H, y1 * h4 // H
        out["bands"][name] = round(float(diff[r0:r1][m[r0:r1]].mean()), 1)
    return out


def highlight(ref: Image.Image, live: Image.Image) -> Image.Image:
    a = np.asarray(ref).astype(np.float32); b = np.asarray(live).astype(np.float32)
    d = Image.fromarray(np.clip(np.abs(a - b).mean(axis=2), 0, 255).astype(np.uint8))
    d = np.asarray(d.filter(ImageFilter.GaussianBlur(6))).astype(np.float32)
    alpha = np.clip((d - THRESH) / 80.0, 0, 1)[..., None] * 0.65
    red = np.array([255, 30, 60], np.float32)
    return Image.fromarray((b * (1 - alpha) + red * alpha).astype(np.uint8))


def main(argv: list[str]) -> int:
    nn, out = argv[0], Path(argv[1])
    caps = [a.split("=", 1) for a in argv[2:]]
    out.mkdir(parents=True, exist_ok=True)
    ref = Image.open(C.ROOT / "references" / C.REFS[nn]).convert("RGB")
    W, H = ref.size
    lives = [(lab, Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS), p) for lab, p in caps]
    sbs = Image.new("RGB", (W * (len(lives) + 1) + 16 * len(lives), H), (20, 0, 40))
    sbs.paste(C.label(ref.copy(), f"REFERENCE {nn}"), (0, 0))
    rows = {}
    for i, (lab, live, p) in enumerate(lives):
        sbs.paste(C.label(live.copy(), f"{lab} (live 3D)"), ((W + 16) * (i + 1), 0))
        Image.blend(ref, live, 0.5).save(out / f"{nn}_overlay_{lab}.png", optimize=True)
        highlight(ref, live).save(out / f"{nn}_highlight_{lab}.png", optimize=True)
        rows[lab] = {"file": p, **metrics(ref, live, nn)}
    sbs.save(out / f"{nn}_side_by_side.png", optimize=True)
    (out / "metrics.json").write_text(json.dumps(rows, indent=1) + "\n")
    bands = [b[0] for b in BANDS.get(nn, [])]
    md = [f"# Screen {nn}: reference vs live captures (raw indicators, not a fidelity %)", "",
          "mad = mean |ΔRGB| at 1/4 scale (lower = closer); hue_corr / edge_corr = −1…1 (higher = closer).", "",
          "| Capture | mad | hue_corr | edge_corr | " + " | ".join(f"mad {b}" for b in bands) + " |",
          "|---|---|---|---|" + "---|" * len(bands)]
    for lab, r in rows.items():
        md.append(f"| {lab} | {r['mad']} | {r['hue_corr']} | {r['edge_corr']} | "
                  + " | ".join(str(r['bands'][b]) for b in bands) + " |")
    (out / "metrics.md").write_text("\n".join(md) + "\n")
    print("\n".join(md))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
