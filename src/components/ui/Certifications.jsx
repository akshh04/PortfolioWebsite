import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { certifications } from '../../data/education';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/*
 * Short courses live here rather than in the education timeline: rendering a
 * certificate at the same visual weight as a degree misrepresents both. The
 * card carries the skills it fed into, which is the part a reader actually
 * wants — the Programming & Data group on the Skills page is downstream of it.
 */
export default function Certifications() {
  if (certifications.length === 0) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2 items-stretch">
      {certifications.map((cert, index) => (
        <motion.article
          key={cert.id}
          className="glass-card gradient-border p-6 relative overflow-hidden h-full flex flex-col"
          style={{ '--tag-accent': cert.color, '--item-accent': cert.color }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: index * 0.08, ease: EASE_OUT_EXPO }}
          whileHover={{ y: -4 }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, ${cert.color}, transparent)` }}
            aria-hidden="true"
          />

          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: `${cert.color}1f`, border: `1px solid ${cert.color}3d` }}
              aria-hidden="true"
            >
              {cert.icon}
            </div>
            <div className="min-w-0">
              <h3
                className="font-bold text-base leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                {cert.title}
              </h3>
              <p className="accent-text text-sm font-medium mt-1">
                {cert.issuer}
              </p>
              <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Award size={11} aria-hidden="true" />
                {cert.period}
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {cert.description}
          </p>

          {/* mt-auto keeps the chip rows aligned across cards whose
              descriptions run to different lengths. */}
          <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0 mt-auto">
            {cert.skills.map((skill) => (
              <li key={skill} className="tag-chip">
                {skill}
              </li>
            ))}
          </ul>
        </motion.article>
      ))}
    </div>
  );
}
