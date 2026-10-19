import test from 'node:test';
import assert from 'node:assert/strict';
import { assistantConfig } from '../src/lib/assistantConfig.js';

const env = {
  VITE_FIREBASE_API_KEY: 'test-public-client-identifier',
  VITE_FIREBASE_AUTH_DOMAIN: 'example.invalid',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_APP_ID: 'test-app',
  VITE_RECAPTCHA_ENTERPRISE_SITE_KEY: 'test-site-identifier',
};

test('AI configuration uses supplied client settings without forwarding private environment values', () => {
  const result = assistantConfig({ ...env, SERVER_PRIVATE_KEY: 'must-stay-on-server' });
  assert.equal(result.config.apiKey, env.VITE_FIREBASE_API_KEY);
  assert.equal(result.siteKey, env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY);
  assert.doesNotMatch(JSON.stringify(result), /must-stay-on-server/);
});

test('missing AI configuration fails before initializing a network client', () => {
  for (const key of Object.keys(env)) {
    for (const value of [undefined, '', '   ']) {
      assert.throws(() => assistantConfig({ ...env, [key]: value }), /chat\/missing-configuration/);
    }
  }
});
