import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, GraduationCap, FileText } from 'lucide-react';
import { PUBLIC_CV } from '../lib/cv';
import CVNotice from '../components/ui/CVNotice';
import Timeline from '../components/ui/Timeline';
import ContentIcon from '../components/ui/ContentIcon';
import { memberships } from '../data/education';
import { useTheme } from '../context/ThemeContext';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

const VIEWPORT = { once: true, margin: '-80px' };

const contactFacts = [
  { icon: MapPin, text: 'Bremen, Germany' },
  { icon: GraduationCap, text: 'M.Sc. Physics · University of Bremen' },
  { icon: Mail, text: 'akashsankarv@gmail.com' },
];

export default function About() {
  const { theme } = useTheme();

  return (
    <div className="relative overflow-hidden">

      {/* Orbs */}

      <div className="section-shell max-w-6xl">

        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Get to know me</p>
          {/*
            h2, not h1. This is a single-page site: the hero name is the
            document's one h1, and every section below it is a level down.
            Five sibling h1 elements gave assistive tech five competing
            document titles and left the page with no usable heading outline.
          */}
          <h2 className="section-title">About <span className="gradient-text">Me</span></h2>
          <p className="section-subtitle mx-auto">
            A physics postgraduate chasing the parts of the universe that refuse to add up.
          </p>
        </motion.div>

        {/* Bio section */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center mb-20">
          {/* Photo / Avatar */}
          <motion.div
            className="flex justify-center"
            // A -60px slide is wider than the gutter on a phone, so during the
            // animation the card pushed past the viewport edge. 32px stays
            // inside the padding while reading the same way.
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <div className="relative">
              {/* Rotating gradient ring */}
              <div
                className="profile-orbit-ring absolute -inset-3 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #7c3aed, #2563eb, #06b6d4, #7c3aed)',
                  borderRadius: '50%',
                  padding: '3px',
                }}
                aria-hidden="true"
              >
                <div className="w-full h-full rounded-full" style={{ background: 'var(--bg)', borderRadius: '50%' }} />
              </div>

              {/* About portrait; the navigation logo and favicon are separate assets. */}
              <div
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden flex items-center justify-center shadow-2xl"
                style={{
                  borderRadius: '50%',
                  border: '3px solid var(--border)',
                  zIndex: 1,
                  boxShadow: theme === 'dark'
                    ? '0 0 40px rgba(124,58,237,0.4)'
                    : '0 10px 30px rgba(0,0,0,0.15)',
                  background: theme === 'dark' ? '#05060d' : '#ffffff',
                }}
              >
                <img
                  src="/akash-portrait.png"
                  alt="Akash Sankar Vigneshwaran"
                  width={224}
                  height={224}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 md:hover:scale-105"
                  style={{ borderRadius: '50%' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Exploring the cosmos, one equation at a time.
            </h3>
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Physics graduate pursuing an M.Sc. in Physics at the University of Bremen, with a research
              focus on dark matter, cosmology, and galaxy dynamics. Contributed to the development of low-noise RF
              systems for a radio telescope array and conducted independent theoretical work on dark matter candidates
              and galaxy rotation curve anomalies. Presented "Exoplanets and the Search for Alien Life" at the 44th
              Meeting of the Astronomical Society of India. Formally trained as a data analyst, and fluent in Python,
              SQL, and astronomical data analysis pipelines.
            </p>

            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {contactFacts.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(124,58,237,0.15)' }}
                    aria-hidden="true"
                  >
                    <Icon size={15} style={{ color: 'var(--nebula-1-text)' }} />
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5"><a className="cv-download" href={PUBLIC_CV.href} target="_blank" rel="noopener noreferrer">
              <FileText size={18} aria-hidden="true" />{PUBLIC_CV.label}<span className="cv-format">PDF</span><span className="sr-only"> (opens in a new tab)</span>
            </a><CVNotice /></div>
          </motion.div>
        </div>

        {/* Education timeline */}
        <section aria-labelledby="education-heading">
          <div className="text-center mb-12">
            <p className="section-eyebrow">Academic Journey</p>
            <h3 id="education-heading" className="subsection-title">
              Education <span className="gradient-text">Timeline</span>
            </h3>
          </div>
          <Timeline />
        </section>

        {/*
          Networks and memberships.

          Below the timeline rather than inside it: a club membership is not a
          qualification, and the CV keeps the two apart for the same reason.
        */}
        <section aria-labelledby="memberships-heading" className="mt-20">
          <div className="text-center mb-10">
            <p className="section-eyebrow">Where I orbit</p>
            <h3 id="memberships-heading" className="subsection-title">
              Networks <span className="gradient-text">&amp; Memberships</span>
            </h3>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 list-none p-0 m-0 items-stretch">
            {memberships.map((group, index) => (
              <li key={group.id} className="flex">
                <motion.article
                  className="glass-card gradient-border p-5 sm:p-6 w-full flex flex-col"
                  style={{ '--item-accent': group.color }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: index * 0.08, ease: EASE_OUT_EXPO }}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <ContentIcon id={group.id} />
                    <div className="min-w-0">
                      <h4
                        className="font-bold text-base leading-tight"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                      >
                        {group.name}
                      </h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {group.location} · {group.period}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mt-auto" style={{ color: 'var(--text-secondary)' }}>
                    {group.description}
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
