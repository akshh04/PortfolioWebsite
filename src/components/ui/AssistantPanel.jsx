import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Code2, GraduationCap, Handshake, Mail, Orbit, RotateCcw, Send, Sparkles, Telescope, X } from 'lucide-react';
import { assistantError, assistantSources, cleanQuestion, QUESTION_LIMIT } from '../../lib/assistantPolicy';
import { assistantStarters } from '../../lib/assistantStarters';

const starterIcons = { mail: Mail, telescope: Telescope, orbit: Orbit, code: Code2, graduation: GraduationCap, collaborate: Handshake };
const isLocal = import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

export default function AssistantPanel({ onClose, viewport }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const mounted = useRef(true);
  const pending = useRef(false);
  const clientRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    mounted.current = true;
    const opener = document.querySelector('.assistant-launcher') || document.activeElement;
    const app = document.getElementById('root');
    const previousInert = app.inert;
    const previousOverflow = document.documentElement.style.overflow;
    const scrollY = window.scrollY;
    // Freeze the page content, leaving the portaled dialog outside the fixed
    // container. Fixing body itself makes WebKit pan the whole chat on focus.
    const previousApp = { position: app.style.position, top: app.style.top, left: app.style.left, width: app.style.width, overflow: app.style.overflow };
    app.inert = true;
    document.documentElement.style.overflow = 'hidden';
    Object.assign(app.style, { position: 'fixed', top: `-${scrollY}px`, left: '0', width: '100%', overflow: 'hidden' });
    // Focus Close rather than forcing the phone keyboard to open immediately.
    dialogRef.current.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], textarea:not([disabled]), summary')]
        .filter(node => node.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !controls.includes(document.activeElement))) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    clientRef.current = import('../../lib/aiClient').then(client => { client.prepareAssistant(); return client; });
    // The assistant remains usable as a portfolio guide if SDK setup fails.
    clientRef.current.catch(() => {});
    return () => {
      mounted.current = false;
      app.inert = previousInert;
      document.documentElement.style.overflow = previousOverflow;
      Object.assign(app.style, previousApp);
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      window.removeEventListener('keydown', handleKey);
      const returnTarget = opener?.isConnected ? opener : document.querySelector('.assistant-launcher');
      returnTarget?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = messages.length || busy || error ? listRef.current.scrollHeight : 0;
  }, [messages, busy, error]);

  async function send(value) {
    if (pending.current) return;
    let text;
    try { text = cleanQuestion(value); } catch { setError('Please enter a question about Akash.'); inputRef.current?.focus(); return; }
    pending.current = true;
    setBusy(true);
    setError('');
    setQuestion('');
    const history = messages;
    setMessages([...history, { role: 'user', text }]);
    try {
      const client = await clientRef.current;
      const answer = await client.askAssistant(history, text);
      if (!mounted.current) return;
      setMessages([...history, { role: 'user', text }, { role: 'assistant', ...answer }]);
    } catch (failure) {
      if (!mounted.current) return;
      // Restore the submitted text only if the request fails.
      setQuestion(text);
      setMessages(history);
      setError(assistantError(failure, isLocal));
    } finally {
      pending.current = false;
      if (mounted.current) { setBusy(false); }
    }
  }

  function followSource() { onClose(); }

  function chooseStarter(starter) {
    if (pending.current) return;
    setError('');
    setQuestion('');
    setMessages(history => [...history, { role: 'user', text: starter.label }, { role: 'assistant', kind: 'portfolio', ...starter.answer }]);
  }

  function resetConversation() {
    if (pending.current) return;
    setMessages([]); setQuestion(''); setError('');
  }

  return createPortal(<div className="assistant-backdrop" style={viewport.style} data-keyboard-open={viewport.keyboardOpen} onClick={onClose}>
    <section ref={dialogRef} className="assistant-panel" role="dialog" aria-modal="true"
      aria-labelledby="assistant-title" aria-describedby="assistant-description" onClick={event => event.stopPropagation()}>
      <header className="assistant-header">
        <span className="assistant-brand-orb"><Sparkles size={20} aria-hidden="true" /></span>
        <div className="assistant-header-copy"><p>AKASH SANKAR</p><h2 id="assistant-title">Ask about Akash</h2></div>
        <div className="assistant-header-actions">
          <button type="button" onClick={resetConversation} disabled={busy || !messages.length} aria-label="Start a new conversation" title="New conversation"><RotateCcw size={17} aria-hidden="true" /></button>
          <button type="button" onClick={onClose} aria-label="Close assistant"><X size={20} aria-hidden="true" /></button>
        </div>
      </header>
      <div ref={listRef} className="assistant-conversation">
        {!messages.length && <div className="assistant-welcome">
          <h3>Explore the portfolio</h3>
          <p id="assistant-description">Choose a topic, or ask your own question.</p>
          <div className="assistant-suggestions" aria-label="Suggested questions">
            {assistantStarters.map(starter => {
              const Icon = starterIcons[starter.icon];
              return <button key={starter.id} type="button" disabled={busy} onClick={() => chooseStarter(starter)} aria-label={`${starter.title}: ${starter.label}`}>
                <Icon size={18} aria-hidden="true" /><strong>{starter.title}</strong><ArrowUpRight size={14} aria-hidden="true" />
              </button>;
            })}
          </div>
          <p className="assistant-shortcut-note">Topics use portfolio answers. Custom questions use AI.</p>
        </div>}
        {!!messages.length && <p id="assistant-description" className="sr-only">Portfolio answers and AI replies, with links to the source material.</p>}
        <ol className="assistant-messages" aria-label="Conversation" aria-live="polite" aria-relevant="additions" aria-busy={busy}>
          {messages.map((message, index) => <li key={index} className={`assistant-message assistant-message-${message.role}`}>
            <p className="assistant-speaker">{message.role === 'user' ? 'You' : <><Sparkles size={13} aria-hidden="true" />{message.kind === 'portfolio' ? 'From the portfolio' : 'AI guide'}</>}</p>
            <p className="assistant-answer">{message.text}</p>
            {!!message.sources?.length && <nav className="assistant-sources" aria-label="Portfolio sources">
              {message.sources.map(source => <a key={source.id} href={source.href} onClick={followSource}>{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}
            </nav>}
          </li>)}
        </ol>
        <p className="assistant-status" role="status" aria-live="polite">{busy && <><span className="assistant-working-dot" aria-hidden="true" />Looking through the portfolio…</>}</p>
        {error && <div className="assistant-error" role="alert"><p>{error}</p>
          <nav className="assistant-sources" aria-label="Explore without AI">{assistantSources.slice(0, 5).map(source => <a key={source.id} href={source.href} onClick={followSource}>{source.label}<ArrowUpRight size={14} aria-hidden="true" /></a>)}</nav>
        </div>}
        {isLocal && <details className="assistant-dev-note"><summary>Local testing setup</summary><p>For AI replies on localhost, register this browser’s App Check debug token from DevTools → Console in Firebase → App Check → Apps → Manage debug tokens. Starter answers work without setup.</p></details>}
      </div>
      <form className="assistant-form" onSubmit={event => { event.preventDefault(); send(question); }}>
        <label htmlFor="assistant-question" className="sr-only">Your question</label>
        <div className="assistant-compose">
          <textarea ref={inputRef} id="assistant-question" value={question} maxLength={QUESTION_LIMIT} rows={2}
            placeholder={busy ? 'Waiting for your answer…' : 'What would you like to know?'} readOnly={busy} aria-describedby="assistant-input-help assistant-privacy"
            onChange={event => setQuestion(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(question); } }} />
          <button type="submit" disabled={busy || !question.trim()} aria-label={busy ? 'Waiting for reply' : 'Send question'}><Send size={19} aria-hidden="true" /></button>
        </div>
        <div className="assistant-composer-meta"><p id="assistant-input-help">AI can make mistakes. Check the sources.</p><span>{question.length}/{QUESTION_LIMIT}</span></div>
        <p id="assistant-privacy" className="assistant-privacy">Custom questions go to Google. Avoid private details. This chat clears when closed.</p>
      </form>
    </section>
  </div>, document.body);
}
