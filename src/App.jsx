import React, { lazy, Suspense, useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ParticleBackground from './components/particles/ParticleBackground';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Skills = lazy(() => import('./pages/Skills'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));

// Noise overlay
function NoiseOverlay() {
  return <div className="noise-overlay" aria-hidden="true" />;
}

// Loading fallback with Astrophysics theme
function PageLoader() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Pulsing central star */}
          <div 
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, #fbbf24, #d97706)',
              boxShadow: '0 0 16px 4px rgba(251, 191, 36, 0.4)'
            }} 
          />
          {/* Spinning orbit ring */}
          <div 
            className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin"
            style={{ animationDuration: '3s' }}
          >
            <div className="absolute top-0 left-1/2 -mt-1 -ml-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a78bfa]" />
          </div>
        </div>
        <span className="text-sm tracking-widest uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
          Mapping the Cosmos...
        </span>
      </div>
    </div>
  );
}

/*
 * The five sections, in page order. Declared as data so App renders them in one
 * loop — the previous hand-written list meant every change to the wrapper
 * (Suspense, and now a boundary each) had to be repeated five times, and they
 * had already drifted apart in their fallbacks.
 */
const SECTIONS = [
  { id: 'home',     label: 'The introduction', Component: Home,     fallback: <PageLoader /> },
  { id: 'about',    label: 'About',            Component: About,    fallback: null },
  { id: 'skills',   label: 'Skills',           Component: Skills,   fallback: null },
  { id: 'projects', label: 'Projects',         Component: Projects, fallback: null },
  { id: 'contact',  label: 'The contact form', Component: Contact,  fallback: null },
];

// Minimum time (ms) the loading screen stays visible. Long enough that the
// preloader reads as a deliberate intro rather than a flash of chrome, short
// enough that it never becomes the thing keeping a visitor waiting — on a warm
// cache the chunks are ready well before this elapses, so this figure *is* the
// time-to-content.
const MIN_LOADER_DURATION = 900;
// Hard cap: a hung/never-settling import must never trap a visitor on the
// preloader. Past this point we reveal the app regardless of chunk state —
// Suspense still covers anything that genuinely hasn't arrived.
const MAX_LOADER_DURATION = 6000;

function dismissPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader || preloader.classList.contains('pl-exit')) return;
  // Trigger CSS fade-out, then remove after the animation completes.
  // A timer is reliable here; animationend fires for every child animation
  // (stars, orbits, progress bar) and would remove the node far too early.
  preloader.classList.add('pl-exit');
  setTimeout(() => preloader.remove(), 700);
}

function usePreloader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    let cancelled = false;
    let revealTimer;

    const reveal = () => {
      if (cancelled) return;
      cancelled = true;
      dismissPreloader();
      setReady(true);
    };

    /*
     * Only the Home chunk gates the reveal. Waiting on all five meant the
     * visitor stared at the preloader while Contact's EmailJS bundle and
     * Skills' icon set downloaded — code that nothing on screen needed yet.
     * The rest are warmed during idle time below, so they are already in
     * memory by the time a scroll reaches them, and Suspense covers the case
     * where a very fast scroll outruns the prefetch.
     */
    const belowTheFold = () =>
      Promise.allSettled([
        import('./pages/About'),
        import('./pages/Skills'),
        import('./pages/Projects'),
        import('./pages/Contact'),
      ]);

    // A failed chunk must not wedge the loader — allSettled never rejects.
    Promise.allSettled([import('./pages/Home')]).then(() => {
      if (cancelled) return;
      const remaining = Math.max(0, MIN_LOADER_DURATION - (Date.now() - startTime));
      revealTimer = setTimeout(reveal, remaining);
    });

    // requestIdleCallback keeps the prefetch off the critical path; Safari
    // lacks it, where a short timer is close enough.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(belowTheFold, { timeout: 2500 })
      : setTimeout(belowTheFold, 600);

    const failsafeTimer = setTimeout(reveal, MAX_LOADER_DURATION);

    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      clearTimeout(failsafeTimer);
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, []);

  return ready;
}

export default function App() {
  const ready = usePreloader();

  return (
    <ThemeProvider>
      <div
        aria-busy={!ready}
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          position: 'relative',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.5s ease 0.1s',
          // While invisible the app is still in the DOM: without this a
          // keyboard user can tab into controls they cannot see.
          pointerEvents: ready ? 'auto' : 'none',
        }}
      >
        <NoiseOverlay />
        {/*
          Both of these are decoration and chrome. Neither is worth taking the
          page down for, and neither is worth an error panel — a WebGL/canvas
          failure in the particle field in particular should cost nothing more
          than the particle field.
        */}
        <ErrorBoundary fallback={null}>
          <ParticleBackground variant="calm" />
        </ErrorBoundary>
        <ErrorBoundary fallback={null}>
          <Navbar />
        </ErrorBoundary>
        
        {/*
          Each section carries its own boundary rather than one around <main>.
          These are five independently code-split chunks: if the Contact chunk
          fails to download, a single shared boundary would replace the entire
          page — including the four sections that loaded perfectly — with one
          error panel. Per-section, the damage stays in the section, and the
          retry button re-attempts just that import.
        */}
        <main>
          {SECTIONS.map(({ id, label, Component, fallback }) => (
            <section id={id} key={id}>
              <ErrorBoundary label={label}>
                <Suspense fallback={fallback}><Component /></Suspense>
              </ErrorBoundary>
            </section>
          ))}
        </main>

        <ErrorBoundary fallback={null}>
          <Footer />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

