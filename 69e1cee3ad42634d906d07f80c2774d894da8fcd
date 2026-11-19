#!/usr/bin/env python3
"""Recreate a saved project worktree, with its index, from an offline Rainbow restoration."""
import argparse,json,os,shutil,subprocess
from pathlib import Path
from restore_rainbow import readrows,safe_path
def main():
 ap=argparse.ArgumentParser(description=__doc__)
 ap.add_argument('--root',type=Path,required=True,help='Completed Rainbow backup restoration')
 ap.add_argument('--workspace',required=True,help='Alias from History/working-repositories.jsonl')
 ap.add_argument('--to',type=Path,required=True,help='New directory that does not exist')
 a=ap.parse_args();root=a.root.resolve();dst=a.to.resolve()
 if dst.exists():ap.error('Choose a new directory for the recovered working copy')
 r=next((r for r in readrows(root/'History/working-repositories.jsonl') if r['alias']==a.workspace),None)
 if not r or r['bare'] or r['upstreamTool']:ap.error('Select a saved Rainbow working copy from the inventory')
 folder='Workspaces/'+str(Path(r['path']).relative_to('/tmp'));source=safe_path(root,folder)
 if not source.is_dir():ap.error('Run the main restoration with --workspaces first')
 gitroot=root/'History/Rainbow.git'
 subprocess.run(['git','-C',str(gitroot),'worktree','add','--detach','--no-checkout',str(dst),r['head']],check=True)
 staged=(root/'History'/a.workspace/'staged-index.bin').read_bytes().split(b'\0')
 normal=[];skip=[]
 for row in staged:
  if row:
   flag,rest=row.split(b' ',1);normal.append(rest)
   if flag==b'S':skip.append(rest.partition(b'\t')[2])
 subprocess.run(['git','-C',str(dst),'read-tree','--empty'],check=True)
 if normal:subprocess.run(['git','-C',str(dst),'update-index','-z','--index-info'],input=b'\0'.join(normal)+b'\0',check=True)
 if skip:subprocess.run(['git','-C',str(dst),'update-index','--skip-worktree','-z','--stdin'],input=b'\0'.join(skip)+b'\0',check=True)
 for p in source.iterdir():
  if p.name=='.git':continue
  q=dst/p.name
  if p.is_symlink():q.symlink_to(os.readlink(p),target_is_directory=p.is_dir())
  elif p.is_dir():shutil.copytree(p,q,symlinks=True)
  elif p.is_file():shutil.copy2(p,q)
 print('Recovered detached worktree',dst,'at',r['head'])
if __name__=='__main__':main()

