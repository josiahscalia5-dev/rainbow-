#!/usr/bin/env python3
"""Wrap an already compiled production Vite game with an isolated review launcher."""
from pathlib import Path
from urllib.parse import urlencode
import argparse
import html
import json
import os
import shutil

p=argparse.ArgumentParser()
p.add_argument("vite_output",type=Path)
p.add_argument("review_output",type=Path)
args=p.parse_args()
out=args.review_output.resolve()
source=args.vite_output.resolve()
if out.exists(): raise SystemExit("Choose an empty output directory.")
out.mkdir(parents=True)
for f in source.iterdir():
    if f.name=="index.html": continue
    if f.is_dir():
        shutil.copytree(f,out/f.name,copy_function=os.link)
    else:
        os.link(f,out/f.name)
game=(source/'index.html').read_text()
footer='''<script>
(function launchReview() {
  const start = new URLSearchParams(location.search).get("reviewStart");
  if (start === "full") return;
  const game = window.__rainbow;
  if (!game || !game.ready) {
    if (window.__error) return;
    requestAnimationFrame(launchReview);
    return;
  }
  game.run(false);
  if (start === "inlet") {
    game.startRideAt("05");
    game.unfreeze();
    game.setSteer(0);
    const inlet = game.course.stage("06").s0 + 0.04;
    for (let count = 0; game.state().s < inlet && count < 4500; count++) game.step(1);
  } else {
    game.goto("06");
  }
  game.unfreeze();
  game.run(true);
})();
</script>'''
assert '</body>' in game
(out/'game.html').write_text(game.replace('</body>',footer+'\n</body>'))
settings={"match06":1,"m06geo":1,"m06flow":1,"m06cam":1,"m06la":25,"m06tun":1,"m06ring":1,"m06bub":1,"m06foam":1,"m06gold":1,"m06fclu":1,"cx06ArchedPassage":1,"cx06OpenCrest":1,"cx06RoundedCrest":1,"seed":20261115}
choices=[('opening','Swim from the artwork viewpoint'),('inlet','Swim from the stage entrance'),('full','Play from the start of the game')]
links=''.join('<p><a href="game.html?'+html.escape(urlencode(dict(settings,reviewStart=key,**({'video':0} if key!='full' else {}))))+'">'+caption+'</a></p>' for key,caption in choices)
style='''html{color-scheme:dark;background:#20102e}body{color:#fff9ff;font:18px/1.45 system-ui,sans-serif;max-width:31rem;padding:3rem 1.35rem;margin:auto}h1{font-size:2rem;line-height:1.12}a{display:block;padding:.85rem 1rem;border-radius:.55rem;color:white;background:#52256c;text-decoration:none}a:focus,a:hover{outline:2px solid #ff8cdd}small{color:#dfcee7}'''
(out/'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rainbow · Rounded Crest</title><style>'+style+'</style></head><body><h1>06 · Crest the Rinse Arch</h1><p>Screen 06 rounded water crest candidate</p>'+links+'<small>Hold the left or right side of the screen or drag to steer Benny. On a keyboard, use the arrow keys.</small></body></html>')
(out/'review-settings.json').write_text(json.dumps(settings,indent=2)+'\n')
