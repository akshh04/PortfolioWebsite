// Advance only by rendered time. A paused or backgrounded scene must not
// jump to the wall clock's new position when its render loop starts again.
export function animationDelta(delta, running = true) {
  return running && Number.isFinite(delta) ? Math.max(0, Math.min(delta, 1 / 30)) : 0;
}
