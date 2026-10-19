import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { skillCategories } from '../data/skills';
import { scrollToSection } from '../lib/scroll';
import Certificates from './Certificates';

const evidence = {
  astrophysics: { label: 'Applied in radio astronomy instrumentation', href: '#experience' },
  programming: { label: 'Python in practice: Exoplanet Explorer', href: 'https://exoexplorer.streamlit.app/' },
  research: { label: 'Explore research papers & presentations', href: '#projects' },
};

// Pair the taller domain card with Languages to balance the desktop columns.
const skillColumns = [
  [skillCategories[0], skillCategories[3]],
  [skillCategories[1], skillCategories[2]],
];

export default function Skills() {
  return (
    <div className="section-shell max-w-6xl skills-section">
      <div className="text-center mb-10">
        <p className="section-eyebrow">Tools behind the work</p>
        <h2 className="section-title">Skills &amp; <span className="gradient-text">Expertise</span></h2>
        <p className="section-subtitle mx-auto">The methods, tools, and communication skills I bring to research.</p>
      </div>
      <div className="skills-overview">
        {skillColumns.map((column, index) => <div className="skills-column" key={index}>
        {column.map(category => {
          const example = evidence[category.id];
          const external = example?.href.startsWith('https:');
          return (
            <motion.section key={category.id} className="skill-category" aria-labelledby={`skills-${category.id}`}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ '--item-accent': category.color, '--skill-order': skillCategories.indexOf(category) }}>
              <h3 id={`skills-${category.id}`} className="accent-text">{category.title}</h3>
              <dl className="skill-definitions">
                {category.skills.map(skill => <div key={skill.name}><dt>{skill.name}</dt><dd>{skill.desc}</dd></div>)}
              </dl>
              {example && <a className="skill-evidence" href={example.href}
                target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
                onClick={external ? undefined : event => { event.preventDefault(); scrollToSection(example.href.slice(1)); }}>
                {example.label}<ArrowUpRight size={15} aria-hidden="true" />
                {external && <span className="sr-only">(opens in a new tab)</span>}
              </a>}
            </motion.section>
          );
        })}
        </div>)}
      </div>
      <Certificates />
    </div>
  );
}
