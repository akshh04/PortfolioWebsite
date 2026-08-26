import React from 'react';
import { motion } from 'framer-motion';
import GradientOrb from '../components/ui/GradientOrb';
import Certifications from '../components/ui/Certifications';
import TrainingList from '../components/ui/TrainingList';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

/*
 * Certifications were a block at the bottom of the About page. Promoting them
 * to a section of their own is what makes them addressable: the navbar's
 * scroll-spy observes `document.getElementById(id)` for each nav link, so a
 * "Certificates" entry needs a real top-level <section id="certificates">
 * to point at and to highlight against.
 */
export default function Certificates() {
  return (
    <div className="relative overflow-hidden">
      <GradientOrb size={500} color="rgba(6,182,212,0.13)" top="-80px" left="-100px" delay={1} />
      <GradientOrb size={400} color="rgba(124,58,237,0.11)" bottom="0px" right="-80px" delay={3} />
      <GradientOrb size={340} color="rgba(37,99,235,0.1)" top="45%" right="25%" delay={5} mobileHidden />

      <div className="section-shell max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="text-center mb-14"
        >
          <p className="section-eyebrow">Beyond the degree</p>
          <h2 className="section-title">
            Certifications <span className="gradient-text">&amp; Training</span>
          </h2>
          <p className="section-subtitle mx-auto">
            Professional courses that sharpened the practical side of the research.
          </p>
        </motion.div>

        <Certifications />

        {/*
          Professional development sits below the certificates, not beside
          them: these are four short programmes against two certificates, and
          interleaving them would make the count read as six equal
          qualifications.
        */}
        <section aria-labelledby="training-heading" className="mt-16">
          <div className="text-center mb-8">
            <p className="section-eyebrow">Workshops &amp; short courses</p>
            <h3 id="training-heading" className="subsection-title">
              Professional <span className="gradient-text">Development</span>
            </h3>
          </div>
          <TrainingList />
        </section>
      </div>
    </div>
  );
}
