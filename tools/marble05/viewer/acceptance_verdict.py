"""Screen 05 acceptance verdict (round 32 lead): python3 -I acceptance_verdict.py <run dir>
Reads test_results.json (final_acceptance.cjs) + visual_check.json (visual_check.py) from <run dir> and judges every criterion
against FIXED thresholds (written 2026-11-21 ~12:55 UTC before the first merged run; ~13:30 UTC, still before any full run, after the
user's feedback: G2 = the WHOLE level to its end, G6 >= 4 swipes per direction, G9 >= 80 % of the coins, NEW G11 no overlapping coins;
never loosened to make a run pass).
Writes <run dir>/VERDICT.json + VERDICT.md; exit code 0 only when EVERY criterion passes.
The user's eight strict points map to: G4/G5/G7 smooth left-right inside the river; G2/G3 continuous natural forward swimming;
G8 correct up/down; V1-V5 no visual errors; G1/G6/G9 no gameplay errors, real swipes control the 3D position; V4 consistent approved
artwork (colour look); the run itself = complete test beginning to end with real touch swipes on an Android-portrait emulation."""
import sys, json, os
d = sys.argv[1]
T = json.load(open(os.path.join(d, 'test_results.json')))
V = json.load(open(os.path.join(d, 'visual_check.json')))['summary']
fl = V['flicker']
C = []
def crit(cid, name, ok, value, rule):
    C.append({'id': cid, 'criterion': name, 'pass': bool(ok), 'value': value, 'rule': rule})
# ---- gameplay (test_results.json)
crit('G1', 'no page / console errors', len(T['errors']) == 0, T['errors'][:5], '0 errors')
lv = T.get('level') or {}
crit('G2', 'WHOLE level played to its end, every frame rendered', bool(lv.get('done')) and lv.get('s_end_target') is not None and T['frames'] == lv.get('done_frame', -2) + 1 and V['frames'] == T['frames'],
     {'frames': T['frames'], 'images': V['frames'], 'done': lv.get('done'), 'done_frame': lv.get('done_frame'), 's_end_target': lv.get('s_end_target'), 's_end': T['forward'].get('s_end'), 'plan': lv.get('plan')},
     'the page reports level complete (state().done) at its level end and the run stops there; one image per frame')
f = T['forward']
crit('G3', 'forward swimming continuous (no freeze, no jump)', f['freezes'] == 0 and f['min_step'] > 0 and f['max_step'] <= 1.5 * f['min_step'] + 0.02, f, 'freezes 0, every per-frame step > 0 and <= 1.5 x min step + 0.02')
la = T['lateral']
crit('G4', 'left / right smooth (no teleport)', la['teleports_over_0_06'] == 0, {'max_step_per_frame': la['max_step_per_frame'], 'teleports': la['teleports_over_0_06']}, '|d lat| per frame <= 0.06 in every frame')
crit('G5', 'Benny stays inside the river', la.get('max_abs_lat', 9) <= 0.30, la.get('max_abs_lat'), '|lat| <= 0.30 (river half-width ~0.30-0.35)')
dirs = T.get('swipe_directions', {})
crit('G6', 'every real touch swipe produced the intended move; each direction used repeatedly', T.get('swipes_ok') == T['swipes_sent'] and T['swipes_sent'] >= 10 and all(dirs.get(d, 0) >= 4 for d in ('left', 'right', 'up', 'down')),
     {'ok': T.get('swipes_ok'), 'sent': T['swipes_sent'], 'directions': dirs, 'failed': [(r['swipe'], r['t']) for r in T.get('swipe_responses', []) if not r['ok']]},
     'all swipes ok (left/right reach the expected lane, edge = stays; up = height > 0.15; down = height < -0.15), >= 4 of each direction')
crit('G7', 'all three lanes used', {-1, 0, 1} <= set(la['lanes_seen']), la['lanes_seen'], 'lanes -1, 0, +1 seen')
v = T['vertical']
crit('G8', 'up / down correct and smooth', v['max_height'] >= 0.15 and v['min_height'] <= -0.15 and v['max_step_per_frame'] <= 0.08, v, 'max height >= 0.15, min height <= -0.15, |d height| per frame <= 0.08')
co = T['coins']; nlay = len(json.load(open(os.path.join(d, 'plan.json'))).get('layout') or []) if os.path.exists(os.path.join(d, 'plan.json')) else 0
got = ((co['end'] or 0) - (co['start'] or 0)) // 10
crit('G9', 'coins collected while moving (the trail can really be followed)', got > 0 and (nlay == 0 or got >= 0.8 * nlay), {**co, 'collected': got, 'coins_in_level': nlay}, 'at least 80 % of the level\'s coins collected by the coin-following player')
cc = T.get('coin_crowding')
crit('G11', 'coins never crowd / overlap on screen', bool(cc) and cc['frames_with_overlap'] == 0, cc, 'in every frame no two visible coins (on-screen radius >= 6 px) overlap')
cam = T.get('camera')
crit('G10', 'camera smooth (no shake / sudden jump / snap turn)', bool(cam) and cam['max_move_per_frame'] <= 2 * cam['median_move_per_frame'] + 0.02 and cam['max_turn_deg_per_frame'] <= 2.5, cam, 'per-frame camera move <= 2 x median + 0.02, turn <= 2.5 deg per frame')
# ---- visual (visual_check.json)
dp = V['dark_patches']
crit('V1', 'no black patches', dp['frames_with_patches'] == 0, dp, '0 frames with a connected near-black area >= 150 px (approved artwork: largest 8 px, never counted)')
crit('V2', 'no blurry frames', V['sharpness_vs_start']['min'] >= 0.5, V['sharpness_vs_start'], 'sharpness (Laplacian variance) >= 0.5 x the start frame in every frame')
crit('V3', 'no flicker / popping', fl.get('pop_spikes', 1) == 0, {k: fl.get(k) for k in ('pop_median', 'pop_max', 'pop_spikes', 'pop_spike_frames')}, 'one-frame pop > max(3 x median, 4 levels) in 0 frames')
c0 = V.get('colour_look_frame0') or 1
crit('V4', 'approved artwork look kept all through the level', V['colour_look_vs_approved']['min'] >= 0.85 * c0, {'frame0': c0, **V['colour_look_vs_approved']}, 'hue/saturation look vs approved >= 0.85 x the start frame in every frame')
crit('V5', 'no sudden whole-frame jumps', fl['max_change'] <= 3 * max(fl['median_change'], 1e-6) or fl['max_change'] <= 25, {k: fl.get(k) for k in ('median_change', 'max_change', 'spikes_over_3x_median', 'spike_frames')}, 'max frame-to-frame change <= 3 x median, or <= 25 levels')
ok = all(c['pass'] for c in C)
json.dump({'pass': ok, 'criteria': C}, open(os.path.join(d, 'VERDICT.json'), 'w'), indent=1)
md = [f"# Screen 05 acceptance verdict: {'PASS' if ok else 'FAIL'}", '', '| id | criterion | result | value | rule |', '|---|---|---|---|---|']
md += [f"| {c['id']} | {c['criterion']} | {'PASS' if c['pass'] else '**FAIL**'} | `{json.dumps(c['value'])[:220]}` | {c['rule']} |" for c in C]
open(os.path.join(d, 'VERDICT.md'), 'w').write('\n'.join(md) + '\n')
print('\n'.join(md)); sys.exit(0 if ok else 1)
