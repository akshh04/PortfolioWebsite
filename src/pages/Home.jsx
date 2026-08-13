import React, { Suspense, lazy, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight, FileText, Mail } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import { scrollToSection } from '../lib/scroll';
import { stats } from '../data/education';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion, useIsMobile, isLowPowerDevice } from '../lib/device';

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
  const paused = useRef(false);

  useEffect(() => {
    // A cycler that keeps ticking in a background tab wakes the compositor for
    // nothing, and queues up transitions that all resolve the moment the tab
    // returns. Pause with the page instead.
    const onVisibility = () => { paused.current = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const timer = setInterval(() => {
      if (paused.current) return;
      setIndex(i => (i + 1) % roles.length);
    }, 3600);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    // min-h rather than a fixed h-8: the longest role wraps to two lines at
    // narrower desktop widths, and a hard height silently clipped the second.
    <div className="relative min-h-[2rem] flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="block w-full text-center md:text-left text-base md:text-lg font-medium"
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
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

/*
 * A 30px travel on a 0.6s linear-ish tween reads as "sliding into place".
 * A shorter distance on an ease-out-expo curve settles instead — the element
 * covers most of the distance immediately and decelerates, which is what makes
 * a staggered entrance feel smooth rather than sluggish.
 */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

export default function Home() {
  const { theme } = useTheme();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: '300px 0px' });
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  /*
   * The WebGL scene is the single most expensive thing on the page. It buys a
   * decorative backdrop that is largely hidden behind the hero copy on a phone
   * anyway, so it is skipped where it would cost the most: narrow screens,
   * low-core devices, and anyone who has asked for reduced motion. The check is
   * memoised on `isMobile` so a desktop resize past the breakpoint re-evaluates
   * but ordinary re-renders do not re-probe the hardware.
   */
  const showCanvas = useMemo(
    () => !isMobile && !reducedMotion && !isLowPowerDevice(),
    [isMobile, reducedMotion]
  );

  const handleResumeRequest = () => {
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
  };

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* Gradient orbs */}
      <GradientOrb size={600} color="rgba(124,58,237,0.18)" top="-100px" left="-150px" delay={0} />
      <GradientOrb size={500} color="rgba(6,182,212,0.14)" bottom="-100px" right="-100px" delay={2} />
      <GradientOrb size={400} color="rgba(37,99,235,0.12)" top="40%" left="40%" delay={4} mobileHidden />

      {/* Three.js canvas — behind content */}
      {showCanvas && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Suspense fallback={null}>
            <HeroCanvas active={isInView} />
          </Suspense>
        </div>
      )}

      {/* Backdrop blur behind text — adapts to theme */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none hero-backdrop"
      />

      {/*
        Hero content.

        The bottom padding is not decorative: on mobile a fixed bottom nav bar
        occupies roughly the last 90px of the viewport, and with `pb-0` the
        stats strip and the scroll cue were laid out underneath it (measured at
        375x667: stats ran to y=599 against a nav starting at y=578). Reserving
        that space here keeps every hero element in the clear on short phones
        without shrinking the section below a full viewport.
      */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-6 pt-20 pb-28 md:pt-24 md:pb-12 min-h-[100dvh] flex flex-col justify-center">
        <motion.div
          className="max-w-2xl"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center justify-center md:justify-start gap-3 mb-3 md:mb-4">
            <span className="text-sm font-medium tracking-widest uppercase text-center md:text-left"
              style={{ color: 'var(--nebula-3)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Astrophysics Researcher
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold leading-none mb-5 md:mb-4 text-center md:text-left"
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
              className="btn-primary flex items-center gap-2 py-2.5 md:py-3"
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
              className="btn-glass px-7 py-2.5 md:py-3 rounded-full font-semibold flex items-center gap-2"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText size={15} />
              Request Resume
            </motion.button>

            <motion.button
              onClick={() => scrollToSection('contact')}
              className="btn-ghost flex items-center gap-1.5 py-2.5 md:py-3"
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
            className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-8 mt-3 md:mt-14 pt-3 md:pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col">
                <span
                  className="text-2xl md:text-3xl font-extrabold gradient-text tabular-nums"
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
        {/*
          Scroll indicator — desktop and tablet only.

          On a 375x667 phone there is no band left for it: the hero fills the
          viewport, the fixed bottom nav claims the last ~90px, and the stats
          strip runs right up to it. Wherever the cue was placed it landed on
          top of either the nav or the stats grid (measured overlapping both).
          Mobile already has a persistent bottom nav and an obvious scroll
          affordance, so the cue is simply not shown there.
        */}
        <motion.div
          className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex-col items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
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
