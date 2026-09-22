'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANETS_3D } from '@/components/solar3d/data';

function Body({ planetId, run }: { planetId: string; run: boolean }) {
  const p = PLANETS_3D.find((x) => x.id === planetId) ?? PLANETS_3D[3];
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (run && ref.current) ref.current.rotation.y += delta * 0.5; });
  return (
    <group rotation-z={p.tilt ?? 0}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.5, 40, 40]} />
        <meshStandardMaterial color={p.color} roughness={0.75} metalness={0.05} emissive={p.color} emissiveIntensity={0.18} />
      </mesh>
      {p.rings && (
        <mesh rotation-x={Math.PI / 2.25}>
          <ringGeometry args={[1.5 * 1.35, 1.5 * 2.15, 64]} />
          <meshStandardMaterial color="#e8d5a3" side={THREE.DoubleSide} transparent opacity={0.85} roughness={1} />
        </mesh>
      )}
    </group>
  );
}

export default function SpotlightScene({ planetId, run }: { planetId: string; run: boolean }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.6, 4.4], fov: 40 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 2, 4]} intensity={1.4} />
      <pointLight position={[-3, -1, -2]} intensity={0.4} color="#3dd9d6" />
      <Body planetId={planetId} run={run} />
    </Canvas>
  );
}