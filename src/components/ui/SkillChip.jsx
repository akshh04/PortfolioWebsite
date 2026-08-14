import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { EASE_OUT_EXPO, VIEWPORT } from '../../lib/motion';

export default function SkillChip({ name, icon: Icon, desc, delay = 0 }) {
  const [expanded, setExpanded] = React.useState(false);
  const expandable = Boolean(desc);

  const toggle = () => {
    if (expandable) setExpanded((v) => !v);
  };

  return (
    <motion.div
      className={`glass-card gradient-border p-4 select-none ${expandable ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.45, delay, ease: EASE_OUT_EXPO }}
      whileHover={expandable ? { y: -3 } : undefined}
      whileTap={expandable ? { scale: 0.985 } : undefined}
      onClick={toggle}
      onKeyDown={(e) => {
        if (!expandable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
      /*
       * A card with no description is not a control: giving it role="button"
       * and a tab stop put it in the keyboard order promising an action it
       * does not have. Only expandable cards are interactive.
       */
      role={expandable ? 'button' : undefined}
      tabIndex={expandable ? 0 : undefined}
      aria-expanded={expandable ? expanded : undefined}
      aria-label={expandable ? `${name} — ${expanded ? 'hide' : 'show'} detail` : undefined}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(124,58,237,0.15)',
              borderRadius: 'var(--r-md)',
            }}>
            <Icon size={18} style={{ color: 'var(--nebula-1)' }} />
          </div>
        )}
        <span className="font-semibold text-sm flex-1 min-w-0" style={{
          fontFamily: 'Space Grotesk, sans-serif',
          color: 'var(--text-primary)'
        }}>
          {name}
        </span>
        {/*
          The section header tells visitors to click these cards, but nothing on
          the card itself said it could be opened — the only feedback was the
          hover glow every other card on the site also has. A chevron that turns
          on expand is the affordance that instruction was missing.
        */}
        {expandable && (
          <motion.span
            className="flex-shrink-0"
            aria-hidden="true"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            style={{ color: 'var(--text-muted)', lineHeight: 0 }}
          >
            <ChevronDown size={15} />
          </motion.span>
        )}
      </div>
      <AnimatePresence initial={false}>
        {expanded && expandable && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="mt-3 text-xs leading-relaxed"
            style={{ color: 'var(--text-secondary)', overflow: 'hidden' }}
          >
            {desc}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
