import React from 'react';
import { motion } from 'framer-motion';
import { education } from '../../data/education';
import { EASE_OUT_EXPO, VIEWPORT } from '../../lib/motion';

function TimelineItem({ item, index, isLast }) {
  const isLeft = item.side === 'left';

  const Card = (
    <motion.div
      className="glass-card gradient-border p-6 w-full"
      // ±60px pushed the card past the viewport edge for the duration of the
      // animation (measured 30px over at 768px wide), so it was visibly clipped
      // as it slid in. ±32 stays inside the gutter.
      initial={{ opacity: 0, x: isLeft ? -32 : 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -4 }}
    >
      <div
        className="h-0.5 mb-4 rounded-full"
        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
      />
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{item.icon}</span>
        <div>
          <h3
            className="font-bold text-base leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
          >
            {item.degree}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {item.period}
          </p>
        </div>
      </div>
      <p className="font-medium text-sm mb-1" style={{ color: item.color }}>
        {item.institution}
      </p>
      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
        {item.university}
      </p>
      {item.grade && (
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{
            background: `${item.color}20`,
            color: item.color,
            border: `1px solid ${item.color}40`,
          }}
        >
          {item.grade}
        </div>
      )}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {item.description}
      </p>
    </motion.div>
  );

  return (
    <div className="mb-10">
      {/* ── Desktop: three-column flex (5/12 card | 2/12 dot | 5/12 card) ── */}
      <div className="hidden md:flex items-center">
        {/* Left slot */}
        <div className="w-5/12">{isLeft && Card}</div>

        {/* Centre dot — flex child of the middle column, always on the line */}
        <div className="w-2/12 flex justify-center items-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
            className="w-4 h-4 rounded-full border-2 flex-shrink-0"
            style={{
              background: item.color,
              // border-white vanished against the light theme's near-white page;
              // matching the page background keeps the ring visible in both.
              borderColor: 'var(--bg)',
              boxShadow: `0 0 16px ${item.color}80`,
            }}
          />
        </div>

        {/* Right slot */}
        <div className="w-5/12">{!isLeft && Card}</div>
      </div>

      {/* ── Mobile: single column with left dot + connecting line ── */}
      <div className="flex md:hidden items-start gap-4">
        <div className="flex flex-col items-center pt-1 flex-shrink-0">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
            className="w-3 h-3 rounded-full border-2"
            style={{
              background: item.color,
              borderColor: 'var(--bg)',
              boxShadow: `0 0 12px ${item.color}80`,
            }}
          />
          {/* The connector joins one entry to the next, so the final entry
              must not trail a line into empty space. */}
          {!isLast && (
            <div
              className="w-0.5 flex-1 mt-1"
              style={{ background: `${item.color}40`, minHeight: '60px' }}
            />
          )}
        </div>
        <div className="flex-1 pb-4">{Card}</div>
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <div className="relative">
      {/* Vertical centre line — desktop only, perfectly centred via left-1/2 */}
      <div
        className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(124,58,237,0.5) 15%, rgba(37,99,235,0.5) 85%, transparent)',
        }}
      />

      {education.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          index={index}
          isLast={index === education.length - 1}
        />
      ))}
    </div>
  );
}
