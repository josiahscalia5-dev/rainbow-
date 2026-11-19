"""Recreate the complete project source and runtime files for one saved edition of Rainbow."""
from pathlib import Path,PurePosixPath
import argparse,hashlib,json,os,shutil,tempfile

def verified_path(parent, name):
    relative=PurePosixPath(name)
    if relative.is_absolute() or '..' in relative.parts or '\\' in name:
        raise ValueError('Invalid archive path')
    return parent.joinpath(*relative.parts)

def digest(path):
    with path.open('rb') as stream:return hashlib.file_digest(stream,'sha256').hexdigest()

def restore(package, name, target):
    versions=json.loads((package/'02_VERSIONS/INDEX.json').read_text())['variants']
    if name not in versions:raise ValueError('Unknown edition. Run --list to see available names.')
    if target.exists():raise FileExistsError('Choose a new output directory.')
    entry=versions[name];index=json.loads(verified_path(package,entry['index']).read_text())
    target.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(dir=target.parent) as scratch:
        work=Path(scratch)/'restored';work.mkdir()
        for name,item in index['files'].items():
            source=verified_path(package,item['file'])
            if digest(source)!=item['sha256']:raise ValueError('Hash mismatch in '+item['file'])
            to=verified_path(work,name);to.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,to)
            to.chmod(0o755 if item['mode']=='100755' else 0o644)
        if target.exists():raise FileExistsError('The output directory now exists.')
        work.rename(target)
    print(index['branch'],index['commit'],len(index['files']),'verified files in',target)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('edition',nargs='?')
    parser.add_argument('output',nargs='?',type=Path)
    parser.add_argument('--list',action='store_true')
    args=parser.parse_args();package=Path(__file__).resolve().parent.parent
    if args.list:
        for name,v in json.loads((package/'02_VERSIONS/INDEX.json').read_text())['variants'].items():print(name,v['commit'])
    elif args.edition and args.output:restore(package,args.edition,args.output.resolve())
    else:parser.error('Supply an edition and a new output path, or use --list.')
