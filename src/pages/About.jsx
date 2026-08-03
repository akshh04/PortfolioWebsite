import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Mail, Telescope } from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';
import Timeline from '../components/ui/Timeline';
import { stats } from '../data/education';
import { useTheme } from '../context/ThemeContext';

function AnimatedCounter({ value, suffix, isDecimal, label, icon, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const target = value;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      const isLast = step >= steps;
      const displayValue = isLast ? target : current;
      setCount(isDecimal ? Math.round(displayValue * 100) / 100 : Math.floor(displayValue));
      if (isLast) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, value, isDecimal]);

  return (
    <motion.div
      ref={ref}
      className="glass-card gradient-border p-6 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(124,58,237,0.2)' }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-4xl font-extrabold tabular-nums gradient-text mb-1"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {count}{suffix}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </motion.div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

export default function About() {
  const { theme } = useTheme();
  return (
    <div className="relative overflow-hidden">

      {/* Orbs */}
      <GradientOrb size={500} color="rgba(37,99,235,0.15)" top="-80px" right="-100px" delay={1} />
      <GradientOrb size={400} color="rgba(124,58,237,0.12)" bottom="200px" left="-80px" delay={3} />
      <GradientOrb size={350} color="rgba(6,182,212,0.1)" top="50%" right="20%" delay={5} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-4 md:pt-16 pb-8 md:pb-12">
        
        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Get to know me</p>
          <h1 className="section-title">About <span className="gradient-text">Me</span></h1>
          <p className="section-subtitle mx-auto">
            A physics graduate with a passion for unravelling the mysteries of the cosmos.
          </p>
        </motion.div>

        {/* Bio section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Photo / Avatar */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              {/* Rotating gradient ring */}
              <motion.div
                className="absolute -inset-3 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  background: 'conic-gradient(from 0deg, #7c3aed, #2563eb, #06b6d4, #7c3aed)',
                  borderRadius: '50%',
                  padding: '3px',
                }}
              >
                <div className="w-full h-full rounded-full" style={{ background: 'var(--bg)', borderRadius: '50%' }} />
              </motion.div>

              {/* Profile / Logo Avatar */}
              <div 
                className="relative w-56 h-56 rounded-full overflow-hidden flex items-center justify-center shadow-2xl"
                style={{
                  borderRadius: '50%',
                  border: '3px solid var(--border)',
                  zIndex: 1,
                  boxShadow: theme === 'dark' 
                    ? '0 0 40px rgba(124,58,237,0.4)' 
                    : '0 10px 30px rgba(0,0,0,0.15)',
                  background: theme === 'dark' ? '#05060d' : '#ffffff',
                }}
              >
                <img
                  src={theme === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg'}
                  alt="Akash Sankar Profile Logo"
                  className="w-full h-full object-cover rounded-full transition-transform duration-500 hover:scale-105"
                  style={{ borderRadius: '50%' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Exploring the cosmos, one equation at a time.
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Physics graduate specializing in observational and theoretical astrophysics, with hands-on experience in radio astronomy instrumentation and a sustained research focus on dark matter, cosmology, and galaxy dynamics. Contributed to the development of low-noise RF systems for a radio telescope array and conducted independent theoretical research on dark matter candidates and galaxy rotation curve anomalies. Proficient in Python, SQL, and astronomical data analysis pipelines.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: MapPin, text: 'Tamil Nadu, India · Targeting Graduate Studies in Germany' },
                { icon: Mail, text: 'akashsankar80@gmail.com' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.15)' }}
                  >
                    <Icon size={15} style={{ color: 'var(--nebula-1)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ 
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        >
          {stats.map((stat, i) => (
            <AnimatedCounter key={stat.label} {...stat} delay={i * 0.1} />
          ))}
        </motion.div>

        {/* Education timeline */}
        <div>
          <div className="text-center mb-12">
            <p className="section-eyebrow">Academic Journey</p>
            <h2 className="section-title">Education <span className="gradient-text">Timeline</span></h2>
          </div>
          <Timeline />
        </div>
      </div>
    </div>
  );
}
