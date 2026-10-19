import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ExternalLink, ArrowUpRight } from 'lucide-react';
import ContentIcon from './ContentIcon';
import ProjectPreview from './ProjectPreview';
import ProjectDialog from './ProjectDialog';

export default function ProjectCard({ project, featured = false, delay = 0, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const openerRef = useRef(null);
  const isUpcoming = project.status === 'upcoming';
  const open = event => onOpen ? onOpen(project, event.currentTarget) : setExpanded(true);
  const close = () => setExpanded(false);
  return <>
      <motion.article
        className={`glass-card project-card${featured ? ' project-featured' : ''}`}
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
          y: -3,
        }}
        style={{ '--tag-accent': 'var(--nebula-1)', '--item-accent': 'var(--nebula-1)' }}
      >
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

        {project.preview && <ProjectPreview kind={project.preview} featured={featured} />}
        <div className="project-content">
        {featured && <p className="featured-label"><span aria-hidden="true" />Featured project · Live application</p>}
        {!featured && project.slug && <p className="project-category">{project.contribution?.scope || project.type}</p>}
        <div className="flex items-start gap-4 mb-4">
          <ContentIcon id={project.slug || project.id} />
          <div className="flex-1 min-w-0">
            <h3 className="project-card-title font-bold mb-1"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              {project.title}
            </h3>
            {/* Employer, for a role. A project has no subtitle and skips it. */}
            {project.subtitle && (
              <p className="accent-text text-xs font-medium mb-1">{project.subtitle}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar size={14} aria-hidden="true" />
              <span>{project.period}</span>
            </div>
          </div>
        </div>

        {featured && <p className="featured-description">Explore distant worlds through NASA data, habitability models, and interactive visualizations.</p>}
        {project.summary ? <dl className="project-summary">
          <div><dt>Aim</dt><dd>{project.summary.aim}</dd></div>
          <div><dt>My work</dt><dd>{project.summary.contribution}</dd></div>
          <div><dt>Outcome</dt><dd>{project.summary.outcome}</dd></div>
        </dl> : <p className="project-description" style={{ color: 'var(--text-secondary)' }}>{project.shortDesc}</p>}

        {/* mt-auto pins the tag row to the card's bottom edge, so a short
            summary no longer leaves its card's chips floating mid-height
            against a taller neighbour's. */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.tags.map(tag => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>

        <div className="project-actions">
        {!isUpcoming && (
          <button ref={openerRef} type="button" className="project-open accent-text mt-4 text-xs font-medium"
            aria-label={`${project.title} — open details`} aria-haspopup="dialog"
            onClick={open}>
            {project.slug ? 'Read case study' : 'Read details'}<ArrowUpRight size={16} aria-hidden="true" />
          </button>
        )}
        {project.link && <a className="project-live" href={project.link} target="_blank" rel="noopener noreferrer">Open live app <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>}
        </div>
        </div>
      </motion.article>

      {expanded && <ProjectDialog project={project} onClose={close} openerRef={openerRef} />}
    </>;
}
