import test from 'node:test';
import assert from 'node:assert/strict';
import { initialForm, readContactDraft, saveContactDraft, DRAFT_KEY } from '../src/lib/contact.js';
import { openProject, closeProject, switchProject, projectUrl } from '../src/lib/projectNavigation.js';

test('shared project links use the deployed origin and the selected project', () => {
  for (const origin of ['http://localhost:5180', 'https://akashsankar.in']) {
    assert.equal(projectUrl('exoplanet-explorer', `${origin}/#projects`), `${origin}/#project/exoplanet-explorer`);
    assert.equal(projectUrl('dark-matter-rotation-curves', `${origin}/#project/exoplanet-explorer`), `${origin}/#project/dark-matter-rotation-curves`);
  }
});

function storage(t, initial) {
  const previous = globalThis.sessionStorage;
  const entries = new Map(initial ? [[DRAFT_KEY, initial]] : []);
  globalThis.sessionStorage = { getItem: key => entries.get(key), setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  t.after(() => { globalThis.sessionStorage = previous; });
  return entries;
}
test('contact drafts survive reload and clearing removes stored personal information', t => {
  const entries = storage(t);
  const draft = { name: 'Test visitor', email: 'visitor@example.com', subject: 'Research', message: 'A saved collaboration draft.' };
  assert.equal(saveContactDraft(draft), true);
  assert.deepEqual(readContactDraft(), draft);
  assert.equal(saveContactDraft(initialForm), false);
  assert.equal(entries.has(DRAFT_KEY), false);
});
test('corrupt and unexpected draft data cannot break the form', t => {
  const entries = storage(t, '{invalid');
  assert.deepEqual(readContactDraft(), initialForm);
  entries.set(DRAFT_KEY, JSON.stringify({ name: 42, email: 'a'.repeat(300), message: ['unexpected'] }));
  const restored = readContactDraft();
  assert.equal(restored.name, '');
  assert.equal(restored.email.length, 254);
  assert.equal(restored.message, '');
});
test('blocked session storage leaves contact usable', t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, get() { throw new Error('Blocked'); } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'sessionStorage', previous); else delete globalThis.sessionStorage; });
  assert.deepEqual(readContactDraft(), initialForm);
  assert.equal(saveContactDraft({ ...initialForm, name: 'Test' }), false);
});
function history(t, hash) {
  const previous = globalThis.window;
  const calls = [];
  globalThis.window = { location: { hash }, dispatchEvent: event => calls.push(event.type), history: {
    state: null,
    pushState(state, _, next) { this.state = state; window.location.hash = next; calls.push('push'); },
    replaceState(state, _, next) { this.state = state; window.location.hash = next; calls.push('replace'); },
    back() { calls.push('back'); },
  } };
  t.after(() => { globalThis.window = previous; });
  return calls;
}
test('opening a project adds one shareable history entry and closing goes Back', t => {
  const calls = history(t, '#projects');
  openProject('exoplanet-explorer');
  openProject('exoplanet-explorer');
  assert.equal(window.location.hash, '#project/exoplanet-explorer');
  closeProject('exoplanet-explorer');
  assert.deepEqual(calls, ['push', 'hashchange', 'back']);
});
test('closing a directly loaded project stays in the portfolio', t => {
  const calls = history(t, '#project/exoplanet-explorer');
  closeProject('exoplanet-explorer');
  assert.equal(window.location.hash, '#projects');
  assert.deepEqual(calls, ['replace', 'hashchange']);
});

test('Next and Previous keep one dialog history entry and Close returns to its opener', t => {
  const calls = history(t, '#projects');
  openProject('exoplanet-explorer');
  switchProject('dark-matter-rotation-curves');
  switchProject('exoplanets-search-for-life');
  assert.equal(window.history.state.returnHash, '#projects');
  closeProject('exoplanets-search-for-life');
  assert.deepEqual(calls, ['push', 'hashchange', 'replace', 'hashchange', 'replace', 'hashchange', 'back']);
});

test('browsing from a direct project link never makes Close navigate outside the portfolio', t => {
  const calls = history(t, '#project/exoplanet-explorer');
  switchProject('dark-matter-rotation-curves');
  closeProject('dark-matter-rotation-curves');
  assert.equal(window.location.hash, '#projects');
  assert.deepEqual(calls, ['replace', 'hashchange', 'replace', 'hashchange']);
});
