# Level 1 - proposed future direction (user, 2026-11-24 ~16:43 local) - SAVED FOR LATER, DO NOT BUILD YET

Status: **planning reference only.** Do not begin building any of these sections until Screen 05 "Flow Into the Current" is finished
and **personally approved by the user** (CLAUDE.md: never declare Screen 05 approved yourself; no Screen 06 / other screens without approval).

## Images (PENDING)
The user's message said "the attached new screen designs and four organized gameplay guides", but **no images arrived** in that message
(session 50cf5060, 2026-11-24 16:43 local; nothing new in Downloads / Desktop / Pictures either). When they arrive, save them in THIS folder
with their original file names, list them below, and commit. Until then, ask the user for them; never invent them.

| File | What it shows |
|---|---|
| (pending) | new screen designs |
| (pending) | four organized gameplay guides |

## The proposed Level 1 = ONE continuous, fast-paced washing-machine water adventure (in this order)
| Seq | Section | Notes |
|---|---|---|
| L1-A | Original Google Flow cinematic opening | existing video from the original Rainbow game (location not found on this laptop yet: ask the user; never clone the 22 GB repo) |
| L1-B | Entry into the golden washer tunnel | |
| L1-C | Fast downhill water slides | |
| L1-D | Curved tunnel twists | |
| L1-E | Circular spiral descents | |
| L1-F | Bubble Dash Chamber | |
| L1-G | Sock Rescue Tunnel | |
| L1-H | **Existing Screen 05 - Flow Into the Current** | the current Unity work; its screen ID stays "Screen 05" |
| L1-I | Crest the Rinse Arch | |
| L1-J | Dive the Washer Tube | |
| L1-K | Final Spin Chamber | |
| L1-L | Ride the Final Wave | |
| L1-M | Towel hiding area + original Google Flow cinematic ending | existing video from the original game |

**Numbering rule (user):** the sequence numbers printed on the organized visual guides are ORDER labels for this proposal only.
They must never overwrite, rename or renumber existing project screen IDs (Screen 05 stays Screen 05, the original game's screens keep
their IDs). This file uses the letters L1-A ... L1-M to avoid any clash.

## Binding rules for every future section (user)
- All playable sections physically connect through **one continuous 3D water route** (no loading cuts or teleports between them):
  Benny goes up, down, around curves, through tunnels and down exciting slides while collecting coins.
- Preserve Benny's **momentum, camera, animation, hearts and coin balance** across section boundaries.
- Every section must match the ORIGINAL Screen 05's character, colours, materials, lighting, UI and overall visual identity
  (purple perforated washer walls, polished copper-gold rings and paddles, cyan + magenta water, white soap foam, iridescent bubbles,
  gold coins, glossy purple HUD, the existing Benny).
- Use the organized visual guides (when they arrive) for the gameplay sequence; the approved Screen 05 image stays the look target.
- Same workflow as Screen 05: Claude coordinates, Unity is the game engine, Blender only for assets where it genuinely improves quality;
  reuse existing generators (`RiverPath`, `Course05Extension`, `SwimLine05`, `BennyController`, `Screen05CameraRig`) instead of rebuilding.

## Technical note for whoever builds it later (not a task now)
Screen 05's course is generated from `RiverPath` (s = distance along the river) and already extends to s ~466 at run time. A future
continuous Level 1 is most naturally a longer path whose sections are stretches of s (with height + curvature profiles for slides,
spirals and arches) that reuse the same water / foam / wall / ring generators; section changes then need no scene loads, so momentum,
camera, hearts and coins carry over automatically.
