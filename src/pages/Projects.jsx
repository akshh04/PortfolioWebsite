import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '../components/ui/ProjectCard';
import ProjectDialog from '../components/ui/ProjectDialog';
import { openProject, closeProject, switchProject } from '../lib/projectNavigation';
import { scrollToSection } from '../lib/scroll';
import { projects } from '../data/projects';

export default function Projects() {
  const readProject = () => projects.find(project => window.location.hash === `#project/${project.slug}`) || null;
  const [activeProject, setActiveProject] = useState(readProject);
  const openerRef = useRef(null);
  useEffect(() => {
    const revealProject = () => {
      const requested = projects.find(project => window.location.hash === `#project/${project.slug}`);
      setActiveProject(requested || null);
    };
    window.addEventListener('hashchange', revealProject);
    return () => window.removeEventListener('hashchange', revealProject);
  }, []);
  const open = (project, button) => {
    openerRef.current = button;
    openProject(project.slug);
  };
  return (
    <div className="relative overflow-hidden">

      <div className="section-shell max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">What I've produced</p>
          {/* h2, not h1 — one document, one h1 (the hero name). */}
          <h2 className="section-title">Selected <span className="gradient-text">Research &amp; Projects</span></h2>
          <p className="section-subtitle mx-auto">
            From astronomical data to research papers and presentations. Explore the work,
            or see the roles behind it in{' '}
            <a
              href="#experience"
              onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }}
              className="font-medium underline underline-offset-2"
              style={{ color: 'var(--nebula-3-text)' }}
            >
              Work&nbsp;Experience
            </a>.
          </p>
        </motion.div>

        {/* Projects grid */}
        {/*
          A list, semantically: sibling cards in a bare div announce as
          unrelated regions, with no count and no position.
        */}
        <p className="project-count mb-6">{projects.length} selected projects</p>
        <ul className="research-grid">
          {projects.map((project, index) => (
            // No `display: contents` here — several browsers drop a
            // contents-styled list item out of the accessibility tree
            // entirely, which would undo the reason for the <ul>.
            <li key={project.id} className={`flex${project.featured ? ' featured-slot' : ''}`}>
              <ProjectCard project={project} featured={project.featured} onOpen={open} delay={Math.min(index * 0.08, 0.24)} />
            </li>
          ))}
        </ul>


      </div>
      {activeProject && <ProjectDialog project={activeProject} onClose={() => closeProject(activeProject.slug)} openerRef={openerRef}
        projectList={projects} onNavigate={project => switchProject(project.slug)} />}
    </div>
  );
}
