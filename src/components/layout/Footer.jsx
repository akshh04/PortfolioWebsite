import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import SocialLinks from '../ui/SocialLinks';

export default function Footer() {
  const { theme } = useTheme();
  return (
    // At desktop widths the assistant floats at the bottom right. Leave room
    // beneath the footer so it cannot cover the social links at the page end.
    <footer className="relative z-10 pt-12 pb-[max(3rem,env(safe-area-inset-bottom,2rem))] lg:pb-[max(7rem,env(safe-area-inset-bottom,2rem))] px-6">
      <div className="max-w-6xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-6">
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

        <SocialLinks compact />

      </div>

      <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} Akash Sankar Vigneshwaran. All rights reserved.
      </div>
    </footer>
  );
}
