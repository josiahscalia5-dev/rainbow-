"""Prepare and verify the native image and real-swimming review for a phone."""
import argparse
import hashlib
import json
import shutil
import tempfile
import zipfile
from io import BytesIO
from pathlib import Path

import fitz
from PIL import Image
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen.canvas import Canvas


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def add_page(canvas, image, role, caption):
    width, height = 504, 896
    canvas.setPageSize((width, height + 56))
    canvas.setFillColorRGB(.13, .08, .18)
    canvas.rect(0, height, width, 56, stroke=0, fill=1)
    canvas.setFillColorRGB(1, 1, 1)
    canvas.setFont("Helvetica-Bold", 13)
    canvas.drawString(14, height + 33, role)
    canvas.setFont("Helvetica", 10)
    canvas.drawString(14, height + 13, caption)
    with Image.open(image) as pic:
        assert pic.size == (864, 1536)
        if pic.format == "JPEG":
            source = ImageReader(str(image))
        else:
            buffer = BytesIO()
            pic.convert("RGB").save(buffer, "JPEG", quality=87, optimize=True, subsampling=0)
            buffer.seek(0)
            source = ImageReader(buffer)
        canvas.drawImage(source, 0, 0, width=width, height=height)
    canvas.showPage()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("proof", type=Path)
    parser.add_argument("phoneDownloads", type=Path)
    args = parser.parse_args()
    root, phone = args.proof, args.phoneDownloads
    phone.mkdir(parents=True, exist_ok=True)
    pdf = root / "Review_on_Android.pdf"
    cv = Canvas(str(pdf), pageCompression=1, invariant=1)
    cv.setTitle("Rainbow Screen 06 | Original, retained and rejected structural test")
    cv.setAuthor("Rainbow visual comparisons")
    add_page(cv, root / "APPROVED.jpg", "SCREEN 06  |  APPROVED ARTWORK", "Crest the Rinse Arch. Original camera and artwork.")
    order = [
        ("opening","Approved starting viewpoint"), ("inlet","Actual inlet from Screen 05"),
        ("crest-release","Crest release, +1.1 units"), ("forward-03","Forward +3 units"),
        ("forward-06","Forward +6 units"), ("forward-10","Forward +10 units"),
        ("hard-left","Hard-left steering, +12 units"), ("hard-right","Hard-right steering, +12 units"),
        ("middle","Middle of Screen 06"), ("forward-20","Forward +20 units"),
        ("deep","Deep in the curved drum"), ("arch-exit","Leaving the arch"),
        ("last-in-stage","Final approach"), ("across-transition","Transition into Screen 07"),
    ]
    for pose, caption in order:
        for folder, role in (("CLAUDIA_BEFORE","CLAUDIA BEFORE  |  Retained game"),
                             ("CODEX_NEW","CODEX NEW  |  Rejected structural experiment")):
            add_page(cv, root / folder / (pose + ".png"), role, caption)
    cv.save()
    with fitz.open(pdf) as doc:
        assert len(doc) == 29
        for page in doc:
            images = page.get_images()
            assert len(images) == 1 and images[0][2:4] == (864, 1536)
            assert len(page.get_text().splitlines()) == 2
            page.get_pixmap(matrix=fitz.Matrix(.16,.16))
    files = ["README_FIRST.md", "APPROVED.jpg", "Review_on_Android.pdf", "diagnostics/visible-crest-and-swim.png"]
    for folder in ("CLAUDIA_BEFORE","CODEX_NEW"):
        files.extend(folder + "/" + pose + ".png" for pose, _ in order)
        files.extend(folder + "/" + name for name in ("ride.mp4","poses.json","route.json","gameplay.json"))
    files.append("CODEX_NEW/full-safe-ride.json")
    files.extend("checks/" + name for name in ("motion.json","camera-and-aperture.json","github-checkpoints.json",
                                                "film-timeline.json","model-verification.json","visible-water-clearance.json",
                                                "physical-wall-rays.json","runtime-versions.json"))
    file_hashes = {name: digest(root / name) for name in files}
    zip_path = root / "Screen06_Review.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=3) as package:
        for name in files:
            package.write(root / name, name)
        package.writestr("REVIEW_SHA256.json", json.dumps(file_hashes, indent=2) + "\n")
    with tempfile.TemporaryDirectory(prefix="rainbow06-review-extract-") as scratch:
        with zipfile.ZipFile(zip_path) as package:
            assert package.testzip() is None
            assert set(package.namelist()) == set(files) | {"REVIEW_SHA256.json"}
            package.extractall(scratch)
        extracted = Path(scratch)
        for name, expected in file_hashes.items():
            assert digest(extracted / name) == expected
        with fitz.open(extracted / "Review_on_Android.pdf") as doc:
            assert len(doc) == 29
        for folder in ("CLAUDIA_BEFORE","CODEX_NEW"):
            for pose, _ in order:
                with Image.open(extracted / folder / (pose + ".png")) as pic:
                    pic.verify()
    assert zip_path.stat().st_size < 150_000_000
    for name, output in [
        ("APPROVED.jpg","Rainbow_06_Exact_Approved.jpg"),
        ("CLAUDIA_BEFORE/opening.png","Rainbow_06_Retained_Opening.png"),
        ("CODEX_NEW/opening.png","Rainbow_06_Rejected_Structural_Opening.png"),
        ("CLAUDIA_BEFORE/ride.mp4","Rainbow_06_Retained_Full_Swim.mp4"),
        ("CODEX_NEW/ride.mp4","Rainbow_06_Rejected_Structural_Full_Swim.mp4"),
        ("Review_on_Android.pdf","Rainbow_Screen06_Structural_Proof.pdf"),
        ("Screen06_Review.zip","Rainbow_Screen06_Structural_Review.zip"),
    ]:
        shutil.copy2(root / name, phone / output)
        assert digest(phone / output) == digest(root / name)
    result = {"nativePictures": 29, "separateMatchedGameFrames": 28, "uninterruptedFilms": 2,
              "pdfPages": 29, "pdfBytes": pdf.stat().st_size, "pdfSHA256": digest(pdf),
              "zipBytes": zip_path.stat().st_size, "zipSHA256": digest(zip_path),
              "zipEntries": len(files)+1, "allExtractedFilesHashVerified": True}
    (root / "checks/phone-downloads.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result))


if __name__ == "__main__":
    main()
