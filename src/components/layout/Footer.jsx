import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const socials = [
  { icon: Linkedin, href: 'https://linkedin.com/in/akashsankar04', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/Akash-github-tech', label: 'GitHub' },
  { icon: Instagram, href: 'https://www.instagram.com/akash_sankar_/', label: 'Instagram' },
];

export default function Footer() {
  const { theme } = useTheme();
  return (
    // The 8rem floor was clearance for the old fixed bottom nav; with that
    // gone, only the device's own safe-area inset still needs respecting.
    <footer className="relative z-10 pt-12 pb-[max(3rem,env(safe-area-inset-bottom,2rem))] md:pb-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div 
            className="w-12 h-12 squircle overflow-hidden shrink-0"
            style={{
              borderRadius: '30%',
              boxShadow: theme === 'dark'
                ? '0 0 20px rgba(124,58,237,0.3)'
                : '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid var(--border)',
              background: theme === 'dark' ? '#05060d' : '#ffffff',
            }}
          >
            <img
              src={theme === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg'}
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover squircle"
              style={{ borderRadius: '30%' }}
            />
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-bold text-lg gradient-text" 
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Akash Sankar Vigneshwaran
            </span>
            <span className="text-xs text-center md:text-left" style={{ color: 'var(--text-muted)' }}>
              M.Sc. Physics, University of Bremen · Astrophysics | Data | Discovery
            </span>
          </div>
        </div>

        {/* Social icons */}
        <nav aria-label="Social profiles" className="flex items-center gap-4">
          {socials.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              // tap-target grows the hit area to 44px without changing the
              // 36px circle you actually see.
              className="tap-target w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              whileHover={{ scale: 1.15, y: -3, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
              whileTap={{ scale: 0.95 }}
              // "opens in a new tab" is part of what the control does, and
              // target="_blank" gives no warning on its own.
              aria-label={`${label} — opens in a new tab`}
            >
              <Icon size={15} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
            </motion.a>
          ))}
        </nav>

      </div>

      <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Akash Sankar Vigneshwaran. All rights reserved.
      </div>
    </footer>
  );
}
