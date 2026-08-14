import React from 'react';
import { motion } from 'framer-motion';
import GradientOrb from '../components/ui/GradientOrb';
import ProjectCard from '../components/ui/ProjectCard';
import { scrollToSection } from '../lib/scroll';
import { projects } from '../data/projects';
import { EASE_OUT_EXPO, VIEWPORT } from '../lib/motion';

export default function Projects() {
  return (
    <div className="relative overflow-hidden">

      <GradientOrb size={500} color="rgba(124,58,237,0.14)" top="-80px" left="-100px" delay={0} />
      <GradientOrb size={450} color="rgba(37,99,235,0.12)" bottom="150px" right="-80px" delay={2} />
      <GradientOrb size={350} color="rgba(6,182,212,0.1)" top="40%" left="50%" delay={4} mobileHidden />

      <div className="section-shell max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Research & Work</p>
          <h1 className="section-title">My <span className="gradient-text">Projects</span></h1>
          <p className="section-subtitle mx-auto">
            A collection of research projects, literature reviews, and conference presentations. 
            Click any card to read the full description.
          </p>
        </motion.div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} delay={index * 0.08} />
          ))}
        </div>

        {/* Call to collaborate */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="mt-20 text-center"
        >
          <div
            className="glass-card inline-block p-8"
            style={{
              border: '1px solid rgba(124,58,237,0.25)',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))',
            }}
          >
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              Interested in collaboration or have a research opportunity?
            </p>
            <h3 className="text-xl font-bold gradient-text mb-1" 
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Let's explore the universe together
            </h3>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
              // py-2 px-1 keeps the link visually where it was while giving it
              // a target tall enough to hit reliably on a touchscreen — it was
              // a 20px-high strip.
              className="inline-flex items-center gap-2 mt-3 py-2 px-1 text-sm font-medium"
              style={{ color: 'var(--eyebrow)' }}
            >
              Get in touch →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
