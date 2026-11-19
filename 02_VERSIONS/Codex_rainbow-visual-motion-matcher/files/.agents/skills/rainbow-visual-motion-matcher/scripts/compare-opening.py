"""Compare native artwork and captures using Pillow's decoder and pinned Pixelmatch."""
import argparse
import struct
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

def decode(source, destination):
    with Image.open(source) as image:
        rgba = image.convert("RGBA")
        with destination.open("wb") as out:
            out.write(struct.pack(">II", *rgba.size))
            out.write(rgba.tobytes())

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("approved", type=Path)
    parser.add_argument("before", type=Path)
    parser.add_argument("--candidate", type=Path)
    parser.add_argument("--repeat", type=Path)
    args = parser.parse_args()
    engine = Path(__file__).with_name("score-rgba.mjs")
    with tempfile.TemporaryDirectory(prefix="rainbow-image-measure-") as directory:
        command = ["node", str(engine)]
        for name in ("approved", "before", "candidate", "repeat"):
            source = getattr(args, name)
            if source is None:
                continue
            raw = Path(directory) / (name + ".rgba")
            decode(source, raw)
            if name in ("candidate", "repeat"):
                command.append("--" + name)
            command.append(str(raw))
        subprocess.run(command, check=True)

if __name__ == "__main__":
    main()
