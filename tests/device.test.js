import test from 'node:test';
import assert from 'node:assert/strict';

async function probe(t, getContext) {
  const previous = globalThis.document;
  globalThis.document = { createElement: () => ({ getContext }) };
  t.after(() => { globalThis.document = previous; });
  // Each module instance starts with an uncached capability result.
  return import(`../src/lib/device.js?case=${encodeURIComponent(t.name)}`);
}

test('WebGL 1 alone uses the CSS fallback instead of loading an incompatible renderer', async t => {
  const calls = [];
  const { supportsWebGL } = await probe(t, kind => {
    calls.push(kind);
    return kind === 'webgl2' ? null : {};
  });
  assert.equal(supportsWebGL(), false);
  assert.deepEqual(calls, ['webgl2']);
});

test('WebGL 2 support releases the probe context and caches the result', async t => {
  let probes = 0;
  let releases = 0;
  const { supportsWebGL } = await probe(t, () => {
    probes++;
    return { getExtension: () => ({ loseContext: () => { releases++; } }) };
  });
  assert.equal(supportsWebGL(), true);
  assert.equal(supportsWebGL(), true);
  assert.equal(probes, 1);
  assert.equal(releases, 1);
});

test('blocked graphics contexts safely use the CSS fallback', async t => {
  const { supportsWebGL } = await probe(t, () => { throw new Error('Blocked'); });
  assert.equal(supportsWebGL(), false);
});
