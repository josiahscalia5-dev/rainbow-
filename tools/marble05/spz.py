"""Minimal SPZ reader (positions, alpha, colour) for Marble worlds. Usage: from spz import read_spz"""
import gzip, struct, numpy as np

def read_spz(path):
    raw = gzip.decompress(open(path, 'rb').read())
    magic, version, n, sh, frac, flags, _ = struct.unpack_from('<IIIBBBB', raw, 0)
    assert magic == 0x5053474e, hex(magic)
    o = 16
    pos = np.frombuffer(raw, np.uint8, n * 9, o).reshape(n, 3, 3).astype(np.int32); o += n * 9
    v = pos[..., 0] | (pos[..., 1] << 8) | (pos[..., 2] << 16)
    v = np.where(v & 0x800000, v - (1 << 24), v)
    xyz = v.astype(np.float32) / (1 << frac)
    alpha = np.frombuffer(raw, np.uint8, n, o).astype(np.float32) / 255.0; o += n
    col = np.frombuffer(raw, np.uint8, n * 3, o).reshape(n, 3).astype(np.float32); o += n * 3
    rgb = np.clip(0.5 + 0.282095 * ((col / 255.0 - 0.5) / 0.15), 0, 1)
    return {'version': version, 'n': n, 'sh': sh, 'xyz': xyz, 'alpha': alpha, 'rgb': rgb}
