"""Export an archived review still as a standard PNG at the same dimensions."""
from pathlib import Path
import argparse
import os
import shutil
import subprocess
import tempfile

def convert(source, target):
    if target.exists():
        raise FileExistsError("Choose a new PNG filename.")
    if target.suffix.lower() != ".png":
        raise ValueError("The output filename must end in .png.")
    if not target.parent.is_dir():
        raise FileNotFoundError("The output folder does not exist.")
    with tempfile.TemporaryDirectory(dir=target.parent) as tmp:
        output = Path(tmp) / "review.png"
        try:
            from PIL import Image
            with Image.open(source) as picture:
                picture.save(output, "PNG")
        except (ImportError, OSError):
            ffmpeg = shutil.which("ffmpeg")
            if not ffmpeg:
                raise RuntimeError("Use Pillow with AVIF support or ffmpeg to decode this file.")
            subprocess.run([ffmpeg, "-nostdin", "-v", "error", "-i", str(source),
                            "-frames:v", "1", str(output)], check=True)
        if target.exists():
            raise FileExistsError("The output filename is already in use.")
        os.link(output, target)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    convert(args.source, args.output)

