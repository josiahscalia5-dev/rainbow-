#!/usr/bin/env bash
# Rainbow Screen Builder — self-test on SCREEN 05 ONLY (the only screen the user has allowed). Run it after changing the skill.
#   bash validate_05.sh <scratch dir> [--no-render]
# 1. approved references unchanged (sha256 of references/*.png from scripts/reference.sha256)
# 2. gates: 01 (video) and 06 (closed until the user approves 05) are refused; nothing is created for them
# 3. workspace: new_screen_workspace.sh 05 --no-worktrees -> the kit game folder via tools/kit05/setup_kit.sh; compared with the
#    lead's round-34 workspace /tmp/rainbow_r34/lead (file lists + bake outputs byte-identical) when it exists
# 4. analysis: analyze_reference.py on 05 vs the constants MEASURED by hand in round 33 (kit_model.py VP (500, 474), ring ratio
#    1.52, painted Benny 226 x 250 px at x 86-312, painted coins from painted_coins.py)
# 5. comparison regression (deterministic, no render): the stored round-33 frames re-scored = compare_r33.json numbers exactly
# 6. fresh start frame (one render through render_slot.sh, ~1 min): scenery 77-83 % within 20 levels, SSIM 0.73-0.79 (r33: 80.0 / 0.759)
set -uo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); SKILL=$(dirname "$HERE"); REPO=$(cd "$SKILL/../../.." && pwd)
OUT=${1:?usage: validate_05.sh <scratch dir> [--no-render]}; RENDER=1; [ "${2:-}" = "--no-render" ] && RENDER=0
mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd); FAIL=0
ok() { echo "PASS  $*"; }; bad() { echo "FAIL  $*"; FAIL=1; }
cd "$REPO"

# 1
if grep ' references/' scripts/reference.sha256 | sha256sum -c --quiet - ; then ok "approved references unchanged (12 files)"; else bad "reference checksum"; fi

# 2
bash "$HERE/new_screen_workspace.sh" 01 --round 0 --ws "$OUT/gate01" >/dev/null 2>&1; r1=$?
bash "$HERE/new_screen_workspace.sh" 06 --round 0 --ws "$OUT/gate06" >/dev/null 2>&1; r6=$?
[ "$r1" = 3 ] && [ "$r6" = 4 ] && [ ! -e "$OUT/gate01" ] && [ ! -e "$OUT/gate06" ] && ok "gates: 01 refused (video), 06 refused (closed until the user approves 05)" || bad "gates (rc 01=$r1 06=$r6)"

# 3
rm -rf "$OUT/ws05"
if bash "$HERE/new_screen_workspace.sh" 05 --round 34 --no-worktrees --ws "$OUT/ws05" > "$OUT/workspace.log" 2>&1; then
  ok "workspace built: $OUT/ws05/game"
  L=/tmp/rainbow_r34/lead
  if [ -d "$L/game" ]; then
    same=1; diff -q <(ls "$L/game") <(ls "$OUT/ws05/game") >/dev/null || same=0
    for f in "$L"/kit/*.png "$L/kit/kit.json"; do cmp -s "$f" "$OUT/ws05/kit/$(basename "$f")" || { same=0; echo "      differs: $(basename "$f")"; }; done
    [ "$same" = 1 ] && ok "workspace = the lead's round-34 workspace (same files; bake outputs byte-identical)" || echo "NOTE  workspace differs from $L (expected if this tree's kit code changed since the lead's bake)"
  fi
else bad "workspace (see $OUT/workspace.log)"; fi

# 4
python3 -I "$HERE/analyze_reference.py" references/05_flow_into_the_current.png "$OUT/analysis05.json" --overlay "$OUT/analysis05_overlay.jpg" >/dev/null &&
python3 -I - "$OUT/analysis05.json" <<'PY' || FAIL=1
import json, sys
d = json.load(open(sys.argv[1])); f = 0
def chk(name, cond, val):
    global f; print(('PASS  ' if cond else 'FAIL  ') + f'analysis {name}: {val}'); f |= not cond
vx, vy = d['vanishing_point']['used']; chk('vanishing point within 40 px of the measured core (500, 474)', ((vx - 500) ** 2 + (vy - 474) ** 2) ** 0.5 <= 40, [vx, vy])
r = d['rings']['median_ratio']; chk('ring ratio 1.35-1.70 (kit_model RATIO 1.52)', r is not None and 1.35 <= r <= 1.70, r)
b = d['phone'].get('benny_box_xyxy'); chk('painted Benny x 86-312 (+-10 px), width 226 (+-25)', bool(b) and abs(b[0] - 86) <= 10 and abs(b[2] - 312) <= 10 and abs((b[2] - b[0]) - 226) <= 25, b)
hb = d['phone']['hud_rows']; chk('HUD band 105-125 phone rows (validated mask 125)', 105 <= hb <= 125, hb)
pm = d['phone_frame']; pc = [(x * pm['scale'] - pm['crop_x'], y * pm['scale'], r_ * pm['scale']) for x, y, r_ in d['coins']['xy_r_px_nearest_first']]
want = [(227, 434, 25), (274, 390, 18.4), (234, 357, 14.5), (206, 342, 11.4), (227, 325, 7.5), (244, 317, 5.4)]   # painted_coins.py (RESUME_R33)
hit = sum(any(abs(x - wx) <= 8 and abs(y - wy) <= 10 for x, y, _ in pc) for wx, wy, _ in want); chk('painted coins found (6 measured in round 33)', hit >= 5, f'{hit}/6')
dk = d['dark']['largest_px_at_phone']; chk('artwork dark spots below the 150 px dark-patch rule', dk < 150, dk)
sys.exit(f)
PY

# 5
R=qa/kit05/r33/runs
python3 -I "$HERE/compare_to_approved.py" screen:05 "$R/kit_v2/f_0000.jpg" --before "$R/current_splat_baseline/f_0000.jpg" --out "$OUT/regression" --no-pictures > /dev/null &&
python3 -I - "$OUT/regression/compare.json" <<'PY' || FAIL=1
import json, sys
d = json.load(open(sys.argv[1]))['frames']['0']; f = 0
exp = {'new': (0.645, 0.614, 24.3, 0.984, 0.715), 'before': (0.127, 0.193, 60.5, 0.548, 0.301)}   # qa/kit05/r33/compare*/ (compare_r33.py)
for k, e in exp.items():
    got = tuple(d[k][x] for x in ('share_within_20_levels', 'ssim_scenery', 'mean_abs_diff_levels', 'colour_look_corr', 'sharpness_vs_approved'))
    same = got == e; f |= not same
    print(('PASS  ' if same else 'FAIL  ') + f"regression {'kit_v2' if k == 'new' else 'splat'} frame 0 = compare_r33.py numbers {e}: got {got}")
sys.exit(f)
PY

# 6
if [ "$RENDER" = 1 ] && [ -d "$OUT/ws05/game" ]; then
  if bash "$HERE/acceptance.sh" "$OUT/ws05/game" "$OUT/start" --start --screen 05 > "$OUT/start.log" 2>&1; then
    python3 -I - "$OUT/start/compare/compare.json" <<'PY' || FAIL=1
import json, sys
r = json.load(open(sys.argv[1]))['frames']['0']['new']; s, q = r['share_within_20_levels'], r['ssim_scenery']
ok = 0.77 <= s <= 0.83 and 0.73 <= q <= 0.79
print(('PASS  ' if ok else 'FAIL  ') + f"fresh start frame: scenery {100 * s:.1f} % within 20 levels (r33 80.0), SSIM {q} (r33 0.759), mean diff {r['mean_abs_diff_levels']}, colour {r['colour_look_corr']}")
sys.exit(0 if ok else 1)
PY
  else bad "start-frame render (see $OUT/start.log)"; fi
fi
[ "$FAIL" = 0 ] && echo "VALIDATION ON SCREEN 05: ALL PASS" || echo "VALIDATION ON SCREEN 05: FAILURES ABOVE"
exit $FAIL
