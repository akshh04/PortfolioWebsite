import React from 'react';
import { Orbit, Radio, BookOpen, Mic, Telescope, GraduationCap, BarChart3, Users, Globe, FlaskConical } from 'lucide-react';

const icons = {
  'exoplanet-explorer': Telescope,
  'dark-matter-rotation-curves': Orbit,
  'exoplanets-search-for-life': Mic,
  'astrophysics-literature-review': BookOpen,
  'king-electricals': Radio,
  'iit-madras': Orbit,
  'iit-bhubaneswar': BookOpen,
  'data-analyst-besant': BarChart3,
  'astronomy-noxjet': Telescope,
  'asi-44': Mic,
  'iisc-open-day': FlaskConical,
  'astrae-iisc': Users,
  'all-india-astronomy': Globe,
};

export default function ContentIcon({ id, education = false }) {
  const Icon = education ? GraduationCap : icons[id] || Telescope;
  return <span className="content-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.6} /></span>;
}
