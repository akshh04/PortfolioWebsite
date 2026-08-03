// Height of the fixed navbar — sections must clear it when scrolled to.
export const NAV_HEIGHT = 72;

// window.scrollTo({ behavior: 'smooth' }) is not covered by the CSS
// prefers-reduced-motion rules, so the preference has to be checked here.
function scrollBehavior() {
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReduced ? 'auto' : 'smooth';
}

export function scrollToSection(id) {
  const behavior = scrollBehavior();

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const element = document.getElementById(id);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
  window.scrollTo({ top, behavior });
}
