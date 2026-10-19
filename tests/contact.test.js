import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, contactPayload, emailDraft, initialForm, OWNER_EMAIL, projectDiscussionDraft, originalCvRequestDraft } from '../src/lib/contact.js';
import { ORIGINAL_CV_EMAIL } from '../src/lib/cv.js';

const valid = { name: ' Jane ', email: ' jane@example.com ', subject: ' Research & data ', message: ' A question about your research. ' };

test('requesting the original CV never overwrites an existing visitor message', () => {
  const original = { ...valid };
  const requested = originalCvRequestDraft(valid);
  assert.deepEqual(requested, { ...valid, subject: 'Original CV request' });
  assert.deepEqual(valid, original);
  assert.match(originalCvRequestDraft(initialForm).message, /original CV/);
  assert.match(originalCvRequestDraft({ ...initialForm, message: '  ' }).message, /original CV/);
});

test('the original CV email action targets the owner with an explicit original request', () => {
  const link = new URL(ORIGINAL_CV_EMAIL);
  assert.equal(link.protocol, 'mailto:');
  assert.equal(link.pathname, OWNER_EMAIL);
  assert.equal(link.searchParams.get('subject'), 'Original CV request');
  assert.match(link.searchParams.get('body'), /original CV/);
});

test('blank and whitespace-only drafts identify every invalid field', () => {
  assert.deepEqual(Object.keys(validateContact(initialForm)), ['name', 'email', 'message']);
  assert.deepEqual(Object.keys(validateContact({ name: ' ', email: ' ', subject: ' ', message: '         ' })), ['name', 'email', 'message']);
});

test('an optional blank subject is accepted and receives the same fallback in both delivery paths', () => {
  const form = { ...valid, subject: '  ' };
  assert.deepEqual(validateContact(form), {});
  assert.equal(contactPayload(form).subject, 'Portfolio enquiry');
  assert.equal(new URL(emailDraft(form)).searchParams.get('subject'), 'Portfolio enquiry');
});

test('discussing a project preserves a visitor message and contact details', () => {
  const draft = projectDiscussionDraft(valid, 'Dark Matter & Galaxy Rotation Curves');
  assert.equal(draft.name, valid.name);
  assert.equal(draft.email, valid.email);
  assert.equal(draft.message, valid.message);
  assert.equal(draft.subject, 'Discuss: Dark Matter & Galaxy Rotation Curves');
  const fresh = projectDiscussionDraft(initialForm, 'Exoplanet Explorer');
  assert.match(fresh.message, /Exoplanet Explorer/);
  assert.equal(projectDiscussionDraft(initialForm, 'x'.repeat(300)).subject.length, 200);
});

test('email typos and short messages fail; trimmed valid drafts pass', () => {
  assert.deepEqual(validateContact(valid), {});
  for (const email of ['jane@', 'jane example.com', 'jane@@example.com']) {
    assert.ok(validateContact({ ...valid, email }).email);
  }
  assert.ok(validateContact({ ...valid, message: ' short ' }).message);
});

test('delivery trims inputs, preserves the draft, and fixes the destination', () => {
  const original = { ...valid };
  const payload = contactPayload(valid);
  assert.equal(payload.to_email, OWNER_EMAIL);
  assert.equal(payload.reply_to, 'jane@example.com');
  assert.equal(payload.subject, 'Research & data');
  assert.deepEqual(valid, original);
});

test('email draft safely encodes punctuation, Unicode, and newlines', () => {
  const form = { ...valid, subject: 'Résumé & data? #1', message: 'Line one\nLine two & more' };
  const url = new URL(emailDraft(form));
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, OWNER_EMAIL);
  assert.equal(url.searchParams.get('subject'), form.subject);
  assert.equal(url.searchParams.get('body'), 'Line one\nLine two & more\n\nFrom: Jane\nReply to: jane@example.com');
  assert.equal(url.hash, '');
});
