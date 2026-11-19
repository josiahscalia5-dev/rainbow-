"""Verify an original Rainbow reference directly from an observed GitHub specialist tip."""
import argparse
import hashlib
import io
import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

REMOTE = "https://github.com/josiahscalia5-dev/rainbow-.git"
WEB = "https://github.com/josiahscalia5-dev/rainbow-"

def git(repository, *arguments, input_bytes=None):
    return subprocess.run(
        ["git", "--git-dir=" + str(repository), *arguments],
        input=input_bytes, stdout=subprocess.PIPE, check=True,
    ).stdout

def remote_tip(repository, ref):
    rows = git(repository, "ls-remote", "--heads", "origin", ref).decode().splitlines()
    if len(rows) != 1 or rows[0].split()[1] != ref:
        raise ValueError("The named specialist branch could not be verified on GitHub.")
    return rows[0].split()[0]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--screen", required=True, choices=["04","05","06","07","08"])
    parser.add_argument("--branch", required=True, help="Verified current Claudia specialist branch")
    parser.add_argument("--expected-commit", required=True, help="Full SHA from the latest handoff check")
    parser.add_argument("--compare", type=Path, action="append", default=[], help="Additional copy to verify byte for byte")
    parser.add_argument("--scratch-copy", type=Path, help="New filename for inspection outside the game checkout")
    args = parser.parse_args()
    ref = "refs/heads/" + args.branch
    subprocess.run(["git", "check-ref-format", ref], check=True)
    with tempfile.TemporaryDirectory(prefix="rainbow-original-") as temp:
        repository = Path(temp) / "source.git"
        subprocess.run(["git","init","--quiet","--bare",str(repository)],check=True)
        git(repository,"remote","add","origin",REMOTE)
        tip = remote_tip(repository, ref)
        if tip != args.expected_commit:
            raise ValueError("The specialist tip changed. Use the current checkpoint before modeling.")
        git(repository,"fetch","--quiet","--no-tags","--depth=1","--filter=blob:none","origin",ref+":refs/heads/verified")
        if git(repository,"rev-parse","refs/heads/verified").decode().strip() != tip:
            raise ValueError("The fetched commit differs from the observed GitHub tip.")
        manifest = git(repository,"show",tip+":scripts/reference.sha256").decode().splitlines()
        matches = []
        for line in manifest:
            if line.strip() and not line.startswith("#"):
                checksum, path = line.split(maxsplit=1)
                path = path.lstrip("*")
                if path.startswith("references/" + args.screen + "_"):
                    matches.append((checksum,path))
        if len(matches) != 1:
            raise ValueError("Expected one original for this screen in the reference manifest.")
        expected, path = matches[0]
        raw = git(repository,"show",tip+":"+path)
        if raw.startswith(b"version https://git-lfs.github.com/spec/v1"):
            raw = git(repository,"lfs","smudge","--",path,input_bytes=raw)
        digest = hashlib.sha256(raw).hexdigest()
        if digest != expected:
            raise ValueError("GitHub file bytes do not match the original reference manifest.")
        with Image.open(io.BytesIO(raw)) as artwork:
            artwork.load()
            size, encoding = list(artwork.size), artwork.format
        for copy in args.compare:
            if copy.read_bytes() != raw:
                raise ValueError("Comparison file differs from the approved artwork at " + str(copy))
        if remote_tip(repository,ref) != tip:
            raise ValueError("The specialist saved another commit during verification.")
        if args.scratch_copy:
            with args.scratch_copy.open("xb") as destination:
                destination.write(raw)
        print(json.dumps({"branch":args.branch,"commit":tip,"path":path,"sha256":digest,
                          "size":size,"encoding":encoding,"bytes":len(raw),
                          "url":WEB+"/blob/"+tip+"/"+path},indent=2))

if __name__ == "__main__":
    main()
