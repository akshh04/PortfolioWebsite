import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, useIsMobile } from '../../lib/device';

/*
 * Decorative blurred blob.
 *
 * These are the most expensive passive element on the site: four pages render
 * three each, and every one is a 350–600px box carrying an 80–120px blur. Three
 * things keep that affordable.
 *
 * 1. No `scale` in the animation. A blurred layer can be composited for free
 *    while it only translates or fades, but scaling it changes its rasterised
 *    size, so the browser must re-blur the whole box on every frame. Swapping
 *    the old `scale: [1, 1.08, 1]` for pure translation removed twelve
 *    continuous re-rasterisations without changing how the drift looks.
 * 2. The animation is suspended while the orb is outside the viewport. Every
 *    orb used to animate for the entire session regardless of what was on
 *    screen — nine of the twelve, at any moment, for nobody.
 * 3. The blur radius is capped. Past roughly 90px the visual difference is
 *    negligible while the cost keeps climbing with the radius.
 */

const MAX_BLUR = 90;

export default function GradientOrb({
  size = 400,
  color = 'var(--orb-1)',
  top, bottom, left, right,
  opacity = 1,
  animate = true,
  delay = 0,
  // Set on orbs that only exist to fill desktop whitespace. On a phone they
  // sit behind the copy where they read as haze, so they are not worth paying
  // for at all.
  mobileHidden = false,
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // An orb hidden at this breakpoint renders nothing, so there is no node to
  // observe. Computed before the effect so the effect can depend on it.
  const hidden = mobileHidden && isMobile;

  useEffect(() => {
    /*
     * `hidden` is in the dependency list, not just read inside the effect.
     * With an empty list the effect ran once, on a mount where the orb was
     * hidden and `ref.current` was therefore null — which took the
     * "no observer support" branch and pinned inView to true. Widening the
     * window past the breakpoint then rendered the orb permanently animating,
     * with no observer ever attached to pause it off-screen. Re-running on the
     * breakpoint attaches the observer the moment the node exists.
     */
    if (hidden) return undefined;

    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      // Without observer support, fall back to always-on rather than never-on.
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      // Start moving slightly before the orb scrolls in so it is never caught
      // mid-drift at the moment it appears.
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hidden]);

  if (hidden) return null;

  const blur = Math.min(size * 0.2, MAX_BLUR);

  const style = {
    width: size,
    height: size,
    background: `radial-gradient(circle, ${color}, transparent 70%)`,
    filter: `blur(${blur}px)`,
    top, bottom, left, right,
    position: 'absolute',
    borderRadius: '50%',
    pointerEvents: 'none',
    opacity,
  };

  const shouldAnimate = animate && !reducedMotion && inView;

  if (!shouldAnimate) {
    return <div ref={ref} style={style} aria-hidden="true" />;
  }

  return (
    <motion.div
      ref={ref}
      style={style}
      aria-hidden="true"
      animate={{
        opacity: [opacity * 0.75, opacity, opacity * 0.75],
        x: [0, 18, 0],
        y: [0, -18, 0],
      }}
      transition={{
        duration: 14,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
