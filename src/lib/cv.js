import { OWNER_EMAIL } from './contact.js';

export const ORIGINAL_CV_EMAIL = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('Original CV request')}&body=${encodeURIComponent("Hi Akash, I'd like to request your original CV.")}`;

export const PUBLIC_CV = {
  href: '/akash-sankar-academic-cv.pdf',
  filename: 'akash-sankar-academic-cv.pdf',
  label: 'View generated CV',
};
