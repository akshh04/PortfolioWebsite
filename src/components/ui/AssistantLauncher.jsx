import React, { lazy, Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import useAssistantViewport from '../../lib/useAssistantViewport';
import { useMediaQuery } from '../../lib/device';
import './assistant.css';

const AssistantPanel = lazy(() => import('./AssistantPanel'));

export default function AssistantLauncher({ onOpen }) {
  const [open, setOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const compact = useMediaQuery('(max-width: 1023px)');
  useEffect(() => {
    const timer = window.setTimeout(() => setIntro(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);
  const viewport = useAssistantViewport();
  const close = () => setOpen(false);
  const unavailable = <div className="assistant-load-card" role="alert"><p>The assistant could not load. Refresh to try again.</p><button type="button" onClick={close}>Close</button></div>;
  const launcher = <button type="button" className={`assistant-launcher${compact ? ' assistant-launcher-mobile' : ''}`} style={viewport.style} hidden={open || viewport.keyboardOpen} aria-expanded={open}
      data-intro={compact && intro}
      aria-label="Ask about Akash"
      title="Ask about Akash" aria-haspopup="dialog" onClick={() => { onOpen?.(); setOpen(true); }}>
      {compact ? <><Sparkles size={18} aria-hidden="true" /><span className="assistant-launcher-mobile-label" aria-hidden="true">Ask about Akash</span></> : <>
      <span className="assistant-brand-orb"><Sparkles size={20} aria-hidden="true" /></span>
      <span className="assistant-launcher-copy"><strong>Ask about Akash</strong><span>Your portfolio guide</span></span>
      <ChevronRight className="assistant-launcher-arrow" size={18} strokeWidth={1.8} aria-hidden="true" />
      </>}
    </button>;
  return <>
    {compact ? launcher : createPortal(launcher, document.body)}
    {open && <ErrorBoundary decorative fallback={unavailable}>
      <Suspense fallback={<div className="assistant-load-card"><p role="status">Opening your portfolio guide…</p><button type="button" onClick={close}>Cancel</button></div>}>
        <AssistantPanel onClose={close} viewport={viewport} />
      </Suspense>
    </ErrorBoundary>}
  </>;
}
