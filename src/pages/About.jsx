import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Mail, GraduationCap } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import Timeline from '../components/ui/Timeline';
import { stats, memberships } from '../data/education';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../lib/device';

// Ease-out cubic: the number sprints away from zero and settles onto the final
// value, instead of the old linear ramp that just looked like a stopwatch.
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function AnimatedCounter({ value, suffix, isDecimal, label, icon, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    // Counting up *is* the animation here, so honouring the preference means
    // showing the final figure rather than running the same climb faster.
    if (reducedMotion) {
      setCount(value);
      return undefined;
    }

    /*
     * setInterval at 30ms had two problems: it is not aligned to the display's
     * refresh, so every few ticks landed in the same frame as the previous one
     * and the number visibly stuttered; and four counters meant four
     * independent timers drifting against each other. Driving this from
     * requestAnimationFrame gives one update per painted frame, and the browser
     * suspends it automatically in a background tab.
     */
    const duration = 1600;
    let raf;
    let start;

    const tick = (now) => {
      if (start === undefined) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const current = value * easeOutCubic(progress);
      setCount(isDecimal ? Math.round(current * 100) / 100 : Math.floor(current));
      if (progress < 1) raf = requestAnimationFrame(tick);
      // Land exactly on the target — easing arrives asymptotically and
      // rounding alone can leave 8.35 showing as 8.34.
      else setCount(value);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, isDecimal, reducedMotion]);

  return (
    <motion.div
      ref={ref}
      className="glass-card gradient-border p-5 sm:p-6 text-center"
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(124,58,237,0.2)' }}
    >
      <div className="text-2xl sm:text-3xl mb-2" aria-hidden="true">{icon}</div>
      <div className="text-3xl sm:text-4xl font-extrabold tabular-nums gradient-text mb-1"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {count}{suffix}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </motion.div>
  );
}

/*
 * All five pages mount together behind the preloader, so `animate` fired every
 * entrance animation on this page while it was still four screens below the
 * fold. By the time anyone scrolled here the animation had long finished and
 * the section simply appeared, fully formed — the effect was paid for and never
 * seen. `whileInView` with `once` plays it at the moment it becomes visible,
 * which is both cheaper and the thing the animation was written for.
 */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const sectionVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

const VIEWPORT = { once: true, margin: '-80px' };

const contactFacts = [
  { icon: MapPin, text: 'Bremen, Germany' },
  { icon: GraduationCap, text: 'M.Sc. Astrophysics · University of Bremen' },
  { icon: Mail, text: 'akashsankar80@gmail.com' },
];

export default function About() {
  const { theme } = useTheme();

  return (
    <div className="relative overflow-hidden">

      {/* Orbs */}
      <GradientOrb size={500} color="rgba(37,99,235,0.15)" top="-80px" right="-100px" delay={1} />
      <GradientOrb size={400} color="rgba(124,58,237,0.12)" bottom="200px" left="-80px" delay={3} />
      <GradientOrb size={350} color="rgba(6,182,212,0.1)" top="50%" right="20%" delay={5} mobileHidden />

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
            An astrophysics postgraduate chasing the parts of the universe that refuse to add up.
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
              <motion.div
                className="absolute -inset-3 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  background: 'conic-gradient(from 0deg, #7c3aed, #2563eb, #06b6d4, #7c3aed)',
                  borderRadius: '50%',
                  padding: '3px',
                }}
                aria-hidden="true"
              >
                <div className="w-full h-full rounded-full" style={{ background: 'var(--bg)', borderRadius: '50%' }} />
              </motion.div>

              {/* Profile / Logo Avatar */}
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
                  src={theme === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg'}
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
              Physics graduate, about to begin an M.Sc. in Astrophysics at the University of Bremen, with a research
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
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.15)' }}
                    aria-hidden="true"
                  >
                    <Icon size={15} style={{ color: 'var(--nebula-1-text)' }} />
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/*
          Stats grid.

          The wrapper previously declared `initial="hidden"` and a
          `staggerChildren` transition, but the children set their own
          `initial`/`whileInView` objects rather than naming variants — so they
          never joined the variant tree and the stagger was inert. The explicit
          per-child delay below is what was actually producing the cascade.
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <AnimatedCounter key={stat.label} {...stat} delay={i * 0.1} />
          ))}
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
                    <span className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{group.icon}</span>
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
