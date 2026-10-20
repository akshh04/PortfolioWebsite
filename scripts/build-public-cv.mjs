import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { education, memberships } from '../src/data/education.js';
import { experience, conferences } from '../src/data/experience.js';
import { projects } from '../src/data/projects.js';
import { skillCategories } from '../src/data/skills.js';
import { OWNER_EMAIL } from '../src/lib/contact.js';
import { PUBLIC_CV } from '../src/lib/cv.js';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(new URL('../tmp/pdfs/', import.meta.url), { recursive: true });
await mkdir(new URL('../output/pdf/', import.meta.url), { recursive: true });
const facts = {
  name: 'Akash Sankar Vigneshwaran', email: OWNER_EMAIL,
  updated: new Date().toLocaleDateString('en-GB', { timeZone: 'Europe/Berlin', day: 'numeric', month: 'long', year: 'numeric' }),
  education: education.slice(0, 2), experience, projects, conferences, memberships, skillCategories,
};
await writeFile(new URL('../tmp/pdfs/public-cv.json', import.meta.url), JSON.stringify(facts), 'utf8');
const result = spawnSync(process.argv[2] || 'python', [fileURLToPath(new URL('./build_public_cv.py', import.meta.url))], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
await copyFile(new URL(`../output/pdf/${PUBLIC_CV.filename}`, import.meta.url), new URL(`../public/${PUBLIC_CV.filename}`, import.meta.url));
console.log(`Public CV ready: public/${PUBLIC_CV.filename}`);
