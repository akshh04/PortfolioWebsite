import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, User, Briefcase, Sparkles, Folder, Mail, Menu, X, Pause, Play } from 'lucide-react';
import { useMotionPaused, toggleMotion } from '../../lib/motionPreference';
import { useTheme } from '../../context/ThemeContext';
import ThemePicker from '../ui/ThemePicker';
import AssistantLauncher from '../ui/AssistantLauncher';
import { scrollToSection } from '../../lib/scroll';

/*
 * Order matters twice over: it is the order the links are drawn in, and the
 * order the scroll-spy resolves ties in — so it has to match the order the
 * sections appear in App.jsx.
 */
const navLinks = [
  { id: 'projects', label: 'Research', icon: Folder },
  { id: 'about', label: 'About', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'contact', label: 'Contact', icon: Mail },
];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export default function Navbar() {
  const { theme } = useTheme();
  const motionPaused = useMotionPaused();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const hasOpened = useRef(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 20);
      // A pixel marker works in portrait and landscape. Percentage root
      // margins are based on viewport width and can collapse a wide observer.
      const marker = 76 + Math.min(window.innerHeight * 0.2, 160);
      let current = 'home';
      for (const link of navLinks) {
        const section = document.getElementById(link.id);
        if (section && section.getBoundingClientRect().top <= marker) current = link.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'contact';
      setActiveSection(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    const main = document.getElementById('main-content');
    if (main) observer.observe(main);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
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

      const focusable = [...navRef.current.querySelectorAll(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(node => node.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const outside = !focusable.includes(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const closeForNavigation = () => {
      hasOpened.current = false;
      setMenuOpen(false);
    };
    window.addEventListener('hashchange', closeForNavigation);

    // Same approach as the project modal: <html> owns the viewport scrollbar
    // here (index.css sets overflow-x on it), and `scrollbar-gutter: stable`
    // keeps the track reserved so nothing shifts sideways on lock.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const background = [...document.querySelectorAll('main, footer')];
    const previousInert = background.map(node => node.inert);
    background.forEach(node => { node.inert = true; });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', closeForNavigation);
      root.style.overflow = previousOverflow;
      background.forEach((node, index) => { node.inert = previousInert[index]; });
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
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      if (e.matches) {
        hasOpened.current = false;
        setMenuOpen(false);
        // The hamburger is now hidden; keep focus on a visible control.
        if (navRef.current?.contains(document.activeElement)) {
          navRef.current.querySelector('button')?.focus();
        }
      }
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  const go = (id) => {
    setMenuOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  const handleResumeRequest = () => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      scrollToSection('contact');
      window.dispatchEvent(new CustomEvent('requestResume'));
    });
  };

  // The bar needs a solid surface whenever it has something to sit against —
  // scrolled, or with the menu panel hanging off it.
  const barSolid = scrolled || menuOpen;

  return (
    <motion.nav
      ref={navRef}
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
          aria-label="Akash Sankar — home"
          onClick={() => go('home')}
          // tap-target: the mark itself is 40x40, and with the wordmark hidden
          // below sm that is the whole control — under the 44px touch minimum.
          className="tap-target flex items-center gap-2"
          style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', padding: 0 }}
        >
          <motion.div
            className="w-10 h-10 squircle overflow-hidden flex items-center justify-center shrink-0"
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
        <div className="nav-actions flex items-center gap-2 sm:gap-3">
          <div className="nav-utilities flex items-center gap-2 sm:gap-3">
            <button type="button" className="motion-toggle tap-target" onClick={toggleMotion} aria-pressed={motionPaused}
              aria-label={motionPaused ? 'Resume animations' : 'Pause animations'} title={motionPaused ? 'Resume animations (respects device preference)' : 'Pause animations'}>
              {motionPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
            <ThemePicker />
          </div>
          <AssistantLauncher onOpen={() => setMenuOpen(false)} />

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
            className="btn-glass hidden lg:flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shrink-0"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <FileText size={14} aria-hidden="true" />
            Request original CV
          </motion.button>

          {/* Hamburger — below lg */}
          <motion.button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="tap-target lg:hidden w-9 h-9 rounded-full flex items-center justify-center shrink-0"
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
      <div id="mobile-menu" ref={menuRef} inert={menuOpen ? undefined : ''} aria-hidden={!menuOpen}
        style={{ pointerEvents: menuOpen ? undefined : 'none' }}>
      <AnimatePresence>
        {menuOpen && (
          <>
            {/*
              Backdrop. It starts below the bar so the logo, theme toggle and
              close button stay reachable while the menu is open.
            */}
            <motion.div
              className="lg:hidden fixed left-0 right-0"
              style={{ top: '100%', height: 'calc(100dvh - var(--nav-height))', background: 'rgba(0,0,0,0.45)' }}
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
                className="rounded-2xl overflow-y-auto overscroll-contain shadow-2xl mobile-menu-surface"
                style={{
                  background: 'var(--bg-secondary)',
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
                          <Icon size={18} aria-hidden="true" className="shrink-0" />
                          {label}
                          {isActive && (
                            <span
                              className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
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
                    Request original CV
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
