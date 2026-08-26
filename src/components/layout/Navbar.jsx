import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, FileText, Home, User, Star, Briefcase, Award, Folder, Mail, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { scrollToSection } from '../../lib/scroll';

/*
 * Order matters twice over: it is the order the links are drawn in, and the
 * order the scroll-spy resolves ties in — so it has to match the order the
 * sections appear in App.jsx.
 */
const navLinks = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'skills', label: 'Skills', icon: Star },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'contact', label: 'Contact', icon: Mail },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    /*
     * The scroll listener fires dozens of times a second but the value it
     * derives is a single boolean that flips twice per page. Comparing against
     * the last value keeps React out of the scroll path entirely except at the
     * two moments the bar actually changes appearance.
     */
    let lastScrolled = null;
    const handleScroll = () => {
      const next = window.scrollY > 20;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

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
      observer.disconnect();
    };
  }, []);

  /*
   * Menu behaviour: Escape closes, Tab is trapped inside the panel, and the
   * page behind is frozen so it cannot scroll away under an open menu.
   */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !menuRef.current) return;

      const focusable = menuRef.current.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Same approach as the project modal: <html> owns the viewport scrollbar
    // here (index.css sets overflow-x on it), and `scrollbar-gutter: stable`
    // keeps the track reserved so nothing shifts sideways on lock.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      root.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  // Move focus into the panel on open and hand it back to the toggle on close,
  // so the keyboard position never silently resets to the top of the document.
  useEffect(() => {
    if (menuOpen) {
      hasOpened.current = true;
      menuRef.current?.querySelector('button')?.focus();
    } else if (hasOpened.current) {
      toggleRef.current?.focus();
    }
  }, [menuOpen]);

  // Rotating the phone from portrait into a layout that shows the desktop bar
  // would otherwise leave the panel mounted and the page scroll-locked.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const desktop = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => {
      if (e.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  const go = (id) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  const handleResumeRequest = () => {
    setMenuOpen(false);
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
  };

  // The bar needs a solid surface whenever it has something to sit against —
  // scrolled, or with the menu panel hanging off it.
  const barSolid = scrolled || menuOpen;

  return (
    <motion.nav
      aria-label="Primary"
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{
        background: barSolid
          ? (theme === 'dark' ? 'rgba(5, 6, 13, 0.85)' : 'rgba(250, 250, 250, 0.85)')
          : 'transparent',
        /*
         * Only blur once the bar actually has a surface to blur *into*. The
         * filter used to be unconditional, which meant that at the top of the
         * page — where the bar is fully transparent and the effect is
         * invisible — the browser still promoted a full-width strip to its
         * own layer and re-sampled everything scrolling beneath it.
         */
        backdropFilter: barSolid ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: barSolid ? 'blur(20px)' : 'none',
        borderBottom: barSolid ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => go('home')}
          // tap-target: the mark itself is 40x40, and with the wordmark hidden
          // below sm that is the whole control — under the 44px touch minimum.
          className="tap-target flex items-center gap-2"
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

        {/*
          Desktop Nav Links.

          The inline row starts at lg, not md. Six links already had to be
          squeezed to gap-4 to clear a 768px tablet; adding Experience — and
          it sits next to Certificates, the two longest labels on the bar —
          pushed the row into a second line there. The menu panel carries all
          seven comfortably, so tablets get the panel and the inline row waits
          for the width that actually fits it.
        */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6">
          {navLinks.map(({ id, label }) => (
            <button
              key={id}
              type="button"
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <motion.button
            type="button"
            onClick={toggleTheme}
            className="tap-target w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            // The label has to say what the button *does*, not what it is:
            // "Toggle theme" leaves a screen-reader user guessing which
            // theme they are about to get.
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
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
                  <Moon size={16} style={{ color: 'var(--nebula-1-text)' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/*
            Résumé — desktop only.

            Below lg this was a third icon-only pill competing with the theme
            toggle and the menu button, and an icon-only "Résumé" reads as
            nothing in particular. It lives inside the menu panel there
            instead, where it can carry its label.
          */}
          <motion.button
            type="button"
            onClick={handleResumeRequest}
            className="btn-glass hidden lg:flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <FileText size={14} aria-hidden="true" />
            Résumé
          </motion.button>

          {/* Hamburger — below lg */}
          <motion.button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="tap-target lg:hidden w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            whileTap={{ scale: 0.92 }}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  className="flex"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={18} style={{ color: 'var(--text-primary)' }} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  className="flex"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={18} style={{ color: 'var(--text-primary)' }} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/*
        ── Mobile menu panel ─────────────────────────────────────────

        The wrapper carrying the id is rendered unconditionally, and only its
        contents come and go. The hamburger's aria-controls has to point at an
        element that actually exists — with the id living on the animated panel
        itself, it dangled for the entire time the menu was shut, which is most
        of the time.
      */}
      <div id="mobile-menu" ref={menuRef}>
      <AnimatePresence>
        {menuOpen && (
          <>
            {/*
              Backdrop. It starts below the bar so the logo, theme toggle and
              close button stay reachable while the menu is open.
            */}
            <motion.div
              className="lg:hidden fixed left-0 right-0 bottom-0"
              style={{ top: 'var(--nav-height, 72px)', background: 'rgba(0,0,0,0.45)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              className="lg:hidden absolute left-0 right-0 px-4 pt-2 pb-4"
              style={{ top: '100%' }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: theme === 'dark' ? 'rgba(9, 10, 20, 0.97)' : 'rgba(252, 252, 253, 0.97)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid var(--border)',
                }}
              >
                <ul className="flex flex-col list-none p-2 m-0">
                  {navLinks.map(({ id, label, icon: Icon }, i) => {
                    const isActive = activeSection === id;
                    return (
                      <motion.li
                        key={id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: 0.03 * i, ease: EASE_OUT_EXPO }}
                      >
                        <button
                          type="button"
                          onClick={() => go(id)}
                          aria-current={isActive ? 'true' : undefined}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 active:scale-[0.98]"
                          style={{
                            background: isActive ? 'rgba(124,58,237,0.14)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                            color: isActive ? 'var(--nebula-1-text)' : 'var(--text-secondary)',
                            fontFamily: 'Space Grotesk, sans-serif',
                            fontWeight: isActive ? 600 : 500,
                            fontSize: '0.95rem',
                          }}
                        >
                          <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
                          {label}
                          {isActive && (
                            <span
                              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: 'var(--nebula-1-text)' }}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Résumé lives here below lg, with its label intact */}
                <div className="p-3 pt-1">
                  <button
                    type="button"
                    onClick={handleResumeRequest}
                    className="btn-glass w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <FileText size={15} aria-hidden="true" />
                    Request Résumé
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </motion.nav>
  );
}
