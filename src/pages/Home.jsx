import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { ArrowDown, ArrowRight, FileText, Mail, MapPin } from 'lucide-react';
import OrbitalSystem from '../components/ui/OrbitalSystem';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { scrollToSection } from '../lib/scroll';
import { stats } from '../data/education';
import { useMediaQuery, usePageVisible, useReducedMotion, useSystemReducedMotion, isLowPowerDevice, supportsWebGL } from '../lib/device';

const HeroCanvas = lazy(() => import('../components/three/HeroCanvas'));
const roles = [
  'Exploring dark matter & galaxy dynamics',
  'Chasing answers in radio astronomy',
  'Connecting astronomical data to discovery',
];
const entrance = { duration: 0.65, ease: [0.16, 1, 0.3, 1] };

function ResearchLine({ active, reducedMotion }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || reducedMotion) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % roles.length), 4500);
    return () => clearInterval(timer);
  }, [active, reducedMotion]);
  return (
    <div className="landing-research">
      <span className="sr-only">Research interests: dark matter, galaxy dynamics, and radio astronomy.</span>
      <AnimatePresence initial={false}>
        <motion.p key={index} aria-hidden="true"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
          transition={{ duration: reducedMotion ? 0 : 0.35 }}>
          {roles[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const inView = useInView(heroRef, { margin: '100px' });
  const pageVisible = usePageVisible();
  const reducedMotion = useReducedMotion();
  const systemReducedMotion = useSystemReducedMotion();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const active = inView && pageVisible;
  const showCanvas = useMemo(
    // A manual pause freezes the mounted canvas instead of swapping scenes.
    () => desktop && !systemReducedMotion && !isLowPowerDevice() && supportsWebGL(),
    [desktop, systemReducedMotion]
  );
  const requestResume = () => {
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
  };
  const navigate = id => event => {
    event.preventDefault();
    scrollToSection(id);
  };
  const fallback = <div className="landing-orbit"><OrbitalSystem /></div>;

  return (
    <div ref={heroRef} className="landing">
      {desktop && <div className="landing-sky" aria-hidden="true">
        <div className="landing-halo" />
        {showCanvas ? (
          <ErrorBoundary decorative fallback={fallback}>
            <Suspense fallback={fallback}><HeroCanvas active={active && !reducedMotion} /></Suspense>
          </ErrorBoundary>
        ) : fallback}
      </div>}
      <div className="landing-inner">
        <motion.div className="landing-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={entrance}>
          <span className="status-pill"><span className="status-dot" aria-hidden="true" />Open to research collaboration</span>
          <p className="landing-eyebrow">Astrophysics researcher</p>
          <h1 className="landing-name"><span className="gradient-text">Akash Sankar</span><br />Vigneshwaran<span className="landing-period">.</span></h1>
          <ResearchLine active={active} reducedMotion={reducedMotion} />
          <p className="landing-study"><MapPin size={14} aria-hidden="true" />M.Sc. Physics · University of Bremen</p>
          {!desktop && <div className="landing-orbit-space" aria-hidden="true"><OrbitalSystem /></div>}
          <div className="landing-actions">
            <a href="#projects" onClick={navigate('projects')} className="btn-primary landing-primary"><span>View my work <ArrowRight size={17} aria-hidden="true" /></span></a>
            <button type="button" onClick={requestResume} className="btn-glass landing-resume"><FileText size={16} aria-hidden="true" />Request résumé</button>
            <a href="#contact" onClick={navigate('contact')} className="landing-contact"><Mail size={16} aria-hidden="true" />Get in touch</a>
          </div>
        </motion.div>

        <motion.div className="landing-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}>
          <dl className="landing-stats">{stats.filter(item => item.showInHero).map(({ value, suffix, label }) => (
            <div key={label}><dt>{label}</dt><dd>{value}{suffix}</dd></div>
          ))}</dl>
          <a href="#projects" onClick={navigate('projects')} className="landing-scroll"><span>Explore research</span><ArrowDown size={17} aria-hidden="true" /></a>
        </motion.div>
      </div>
    </div>
  );
}
