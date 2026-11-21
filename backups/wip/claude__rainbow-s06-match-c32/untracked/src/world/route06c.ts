/**
 * r30 / r30b: the Screen 06 curled route in use. `&m06curl=1` = assets/textures/match06/route06curl.json (r30, tools/match06/r30_design_curl.py);
 * with `&m06sbroute=1` (or `&m06sb=1`) = route06sb.json (r30b storyboard keys: curl right + descend, sweeping left bend, late right turn into
 * 07, tools/match06/r30b_design_sb.py). Same keys / structure, so course.ts, coins.ts and match06.ts read either.
 */
import route06curl from '../../assets/textures/match06/route06curl.json';
import route06sb from '../../assets/textures/match06/route06sb.json';

const QS = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
export const SB_ROUTE = QS?.get('m06sb') === '1' || QS?.get('m06sbroute') === '1';
export const ROUTE06C: typeof route06curl = SB_ROUTE ? (route06sb as typeof route06curl) : route06curl;
