import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, FileText, Home, User, Star, Folder, Mail } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { scrollToSection } from '../../lib/scroll';

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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

  const handleResumeRequest = () => {
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
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
            ? (theme === 'dark' ? 'rgba(5, 6, 13, 0.85)' : 'rgba(250, 250, 250, 0.85)') 
            : 'transparent',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
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
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
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
          className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-2xl shadow-xl" 
          style={{
            background: theme === 'dark' ? 'rgba(5, 6, 13, 0.92)' : 'rgba(250, 250, 250, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
          }}
        >
          {navLinks.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="flex flex-col items-center gap-1 transition-transform active:scale-95"
              aria-current={activeSection === id ? 'true' : undefined}
              style={{
                color: activeSection === id ? 'var(--nebula-1)' : 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                padding: 0
              }}
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
