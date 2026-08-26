import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion, useIsMobile } from '../../lib/device';

/*
 * Particle colours are theme-dependent: the dark palette is white/pale-violet,
 * which is invisible against the #fafafa light background. Each variant
 * therefore declares both palettes and the active theme picks one.
 */
const palettes = {
  calm: {
    dark:  { particles: ['#ffffff', '#c4b5fd', '#93c5fd'], links: '#93c5fd' },
    light: { particles: ['#6d28d9', '#1d4ed8', '#475569'], links: '#1d4ed8' },
  },
};

const shapes = {
  calm: {
    /*
     * `density: { enable: true }` used to sit here, and it was quietly
     * gutting the field. Density rescales the count against a 1920x1080
     * reference area, so the configured value was only ever reached on a
     * full HD screen: a 1280x860 laptop got 18 of the 35 stars, and a
     * 375x812 phone got 2 of its 18 — measured, not estimated. The field
     * read as broken because there was almost nothing in it.
     *
     * The count is scaled for small screens explicitly in buildConfig
     * below, so density was double-scaling something already handled.
     */
    number: { value: 35 },
    size: { value: { min: 0.3, max: 2 } },
    speed: 0.15,
    linkDistance: 120,
  },
};

function buildConfig(variant, theme, { isMobile }) {
  const shape = shapes[variant] || shapes.calm;
  const palette = (palettes[variant] || palettes.calm)[theme === 'light' ? 'light' : 'dark'];
  // Links need more presence on a light background to read at all.
  const linkOpacity = theme === 'light' ? 0.25 : 0.15;

  /*
   * Link lines are the expensive part of this effect: drawing them is an
   * O(n²) neighbour search every frame. On a phone — where the field is a faint
   * texture behind content and nobody is studying the constellation — the lines
   * come off entirely and the particle count is roughly halved, which turns the
   * per-frame cost from hundreds of distance checks into a few dozen draws.
   */
  const particleCount = isMobile
    ? Math.round(shape.number.value * 0.5)
    : shape.number.value;

  return {
    particles: {
      number: { ...shape.number, value: particleCount },
      color: { value: palette.particles },
      opacity: {
        value: theme === 'light' ? { min: 0.15, max: 0.55 } : { min: 0.05, max: 0.4 },
        animation: { enable: !isMobile, speed: 0.4, minimumValue: 0.05 },
      },
      size: shape.size,
      move: { enable: true, speed: shape.speed, direction: 'none', random: true, outModes: 'out' },
      links: isMobile
        ? { enable: false }
        : { enable: true, distance: shape.linkDistance, color: palette.links, opacity: linkOpacity, width: 1 },
    },
    /*
     * Interactivity.
     *
     * The canvas is `position: fixed; inset: 0` at z-index 0 with
     * `pointer-events: none`, so it can never steal a click from the page —
     * which also meant it could never *see* one. Listening on the canvas was
     * therefore dead configuration, and the field ignored the cursor
     * completely.
     *
     * `detectsOn: 'window'` is what fixes that: the engine subscribes to the
     * window's pointer events instead of the canvas's own, so the field
     * reacts while every click still passes straight through to the button
     * underneath it.
     *
     * Hover draws links from the cursor to nearby stars — the constellation
     * gesture the rest of the site is built around. It is desktop-only
     * because it is the expensive mode (a neighbour search plus a line draw
     * per frame) and because a touchscreen has no hover to give it.
     *
     * Tap/click repulses instead of pushing: `push` spawns new particles and
     * the count only ever climbs, so a visitor who taps twenty times is left
     * with a heavier page than they started with. Repulse is a fixed cost.
     */
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: { enable: !isMobile, mode: 'grab' },
        onClick: { enable: true, mode: 'repulse' },
        resize: { enable: true },
      },
      modes: {
        grab: {
          distance: 150,
          links: { opacity: theme === 'light' ? 0.5 : 0.35, color: palette.links },
        },
        repulse: {
          distance: isMobile ? 90 : 130,
          duration: 0.5,
          factor: 55,
          speed: 0.7,
          maxSpeed: 18,
          easing: 'ease-out-quad',
        },
      },
    },
    /*
     * Positioning lives here, not in a `style` prop on <Particles>.
     * @tsparticles/react v3 does not accept `style`, so the object that used
     * to be passed there — position, inset, z-index, pointer-events — was
     * silently dropped and never reached the DOM (verified: the wrapper had
     * no inline style at all). The layer only looked right because
     * tsparticles' own fullScreen default happened to apply the same values.
     * Stating it as an option makes the intent real rather than incidental.
     */
    fullScreen: { enable: true, zIndex: 0 },
    background: { color: 'transparent' },
    // Retina detection doubles the canvas pixel count for a field of 1–2px
    // dots that nobody inspects closely. Not worth 4x the fill rate on phones.
    detectRetina: !isMobile,
    // The drift is slow enough that nothing above 30 fps is perceptible, and
    // halving the frame budget is the single biggest saving available here.
    fpsLimit: isMobile ? 30 : 45,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
  };
}

// The engine is a process-wide singleton. Sharing the promise (rather than a
// boolean) means concurrent mounts await the same init instead of racing to
// load the slim bundle twice.
let enginePromise = null;

function ensureEngine() {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }
  return enginePromise;
}

export default function ParticleBackground({ variant = 'calm' }) {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    // A continuously drifting starfield is exactly what "reduce motion" is
    // asking about, and the engine has no still mode worth rendering — so the
    // slim bundle is never even loaded for those visitors.
    if (reducedMotion) return undefined;

    let mounted = true;
    ensureEngine().then(() => {
      // Guard against setting state on a component unmounted mid-init.
      if (mounted) setInit(true);
    });
    return () => {
      mounted = false;
    };
  }, [reducedMotion]);

  const config = useMemo(
    () => buildConfig(variant, theme, { isMobile }),
    [variant, theme, isMobile]
  );

  if (reducedMotion || !init) return null;

  return (
    <Particles
      // Keying on the theme forces a rebuild when the palette changes;
      // tsparticles does not re-read colours from a mutated options object.
      // The breakpoint is part of the key for the same reason — crossing it
      // changes particle count and link mode.
      key={`${variant}-${theme}-${isMobile ? 'm' : 'd'}`}
      id={`tsparticles-${variant}`}
      options={config}
    />
  );
}
