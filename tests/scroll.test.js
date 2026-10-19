import test from 'node:test';
import assert from 'node:assert/strict';
import { scrollToSection } from '../src/lib/scroll.js';

function setup(t, { reduced = false, hash = '', exists = true } = {}) {
  const calls = [];
  const element = { focus: options => calls.push(['focus', options]), getBoundingClientRect: () => ({ top: 400 }) };
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  globalThis.window = {
    scrollY: 100, matchMedia: () => ({ matches: reduced }), location: { hash },
    history: { pushState: (...args) => calls.push(['history', args[2]]) },
    scrollTo: options => calls.push(['scroll', options]),
  };
  globalThis.document = {
    getElementById: () => exists ? element : null,
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 90 }) }),
  };
  t.after(() => { globalThis.window = previousWindow; globalThis.document = previousDocument; });
  return calls;
}

test('navigation measures the fixed header, focuses the section, and records a shareable URL', t => {
  const calls = setup(t);
  assert.equal(scrollToSection('projects'), true);
  assert.deepEqual(calls, [['history', '#projects'], ['focus', { preventScroll: true }], ['scroll', { top: 410, behavior: 'smooth' }]]);
});

test('reduced motion uses an instant scroll, even with CSS smooth scrolling', t => {
  const calls = setup(t, { reduced: true });
  scrollToSection('home');
  assert.deepEqual(calls.at(-1), ['scroll', { top: 0, behavior: 'instant' }]);
});

test('history navigation and the skip link do not add history entries', t => {
  const calls = setup(t);
  scrollToSection('main-content', { history: false, behavior: 'instant' });
  assert.equal(calls.some(([kind]) => kind === 'history'), false);
  assert.deepEqual(calls.at(-1), ['scroll', { top: 0, behavior: 'instant' }]);
});

test('unknown sections do not change focus, history, or scroll position', t => {
  const calls = setup(t, { exists: false });
  assert.equal(scrollToSection('missing'), false);
  assert.deepEqual(calls, []);
});

test('repeat navigation does not create duplicate history entries', t => {
  const calls = setup(t, { hash: '#projects' });
  scrollToSection('projects');
  assert.equal(calls.some(([kind]) => kind === 'history'), false);
});

test('the visitor pause preference also disables smooth section scrolling', t => {
  const calls = setup(t);
  document.documentElement = { dataset: { motionPaused: 'true' } };
  scrollToSection('projects');
  assert.deepEqual(calls.at(-1), ['scroll', { top: 410, behavior: 'instant' }]);
});
