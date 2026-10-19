import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeThemePreference, resolveTheme } from '../src/lib/themePreference.js';

test('System follows changing device appearance while explicit themes stay fixed', () => {
  assert.equal(resolveTheme('system', true), 'light');
  assert.equal(resolveTheme('system', false), 'dark');
  assert.equal(resolveTheme('light', false), 'light');
  assert.equal(resolveTheme('dark', true), 'dark');
});

test('new visitors default to Dark while saved theme choices are retained', () => {
  for (const value of [null, undefined, '', 'invalid']) assert.equal(normalizeThemePreference(value), 'dark');
  assert.equal(normalizeThemePreference('system'), 'system');
  assert.equal(normalizeThemePreference('light'), 'light');
  assert.equal(normalizeThemePreference('dark'), 'dark');
});
