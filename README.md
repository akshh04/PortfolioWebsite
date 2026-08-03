# Akash Sankar — Astrophysics Portfolio

A cinematic, fully animated personal portfolio for Akash Sankar Vigneshwaran, Astrophysics Researcher.

## Tech Stack

- **React 18** + **Vite**
- **React Router DOM v6** — multi-page routing
- **Framer Motion** — page transitions, scroll animations, micro-interactions
- **Three.js / @react-three/fiber / @react-three/drei** — 3D hero scene
- **tsParticles** — interactive star-field backgrounds
- **Tailwind CSS** — theming with CSS custom properties
- **lucide-react** — icon set

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Resume

Place your resume PDF at `public/resume.pdf`. The "Download Résumé" button in the navbar and the Contact page will serve it directly.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero with 3D scene, particle field, role cycler |
| `/about` | Bio, education timeline, animated stat counters |
| `/skills` | Categorized skill grid with glass cards |
| `/projects` | Research project cards with modal detail view |
| `/contact` | Email CTA, social links, resume download |

## Customization

- **Colors / Tokens**: Edit `src/index.css` `:root` and `.light` variables
- **Content**: Update `src/data/projects.js`, `skills.js`, `education.js`
- **Social Links**: Update GitHub and Instagram URLs in `src/components/layout/Footer.jsx` and `src/pages/Contact.jsx`
- **Contact Form**: Currently uses `mailto:` — integrate Formspree or EmailJS for a real form

## Contact Form Note

This is a static site. For a real contact form (no mailto), integrate:
- [Formspree](https://formspree.io) — easiest, just replace the action URL
- [EmailJS](https://www.emailjs.com) — more control, runs in the browser

## Deploy

Optimized for static hosting:
- **Vercel**: `vercel deploy`
- **Netlify**: Drop the `dist/` folder after `npm run build`

## Performance

- Routes are code-split with `React.lazy`
- 3D scene and particles lazy-loaded to avoid blocking first paint
- `prefers-reduced-motion` respected throughout
