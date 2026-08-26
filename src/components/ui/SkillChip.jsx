import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
 * A skill card.
 *
 * Expansion is *not* owned here. Selecting any skill reveals the descriptions
 * for every skill in its category at once, so the open/closed state belongs to
 * the category — this component is controlled by Skills.jsx and only reports
 * that it was activated.
 *
 * The clickable surface is a real <button>, not a div carrying role="button"
 * and a hand-rolled Enter/Space handler.
 *
 * Note that taps here used to do nothing at all, for a reason that was not in
 * this file: `.gradient-border::before` covers the whole card and, being only
 * transparent rather than pointer-transparent, intercepted every event before
 * it reached this button. See the note on that rule in index.css.
 */
export default function SkillChip({
  name,
  icon: Icon,
  desc,
  delay = 0,
  expanded = false,
  onToggle,
  panelId,
  groupId,
  color = '#7c3aed',
}) {
  const expandable = Boolean(desc);
  const isOpen = expanded && expandable;
  const rgb = color.replace('#', '').match(/.{2}/g).map(x => parseInt(x, 16)).join(', ');

  return (
    <motion.div
      className="glass-card gradient-border select-none flex"
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.03, boxShadow: `0 0 24px rgba(${rgb}, 0.3)` }}
      style={{
        // The open state needs to read as open even before the description
        // finishes expanding.
        borderColor: isOpen ? `rgba(${rgb}, 0.45)` : undefined,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={!expandable}
        // Every chip in a category opens together, so they all describe the
        // same state and point at the group that state belongs to.
        aria-expanded={expandable ? isOpen : undefined}
        aria-controls={expandable ? groupId : undefined}
        className="w-full text-left p-4 flex flex-col gap-0 bg-transparent border-0"
        style={{ cursor: expandable ? 'pointer' : 'default', borderRadius: 16 }}
      >
        <span className="flex items-center gap-3 w-full">
          {Icon && (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
              style={{
                background: isOpen ? `rgba(${rgb}, 0.28)` : `rgba(${rgb}, 0.15)`,
              }}
              aria-hidden="true"
            >
              <Icon size={18} style={{ color }} />
            </span>
          )}

          <span
            className="font-semibold text-sm flex-1 min-w-0"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            {name}
          </span>
        </span>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.span
              id={panelId}
              className="block"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <span
                className="block pt-3 text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {desc}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
