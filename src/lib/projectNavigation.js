export function projectHash(slug) { return `#project/${slug}`; }
// Derive the host at runtime: localhost for review, the custom domain in production.
export function projectUrl(slug, currentUrl = window.location.href) {
  const url = new URL(currentUrl);
  url.hash = projectHash(slug);
  return url.href;
}
export function openProject(slug) {
  const hash = projectHash(slug);
  if (window.location.hash === hash) return;
  window.history.pushState({ portfolioProject: slug, returnHash: window.location.hash || '#projects' }, '', hash);
  window.dispatchEvent(new Event('hashchange'));
}
export function closeProject(slug) {
  if (window.location.hash !== projectHash(slug)) return;
  if (window.history.state?.portfolioProject === slug) window.history.back();
  else {
    window.history.replaceState(null, '', '#projects');
    window.dispatchEvent(new Event('hashchange'));
  }
}

// Replace within the same dialog session, so Close/Back still returns to the
// original list rather than stepping through every viewed case study.
export function switchProject(slug) {
  if (window.location.hash === projectHash(slug)) return;
  const state = window.history.state;
  window.history.replaceState(state?.portfolioProject ? { ...state, portfolioProject: slug } : null, '', projectHash(slug));
  window.dispatchEvent(new Event('hashchange'));
}

export function discussProject(project) {
  window.history.replaceState(null, '', '#contact');
  window.dispatchEvent(new Event('hashchange'));
  // Let the dialog release its inert background and scroll lock first.
  requestAnimationFrame(() => {
    window.dispatchEvent(new CustomEvent('discussProject', { detail: { title: project.title } }));
  });
}
