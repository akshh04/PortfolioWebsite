import React from 'react';
import { ChevronDown } from 'lucide-react';
import Certifications from '../components/ui/Certifications';
import TrainingList from '../components/ui/TrainingList';
import { certifications, professionalDevelopment } from '../data/education';

function Certificates() {
  return (
    <details id="certificates" tabIndex={-1} className="supporting-details skills-credentials">
      <summary>
        <span>Credentials &amp; Training<span className="disclosure-description">{certifications.length + professionalDevelopment.length} programmes: {certifications.length} courses and {professionalDevelopment.length} workshops</span></span>
        <ChevronDown size={20} aria-hidden="true" />
      </summary>
      <div className="skills-credentials-body">
        <Certifications />
        <details className="supporting-details training-details">
          <summary><span>Workshops &amp; short courses<span className="disclosure-description">{professionalDevelopment.length} programmes in astrophysics, cosmology, and remote sensing</span></span><ChevronDown size={20} aria-hidden="true" /></summary>
          <TrainingList />
        </details>
      </div>
    </details>
  );
}

export default Certificates;
