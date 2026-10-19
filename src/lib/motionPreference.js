import { useSyncExternalStore } from 'react';
const key = 'portfolio-motion-paused';
let paused = false;
try { paused = localStorage.getItem(key) === 'true'; } catch { /* Optional storage. */ }
const listeners = new Set();
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function isMotionPaused() { return paused; }
export function toggleMotion() {
  paused = !paused;
  try { localStorage.setItem(key, String(paused)); } catch { /* Session preference still works. */ }
  listeners.forEach(listener => listener());
}
export function useMotionPaused() { return useSyncExternalStore(subscribe, isMotionPaused, () => false); }
