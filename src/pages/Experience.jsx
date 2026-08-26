import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import ProjectCard from '../components/ui/ProjectCard';
import { experience, conferences } from '../data/experience';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

/*
 * Work experience, split out of Projects.
 *
 * The radio-astronomy internship used to sit in the Projects grid between a
 * literature review and a conference talk, which left a reader no way to tell
 * a job from a piece of coursework. This section holds the roles; Projects
 * holds the output. Like Certificates, it is a real top-level
 * <section id="experience"> in App.jsx so the navbar's scroll-spy has
 * something to observe and highlight against.
 *
 * Both sections render the same ProjectCard. The split is what the two
 * sections *contain*, not how they look — a second card design made the page
 * read as two sites stitched together, and the heading above each grid is
 * what distinguishes them.
 */
export default function Experience() {
  return (
    <div className="relative overflow-hidden">
      <GradientOrb size={500} color="rgba(6,182,212,0.13)" top="-80px" right="-100px" delay={0} />
      <GradientOrb size={430} color="rgba(124,58,237,0.12)" bottom="120px" left="-90px" delay={2} />
      <GradientOrb size={340} color="rgba(37,99,235,0.1)" top="45%" left="45%" delay={4} mobileHidden />

      <div className="section-shell max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="text-center mb-14"
        >
          <p className="section-eyebrow">Where I've worked</p>
          {/* h2, not h1 — one document, one h1 (the hero name). */}
          <h2 className="section-title">Work <span className="gradient-text">Experience</span></h2>
          <p className="section-subtitle mx-auto">
            Research internships and instrumentation R&amp;D — the roles behind the projects.
          </p>
        </motion.div>

        {/* A list, semantically: sibling cards in a bare div announce as
            unrelated regions, with no count and no position. */}
        {/* Same grid as Projects, so a role and a project sit on the same
            visual rhythm down the page. */}
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 list-none p-0 m-0">
          {experience.map((item, index) => (
            // No `display: contents` here — several browsers drop a
            // contents-styled list item out of the accessibility tree
            // entirely, which would undo the reason for the <ul>.
            <li key={item.id} className="flex">
              <ProjectCard project={item} delay={Math.min(index * 0.08, 0.24)} />
            </li>
          ))}
        </ul>

        {/* Conferences & seminars */}
        <section aria-labelledby="conferences-heading" className="mt-20">
          <div className="text-center mb-10">
            <p className="section-eyebrow">On the record</p>
            <h3 id="conferences-heading" className="subsection-title">
              Conferences <span className="gradient-text">&amp; Seminars</span>
            </h3>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 list-none p-0 m-0 items-stretch max-w-5xl mx-auto">
            {conferences.map((item, index) => (
              <li key={item.id} className="flex">
                <motion.article
                  className="glass-card gradient-border p-5 sm:p-6 w-full flex flex-col"
                  style={{ '--item-accent': item.color }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    <div className="min-w-0">
                      <h4
                        className="font-bold text-base leading-tight"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                      >
                        {item.name}
                      </h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {item.venue} · {item.period}
                      </p>
                    </div>
                  </div>

                  <p className="accent-text inline-flex items-center gap-1.5 text-xs font-semibold mb-3">
                    <Mic size={11} aria-hidden="true" />
                    {item.role}
                  </p>

                  <p className="text-xs leading-relaxed mt-auto" style={{ color: 'var(--text-secondary)' }}>
                    {item.description}
                  </p>
                </motion.article>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
