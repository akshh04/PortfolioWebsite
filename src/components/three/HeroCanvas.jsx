import React from 'react';
import { Canvas } from '@react-three/fiber';
import HeroScene from './HeroScene';

/*
 * The <Canvas> import is what actually pulls in three.js (~950 kB). Home used
 * to import it statically, which put the whole Three bundle on the preloader's
 * critical path — the loading screen could not clear until it had downloaded,
 * even though the hero text and CTAs need none of it.
 *
 * Wrapping Canvas + scene here lets Home lazy-load the pair, so the page
 * appears first and the 3-D backdrop arrives when it is ready.
 */
export default function HeroCanvas({ active }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <HeroScene />
    </Canvas>
  );
}
