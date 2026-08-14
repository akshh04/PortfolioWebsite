import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, FileText, Home, User, Star, Folder, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { scrollToSection } from '../../lib/scroll';
import { requestResume } from '../../lib/resume';

const navLinks = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'skills', label: 'Skills', icon: Star },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const progressRef = useRef(null);

  useEffect(() => {
    /*
     * The scroll listener fires dozens of times a second. Two things are
     * derived from it, and each is kept off React's critical path in its own
     * way:
     *
     * - `scrolled` is a single boolean that flips twice per page, so it is
     *   compared against the last value and only set at the two moments the
     *   bar actually changes appearance.
     * - the progress bar changes on *every* frame, so it is written straight
     *   to a CSS custom property on the element. Routing it through state
     *   would re-render the whole navbar sixty times a second to move one bar.
     */
    let lastScrolled = null;
    let frame = 0;

    const applyScroll = () => {
      frame = 0;
      const y = window.scrollY;

      const next = y > 20;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }

      const node = progressRef.current;
      if (node) {
        // Guard the divisor: on a page shorter than the viewport (or mid-layout
        // during load) scrollable height is 0, and 0/0 writes NaN into the
        // transform, which drops the bar entirely.
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? Math.min(Math.max(y / scrollable, 0), 1) : 0;
        node.style.setProperty('--progress', ratio.toFixed(4));
      }
    };

    // Coalesce bursts of scroll events into one write per painted frame.
    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(applyScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    applyScroll();

    /*
     * Track every intersecting section rather than reacting to entries one at
     * a time. The previous version applied each entry in callback order, so
     * whichever section happened to be reported last won — which regularly
     * highlighted the wrong link when two sections were in view together, or
     * when scrolling up (entries that stopped intersecting were never undone).
     * Now the topmost visible section always wins.
     */
    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        const topmost = navLinks.find((link) => visible.has(link.id));
        if (topmost) setActiveSection(topmost.id);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    navLinks.forEach((link) => {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const handleResumeRequest = () => {
    scrollToSection('contact');
    requestResume();
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          background: scrolled
            ? (theme === 'dark' ? 'rgba(5, 6, 13, 0.82)' : 'rgba(247, 248, 251, 0.82)')
            : 'transparent',
          /*
           * Only blur once the bar actually has a surface to blur *into*. The
           * filter used to be unconditional, which meant that at the top of the
           * page — where the bar is fully transparent and the effect is
           * invisible — the browser still promoted a full-width strip to its
           * own layer and re-sampled everything scrolling beneath it.
           */
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/*
          Reading progress. On a page that scrolls ~8000px with no route
          changes, nothing told a visitor how much was left — this is the one
          piece of orientation a single-page layout cannot get from its nav.
          It only shows once the bar has a surface, so it does not float
          unattached over the hero.
        */}
        <div
          ref={progressRef}
          className="scroll-progress"
          aria-hidden="true"
          style={{ opacity: scrolled ? undefined : 0, transition: 'opacity 0.3s ease' }}
        />

        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('home')} 
            className="flex items-center gap-2" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', padding: 0 }}
          >
            <motion.div
              className="w-10 h-10 squircle overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{
                borderRadius: '30%',
                boxShadow: theme === 'dark' 
                  ? '0 0 20px rgba(124,58,237,0.4)' 
                  : '0 4px 15px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)',
                background: theme === 'dark' ? '#05060d' : '#ffffff',
              }}
              whileHover={{ scale: 1.08, rotate: 3 }}
            >
              <img
                src={theme === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg'}
                alt="Akash Sankar Logo"
                width={40}
                height={40}
                // Intrinsic dimensions let the browser reserve the box before
                // the file arrives, so the nav row does not reflow on load.
                decoding="async"
                className="w-full h-full object-cover squircle"
                style={{ borderRadius: '30%' }}
              />
            </motion.div>
            <span className="font-semibold text-sm hidden sm:block" 
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Akash Sankar
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`nav-link ${activeSection === id ? 'active' : ''}`}
                aria-current={activeSection === id ? 'true' : undefined}
                // No `padding: 0` here: an inline declaration outranks any
                // stylesheet rule, so it silently cancelled .nav-link's own
                // vertical padding and left these as 22px-tall hit targets.
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Sun size={16} style={{ color: 'var(--accent)' }} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Moon size={16} style={{ color: 'var(--nebula-1)' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Resume button */}
            <motion.button
              onClick={handleResumeRequest}
              className="btn-glass flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-sm font-semibold flex-shrink-0"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Résumé</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Bottom Nav */}
      <div 
        className="md:hidden fixed left-0 right-0 z-[99] px-4 pointer-events-none"
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
      >
        <div
          className="pointer-events-auto flex items-center justify-between px-2 py-1.5"
          style={{
            background: theme === 'dark' ? 'rgba(5, 6, 13, 0.9)' : 'rgba(247, 248, 251, 0.9)',
            backdropFilter: 'blur(20px)',
            // Safari — including every browser on iOS, which is the platform
            // this bar exists for — still needs the prefix.
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.12)'
              : '0 8px 28px rgba(23,31,56,0.14)',
          }}
        >
          {navLinks.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              /*
               * Geometry and states live in .mobile-nav-item (index.css). The
               * tap target used to be exactly as wide as the label — the
               * "Skills" button measured 25px across, so the gaps between items
               * were dead space that swallowed near-misses. The class gives
               * each item a ~56px target, and the active one a tinted pill so
               * the current position is not signalled by colour alone on a
               * 10px label.
               */
              className={`mobile-nav-item ${activeSection === id ? 'active' : ''}`}
              aria-current={activeSection === id ? 'true' : undefined}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
