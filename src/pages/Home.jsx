import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight, FileText, Mail } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import { scrollToSection } from '../lib/scroll';
import { stats } from '../data/education';
import { useTheme } from '../context/ThemeContext';

// Lazy so three.js stays off the initial/preloader critical path.
const HeroCanvas = lazy(() => import('../components/three/HeroCanvas'));

const roles = [
  'Astrophysics Researcher',
  'Exploring Dark Matter & Galaxy Rotation Curves',
  'Observational Astronomer in the Making',
  'Physics Graduate | Aspiring Astrophysicist',
  'Chasing Answers in Radio Astronomy',
  'Building Instruments, Reading the Sky'
];

function RoleCycler() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % roles.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center md:justify-start text-base md:text-lg font-medium"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  const { theme } = useTheme();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: "300px 0px" });

  const handleResumeRequest = () => {
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
  };

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* Gradient orbs */}
      <GradientOrb size={600} color="rgba(124,58,237,0.18)" top="-100px" left="-150px" delay={0} />
      <GradientOrb size={500} color="rgba(6,182,212,0.14)" bottom="-100px" right="-100px" delay={2} />
      <GradientOrb size={400} color="rgba(37,99,235,0.12)" top="40%" left="40%" delay={4} />

      {/* Three.js canvas — behind content */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Suspense fallback={null}>
          <HeroCanvas active={isInView} />
        </Suspense>
      </div>

      {/* Backdrop blur behind text — adapts to theme */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none hero-backdrop"
      />

      {/* Hero content */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 pt-20 pb-0 md:pt-24 md:pb-12 min-h-[100dvh] flex flex-col justify-center">
        <motion.div
          className="max-w-2xl -mt-16 md:-mt-0"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="text-sm font-medium tracking-widest uppercase text-center md:text-left"
              style={{ color: 'var(--nebula-3)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Astrophysics Researcher
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold leading-none mb-8 md:mb-4 text-center md:text-left"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="gradient-text">Akash Sankar</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Vigneshwaran</span>
          </motion.h1>

          {/* Role cycler — hidden on mobile */}
          <motion.div variants={fadeUp} className="hidden md:block mb-6 md:mb-8">
            <RoleCycler />
          </motion.div>

          {/* CTA row */}
          <motion.div 
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center md:justify-start gap-3"
          >
            {/*
              These were <a href="#…"> wrappers around <button> elements —
              interactive content nested inside a link is invalid HTML and
              gives assistive tech two conflicting controls for one action.
              They are plain buttons now, scrolling with the same nav offset.
            */}
            <motion.button
              onClick={() => scrollToSection('projects')}
              className="btn-primary flex items-center gap-2"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="flex items-center gap-2">
                View My Work
                <ArrowRight size={16} />
              </span>
            </motion.button>

            <motion.button
              onClick={handleResumeRequest}
              className="btn-glass px-7 py-3 rounded-full font-semibold flex items-center gap-2"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText size={15} />
              Request Resume
            </motion.button>

            <motion.button
              onClick={() => scrollToSection('contact')}
              className="btn-ghost flex items-center gap-1.5"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Mail size={15} />
              Get in Touch
            </motion.button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-8 mt-8 md:mt-14 pt-6 md:pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col">
                <span
                  className="text-3xl font-extrabold gradient-text tabular-nums"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {value}{suffix}
                </span>
                <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-xs tracking-widest uppercase" 
            style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
