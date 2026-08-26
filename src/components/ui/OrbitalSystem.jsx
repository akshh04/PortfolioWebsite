import React from 'react';

/*
 * The hero's backdrop for everyone who does not get the WebGL scene.
 *
 * On a phone the 3-D hero is deliberately skipped — three.js is 809 kB and the
 * scene is the most expensive thing on the site — which left the mobile hero
 * with nothing behind the copy at all. Measured at 375x812, content filled
 * roughly 440px of an 812px viewport and the rest was bare background.
 *
 * This fills that space for about 2 kB. It is pure CSS: three tilted rings,
 * each carrying a planet, rotating at different speeds and directions around a
 * glowing core. Every animation is a `transform: rotate()` on a composited
 * layer — no blur, no repaint, no JavaScript per frame — so it costs the phone
 * essentially nothing, and `prefers-reduced-motion` freezes it into a static
 * diagram that still fills the same space.
 *
 * The shape deliberately echoes the loading screen's solar system, so the site
 * opens on one image and settles into the same one.
 *
 * Rings need two nested elements: CSS custom properties do not resolve inside
 * @keyframes in any browser, so the static 3-D tilt and the animated spin
 * cannot live on the same node.
 */
export default function OrbitalSystem({ className = '' }) {
  return (
    <div className={`orbital ${className}`} aria-hidden="true">
      <div className="orbital-glow" />

      <div className="orbital-tilt orbital-tilt-1">
        <div className="orbital-ring orbital-ring-1">
          <span className="orbital-planet" />
        </div>
      </div>

      <div className="orbital-tilt orbital-tilt-2">
        <div className="orbital-ring orbital-ring-2">
          <span className="orbital-planet" />
        </div>
      </div>

      <div className="orbital-tilt orbital-tilt-3">
        <div className="orbital-ring orbital-ring-3">
          <span className="orbital-planet" />
        </div>
      </div>

      <div className="orbital-core" />
    </div>
  );
}
