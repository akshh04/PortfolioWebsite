import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { buildParticleConfig } from '../../lib/particleConfig.js';
import { useTheme } from '../../context/ThemeContext';
import { useReducedMotion, useSystemReducedMotion, usePageVisible, useIsMobile } from '../../lib/device';

// The v3 React wrapper includes its entire props object in its load-effect
// dependencies. A parent render otherwise destroys/reloads the canvas even
// when options and callbacks haven't changed. Playback must not rebuild it.
const StableParticles = memo(Particles);

// The engine is a process-wide singleton. Sharing the promise (rather than a
// boolean) means concurrent mounts await the same init instead of racing to
// load the slim bundle twice.
let enginePromise = null;

function ensureEngine() {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).catch((error) => {
      enginePromise = null;
      throw error;
    });
  }
  return enginePromise;
}

export default function ParticleBackground({ variant = 'calm' }) {
  const [init, setInit] = useState(false);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const systemReducedMotion = useSystemReducedMotion();
  const pageVisible = usePageVisible();
  const isMobile = useIsMobile();
  const containerRef = useRef(null);
  const canvasObserverRef = useRef(null);
  const running = !reducedMotion && pageVisible;
  const runningRef = useRef(running);
  runningRef.current = running;
  const particlesLoaded = useCallback(async container => {
    canvasObserverRef.current?.disconnect();
    containerRef.current = container;
    if (!container) return;
    const paintStillFrame = () => {
      if (!runningRef.current && !container.destroyed) {
        container.particles.draw({ value: 0, factor: 0 });
      }
    };
    // Resizing a canvas clears its bitmap. tsParticles resizes after a delay
    // but doesn't repaint a paused container. Observe the actual bitmap size
    // so a frozen starfield survives resize, rotation, and scrollbar changes.
    const canvas = container.canvas.element;
    if (canvas && typeof MutationObserver !== 'undefined') {
      canvasObserverRef.current = new MutationObserver(paintStillFrame);
      canvasObserverRef.current.observe(canvas, { attributes: true, attributeFilter: ['width', 'height'] });
    }
    if (runningRef.current) container.play();
    else {
      container.pause();
      // autoPlay is false: a saved pause preference (or a theme/size change
      // while paused) needs an initial still frame rather than a blank canvas.
      paintStillFrame();
    }
  }, []);

  useEffect(() => () => canvasObserverRef.current?.disconnect(), []);

  useEffect(() => {
    if (running) containerRef.current?.play();
    else containerRef.current?.pause();
  }, [running]);

  useEffect(() => {
    // A continuously drifting starfield is exactly what "reduce motion" is
    // asking about, and the engine has no still mode worth rendering — so the
    // slim bundle is never even loaded for those visitors.
    if (systemReducedMotion) return undefined;

    let mounted = true;
    ensureEngine().then(() => {
      // Guard against setting state on a component unmounted mid-init.
      if (mounted) setInit(true);
    }).catch(() => { /* Optional decoration must never block the portfolio. */ });
    return () => {
      mounted = false;
    };
  }, [systemReducedMotion]);

  const config = useMemo(
    () => buildParticleConfig(variant, theme, { isMobile }),
    [variant, theme, isMobile]
  );

  if (systemReducedMotion || !init) return null;

  return (
    <StableParticles
      // Keying on the theme forces a rebuild when the palette changes;
      // tsparticles does not re-read colours from a mutated options object.
      // The breakpoint is part of the key for the same reason — crossing it
      // changes particle count and link mode.
      key={`${variant}-${theme}-${isMobile ? 'm' : 'd'}`}
      id={`tsparticles-${variant}`}
      options={config}
      particlesLoaded={particlesLoaded}
    />
  );
}
