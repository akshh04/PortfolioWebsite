import React, { useEffect, useRef, useState, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, ZoomIn, ZoomOut, Copy, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { discussProject, projectUrl } from '../../lib/projectNavigation';

export default function ProjectDialog({ project, onClose, openerRef, projectList = [], onNavigate }) {
  const dialogRef = useRef(null);
  const screenshotRef = useRef(null);
  const bodyRef = useRef(null);
  const headingRef = useRef(null);
  const previousProject = useRef(project);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [imageOpen, setImageOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const imageOpenRef = useRef(imageOpen);
  const previousImage = useRef(false);
  imageOpenRef.current = imageOpen;
  const titleId = useId();
  const projectIndex = projectList.findIndex(item => item.slug === project.slug);
  const previous = projectList[projectIndex - 1];
  const next = projectList[projectIndex + 1];

  useEffect(() => {
    const app = document.getElementById('root');
    const root = document.documentElement;
    const previousInert = app.inert;
    const previousOverflow = root.style.overflow;
    app.inert = true;
    root.style.overflow = 'hidden';
    dialogRef.current.querySelector('button')?.focus();
    const handleKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (imageOpenRef.current) { setImageOpen(false); setZoom(false); }
        else closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], input')].filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      app.inert = previousInert;
      root.style.overflow = previousOverflow;
      const target = openerRef.current?.isConnected && openerRef.current.getClientRects().length
        ? openerRef.current : document.getElementById('projects');
      target?.focus({ preventScroll: true });
    };
  }, [openerRef]);

  useEffect(() => {
    if (previousProject.current === project) return;
    previousProject.current = project;
    setImageOpen(false);
    setZoom(false);
    setCopyStatus('');
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    headingRef.current?.focus({ preventScroll: true });
  }, [project]);

  useEffect(() => {
    if (previousImage.current === imageOpen) return;
    previousImage.current = imageOpen;
    if (imageOpen) dialogRef.current.querySelector('button')?.focus();
    else screenshotRef.current?.focus({ preventScroll: true });
  }, [imageOpen]);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(projectUrl(project.slug)); setCopyStatus('Link copied'); }
    catch { setCopyStatus('Copy the address from your browser to share this project.'); }
  };
  return createPortal(
    <div className="detail-backdrop" onClick={onClose}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className={`detail-dialog${imageOpen ? ' image-dialog' : ''}`} onClick={event => event.stopPropagation()}>
        <header className="detail-toolbar">
          {imageOpen && <button type="button" aria-label="Back to case study" onClick={() => { setImageOpen(false); setZoom(false); }}><ArrowLeft size={17} /><span className="viewer-back-long">Back to case study</span><span className="viewer-back-short" aria-hidden="true">Back</span></button>}
          <span className="detail-toolbar-label">{imageOpen ? 'Screenshot viewer' : project.slug ? 'Case study' : 'Experience details'}</span>
          {imageOpen && <button type="button" onClick={() => setZoom(value => !value)} aria-pressed={zoom}>{zoom ? <ZoomOut size={17} /> : <ZoomIn size={17} />}{zoom ? 'Fit image' : 'Zoom in'}</button>}
          <button type="button" onClick={onClose} aria-label="Close project details"><X size={20} /></button>
        </header>
        <div ref={bodyRef} className={imageOpen ? 'screenshot-viewport' : 'detail-body'}>
          <h2 ref={headingRef} tabIndex={-1} id={titleId} className={imageOpen ? 'sr-only' : 'detail-title'}>{project.title}{imageOpen ? ' — screenshot' : ''}</h2>
          {imageOpen ? <img className={zoom ? 'screenshot-full zoomed' : 'screenshot-full'} src="/previews/exoplanet-explorer.jpg" alt="Exoplanet Explorer dashboard with filters, statistics, and discovery trends" /> : <>
            <p className="detail-meta">{project.type || project.subtitle} · {project.period}</p>
            {project.slug && <div className="detail-sharing">
              <div className="detail-sharing-actions">
                <button type="button" onClick={copyLink}><Copy size={16} aria-hidden="true" />Copy project link</button>
                {project.link && <a className="detail-open-live" href={project.link} target="_blank" rel="noopener noreferrer">Open live app<ExternalLink size={16} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>}
              </div>
              <span role="status">{copyStatus}</span>
            </div>}
            {project.contribution && <dl className="contribution-facts" aria-label="Project contribution">
              <div><dt>Project type</dt><dd>{project.contribution.scope}</dd></div>
              <div><dt>My role</dt><dd>{project.contribution.role}</dd></div>
              <div><dt>Deliverable</dt><dd>{project.contribution.deliverable}</dd></div>
            </dl>}
            {project.summary && <dl className="project-summary detail-summary">{[['Aim', 'aim'], ['My work', 'contribution'], ['Outcome', 'outcome']].map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{project.summary[key]}</dd></div>)}</dl>}
            {project.preview === 'app' && <section className="detail-section"><h3>In action</h3><button ref={screenshotRef} type="button" className="screenshot-trigger" onClick={() => setImageOpen(true)}><img className="project-detail-image" src="/previews/exoplanet-explorer.jpg" alt="Preview of the Exoplanet Explorer dashboard" width="1440" height="1000" /><span><ZoomIn size={16} />Enlarge screenshot</span></button></section>}
            {project.fullDesc && <section className="detail-section"><h3>Overview</h3><p>{project.fullDesc}</p></section>}
            {project.highlights && <section className="detail-section"><h3>{project.slug ? 'Methods & deliverables' : 'Responsibilities & contributions'}</h3><ul>{project.highlights.map(line => <li key={line}>{line}</li>)}</ul></section>}
            <section className="detail-section"><h3>Tools & topics</h3><div className="flex flex-wrap gap-2">{project.tags.map(tag => <span className="tag-chip" key={tag}>{tag}</span>)}</div></section>
            {project.link && <a className="btn-primary detail-live" href={project.link} target="_blank" rel="noopener noreferrer">Open live app<ExternalLink size={16} /><span className="sr-only">(opens in a new tab)</span></a>}
            {project.slug && <div className="project-discussion">
              <p>Have a question or an idea for this work?</p>
              <button type="button" onClick={() => discussProject(project)}><MessageSquare size={18} aria-hidden="true" />Discuss this project<ArrowRight size={16} aria-hidden="true" /></button>
            </div>}
          </>}
        </div>
        {!imageOpen && onNavigate && projectList.length > 1 && <nav className="case-navigation" aria-label="Browse case studies">
          <button type="button" disabled={!previous} onClick={() => previous && onNavigate(previous)} aria-label={previous ? `Previous project: ${previous.title}` : 'Previous project'}><ArrowLeft size={18} aria-hidden="true" />Previous project</button>
          <span>{projectIndex + 1} / {projectList.length}</span>
          <button type="button" disabled={!next} onClick={() => next && onNavigate(next)} aria-label={next ? `Next project: ${next.title}` : 'Next project'}>Next project<ArrowRight size={18} aria-hidden="true" /></button>
        </nav>}
      </section>
    </div>, document.body
  );
}
