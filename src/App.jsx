import React, { lazy, Suspense, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import { scrollToSection } from './lib/scroll';
import { useReducedMotion, useSystemReducedMotion } from './lib/device';

// Content is available immediately; only optional decoration loads separately.
const ParticleBackground = lazy(() => import('./components/particles/ParticleBackground'));
const sections = [
  ['home', 'Introduction', Home], ['projects', 'Research', Projects], ['about', 'About', About],
  ['experience', 'Work experience', Experience], ['skills', 'Skills', Skills],
  ['contact', 'Contact', Contact],
];

export default function App() {
  const reducedMotion = useReducedMotion();
  const systemReducedMotion = useSystemReducedMotion();
  useEffect(() => { document.documentElement.dataset.motionPaused = String(reducedMotion); }, [reducedMotion]);
  useEffect(() => {
    let cancelled = false;
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const followHash = () => {
      const id = window.location.hash.slice(1) || 'home';
      if (id.startsWith('project/')) return;
      scrollToSection(id, { history: false, behavior: 'instant' });
    };
    let frame = requestAnimationFrame(followHash);
    let previousHash = window.location.hash;
    const scheduleHash = () => {
      // Let overlays release their scroll locks and inert state first.
      cancelAnimationFrame(frame);
      const returningFromProject = previousHash.startsWith('#project/');
      previousHash = window.location.hash;
      frame = requestAnimationFrame(() => {
        // Closing an opened case study already restores its card's focus and
        // original scroll position. Don't jump back to the section heading.
        if (returningFromProject && window.location.hash === '#projects' && document.activeElement?.matches('.project-open')) return;
        followHash();
      });
    };
    // Font metrics can change the height of every preceding section on a
    // cold load. Re-align once fonts settle, unless the visitor has interacted.
    let interacted = false;
    const markInteraction = () => { interacted = true; };
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    events.forEach(event => window.addEventListener(event, markInteraction, { passive: true }));
    document.fonts?.ready.then(() => {
      if (!cancelled && !interacted) followHash();
    });
    window.addEventListener('hashchange', scheduleHash);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
      events.forEach(event => window.removeEventListener(event, markInteraction));
      window.removeEventListener('hashchange', scheduleHash);
    };
  }, []);

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
        <ErrorBoundary>
          <div className={`site-shell${reducedMotion ? ' motion-paused' : ''}`}>
            <a href="#main-content" className="skip-link" onClick={(e) => {
              e.preventDefault();
              scrollToSection('main-content', { history: false });
            }}>Skip to content</a>
            <div className="noise-overlay" aria-hidden="true" />
            {!systemReducedMotion && <ErrorBoundary decorative>
              <Suspense fallback={null}><ParticleBackground /></Suspense>
            </ErrorBoundary>}
            <Navbar />
            <main id="main-content" tabIndex={-1}>
              {sections.map(([id, label, Component]) => (
                <section key={id} id={id} aria-label={label} tabIndex={-1}>
                  <Component />
                </section>
              ))}
            </main>
            <Footer />
          </div>
        </ErrorBoundary>
      </MotionConfig>
    </ThemeProvider>
  );
}
