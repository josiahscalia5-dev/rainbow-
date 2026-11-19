#!/usr/bin/env python3
"""Verify that the installable candidate contains the exact web game that was tested."""
from pathlib import Path
import argparse
import os
import hashlib
import json
import re
import subprocess
import zipfile

p=argparse.ArgumentParser()
for k in ['game','web','apk','web_zip','build_tools','browser_checks','report']:p.add_argument(k,type=Path)
args=p.parse_args()
sha=lambda path:hashlib.file_digest(path.open('rb'),'sha256').hexdigest()
files=[f for f in args.web.rglob('*') if f.is_file()]
with zipfile.ZipFile(args.apk) as apk,zipfile.ZipFile(args.web_zip) as web_zip:
    assert not apk.testzip() and not web_zip.testzip()
    for f in files:
        expected=f.read_bytes()
        rel=f.relative_to(args.web).as_posix()
        assert apk.read('assets/public/'+rel)==expected, rel
        assert web_zip.read('game/'+rel)==expected, rel
    assert any(x.name.startswith('rounded-spillway-') and x.suffix=='.glb' for x in files)
    assert any(x.name.startswith('archedPassage06-') for x in files)
    assert b'cx06RoundedCrest' in (args.web/'index.html').read_bytes()
    assert 'assets/capacitor.config.json' in apk.namelist()
    cap=json.loads(apk.read('assets/capacitor.config.json'))
    assert cap['appId']=='com.rainbow.washergame.review.s06.roundedcrest'
badging=subprocess.check_output([str(args.build_tools/'aapt'),'dump','badging',str(args.apk)],text=True)
assert "package: name='com.rainbow.washergame.review.s06.roundedcrest'" in badging
target=re.search(r"targetSdkVersion:'(\d+)'",badging).group(1)
schemes=subprocess.check_output([str(args.build_tools/'apksigner'),'verify','--verbose',str(args.apk)],text=True)
assert 'Verified using v2 scheme (APK Signature Scheme v2): true' in schemes
source_hashes={}
for f in [*sorted((args.game/'src').rglob('*.ts')),*sorted((args.game/'assets').rglob('*'))]:
    if f.is_file(): source_hashes[f.relative_to(args.game).as_posix()]=sha(f)
report=dict(applicationId=cap['appId'],targetAndroidSDK=target,artifactSha256={args.apk.name:sha(args.apk),args.web_zip.name:sha(args.web_zip)},
            sizes={args.apk.name:args.apk.stat().st_size,args.web_zip.name:args.web_zip.stat().st_size},webFilesMatchedByteForByte=len(files),
            models=sum(f.suffix=='.glb' for f in files),textures=sum(f.suffix in ['.jpg','.png','.webp'] for f in files),
            signatures=[line for line in schemes.splitlines() if line.startswith('Verified using') and line.endswith(': true')],
            browser=json.loads(args.browser_checks.read_text()),AndroidPerformance='Unmeasured. No physical Android device was connected.',
            sourceSha256=source_hashes)
comparison=Path(os.environ.get('RAINBOW_CAPTURE_DIST', args.game.parent/'qa'/'final-dist'))
if comparison.is_dir():
    independent=[f for f in comparison.rglob('*') if f.is_file() and f.relative_to(comparison).as_posix()!='index.html']
    packaged={f.relative_to(args.web).as_posix() for f in files if f.relative_to(args.web).as_posix() not in {'index.html','game.html','review-settings.json','cordova.js','cordova_plugins.js'}}
    assert {f.relative_to(comparison).as_posix() for f in independent}==packaged
    for f in independent: assert f.read_bytes()==(args.web/f.relative_to(comparison)).read_bytes()
    report['gameplayFilesComparedWithIndependentMotionCaptureBuild']=len(independent)
    report['separateCapacitorBootstrapFiles']=['cordova.js','cordova_plugins.js']
args.report.write_text(json.dumps(report,indent=2)+'\n')
print(f'{len(files)} embedded web files verified. APK {args.apk.stat().st_size} bytes. Web ZIP {args.web_zip.stat().st_size} bytes.')
