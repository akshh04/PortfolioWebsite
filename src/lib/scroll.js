export const NAV_HEIGHT = 76;

export function scrollToSection(id, options = {}) {
  const element = document.getElementById(id);
  if (!element) return false;
  // Keep saved credentials links useful after moving them into Skills.
  if (element.tagName === 'DETAILS') element.open = true;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement?.dataset.motionPaused === 'true';
  const behavior = options.behavior || (reduced ? 'instant' : 'smooth');
  const navHeight = document.querySelector('nav[aria-label="Primary"]')?.getBoundingClientRect().height || NAV_HEIGHT;
  const top = id === 'home' || id === 'main-content'
    ? 0 : Math.max(0, element.getBoundingClientRect().top + window.scrollY - navHeight);
  if (options.history !== false && window.location.hash !== '#' + id) {
    window.history.pushState(null, '', '#' + id);
  }
  element.focus({ preventScroll: true });
  window.scrollTo({ top, behavior });
  return true;
}
