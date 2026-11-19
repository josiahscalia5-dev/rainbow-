#!/usr/bin/env python3
"""Download the numbered Rainbow backup files into one folder with an authenticated GitHub CLI."""
import argparse,hashlib,json,os,shutil,subprocess,urllib.request,zipfile
from pathlib import Path

def digest(path):
 with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()

def verified_content(path,part):
 try:
  with zipfile.ZipFile(path) as z:
   key=f"PART{part['number']:03d}_SHA256.jsonl"
   names=[n for n in z.namelist() if n.rsplit('/',1)[-1]==key]
   if len(names)!=1:return False
   manifest=names[0];raw=z.read(manifest);prefix=manifest[:-len(key)]
   if hashlib.sha256(raw).hexdigest()!=part['memberManifestSHA256']:return False
   entries=[json.loads(line) for line in raw.splitlines()];expected={prefix+e['path'] for e in entries}|{manifest}
   if {i.filename for i in z.infolist() if not i.is_dir()}!=expected:return False
   for e in entries:
    info=z.getinfo(prefix+e['path'])
    if info.file_size!=e['size']:return False
    with z.open(info) as f:
     if hashlib.file_digest(f,'sha256').hexdigest()!=e['sha256']:return False
   return z.testzip() is None
 except (OSError,ValueError,zipfile.BadZipFile):return False

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--index',type=Path,default=Path(__file__).with_name('Rainbow_Backup_Downloads.json'));ap.add_argument('--to',type=Path,required=True);a=ap.parse_args()
 index=json.loads(a.index.read_text());a.to.mkdir(parents=True,exist_ok=True)
 for p in sorted(index['parts'],key=lambda p:p['number']):
  target=a.to/p['name']
  if target.exists():
   if digest(target)==p['sha256'] or verified_content(target,p):print('Already verified',target.name,flush=True);continue
   raise SystemExit('A different file already exists at '+str(target))
  temp=target.with_suffix('.download-in-progress')
  if p['delivery']=='exact-file':
   meta=json.loads(subprocess.check_output(['gh','api','repos/'+index['repository']+'/contents/'+p['name']+'?ref='+p['commit']]))
   with urllib.request.urlopen(meta['download_url'],timeout=180) as remote,temp.open('wb') as output:shutil.copyfileobj(remote,output,1024*1024)
  else:
   with temp.open('wb') as output:subprocess.run(['gh','api','repos/'+index['repository']+'/zipball/'+p['commit']],stdout=output,check=True)
  actual=digest(temp)
  if actual!=p['sha256'] and not verified_content(temp,p):raise SystemExit('Download failed its checksum and member verification for '+target.name)
  temp.rename(target);print('Saved',target.name,target.stat().st_size,actual,flush=True)
 print('All numbered ZIPs are verified.')
if __name__=='__main__':main()

