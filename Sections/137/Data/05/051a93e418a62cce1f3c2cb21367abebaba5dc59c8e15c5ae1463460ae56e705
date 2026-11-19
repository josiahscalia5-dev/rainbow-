/**
 * Screen 05 far section (path-camera-transition-engineer, wave 8): helpers for the forced-perspective far tunnel
 * built in environment.ts (`// ---- 05 far tunnel`). Everything here is laid in the ForcedTunnel's VIRTUAL
 * straight tunnel (depth Z beyond the section start sF, offset o in the cross-section) and mapped to real
 * geometry with ft.point(), so it continues the real near/mid tunnel without a seam at the locked 05 eye.
 */
import * as THREE from 'three';
import type { ForcedTunnel } from './tube';

/** QA only: the far block publishes its tunnel + river path here (read by qa scripts via dynamic import) */
export const far05Debug: Record<string, unknown> = {};
