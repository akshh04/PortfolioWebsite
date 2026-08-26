import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { professionalDevelopment } from '../../data/education';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/*
 * Workshops and short programmes, rendered as a compact rail rather than as
 * more certificate cards. They are real training but not certificate-bearing
 * in the same way, and giving a two-day workshop the same tile as an assessed
 * month-long course overstates the first and buries the second.
 */
export default function TrainingList() {
  if (professionalDevelopment.length === 0) return null;

  return (
    <ul className="flex flex-col gap-3 list-none p-0 m-0">
      {professionalDevelopment.map((item, index) => (
        <motion.li
          key={item.id}
          className="glass-card p-4 sm:p-5 flex items-start gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.24), ease: EASE_OUT_EXPO }}
        >
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.28)' }}
            aria-hidden="true"
          >
            <GraduationCap size={16} style={{ color: 'var(--nebula-1-text)' }} />
          </span>

          {/*
            flex-1 is what makes the rows line up.

            Without it this block is a flex item sized to its own content, so
            every row was as wide as its longest line and no wider — which meant
            `justify-between` pinned each period to a different x. Measured at
            1440px: the four dates started at 586, 746, 706 and 537, a visible
            zigzag down what should read as a date column. Filling the row puts
            every title on one left edge and every date on one right edge.
          */}
          <div className="flex-1 min-w-0">
            {/*
              The period wraps onto its own line on a phone rather than being
              pinned to the right edge: at 375px a right-floated 'Dec 2023 –
              Jan 2024' left the title a three-word column.
            */}
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h4
                className="font-semibold text-sm leading-snug"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                {item.title}
              </h4>
              <span
                className="text-xs whitespace-nowrap mt-0.5 sm:mt-0 sm:flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {item.period}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--nebula-3-text)' }}>{item.issuer}</p>
            {/*
              Capped measure. Now that the row fills the card, an uncapped
              paragraph would run the full 1104px at 1440 — roughly 190
              characters a line, far past the ~75 the eye can track back from.
              The cap only binds on wide screens; below it the row is narrower
              than 72ch anyway.
            */}
            <p className="text-xs leading-relaxed mt-1.5 max-w-[72ch]" style={{ color: 'var(--text-secondary)' }}>
              {item.detail}
            </p>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
