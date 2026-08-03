import React from 'react';
import { motion } from 'framer-motion';
import GradientOrb from '../components/ui/GradientOrb';
import ProjectCard from '../components/ui/ProjectCard';
import { scrollToSection } from '../lib/scroll';
import { projects } from '../data/projects';

export default function Projects() {
  return (
    <div className="relative overflow-hidden">

      <GradientOrb size={500} color="rgba(124,58,237,0.14)" top="-80px" left="-100px" delay={0} />
      <GradientOrb size={450} color="rgba(37,99,235,0.12)" bottom="150px" right="-80px" delay={2} />
      <GradientOrb size={350} color="rgba(6,182,212,0.1)" top="40%" left="50%" delay={4} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8 md:pb-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
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
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium"
              style={{ color: 'var(--nebula-3)' }}
            >
              Get in touch →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
