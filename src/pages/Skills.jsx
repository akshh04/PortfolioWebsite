import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Star, BookOpen,
  Atom, Globe, Eye, Sigma, ScanSearch, Radio,
  Terminal, Database, Table, BarChart3, LineChart, Download,
  Search, PenLine, Presentation, Brain,
  Languages, MessageCircle,
  ChevronDown,
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
  Languages, MessageCircle,
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

export default function Skills() {
  /*
   * Expansion is per *category*, not per card: selecting any skill reveals
   * every description in that group at once. Reading one skill's detail in
   * isolation gave no sense of the group's depth, and comparing two of them
   * meant opening and closing each in turn.
   *
   * A Set of open category ids, so groups stay independent of one another.
   */
  const [openCategories, setOpenCategories] = useState(() => new Set());

  const toggleCategory = (id) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative overflow-hidden">

      <GradientOrb size={550} color="rgba(124,58,237,0.13)" top="-100px" right="-100px" delay={0} />
      <GradientOrb size={450} color="rgba(6,182,212,0.11)" bottom="100px" left="-100px" delay={2} />
      <GradientOrb size={350} color="rgba(37,99,235,0.1)" top="50%" right="30%" delay={4} mobileHidden />

      <div className="section-shell max-w-6xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Technical &amp; Domain</p>
          {/* h2, not h1 — one document, one h1 (the hero name). */}
          <h2 className="section-title">Skills &amp; <span className="gradient-text">Expertise</span></h2>
          <p className="section-subtitle mx-auto">
            Built through research, coursework, and hands-on astronomical work.
            Select any skill to reveal the detail behind its whole group.
          </p>
        </motion.div>

        {/* Skill categories */}
        <div className="space-y-14">
          {skillCategories.map((category) => {
            const CategoryIcon = iconRegistry[category.icon] || Star;
            const isOpen = openCategories.has(category.id);
            const groupId = `skills-group-${category.id}`;

            return (
              <motion.section
                key={category.id}
                aria-labelledby={`skills-${category.id}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${category.color}20`, border: `1px solid ${category.color}40` }}
                  >
                    <CategoryIcon size={20} style={{ color: category.color }} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    {/*
                      .accent-text rather than the raw category colour.

                      These headings were painting `category.color` directly,
                      which is tuned to be a good *surface* tint, not readable
                      type: measured on the light theme's #fafafa, the cyan
                      group came in at 2.33:1, well under the 4.5:1 floor. The
                      class mixes the same colour toward white or black per
                      theme — the treatment already used for the timeline and
                      certificate accents — so each group keeps its identity
                      and stays legible in both.
                    */}
                    <h3
                      id={`skills-${category.id}`}
                      className="accent-text font-bold text-lg sm:text-xl"
                      style={{ fontFamily: 'Space Grotesk, sans-serif', '--item-accent': category.color }}
                    >
                      {category.title}
                    </h3>
                    <div
                      className="h-0.5 mt-1 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${category.color}, transparent)`, width: '120px' }}
                    />
                  </div>

                  {/*
                    An explicit group control.

                    The cards themselves toggle the group, but that is only
                    discoverable by trying it. This states the affordance in
                    words, and gives keyboard users one obvious target per
                    group rather than six that all do the same thing.
                  */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={isOpen}
                    aria-controls={groupId}
                    className="tap-target ml-auto flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold flex-shrink-0 transition-colors duration-200"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      background: isOpen ? `${category.color}1f` : 'var(--surface)',
                      border: `1px solid ${isOpen ? `${category.color}55` : 'var(--border)'}`,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {/*
                      Fixed width on the word that changes, or the whole header
                      shifts every time a group is toggled.

                      aria-hidden because the sr-only label below already
                      names the action in full — without it the button
                      announced as "Hide Hide Astrophysics Domain details".
                    */}
                    <span className="hidden sm:inline w-8 text-center" aria-hidden="true">
                      {isOpen ? 'Hide' : 'Show'}
                    </span>
                    <motion.span
                      className="flex"
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                      aria-hidden="true"
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                    <span className="sr-only">
                      {isOpen ? `Hide ${category.title} details` : `Show ${category.title} details`}
                    </span>
                  </button>
                </div>

                {/*
                  items-start: without it the grid stretches every card to the
                  tallest in its row, so opening a group left short cards with
                  a band of empty space under their description.
                */}
                <div id={groupId} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-start">
                  {category.skills.map((skill, skillIndex) => {
                    const SkillIcon = iconRegistry[skill.icon];
                    return (
                      <SkillChip
                        key={skill.name}
                        name={skill.name}
                        icon={SkillIcon}
                        desc={skill.desc}
                        expanded={isOpen}
                        onToggle={() => toggleCategory(category.id)}
                        groupId={groupId}
                        panelId={`${groupId}-${skillIndex}`}
                        // Capped: the old formula added the category index on
                        // top, so chips in the last category waited ~0.35s
                        // after coming into view before they appeared.
                        delay={Math.min(skillIndex * 0.04, 0.2)}
                        color={category.color}
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
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          className="mt-20 text-center"
        >
          <div
            className="glass-card p-8 sm:p-10 mx-auto max-w-2xl"
            style={{ border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <p className="section-eyebrow">Keep growing</p>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Always learning, always exploring
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Now deepening this toolkit through graduate research at the University of Bremen — observational
              astrophysics, computational methods, and the data pipelines that connect them.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
