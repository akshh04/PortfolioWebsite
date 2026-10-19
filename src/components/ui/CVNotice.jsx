import React from 'react';
import { ORIGINAL_CV_EMAIL } from '../../lib/cv';
import { scrollToSection } from '../../lib/scroll';

export default function CVNotice() {
  const requestOriginal = event => {
    event.preventDefault();
    scrollToSection('contact');
    window.dispatchEvent(new CustomEvent('requestResume'));
  };
  return <p className="cv-notice">This CV is generated from the portfolio, not the original CV. Request the original <a href={ORIGINAL_CV_EMAIL}>by email</a> or <a href="#contact" onClick={requestOriginal}>on the contact page</a>.</p>;
}
