import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Star, BookOpen,
  Atom, Globe, Eye, Sigma, ScanSearch, Radio,
  Terminal, Database, Table, BarChart3, LineChart, Download,
  Search, PenLine, Presentation, Brain,
} from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import SkillChip from '../components/ui/SkillChip';
import { skillCategories } from '../data/skills';

/*
 * Explicit registry instead of `import * as LucideIcons`.
 * The namespace import defeats tree-shaking and pulled the entire
 * lucide-react library (~770 kB) into the eager vendor chunk, which the
 * preloader then had to wait on before it could reveal the page.
 * Only the icons actually referenced by src/data/skills.js belong here.
 */
const iconRegistry = {
  Code2, Star, BookOpen,
  Atom, Globe, Eye, Sigma, ScanSearch, Radio,
  Terminal, Database, Table, BarChart3, LineChart, Download,
  Search, PenLine, Presentation, Brain,
};

export default function Skills() {
  return (
    <div className="relative overflow-hidden">

      <GradientOrb size={550} color="rgba(124,58,237,0.13)" top="-100px" right="-100px" delay={0} />
      <GradientOrb size={450} color="rgba(6,182,212,0.11)" bottom="100px" left="-100px" delay={2} />
      <GradientOrb size={350} color="rgba(37,99,235,0.1)" top="50%" right="30%" delay={4} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-8 md:pb-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Technical & Domain</p>
          <h1 className="section-title">Skills & <span className="gradient-text">Expertise</span></h1>
          <p className="section-subtitle mx-auto">
            Click any skill card to see more detail. Built through research, coursework, and hands-on astronomical work.
          </p>
        </motion.div>

        {/* Skill categories */}
        <div className="space-y-14">
          {skillCategories.map((category, catIndex) => {
            const CategoryIcon = iconRegistry[category.icon] || Star;

            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
              >
                {/* Category header */}
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${category.color}20`, border: `1px solid ${category.color}40` }}
                  >
                    <CategoryIcon size={20} style={{ color: category.color }} />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl" 
                      style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                      {category.title}
                    </h2>
                    <div 
                      className="h-0.5 mt-1 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${category.color}, transparent)`, width: '120px' }}
                    />
                  </div>
                </div>

                {/* Skills grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {category.skills.map((skill, skillIndex) => {
                    const SkillIcon = iconRegistry[skill.icon];
                    return (
                      <SkillChip
                        key={skill.name}
                        name={skill.name}
                        icon={SkillIcon}
                        desc={skill.desc}
                        delay={(catIndex * 0.05) + (skillIndex * 0.05)}
                      />
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 text-center"
        >
          <div 
            className="glass-card p-10 mx-auto max-w-2xl"
            style={{ border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <p className="section-eyebrow">Keep growing</p>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Always learning, always exploring
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Currently deepening expertise in observational astrophysics, computational methods, and preparing for graduate research in Germany.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
