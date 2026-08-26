import React from 'react';
import { motion } from 'framer-motion';
import { education } from '../../data/education';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/*
 * One markup tree, two layouts.
 *
 * This component used to render each entry twice — a `hidden md:flex` desktop
 * block and a `flex md:hidden` mobile block — so every degree existed twice in
 * the DOM. `display:none` hides a node from sight but not from an accessibility
 * tree walk of the document, so a screen reader announced each qualification
 * twice, and framer-motion animated two copies of every card.
 *
 * Flex `order` does the same job with one copy: the dot column is order-2 on
 * desktop (centre) and first on mobile (rail on the left), and the card takes
 * slot 1 or 3 depending on which side it belongs to.
 */
function TimelineItem({ item, index }) {
  const isLeft = item.side === 'left';

  return (
    <div className="flex items-start md:items-center gap-4 md:gap-0 mb-8 md:mb-10">
      {/* Node marker — left rail on mobile, centre column on desktop */}
      <div className="flex-shrink-0 w-4 flex justify-center pt-2 md:pt-0 md:order-2 md:w-2/12">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.08 + 0.15 }}
          className="block w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2"
          style={{
            background: item.color,
            // border-white vanished against the light theme's #fafafa page;
            // matching the page background keeps the ring visible in both.
            borderColor: 'var(--bg)',
            boxShadow: `0 0 16px ${item.color}80`,
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        className={`glass-card gradient-border p-5 sm:p-6 flex-1 min-w-0 md:flex-none md:w-5/12 ${
          isLeft ? 'md:order-1' : 'md:order-3'
        }`}
        // ±60px pushed the card past the viewport edge for the duration of the
        // animation, so it was visibly clipped as it slid in. ±28 stays inside
        // the gutter at every width.
        // --item-accent tints this card's .accent-text children; the raw
        // colour stays on the bar, the dot and the badge border, which are
        // non-text and only need 3:1.
        style={{ '--item-accent': item.color }}
        initial={{ opacity: 0, x: isLeft ? -28 : 28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT_EXPO }}
        whileHover={{ y: -4 }}
      >
        <div
          className="h-0.5 mb-4 rounded-full"
          style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
        />

        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">
            {item.icon}
          </span>
          <div className="min-w-0">
            <h3
              className="font-bold text-base leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              {item.degree}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {item.period}
            </p>
          </div>
        </div>

        <p className="accent-text font-medium text-sm mb-1">
          {item.institution}
        </p>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          {item.university}
        </p>

        {(item.grade || item.ongoing) && (
          <div
            className="accent-text inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{
              background: `${item.color}20`,
              border: `1px solid ${item.color}40`,
            }}
          >
            {item.ongoing && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: item.color }}
                aria-hidden="true"
              />
            )}
            {item.grade || 'In progress'}
          </div>
        )}

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {item.description}
        </p>
      </motion.div>

      {/* Desktop counterweight — keeps the card in its half of the row */}
      <div className={`hidden md:block md:w-5/12 ${isLeft ? 'md:order-3' : 'md:order-1'}`} />
    </div>
  );
}

export default function Timeline() {
  return (
    <div className="relative">
      {/*
        A single continuous rail replaces the old per-item connector segments,
        which had to special-case the last entry to avoid trailing a line into
        empty space. The gradient fades at both ends instead.
      */}
      <div
        className="absolute top-2 bottom-2 left-2 -translate-x-1/2 md:left-1/2 w-0.5 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(124,58,237,0.5) 12%, rgba(37,99,235,0.5) 88%, transparent)',
        }}
      />

      {education.map((item, index) => (
        <TimelineItem key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
