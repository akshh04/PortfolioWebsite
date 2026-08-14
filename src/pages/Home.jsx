import React, { Suspense, lazy, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight, FileText, Mail } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import { scrollToSection } from '../lib/scroll';
import { requestResume } from '../lib/resume';
import { stats } from '../data/education';
import { useReducedMotion, useIsMobile, isLowPowerDevice, supportsWebGL } from '../lib/device';
import { EASE_OUT_EXPO, stagger } from '../lib/motion';

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
    /*
     * min-h rather than a fixed height: the longest role wraps to two lines at
     * narrower widths, and a hard height silently clipped the second.
     *
     * The mobile floor is two lines tall on purpose. The roles differ in
     * length, so on a phone some wrap and some do not — with a one-line floor
     * the block changed height every 3.6 seconds and shoved the CTA row and
     * the stats strip down the page with it. Reserving both lines means the
     * text swaps inside a box that never moves.
     */
    <div className="relative min-h-[2.9rem] md:min-h-[2rem] flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="block w-full text-center md:text-left text-[0.9375rem] md:text-lg font-medium leading-snug"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const heroStagger = stagger(0.08, 0.12);

/*
 * A 30px travel on a 0.6s linear-ish tween reads as "sliding into place".
 * A shorter distance on an ease-out-expo curve settles instead — the element
 * covers most of the distance immediately and decelerates, which is what makes
 * a staggered entrance feel smooth rather than sluggish.
 */
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

export default function Home() {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: '300px 0px' });
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  /*
   * The WebGL scene is the single most expensive thing on the page. It buys a
   * decorative backdrop that is largely hidden behind the hero copy on a phone
   * anyway, so it is skipped where it would cost the most: narrow screens,
   * anyone who has asked for reduced motion, genuinely tiny devices, and
   * browsers with no hardware WebGL path.
   *
   * The last of those is a capability probe rather than a guess at the
   * hardware from CPU specs — see the note on isLowPowerDevice(). Guessing
   * misfired badly on privacy-hardened browsers, which understate core count
   * by design and so lost the scene entirely on capable machines.
   *
   * Memoised on `isMobile` so a desktop resize past the breakpoint
   * re-evaluates, but ordinary re-renders do not re-probe.
   */
  const showCanvas = useMemo(
    () => !isMobile && !reducedMotion && !isLowPowerDevice() && supportsWebGL(),
    [isMobile, reducedMotion]
  );

  const handleResumeRequest = () => {
    scrollToSection('contact');
    requestResume();
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
          variants={heroStagger}
          initial="initial"
          animate="animate"
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center justify-center md:justify-start gap-3 mb-3 md:mb-4">
            {/*
              A short rule anchors the label, matching .section-eyebrow in the
              sections below so the hero introduces the same header pattern the
              rest of the page uses. Hidden on mobile, where the eyebrow is
              centred and a single leading rule would look lopsided.
            */}
            <span
              aria-hidden="true"
              className="hidden md:block h-px w-7 flex-shrink-0"
              style={{ background: 'var(--eyebrow)', opacity: 0.55 }}
            />
            <span className="text-sm font-semibold tracking-[0.18em] uppercase text-center md:text-left"
              style={{ color: 'var(--eyebrow)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Astrophysics Researcher
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            className="hero-title mb-5 md:mb-4 text-center md:text-left"
          >
            <span className="gradient-text">Akash Sankar</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Vigneshwaran</span>
          </motion.h1>

          {/*
            Role cycler. This was `hidden md:block`, so the line that says what
            the person actually does was absent on phones — the single largest
            piece of context on the page, missing for most visitors. The reason
            it was hidden was vertical space, which the tighter hero spacing
            below now affords.
          */}
          <motion.div variants={fadeUp} className="mb-5 md:mb-8">
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

            {/*
              Desktop only, and this one genuinely can be: the mobile bottom
              nav carries a permanent Contact tab, so on a phone this button is
              a third route to a destination already one tap away — while the
              row it occupies is 56px of the only screen where vertical space
              is contested. At 375x667 all three buttons stack, and that third
              row pushed the stats strip down underneath the bottom nav.
            */}
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="btn-ghost hidden md:inline-flex items-center gap-1.5 py-2.5 md:py-3"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Mail size={15} />
              Get in Touch
            </motion.button>
          </motion.div>

          {/*
            Stats strip.

            The mobile type and gaps are deliberately smaller than a simple
            scale-down would suggest. This block sits at the bottom of a hero
            that has to finish above a fixed bottom nav, and it is the last
            thing in the column, so every pixel it spends comes out of the
            clearance. Measured at 360x640 — the tightest common phone — the
            previous sizing left exactly 0px between the last stat and the nav.
          */}
          <motion.div
            variants={fadeUp}
            className="hero-stats grid grid-cols-2 md:flex md:flex-wrap gap-x-3 gap-y-2 md:gap-8 mt-3 md:mt-14 pt-3 md:pt-8"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {stats.map(({ value, suffix, label }) => (
              <div key={label} className="flex flex-col">
                <span
                  className="text-xl md:text-3xl font-extrabold gradient-text tabular-nums leading-tight"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {value}{suffix}
                </span>
                <span className="text-[11px] md:text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
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
