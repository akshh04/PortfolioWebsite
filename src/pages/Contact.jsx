import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OWNER_EMAIL, initialForm, validateContact, contactPayload, emailDraft, readContactDraft, saveContactDraft, projectDiscussionDraft, originalCvRequestDraft } from '../lib/contact';
import CVActions from '../components/ui/CVActions';
import CVNotice from '../components/ui/CVNotice';
import SocialLinks from '../components/ui/SocialLinks';
import {
  Mail, CheckCircle,
  ExternalLink, Send, User, AtSign, MessageSquare, Tag, Loader2, AlertCircle,
  Copy, Check
} from 'lucide-react';

// ─── EmailJS Configuration ─────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_AUTO_REPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''; // Configured in .env (ignored from git)

/*
 * .env is gitignored, so a fresh clone builds a form that looks completely
 * operational and fails only after the visitor has written their message —
 * with EmailJS's own internal error text, which says nothing useful. Detect
 * the missing key up front and route people to the address instead.
 */
const EMAILJS_CONFIGURED = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);



const inputStyles = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '0.85rem 1rem 0.85rem 2.75rem',
  color: 'var(--text-primary)',
  fontFamily: 'Inter, sans-serif',
  /*
   * Through a custom property rather than a literal: iOS Safari zooms the
   * whole page when a field smaller than 16px takes focus, and it does not
   * zoom back out afterwards. These styles are applied inline, which no
   * media query can override, so the breakpoint lives on the property.
   * See --field-font-size in index.css.
   */
  fontSize: 'var(--field-font-size, 0.95rem)',
  outline: 'none',
  transition: 'border-color 0.25s, box-shadow 0.25s',
  backdropFilter: 'blur(10px)',
};

// An error's colour must not be the only thing marking it: FieldError pairs
// the red with an icon and text, so it survives a monochrome or colour-blind
// reading of the form.
function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--error-text)' }}>
      <AlertCircle size={12} className="shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function fieldBorder(focused, invalid) {
  if (invalid) return 'var(--error-text)';
  return focused ? 'var(--nebula-1)' : 'var(--border)';
}

function fieldGlow(focused, invalid) {
  if (invalid) return '0 0 0 3px rgba(248,113,113,0.14)';
  return focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none';
}

const FormField = React.forwardRef(({ icon: Icon, label, id, type = 'text', value, onChange, placeholder, required, autoComplete, error }, ref) => {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
        {label}{!required && <span className="field-optional"> (optional)</span>}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          aria-hidden="true"
          style={{ color: error ? 'var(--error-text)' : focused ? 'var(--nebula-1)' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
        <input
          ref={ref}
          id={id}
          name={id}
          maxLength={type === 'email' ? 254 : 200}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyles,
            borderColor: fieldBorder(focused, Boolean(error)),
            boxShadow: fieldGlow(focused, Boolean(error)),
          }}
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
});

FormField.displayName = 'FormField';

function TextareaField({ icon: Icon, label, id, value, onChange, placeholder, required, error }) {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif' }}>
        {label}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3.5 top-[1rem] pointer-events-none z-10"
          aria-hidden="true"
          style={{ color: error ? 'var(--error-text)' : focused ? 'var(--nebula-1)' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
        <textarea
          id={id}
          name={id}
          maxLength={5000}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={5}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyles,
            padding: '0.95rem 1rem 0.95rem 2.75rem',
            resize: 'vertical',
            borderColor: fieldBorder(focused, Boolean(error)),
            boxShadow: fieldGlow(focused, Boolean(error)),
          }}
        />
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

export default function Contact() {
  const [form, setForm] = useState(readContactDraft);
  const [draftSaved, setDraftSaved] = useState(false);
  useEffect(() => { setDraftSaved(saveContactDraft(form)); }, [form]);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');
  // Populated only after a submit attempt: flagging an empty form red before
  // anyone has typed is scolding, not helping.
  const [fieldErrors, setFieldErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const nameInputRef = useRef(null);
  const sendingRef = useRef(false);
  const copyTimerRef = useRef(null);
  const autoReplyTimerRef = useRef(null);

  /*
   * navigator.clipboard only exists in a secure context, so on a plain-http
   * preview (or an older mobile browser) reading `.writeText` off it threw and
   * the click handler died. The promise it returns can also reject when the
   * permission is denied — which the old code never awaited, so the button
   * cheerfully showed "Copied" for a copy that had not happened.
   */
  const handleCopyEmail = async () => {
    const address = OWNER_EMAIL;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setCopyError(false);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Keep a selectable address and explain the fallback when permission fails.
      setCopied(false);
      setCopyError(true);
    }
  };

  useEffect(() => {
    const handleRequestResume = () => {
      if (sendingRef.current) return;
      setStatus('idle');
      setFieldErrors({});
      setForm(originalCvRequestDraft);
      if (nameInputRef.current) {
        // Reveal the form itself, including when requested from the lower card.
        nameInputRef.current.focus();
      }
    };
    window.addEventListener('requestResume', handleRequestResume);
    const handleDiscussion = event => {
      if (sendingRef.current || typeof event.detail?.title !== 'string') return;
      setForm(previous => projectDiscussionDraft(previous, event.detail.title));
      setStatus('idle');
      setFieldErrors({});
      nameInputRef.current?.focus();
    };
    window.addEventListener('discussProject', handleDiscussion);
    return () => {
      window.removeEventListener('requestResume', handleRequestResume);
      window.removeEventListener('discussProject', handleDiscussion);
    };
  }, []);

  // Any pending timer must not fire after unmount.
  useEffect(() => () => {

    clearTimeout(copyTimerRef.current);
    clearTimeout(autoReplyTimerRef.current);
  }, []);

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    if (status !== 'sending') setStatus('idle');
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as it is being corrected, rather than
    // leaving it red until the next submit.
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sendingRef.current) return;
    const errors = validateContact(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Send focus to the first problem so a keyboard or screen-reader user
      // is not left hunting for what went wrong.
      const firstInvalid = ['name', 'email', 'subject', 'message'].find(k => errors[k]);
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    if (!EMAILJS_CONFIGURED) {
      window.location.href = emailDraft(form);
      return;
    }

    setFieldErrors({});
    sendingRef.current = true;
    setStatus('sending');
    setErrorMsg('');

    try {
      const { default: emailjs } = await import('@emailjs/browser');
      // Confirm the owner delivery before attempting the courtesy reply.
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        contactPayload(form),
        EMAILJS_PUBLIC_KEY
      );

      setStatus('success');
      saveContactDraft(initialForm);
      setForm(initialForm);
      // EmailJS throttles consecutive requests. The courtesy reply is delayed
      // and independent: its failure must not ask visitors to resend a message
      // that already reached the owner. Capture this submission's values.
      if (EMAILJS_AUTO_REPLY_TEMPLATE_ID) autoReplyTimerRef.current = setTimeout(() => {
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTO_REPLY_TEMPLATE_ID, {
          to_name: form.name.trim(), to_email: form.email.trim(),
          user_email: form.email.trim(), reply_to: OWNER_EMAIL,
        }, EMAILJS_PUBLIC_KEY).catch(() => {
          console.warn('The message was sent, but its courtesy reply was unavailable.');
        });
      }, 1100);
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
      setErrorMsg('Your message could not be sent. Your draft is still here — please try again or email me directly.');
    } finally {
      sendingRef.current = false;
    }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const fadeUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
  };

  return (
    <div className="relative overflow-hidden">

      <div className="section-shell max-w-5xl">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={VIEWPORT}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="section-eyebrow">Say hello</motion.p>
          {/* h2, not h1 — one document, one h1 (the hero name). */}
          <motion.h2 variants={fadeUp} className="section-title">
            Let&apos;s discuss{' '}
            <span className="gradient-text">research or collaboration</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mx-auto">
            Have a research opportunity, a collaboration in mind, or a question about my work? Get in touch.
          </motion.p>
        </motion.div>

        <div className="contact-access" aria-label="Quick contact">
          <div><h3>Connect directly</h3><p>Email me or find me on these platforms.</p></div>
          <a className="contact-email-action" href={`mailto:${OWNER_EMAIL}`}><Mail size={18} aria-hidden="true" />Email Akash</a>
        </div>
        <SocialLinks />

        <section className="collaboration-interests" aria-labelledby="collaboration-title">
          <h3 id="collaboration-title">Let's work together</h3>
          <p>I'm open to collaborations in astrophysics research, radio instrumentation, and scientific data analysis.</p>
          <div>{['Astrophysics research', 'Radio instrumentation', 'Scientific data analysis'].map(topic => <button key={topic} type="button" disabled={status === 'sending'} onClick={() => {
            setForm(previous => ({ ...previous, subject: `${topic} collaboration` }));
            setStatus('idle');
            setFieldErrors(previous => ({ ...previous, subject: undefined }));
            nameInputRef.current?.focus();
          }}>{topic} →</button>)}</div>
        </section>

        {/* Two-column layout: form + quick links */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">

          {/* Contact Form — 3/5 width */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <div className="glass-card p-8" style={{ border: '1px solid rgba(124,58,237,0.15)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--gradient)' }}>
                  <Send size={16} className="text-white" />
                </div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                  Send a message
                </h3>
              </div>

              {/*
                noValidate hands validation to `validate()` above. Without it
                the browser's own bubble fires first, in its own wording and
                its own language, and our inline messages never appear.
              */}
              {!EMAILJS_CONFIGURED && <p className="form-note">Use this form to prepare a draft in your email app, or <a href={`mailto:${OWNER_EMAIL}`}>email me directly</a>. You can review it before sending.</p>}
              <form onSubmit={handleSubmit} noValidate aria-busy={status === 'sending'} className="flex flex-col gap-4"><fieldset disabled={status === 'sending'} className="flex flex-col gap-4 min-w-0">
                <p className="form-requirements">Name, email, and message are required. Subject is optional.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField icon={User} label="Your Name" id="name" value={form.name} ref={nameInputRef}
                    onChange={handleChange('name')} placeholder="Jane Smith" required autoComplete="name"
                    error={fieldErrors.name} />
                  <FormField icon={AtSign} label="Email Address" id="email" type="email"
                    value={form.email} onChange={handleChange('email')}
                    placeholder="jane@example.com" required autoComplete="email"
                    error={fieldErrors.email} />
                </div>

                <FormField icon={Tag} label="Subject" id="subject" value={form.subject}
                  onChange={handleChange('subject')}
                  placeholder="Research collaboration, internship, general query…"
                  error={fieldErrors.subject} />

                <TextareaField icon={MessageSquare} label="Message" id="message"
                  value={form.message} onChange={handleChange('message')}
                  placeholder="Tell me about your project, opportunity, or question…" required
                  error={fieldErrors.message} />

</fieldset>
                {draftSaved && <div className="draft-status"><p>Draft saved in this browser tab.</p><button type="button" disabled={status === 'sending'} onClick={() => { setForm({ ...initialForm }); setFieldErrors({}); setStatus('idle'); }}>Clear draft</button></div>}
                {/*
                  Status feedback. role="status" so the outcome of a submit is
                  announced — previously it was a purely visual change, which a
                  screen-reader user had no way of noticing at all.
                */}
                <div role="status" aria-live="polite">
                <AnimatePresence mode="wait">
                  {status === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
                    >
                      <CheckCircle size={18} style={{ color: 'var(--success-text)' }} />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--success-text)' }}>Message sent!</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Thanks for reaching out — I'll reply soon.</p>
                      </div>
                    </motion.div>
                  )}
                  {status === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      <AlertCircle size={18} style={{ color: 'var(--error-text)' }} />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--error-text)' }}>Failed to send</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{errorMsg}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'sending' || status === 'success'}
                  className="btn-primary flex items-center justify-center gap-2 mt-2"
                  whileHover={status === 'idle' ? { scale: 1.03, boxShadow: '0 0 30px rgba(124,58,237,0.5)' } : {}}
                  whileTap={status === 'idle' ? { scale: 0.97 } : {}}
                  style={{ opacity: status === 'success' ? 0.6 : 1, cursor: status === 'sending' ? 'wait' : 'pointer' }}
                >
                  <span className="flex items-center gap-2">
                    {status === 'sending' ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending…</>
                    ) : status === 'success' ? (
                      <><CheckCircle size={16} /> Sent!</>
                    ) : (
                      <><Send size={16} /> {EMAILJS_CONFIGURED ? 'Send message' : 'Open email draft'}</>
                    )}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right column: email CTA + quick info — 2/5 */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-5"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_EXPO }}
          >
            {/*
              Direct email.

              The copy button used to sit inside an <a href="mailto:"> wrapping
              the whole card — a control nested in a link, which is invalid HTML
              and gives assistive tech two conflicting actions for one element.
              Keep the email links and copy button separate so each action has
              its own hit area and keyboard focus.
            */}
            <motion.div
              className="glass-card p-6 relative"
              style={{ border: '1px solid rgba(124,58,237,0.15)' }}

            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'var(--gradient)' }}>
                <Mail size={20} className="text-white" />
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email me directly</p>
              <div className="flex items-center justify-between gap-2">
                <a href={`mailto:${OWNER_EMAIL}`} className="font-bold text-sm gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', wordBreak: 'break-all' }}>
                  {OWNER_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="tap-target relative z-10 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 shrink-0"
                  style={{
                    background: copied ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface-hover)',
                    color: copied ? 'var(--success-text)' : 'var(--text-secondary)',
                    border: copied ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    minWidth: '44px', minHeight: '44px',
                    cursor: 'pointer',
                  }}
                  aria-label={copied ? 'Email address copied' : 'Copy email address'}
                  title="Copy email address"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
                      <Check size={13} className="shrink-0" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy size={13} />
                    </span>
                  )}
                </button>
              </div>
              <p role="status" className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{copyError ? 'Copy unavailable. Select the address above to copy it.' : copied ? 'Email address copied.' : ''}</p>
              <a href={`mailto:${OWNER_EMAIL}`} className="tap-target text-xs mt-2 inline-flex items-center gap-1 underline" style={{ color: 'var(--nebula-3-text)' }}>
                Open mail client <ExternalLink size={11} aria-hidden="true" />
              </a>
            </motion.div>

            <section className="glass-card p-6 cv-options" aria-labelledby="cv-options-title">
              <h3 id="cv-options-title">Choose a CV</h3>
              <CVNotice />
              <CVActions />
            </section>

            {/* Response time note */}
            <div className="glass-card p-5" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Response time:</span> I typically reply within 24–48 hours. For urgent matters, email is fastest.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
