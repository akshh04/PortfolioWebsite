import React from 'react';
import { ArrowRight, SlidersHorizontal, BarChart3 } from 'lucide-react';

const briefs = {
  matter: { label: 'Theoretical research', title: 'Galaxy rotation & the missing mass problem', topics: ['Rotation curves', 'Particle candidates', 'Alternative gravity'] },
  talk: { label: 'Conference presentation', title: 'How do we search for life beyond Earth?', topics: ['Detection methods', 'Biosignatures', 'Habitability'] },
  paper: { label: 'Literature review', title: 'Connecting ideas across modern astrophysics', topics: ['Primary literature', 'Critical comparison', 'Scientific writing'] },
};

export default function ProjectPreview({ kind, featured = false }) {
  if (kind === 'app') return <figure className={`project-preview app-preview${featured ? ' featured-preview' : ''}`}>
    <div className="preview-image-wrap">
      <img src="/previews/exoplanet-trends.jpg" alt="Exoplanet Explorer showing discovery filters and a stacked chart of confirmed planets by year and detection method" width="1280" height="900" loading="lazy" decoding="async" />
    </div>
    {featured && <div className="preview-annotations" aria-label="Features visible in the screenshot">
      <span><SlidersHorizontal size={16} aria-hidden="true" />Filter the NASA dataset</span>
      <ArrowRight size={15} className="annotation-arrow" aria-hidden="true" />
      <span><BarChart3 size={16} aria-hidden="true" />Compare discovery methods</span>
    </div>}
    <figcaption>Discovery trends in the live application · Captured October 2026</figcaption>
  </figure>;
  const brief = briefs[kind];
  if (!brief) return null;
  return <div className="research-brief">
    <p className="brief-label">{brief.label}</p>
    <p className="brief-question">{brief.title}</p>
    <p className="brief-topics">{brief.topics.join(' · ')}</p>
  </div>;
}
