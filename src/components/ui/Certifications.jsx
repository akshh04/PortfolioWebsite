import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import ContentIcon from './ContentIcon';
import { certifications } from '../../data/education';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/*
 * Certificate cards, restyled to match ProjectCard: accent bar, plain emoji
 * icon, title / issuer / period header, description, and tag-chip row pinned
 * to the bottom.
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
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, delay: index * 0.08, ease: EASE_OUT_EXPO }}
          whileHover={{
            y: -3,
          }}
        >
          {/* Header: icon + title + issuer + period */}
          <div className="flex items-start gap-4 mb-4">
            <ContentIcon id={cert.id} />
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-base leading-tight mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                {cert.title}
              </h3>
              <p className="accent-text text-xs font-medium mb-1">{cert.issuer}</p>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={14} aria-hidden="true" />
                <span>{cert.period}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {cert.description}
          </p>

          {/* Tags — pinned to bottom */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {cert.skills.map((skill) => (
              <span key={skill} className="tag-chip">
                {skill}
              </span>
            ))}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
