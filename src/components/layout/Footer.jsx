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
    <footer className="relative z-10 pt-12 pb-[max(8rem,env(safe-area-inset-bottom,2rem))] md:pb-12 px-6"
      style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div 
            className="w-12 h-12 squircle overflow-hidden flex-shrink-0"
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
              alt="Akash Sankar Logo"
              className="w-full h-full object-cover squircle"
              style={{ borderRadius: '30%' }}
            />
          </div>
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-bold text-lg gradient-text" 
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Akash Sankar Vigneshwaran
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Astrophysics Researcher · Astrophysics | Data | Discovery
            </span>
          </div>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          {socials.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              whileHover={{ scale: 1.15, y: -3, boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
              whileTap={{ scale: 0.95 }}
              aria-label={label}
            >
              <Icon size={15} style={{ color: 'var(--text-secondary)' }} />
            </motion.a>
          ))}
        </div>

      </div>

      <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Akash Sankar Vigneshwaran. All rights reserved.
      </div>
    </footer>
  );
}
