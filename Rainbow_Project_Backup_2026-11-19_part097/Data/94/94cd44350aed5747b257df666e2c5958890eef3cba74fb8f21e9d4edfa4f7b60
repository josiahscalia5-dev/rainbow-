"""Package two review entry points in a separate Android debug application."""
import json, shutil
from pathlib import Path
from urllib.parse import quote

def configure(root, checkout):
 dist=checkout/'dist';entry=dist/'index.html';original=entry.read_text();assert 'id="scene"' in original
 q=json.loads((root/'queries.json').read_text())['06'];switch=json.loads((root/'flags.json').read_text())['06'];url='swim.html?qa=1&'+q
 start='''<script>\nfunction beginReviewRide() {\n const game=window.__rainbow;\n if (!game?.ready) { if (!window.__error) requestAnimationFrame(beginReviewRide); return; }\n game.startRideAt('06'); game.unfreeze(); game.run(true);\n}\nrequestAnimationFrame(beginReviewRide);\n</script>''';(dist/'swim.html').write_text(original.replace('</body>',start+'\n</body>'))
 page='''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Screen 06 swim comparison</title><style>body{min-height:100dvh;margin:0;display:grid;place-items:center;background:#29113b;color:#fff;font:18px system-ui,sans-serif}main{width:min(84vw,26rem)}h1{font-size:2rem}p{line-height:1.45;color:#ebdcf3}a{display:block;padding:1rem;margin:.8rem 0;border-radius:.65rem;background:#693680;color:#fff;font-weight:650;text-decoration:none}a:first-of-type{background:#6de4ee;color:#241133}</style></head><body><main><h1>Crest the Rinse Arch</h1><p>Both rides start at the Screen 06 inlet. Use the usual steering controls. Android Back returns to this comparison.</p><a href="NEW_URL">Play reconstructed Screen 06</a><a href="OLD_URL">Play Claudia’s retained Screen 06</a></main></body></html>''';entry.write_text(page.replace('NEW_URL',(url+'&'+switch).replace('&','&amp;')).replace('OLD_URL',url.replace('&','&amp;')))
 application='com.rainbow.washergame.crestproof';build=checkout/'android/app/build.gradle';s=build.read_text();pat='applicationId "com.rainbow.washergame"';assert pat in s;build.write_text(s.replace(pat,'applicationId "'+application+'"'))
 strings=checkout/'android/app/src/main/res/values/strings.xml';import xml.etree.ElementTree as ET;doc=ET.parse(strings);r=doc.getroot();
 for item in r.findall('string'):
  if item.get('name') in ('app_name','title_activity_main'): item.text='Rainbow Crest Proof'
  elif item.get('name') in ('package_name','custom_url_scheme'):item.text=application
 doc.write(strings,encoding='utf-8',xml_declaration=True)
 cap=checkout/'capacitor.config.ts';cap.write_text(cap.read_text().replace('com.rainbow.washergame',application));return application
