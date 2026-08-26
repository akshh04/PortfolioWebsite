/*
 * Work experience — roles held, not work produced.
 *
 * This used to be mixed into src/data/projects.js: the radio-astronomy R&D
 * internship sat in the Projects grid alongside a literature review and a
 * conference talk, so a reader had no way to tell which entries were paid
 * positions and which were pieces of work. The two are separate sections now,
 * and the rule for which file an entry belongs in is simply whether it names
 * an employer.
 *
 * Entries are shaped for src/components/ui/ProjectCard.jsx, which both
 * sections render: `subtitle` and `highlights` are the two fields a role uses
 * and a project does not. `shortDesc` is what the card face shows and
 * `highlights` is what the dialog opens to — a role has no `fullDesc`, since
 * the bullets are the description.
 *
 * Newest first, matching the education timeline's ordering.
 */
export const experience = [
  {
    id: 'king-electricals',
    title: 'R&D Intern — Radio Astronomy Instrumentation',
    subtitle: 'King Electricals and Engineering Works',
    period: 'Aug 2025 – Apr 2026',
    type: 'Industry R&D · Rajapalayam, India',
    shortDesc:
      'Development and testing of instrumentation for a radio telescope array, including low-noise RF enclosure design and EMI mitigation.',
    highlights: [
      'Contributed to the development and testing of radio astronomy instrumentation for a radio telescope array.',
      'Assisted in the electrical design and fabrication of low-noise RF enclosures for astronomical data collection.',
      'Researched signal attenuation and electromagnetic interference in observatory environments.',
      'Worked with the engineering team to trace RF interference sources and validate signal-to-noise performance during field testing.',
    ],
    tags: ['RF Systems', 'Instrumentation', 'EMI', 'Field Testing'],
    icon: '📻',
    color: '#06b6d4',
    status: 'completed',
  },
  {
    id: 'iit-madras',
    title: 'Training & Internship on Astrophysics',
    subtitle: 'IIT Madras with Edutech Life',
    period: 'Feb – Mar 2025',
    type: 'Research Internship · Chennai, India',
    shortDesc:
      'Internship project on the history and evolution of black hole theories, with hands-on work in the computational tools used to simulate celestial phenomena.',
    highlights: [
      'Completed an internship project on the history and evolution of black hole theories.',
      'Conducted theoretical research across space science and cosmology, working from primary academic sources.',
      'Gained hands-on experience with the computational tools used to simulate celestial phenomena.',
      'Synthesised the literature into a coherent narrative tracing the key theoretical milestones in black hole physics.',
    ],
    tags: ['Black Holes', 'Cosmology', 'Scientific Writing'],
    icon: '🕳️',
    color: '#7c3aed',
    status: 'completed',
  },
  {
    id: 'iit-bhubaneswar',
    title: 'Training & Internship on Astrophysics',
    subtitle: 'IIT Bhubaneswar with Edufabrica Pvt. Ltd.',
    period: 'Mar – Apr 2023',
    type: 'Research Internship · Bhubaneswar, India',
    shortDesc:
      'Research on black holes and their role in astrophysics, reviewing the literature and reporting the theory behind it.',
    highlights: [
      'Researched black holes and their role in astrophysics, reviewing the literature and analysing the underlying theory.',
      'Organised the findings into a structured technical report.',
      'Presented the outcomes, with the academic writing assessed alongside the research itself.',
    ],
    tags: ['Black Holes', 'Literature Review', 'Reporting'],
    icon: '🌑',
    color: '#2563eb',
    status: 'completed',
  },
];

/*
 * Conferences and seminars. They sit under the experience section rather than
 * in Projects because what is being recorded is attendance and delivery — a
 * date and a venue — not a body of work. The talk itself is a project entry;
 * see 'Exoplanets and the Search for Alien Life' in src/data/projects.js.
 */
export const conferences = [
  {
    id: 'asi-44',
    name: '44th Meeting of the Astronomical Society of India',
    venue: 'IIT Guwahati, India',
    period: 'May 2026',
    role: 'Oral presentation',
    description:
      'Presented "Exoplanets and the Search for Alien Life" at India\'s premier national astronomy conference, covering detection methods, biosignature candidates, and the habitability framework used in planetary science.',
    icon: '🎤',
    color: '#7c3aed',
  },
  {
    id: 'iisc-open-day',
    name: 'IISc Open Day',
    venue: 'IISc Bangalore, India',
    period: 'Mar 2023',
    role: 'Attended',
    description:
      'The annual public outreach event at which the Indian Institute of Science opens its campus for free exploration of its research, live experiments, and exhibitions.',
    icon: '🔬',
    color: '#06b6d4',
  },
];
