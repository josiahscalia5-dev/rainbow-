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


def read_spz_full(path):
    """All attributes of an SPZ v2 file (SH degree 0): xyz, log scales, quaternion (w, x, y, z), opacity logit, SH DC."""
    raw = gzip.decompress(open(path, 'rb').read())
    magic, version, n, sh, frac, flags, _ = struct.unpack_from('<IIIBBBB', raw, 0)
    assert magic == 0x5053474e and version == 2 and sh == 0, (hex(magic), version, sh)
    o = 16
    pos = np.frombuffer(raw, np.uint8, n * 9, o).reshape(n, 3, 3).astype(np.int32); o += n * 9
    v = pos[..., 0] | (pos[..., 1] << 8) | (pos[..., 2] << 16)
    xyz = np.where(v & 0x800000, v - (1 << 24), v).astype(np.float32) / (1 << frac)
    a = np.frombuffer(raw, np.uint8, n, o).astype(np.float32) / 255.0; o += n
    col = np.frombuffer(raw, np.uint8, n * 3, o).reshape(n, 3).astype(np.float32); o += n * 3
    sc = np.frombuffer(raw, np.uint8, n * 3, o).reshape(n, 3).astype(np.float32) / 16.0 - 10.0; o += n * 3
    rq = np.frombuffer(raw, np.uint8, n * 3, o).reshape(n, 3).astype(np.float32) / 127.5 - 1.0; o += n * 3
    w = np.sqrt(np.clip(1.0 - (rq ** 2).sum(1), 0, 1))
    a = np.clip(a, 1e-4, 1 - 1e-4)
    return {'xyz': xyz, 'scale': sc, 'rot': np.c_[w, rq], 'opacity': np.log(a / (1 - a)), 'dc': (col / 255.0 - 0.5) / 0.15}


def write_ply(path, d):
    """Standard 3D Gaussian splat PLY (binary little endian)."""
    n = len(d['xyz'])
    props = ['x', 'y', 'z', 'f_dc_0', 'f_dc_1', 'f_dc_2', 'opacity', 'scale_0', 'scale_1', 'scale_2', 'rot_0', 'rot_1', 'rot_2', 'rot_3']
    hdr = 'ply\nformat binary_little_endian 1.0\nelement vertex %d\n' % n + ''.join('property float %s\n' % p for p in props) + 'end_header\n'
    arr = np.c_[d['xyz'], d['dc'], d['opacity'][:, None], d['scale'], d['rot']].astype('<f4')
    with open(path, 'wb') as f:
        f.write(hdr.encode()); f.write(arr.tobytes())


def subset_spz(src, dst, keep):
    """Write an SPZ with only the splats where `keep` is True (any version: every attribute block is sliced as raw bytes)."""
    raw = gzip.decompress(open(src, 'rb').read())
    magic, version, n, sh, frac, flags, res = struct.unpack_from('<IIIBBBB', raw, 0)
    rot_b = 4 if version >= 3 else 3
    sh_dim = {0: 0, 1: 3, 2: 8, 3: 15}[sh] * 3
    sizes = [9, 1, 3, 3, rot_b, sh_dim]
    o = 16; parts = []
    k = np.asarray(keep, bool); m = int(k.sum())
    for s in sizes:
        if s == 0: continue
        blk = np.frombuffer(raw, np.uint8, n * s, o).reshape(n, s); o += n * s
        parts.append(blk[k].tobytes())
    hdr = struct.pack('<IIIBBBB', magic, version, m, sh, frac, flags, res)
    open(dst, 'wb').write(gzip.compress(hdr + b''.join(parts) + raw[o:], 6))
    return m
