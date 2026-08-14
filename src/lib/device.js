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
 * True when the device is unlikely to sustain a WebGL scene alongside the rest
 * of the page.
 *
 * This used to read `navigator.hardwareConcurrency <= 4 || deviceMemory <= 4`.
 * Both halves were wrong in ways that cost real visitors the hero:
 *
 *  - Privacy-hardened browsers deliberately understate these values. Brave's
 *    fingerprinting protection farbles `hardwareConcurrency` down toward 2 and
 *    suppresses `deviceMemory`, precisely so a site cannot profile the machine.
 *    A 12-core desktop on Brave therefore reported "2 cores" and was classified
 *    as low-power, so the 3-D hero silently never mounted — on hardware that
 *    renders it at full frame rate. It is a privacy signal, not a capability
 *    signal, and it cannot be read as one.
 *  - `deviceMemory` is quantised and capped at 8 by spec, so anything under
 *    roughly 6 GB reports exactly 4. The old `<= 4` test therefore excluded a
 *    large band of perfectly capable laptops.
 *
 * Core count is gone entirely: there is no threshold that separates a weak CPU
 * from a farbled one. `deviceMemory` survives only at `<= 2`, a value no
 * current desktop or mid-range phone reports, so it now flags genuinely tiny
 * devices and nothing else. Actual rendering capability is established by
 * probing WebGL — see `supportsWebGL()`.
 */
export function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false;
  const memory = navigator.deviceMemory;
  return typeof memory === 'number' && memory > 0 && memory <= 2;
}

/*
 * Cached: creating a context allocates real GPU resources, and this is called
 * from a render path. The answer cannot change during a page's lifetime.
 */
let webglSupport = null;

/**
 * Whether this browser can actually render a WebGL scene at a useful speed.
 *
 * Asking the GPU directly is the honest version of the question the CPU-spec
 * heuristic above was trying to answer by proxy. A missing context means no
 * hardware path at all; a software rasteriser means there is one, but it would
 * run this scene at a few frames a second while pinning a core.
 */
export function supportsWebGL() {
  if (webglSupport !== null) return webglSupport;
  if (typeof document === 'undefined') return (webglSupport = false);

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return (webglSupport = false);

    /*
     * WEBGL_debug_renderer_info is itself a fingerprinting surface, so the same
     * browsers that farble core counts often withhold it. Absent means unknown,
     * and unknown resolves to "yes" — refusing to render whenever we cannot
     * identify the GPU would reintroduce the exact bug this replaces.
     */
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
      if (/swiftshader|llvmpipe|softpipe|software/i.test(renderer)) {
        return (webglSupport = false);
      }
    }

    // Release the probe context rather than leaving it to the GC; browsers cap
    // how many live WebGL contexts a page may hold, and the real hero canvas
    // needs one of them.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return (webglSupport = true);
  } catch {
    return (webglSupport = false);
  }
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
