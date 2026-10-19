/*
 * `side` is derived from the index rather than stored per entry: hard-coding it
 * meant that inserting a new degree at the top silently put two cards on the
 * same side of the timeline until every following entry was edited by hand.
 */
const entries = [
  {
    id: 'msc-bremen',
    degree: 'M.Sc. Physics',
    institution: 'University of Bremen',
    university: 'Bremen, Germany',
    /*
     * The programme starts in October 2026. This read 'Oct 2026 – Present'
     * with no grade, so the card rendered an "In progress" badge for a degree
     * that has not begun yet.
     */
    period: 'Oct 2026 – Present',
    grade: 'In progress',
    ongoing: true,
    description:
      'Graduate study in physics, building on a research background in dark matter, galaxy dynamics, and radio astronomy instrumentation.',
    icon: '🔭',
    color: '#7c3aed',
  },
  {
    id: 'bsc-physics',
    degree: 'B.Sc. Physics',
    institution: 'Government Arts College, Udhagamandalam',
    university: 'Bharathiar University',
    period: 'Aug 2022 – May 2025',
    grade: 'CGPA 8.35 / 10',
    description:
      'Specialized in observational and theoretical astrophysics. Conducted research on dark matter, cosmology, and galaxy dynamics. Contributed to radio astronomy instrumentation R&D.',
    icon: '🎓',
    color: '#2563eb',
  },
  {
    id: 'xii',
    degree: 'XII Standard (Higher Secondary)',
    institution: 'N.A. Annapparaja Memorial HSS',
    university: 'Tamil Nadu State Board',
    period: '2021 – 2022',
    grade: '70%',
    description:
      'Completed higher secondary education with a focus on Physics, Chemistry, and Mathematics — the foundational sciences for astrophysics research.',
    icon: '📚',
    color: '#06b6d4',
  },
  {
    id: 'x',
    degree: 'X Standard (Secondary)',
    institution: 'N.A. Annapparaja Memorial HSS',
    university: 'Tamil Nadu State Board',
    period: '2019 – 2020',
    grade: '73.6%',
    description: 'Secondary school education developing analytical and mathematical foundations.',
    icon: '🏫',
    color: '#7c3aed',
  },
];

export const education = entries.map((item, index) => ({
  ...item,
  side: index % 2 === 0 ? 'right' : 'left',
}));

/*
 * Short courses and professional training. Kept out of `education` so the
 * timeline stays a record of degrees — a six-month certificate rendered at the
 * same visual weight as a master's misrepresents both.
 */
/*
 * Newest first, matching the education timeline's ordering.
 *
 * NOTE on the NOXJET date: it was given as 10/12/2024 and is read here as
 * DD/MM/YYYY (10 December 2024), the Indian convention. If it was meant as
 * MM/DD, this one string becomes 'Oct 2024'.
 */
export const certifications = [
  {
    id: 'data-analyst-besant',
    title: 'Data Analyst',
    issuer: 'Besant Technology, Tambaram',
    period: 'Apr – Aug 2026',
    description:
      'Applied training in the analyst toolchain — SQL querying, spreadsheet modelling, Python-based analysis and visualization — now carried directly into astronomical data pipelines.',
    skills: ['SQL', 'Python', 'Advanced Excel', 'Data Visualization'],
    icon: '📊',
    color: '#06b6d4',
  },
  {
    id: 'astronomy-noxjet',
    title: 'Course on Astronomy',
    issuer: 'NOXJET',
    period: 'Dec 2024',
    description:
      'A focused month-long programme for aspiring astronomers, strengthening the core astrophysical concepts that underpin the research work above.',
    skills: ['Astrophysics Fundamentals', 'Observational Astronomy', 'Cosmology'],
    icon: '🌠',
    color: '#7c3aed',
  },
];

/*
 * Short courses and workshops that are not certificate-bearing in their own
 * right. Kept separate from `certifications` so the two render at different
 * weights — a two-day workshop and a month-long assessed course are not the
 * same claim.
 *
 * The IIT Madras / Edutech Life programme (Feb–Mar 2025) appears on the CV in
 * this list *and* as an internship; it is carried in src/data/experience.js
 * only, so the site does not show the same month twice.
 */
export const professionalDevelopment = [
  {
    id: 'iit-kanpur-online',
    title: 'Online Training Program on Astrophysics',
    issuer: 'IIT Kanpur with Edufabrica Pvt. Ltd.',
    period: 'Dec 2023 – Jan 2024',
    detail: 'Month-long certificate programme covering general relativity and stellar dynamics.',
    tags: ['General Relativity', 'Stellar Dynamics'],
    icon: '🎓',
    color: '#7c3aed',
  },
  {
    id: 'iisc-workshop',
    title: 'Workshop on Astrophysics',
    issuer: 'IISc Bengaluru with Edufabrica Pvt. Ltd.',
    period: 'Jan 2024',
    detail: 'Two-day intensive on cosmology, closing with a hands-on astronomical data interpretation module.',
    tags: ['Cosmology', 'Data Interpretation'],
    icon: '🔬',
    color: '#2563eb',
  },
  {
    id: 'iitbbs-online',
    title: 'Online Training Program on Astrophysics',
    issuer: 'IIT Bhubaneswar with Edufabrica Pvt. Ltd.',
    period: 'Nov – Dec 2023',
    detail: 'One-month programme in stellar physics and cosmology with practical data-analysis assignments.',
    tags: ['Stellar Physics', 'Cosmology', 'Data Analysis'],
    icon: '🌟',
    color: '#06b6d4',
  },
  {
    id: 'iirs-isro',
    title: 'Remote Sensing and GIS',
    issuer: 'Indian Institute of Remote Sensing, ISRO Dehradun',
    period: 'Jul 2021',
    detail: 'ISRO-sponsored course on analysing Earth observation data.',
    tags: ['Remote Sensing', 'GIS', 'ISRO'],
    icon: '🛰️',
    color: '#2563eb',
  },
];

/*
 * Networks and memberships. Rendered on the About page under the education
 * timeline — they say who the work is done alongside, which neither the
 * timeline nor the certificate cards record.
 */
export const memberships = [
  {
    id: 'astrae-iisc',
    name: 'ASTRAE Club, IISc Bangalore',
    period: 'Jan 2024 – Present',
    location: 'Bangalore, India',
    description:
      "The institute's astro-enthusiasts club, familiarising amateur astronomers with observational technique and the theory behind it. Much of its work is outreach aimed at younger audiences.",
    icon: '🔭',
    color: '#7c3aed',
  },
  {
    id: 'all-india-astronomy',
    name: 'All India Astronomy Club',
    period: 'Jan 2026 – Present',
    location: 'India',
    description:
      'A national collective of students and certified NASA Citizen Scientists, working to close the gap between academic theory and active observational research.',
    icon: '🌍',
    color: '#06b6d4',
  },
];

export const stats = [
  // Counted from src/data/experience.js.
  { value: 3, suffix: '', label: 'Research Internships', icon: '🔬', showInHero: true },
  /*
   * Counted from src/data/projects.js — every entry whose status is
   * 'completed'. The radio-astronomy R&D entry that used to be counted here
   * was a job, not a project and now lives in experience.js; Exoplanet
   * Explorer took the slot the 'Coming Soon' placeholder was holding.
   */
  { value: 4, suffix: '', label: 'Research Projects', icon: '🌌', showInHero: true },
  // certifications.length + professionalDevelopment.length.
  { value: 6, suffix: '', label: 'Courses & Training', icon: '🎓' },
  { value: 8.35, suffix: '', label: 'CGPA (B.Sc. Physics)', icon: '⭐', isDecimal: true },
];
