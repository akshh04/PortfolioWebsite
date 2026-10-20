import React, { useId } from 'react';
import { ExternalLink, Github } from 'lucide-react';

export default function ProjectDestinations({ project, children, compact = false }) {
  const noteId = useId();
  if (!project.link && !project.source && !children) return null;
  return <div className="project-destinations">
    <div className="project-actions project-external-actions">
      {children}
      {project.link && <a className="project-live" href={project.link} target="_blank" rel="noopener noreferrer" aria-describedby={noteId} aria-label="Open live app (opens in a new tab)">Live app<ExternalLink size={15} aria-hidden="true" /></a>}
      {project.source && <a className="project-source" href={project.source} target="_blank" rel="noopener noreferrer" aria-label="View source code (opens in a new tab)"><Github size={16} aria-hidden="true" />Source code<ExternalLink size={14} aria-hidden="true" /></a>}
    </div>
    {project.link && <p id={noteId} className="app-startup-note">{compact ? 'Hosted on Streamlit · may take a moment to wake up.' : 'The app may need a moment to wake up. If prompted, choose “Yes, get this app back up!”'}</p>}
  </div>;
}
