import { useEffect, useState } from 'react';

/*
 * Device / preference probes.
 *
 * Several of the decorative layers (WebGL hero, particle field, blurred orbs)
 * are expensive enough that they need to scale down — or switch off — on small
 * or low-powered devices. They all asked the same questions in slightly
 * different ways, so the questions live here once.
 */

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function matches(query) {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(query).matches
    : false;
}

/** One-shot read, for code outside React (e.g. scroll helpers). */
export function prefersReducedMotion() {
  return matches(REDUCED_MOTION_QUERY);
}

/** Live-updating media query. Re-renders when the query flips. */
export function useMediaQuery(query) {
  const [value, setValue] = useState(() => matches(query));

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia(query);
    // The initial state was captured before this effect ran; if the viewport
    // changed in between (or the component hydrated at a different size) the
    // first read here corrects it.
    setValue(media.matches);
    const onChange = (e) => setValue(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return value;
}

export function useReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}

/** Tailwind's `md` breakpoint, so JS gating matches the CSS gating. */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * True when the device is unlikely to sustain a 60 fps WebGL scene alongside
 * the rest of the page: few cores, or a low device-memory hint. Both APIs are
 * absent on Safari, where we optimistically assume the device copes.
 */
export function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;
  if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
  if (typeof memory === 'number' && memory > 0 && memory <= 4) return true;
  return false;
}

/**
 * Tracks document visibility. Animation loops subscribe to this so a
 * background tab stops burning CPU and battery.
 */
export function usePageVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden
  );

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}
