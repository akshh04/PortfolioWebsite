import React, { Suspense, lazy, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronDown, ArrowRight, FileText, Mail } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import OrbitalSystem from '../components/ui/OrbitalSystem';
import { scrollToSection } from '../lib/scroll';
import { stats } from '../data/education';
import { useReducedMotion, useIsMobile, isLowPowerDevice, supportsWebGL } from '../lib/device';

// Lazy so three.js stays off the initial/preloader critical path.
const HeroCanvas = lazy(() => import('../components/three/HeroCanvas'));

/*
 * The first entry used to be 'Astrophysics Researcher', which is verbatim the
 * eyebrow rendered directly above it — so the hero opened with the same line
 * printed twice, stacked, and only stopped looking like a bug 3.6s later.
 */
const roles = [
  'M.Sc. Astrophysics · University of Bremen',
  'Exploring Dark Matter & Galaxy Rotation Curves',
  'Observational Astronomer in the Making',
  'Chasing Answers in Radio Astronomy',
  'Building Instruments, Reading the Sky',
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
     * Reserved height, not a fixed one: the longest role wraps to two lines on
     * a phone and at narrower desktop widths, and a hard height clipped the
     * second. Reserving the two-line box also stops the CTAs below from
     * jumping every time the line changes length.
     */
    /*
     * items-start on mobile, not items-center.
     *
     * The box reserves two lines so the CTAs below never jump when a longer
     * role wraps — but centring a one-line role inside that reserved height
     * parked it 14px lower than it needed to be, which read as the role
     * floating away from the name it belongs to. Top-aligning halves the gap
     * (30px to 16px) without giving up the reserved space.
     *
     * 2.5rem, not 3rem: two 20px lines need exactly 40px. Measured at 375px
     * every role fits on one line (widest is 319px of 327px available), but
     * a 360px-wide Android drops the longest one onto a second, so the
     * reserve stays — just without the 8px of slack 3rem was adding.
     */
    <div className="relative min-h-[2.5rem] md:min-h-[2rem] flex items-start md:items-center justify-center md:justify-start">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="block w-full text-center md:text-left text-sm sm:text-base md:text-lg font-medium text-balance"
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
  // `useTheme()` used to be destructured here and never read, which subscribed
  // the whole hero — headline, canvas gate, stats — to the theme context and
  // re-rendered all of it on every toggle for nothing.
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { margin: '300px 0px' });
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  /*
   * The WebGL scene is the single most expensive thing on the page. It buys a
   * decorative backdrop that is largely hidden behind the hero copy on a phone
   * anyway, so it is skipped where it would cost the most: narrow screens, and
   * anyone who has asked for reduced motion.
   *
   * `supportsWebGL()` is the decisive check — it asks the browser directly
   * rather than inferring capability from CPU hints, which privacy-hardened
   * browsers deliberately misreport. See the note in lib/device.js: the old
   * hardware heuristic was hiding this scene in Brave on machines that render
   * it perfectly well.
   *
   * Memoised on `isMobile` so a desktop resize past the breakpoint
   * re-evaluates, but ordinary re-renders do not re-probe.
   */
  const showCanvas = useMemo(
    () => !isMobile && !reducedMotion && supportsWebGL() && !isLowPowerDevice(),
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

      {/*
        CSS orbital system — the backdrop for everyone the WebGL scene skips.

        Without this the mobile hero had nothing behind the copy at all:
        measured at 375x812, the content filled about 440px of an 812px
        viewport and the remainder was bare background, which is why the phone
        layout read as empty next to the desktop one. It sits slightly above
        centre so the rings frame the headline rather than hiding behind it.
      */}
      {!showCanvas && (
        /*
         * Centred on the clear band between the role line and the CTAs, not on
         * the headline. Measured with the core at 38%: it landed at y292-325
         * directly behind the role text, which dropped that text to 1.78:1
         * against the amber glow — unreadable. At 46% the brightest element
         * sits in the open window instead of behind type, which is also where
         * it does the most for the composition.
         */
        <div className="hero-orbital absolute inset-x-0 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
          <OrbitalSystem />
        </div>
      )}

      {/* Backdrop wash behind text — adapts to theme */}
      <div className="absolute inset-0 z-20 pointer-events-none hero-backdrop" />

      {/*
        Hero content.

        `justify-between` on mobile rather than `justify-center`: the content
        is deliberately spread across the viewport — status pill near the top,
        the name block in the middle over the orbital system, stats and the
        scroll cue anchored at the bottom — instead of being bunched in the
        centre with dead space above and below it.
      */}
      <div className="hero-shell relative z-30 w-full max-w-7xl mx-auto px-6 pt-24 pb-8 md:pt-24 md:pb-12 min-h-[100dvh] flex flex-col justify-between md:justify-center gap-6 md:gap-0">
        <motion.div
          className="w-full max-w-2xl flex flex-col flex-1 md:flex-none"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/*
            Availability badge. Mobile especially needed something with a
            pulse near the top of the fold — the phone layout opened on a
            static block of type with no sign of life anywhere on screen.
          */}
          <motion.div variants={fadeUp} className="hero-pill flex justify-center md:justify-start mb-5 md:mb-4">
            <span className="status-pill">
              <span className="status-dot" aria-hidden="true" />
              Open to research collaboration
            </span>
          </motion.div>

          {/* Eyebrow */}
          <motion.div variants={fadeUp} className="flex items-center justify-center md:justify-start gap-3 mb-2 md:mb-4">
            <span className="text-xs sm:text-sm font-medium tracking-widest uppercase text-center md:text-left"
              style={{ color: 'var(--nebula-3-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Astrophysics Researcher
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeUp}
            className="hero-name text-[2.75rem] leading-[1.05] sm:text-5xl md:text-7xl font-extrabold md:leading-none mb-4 text-center md:text-left"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="gradient-text">Akash Sankar</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Vigneshwaran</span>
          </motion.h1>

          {/*
            Role cycler — now on every screen.

            It was `hidden md:block`, so the one moving piece of copy in the
            hero was desktop-only and the phone got a static headline with
            nothing under it.
          */}
          {/*
            The generous bottom margin on mobile is deliberate: it opens a
            band between the name block and the CTAs where the orbital rings
            behind the copy are unobstructed. Without it the buttons sat
            straight under the role line and covered the widest part of the
            outer ring. Desktop keeps its original spacing — the WebGL scene
            there is full-bleed and needs no window cut for it.
          */}
          <motion.div variants={fadeUp} className="hero-role mb-14 md:mb-8">
            <RoleCycler />
          </motion.div>

          <div className="flex-1 md:hidden"></div>

          {/*
            CTA row.

            On a phone the three buttons wrapped into three stacked full-rows
            (measured 158px of stacked pills). This is a two-column grid there
            — primary across the top, the two secondary actions side by side —
            and reverts to the original inline flex row from `sm` up.
          */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:justify-center md:justify-start sm:gap-3"
          >
            {/*
              These were <a href="#…"> wrappers around <button> elements —
              interactive content nested inside a link is invalid HTML and
              gives assistive tech two conflicting controls for one action.
              They are plain buttons now, scrolling with the same nav offset.
            */}
            <motion.button
              type="button"
              onClick={() => scrollToSection('projects')}
              className="btn-primary col-span-2 sm:col-auto flex items-center justify-center gap-2 py-3"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="flex items-center gap-2">
                View My Work
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </motion.button>

            {/* "Résumé" everywhere — this said "Resume" while the navbar and
                the Contact card both said "Résumé" for the same action. */}
            <motion.button
              type="button"
              onClick={handleResumeRequest}
              className="btn-glass px-4 sm:px-7 py-3 rounded-full font-semibold text-sm sm:text-base flex items-center justify-center gap-2"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText size={15} aria-hidden="true" />
              Résumé
            </motion.button>

            <motion.button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="btn-ghost px-4 sm:px-5 py-3 text-sm sm:text-base flex items-center justify-center gap-1.5"
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Mail size={15} aria-hidden="true" />
              Get in Touch
            </motion.button>
          </motion.div>
        </motion.div>

        {/*
          Stats strip.

          Bare numbers on a hairline rule read as an afterthought on a phone.
          Each figure is a card there — it gives the lower half of the mobile
          hero some structure instead of leaving it as loose text — and the
          desktop treatment (inline row under a top border) is unchanged.
        */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="w-full max-w-2xl grid grid-cols-2 gap-2.5 md:flex md:flex-wrap md:gap-8 md:mt-14 md:pt-8 md:border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          {stats.map(({ value, suffix, label }) => (
            <div
              key={label}
              className="glass-card md:!bg-transparent md:!border-0 md:!shadow-none flex flex-col px-3 py-2.5 md:p-0"
            >
              <span
                className="text-xl sm:text-2xl md:text-3xl font-extrabold gradient-text tabular-nums leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {value}{suffix}
              </span>
              <span className="text-[0.7rem] sm:text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/*
          Scroll cue.

          This was desktop-only because a fixed bottom nav used to occupy the
          last ~90px of the mobile viewport and the cue landed on top of it.
          That bar is a hamburger menu in the top bar now, so the space is
          free and the phone gets the affordance back. Static positioning on
          mobile (it is a flex child of a justify-between column) rather than
          absolute, so it can never overlap the stats above it.
        */}
        <motion.div
          className="flex md:absolute md:bottom-10 md:left-1/2 md:-translate-x-1/2 z-30 flex-col items-center gap-1.5 md:gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <span className="text-[0.65rem] md:text-xs tracking-widest uppercase"
            style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
