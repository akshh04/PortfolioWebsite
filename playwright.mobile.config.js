import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

const touch = { isMobile: true, hasTouch: true };
export default defineConfig({
  ...base,
  timeout: 45_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/mobile' }]],
  projects: [
    { name: 'phone-320', use: { ...touch, viewport: { width: 320, height: 568 } } },
    { name: 'phone-390', use: { ...touch, viewport: { width: 390, height: 844 } } },
    { name: 'phone-430', use: { ...touch, viewport: { width: 430, height: 932 } } },
    { name: 'tablet-768', use: { ...touch, viewport: { width: 768, height: 1024 } } },
    { name: 'tablet-820', use: { ...touch, viewport: { width: 820, height: 1180 } } },
    { name: 'phone-landscape', use: { ...touch, viewport: { width: 844, height: 390 } } },
    { name: 'tablet-landscape', use: { ...touch, viewport: { width: 1180, height: 820 } } },
    { name: 'webkit-phone', testMatch: /mobile-review\.spec\.js/, use: { browserName: 'webkit', ...touch, viewport: { width: 390, height: 844 } } },
    { name: 'webkit-tablet', testMatch: /mobile-review\.spec\.js/, use: { browserName: 'webkit', ...touch, viewport: { width: 820, height: 1180 } } },
  ],
});
