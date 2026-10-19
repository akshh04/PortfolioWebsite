# Akash Sankar — Astrophysics Portfolio

A responsive, single-page React portfolio with research projects, experience, education, skills, and contact information.

## Development

Use Node.js 22.12 or newer (validated with Node 24).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite uses port 5173 by default, or the PORT environment variable. Production output is written to dist/.

## Navigation and content

The site uses section URLs: #home, #about, #skills, #experience, #projects, #certificates, and #contact. There is no React Router dependency or separate /about route. Section navigation updates browser history and keyboard focus.

Content is in src/data/. The hero and biography are in src/pages/Home.jsx and src/pages/About.jsx. Theme tokens and responsive layout styles are in src/index.css.

Research follows the hero. Navigation has five destinations: Research, About, Experience, Skills, and Contact; the logo returns home. Credentials expand within Skills. Existing section URLs remain supported. Skills show descriptions immediately and link to supporting work. Statistics appear only in the hero, and short training programmes use a compact list.

Project previews live in public/previews/. Exoplanet Explorer is the featured project (set `featured: true` in src/data/projects.js), with a larger real screenshot and captions explaining the visible filters and discovery chart. Other projects use compact text briefs until source plots or slides are available. Each project has an aim, contribution, and outcome in src/data/projects.js.

The education timeline keeps university degrees visible; earlier school qualifications expand under “Earlier education”. Workshops and short courses expand beneath the certificate cards. Both use native details controls for keyboard access. Research, experience, and credentials share line icons, neutral surfaces, readable body text, and purple action styling.

All content renders together so section links and résumé requests work immediately. Optional WebGL and particles load separately. Reduced-motion visitors receive static decoration; phone and tablet visitors use the CSS orbital illustration.

All four projects are shown together, with category labels on their cards. Case-study Next/Previous navigation follows the complete project list. The hero highlights research internships and projects; grades remain in Education and programme counts appear in Credentials & Training.

## Public academic CV

About and Contact offer “View generated CV”, which opens the one-page PDF at `/akash-sankar-academic-cv.pdf` in a new tab without forcing a download. Visitors can download or print through their PDF viewer. Both pages label it as a generated portfolio summary, not the original CV. The PDF carries the same notice. Visitors can request the original by email or through the contact page; requesting it preserves an existing message draft. The animation pause control is hidden on phones and retained on tablet and laptop layouts.

The PDF is generated from the existing education, experience, project, conference, membership, and skill data. To refresh it after changing those facts, install Python with `reportlab` and `pypdf`, then run `npm run build:cv`. A custom Python executable can be passed as `npm run build:cv -- /path/to/python`. Review the generated one-page PDF before publishing. The normal website build uses the checked-in PDF and does not require Python.

The assistant uses six compact topic buttons. Sending a custom question clears the input immediately and shows a waiting state; failures restore the submitted question for retry. Closing the assistant still clears the chat.

## Contact form

Unsent drafts are saved in sessionStorage for the current browser tab and restored after reload. Clear draft removes them; confirmed EmailJS delivery clears them automatically. Failed delivery and mailto drafts remain recoverable. Storage being blocked or corrupt does not prevent the form from working. Collaboration topic buttons prefill the subject while preserving the message.

Set these public EmailJS settings in a local .env file:

```dotenv
VITE_EMAILJS_SERVICE_ID=your_service
VITE_EMAILJS_TEMPLATE_ID=your_owner_message_template
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID=your_courtesy_reply_template
```

Existing service/template defaults are retained for compatibility. VITE_ values are exposed in browser builds; never put private credentials here.

The owner template receives from_name, from_email, subject, message, to_email, and reply_to. Courtesy replies receive to_name, to_email, user_email, and reply_to. Owner delivery is confirmed first; courtesy replies run after a short cooldown and cannot change a successful delivery into an error. Configure EmailJS allowed origins and service limits in its dashboard.

Without a public key, the form prepares a mailto draft and clearly tells visitors they must send it using their email app. Résumé buttons prefill a request; they do not download a PDF.

## Tooling and browser support

Projects have stable shareable fragments such as #project/exoplanet-explorer. Case studies restore on reload and browser Forward; Back dismisses them. Closing a directly loaded case study returns to #projects. Cards provide separate case-study and live-app actions; case studies with a live URL also show “Open live app” beside “Copy project link”. Copy uses the current host, so production project links automatically use akashsankar.in. The screenshot viewer supports fit/zoom and keyboard controls; the dialog toolbar stays visible while its body scrolls.

Previous/Next controls browse the currently filtered project list in one shared dialog. They replace the current project history entry, so Back or Close returns to the list in one step. Direct project links remain inside the portfolio on close. Contribution facts record the documented project type, role, and deliverable without assuming team size. “Discuss this project” opens Contact with a project-specific subject and preserves any existing message draft.

The subject field is optional; both EmailJS and email-app drafts use “Portfolio enquiry” when it is blank. Name, email, and message remain required. The theme selector offers System, Light, and Dark. System follows device appearance live and remains selected after reload.

Production metadata, robots.txt, and sitemap.xml use https://akashsankar.in/. The existing Firebase Hosting configuration serves the dist directory. Build with npm run build before deploying, and include the production origin in the EmailJS allowed-origin settings.

The navigation's Pause animations control persists a local preference. It freezes the existing WebGL scene, starfield, profile ring, and CSS orbits in place and resumes them without replacing or rebuilding the scene. The scene's floating and rotating objects share rendered-time updates, so time spent paused or in a background tab does not cause a jump on resume. Operating-system reduced motion still uses static decoration and avoids loading WebGL and particles.

React 18, Vite 7, Tailwind 4 with its Vite plugin, Framer Motion, Three.js, and tsParticles.

Tailwind 4 targets Safari 16.4+, Chrome 111+, and Firefox 128+; see the [official upgrade guide](https://tailwindcss.com/docs/upgrade-guide). No older-browser compatibility claim is made.

A gRPC override selects the patched 1.x release for Firebase's transitive dependency. Firebase configuration remains local and its import is disabled in src/main.jsx.

## Verification

- npm test: contact validation, safe email-draft encoding, payload normalization, keyboard focus, header offsets, reduced-motion scrolling, and history behavior.
- npm run build: production compilation.
- npm audit: dependency advisories (zero reported after this review).
- Browser review: desktop/mobile layouts, themes, project filters/dialogs, visible skill descriptions and evidence links, form validation, and tablet menu breakpoint recovery.

## Optional AI assistant configuration

Copy `.env.example` to `.env.local` and fill in your own Firebase Web and reCAPTCHA Enterprise settings to enable custom AI replies. Without configuration, the six built-in portfolio topics and source links still work. The Firebase project must have AI Logic enabled and App Check configured before custom replies can work. Configure client API restrictions and quotas in your Firebase/Google Cloud project.

Environment files, private key files, local review artifacts, and build output are excluded from Git. The example contains empty values only. Firebase Web API keys and reCAPTCHA site keys are public client identifiers; `VITE_` configuration is included in browser builds. Never supply server API keys, service-account keys, or private credentials through `VITE_` variables. App Check debug tokens belong only in ignored local development configuration.

The GitHub default branch is `main`. Download its current source with GitHub's **Code → Download ZIP**, then run `npm ci` and `npm run dev`. Email and custom AI configuration are optional for exploring the portfolio locally.
