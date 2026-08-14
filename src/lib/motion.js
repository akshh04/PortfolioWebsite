/*
 * Motion tokens.
 *
 * The same easing curve and the same `whileInView` viewport config had been
 * copy-pasted into six components, and they had already drifted — About and
 * Skills used a -80px margin, Projects' CTA used -60px, SkillChip used -50px,
 * so cards on adjacent rows began animating at visibly different scroll
 * positions. Declaring them once keeps the page moving to a single rhythm.
 */

/** Ease-out-expo: covers most of the distance immediately, then settles. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/** Ease-out-cubic, for numbers and progress that should arrive, not glide. */
export const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1];

/** Standard durations, in seconds. */
export const DURATION = {
  fast: 0.28,
  base: 0.5,
  slow: 0.7,
};

/**
 * Standard reveal trigger. One margin for the whole site so that a heading and
 * the cards beneath it start together rather than a beat apart.
 */
export const VIEWPORT = { once: true, margin: '-70px' };

/** Fade-and-rise, the default entrance for a block of content. */
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO } },
};

/** Same shape, named for `variants` + `whileInView` usage. */
export const revealUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE_OUT_EXPO } },
};

/** Parent that releases its children one after another. */
export const stagger = (each = 0.07, delay = 0.05) => ({
  animate: { transition: { staggerChildren: each, delayChildren: delay } },
  visible: { transition: { staggerChildren: each, delayChildren: delay } },
});

/**
 * Entrance offsets are capped because a slide wider than the page gutter pushes
 * the element past the viewport edge mid-animation, where it is visibly
 * clipped. 28px stays inside the 24px gutter on every breakpoint.
 */
export const SLIDE = 28;
