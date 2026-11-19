#!/usr/bin/env python3
"""Reference-vs-live comparison for the 11 locked screens.

For every NN in 01..11 with screenshots/NN.png present:
  qa/NN_side_by_side.png   reference | live (same height)
  qa/NN_overlay.png        50 % blend of reference and live (live resized to reference size)
  qa/NN_diff.png           per-pixel absolute difference heat map (masked areas greyed)
and qa/report_metrics.json + qa/compare_summary.md with REPRODUCIBLE metrics only:
  * mad      — mean absolute RGB difference (0–255) on 1/4-scale images, masked
  * hue_corr — correlation of 36-bin hue histograms (saturated pixels only), masked
  * edge_corr— correlation of Sobel edge-magnitude maps at 1/8 scale, masked
These are crude numeric indicators, NOT a "fidelity %"; they are reported as raw values.

Masks (excluded from metrics, drawn grey in the diff):
  * 01, 10, 11: the legacy human girl region — intentionally replaced by the official cartoon girl
  * 03: the decorative phone outline baked into the reference (outer 4 % border)
  * 01–11: nothing else.
Usage: python3 -I scripts/compare.py [NN ...] [--sheet OUT.png] [--live DIR]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
REFS = {
    "01": "01_inside_washer_girl_and_towel.png", "02": "02_mascot_tumbles_in_whirlpool.png",
    "03": "03_whirlpool_twirl.png", "04": "04_through_the_five_arrows.png", "05": "05_flow_into_the_current.png",
    "06": "06_crest_the_rinse_arch.png", "07": "07_dive_the_washer_tube.png", "08": "08_final_spin_chamber.png",
    "09": "09_ride_the_final_wave.png", "10": "10_slide_into_hiding.png", "11": "11_safely_home_final_victory.png",
}
# girl regions in reference pixel coords (x0, y0, x1, y1) — identity-only exception
GIRL_MASK = {"01": (500, 300, 680, 600), "10": (430, 230, 590, 470), "11": (150, 190, 700, 780)}


def mask_for(nn: str, w: int, h: int) -> np.ndarray:
    m = np.ones((h, w), dtype=bool)
    if nn in GIRL_MASK:
        x0, y0, x1, y1 = GIRL_MASK[nn]
        sx, sy = w / 864, h / 1536
        m[int(y0 * sy):int(y1 * sy), int(x0 * sx):int(x1 * sx)] = False
    if nn == "03":
        bx, by = int(0.04 * w), int(0.04 * h)
        m[:by, :] = m[-by:, :] = False
        m[:, :bx] = m[:, -bx:] = False
    return m


def hue_hist(a: np.ndarray, m: np.ndarray) -> np.ndarray:
    hsv = np.asarray(Image.fromarray(a).convert("HSV")).astype(np.float32)
    sel = m & (hsv[..., 1] > 60) & (hsv[..., 2] > 50)
    h, _ = np.histogram(hsv[..., 0][sel], bins=36, range=(0, 256))
    return h.astype(np.float64) / max(1, h.sum())


def corr(a: np.ndarray, b: np.ndarray) -> float:
    a = a - a.mean(); b = b - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / d) if d > 0 else 0.0


def edges(img: Image.Image) -> np.ndarray:
    g = np.asarray(img.convert("L").filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)
    gx = np.zeros_like(g); gy = np.zeros_like(g)
    gx[:, 1:-1] = g[:, 2:] - g[:, :-2]
    gy[1:-1, :] = g[2:, :] - g[:-2, :]
    return np.hypot(gx, gy)


def label(img: Image.Image, text: str) -> Image.Image:
    d = ImageDraw.Draw(img)
    try:
        f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", max(18, img.width // 28))
    except OSError:
        f = ImageFont.load_default()
    d.rectangle([0, 0, img.width, f.size + 14], fill=(20, 0, 40))
    d.text((10, 6), text, fill=(255, 230, 140), font=f)
    return img


def compare(nn: str, live_dir: Path) -> dict | None:
    live_p = live_dir / f"{nn}.png"
    if not live_p.exists():
        return None
    ref = Image.open(ROOT / "references" / REFS[nn]).convert("RGB")
    live = Image.open(live_p).convert("RGB")
    W, H = ref.size
    live_r = live.resize((W, H), Image.LANCZOS)
    out = ROOT / "qa"
    out.mkdir(exist_ok=True)
    # side by side
    sbs = Image.new("RGB", (W * 2 + 16, H), (20, 0, 40))
    sbs.paste(label(ref.copy(), f"REFERENCE {nn}"), (0, 0))
    sbs.paste(label(live_r.copy(), f"LIVE GAME {nn} (real-time 3D)"), (W + 16, 0))
    sbs.save(out / f"{nn}_side_by_side.png", optimize=True)
    # overlay
    Image.blend(ref, live_r, 0.5).save(out / f"{nn}_overlay.png", optimize=True)
    # metrics on 1/4 scale
    w4, h4 = W // 4, H // 4
    a = np.asarray(ref.resize((w4, h4), Image.BILINEAR)).astype(np.float32)
    b = np.asarray(live_r.resize((w4, h4), Image.BILINEAR)).astype(np.float32)
    m = mask_for(nn, w4, h4)
    diff = np.abs(a - b).mean(axis=2)
    mad = float(diff[m].mean())
    hc = corr(hue_hist(a.astype(np.uint8), m), hue_hist(b.astype(np.uint8), m))
    w8, h8 = W // 8, H // 8
    ea = edges(ref.resize((w8, h8), Image.BILINEAR)); eb = edges(live_r.resize((w8, h8), Image.BILINEAR))
    m8 = mask_for(nn, w8, h8)
    ec = corr(ea[m8], eb[m8])
    heat = np.clip(diff / 120.0, 0, 1)
    rgb = np.stack([heat * 255, (1 - np.abs(heat - 0.5) * 2) * 160, (1 - heat) * 255], axis=2).astype(np.uint8)
    rgb[~m] = (90, 90, 90)
    Image.fromarray(rgb).resize((W // 2, H // 2), Image.NEAREST).save(out / f"{nn}_diff.png", optimize=True)
    return {"id": nn, "mad": round(mad, 1), "hue_corr": round(hc, 3), "edge_corr": round(ec, 3),
            "masked": ("girl identity region" if nn in GIRL_MASK else "") + ("phone outline" if nn == "03" else "")}


def sheet(ids: list[str], live_dir: Path, out: Path, scale: float = 0.22):
    tiles = []
    for nn in ids:
        lp = live_dir / f"{nn}.png"
        if not lp.exists():
            continue
        ref = Image.open(ROOT / "references" / REFS[nn]).convert("RGB")
        live = Image.open(lp).convert("RGB").resize(ref.size)
        w, h = int(ref.width * scale), int(ref.height * scale)
        t = Image.new("RGB", (w * 2 + 4, h), (0, 0, 0))
        t.paste(ref.resize((w, h)), (0, 0)); t.paste(live.resize((w, h)), (w + 4, 0))
        tiles.append(label(t, nn))
    if not tiles:
        return
    cols = min(4, len(tiles))
    rows = (len(tiles) + cols - 1) // cols
    tw, th = max(t.width for t in tiles), max(t.height for t in tiles)
    S = Image.new("RGB", (cols * (tw + 8), rows * (th + 8)), (30, 0, 50))
    for i, t in enumerate(tiles):
        S.paste(t, ((i % cols) * (tw + 8), (i // cols) * (th + 8)))
    S.save(out)


def main(argv: list[str]) -> int:
    live_dir = ROOT / "screenshots"
    sheet_out = None
    ids = []
    it = iter(argv)
    for a in it:
        if a == "--sheet": sheet_out = Path(next(it))
        elif a == "--live": live_dir = Path(next(it))
        else: ids.append(a)
    ids = ids or list(REFS)
    if sheet_out:
        sheet(ids, live_dir, sheet_out)
        print("sheet", sheet_out)
        return 0
    rows = [r for r in (compare(nn, live_dir) for nn in ids) if r]
    (ROOT / "qa" / "report_metrics.json").write_text(json.dumps(rows, indent=1))
    md = ["# Reference vs live — reproducible metrics", "",
          "Method: `scripts/compare.py` (Pillow/numpy). mad = mean |ΔRGB| at 1/4 scale (lower is closer);",
          "hue_corr = 36-bin hue-histogram correlation of saturated pixels (−1…1, higher is closer);",
          "edge_corr = Sobel edge-map correlation at 1/8 scale (−1…1, structure/composition indicator).",
          "These are crude indicators, not a fidelity percentage. Girl-identity regions (01/10/11) and the",
          "03 phone outline are masked.", "",
          "| Screen | mad | hue_corr | edge_corr | masked |", "|---|---|---|---|---|"]
    md += [f"| {r['id']} | {r['mad']} | {r['hue_corr']} | {r['edge_corr']} | {r['masked'] or '—'} |" for r in rows]
    (ROOT / "qa" / "compare_summary.md").write_text("\n".join(md) + "\n")
    print("\n".join(md[-len(rows) - 2:]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
