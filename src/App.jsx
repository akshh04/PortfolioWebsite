import React, { lazy, Suspense, useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ParticleBackground from './components/particles/ParticleBackground';

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

// Minimum time (ms) the loading screen stays visible so the animation looks good
const MIN_LOADER_DURATION = 2400;
// Hard cap: a hung/never-settling import must never trap a visitor on the
// preloader. Past this point we reveal the app regardless of chunk state —
// Suspense still covers anything that genuinely hasn't arrived.
const MAX_LOADER_DURATION = 8000;

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

    // Pre-load all lazy chunks in parallel
    const chunks = [
      import('./pages/Home'),
      import('./pages/About'),
      import('./pages/Skills'),
      import('./pages/Projects'),
      import('./pages/Contact'),
    ];

    // A failed chunk must not wedge the loader — allSettled never rejects.
    Promise.allSettled(chunks).then(() => {
      if (cancelled) return;
      const remaining = Math.max(0, MIN_LOADER_DURATION - (Date.now() - startTime));
      revealTimer = setTimeout(reveal, remaining);
    });

    const failsafeTimer = setTimeout(reveal, MAX_LOADER_DURATION);

    return () => {
      cancelled = true;
      clearTimeout(revealTimer);
      clearTimeout(failsafeTimer);
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
        <ParticleBackground variant="calm" />
        <Navbar />
        
        <main>
          <section id="home">
            <Suspense fallback={<PageLoader />}><Home /></Suspense>
          </section>
          <section id="about">
            <Suspense fallback={null}><About /></Suspense>
          </section>
          <section id="skills">
            <Suspense fallback={null}><Skills /></Suspense>
          </section>
          <section id="projects">
            <Suspense fallback={null}><Projects /></Suspense>
          </section>
          <section id="contact">
            <Suspense fallback={null}><Contact /></Suspense>
          </section>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

