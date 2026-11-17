#!/usr/bin/env python3
"""Map times of the user's phone recording (qa/gameplay_video/source/…mp4) to game time (intro t = 0, no tap) stage by
stage. Video stage starts read from the HUD stage label in the 1 fps sheets; game starts from
qa/gameplay_video/timeline/src_match08.json `firsts`. Inside a stage the time is scaled linearly.
usage: python3 -I tools/camclear/vidmap.py 4 5 6 ...   -> prints "video_t game_t stage" per line
"""
import sys
V = [('03', 3.5), ('04', 6.5), ('05', 10.5), ('06', 16.5), ('07', 25.5), ('08', 37.5), ('09', 39.5), ('10', 40.5), ('11', 43.5), ('end', 48.9)]
G = {'03': 14.0, '04': 17.25, '05': 20.5, '06': 27.25, '07': 32.5, '08': 44.5, '09': 46.0, '10': 47.5, '11': 49.75, 'end': 53.75}
def game_t(v):
    for (s, a), (s2, b) in zip(V, V[1:]):
        if a <= v < b:
            return s, G[s] + (v - a) * (G[s2] - G[s]) / (b - a)
    raise ValueError(v)
if __name__ == '__main__':
    for x in sys.argv[1:]:
        s, g = game_t(float(x))
        print(x, round(g, 2), s)
