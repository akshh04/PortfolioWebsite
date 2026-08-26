import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, ExternalLink } from 'lucide-react';

/*
 * One card for both Projects and Work Experience.
 *
 * The experience section used to have a card of its own — full-width, bullets
 * on the face — which made the two sections look like different sites bolted
 * together. Everything a role needs beyond a project is optional here, so
 * project entries render exactly as they always did:
 *
 *   subtitle    employer and location, under the title on the face
 *   highlights  responsibilities, as a bullet list in the dialog
 *   link        a live URL, as a button at the foot of the dialog
 */
export default function ProjectCard({ project, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  const isUpcoming = project.status === 'upcoming';

  // Escape to close, and lock the background so the page behind the modal
  // doesn't scroll away under it.
  useEffect(() => {
    if (!expanded) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setExpanded(false);
        return;
      }

      /*
       * Focus trap. Without it, tabbing out of the dialog walked into the page
       * behind — which is hidden behind a backdrop but still fully focusable,
       * so a keyboard user ended up driving controls they could not see.
       */
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    /*
     * Scroll lock.
     *
     * The lock goes on <html>, not <body>. index.css sets `overflow-x: hidden`
     * on both, which makes <html> the element that owns the viewport
     * scrollbar — so hiding <body>'s overflow stopped the page scrolling but
     * left the scrollbar in place, freeing no width. Padding <body> to
     * "compensate" then shifted every centred element 3px left as the modal
     * opened and back again as it closed.
     *
     * `scrollbar-gutter: stable` (index.css) keeps the track reserved through
     * the lock, so on browsers that support it the content width never changes
     * and no compensation is wanted. The measurement below is the fallback for
     * browsers that ignore the gutter.
     *
     * It measures <body>'s rendered width, not root.clientWidth: clientWidth
     * reports the reserved gutter as available space, so it "grows" by 6px on
     * lock even when the layout has not moved at all — compensating for that
     * phantom width was itself pushing centred content 3px sideways.
     */
    const root = document.documentElement;
    const contentWidth = () => document.body.getBoundingClientRect().width;
    const widthBeforeLock = contentWidth();
    const previousOverflow = root.style.overflow;
    const previousPadding = root.style.paddingRight;
    root.style.overflow = 'hidden';
    const freed = contentWidth() - widthBeforeLock;
    if (freed > 0) {
      const current = parseFloat(getComputedStyle(root).paddingRight) || 0;
      root.style.paddingRight = `${current + freed}px`;
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPadding;
    };
  }, [expanded]);

  /*
   * Move focus into the dialog on open and hand it back to the card on close,
   * so the keyboard position never silently resets to the top of the document.
   * `hasOpened` exists because this effect also runs on mount, and without it
   * every card on the page would grab focus during the initial render.
   */
  const hasOpened = useRef(false);
  useEffect(() => {
    if (expanded) {
      hasOpened.current = true;
      dialogRef.current?.querySelector('button')?.focus();
    } else if (hasOpened.current) {
      openerRef.current?.focus?.();
    }
  }, [expanded]);

  return (
    <>
      <motion.div
        ref={openerRef}
        className={`glass-card gradient-border p-6 relative overflow-hidden w-full flex flex-col ${
          isUpcoming ? 'cursor-default' : 'cursor-pointer'
        }`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
        /*
         * rotateX/rotateY were doing nothing useful: a 3-D rotation needs a
         * `perspective` on the *parent* to project, and the grid has none, so
         * the card was being skewed flat rather than tilted — it just made the
         * text edges shimmer on hover. A clean lift reads better and costs one
         * composited transform.
         */
        whileHover={{
          y: -6,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${project.color}40`,
        }}
        /*
         * No press feedback on a card that cannot be pressed — and this is
         * not only cosmetic: framer-motion adds `tabIndex="0"` to any element
         * carrying a tap gesture, so the "Coming Soon" card was sitting in the
         * keyboard tab order with no role, no label and nothing to activate.
         * A keyboard user landed on a card that announced nothing at all.
         */
        whileTap={isUpcoming ? undefined : { scale: 0.99 }}
        // --tag-accent tints this card's .tag-chip children to project.color,
        // matching the top accent bar and the "Click for details" link.
        style={{ '--tag-accent': project.color, '--item-accent': project.color }}
        onClick={() => !isUpcoming && setExpanded(true)}
        onKeyDown={(e) => {
          if (isUpcoming) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(true);
          }
        }}
        role={isUpcoming ? undefined : 'button'}
        // Explicit -1 rather than undefined: belt and braces against any
        // gesture prop putting it back into the tab order.
        tabIndex={isUpcoming ? -1 : 0}
        aria-label={isUpcoming ? undefined : `${project.title} — open details`}
      >
        {/* Color accent bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
        />

        {/* Upcoming overlay */}
        {isUpcoming && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
          >
            <span className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(156,163,175,0.2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Coming Soon
            </span>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className="text-3xl leading-none flex-shrink-0" aria-hidden="true">{project.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight mb-1" 
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              {project.title}
            </h3>
            {/* Employer, for a role. A project has no subtitle and skips it. */}
            {project.subtitle && (
              <p className="accent-text text-xs font-medium mb-1">{project.subtitle}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={11} aria-hidden="true" />
              <span>{project.period}</span>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {project.shortDesc}
        </p>

        {/* mt-auto pins the tag row to the card's bottom edge, so a short
            summary no longer leaves its card's chips floating mid-height
            against a taller neighbour's. */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.tags.map(tag => (
            <span key={tag} className="tag-chip">
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        {!isUpcoming && (
          /*
             The live URL is named here but not linked here: the card itself
             carries role="button", and an anchor nested inside it would be a
             control inside a control — a keyboard user tabs onto something
             that opens the dialog and something that leaves the site, with no
             way to tell which is focused. The link lives in the dialog, where
             it can be reached and read properly.
          */
          <div className="accent-text mt-4 text-xs font-medium">
            {project.link ? 'Click for details & live link →' : 'Click for details →'}
          </div>
        )}
      </motion.div>

      {/*
        Rendered through a portal to document.body. The card lives inside
        Projects' `.relative z-10` wrapper, which is its own stacking context —
        so *any* z-index on the modal was still resolved inside that z-10 layer
        and lost to the fixed navbar (z-50) and mobile bottom nav (z-[99]),
        which both painted over the dialog. Escaping to body, plus z-[200],
        puts it above everything.
      */}
      {createPortal(
        <AnimatePresence>
          {expanded && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(false)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
            <motion.div
              ref={dialogRef}
              // max-h-[80vh] left the dialog running under the mobile bottom
              // nav on short phones; dvh tracks the real visible height and the
              // extra headroom on small screens keeps the close button reachable.
              role="dialog"
              aria-modal="true"
              aria-labelledby={`project-title-${project.id}`}
              tabIndex={-1}
              className="glass-card relative w-full max-w-2xl max-h-[85dvh] overflow-y-auto overscroll-contain p-6 sm:p-8"
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              // Set again here: the modal is portaled to document.body, so it
              // is outside the card and cannot inherit the card's accent.
              style={{ border: `1px solid ${project.color}40`, '--tag-accent': project.color }}
            >
              <button
                type="button"
                className="tap-target absolute top-4 right-4 p-2 rounded-full"
                style={{ background: 'var(--surface)', cursor: 'pointer' }}
                onClick={() => setExpanded(false)}
                aria-label="Close project details"
              >
                <X size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>

              <div className="flex items-start gap-4 mb-6 pr-10">
                <div className="text-4xl leading-none flex-shrink-0" aria-hidden="true">{project.icon}</div>
                <div>
                  <h2 id={`project-title-${project.id}`} className="font-bold text-xl mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {project.title}
                  </h2>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{project.type}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={13} aria-hidden="true" />
                    {project.period}
                  </div>
                </div>
              </div>

              <div 
                className="h-px mb-6"
                style={{ background: `linear-gradient(90deg, ${project.color}40, transparent)` }}
              />

              {project.fullDesc && (
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {project.fullDesc}
                </p>
              )}

              {/* What the role actually involved. Projects carry prose; a job
                  reads better as the list it is on a CV. */}
              {project.highlights && (
                <ul className="flex flex-col gap-2.5 list-none p-0 m-0 mb-6">
                  {project.highlights.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2.5 text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span
                        className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: project.color }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">{line}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>

              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  // noreferrer as well as noopener: without it the destination
                  // still receives this site as the referrer, and older
                  // browsers treat noopener alone as a no-op.
                  rel="noopener noreferrer"
                  // py-3, not py-2.5: measured 40px tall, under the 44px touch minimum.
                  className="btn-glass inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-full text-sm font-semibold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {project.linkLabel || 'Open the live app'}
                  {/* The label says where it goes; this says that it leaves. */}
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
