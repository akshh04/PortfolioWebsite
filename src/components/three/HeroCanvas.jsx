import React from 'react';
import { Canvas } from '@react-three/fiber';
import HeroScene from './HeroScene';
import { usePageVisible } from '../../lib/device';

/*
 * The <Canvas> import is what actually pulls in three.js (~950 kB). Home used
 * to import it statically, which put the whole Three bundle on the preloader's
 * critical path — the loading screen could not clear until it had downloaded,
 * even though the hero text and CTAs need none of it.
 *
 * Wrapping Canvas + scene here lets Home lazy-load the pair, so the page
 * appears first and the 3-D backdrop arrives when it is ready.
 *
 * Home decides *whether* to mount this at all (it skips phones, low-core
 * devices and reduced-motion visitors); this component decides how hard to
 * drive it once mounted.
 */
export default function HeroCanvas({ active }) {
  const pageVisible = usePageVisible();

  // `demand` renders only when something explicitly requests a frame, so the
  // render loop stops entirely once the hero scrolls away or the tab goes to
  // the background. Without the visibility check a backgrounded tab kept a
  // WebGL loop alive on battery.
  const running = active && pageVisible;

  return (
    <Canvas
      frameloop={running ? 'always' : 'demand'}
      camera={{ position: [0, 0, 7], fov: 55 }}
      // Capping at 1.5 already avoided rendering 3x pixels on retina displays;
      // 1.25 halves the remaining fill cost again and the scene is soft-focus
      // decoration behind text, so the difference is not visible.
      dpr={[1, 1.25]}
      gl={{
        antialias: true,
        alpha: true,
        // Tells the driver this is not a game — on dual-GPU laptops it keeps
        // the discrete card asleep rather than spinning up for a backdrop.
        powerPreference: 'low-power',
        // Nothing reads pixels back, so the browser may discard the buffer
        // after compositing instead of preserving it.
        preserveDrawingBuffer: false,
      }}
      style={{ background: 'transparent' }}
    >
      <HeroScene />
    </Canvas>
  );
}
