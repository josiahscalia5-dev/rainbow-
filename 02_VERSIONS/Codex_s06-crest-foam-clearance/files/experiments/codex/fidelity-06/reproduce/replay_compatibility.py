"""Construct the separately tested curved-ring plus foam source in a new file."""
import argparse
import hashlib
import subprocess
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("repo", type=Path, help="checkout containing the saved specialist and Codex commits")
parser.add_argument("output", type=Path, help="new match06.ts path in a disposable copy")
args = parser.parse_args()
if args.output.exists():
    parser.error("choose a new output path")
path = "src/world/match06.ts"
current = (args.repo / path).read_text()
prior = subprocess.check_output(["git", "-C", str(args.repo), "show",
   "0478646a45ee68dc81656f0da12baf7f06501bf5:" + path], text=True)
first = "    let seed = 12345;"
last = "  // far end cap of the tunnel"
assert current.count(first) == prior.count(first) == 1
assert "cx06CrestFoam" in current and "cx06RinseElbow" in prior
result = prior[:prior.index(first)] + current[current.index(first):current.index(last)] + prior[prior.index(last):]
args.output.parent.mkdir(parents=True, exist_ok=True)
with args.output.open("x") as out:
    out.write(result)
print(hashlib.sha256(result.encode()).hexdigest())
