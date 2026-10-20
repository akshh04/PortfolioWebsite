import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const sections = [['home', null], ['projects', 'Research'], ['about', 'About'], ['experience', 'Experience'], ['skills', 'Skills'], ['contact', 'Contact']];

async function go(page, name) {
  const menu = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('button', { name, exact: true }).click();
}

async function bounds(locator) {
  return locator.evaluate(el => ({ width: el.clientWidth, scrollWidth: el.scrollWidth }));
}

test.beforeEach(async ({ page }) => {
  await page.route('https://api.emailjs.com/**', route => route.fulfill({ status: 200, body: 'OK' }));
});

test('visual review of every section in both themes', async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await mkdir(`artifacts/mobile-review/${info.project.name}`, { recursive: true });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ['dark', 'light']) {
    await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
    for (const [id, name] of sections) {
      if (name) await go(page, name);
      else await page.getByRole('button', { name: 'Akash Sankar — home', exact: true }).click();
      const section = page.locator(`#${id}`);
      await expect(section).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const clippedText = await section.locator('h1,h2,h3,h4,p,dt,dd').evaluateAll(els => els.filter(el => {
        if (!el.getClientRects().length || el.closest('details:not([open])')) return false;
        return el.scrollWidth > el.clientWidth + 2;
      }).map(el => el.textContent.slice(0, 90)));
      expect(clippedText).toEqual([]);
      // Trigger each viewport entrance before capturing a section taller than the screen.
      const box = await section.boundingBox();
      const top = await section.evaluate(el => el.getBoundingClientRect().top + scrollY);
      for (let offset = 0; offset < box.height; offset += page.viewportSize().height / 2) {
        await page.evaluate(y => scrollTo(0, y), top + offset);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(300);
      await section.screenshot({ path: `artifacts/mobile-review/${info.project.name}/${theme}-${id}.jpg`, animations: 'disabled',
        style: 'nav[aria-label="Primary"], .skip-link { visibility: hidden !important; }' });
      const brokenImages = await section.locator('img').evaluateAll(imgs => imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.getAttribute('src')));
      expect(brokenImages).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test('all case studies, image zoom, history, and close behavior', async ({ page }, info) => {
  await page.goto('/#projects');
  const opener = page.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true });
  await opener.click();
  for (let index = 0; index < 4; index++) {
    const dialog = page.getByRole('dialog');
    const size = await bounds(dialog);
    expect(size.scrollWidth).toBeLessThanOrEqual(size.width);
    await expect(dialog.getByRole('navigation', { name: 'Browse case studies' })).toContainText(`${index + 1} / 4`);
    if (index < 3) await dialog.getByRole('button', { name: /Next project:/ }).click();
  }
  await page.getByRole('button', { name: 'Close project details' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await page.getByRole('button', { name: /Preview of the Exoplanet Explorer dashboard/ }).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName(/screenshot/);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.locator('.screenshot-full')).toHaveClass(/zoomed/);
  await page.getByRole('button', { name: 'Fit image', exact: true }).click();
  await expect(page.locator('.screenshot-full')).not.toHaveClass(/zoomed/);
  await mkdir(`artifacts/mobile-review/${info.project.name}`, { recursive: true });
  await page.screenshot({ path: `artifacts/mobile-review/${info.project.name}/image-viewer.jpg` });
  await page.getByRole('button', { name: 'Back to case study', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Exoplanet Explorer', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close project details' }).click();
  await expect(page).toHaveURL(/#projects$/);
});

test('experience dialogs and all education and training disclosures', async ({ page }) => {
  await page.goto('/#experience');
  const openers = page.locator('#experience .project-open');
  await expect(openers).toHaveCount(3);
  for (const button of await openers.all()) {
    await button.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Responsibilities & contributions', exact: true })).toBeVisible();
    const size = await bounds(dialog);
    expect(size.scrollWidth).toBeLessThanOrEqual(size.width);
    await page.getByRole('button', { name: 'Close project details' }).click();
    await expect(button).toBeFocused();
  }
  await go(page, 'About');
  await page.getByText('More about my background', { exact: true }).click();
  await expect(page.locator('.bio-details')).toHaveAttribute('open', '');
  await page.locator('#about summary').filter({ hasText: 'Earlier education' }).click();
  await expect(page.locator('.earlier-education li')).toHaveCount(2);
  await go(page, 'Skills');
  await page.locator('#certificates > summary').click();
  await expect(page.locator('#certificates')).toHaveAttribute('open', '');
  await page.locator('.training-details > summary').click();
  await expect(page.locator('.training-details')).toHaveAttribute('open', '');
  await expect(page.locator('.training-list li')).toHaveCount(4);
  const size = await bounds(page.locator('#skills'));
  expect(size.scrollWidth).toBeLessThanOrEqual(size.width);
  await page.goto('/#certificates');
  await expect(page.locator('#certificates')).toHaveAttribute('open', '');
});

test('contact shortcuts, keyboard-sized viewport, duplicate-submit guard and storage denial', async ({ page }) => {
  let releases;
  const gate = new Promise(resolve => { releases = resolve; });
  let sends = 0;
  await page.route('https://api.emailjs.com/**', async route => { sends++; await gate; await route.fulfill({ status: 200, body: 'OK' }); });
  await page.goto('/#contact');
  // Initial fragment navigation restores section focus asynchronously.
  // Finish it before typing so that navigation cannot steal input focus.
  await expect(page.locator('#contact')).toBeFocused();
  await page.getByLabel('Your Name', { exact: true }).pressSequentially('Browser visitor');
  await expect(page.getByLabel('Your Name', { exact: true })).toHaveValue('Browser visitor');
  await page.getByLabel('Email Address', { exact: true }).fill('visitor@example.com');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('An existing draft to preserve.');
  await page.getByRole('button', { name: 'Radio instrumentation →', exact: true }).click();
  await expect(page.getByLabel('Your Name', { exact: true })).toHaveValue('Browser visitor');
  await expect(page.getByLabel('Subject (optional)', { exact: true })).toHaveValue('Radio instrumentation collaboration');
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('An existing draft to preserve.');
  const original = page.viewportSize();
  await page.setViewportSize({ width: original.width, height: Math.min(original.height, 420) });
  await page.getByRole('textbox', { name: 'Message', exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sending…', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Your Name', { exact: true })).toBeDisabled();
  await expect.poll(() => sends).toBe(1);
  releases();
  await expect(page.getByText('Message sent!', { exact: true })).toBeVisible();
  await page.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { configurable: true, get() { throw new Error('Denied'); } }));
  await page.reload();
  await expect(page.locator('#contact')).toBeFocused();
  await page.getByLabel('Your Name', { exact: true }).pressSequentially('Still usable');
  await expect(page.getByLabel('Your Name', { exact: true })).toHaveValue('Still usable');
});

test('system theme follows the device and explicit choices persist', async ({ page }) => {
  await page.goto('/#contact');
  const theme = page.getByRole('combobox', { name: 'Color theme' });
  await theme.selectOption('system');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveClass(/light/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await theme.selectOption('light');
  await page.reload();
  await expect(theme).toHaveValue('light');
  await expect(page.locator('html')).toHaveClass(/light/);
});

test('touch menus and dialog controls stay reachable in short viewports', async ({ page }, info) => {
  await mkdir(`artifacts/mobile-review/${info.project.name}`, { recursive: true });
  await page.goto('/#projects');
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await toggle.isVisible()) {
    for (const theme of ['dark', 'light']) {
      await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
      await toggle.tap();
      const panel = page.locator('.mobile-menu-surface');
      await expect.poll(() => panel.getByRole('button').evaluateAll(buttons => buttons.every(el => {
        let opacity = 1;
        for (let parent = el; parent; parent = parent.parentElement) opacity *= Number(getComputedStyle(parent).opacity);
        return opacity > .99;
      }))).toBe(true);
      const box = await panel.boundingBox();
      expect(box.y).toBeGreaterThan(0);
      expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
      await page.screenshot({ path: `artifacts/mobile-review/${info.project.name}/${theme}-menu.jpg` });
      const cv = panel.getByRole('button', { name: 'Request original CV', exact: true });
      await cv.tap();
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.getByLabel('Your Name', { exact: true })).toBeFocused();
      await expect(page.locator('main')).not.toHaveAttribute('inert');
    }
  }
  await go(page, 'Research');
  await page.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true }).tap();
  const dialog = page.getByRole('dialog');
  await page.screenshot({ path: `artifacts/mobile-review/${info.project.name}/case-study.jpg` });
  for (const button of [dialog.getByRole('button', { name: 'Close project details', exact: true }), dialog.getByRole('button', { name: /Next project:/ })]) {
    const box = await button.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
    expect(await button.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    })).toBe(true);
  }
});

test.describe('normal motion', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('entrances and touch navigation reveal content without overflow', async ({ page }, info) => {
    await page.goto('/');
    for (const [id, name] of sections) {
      if (name) await go(page, name);
      const heading = page.locator(`#${id}`).getByRole('heading').first();
      await expect(heading).toBeVisible();
      await expect.poll(() => heading.evaluate(el => {
        let opacity = 1;
        for (let parent = el; parent; parent = parent.parentElement) opacity *= Number(getComputedStyle(parent).opacity);
        return opacity;
      })).toBeGreaterThan(.99);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await mkdir(`artifacts/mobile-review/${info.project.name}`, { recursive: true });
    await page.screenshot({ path: `artifacts/mobile-review/${info.project.name}/normal-motion-contact.jpg` });
  });
});



