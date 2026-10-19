import test from 'node:test';
import assert from 'node:assert/strict';
import { animationDelta } from '../src/lib/animationTime.js';

test('pausing keeps rotation and floating phase fixed even for a queued render', () => {
  const phase = 12.5;
  assert.equal(phase + animationDelta(1 / 60, false), phase);
  assert.equal(phase + animationDelta(30, false), phase);
});

test('resuming after a long pause advances one small frame instead of jumping ahead', () => {
  assert.equal(animationDelta(30, true), 1 / 30);
  assert.equal(animationDelta(1 / 60, true), 1 / 60);
});

test('normal frame rates advance by the same amount of rendered time', () => {
  const elapsed = fps => Array.from({ length: fps }).reduce(time => time + animationDelta(1 / fps), 0);
  assert.ok(Math.abs(elapsed(60) - elapsed(120)) < 1e-12);
});

test('invalid frame deltas cannot corrupt scene transforms', () => {
  for (const delta of [-1, NaN, Infinity, -Infinity]) assert.equal(animationDelta(delta), 0);
});
