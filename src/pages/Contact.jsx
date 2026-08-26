import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import {
  Mail, Linkedin, Github, Instagram, FileText, CheckCircle,
  ExternalLink, Send, User, AtSign, MessageSquare, Tag, Loader2, AlertCircle,
  Copy, Check
} from 'lucide-react';
import GradientOrb from '../components/ui/GradientOrb';

// ─── EmailJS Configuration ─────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'portfolio.email';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'autoreply-temp-portfolio';
const EMAILJS_AUTO_REPLY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID || 'user_temp_18';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''; // Configured in .env (ignored from git)

/*
 * .env is gitignored, so a fresh clone builds a form that looks completely
 * operational and fails only after the visitor has written their message —
 * with EmailJS's own internal error text, which says nothing useful. Detect
 * the missing key up front and route people to the address instead.
 */
const EMAILJS_CONFIGURED = Boolean(EMAILJS_PUBLIC_KEY);

const OWNER_EMAIL = 'akashsankar80@gmail.com';

const socials = [
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/akashsankar04',
    color: '#0077b5',
    desc: 'Professional profile',
  },
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/Akash-github-tech',
    color: '#8b5cf6',
    desc: 'Code repositories',
  },
  {
    icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/akash_sankar_/',
    color: '#e1306c',
    desc: 'Personal updates',
  },
];

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
    <p id={id} className="flex items-center gap-1.5 text-xs" style={{ color: '#f87171' }}>
      <AlertCircle size={12} className="flex-shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function fieldBorder(focused, invalid) {
  if (invalid) return '#f87171';
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
        {label}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          aria-hidden="true"
          style={{ color: error ? '#f87171' : focused ? 'var(--nebula-1)' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
        <input
          ref={ref}
          id={id}
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
          style={{ color: error ? '#f87171' : focused ? 'var(--nebula-1)' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
        <textarea
          id={id}
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

const initialForm = { name: '', email: '', subject: '', message: '' };

// Deliberately permissive — the job here is to catch a typo like "jane@"
// before it costs a round trip, not to adjudicate RFC 5322.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
 * `required` on an input is satisfied by a single space, so the form happily
 * submitted a message consisting of whitespace and reported it as sent.
 */
function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please tell me your name.';
  if (!form.email.trim()) errors.email = 'An email address is needed for a reply.';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'That address does not look right.';
  if (!form.subject.trim()) errors.subject = 'A short subject helps me prioritise.';
  if (form.message.trim().length < 10) errors.message = 'A little more detail, please — at least 10 characters.';
  return errors;
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const VIEWPORT = { once: true, margin: '-80px' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');
  // Populated only after a submit attempt: flagging an empty form red before
  // anyone has typed is scolding, not helping.
  const [fieldErrors, setFieldErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const nameInputRef = useRef(null);
  const resetTimerRef = useRef(null);
  const copyTimerRef = useRef(null);

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
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Nothing useful to show inline here; the address is already on screen
      // in full and selectable, so the visitor can copy it by hand.
      setCopied(false);
    }
  };

  useEffect(() => {
    const handleRequestResume = () => {
      setForm(prev => ({
        ...prev,
        // "Résumé" everywhere else on the site, including the buttons that
        // trigger this — the prefill was the last place still saying "Resume".
        subject: 'Résumé request',
        message: "Hi Akash, I'd like to request a copy of your résumé."
      }));
      if (nameInputRef.current) {
        // preventScroll matters: the caller has already started a smooth
        // scroll to this section, and a focus-driven scroll would cancel it
        // and snap the page straight to the input instead.
        nameInputRef.current.focus({ preventScroll: true });
      }
    };
    window.addEventListener('requestResume', handleRequestResume);
    return () => window.removeEventListener('requestResume', handleRequestResume);
  }, []);

  // Any pending timer must not fire after unmount.
  useEffect(() => () => {
    clearTimeout(resetTimerRef.current);
    clearTimeout(copyTimerRef.current);
  }, []);

  const scheduleStatusReset = (ms) => {
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setStatus('idle'), ms);
  };

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as it is being corrected, rather than
    // leaving it red until the next submit.
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Send focus to the first problem so a keyboard or screen-reader user
      // is not left hunting for what went wrong.
      const firstInvalid = ['name', 'email', 'subject', 'message'].find(k => errors[k]);
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    if (!EMAILJS_CONFIGURED) {
      setStatus('error');
      setErrorMsg(`The form is not connected right now — please email ${OWNER_EMAIL} directly.`);
      scheduleStatusReset(8000);
      return;
    }

    setFieldErrors({});
    setStatus('sending');
    setErrorMsg('');

    try {
      // Send message to the owner
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name.trim(),
          from_email: form.email.trim(),
          subject:    form.subject.trim(),
          message:    form.message.trim(),
          to_email:   OWNER_EMAIL,
          reply_to:   form.email.trim(),
        },
        EMAILJS_PUBLIC_KEY
      );

      // Auto-reply is best-effort. It used to be awaited inside the same try,
      // so a failing courtesy email reported the whole submission as failed
      // even though the message had already reached the inbox — prompting the
      // sender to send it all over again.
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_AUTO_REPLY_TEMPLATE_ID,
          {
            to_name:    form.name.trim(),
            to_email:   form.email.trim(),
            user_email: form.email.trim(),
            reply_to:   OWNER_EMAIL,
          },
          EMAILJS_PUBLIC_KEY
        );
      } catch (autoReplyErr) {
        console.warn('EmailJS auto-reply failed (message itself was sent):', autoReplyErr);
      }

      setStatus('success');
      setForm(initialForm);
      scheduleStatusReset(6000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
      setErrorMsg(err?.text || 'Something went wrong. Please email me directly.');
      scheduleStatusReset(5000);
    }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
  };

  return (
    <div className="relative overflow-hidden">

      <GradientOrb size={600} color="rgba(124,58,237,0.15)" top="-120px" right="-150px" delay={0} />
      <GradientOrb size={500} color="rgba(6,182,212,0.12)" bottom="-50px" left="-100px" delay={2} />
      <GradientOrb size={400} color="rgba(37,99,235,0.1)" top="50%" left="40%" delay={4} mobileHidden />

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
            Let&apos;s talk about{' '}
            <span className="gradient-text">the universe</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="section-subtitle mx-auto">
            Whether you have a research opportunity, collaboration idea, or just want to geek out about dark matter — my inbox is always open.
          </motion.p>
        </motion.div>

        {/* Two-column layout: form + quick links */}
        <div className="grid lg:grid-cols-5 gap-8 mb-16">

          {/* Contact Form — 3/5 width */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -28 }}
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
                  Send a Message
                </h3>
              </div>

              {/*
                noValidate hands validation to `validate()` above. Without it
                the browser's own bubble fires first, in its own wording and
                its own language, and our inline messages never appear.
              */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
                  placeholder="Research collaboration, internship, general query…" required
                  error={fieldErrors.subject} />

                <TextareaField icon={MessageSquare} label="Message" id="message"
                  value={form.message} onChange={handleChange('message')}
                  placeholder="Tell me about your project, opportunity, or question…" required
                  error={fieldErrors.message} />

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
                      <CheckCircle size={18} style={{ color: '#22c55e' }} />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#22c55e' }}>Message sent!</p>
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
                      <AlertCircle size={18} style={{ color: '#ef4444' }} />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#ef4444' }}>Failed to send</p>
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
                      <><Send size={16} /> Send Message</>
                    )}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Right column: email CTA + quick info — 2/5 */}
          <motion.div
            className="lg:col-span-2 flex flex-col gap-5"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE_OUT_EXPO }}
          >
            {/*
              Direct email.

              The copy button used to sit inside an <a href="mailto:"> wrapping
              the whole card — a control nested in a link, which is invalid HTML
              and gives assistive tech two conflicting actions for one element.
              The link is now a stretched overlay covering the card, and the
              copy button sits above it on a higher layer, so each control is a
              sibling of the other and both have their own hit area.
            */}
            <motion.div
              className="glass-card p-6 relative"
              style={{ border: '1px solid rgba(124,58,237,0.15)' }}
              whileHover={{ scale: 1.01 }}
            >
              <a
                href="mailto:akashsankar80@gmail.com"
                className="absolute inset-0 rounded-2xl no-underline"
                aria-label="Email akashsankar80@gmail.com — opens your mail client"
              />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'var(--gradient)' }}>
                <Mail size={20} className="text-white" />
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Email me directly</p>
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-sm gradient-text" style={{ fontFamily: 'Space Grotesk, sans-serif', wordBreak: 'break-all' }}>
                  akashsankar80@gmail.com
                </p>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="tap-target relative z-10 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 flex-shrink-0"
                  style={{
                    background: copied ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface-hover)',
                    color: copied ? '#22c55e' : 'var(--text-secondary)',
                    border: copied ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid var(--border)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    height: '28px',
                    cursor: 'pointer',
                  }}
                  aria-label={copied ? 'Email address copied' : 'Copy email address'}
                  title="Copy email address"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 font-semibold whitespace-nowrap">
                      <Check size={13} className="text-green-500 flex-shrink-0" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy size={13} />
                    </span>
                  )}
                </button>
              </div>
              <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--nebula-3-text)' }}>
                Open mail client <ExternalLink size={11} />
              </p>
            </motion.div>

            {/*
              Resume. This was a clickable <div>: no keyboard focus, no role,
              invisible to anyone not using a mouse. A real button does the same
              job and comes with all of that for free.
            */}
            <motion.button
              type="button"
              className="glass-card p-6 cursor-pointer w-full text-left block"
              style={{ border: '1px solid rgba(37,99,235,0.15)' }}
              onClick={() => window.dispatchEvent(new CustomEvent('requestResume'))}
              aria-label="Request résumé — fills in the contact form above"
              whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(37,99,235,0.2)' }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}>
                <FileText size={20} className="text-white" />
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Want my full background?
              </p>
              <p className="font-bold text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                Request Résumé
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>via Email</p>
            </motion.button>

            {/* Response time note */}
            <div className="glass-card p-5" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Response time:</span> I typically reply within 24–48 hours. For urgent matters, email is fastest.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Social links */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        >
          <div className="text-center mb-8">
            <h3 className="section-eyebrow">Find me online</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {socials.map(({ icon: Icon, label, href, color, desc }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp}
                aria-label={`${label} — ${desc}, opens in a new tab`}
                className="glass-card gradient-border p-6 flex flex-col items-center gap-3 text-center no-underline"
                whileHover={{
                  y: -8,
                  boxShadow: `0 16px 48px ${color}30`,
                }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Icon size={22} style={{ color }} aria-hidden="true" />
                </motion.div>
                <div>
                  <p className="font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
