import React, { createContext, useContext, useEffect, useState } from 'react';
import { useMediaQuery } from '../lib/device';
import { normalizeThemePreference, resolveTheme } from '../lib/themePreference';

const ThemeContext = createContext();

const LIGHT_QUERY = '(prefers-color-scheme: light)';

// Storage is unavailable in Safari private mode and when cookies/site data are
// blocked. Reading it bare inside a useState initializer throws during render
// and takes the entire app down, so every access is guarded.
function readStoredTheme() {
  try {
    const stored = localStorage.getItem('theme');
    return normalizeThemePreference(stored);
  } catch {
    return 'dark';
  }
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    /* storage unavailable — the in-memory theme still works for this session */
  }
}

export function ThemeProvider({ children }) {
  // Keep the selected preference separate from the resolved palette so System
  // can follow device appearance again after an explicit light/dark choice.
  const [preference, setStoredPreference] = useState(readStoredTheme);
  const systemLight = useMediaQuery(LIGHT_QUERY);
  const theme = resolveTheme(preference, systemLight);
  const setPreference = value => {
    const next = normalizeThemePreference(value);
    setStoredPreference(next);
    writeStoredTheme(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme !== 'light');
    root.style.colorScheme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = theme === 'light' ? '#fafafa' : '#05060d';
    });
    const favicon = document.getElementById('favicon');
    if (favicon) {
      favicon.href = theme === 'light' ? '/favicon-light.png' : '/favicon-dark.png';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
