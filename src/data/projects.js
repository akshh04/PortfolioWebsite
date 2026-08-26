/*
 * Work produced — research projects, papers, and talks.
 *
 * Roles held live in src/data/experience.js. The radio-astronomy R&D entry
 * that used to sit here was an internship, not a project, and rendering it in
 * this grid made the two indistinguishable.
 */
export const projects = [
  {
    id: 5,
    title: 'Exoplanet Explorer',
    period: 'Jul – Aug 2026',
    type: 'Python / Data Science — live web application',
    link: 'https://exoexplorer.web.app/',
    linkLabel: 'Open Exoplanet Explorer',
    shortDesc: 'A live dashboard over NASA’s Exoplanet Archive that scores and classifies ~6,000 confirmed planets against peer-reviewed habitability models.',
    fullDesc: 'A live data dashboard built on NASA’s Exoplanet Archive, streaming roughly 6,000 confirmed planets through its TAP REST API with cached, threaded ingestion and real-time progress reporting. On top of that ingest sit peer-reviewed habitability models — Kopparapu (2014) habitable-zone limits and the Earth Similarity Index — together with K-Means clustering over log mass–radius space, used to score and classify candidate worlds; the pipeline was validated against known results including TRAPPIST-1 and Proxima Cen b. The findings are presented as seven cross-filtered Plotly views — discovery trends, a 3D explorer, planet comparison, and a CSV-exportable leaderboard — in a responsive, WCAG AA-compliant light/dark interface.',
    highlights: [
      'Streamed ~6,000 confirmed planets from NASA’s Exoplanet Archive over its TAP REST API, with cached, threaded ingestion and real-time progress reporting.',
      'Implemented Kopparapu (2014) habitable-zone limits and the Earth Similarity Index to score candidate worlds, validated against TRAPPIST-1 and Proxima Cen b.',
      'Classified planets with K-Means clustering over log mass–radius space.',
      'Delivered seven cross-filtered Plotly views — discovery trends, 3D explorer, planet comparison, and a CSV-exportable leaderboard.',
      'Built the interface responsive and WCAG AA-compliant in both light and dark themes.',
    ],
    tags: ['Python', 'NASA API', 'Plotly', 'Machine Learning', 'Data Viz'],
    /*
     * green-600, not green-500. Green is the most luminous of the accents, so
     * the light theme's .tag-chip mix (72% toward black) left #22c55e chip
     * text at 4.04:1 on #fafafa — under the 4.5:1 floor, where every other
     * project colour clears it comfortably. This measures 5.07:1.
     */
    color: '#16a34a',
    icon: '🛰️',
    status: 'completed',
  },
  {
    id: 1,
    title: 'Dark Matter & Galaxy Rotation Curves',
    period: 'Jun – Jul 2025',
    type: 'Independent Research',
    shortDesc: 'Theoretical investigation of gravitational evidence for dark matter, including rotation-curve anomalies and candidate particles.',
    fullDesc: 'A rigorous theoretical study of the gravitational evidence for dark matter through the lens of galaxy rotation curves. The research covered the historical development of the missing-mass problem, analyzed rotation-curve anomalies in spiral galaxies, evaluated leading dark matter candidates (WIMPs, axions, sterile neutrinos), and critically examined alternative frameworks such as Modified Newtonian Dynamics (MOND). The work synthesized current observational constraints and open theoretical questions in the field.',
    tags: ['Dark Matter', 'Cosmology', 'Research'],
    color: '#7c3aed',
    icon: '🌌',
    status: 'completed',
  },
  {
    id: 2,
    title: '"Exoplanets and the Search for Alien Life"',
    period: 'May 2025',
    type: 'Research Presentation — later delivered at the 44th ASI Meeting',
    shortDesc: 'Presentation tracing the search for life beyond Earth, from detection methods to biosignatures — delivered at the 44th ASI Meeting, IIT Guwahati.',
    fullDesc: 'A presentation tracing the search for life beyond Earth: the exoplanet detection methods that made the question tractable (transit photometry, radial velocity, direct imaging), the landmark discoveries that followed, and the atmospheric biosignatures now used to identify potential signs of life on distant worlds. It closes on the habitability framework and the case for treating the next two decades as a potentially decisive period in answering whether life exists elsewhere. The work was subsequently delivered as an oral presentation at the 44th Meeting of the Astronomical Society of India, IIT Guwahati, in May 2026.',
    tags: ['Exoplanets', 'Astrobiology', 'Conference Talk', 'ASI'],
    color: '#2563eb',
    icon: '🪐',
    status: 'completed',
  },
  {
    id: 3,
    title: 'Astronomy, Astrophysics & Cosmology — Literature Review',
    period: 'Jan – Apr 2025',
    type: 'Research Paper',
    shortDesc: 'Structured literature review culminating in a formal research paper on a core modern-astrophysics concept.',
    fullDesc: 'An extensive structured review of primary literature spanning astronomy, astrophysics, and cosmology. The project involved critically reading and synthesizing dozens of peer-reviewed articles, identifying key themes and open questions in modern astrophysics, and distilling findings into a formal research paper. The process developed skills in academic reading, citation management, and scientific writing tailored for an astrophysics audience.',
    tags: ['Literature Review', 'Research Paper', 'Academic Writing'],
    color: '#06b6d4',
    icon: '📡',
    status: 'completed',
  },
];
