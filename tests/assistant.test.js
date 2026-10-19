import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanQuestion, conversationContents, parseAssistantReply, assistantError, assistantSources, createRequestLimiter, withTimeout } from '../src/lib/assistantPolicy.js';
import { assistantViewportMetrics } from '../src/lib/assistantViewport.js';
import { assistantStarters } from '../src/lib/assistantStarters.js';
import { OWNER_EMAIL } from '../src/lib/contact.js';
import { assistantFacts, assistantInstruction } from '../src/lib/assistantKnowledge.js';
import { memberships } from '../src/data/education.js';
import { conferences, experience } from '../src/data/experience.js';

test('chat limits questions and sends only a short conversation, never unrelated state', () => {
  assert.equal(cleanQuestion('  His research? '), 'His research?');
  assert.throws(() => cleanQuestion(' '));
  assert.throws(() => cleanQuestion('x'.repeat(601)));
  const history = Array.from({ length: 10 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', text: `Message ${index}`, email: 'do-not-send@example.com' }));
  const contents = conversationContents(history, 'Skills?');
  assert.equal(contents.length, 7);
  assert.equal(contents[0].role, 'user');
  assert.deepEqual(contents.at(-1), { role: 'user', parts: [{ text: 'Skills?' }] });
  assert.doesNotMatch(JSON.stringify(contents), /do-not-send/);
});

test('AI-provided links are ignored; only known portfolio source IDs become links', () => {
  const reply = parseAssistantReply(JSON.stringify({ answer: 'His interests include radio astronomy.', sources: ['about', 'javascript:alert(1)', 'https://untrusted.example', 'about', 'skills'] }));
  assert.deepEqual(reply.sources.map(source => source.href), ['#about', '#skills']);
  assert.throws(() => parseAssistantReply('{bad json'));
  assert.throws(() => parseAssistantReply('{"answer":""}'));
});

test('local verification, quota, and network failures provide actionable fallback messages', () => {
  assert.match(assistantError({ code: 'appCheck/fetch-status-error', message: '403' }, true), /debug token/);
  assert.match(assistantError({ message: '429 RESOURCE_EXHAUSTED' }), /request limit/);
  assert.match(assistantError({ message: 'Failed to fetch' }), /connection/);
  assert.doesNotMatch(assistantError({ message: 'secret provider output' }), /secret provider output/);
});

test('a rapid burst is stopped and the request allowance recovers after a minute', () => {
  let time = 100;
  const request = createRequestLimiter(() => time);
  for (let index = 0; index < 5; index++) request();
  assert.throws(request, /rate-limit/);
  time += 60000;
  assert.doesNotThrow(request);
});

test('blocked browser verification cannot leave the chat waiting forever', async () => {
  assert.equal(await withTimeout(Promise.resolve('verified'), 50), 'verified');
  await assert.rejects(withTimeout(new Promise(() => {}), 5), /chat\/timeout/);
});

test('starter questions provide public contact information and valid portfolio sources without AI', () => {
  const contact = assistantStarters.find(item => item.id === 'contact');
  assert.ok(contact.answer.text.includes(OWNER_EMAIL));
  assert.equal(contact.answer.sources[0].href, '#contact');
  assert.equal(new Set(assistantStarters.map(item => item.id)).size, 6);
  for (const item of assistantStarters) {
    assert.ok(item.answer.text.trim());
    assert.ok(item.answer.sources.length > 0);
    assert.ok(item.answer.sources.every(source => source.href.startsWith('#')));
  }
});

test('AI context includes every public club, conference role, and internship contribution', () => {
  assert.deepEqual(assistantFacts.memberships.map(item => item.name), memberships.map(item => item.name));
  assert.deepEqual(assistantFacts.conferences.map(item => [item.name, item.role]), conferences.map(item => [item.name, item.role]));
  assert.deepEqual(assistantFacts.experience.map(item => item.contributions), experience.map(item => item.highlights));
  for (const fact of [...assistantFacts.memberships, ...assistantFacts.conferences]) {
    assert.ok(assistantSources.some(source => source.id === fact.sourceId));
    assert.ok(assistantInstruction.includes(fact.name));
  }
});

test('AI context keeps native languages distinct from English B2', () => {
  assert.deepEqual(assistantFacts.languages, [
    { language: 'Tamil', proficiency: 'Mother tongue' },
    { language: 'Telugu', proficiency: 'Mother tongue' },
    { language: 'English', proficiency: 'B2 — independent user' },
  ]);
  assert.match(assistantInstruction, /B2 applies only to English/);
});

test('overlay geometry follows the visible viewport as phone chrome and keyboard change', () => {
  const screen = { width: 390, height: 844 };
  assert.deepEqual(assistantViewportMetrics({ width: 390, height: 700, offsetTop: 0, offsetLeft: 0 }, screen), { width: 390, height: 700, top: 0, left: 0, keyboard: false });
  const keyboard = assistantViewportMetrics({ width: 390, height: 380, offsetTop: 40, offsetLeft: 0 }, screen, true);
  assert.equal(keyboard.keyboard, true);
  assert.equal(keyboard.top + keyboard.height, 420);
  // Safari can briefly report an old offset after keyboard dismissal.
  assert.equal(assistantViewportMetrics({ width: 390, height: 844, offsetTop: 50 }, screen).top, 0);
  assert.deepEqual(assistantViewportMetrics(null, screen), { ...screen, top: 0, left: 0, keyboard: false });
});

test('expanded and collapsed browser toolbars do not receive a second arbitrary clearance', () => {
  const layout = { width: 390, height: 780 };
  for (const height of [620, 700, 780]) {
    const overlay = assistantViewportMetrics({ width: 390, height }, layout);
    assert.equal(overlay.height, height);
    assert.equal(overlay.top, 0);
  }
});

test('keyboard pan is preserved even when innerHeight shrinks with the keyboard', () => {
  const typing = assistantViewportMetrics({ width: 390, height: 340, offsetTop: 45 }, { width: 390, height: 340 }, true, 700);
  assert.equal(typing.keyboard, true);
  assert.equal(typing.top, 45);
  assert.equal(typing.height, 340);
});

test('dismissed keyboards cannot leave a stale WebKit offset while input retains focus', () => {
  for (const focused of [true, false]) {
    const restored = assistantViewportMetrics({ width: 390, height: 700, offsetTop: 150 }, { width: 390, height: 780 }, focused, 780);
    assert.equal(restored.keyboard, false);
    assert.equal(restored.top, 0);
    assert.equal(restored.height, 700);
  }
});

test('pinch zoom retains the visible offset without being mistaken for a keyboard', () => {
  const zoomed = assistantViewportMetrics({ width: 195, height: 350, offsetTop: 130, offsetLeft: 60, scale: 2 }, { width: 390, height: 700 }, true, 700);
  assert.deepEqual(zoomed, { width: 195, height: 350, top: 130, left: 60, keyboard: false });
});
