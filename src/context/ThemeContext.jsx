import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const ThemeContext = createContext();

const LIGHT_QUERY = '(prefers-color-scheme: light)';

// Storage is unavailable in Safari private mode and when cookies/site data are
// blocked. Reading it bare inside a useState initializer throws during render
// and takes the entire app down, so every access is guarded.
function readStoredTheme() {
  try {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage unavailable — the in-memory theme still works for this session */
  }
}

function systemTheme() {
  return window.matchMedia && window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  // Whether the visitor has made an explicit choice. Only an explicit choice is
  // persisted — the previous version wrote to storage on mount, which froze
  // whatever the OS preference happened to be on first visit and meant later
  // OS changes were ignored forever.
  const hasExplicitChoice = useRef(readStoredTheme() !== null);
  const [theme, setTheme] = useState(() => readStoredTheme() || systemTheme());

  useEffect(() => {
    const isLight = theme === 'light';
    const root = document.documentElement;
    root.classList.toggle('light', isLight);
    root.classList.toggle('dark', !isLight);

    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.href = isLight ? '/favicon-light.png' : '/favicon-dark.png';
    }

    /*
     * Keeps the browser's own chrome in step with the toggle. index.html sets
     * this on first paint from the stored/system theme; without this it then
     * stayed on that first value forever, so switching to light left a phone
     * showing a near-black status bar above a white page.
     *
     * The values must track --bg in index.css.
     */
    const themeColor = document.getElementById('theme-color');
    if (themeColor) {
      themeColor.setAttribute('content', isLight ? '#f7f8fb' : '#05060d');
    }
  }, [theme]);

  // Follow the OS while the visitor hasn't picked a theme themselves.
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia(LIGHT_QUERY);
    const handleChange = (e) => {
      if (hasExplicitChoice.current) return;
      setTheme(e.matches ? 'light' : 'dark');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      hasExplicitChoice.current = true;
      writeStoredTheme(next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
