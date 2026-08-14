/*
 * Résumé-request channel.
 *
 * The navbar, the hero and the contact panel all offer a "Request Résumé"
 * button; the thing that acts on it is the contact form, which prefills itself
 * and takes focus.
 *
 * This used to be a bare `window.dispatchEvent(new CustomEvent('requestResume'))`
 * with a matching listener inside Contact. Contact is lazy-loaded, so its
 * listener does not exist until its chunk has downloaded and mounted — and the
 * two buttons that fire the event live in the navbar and the hero, which are on
 * screen from the first paint. Clicking Résumé during those first moments (or
 * at any point on a slow connection) scrolled the page to a contact form that
 * had not been prefilled and had not taken focus, with no indication that
 * anything had been missed.
 *
 * Holding the request here instead means a request raised before the subscriber
 * exists is replayed the moment it appears.
 */

let pending = false;
const subscribers = new Set();

/** Fired by the Résumé buttons. Delivered now, or on subscribe if too early. */
export function requestResume() {
  if (subscribers.size === 0) {
    pending = true;
    return;
  }
  subscribers.forEach((fn) => fn());
}

/**
 * Called by the contact form. Returns an unsubscribe function.
 * Any request raised before this ran is delivered immediately.
 */
export function onResumeRequest(handler) {
  subscribers.add(handler);

  if (pending) {
    pending = false;
    // Deferred by a frame so the subscriber has finished mounting — the
    // handler focuses an input, which must exist in the DOM by then.
    requestAnimationFrame(handler);
  }

  return () => subscribers.delete(handler);
}
