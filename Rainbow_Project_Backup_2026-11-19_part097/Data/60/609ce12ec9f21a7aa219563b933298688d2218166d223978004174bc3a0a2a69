import base64
from pathlib import Path
import os,subprocess as sp,shutil,hashlib,json,zipfile,re,socket
p=Path.cwd();root_script=p/'stage-android-review.py';loc=p/'android-check';loc.mkdir(exist_ok=True)
a=Path("/tmp/rainbow-claudia-transfer.u9XkC10f/android-runtime");repo=p/'repo';jdk=a/'isolated-jdk21'
def run(args,**kw):return sp.run([str(x) for x in args],check=True,**kw)
git=['git','-C',str(repo)]
records=sp.check_output(git+['ls-tree','-r','-z','HEAD','android','capacitor.config.ts']).split(b'\0')
for entry in filter(None,records):
 meta,path=entry.split(b'\t');mode,typ,sha=meta.decode().split();assert typ=='blob'
 f=loc/path.decode();f.parent.mkdir(exist_ok=True,parents=True);f.write_bytes(sp.check_output(git+['cat-file','blob',sha]))
 f.chmod(0o755 if mode=='100755' else 0o644)
game=p/'games/06'
for fn in ['package.json','package-lock.json','tsconfig.json']:shutil.copyfile(game/fn,loc/fn)
if not (loc/'node_modules').exists():(loc/'node_modules').symlink_to((game/'node_modules').resolve(),target_is_directory=True)
shutil.copytree(p/'games/06/dist',loc/'dist',dirs_exist_ok=True)
import runpy
proofID=runpy.run_path(str(root_script))['configure'](p,loc)
env=dict(os.environ,ANDROID_HOME=str(a/'sdk'),ANDROID_SDK_ROOT=str(a/'sdk'),GRADLE_USER_HOME=str(a/'gradle-cache'),ANDROID_USER_HOME=str(loc/'device-state'),JAVA_HOME=str(jdk),PATH=str(jdk/'bin')+os.pathsep+os.environ['PATH'],CI='1')
(Path(env['ANDROID_USER_HOME'])).mkdir(exist_ok=True)
for nm,cmd,work in [('capacitor',[game/'node_modules/.bin/cap','sync','android'],loc),('gradle',[a/'gradle-dist/gradle-8.2.1/bin/gradle','--offline','--no-daemon','--max-workers=1','--console=plain','assembleDebug'],loc/'android')]:
 with (loc/(nm+'.log')).open('w') as log:run(cmd,cwd=work,env=env,stdout=log,stderr=sp.STDOUT)
apk=loc/'android/app/build/outputs/apk/debug/app-debug.apk'
tools=a/'sdk/build-tools/34.0.0'
def checked(*args):return sp.check_output([str(x) for x in args],env=env,stderr=sp.DEVNULL,text=True)
sign=checked(tools/'apksigner','verify','--verbose',apk);tags=checked(tools/'aapt2','dump','badging',apk)
assert 'Verified using v2 scheme (APK Signature Scheme v2): true' in sign and "targetSdkVersion:'34'" in tags and ('name=\''+proofID+'\'') in tags
with zipfile.ZipFile(apk) as z:
 assert z.testzip() is None
 files=[f for f in (loc/'dist').rglob('*') if f.is_file()]
 for f in files:
  data=f.read_bytes();assert z.read('assets/public/'+f.relative_to(loc/'dist').as_posix())==data and not data.startswith(b'version https://git-lfs.github.com/spec/v1')
 mask=[]
 for source in (game/'assets/reconstruction06').iterdir():
  data=source.read_bytes();hits=[f.name for f in files if f.read_bytes()==data];assert hits,source.name;mask.extend(hits)
 assert 'cx06RinseWorld=1' in z.read('assets/public/index.html').decode() and "startRideAt('06')" in z.read('assets/public/swim.html').decode()
adb=a/'sdk/platform-tools/adb';port=15686
try:
 with socket.create_connection(('127.0.0.1',port),timeout=.4):raise RuntimeError('ADB diagnostic port already active')
except (ConnectionRefusedError,TimeoutError):pass
try:devices=[s for s in checked(adb,'-P',port,'devices','-l').splitlines()[1:] if s.strip()]
finally:checked(adb,'-P',port,'kill-server')
result={'targetSDK':34,'package':proofID,'assembleDebug':True,'verifiedSignature':'APK Signature Scheme v2','embeddedWebFilesVerified':len(files),'materialAssetVerified':mask,'sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'connectedPhysicalDevices':len(devices),'sourceCommit':json.loads((p/'source.json').read_text())['commit']}
(p/'android-receipt.json').write_text(json.dumps(result,indent=2)+'\n')
print('Verified Android build',len(files),'web files;',len(devices),'devices',flush=True)
