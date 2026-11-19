# Screen 06 playable crest result

**Partial visual candidate.** Six units into the swim, a separate raised cyan-magenta water arm now curves over a visible section of recessed purple washer metal. The mesh has a real underside that remains attached to the bank as the camera turns. At three units the gap is still largely hidden. Farther along, the bank ends too abruptly and the wall slots appear too large from the steering positions. The approved opening remains recognizable. The complete level still needs visual work.

The first experiment cut into the foreground water and exposed a break that looked unnatural during movement. It was rejected. The reviewed version restores the continuous foreground water and builds a separate curved upper arm and underside. Benny’s appearance and movement were held fixed in this test. See [the independent visual review](checks/INDEPENDENT_VISUAL_REVIEW.md) and [the geometry evidence](diagnostics/geometry-evidence.md).

The artist’s opening and all native game stills measure 864 × 1536. Pixelmatch with threshold 0.1 and antialiased pixels included flagged 262,573 pixels in Claudia, 262,478 in the prior experiment, and 262,361 in this experiment out of 1,327,104 pixels. This small opening difference does not measure the fidelity of the swimming views. [Whole-frame measurements](checks/opening-pixelmatch.json)

The paired H.264 films cover the inlet, turns, exit and transition using the same simulation state, camera and steering for every recorded frame. The gameplay checks passed 8/8, collected 91 coins, advanced from 1,330 to 2,240 and retained five hearts on the successful full ride. Android assembly and package verification passed. The playable build was exercised in Chromium. Sustained frame pacing on a physical Android phone remains unverified. [Matched ride checks](checks/matched-results.json)

The retained Claudia branch and original approved artwork remain the baseline. This branch is an isolated visual experiment pending the owner’s review.
