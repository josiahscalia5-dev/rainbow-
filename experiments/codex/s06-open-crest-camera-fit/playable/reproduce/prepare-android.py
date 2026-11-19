#!/usr/bin/env python3
"""Prepare an independent Capacitor debug-app directory from the existing Rainbow game."""
from pathlib import Path
import argparse
import json
import shutil
import subprocess

p=argparse.ArgumentParser()
p.add_argument("source",type=Path)
p.add_argument("native",type=Path)
p.add_argument("web",type=Path)
args=p.parse_args()
source=args.source.resolve()
native=args.native.resolve()
web=args.web.resolve()
app_id="com.rainbow.washergame.review.s06.twoviewcrest"
title="Rainbow · Crest Fit"
if native.exists():
    raise SystemExit("Choose a new native scratch directory.")
native.mkdir(parents=True)
shutil.copytree(source/"android",native/"android",ignore=shutil.ignore_patterns('build','.gradle','local.properties','*.jks','*.keystore'))
for name in ["package.json","package-lock.json","tsconfig.json"]:
    shutil.copy2(source/name,native/name)
config=(source/"capacitor.config.ts").read_text()
config=config.replace("'com.rainbow.washergame'",repr(app_id)).replace("appName: 'Rainbow'",f"appName: '{title}'")
(native/"capacitor.config.ts").write_text(config)
gradle=native/"android/app/build.gradle"
source_gradle=gradle.read_text()
target='applicationId "com.rainbow.washergame"'
assert source_gradle.count(target)==1
gradle.write_text(source_gradle.replace(target, f'applicationId "{app_id}"'))
strings=native/"android/app/src/main/res/values/strings.xml"
strings.write_text(strings.read_text().replace('>Rainbow<',f'>{title}<').replace('>com.rainbow.washergame<',f'>{app_id}<'))
deps=source/"node_modules"
local=native/"node_modules"
local.mkdir()
(local/"@capacitor").mkdir()
for dep in deps.iterdir():
    if dep.name=='@capacitor': continue
    (local/dep.name).symlink_to(dep.resolve(),target_is_directory=dep.is_dir())
for dep in (deps/"@capacitor").iterdir():
    if dep.name=="android":
        shutil.copytree(dep,local/"@capacitor/android",ignore=shutil.ignore_patterns("build",".gradle","local.properties"))
    else:
        (local/"@capacitor"/dep.name).symlink_to(dep.resolve(),target_is_directory=dep.is_dir())
(native/"dist").symlink_to(web,target_is_directory=True)
subprocess.run([str(deps/".bin/cap"),"sync","android"],cwd=native,check=True)
