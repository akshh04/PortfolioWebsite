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
 * Whether the browser can render WebGL at all.
 *
 * This is the question the hero actually needs answered, and unlike the CPU
 * hints below it cannot be spoofed into a wrong answer — either a context
 * comes back or it does not. The probe context is released immediately;
 * browsers cap the number of live WebGL contexts and leaking one here would
 * count against the real canvas.
 */
let webglSupport = null;

export function supportsWebGL() {
  if (webglSupport !== null) return webglSupport;
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    webglSupport = Boolean(gl);
    // Hand the context back rather than waiting for GC.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }

  return webglSupport;
}

/**
 * True when the device is unlikely to sustain a WebGL scene alongside the
 * rest of the page.
 *
 * The thresholds here used to be `cores <= 4 || memory <= 4`, which quietly
 * hid the hero scene in Brave: its fingerprinting protection is on by default
 * and reports a capped, randomised `hardwareConcurrency` (commonly 2) plus a
 * spoofed `deviceMemory`, regardless of the actual machine. The same laptop
 * therefore showed the planet in Chrome and a bare gradient in Brave. Firefox
 * with resistFingerprinting does the same thing, and Safari omits both APIs
 * entirely.
 *
 * So these values are treated as a weak hint, not a verdict:
 *   - the bar is dropped to 2, which no modern laptop reports honestly;
 *   - and both signals must agree, so one spoofed reading cannot decide it.
 * A device that really is this small is still caught, because a genuinely
 * low-end phone reports low values for both — and phones are already excluded
 * by the breakpoint check before this is ever consulted.
 */
export function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false;

  const cores = navigator.hardwareConcurrency;
  const memory = navigator.deviceMemory;

  const fewCores = typeof cores === 'number' && cores > 0 && cores <= 2;
  const littleMemory = typeof memory === 'number' && memory > 0 && memory <= 2;

  // Only when a browser reports both, and both are dire.
  return fewCores && littleMemory;
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
