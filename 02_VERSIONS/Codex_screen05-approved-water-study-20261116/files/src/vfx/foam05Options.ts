/** Independent Screen 05 foam study; leaves all river geometry/material switches unchanged. */
export const ROUNDFOAM05 = (() => {
  try {
    return (typeof location !== 'undefined' && new URLSearchParams(location.search).get('roundfoam05') === '1')
      || new URLSearchParams(import.meta.env?.VITE_RAINBOW_Q05 ?? '').get('roundfoam05') === '1';
  } catch { return false; }
})();

/** New reference-led study. This does not enable or alter the earlier roundfoam05 variant. */
export const REFERENCEFOAM05 = (() => {
  try {
    return (typeof location !== 'undefined' && new URLSearchParams(location.search).get('reference05') === '1')
      || new URLSearchParams(import.meta.env?.VITE_RAINBOW_Q05 ?? '').get('reference05') === '1';
  } catch { return false; }
})();
