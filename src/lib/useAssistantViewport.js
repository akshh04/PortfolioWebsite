import { useEffect, useState } from 'react';
import { assistantViewportMetrics } from './assistantViewport';

function measure(restingHeight) {
  const focused = document.activeElement;
  const layout = { width: window.innerWidth, height: window.innerHeight };
  return assistantViewportMetrics(window.visualViewport, layout,
    focused?.matches('input, textarea, [contenteditable="true"]'), restingHeight);
}

export default function useAssistantViewport() {
  const [viewport, setViewport] = useState(() => measure());
  useEffect(() => {
    let frame;
    let restingHeight = window.innerHeight;
    let restingWidth = window.innerWidth;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (window.innerWidth !== restingWidth) {
          restingWidth = window.innerWidth;
          restingHeight = window.innerHeight;
        }
        const next = measure(restingHeight);
        if (!next.keyboard) restingHeight = Math.max(window.innerHeight, next.height);
        setViewport(previous => Object.keys(next).every(key => next[key] === previous[key]) ? previous : next);
      });
    };
    const visual = window.visualViewport;
    visual?.addEventListener('resize', schedule);
    visual?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      visual?.removeEventListener('resize', schedule);
      visual?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
    };
  }, []);
  return { keyboardOpen: viewport.keyboard, style: {
    '--assistant-vv-top': `${viewport.top}px`, '--assistant-vv-left': `${viewport.left}px`,
    '--assistant-vv-width': `${viewport.width}px`, '--assistant-vv-height': `${viewport.height}px`,
  } };
}
