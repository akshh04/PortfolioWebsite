import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { animationDelta } from '../../lib/animationTime';

/*
 * Every rotation below is expressed in radians per second and multiplied by the
 * frame delta. The previous code added a fixed amount per *frame*, which meant
 * the whole scene spun at double speed on a 120 Hz laptop and stuttered into
 * slow motion whenever the frame rate dipped — the animation was tied to how
 * fast the machine happened to be rather than to the clock.
 *
 * Delta is clamped because a backgrounded tab resumes with one enormous delta,
 * which would otherwise snap every object to a random new orientation.
 */
// Keep a local clock for floating too. Drei's Float uses elapsed wall time,
// which skips ahead after a demand-rendered pause even if rotation is frozen.
function SceneFloat({ children, running, speed, rotationIntensity, floatIntensity }) {
  const groupRef = useRef();
  const time = useRef(0);
  useFrame((_, delta) => {
    if (!running || !groupRef.current) return;
    time.current += animationDelta(delta);
    const phase = time.current / 4 * speed;
    groupRef.current.rotation.set(
      Math.cos(phase) / 8 * rotationIntensity,
      Math.sin(phase) / 8 * rotationIntensity,
      Math.sin(phase) / 20 * rotationIntensity
    );
    groupRef.current.position.y = Math.sin(phase) / 10 * floatIntensity;
  });
  return <group ref={groupRef} rotation={[rotationIntensity / 8, 0, 0]}>{children}</group>;
}

// Ringed Planet (Saturn-like)
function Planet({ position = [0, 0, 0], running }) {
  const planetRef = useRef();

  useFrame((state, delta) => {
    const d = animationDelta(delta, running);
    if (planetRef.current) {
      // Rotate the entire tilted assembly. Spinning a uniform circular ring
      // around its own normal is visually indistinguishable from standing still.
      planetRef.current.rotation.y += 0.18 * d;
    }
  });

  return (
    <SceneFloat running={running} speed={1.2} rotationIntensity={0.12} floatIntensity={0.5}>
      <group ref={planetRef} position={position}>
        {/* Planet body */}
        <mesh>
          <sphereGeometry args={[1.15, 48, 32]} />
          <meshPhongMaterial
            color="#63518b"
            emissive="#5b21b6"
            emissiveIntensity={0.12}
            shininess={60}
            specular="#a78bfa"
          />
        </mesh>
        {/* Ring */}
        <mesh rotation={[Math.PI / 3, 0.1, -0.35]}>
          <ringGeometry args={[1.55, 1.94, 96]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
          />
          <mesh>
            <ringGeometry args={[2, 2.06, 96]} />
            <meshBasicMaterial color="#c4b5fd" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        </mesh>
      </group>
    </SceneFloat>
  );
}

// Asteroids
function Asteroid({ position, scale = 1, rotSpeed = [0.3, 0.18, 0.12], floatSpeed = 1.4, running }) {
  const meshRef = useRef();
  const rotRef = useRef(rotSpeed);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const d = animationDelta(delta, running);
      meshRef.current.rotation.x += rotRef.current[0] * d;
      meshRef.current.rotation.y += rotRef.current[1] * d;
      meshRef.current.rotation.z += rotRef.current[2] * d;
    }
  });

  return (
    // `speed` was `1 + Math.random()` evaluated during render, so every
    // re-render handed Float a different speed and the asteroid's bob jumped.
    // The value is now fixed per asteroid in the scene's data below.
    <SceneFloat running={running} speed={floatSpeed} floatIntensity={0.5} rotationIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshPhongMaterial color="#475569" emissive="#1e293b" emissiveIntensity={0.2} shininess={15} />
      </mesh>
    </SceneFloat>
  );
}

export default function HeroScene({ running = true }) {
  // rotSpeed is radians/second (see clampDelta note above); floatSpeed is fixed
  // per asteroid so the bob stays stable across re-renders.
  const asteroids = useMemo(() => [
    { position: [-3.5, 1.5, -1],   scale: 0.6,  rotSpeed: [0.42, 0.24, 0.18], floatSpeed: 1.3 },
    { position: [3.8, -1.5, -0.5], scale: 0.4,  rotSpeed: [0.18, 0.48, 0.30], floatSpeed: 1.7 },
    { position: [-2, -2.5, 0.5],   scale: 0.5,  rotSpeed: [0.30, 0.36, 0.24], floatSpeed: 1.1 },
    { position: [4.5, 1.8, -1.5],  scale: 0.35, rotSpeed: [0.48, 0.18, 0.36], floatSpeed: 1.9 },
    { position: [-4, -0.5, -0.8],  scale: 0.45, rotSpeed: [0.24, 0.42, 0.18], floatSpeed: 1.5 },
  ], []);

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[-3, 4, 5]} intensity={2} color="#c4b5fd" />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[-5, -3, -3]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffffff" />

      {/* Main planet */}
      <Planet position={[0, 0.2, 0]} running={running} />

      {/* Asteroids */}
      {asteroids.map((a, i) => (
        <Asteroid key={i} {...a} running={running} />
      ))}
    </>
  );
}
