import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'public/previews');
await mkdir(join(root, 'tmp/demo-recording'), { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: join(root, 'tmp/demo-recording'), size: { width: 1280, height: 800 } } });
const page = await context.newPage();
const started = Date.now();
const cues = [];
let contentStart;
try {
  await page.goto('https://exoexplorer.streamlit.app/~/+/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: /Exoplanet Explorer/, level: 1 }).waitFor({ timeout: 120_000 });
  await page.getByRole('radio', { name: 'Cumulative', exact: true }).waitFor({ timeout: 60_000 });
  await page.waitForTimeout(3000); // Deliberate pacing for a readable recording.
  contentStart = (Date.now() - started) / 1000;
  await page.screenshot({ path: join(root, 'tmp/demo-recording/start-frame.png') });
  const mark = text => cues.push({ start: (Date.now() - started) / 1000 - contentStart, text });
  mark('Explore confirmed exoplanets using NASA archive data.');
  await page.waitForTimeout(6500);
  await page.getByRole('radio', { name: 'Cumulative', exact: true }).press('Space');
  if (!await page.getByRole('radio', { name: 'Cumulative', exact: true }).isChecked()) throw new Error('The cumulative chart did not activate.');
  mark('Switch the discovery chart to cumulative discoveries.');
  await page.mouse.move(1000, 600);
  await page.mouse.wheel(0, 460);
  await page.waitForTimeout(6500);
  await page.screenshot({ path: join(root, 'tmp/demo-recording/chart-frame.png') });
  await page.getByRole('tab', { name: '🌌 Size & orbit', exact: true }).click();
  mark('Compare planetary sizes and orbits in another analysis view.');
  await page.waitForTimeout(6500);
  await page.getByRole('tab', { name: '💧 Habitable', exact: true }).click();
  mark('Explore habitability estimates. These are model estimates, not evidence of life.');
  await page.waitForTimeout(6500);
  await page.getByRole('tab', { name: '📈 Trends', exact: true }).click();
  const year = page.getByRole('slider', { name: 'Discovery year — start Discovery year', exact: true });
  await year.focus();
  for (let i = 0; i < 8; i++) await year.press('ArrowRight');
  mark('Narrow the discovery-year range. Filters update the charts and totals.');
  await page.waitForTimeout(7500);
  const duration = (Date.now() - started) / 1000 - contentStart;
  await page.screenshot({ path: join(root, 'tmp/demo-recording/last-frame.png') });
  const recording = page.video();
  await context.close();
  const input = await recording.path();
  const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
  await writeFile(join(root, 'tmp/demo-recording/metadata.json'), JSON.stringify({ recordedAt: new Date().toISOString(), source: 'https://exoexplorer.streamlit.app/', input, contentStart, duration, cues }, null, 2));
  execFileSync(ffmpeg, ['-y', '-ss', String(contentStart), '-i', input, '-t', String(duration), '-an', '-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '6', '-threads', '4', '-b:v', '900k', join(output, 'exoplanet-demo.webm')], { stdio: 'inherit' });
  const stamp = seconds => new Date(Math.max(0, seconds) * 1000).toISOString().slice(11, 23);
  await writeFile(join(output, 'exoplanet-demo.vtt'), 'WEBVTT\n\n' + cues.map((cue, i) => `${stamp(cue.start)} --> ${stamp(cues[i + 1]?.start ?? duration)}\n${cue.text}\n`).join('\n'));
  console.log('Saved real application recording and English captions.');
} finally {
  await context.close();
  await browser.close();
}
