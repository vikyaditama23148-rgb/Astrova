'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from 'framer-motion';
import { PLANETS_3D, type P3D } from '@/components/solar3d/data';
import { getPlanetTexture } from '@/components/solar3d/textures';
import Atmosphere from '@/components/solar3d/Atmosphere';

/** Cincin Saturnus: sebuah torus datar dan tipis. */
function Rings({ size }: { size: number }) {
  return (
    <mesh rotation-x={Math.PI / 2.25} castShadow={false} receiveShadow={false}>
      <ringGeometry args={[size * 1.35, size * 2.2, 64]} />
      <meshStandardMaterial color="#e8d5a3" side={THREE.DoubleSide} transparent opacity={0.85} roughness={1} />
    </mesh>
  );
}

function Orbit({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius)); }
    return pts;
  }, [radius]);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <primitive object={new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: '#9b8f7a', transparent: true, opacity: 0.35 }))} />
  );
}

function Planet({ p, active, selected, running, onSelect }: { p: P3D; active: boolean; selected: boolean; running: boolean; onSelect: (id: string, group: THREE.Object3D | null) => void }) {
  const orbitRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const angle = useRef(Math.random() * Math.PI * 2);
  const groupRef = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const texture = useMemo(() => getPlanetTexture(p.id), [p.id]);
  const rough = p.id === 'saturnus' || p.id === 'jupiter' ? 0.55 : p.id === 'uranus' || p.id === 'neptunus' ? 0.4 : 0.85;

  useFrame((_, delta) => {
    if (running) angle.current += delta * p.speed * 0.35;
    if (orbitRef.current) orbitRef.current.rotation.y = angle.current;
    if (spinRef.current && running) spinRef.current.rotation.y += delta * p.rotSpeed;
  });

  return (
    <group ref={orbitRef}>
      <group ref={groupRef} position={[p.distance, 0, 0]} rotation-z={p.tilt ?? 0}>
        <mesh
          ref={spinRef}
          onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(p.id, groupRef.current); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
          scale={hover || selected ? 1.18 : 1}
        >
          <sphereGeometry args={[p.size, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={rough} metalness={0.04} emissive={p.color} emissiveIntensity={selected ? 0.3 : hover ? 0.15 : 0.03} />
        </mesh>
        <Atmosphere size={p.size} color={p.color} opacity={p.id === 'bumi' ? 0.22 : 0.12} />
        {p.rings && <Rings size={p.size} />}
        {(hover || selected) && (
          <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
            <span className="whitespace-nowrap rounded-full bg-[#0e1226]/90 px-3 py-1 font-display text-sm font-bold text-primary shadow-lg" style={{ transform: 'translateY(-140%)' }}>{p.name}</span>
          </Html>
        )}
      </group>
    </group>
  );
}

function Sun({ selected, onSelect }: { selected: boolean; onSelect: (id: string) => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.06; });
  return (
    <group>
      <pointLight color="#fff3b0" intensity={220} distance={60} decay={1.6} />
      <mesh ref={ref} onClick={(e) => { e.stopPropagation(); onSelect('matahari'); }} scale={selected ? 1.08 : 1}>
        <sphereGeometry args={[1.7, 64, 64]} />
        <meshBasicMaterial map={useMemo(() => getPlanetTexture('matahari'), [])} />
      </mesh>
      <mesh scale={2.5}><sphereGeometry args={[1.7, 24, 24]} /><meshBasicMaterial color="#ffb300" transparent opacity={0.18} /></mesh>
    </group>
  );
}

function Rig({ running }: { running: boolean }) {
  useFrame(({ camera }, delta) => {
    if (!running) return;
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), delta * 0.012);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Scene({ selected, running, onSelect }: { selected: string | null; running: boolean; onSelect: (id: string) => void }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 9, 21], fov: 45 }} gl={{ antialias: true, alpha: true }} onPointerMissed={() => onSelect('')}>
      <ambientLight intensity={0.35} />
      <Stars radius={90} depth={40} count={2200} factor={2.2} saturation={0} fade speed={0.4} />
      <Sun selected={selected === 'matahari'} onSelect={onSelect} />
      {PLANETS_3D.map((p) => <Orbit key={`o-${p.id}`} radius={p.distance} />)}
      {PLANETS_3D.map((p) => (
        <Planet key={p.id} p={p} active={false} selected={selected === p.id} running={running} onSelect={(id) => onSelect(id)} />
      ))}
      <Rig running={running} />
      <OrbitControls enablePan={false} minDistance={9} maxDistance={34} minPolarAngle={0.25} maxPolarAngle={Math.PI / 2 - 0.05} rotateSpeed={0.5} zoomSpeed={0.6} />
    </Canvas>
  );
}