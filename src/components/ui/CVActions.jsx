import React from 'react';
import { FileText, ExternalLink, Mail } from 'lucide-react';
import { PUBLIC_CV } from '../../lib/cv';
import { scrollToSection } from '../../lib/scroll';

export default function CVActions() {
  const request = event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
  };
  return <div className="cv-actions">
    <a className="cv-download" href={PUBLIC_CV.href} target="_blank" rel="noopener noreferrer"><FileText size={17} aria-hidden="true" />{PUBLIC_CV.label}<span className="cv-format">PDF</span><ExternalLink size={14} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
    <a className="cv-request" href="#contact" onClick={request}><Mail size={17} aria-hidden="true" />Request original CV</a>
  </div>;
}
