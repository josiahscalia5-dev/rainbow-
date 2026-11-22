import numpy as np
PROPS = ['x', 'y', 'z', 'f_dc_0', 'f_dc_1', 'f_dc_2', 'opacity', 'scale_0', 'scale_1', 'scale_2', 'rot_0', 'rot_1', 'rot_2', 'rot_3']
def read_ply(path):
    raw = open(path, 'rb').read(); i = raw.index(b'end_header\n') + 11
    hdr = raw[:i].decode(); n = int(hdr.split('element vertex ')[1].split()[0])
    props = [l.split()[-1] for l in hdr.splitlines() if l.startswith('property')]
    a = np.frombuffer(raw, '<f4', n * len(props), i).reshape(n, len(props))
    c = {p: a[:, k] for k, p in enumerate(props)}
    return {'xyz': np.c_[c['x'], c['y'], c['z']], 'dc': np.c_[c['f_dc_0'], c['f_dc_1'], c['f_dc_2']], 'opacity': c['opacity'].copy(),
            'scale': np.c_[c['scale_0'], c['scale_1'], c['scale_2']], 'rot': np.c_[c['rot_0'], c['rot_1'], c['rot_2'], c['rot_3']]}
