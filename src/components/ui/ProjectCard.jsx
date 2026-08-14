import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { EASE_OUT_EXPO, VIEWPORT } from '../../lib/motion';

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
        /*
         * flex-col + h-full makes every card in a grid row the same height and
         * pins the "Click for details" affordance to the bottom edge. Before
         * this, cards sized to their own text, so a row could hold a tall card
         * next to a short one with the call to action floating mid-card.
         */
        className={`glass-card gradient-border p-6 relative overflow-hidden flex flex-col h-full ${isUpcoming ? '' : 'cursor-pointer'}`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.55, delay, ease: EASE_OUT_EXPO }}
        /*
         * rotateX/rotateY were doing nothing useful: a 3-D rotation needs a
         * `perspective` on the *parent* to project, and the grid has none, so
         * the card was being skewed flat rather than tilted — it just made the
         * text edges shimmer on hover. A clean lift reads better and costs one
         * composited transform.
         */
        /*
         * The glow is keyed to the project's own colour. It used to lead with
         * `0 24px 64px rgba(0,0,0,0.5)` — a black shadow on a #05060d page,
         * i.e. the page colour, so in dark mode the lift was carried entirely
         * by the 1px ring and the card barely appeared to respond.
         */
        whileHover={isUpcoming ? undefined : {
          y: -6,
          boxShadow: `0 20px 50px -12px ${project.color}55, 0 0 0 1px ${project.color}55`,
        }}
        whileTap={isUpcoming ? undefined : { scale: 0.99 }}
        // --tag-accent tints this card's .tag-chip children to project.color,
        // matching the top accent bar and the "Click for details" link.
        style={{ '--tag-accent': project.color }}
        onClick={() => !isUpcoming && setExpanded(true)}
        onKeyDown={(e) => {
          if (isUpcoming) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(true);
          }
        }}
        role={isUpcoming ? undefined : 'button'}
        tabIndex={isUpcoming ? undefined : 0}
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
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              // Matches the card so the veil does not square off its corners.
              borderRadius: 'var(--r-lg)',
              // Above the card's own content, which follows it in source order
              // and would otherwise paint on top of the veil.
              zIndex: 2,
            }}
          >
            <span className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{ background: 'rgba(156,163,175,0.2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Coming Soon
            </span>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className="text-3xl">{project.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight mb-1" 
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={11} />
              <span>{project.period}</span>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          {project.shortDesc}
        </p>

        {/* mt-auto: the tags and the affordance below settle against the bottom
            of the card, so they line up across a row of uneven descriptions. */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.tags.map(tag => (
            <span key={tag} className="tag-chip">
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        {!isUpcoming && (
          <div
            className="mt-4 pt-3 flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: project.color, borderTop: '1px solid var(--border)' }}
          >
            Read the full description
            <ArrowUpRight size={13} />
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
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-title-${project.id}`}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
            <motion.div
              ref={dialogRef}
              /*
                max-h-[80vh] left the dialog running under the mobile bottom
                nav on short phones; dvh tracks the real visible height.

                The dialog is a flex column with a fixed header and a scrolling
                body, rather than one scrolling box. When the whole thing
                scrolled, the close button — absolutely positioned at top-right
                — scrolled off with it, so on a long description the only ways
                out were Escape or a backdrop click, neither of them signposted.
              */
              className="glass-card relative w-full max-w-2xl max-h-[85dvh] flex flex-col overflow-hidden"
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
              onClick={e => e.stopPropagation()}
              // Set again here: the modal is portaled to document.body, so it
              // is outside the card and cannot inherit the card's accent.
              style={{ border: `1px solid ${project.color}40`, '--tag-accent': project.color }}
            >
              {/* Header — stays put while the description scrolls under it. */}
              <div className="flex items-start gap-4 p-6 sm:p-8 pb-4 sm:pb-5 flex-shrink-0">
                <div className="text-4xl leading-none flex-shrink-0">{project.icon}</div>
                <div className="min-w-0 flex-1">
                  <h2 id={`project-title-${project.id}`} className="font-bold text-xl mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {project.title}
                  </h2>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{project.type}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={13} />
                    {project.period}
                  </div>
                </div>
                <button
                  className="p-2 rounded-full flex-shrink-0"
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(false)}
                  aria-label="Close project details"
                >
                  <X size={18} style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              <div
                className="h-px mx-6 sm:mx-8 flex-shrink-0"
                style={{ background: `linear-gradient(90deg, ${project.color}66, transparent)` }}
              />

              {/* Body — the only scrolling region. */}
              <div className="overflow-y-auto overscroll-contain p-6 sm:p-8 pt-5">
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                  {project.fullDesc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
