// Use the browser's visible bounds. A second toolbar deduction creates a large
// floating gap in browsers which already exclude their controls from this area.
export function assistantViewportMetrics(viewport, layout, inputFocused = false, restingHeight = layout.height) {
  const width = Math.max(1, viewport?.width || layout.width);
  const height = Math.max(1, viewport?.height || layout.height);
  const zoomed = (viewport?.scale || 1) > 1.05;
  // Retain the unfocused height: resizes-content browsers shrink innerHeight
  // together with VisualViewport, so comparing those two misses the keyboard.
  const keyboard = inputFocused && !zoomed && Math.max(layout.height, restingHeight) - height > 120;
  // WebKit may retain its keyboard pan after dismissal. Ignore it at rest.
  const top = keyboard || zoomed ? Math.max(0, viewport?.offsetTop || 0) : 0;
  const left = Math.max(0, viewport?.offsetLeft || 0);
  return { width, height, top, left, keyboard };
}
