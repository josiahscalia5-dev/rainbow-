#!/usr/bin/env python3
"""Restore Rainbow from the numbered ZIP downloads. Python 3.11+ and Git are required."""
import argparse,hashlib,json,os,shutil,stat,subprocess,sys,zipfile,zlib
from pathlib import Path,PurePosixPath

def readrows(path):
 with path.open(encoding='utf-8') as f:
  for line in f:
   if line.strip():yield json.loads(line)

def safe_path(root,name):
 p=PurePosixPath(name)
 if p.is_absolute() or '..' in p.parts or '\\' in name or not name or '\x00' in name:raise ValueError('Unsafe archive path')
 dst=root.joinpath(*p.parts)
 if dst.is_symlink():raise ValueError('Refusing an existing symbolically linked target')
 return dst

def filehash(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()

def validated_archives(folder,dest):
 found={}
 for arc in sorted(folder.glob('*.zip')):
  with zipfile.ZipFile(arc) as z:
   candidates=[name for name in z.namelist() if __import__('re').fullmatch(r'PART\d{3}_SHA256\.jsonl',name.rsplit('/',1)[-1])]
   if not candidates:continue
   members={i.filename for i in z.infolist() if not i.is_dir()}
   allowed=set(candidates);pending=[]
   for manifest in candidates:
    basename=manifest.rsplit('/',1)[-1];id=int(basename[4:7]);prefix=manifest[:-len(basename)]
    raw=z.read(manifest);entries=[json.loads(line) for line in raw.splitlines() if line.strip()]
    allowed.update(prefix+e['path'] for e in entries)
    identity=hashlib.sha256(raw).hexdigest()
    if id in found and found[id]!=identity:raise ValueError('Conflicting copies of backup part '+str(id))
    pending.append((id,prefix,entries,identity))
   for extra in (p for p in members if p.rsplit('/',1)[-1]=='EXPANDED_PROJECT_SHA256.jsonl'):
    prefix=extra[:-len('EXPANDED_PROJECT_SHA256.jsonl')];entries=[json.loads(line) for line in z.read(extra).splitlines() if line.strip()]
    allowed.add(extra);allowed.update(prefix+e['path'] for e in entries);pending.append((None,prefix,entries,None))
   if allowed!=members:raise ValueError('Unexpected or missing member in '+arc.name)
   for id,prefix,entries,identity in pending:
    if id in found:continue
    for e in entries:
     p=safe_path(dest,e['path']);p.parent.mkdir(parents=True,exist_ok=True)
     if p.exists():
      if not p.is_file() or p.stat().st_size!=e['size'] or filehash(p)!=e['sha256']:raise ValueError('Conflicting path '+e['path'])
      continue
     with z.open(prefix+e['path']) as i,p.open('xb') as o:shutil.copyfileobj(i,o,1024*1024)
     if p.stat().st_size!=e['size'] or filehash(p)!=e['sha256']:raise ValueError('Incorrect restored file '+e['path'])
    if id is not None:
     found[id]=identity;print('Verified numbered section',id,flush=True)
 return found

def install_object(git_dir,source,oid):
 dst=git_dir/'objects'/oid[:2]/oid[2:];dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():return
 n=source.stat().st_size;header=b'blob '+str(n).encode()+b'\0';digest=hashlib.sha1(header);encoder=zlib.compressobj(3)
 with dst.open('xb') as out,source.open('rb') as f:
  out.write(encoder.compress(header))
  for chunk in iter(lambda:f.read(1024*1024),b''):
   digest.update(chunk);out.write(encoder.compress(chunk))
  out.write(encoder.flush())
 if digest.hexdigest()!=oid:raise ValueError('Git object SHA-1 mismatch '+oid)

def git(g,*args,**kw):
 return subprocess.run(['git','-C',str(g),*map(str,args)],check=True,**kw)

def copy_if_new(src,dst,mode=None):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if not dst.exists():shutil.copyfile(src,dst)
 if mode is not None:dst.chmod(mode)

def main():
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('--from',dest='downloads',type=Path,required=True,help='Folder containing the ZIP downloads')
 ap.add_argument('--to',dest='dest',type=Path,required=True,help='New, empty restoration folder')
 ap.add_argument('--workspaces',action='store_true',help='Also materialize every saved local worktree and project folder')
 ap.add_argument('--working-game-only',action='store_true',help='Restore the project and inventory without building the bare Git mirror')
 a=ap.parse_args();root=a.dest.resolve();src=a.downloads.resolve()
 if not src.is_dir() or root==src or root.exists() and (not root.is_dir() or any(root.iterdir())):ap.error('--to must be a new empty folder distinct from the ZIP folder')
 root.mkdir(parents=True,exist_ok=True);parts=validated_archives(src,root);inventory=root/'Inventory'
 if not (inventory/'snapshot.json').exists():raise SystemExit('The handoff and inventory ZIP is missing. Validated files remain in the destination.')
 snapshot=json.loads((inventory/'snapshot.json').read_text());missing=set(snapshot['parts'])-set(parts)
 if missing:raise SystemExit('Missing numbered ZIPs '+', '.join(str(i) for i in sorted(missing)))
 segments={}
 for e in readrows(inventory/'chunks.jsonl'):segments.setdefault(e['whole'],[]).append(e)
 locations={}
 for e in readrows(inventory/'objects.jsonl'):
  h=e['sha256'];p=e['path']
  if p=='@chunks':
   target=safe_path(root,'Data/'+h[:2]+'/'+h);target.parent.mkdir(parents=True,exist_ok=True)
   with target.open('xb') as out:
    for seg in sorted(segments[h],key=lambda r:r['index']):
     f=safe_path(root,seg['path'])
     if out.tell()!=seg['offset'] or f.stat().st_size!=seg['size'] or filehash(f)!=seg['sha256']:raise ValueError('Invalid original asset segment')
     with f.open('rb') as i:shutil.copyfileobj(i,out,1024*1024)
   p=target
  else:p=safe_path(root,p)
  if p.stat().st_size!=e['size'] or filehash(p)!=h:raise ValueError('Original bytes did not verify '+h)
  locations[h]=p
 project=root/'Project'
 for e in readrows(inventory/'working-project.jsonl'):
  if not e.get('sha256'):continue
  dst=safe_path(project,e['path']);source=locations[e['sha256']]
  if e['mode']=='120000':
   target=source.read_bytes().decode();candidate=(dst.parent/target).resolve()
   if os.path.isabs(target) or not candidate.is_relative_to(project):continue
   if dst.exists() and dst!=source:raise ValueError('Unexpected pre-existing symlink location')
   if dst==source:dst.rename(dst.with_suffix(dst.suffix+'.link-source'))
   dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(target)
  else:copy_if_new(source,dst,0o755 if e['mode']=='100755' else 0o644)
 if not a.working_game_only:
  restored=root/'History'/'Rainbow.git'
  subprocess.run(['git','init','--bare','--quiet',str(restored)],check=True)
  for f in sorted((root/'History').glob('*.pack')):
   with f.open('rb') as stream:git(restored,'index-pack','--stdin',stdin=stream,stdout=subprocess.DEVNULL)
  for e in readrows(inventory/'git-blobs.jsonl'):
   if e.get('sha256') and not e.get('excluded'):install_object(restored,locations[e['sha256']],e['oid'])
  extra=inventory/'unattached-local-git.jsonl'
  if extra.is_file():
   for e in readrows(extra):install_object(restored,safe_path(root,e['path']),e['oid'])
  for e in readrows(inventory/'lfs.jsonl'):
   if e['available']:
    sha=e['sha256'];copy_if_new(locations[sha],restored/'lfs/objects'/sha[:2]/sha[2:4]/sha)
  refs=list(readrows(root/'History/saved-refs-final.jsonl'))
  git(restored,'update-ref','--stdin',input=''.join(f'update {r} {o}\n' for r,o in refs).encode())
  git(restored,'symbolic-ref','HEAD','refs/heads/'+snapshot['leadBranch']);git(restored,'fsck','--full','--strict')
  print('Restored refs and verified Git history.')
 rows=list(readrows(inventory/'workspace-files.jsonl'))
 if a.workspaces:
  dirs=[];links=[]
  for e in rows:
   dst=safe_path(root,e['path'])
   if e['kind']=='link':links.append(e);continue
   if e['kind']=='dir':dst.mkdir(parents=True,exist_ok=True);dirs.append((dst,e));continue
   source=locations[e['sha256']];copy_if_new(source,dst,e['mode'])
  for e in links:
   dst=safe_path(root,e['path']);target=e.get('portableTarget')
   if target:
    resolved=safe_path(root,target)
    if resolved.exists():
     dst.parent.mkdir(parents=True,exist_ok=True);dst.symlink_to(os.path.relpath(resolved,dst.parent),target_is_directory=resolved.is_dir())
  for d,e in reversed(dirs):
   if e.get('mtimeNS') is not None:os.utime(d,ns=(e['mtimeNS'],e['mtimeNS']))
 print('Working game',project)
 print('Read HANDOFF_FOR_CLAUDE.md and MISSING_AND_EXCLUDED.md for source decisions, private signing and external services.')
if __name__=='__main__':main()

