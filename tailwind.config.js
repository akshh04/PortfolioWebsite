/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  /*
   * The theme previously extended fontFamily (heading/body), a `space-*`
   * colour scale, five named animations with their keyframes, and a custom
   * backdropBlur step — none of which appeared anywhere in src/ or
   * index.html. Typography and colour are driven by the CSS custom
   * properties in src/index.css, and the animations by framer-motion.
   */
  theme: {
    extend: {},
  },
  plugins: [],
}
