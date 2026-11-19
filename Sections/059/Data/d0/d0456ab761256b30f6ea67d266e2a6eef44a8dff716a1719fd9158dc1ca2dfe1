"""Sample the two measured bank outlines in the saved water plane."""
from pathlib import Path
import json
import numpy as np
from scipy.interpolate import PchipInterpolator
trace=json.loads(Path('inputs/trace.json').read_text())['traces']
samples=[]
for along in np.linspace(-2.45,26.15,144):
    row={'along':round(float(along),5)}
    for side in ['left','right']:
        for edge in ['outer','inner']:
            a,x=np.transpose(trace[side+'_'+edge])
            v=PchipInterpolator(a,x)(np.clip(along,a[0],a[-1]))
            row[side+'_'+edge]=round(float(v),5)
    samples.append(row)
Path('inputs/sections.json').write_text(json.dumps(samples,indent=1))
