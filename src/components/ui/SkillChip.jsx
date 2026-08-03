import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillChip({ name, icon: Icon, desc, delay = 0 }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <motion.div
      className="glass-card gradient-border p-4 cursor-pointer select-none"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: '0 0 24px rgba(124,58,237,0.3)',
      }}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={desc ? expanded : undefined}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.15)' }}>
            <Icon size={18} style={{ color: 'var(--nebula-1)' }} />
          </div>
        )}
        <span className="font-semibold text-sm" style={{ 
          fontFamily: 'Space Grotesk, sans-serif',
          color: 'var(--text-primary)' 
        }}>
          {name}
        </span>
      </div>
      <AnimatePresence>
        {expanded && desc && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-xs leading-relaxed"
            style={{ color: 'var(--text-secondary)', overflow: 'hidden' }}
          >
            {desc}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

