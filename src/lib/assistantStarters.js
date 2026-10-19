import { OWNER_EMAIL } from './contact.js';
import { assistantSources } from './assistantPolicy.js';
import { skillCategories } from '../data/skills.js';
import { projects } from '../data/projects.js';

const source = (...ids) => assistantSources.filter(item => ids.includes(item.id));
const programming = skillCategories.find(item => item.id === 'programming');
const explorer = projects.find(item => item.slug === 'exoplanet-explorer');

// Verified shortcuts work without a model request and use the same public data.
export const assistantStarters = [
  { id: 'contact', title: 'Get in touch', label: 'How can I contact Akash?', icon: 'mail',
    answer: { text: `You can email Akash at ${OWNER_EMAIL}, or use the contact form on this website. He typically replies within 24–48 hours. About and Contact offer a generated portfolio CV, not his original CV. Request the original by email or through “Request résumé” in the contact section.`, sources: source('contact') } },
  { id: 'research', title: 'Research interests', label: 'What does Akash research?', icon: 'telescope',
    answer: { text: 'Akash focuses on dark matter, cosmology, and galaxy dynamics, with experience in radio astronomy instrumentation and scientific data analysis. He is pursuing an M.Sc. in Physics at the University of Bremen.', sources: source('about', 'experience') } },
  { id: 'projects', title: 'Explore the work', label: 'What has Akash built?', icon: 'orbit',
    answer: { text: `${explorer.title} is ${explorer.shortDesc.charAt(0).toLowerCase()}${explorer.shortDesc.slice(1)} His portfolio also includes theoretical research on galaxy rotation curves, an exoplanet presentation, and a literature review.`, sources: source('projects', 'exoplanet-explorer') } },
  { id: 'skills', title: 'Tools & skills', label: 'Which tools does Akash use?', icon: 'code',
    answer: { text: `His programming and data skills include ${programming.skills.map(item => item.name).join(', ')}. His Python toolkit includes Astropy, NumPy, Matplotlib, and SciPy. He also works with astronomical image analysis, RF instrumentation, and scientific communication.`, sources: source('skills') } },
  { id: 'background', title: 'Academic background', label: 'What is Akash’s background?', icon: 'graduation',
    answer: { text: 'Akash is pursuing an M.Sc. in Physics at the University of Bremen (Oct 2026–present). He completed a B.Sc. in Physics at Government Arts College, Udhagamandalam, affiliated with Bharathiar University, with a CGPA of 8.35/10. His work includes research internships and radio astronomy instrumentation R&D.', sources: source('about', 'experience') } },
  { id: 'collaborate', title: 'Work together', label: 'Can I collaborate with Akash?', icon: 'collaborate',
    answer: { text: `Akash welcomes collaboration ideas in astrophysics research, radio instrumentation, and scientific data analysis. Email ${OWNER_EMAIL} with your project, the kind of contribution you have in mind, and your timeline. Please contact him to confirm current availability.`, sources: source('contact', 'experience') } },
];
