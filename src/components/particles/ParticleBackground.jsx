import React, { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useTheme } from '../../context/ThemeContext';

/*
 * Particle colours are theme-dependent: the dark palette is white/pale-violet,
 * which is invisible against the #fafafa light background. Each variant
 * therefore declares both palettes and the active theme picks one.
 */
const palettes = {
  home: {
    dark:  { particles: ['#ffffff', '#a78bfa', '#93c5fd', '#67e8f9'], links: '#7c3aed' },
    light: { particles: ['#6d28d9', '#1d4ed8', '#0891b2', '#4b5563'], links: '#6d28d9' },
  },
  calm: {
    dark:  { particles: ['#ffffff', '#c4b5fd', '#93c5fd'], links: '#93c5fd' },
    light: { particles: ['#6d28d9', '#1d4ed8', '#475569'], links: '#1d4ed8' },
  },
};

const shapes = {
  home: {
    number: { value: 65, density: { enable: true } },
    size: { value: { min: 0.5, max: 2.5 } },
    speed: 0.3,
    linkDistance: 120,
  },
  calm: {
    number: { value: 35, density: { enable: true } },
    size: { value: { min: 0.3, max: 2 } },
    speed: 0.15,
    linkDistance: 120,
  },
};

function buildConfig(variant, theme) {
  const shape = shapes[variant] || shapes.calm;
  const palette = (palettes[variant] || palettes.calm)[theme === 'light' ? 'light' : 'dark'];
  // Links need more presence on a light background to read at all.
  const linkOpacity = theme === 'light' ? 0.25 : 0.15;

  return {
    particles: {
      number: shape.number,
      color: { value: palette.particles },
      opacity: {
        value: theme === 'light' ? { min: 0.15, max: 0.55 } : { min: 0.05, max: 0.4 },
        animation: { enable: true, speed: 0.4, minimumValue: 0.05 },
      },
      size: shape.size,
      move: { enable: true, speed: shape.speed, direction: 'none', random: true, outModes: 'out' },
      links: { enable: true, distance: shape.linkDistance, color: palette.links, opacity: linkOpacity, width: 1 },
    },
    // No interactivity block: the canvas is a decorative backdrop rendered with
    // pointer-events:none, so hover/click modes could never fire. Configuring
    // them only made the engine track listeners it would never use.
    background: { color: 'transparent' },
    detectRetina: true,
    fpsLimit: 60,
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

export default function ParticleBackground({ variant = 'home' }) {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;
    ensureEngine().then(() => {
      // Guard against setting state on a component unmounted mid-init.
      if (mounted) setInit(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const config = useMemo(() => buildConfig(variant, theme), [variant, theme]);

  if (!init) return null;

  return (
    <Particles
      // Keying on the theme forces a rebuild when the palette changes;
      // tsparticles does not re-read colours from a mutated options object.
      key={`${variant}-${theme}`}
      id={`tsparticles-${variant}`}
      options={config}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
