import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function navigate(page, name) {
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await toggle.isVisible()) await toggle.click();
  await page.getByRole('navigation', { name: 'Primary', exact: true }).getByRole('button', { name, exact: true }).click();
}

async function atBottom(page) {
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight))).toBeLessThan(2);
}

test.beforeEach(async ({ page }) => {
  // Test submissions can never reach an inbox, including delayed courtesy replies.
  await page.route('https://api.emailjs.com/**', route => route.fulfill({ status: 200, body: 'OK' }));
});

test('navigation, anchors, headings and responsive bounds', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  for (const [name, id] of [['Research', 'projects'], ['About', 'about'], ['Experience', 'experience'], ['Skills', 'skills'], ['Contact', 'contact']]) {
    await navigate(page, name);
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.locator('a[href^="#"]').evaluateAll(links => links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash))).toEqual([]);
  expect(errors).toEqual([]);
});

test('social destinations are readable and open through unobstructed links', async ({ page, context }) => {
  await context.route(/^https:\/\/(github\.com|www\.linkedin\.com|www\.instagram\.com)\//, route => route.fulfill({ contentType: 'text/html', body: '<title>External destination</title><h1>External destination</h1>' }));
  await page.goto('/#contact');
  const profiles = page.getByRole('navigation', { name: 'Contact social profiles', exact: true });
  await expect(profiles).toContainText('@akshh04');
  await expect(profiles).toContainText('in/akashsankar04');
  await expect(profiles).toContainText('Private personal profile');
  expect(await profiles.evaluate(el => el.compareDocumentPosition(document.querySelector('#contact form')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  const links = page.locator('.social-profile');
  await expect(links).toHaveCount(6);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link.locator('.social-external')).toBeVisible();
    const href = await link.getAttribute('href');
    const popupPromise = context.waitForEvent('page');
    await link.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(href);
    await popup.close();
  }
  await expect(page).toHaveURL(/#contact$/);
});

test('footer controls stay reachable at the document bottom in both themes', async ({ page }) => {
  await page.goto('/#contact');
  for (const theme of ['dark', 'light']) {
    await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
    await atBottom(page);
    const checks = await page.locator('footer .social-profile').evaluateAll(links => links.map(el => {
      const rect = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    }));
    expect(checks).toEqual([true, true, true]);
  }
});

test('CV choices preserve a draft and clearly distinguish the original', async ({ page, request }) => {
  await page.goto('/#contact');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Please keep this collaboration draft.');
  await navigate(page, 'About');
  await page.locator('#about').getByRole('link', { name: 'Request original CV', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByLabel('Subject (optional)', { exact: true })).toHaveValue('Original CV request');
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Please keep this collaboration draft.');
  await expect(page.getByLabel('Your Name', { exact: true })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Please keep this collaboration draft.');
  await expect(page.locator('.cv-notice')).toHaveCount(1);
  const cv = await request.get('/akash-sankar-academic-cv.pdf');
  expect(cv.headers()['content-type']).toContain('application/pdf');
  expect((await cv.body()).subarray(0, 4).toString()).toBe('%PDF');
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeEmpty();
});

test('contact validates, confirms delivery, and clears only a successful draft', async ({ page }) => {
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(3);
  await expect(page.getByLabel('Your Name', { exact: true })).toBeFocused();
  await page.getByLabel('Your Name', { exact: true }).fill('Browser Test');
  await page.getByLabel('Email Address', { exact: true }).fill('visitor@example.com');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('A mocked test of the contact workflow.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByText('Message sent!', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toBeEmpty();
});

test('contact failure preserves the message and allows retry', async ({ page }) => {
  await page.route('https://api.emailjs.com/**', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/#contact');
  await page.getByLabel('Your Name', { exact: true }).fill('Browser Test');
  await page.getByLabel('Email Address', { exact: true }).fill('visitor@example.com');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Please preserve this draft if delivery fails.');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByText('Failed to send', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue('Please preserve this draft if delivery fails.');
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled();
});

test('clipboard rejection provides an honest fallback', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Denied')) } }));
  await page.goto('/#contact');
  await page.getByRole('button', { name: 'Copy email address', exact: true }).click();
  await expect(page.getByText('Copy unavailable. Select the address above to copy it.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Email address copied', exact: true })).toHaveCount(0);
});

test('case studies, source links, media and discussion work together', async ({ page, request, context }) => {
  await context.route('https://github.com/akshh04/ExoplanetExplorer', route => route.fulfill({ body: 'Project source' }));
  await page.goto('/#projects');
  const card = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: 'Exoplanet Explorer', exact: true }) });
  const source = card.getByRole('link', { name: /View source code/ });
  const popupPromise = context.waitForEvent('page');
  await source.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://github.com/akshh04/ExoplanetExplorer');
  await popup.close();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await card.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Exoplanet Explorer', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/may need a moment to wake up/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Play recorded demo', exact: true }).click();
  const video = dialog.locator('video');
  await expect(video).toHaveAttribute('controls', '');
  const videoResponse = await request.get(await video.locator('source').getAttribute('src'));
  expect(videoResponse.status()).toBe(200);
  expect(videoResponse.headers()['content-type']).toContain('video/webm');
  await video.evaluate(el => el.play());
  await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(0);
  expect(await video.evaluate(el => el.videoWidth)).toBeGreaterThan(0);
  expect(await video.evaluate(el => el.duration)).toBeGreaterThan(25);
  await video.evaluate(el => el.pause());
  const captions = await request.get(await video.locator('track').getAttribute('src'));
  expect(await captions.text()).toMatch(/^WEBVTT/);
  const background = dialog.getByText('Read the technical background', { exact: true });
  await background.focus();
  await page.keyboard.press('Tab');
  await expect(video).toBeFocused();
  await dialog.getByRole('button', { name: /Next project:/ }).click();
  await expect(page.getByRole('dialog', { name: 'Dark Matter & Galaxy Rotation Curves', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await card.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true }).click();
  await page.getByRole('button', { name: 'Discuss this project', exact: true }).click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.getByLabel('Subject (optional)', { exact: true })).toHaveValue('Discuss: Exoplanet Explorer');
});

test('updated contact and project views render without overflow', async ({ page }, testInfo) => {
  await page.goto('/#contact');
  await page.getByRole('heading', { name: "Let's discuss research or collaboration", exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/approved-contact-${testInfo.project.name}.jpg`, animations: 'disabled' });
  await page.getByRole('combobox', { name: 'Color theme' }).selectOption('light');
  await page.screenshot({ path: `artifacts/approved-contact-light-${testInfo.project.name}.jpg`, animations: 'disabled' });
  await navigate(page, 'Research');
  await page.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true }).click();
  await page.getByRole('heading', { name: 'Watch the demo', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Play recorded demo', exact: true })).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/approved-demo-${testInfo.project.name}.jpg`, animations: 'disabled' });
});

test('unavailable video keeps the download and text walkthrough usable', async ({ page }) => {
  let videoRequests = 0;
  await page.route('**/previews/exoplanet-demo.webm', route => { videoRequests++; return route.fulfill({ status: 404, body: 'Unavailable' }); });
  await page.goto('/#project/exoplanet-explorer');
  await expect(page.getByRole('button', { name: 'Play recorded demo', exact: true })).toBeVisible();
  expect(videoRequests).toBe(0);
  await page.getByRole('button', { name: 'Play recorded demo', exact: true }).click();
  await expect(page.getByText('This browser could not play the recording. Download it or read the walkthrough below.', { exact: true })).toBeVisible();
  await page.getByText('Read the walkthrough', { exact: true }).click();
  await expect(page.getByText('Switch from yearly discoveries to a cumulative chart.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download demo recording (WebM)', exact: true })).toBeVisible();
});

test('tablet, laptop and landscape transitions release menu locks', async ({ page }) => {
  await page.goto('/#contact');
  for (const viewport of [{ width: 820, height: 1180 }, { width: 844, height: 390 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await navigate(page, 'Contact');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('main')).not.toHaveAttribute('inert');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.setViewportSize({ width: 1366, height: 900 });
  await expect(page.locator('main')).not.toHaveAttribute('inert');
  await expect(page.getByRole('button', { name: 'Open menu', exact: true })).not.toBeVisible();
});

test('research teasers stay compact and retain complete case studies', async ({ page }, testInfo) => {
  await page.goto('/#projects');
  const cards = page.locator('.project-compact');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    expect((await card.boundingBox()).height).toBeLessThan(360);
    await expect(card.locator('.research-brief, .project-summary, .tag-chip')).toHaveCount(0);
    await card.getByRole('button', { name: /open details/ }).click();
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('dialog').locator('.project-summary')).toBeVisible();
    await page.keyboard.press('Escape');
  }
  if (testInfo.project.name === 'desktop') {
    await page.setViewportSize({ width: 1101, height: 1004 });
    await navigate(page, 'Research');
    await page.locator('.project-featured .project-external-actions').scrollIntoViewIfNeeded();
    const tops = await page.locator('.project-featured .project-external-actions > *').evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
    expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(3);
    await page.screenshot({ path: 'artifacts/compact-research-desktop.jpg', animations: 'disabled' });
    await navigate(page, 'Contact');
    await page.getByRole('button', { name: 'Akash Sankar — home', exact: true }).click();
    const right = await page.locator('.landing-scroll').evaluate(el => {
      const link = el.getBoundingClientRect(), parent = el.parentElement.getBoundingClientRect();
      return Math.abs(link.right - parent.right);
    });
    expect(right).toBeLessThan(2);
    await page.screenshot({ path: 'artifacts/home-research-right.jpg', animations: 'disabled' });
  }
});

test('keyboard focus, modal trapping and menu closure', async ({ page }) => {
  await page.goto('/#projects');
  await page.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true }).click();
  const close = page.getByRole('button', { name: 'Close project details', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: /Next project:/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true })).toBeFocused();
  expect(await page.locator(':focus-visible').evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  const toggle = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await toggle.isVisible()) {
    await toggle.click();
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(page.locator('main')).not.toHaveAttribute('inert');
  }
});

test('page and case study meet automated accessibility checks in both themes', async ({ page }) => {
  await page.goto('/#contact');
  for (const name of ['Research', 'About', 'Experience', 'Skills', 'Contact']) await navigate(page, name);
  for (const theme of ['dark', 'light']) {
    await page.getByRole('combobox', { name: 'Color theme' }).selectOption(theme);
    const result = await new AxeBuilder({ page }).exclude('.assistant-launcher').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
  await navigate(page, 'Research');
  await page.getByRole('button', { name: 'Exoplanet Explorer — open details', exact: true }).click();
  const result = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});
