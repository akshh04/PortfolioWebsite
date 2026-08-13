import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

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
const MAX_DELTA = 1 / 30;

const clampDelta = (delta) => Math.min(delta, MAX_DELTA);

// Ringed Planet (Saturn-like)
function Planet({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const ringRef = useRef();

  useFrame((state, delta) => {
    const d = clampDelta(delta);
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.18 * d;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.06 * d;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef} position={position}>
        {/* Planet body */}
        <mesh>
          <icosahedronGeometry args={[1, 3]} />
          <meshPhongMaterial
            color="#6d28d9"
            emissive="#2563eb"
            emissiveIntensity={0.2}
            shininess={60}
            specular="#a78bfa"
          />
        </mesh>
        {/* Ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0.3]}>
          <torusGeometry args={[1.7, 0.15, 8, 64]} />
          <meshBasicMaterial
            color="#7c3aed"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Subtle glow */}
        <mesh>
          <icosahedronGeometry args={[1.1, 1]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

// Satellite Dish
function SatelliteDish({ position = [0, 0, 0] }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.36 * clampDelta(delta);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef} position={position}>
        {/* Mast */}
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
          <meshPhongMaterial color="#94a3b8" shininess={40} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -1.1, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshPhongMaterial color="#94a3b8" shininess={40} />
        </mesh>
        {/* Dish */}
        <mesh position={[0, 0.1, 0]} rotation={[0.5, 0, 0]}>
          <torusGeometry args={[0.5, 0.04, 8, 32, Math.PI * 2]} />
          <meshPhongMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.3} shininess={80} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[0.5, 0, 0]}>
          <ringGeometry args={[0.1, 0.5, 16]} />
          <meshPhongMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.3} shininess={80} />
        </mesh>
        {/* Feed horn */}
        <mesh position={[0, 0.5, 0.3]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.06, 0.3, 6]} />
          <meshPhongMaterial color="#94a3b8" shininess={40} />
        </mesh>
      </group>
    </Float>
  );
}

// Asteroids
function Asteroid({ position, scale = 1, rotSpeed = [0.3, 0.18, 0.12], floatSpeed = 1.4 }) {
  const meshRef = useRef();
  const rotRef = useRef(rotSpeed);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const d = clampDelta(delta);
      meshRef.current.rotation.x += rotRef.current[0] * d;
      meshRef.current.rotation.y += rotRef.current[1] * d;
      meshRef.current.rotation.z += rotRef.current[2] * d;
    }
  });

  return (
    // `speed` was `1 + Math.random()` evaluated during render, so every
    // re-render handed Float a different speed and the asteroid's bob jumped.
    // The value is now fixed per asteroid in the scene's data below.
    <Float speed={floatSpeed} floatIntensity={0.5} rotationIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[0.25, 0]} />
        <meshPhongMaterial color="#475569" emissive="#1e293b" emissiveIntensity={0.2} shininess={15} />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
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
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[-5, -3, -3]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, 8, 0]} intensity={0.6} color="#ffffff" />

      {/* Main planet — slightly off-center right */}
      <Planet position={[2.5, 0.2, -1]} />

      {/* Satellite dish — left side */}
      <SatelliteDish position={[-2.8, -0.5, 0]} />

      {/* Asteroids */}
      {asteroids.map((a, i) => (
        <Asteroid key={i} {...a} />
      ))}
    </>
  );
}
