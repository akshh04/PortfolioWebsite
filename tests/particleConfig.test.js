import test from 'node:test';
import assert from 'node:assert/strict';
import { buildParticleConfig } from '../src/lib/particleConfig.js';

test('light particles remain visible without dimming away or double-reducing the count', () => {
  for (const isMobile of [false, true]) {
    const light = buildParticleConfig('calm', 'light', { isMobile }).particles;
    const dark = buildParticleConfig('calm', 'dark', { isMobile }).particles;
    assert.equal(light.number.value, dark.number.value);
    assert.ok(light.opacity.value.min >= 0.3);
    assert.ok(light.size.value.min >= 0.9);
    assert.equal(light.opacity.animation.enable, false);
    assert.equal(light.links.enable, !isMobile);
  }
});

test('dark particle appearance and playback settings retain their existing values', () => {
  const config = buildParticleConfig('calm', 'dark', { isMobile: false });
  assert.equal(config.particles.number.value, 35);
  assert.deepEqual(config.particles.color.value, ['#ffffff', '#c4b5fd', '#93c5fd']);
  assert.deepEqual(config.particles.size.value, { min: 0.3, max: 2 });
  assert.deepEqual(config.particles.opacity.value, { min: 0.05, max: 0.4 });
  assert.equal(config.particles.opacity.animation.enable, true);
  assert.equal(config.particles.links.opacity, 0.15);
  assert.equal(config.autoPlay, false);
  assert.equal(config.pauseOnBlur, false);
  assert.equal(config.pauseOnOutsideViewport, false);
});
