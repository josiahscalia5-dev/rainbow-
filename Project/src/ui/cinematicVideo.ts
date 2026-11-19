/**
 * Optional pre-rendered cinematics (the user's Google Flow videos) shown OVER the live 3D game.
 *
 *   public/video/intro.mp4   (or .webm)  — opening: the official cartoon girl loads the towel with Benny,
 *                                          closes the washer door and walks away (replaces real-time 01)
 *   public/video/ending.mp4  (or .webm)  — optional ending, played before the real-time 11 victory frame
 *
 * If a file is missing the real-time 3D cinematic plays instead, so the game always works without them.
 * Videos are always muted (silent) and inline. Gameplay 03–10 is never replaced: the 3D scene keeps
 * running underneath (held on the matching moment) and is revealed by a cross-fade when the video ends.
 *
 * URL overrides for testing: ?introVideo=<same-origin path>, ?endingVideo=<path>, ?video=0 (disable).
 * QA captures (?qa) never play videos, so screenshots stay deterministic.
 */
export type CinematicName = 'intro' | 'ending';
export type CinematicResult = 'ended' | 'skipped' | 'failed';

/**
 * Edge-to-edge fit (no black bars, no stretching) for any clip on any phone:
 *  - 'cover' when cropping keeps at least COVER_MIN_KEEP of the clip (e.g. a 9:16 clip on a 20:9 phone
 *    keeps 80% of its width). The crop is centred on `focus` (CSS object-position).
 *  - otherwise 'fill': the whole clip is shown (contain) over a soft, blurred, zoomed copy of the SAME
 *    frames that fills the rest of the screen (e.g. a 16:9 Flow clip on a portrait phone). The fill is a
 *    tiny canvas updated per video frame, so there is only one video decode.
 */
export const COVER_MIN_KEEP = 0.78;
export type VideoFit = 'cover' | 'fill';
export function chooseVideoFit(videoW: number, videoH: number, screenW: number, screenH: number): { fit: VideoFit; keep: number } {
  if (!(videoW > 0 && videoH > 0 && screenW > 0 && screenH > 0)) return { fit: 'cover', keep: 1 };
  const va = videoW / videoH, sa = screenW / screenH;
  const keep = Math.min(va / sa, sa / va); // fraction of the clip still visible after a cover crop
  return { fit: keep >= COVER_MIN_KEEP ? 'cover' : 'fill', keep };
}

function canLoad(url: string, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      v.removeAttribute('src');
      v.load();
      resolve(ok);
    };
    v.preload = 'metadata';
    v.muted = true;
    v.onloadedmetadata = () => finish(v.duration > 0);
    v.onerror = () => finish(false);
    setTimeout(() => finish(false), timeoutMs);
    v.src = url;
  });
}

/** Returns the URL of the cinematic if one is installed (and allowed), otherwise null. */
export async function findCinematic(name: CinematicName): Promise<string | null> {
  const q = new URLSearchParams(location.search);
  if (q.has('qa') || q.get('video') === '0') return null;
  const override = q.get(`${name}Video`);
  const candidates = override && override.startsWith('/') && !override.startsWith('//')
    ? [override]
    : [`./video/${name}.mp4`, `./video/${name}.webm`];
  for (const url of candidates) {
    if (await canLoad(url)) return url;
  }
  return null;
}

/**
 * Plays a cinematic full-screen over the game. `onEnding` fires as the cross-fade starts (release the
 * held 3D scene there), and the promise resolves once the overlay is gone. Tap to skip after 0.6 s.
 */
export function playCinematic(
  url: string,
  opts: { onEnding?: (r: CinematicResult) => void; fadeMs?: number; focus?: string } = {},
): Promise<CinematicResult> {
  const fadeMs = opts.fadeMs ?? 700;
  const focus = opts.focus ?? new URLSearchParams(location.search).get('videoFocus') ?? '50% 50%';
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-cinematic', url);
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:50;background:#2a0b46;display:flex;align-items:center;justify-content:center;' +
      `transition:opacity ${fadeMs}ms ease;opacity:1;touch-action:none;`;
    const v = document.createElement('video');
    v.src = url;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = 'auto';
    v.style.cssText = `position:relative;width:100%;height:100%;object-fit:cover;object-position:${focus};`;
    // blurred fill behind a 'fill'-fitted clip (hidden while the clip is cover-fitted)
    const fillCv = document.createElement('canvas');
    fillCv.width = 48; fillCv.height = 48;
    fillCv.setAttribute('data-cinematic-fill', '');
    fillCv.style.cssText = 'position:absolute;inset:-6%;width:112%;height:112%;filter:blur(18px) saturate(1.25) brightness(0.8);display:none;';
    const fillCtx = fillCv.getContext('2d');
    let fitMode: VideoFit = 'cover';
    const applyFit = () => {
      const r = chooseVideoFit(v.videoWidth, v.videoHeight, wrap.clientWidth || innerWidth, wrap.clientHeight || innerHeight);
      fitMode = r.fit;
      v.style.objectFit = r.fit === 'cover' ? 'cover' : 'contain';
      fillCv.style.display = r.fit === 'fill' ? 'block' : 'none';
      wrap.dataset.fit = r.fit;
      wrap.dataset.keep = r.keep.toFixed(3);
    };
    const paintFill = () => {
      if (fitMode !== 'fill' || !fillCtx || v.readyState < 2) return;
      // cover-crop the frame into the small fill canvas
      const s = Math.max(fillCv.width / v.videoWidth, fillCv.height / v.videoHeight);
      const w = v.videoWidth * s, h = v.videoHeight * s;
      fillCtx.drawImage(v, (fillCv.width - w) / 2, (fillCv.height - h) / 2, w, h);
    };
    type RVFC = (cb: () => void) => number;
    const rvfc = (v as unknown as { requestVideoFrameCallback?: RVFC }).requestVideoFrameCallback?.bind(v);
    const pump = () => { if (finished) return; paintFill(); if (rvfc) rvfc(pump); else requestAnimationFrame(pump); };
    window.addEventListener('resize', applyFit);
    const hint = document.createElement('div');
    hint.textContent = 'Tap to skip';
    hint.style.cssText =
      'position:absolute;bottom:calc(24px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;' +
      'font:600 15px "Baloo 2",system-ui,sans-serif;color:#fff;opacity:0;transition:opacity .4s;' +
      'text-shadow:0 1px 4px rgba(0,0,0,.6);pointer-events:none;';
    wrap.append(fillCv, v, hint);
    document.body.append(wrap);

    let finished = false;
    const t0 = performance.now();
    const finish = (r: CinematicResult) => {
      if (finished) return;
      finished = true;
      opts.onEnding?.(r);
      wrap.style.opacity = '0';
      window.removeEventListener('resize', applyFit);
      setTimeout(() => { v.pause(); wrap.remove(); resolve(r); }, fadeMs + 50);
    };
    // edge-to-edge: crop when little is lost, otherwise whole clip over a blurred fill (never plain bars)
    v.onloadedmetadata = () => { applyFit(); pump(); };
    v.onended = () => finish('ended');
    v.onerror = () => finish('failed');
    setTimeout(() => { hint.style.opacity = '0.85'; }, 600);
    let waitingForTap = false;
    wrap.addEventListener('pointerdown', () => {
      if (waitingForTap) {
        waitingForTap = false;
        hint.textContent = 'Tap to skip';
        v.play().catch(() => finish('failed'));
        return;
      }
      if (performance.now() - t0 > 600) finish('skipped');
    });
    v.play().catch(() => {
      // autoplay refused (rare for muted inline video): the first tap starts playback instead of skipping
      waitingForTap = true;
      hint.textContent = 'Tap to play';
      hint.style.opacity = '0.85';
    });
  });
}
