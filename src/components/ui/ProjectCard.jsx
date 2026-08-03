import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag } from 'lucide-react';

export default function ProjectCard({ project, delay = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const isUpcoming = project.status === 'upcoming';

  // Escape to close, and lock the background so the page behind the modal
  // doesn't scroll away under it.
  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <>
      <motion.div
        className="glass-card gradient-border p-6 cursor-pointer relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ 
          y: -8,
          rotateX: 2,
          rotateY: 2,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${project.color}40`,
        }}
        // --tag-accent tints this card's .tag-chip children to project.color,
        // matching the top accent bar and the "Click for details" link.
        style={{ transformStyle: 'preserve-3d', '--tag-accent': project.color }}
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
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
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

        <div className="flex flex-wrap gap-1.5">
          {project.tags.map(tag => (
            <span key={tag} className="tag-chip">
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>

        {!isUpcoming && (
          <div className="mt-4 text-xs font-medium" style={{ color: project.color }}>
            Click for details →
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
            onClick={() => setExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`project-title-${project.id}`}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} />
            <motion.div
              className="glass-card relative w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              // Set again here: the modal is portaled to document.body, so it
              // is outside the card and cannot inherit the card's accent.
              style={{ border: `1px solid ${project.color}40`, '--tag-accent': project.color }}
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-full"
                style={{ background: 'var(--surface)', cursor: 'pointer' }}
                onClick={() => setExpanded(false)}
                aria-label="Close project details"
              >
                <X size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>

              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{project.icon}</div>
                <div>
                  <h2 id={`project-title-${project.id}`} className="font-bold text-xl mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {project.title}
                  </h2>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{project.type}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Calendar size={13} />
                    {project.period}
                  </div>
                </div>
              </div>

              <div 
                className="h-px mb-6"
                style={{ background: `linear-gradient(90deg, ${project.color}40, transparent)` }}
              />

              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
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
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
