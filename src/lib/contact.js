export const OWNER_EMAIL = 'akashsankarv@gmail.com';
export const initialForm = { name: '', email: '', subject: '', message: '' };
export const DRAFT_KEY = 'portfolio-contact-draft';
const fieldLimits = { name: 200, email: 254, subject: 200, message: 5000 };
export function readContactDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY));
    return Object.fromEntries(Object.entries(fieldLimits).map(([field, limit]) => [field, typeof saved?.[field] === 'string' ? saved[field].slice(0, limit) : '']));
  } catch { return { ...initialForm }; }
}
export function saveContactDraft(form) {
  try {
    if (Object.values(form).some(Boolean)) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      return true;
    }
    sessionStorage.removeItem(DRAFT_KEY);
  } catch { /* Storage restrictions must never prevent contacting the owner. */ }
  return false;
}

export function validateContact(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please tell me your name.';
  if (!form.email.trim()) errors.email = 'An email address is needed for a reply.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errors.email = 'That address does not look right.';
  if (form.message.trim().length < 10) errors.message = 'A little more detail, please — at least 10 characters.';
  return errors;
}

export function contactPayload(form) {
  return {
    from_name: form.name.trim(), from_email: form.email.trim(),
    subject: form.subject.trim() || 'Portfolio enquiry', message: form.message.trim(),
    to_email: OWNER_EMAIL, reply_to: form.email.trim(),
  };
}

export function emailDraft(form) {
  const body = `${form.message.trim()}\n\nFrom: ${form.name.trim()}\nReply to: ${form.email.trim()}`;
  return `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(form.subject.trim() || 'Portfolio enquiry')}&body=${encodeURIComponent(body)}`;
}

export function projectDiscussionDraft(form, title) {
  return {
    ...form,
    subject: `Discuss: ${title}`.slice(0, fieldLimits.subject),
    message: form.message.trim() ? form.message : `Hi Akash, I'd like to discuss your project, ${title}.`,
  };
}

export function originalCvRequestDraft(form) {
  return {
    ...form,
    subject: 'Original CV request',
    message: form.message.trim() ? form.message : "Hi Akash, I'd like to request your original CV.",
  };
}
