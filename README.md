# Akash Sankar — Astrophysics Portfolio

Personal portfolio of **Akash Sankar Vigneshwaran**, an M.Sc. Physics student at the University of Bremen, with interests in dark matter, galaxy dynamics, cosmology, and radio astronomy.

The website brings together research projects, instrumentation experience, education, technical skills, and ways to collaborate. Built with React and Vite, it uses a space-themed interface with responsive layouts and optional animated decoration.

[Visit the website](https://akashsankar.in/) · [Download the source](https://github.com/akshh04/PortfolioWebsite/archive/refs/heads/main.zip) · [Explore the featured project](https://exoexplorer.streamlit.app/)

## Features

- **Research and projects:** four case studies with aims, contributions, outcomes, and a featured Exoplanet Explorer dashboard.
- **Experience and education:** research internships, radio astronomy instrumentation work, university study, conferences, and memberships.
- **Skills and credentials:** tools and methods with supporting project links, plus expandable courses and workshops.
- **Project browsing:** shareable case-study URLs, browser Back/Forward support, Previous/Next navigation, and screenshot zoom.
- **Appearance:** Dark, Light, and System themes; a desktop 3D planet; a CSS orbital illustration on phones and tablets; and reduced-motion support.
- **Contact:** EmailJS delivery when configured, an email-app fallback, recoverable drafts in the current browser tab, and collaboration-topic prefilling.
- **Academic CV:** a generated one-page summary and a separate request flow for the original CV.
- **Portfolio assistant:** six built-in topics with source links, plus optional custom AI replies through Firebase AI Logic and App Check.

The navigation links to Research, About, Experience, Skills, and Contact. The logo returns to the home section. All main content renders immediately; optional graphics and the assistant load separately.

## Technology

| Area | Libraries |
| --- | --- |
| Application | React 18, Vite 7 |
| Styling | Tailwind CSS 4, custom CSS, Lucide icons |
| Animation | Framer Motion, Three.js, React Three Fiber, tsParticles |
| Optional services | EmailJS, Firebase AI Logic, Firebase App Check |
| Tests | Node.js built-in test runner |
| CV generation | Python, ReportLab, pypdf |

## Run locally

Install **Node.js 22.12 or newer** and npm, then clone the repository:

```sh
git clone https://github.com/akshh04/PortfolioWebsite.git
cd PortfolioWebsite
npm ci
npm run dev
```

Alternatively, download the ZIP linked above, extract it, and run the npm commands inside the extracted folder.

Open the local URL printed by Vite. The default development port is `5173`; Vite selects another port if it is occupied. Use `npm run dev -- --port 5175` to request a different port, or set the `PORT` environment variable.

**No API configuration is needed to explore the portfolio.** Without optional service settings, contact uses an email-app draft and the assistant's built-in topics remain available. Custom AI replies require your own Firebase configuration.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm test` | Run the automated regression tests |
| `npm run test:browser` | Build an isolated test site and run responsive browser and accessibility checks |
| `npm run test:mobile` | Run phone and tablet checks in portrait and landscape, including Chromium and WebKit |
| `npm run record:demo` | Re-record the public Exoplanet Explorer walkthrough; requires FFmpeg |
| `npm run build` | Build the production website into `dist/` |
| `npm run preview` | Serve an existing production build locally |
| `npm run build:cv` | Regenerate the public academic CV; requires Python dependencies |

To preview a production build:

```sh
npm run build
npm run preview
```

For browser checks, install the matching Chromium runtime once with `npx playwright install chromium`, then run `npm run test:browser`. The suite covers desktop, phone, narrow-phone, tablet, laptop, and landscape behavior, including social popups, contact delivery success/failure, draft preservation, focus trapping, CV requests, video playback, and accessibility in both themes. Email requests are mocked; no test message reaches an inbox. Test-only builds and credentials stay in `tmp/browser-build/`, separate from the deployable `dist/` directory. Open the latest report with `npx playwright show-report`.

For the expanded mobile and tablet review, install both engines with `npx playwright install chromium webkit`, then run `npm run test:mobile`. Screenshots are saved under `artifacts/mobile-review/`, and the report is in `playwright-report/mobile/`. This review leaves the AI controls closed and excludes the assistant from accessibility scans. Device emulation does not replace checks on physical phones or tablets; email and social destinations are intercepted during interaction tests.

The embedded demo is a real, silent application recording with English captions and a text walkthrough. To replace it, make FFmpeg available on `PATH` (or set `FFMPEG_PATH` to its executable) and run `npm run record:demo`. Review the recording and captions before publishing; the app and its dataset can change.

## Optional configuration

Copy [`.env.example`](.env.example) to `.env.local`, fill in the settings you need, and restart the development server. Environment files containing actual values are ignored by Git.

### Contact delivery

| Variable | Purpose |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service identifier |
| `VITE_EMAILJS_TEMPLATE_ID` | Template that delivers messages to the portfolio owner |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS public client key |
| `VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID` | Courtesy reply template |

Configure allowed origins and delivery limits in EmailJS. The owner template receives `from_name`, `from_email`, `subject`, `message`, `to_email`, and `reply_to`. The courtesy template receives `to_name`, `to_email`, `user_email`, and `reply_to`.

The form requires a name, email address, and message. Subject is optional. Owner delivery completes before the courtesy reply is attempted. Unsent drafts stay in `sessionStorage` for the current tab; **Clear draft** or confirmed delivery removes them. Without the public key, the visitor must send the prepared draft using their email app.

### Custom AI replies

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier |
| `VITE_FIREBASE_APP_ID` | Firebase Web app identifier |
| `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | reCAPTCHA Enterprise site key for App Check |
| `VITE_AI_MODEL` | Optional model override; must be supported by your Firebase AI Logic setup |
| `VITE_APPCHECK_DEBUG_TOKEN` | Optional registered debug token, for local development only |

Enable Firebase AI Logic and configure App Check with reCAPTCHA Enterprise in your own Firebase project. For localhost testing, register the browser's App Check debug token in Firebase Console. Configure API restrictions and service quotas for your project.

Built-in topic answers come from portfolio content. Custom questions are sent to Google with a short conversation history, and replies link to known portfolio sources. Chat history clears when the assistant closes. Avoid entering private information.

### Credentials and browser builds

**Every `VITE_` value used by the application is exposed in browser builds.** Firebase Web configuration, reCAPTCHA site keys, and EmailJS public keys are client settings; they must never be replaced with server API keys, service-account credentials, or private signing keys.

Keep App Check debug tokens in ignored local development configuration. Do not include them in production configuration. The repository excludes local environment files, private key files, build output, and working review artifacts. The checked-in example contains empty values only.

## Edit the content

| File or directory | What to change |
| --- | --- |
| `src/pages/Home.jsx` | Hero text, research interests, and primary actions |
| `src/pages/About.jsx` | Biography and profile presentation |
| `src/data/projects.js` | Projects, case-study slugs, contributions, and outcomes |
| `src/data/experience.js` | Internships and conferences |
| `src/data/education.js` | Education, memberships, credentials, and hero statistics |
| `src/data/skills.js` | Skill categories and descriptions |
| `src/data/socials.js` | Shared social profile URLs, handles, and descriptions |
| `src/lib/contact.js` | Contact destination and form helpers |
| `src/lib/assistantKnowledge.js` | Assistant context derived from portfolio facts |
| `src/lib/assistantStarters.js` | Built-in assistant topic answers |
| `src/index.css` | Theme tokens and responsive styles |
| `public/previews/` | Project preview images, recorded demo, and captions |
| `public/akash-portrait.png` | Profile portrait |

Section links use fragments such as `#projects` and `#contact`. Case studies use `#project/exoplanet-explorer`. Credentials expand inside Skills and retain the `#certificates` destination. Navigation manages browser history, header offsets, and keyboard focus without React Router.

When adapting this portfolio, update the personal content, contact destination, assistant answers, images, CV, and production URLs together.

## Refresh the academic CV

The public PDF at [`public/akash-sankar-academic-cv.pdf`](public/akash-sankar-academic-cv.pdf) is a **generated portfolio summary**, not the original CV. The website and PDF label this distinction. Requesting the original CV prefills Contact while preserving an existing message.

The normal website build uses the checked-in PDF and does not require Python. To regenerate it after editing the portfolio facts:

```sh
python -m pip install reportlab pypdf
npm run build:cv
```

For a different Python executable, run `npm run build:cv -- /path/to/python`. Review the generated PDF before publishing; the script also checks that it remains one page.

## Deploy

Run `npm run build` and publish the contents of `dist/` to a static host. The website uses fragment navigation, so case-study links do not require server routes for individual projects.

Firebase Hosting configuration is local and is not included in this repository. If using Firebase Hosting, configure your own project with `dist` as the public directory. Supply any optional client configuration at build time and register the deployed origin with EmailJS and App Check.

Metadata in `index.html`, `public/robots.txt`, and `public/sitemap.xml` currently targets `https://akashsankar.in/`. Update those files when deploying under another domain. GitHub's `main` branch contains the current downloadable source; pushing a commit does not itself deploy the website.

## Validation

Run `npm test` and `npm run build` before publishing. Regression tests cover contact validation and drafts, project history, section navigation, theme preferences, motion timing, graphics fallbacks, and assistant configuration and policies.

For visual changes, also check phone, tablet, and desktop layouts; both themes; keyboard navigation; project dialogs; and reduced-motion behavior. Automated tests do not exercise real email delivery or live AI replies.

The optional Three.js bundle currently produces Vite's size warning. It is loaded separately and skipped on phones, tablets, and devices using operating-system reduced motion.
